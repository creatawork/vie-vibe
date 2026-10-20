---
title: 给 ERP 写一个 MCP Server：工具契约、错误恢复与返回值设计
date: 2026-10-20
tags: [Agent, MCP, Python]
series: Erpilot 开发实录
seriesOrder: 2
description: 把 ERP 查询接入 FastMCP，解释工具描述、业务错误、摘要与聚合返回，以及桥接中的校验和审批边界。
---

> Erpilot 系列第 2 篇 · 2026-10-20 发布 · 实现与验收截至 2026-10-19
>
> 上一篇：[手写 Agent Loop：从一次 API 调用到多步任务](/articles/ai/handwritten-agent-loop)。
> 本篇讨论 `mcp_erp` 的基础查询链路；审批、持久化与恢复分别展开，不按早期计划中的“周数”描述实际工期。

本文引用的源码与报告保存在[随文资料清单](/erpilot/2026-10-19/manifest.json)中，包含当时尚未推送到项目仓库的工作区内容，文件版本由 SHA-256 校验值标识。代码文本与复现脚本为局部摘录，运行仍需 Erpilot 工作区依赖。

[下载完整复现脚本](/erpilot/2026-10-19/examples/articles/02_mcp_server.py.txt)，放入已安装依赖的 Erpilot 工作区后运行；下文给出完整代码。

上一篇把 Agent 的工具循环跑通了：模型发出调用，程序执行，把结果放回消息列表，再让模型继续生成。接下来需要解决的是业务接入——模型查到的订单、库存和报价，要来自数据库。

Erpilot 的做法是把商品、库存、订单和报价能力放进 FastMCP Server，再用一个桥接层接回 Agent。调用链并不长，但有几个决定会直接影响模型能否完成任务：工具怎么拆、参数描述写什么、查不到时返回什么，以及一次查询给模型多少内容。

这篇沿着一次订单查询，把这些约定拆开。

## 一、先划清模型、工具和数据库的职责

用户说“查一下订单”，模型需要选择工具、填写参数，并解释结果。订单有哪些合法状态、金额按什么口径计算、某个 SKU 是否存在，则由业务代码处理。

当前查询链路如下，箭头表示调用方向：

```text
模型发出工具调用
    │
    ▼
agent_core 的 Tool 接口
    │ handler
    ▼
mcp_erp.bridge
    │ FastMCP Client，进程内传输
    ▼
mcp_erp.server
    │ ErpRepository
    ▼
SQLite 业务库
```

这里的 `agent_core` 只认识 `Tool`，不导入 ERP 的 repository 或领域模型。`mcp_erp` 把业务能力适配进来，CLI 和 API 负责装配。这样，运行时处理工具调用时，不需要知道“订单”和“库存”的含义。

MCP 负责工具的发现与调用。客户端通过 `tools/list` 获取名称、描述和 `inputSchema`，通过 `tools/call` 提交工具名与参数。这些字段与消息来自 [MCP Tools 规范](https://modelcontextprotocol.io/specification/2025-06-18/server/tools)，本文使用其中与现有代码相关的部分，不展开协议版本差异。

项目选择 MCP，是为了让同一套业务工具既能由 Erpilot 宿主消费，也能通过独立进程交给其他 MCP 客户端。业务查询代码保留在工具后面，客户端接入方式可以变化。

## 二、先让查询实际经过 MCP

`create_server()` 构造 FastMCP 实例，工具在工厂函数内部用 `@mcp.tool` 注册，因此能访问同一工厂装配的 repository。函数 docstring 提供工具描述，带 `Field(description=...)` 的参数参与生成输入 schema。

例如，`get_order` 的 `order_id` 描述明确给出订单号格式；函数描述说明返回状态、客户、明细与金额，并注明金额使用下单快照价。完整定义在 [`server.py`](/erpilot/2026-10-19/packages/mcp_erp/src/mcp_erp/server.py.txt)。

不需要先接模型，就能验证这层接口。下面是仓库 `examples/articles/02_mcp_server.py` 的完整代码：

```python
"""Reproduce the article's MCP error response without a model or existing database."""

import asyncio
import json
from pathlib import Path
from tempfile import TemporaryDirectory

from erp_store.seed import seed_database
from fastmcp import Client
from mcp_erp.server import create_server

async def main() -> None:
    with TemporaryDirectory(prefix="erpilot-mcp-article-") as folder:
        db = Path(folder) / "erp.db"
        seed_database(db)
        async with Client(create_server(db)) as client:
            result = await client.call_tool("get_order", {"order_id": "123"})
        print(json.dumps(result.data, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    asyncio.run(main())
```

在已安装工作区依赖的仓库根目录运行：

```bash
uv run python examples/articles/02_mcp_server.py
```

它使用临时 SQLite 库，不读取现有业务库，也不调用模型或嵌入接口。这里把 server 实例直接交给 `Client`，使用的是 FastMCP 的[进程内传输](https://gofastmcp.com/clients/transports#in-memory-transport)；工具发现、参数处理与调用仍经过 MCP 客户端接口。

本次实际运行输出如下。种子库里不存在纯数字订单号，因此返回业务错误：

```json
{
  "error": {
    "code": "not_found",
    "message": "订单不存在：123",
    "hint": "订单号为 SO+日期+序号 格式；可用 list_orders 浏览现有订单，或请用户提供完整单号"
  }
}
```

需要独立进程时，现有入口是 `uv run --package mcp-erp python -m mcp_erp serve --db <数据库路径>`，使用 stdio，默认不注册业务写工具。上面的复现针对进程内查询路径，没有把它算作独立进程或真实模型验收。

## 三、工具描述要包含业务口径

工具名告诉模型“有什么能力”，描述还需要告诉它“什么时候选这个能力”。只写“查询订单”不足以区分查看单据、浏览列表和客户统计。

Erpilot 对这些任务分别提供入口：

| 用户任务 | 工具 | 描述中需要明确的约定 |
|---|---|---|
| 查看一笔订单 | `get_order` | 完整单号；金额按下单快照价 |
| 浏览或筛选订单 | `list_orders` | 客户名精确匹配；默认不含明细 |
| 查客户买过什么、花了多少 | `get_customer_purchases` | 按商品和状态聚合；总花费有有效订单口径 |
| 按购买数量询价 | `compute_quote` | 现价与数量梯度折扣；附当前库存 |
| 多商品按同一数量比价 | `compare_quotes` | 服务端批量报价并排序；缺失或下架 SKU 单列 |

“订单金额”和“当前报价”尤其容易混淆。订单查询返回成交时保存的快照价，报价工具读取当前商品价格并应用数量折扣。商品调价后，这两个结果可以不同，模型需要保留各自的语义。

计价则由共享业务函数处理：同 SKU 的数量合并后确定折扣，折后单价按十进制规则舍入，再计算金额。模型负责询问数量、选择商品和解释报价；写入订单时仍由程序复核。报价本身不锁价，也不预留库存。

工具描述因此也是接口契约的一部分。它写明匹配方式、统计状态和价格来源，模型才有依据选择调用和转述结果。描述是否足够清楚，仍需要用具体任务评测，不能只凭读起来顺畅来判断。

## 四、错误返回里保留下一步线索

查询不存在的订单时，返回 `None` 不能说明是未找到、参数错误，还是系统不可用。当前 MCP 工具使用业务错误对象，辅助函数如下；代码摘自 `server.py`，补入了所需的原文件导入，没有删改函数体：

```python
from typing import Any

def _err(code: str, message: str, hint: str = "") -> dict[str, Any]:
    """错误契约 v1：code 供分类，message 说明发生了什么，hint 指下一步。"""
    err: dict[str, Any] = {"code": code, "message": message}
    if hint:
        err["hint"] = hint
    return {"error": err}

def _not_found(what: str, key: str, hint: str) -> dict[str, Any]:
    return _err("not_found", f"{what}不存在：{key}", hint)
```

`code` 给出分类，`message` 保留实际出错对象，`hint` 提供可执行的后续选择。前面的订单错误既说明单号格式，也给出 `list_orders` 和向用户澄清的路径；模型不需要仅凭“未找到”猜下一步。

这与循环层捕获超时、异常和参数校验失败是不同层次的约定。循环层处理的是工具如何执行，业务错误处理的是这次查询或操作在 ERP 里意味着什么。

还需要区分项目约定和协议字段：这里的 `error.code`、`error.message`、`error.hint` 是 Erpilot 放在工具返回正文中的对象，**不是 MCP 标准错误格式**。它也不等同于 MCP 的 `isError`。客户端不能只看传输完成或 `isError` 未置位，就认定业务成功；宿主需要理解这层返回约定。

早期真实模型记录中，`get_order("123")` 返回不存在后，模型改用订单列表，并引导用户提供完整单号。不过那次使用的还是字符串错误，不能据此证明增加 `hint` 改善了自愈率。对应观察保存在[错误自愈记录](/erpilot/2026-10-19/docs/error-recovery-log.md.txt)，本篇不把一次改道写成稳定成功率。

## 五、返回多少内容，也是工具设计

一条订单列表可以返回完整明细，也可以只返回订单头。对浏览任务，模型先要识别目标订单；把每笔商品明细一起送进去，会增加下一轮请求需要携带的内容。

当前 `list_orders` 默认返回订单头摘要，包括单号、客户、状态、时间、明细行数和总金额。顶层的 `total` 表示匹配总量，`items` 是本页结果，`note` 提醒模型：单笔明细用 `get_order`，客户统计用 `get_customer_purchases`。

需要明细时可以显式传 `detail=True`，服务端会进一步收紧页大小。客户购买汇总则直接返回按商品和状态聚合的结果；商品条目过多时只保留金额最高的一部分，并通过 `note` 说明截断。汇总值与截断后的展示列表需要分别理解，不能让模型以为当前可见商品就是全部购买记录。

这些工具服务于不同的信息需求：

```text
浏览订单 → 摘要列表 → 定位目标 → 单笔明细
客户统计 → 服务端聚合 → 解释统计口径与结果
```

聚合工具可以让统计和筛选留在程序里，避免模型为了回答总量问题反复翻页、再自行拼接计算。这个设计减少了需要返回的明细，但本篇没有做同条件的 token 或延迟对照，因此不写节省比例。

返回类型同样需要经过真实 MCP 调用验证。项目曾出现这样的缺陷：聚合工具声明返回 `dict`，实际返回 `list`，导致 FastMCP 的结构化结果处理失败。现有实现把相关结果统一为含 `items` 和 `returned` 的对象；`returned` 表示本次返回条数，与分页工具的全量 `total` 含义不同。

这个问题及修复保存在[写入可靠性复盘](/erpilot/2026-10-19/docs/write-reliability.md.txt)。它说明只检查“模型调用了正确的工具名”还不够，测试需要确认工具实际成功返回了可用数据。

## 六、桥接层转换了什么，又丢掉了什么

Agent 的本地 `Tool` 接口需要参数模型和异步 handler。MCP 客户端发现的工具则带输入 schema。桥接层在两者之间完成适配，实现在 [`bridge.py`](/erpilot/2026-10-19/packages/mcp_erp/src/mcp_erp/bridge.py.txt)。

发现阶段先调用 `client.list_tools()`，再用 Pydantic `create_model()` 构造参数模型。`required` 中的参数必填，有默认值的参数保留默认值，其他可选参数允许省略。执行阶段，handler 将模型校验后的参数序列化，调用 `client.call_tool()`，再提取返回数据供运行时回填。

这里有一个需要如实说明的限制：当前桥接层**没有完整实现 JSON Schema 到 Pydantic 的转换**。

它主要映射字符串、整数、数字、布尔值、数组等基础类型，并处理部分 `anyOf` 可空形式。数组映射为通用 `list`，并未递归保留所有元素约束；数值范围、枚举、嵌套引用等限制，也没有完整地从 MCP schema 搬到 Agent 参数模型里。

因此，不能把“桥接层用了 Pydantic”写成“所有原始 schema 约束都在本地提前校验”。FastMCP 工具端的参数处理，以及工具函数和领域代码中的业务校验，仍然承担校验职责。返回的错误也必须经过实际桥接路径验证，确认没有在转换中丢失。

本项目的进程内桥接还采用了一个简单的生命周期策略：发现工具时打开一次客户端会话，每次工具调用再创建 server 和客户端会话。这样没有长期持有的 MCP 客户端连接需要管理，但也不代表具备远程连接池或断线重连能力。如果切换到独立进程或 HTTP 传输，会话开销与生命周期需要重新评估。

## 七、把“能调用”与“允许执行”接起来

基础查询接通后，建单、取消和库存调整都能沿相似的 MCP 路径进入业务层。但它们需要审批，工具描述中的“需人工确认”只能向模型说明约定，执行前仍要有代码拦截。

在 Erpilot 宿主里，业务写工具默认不开放；`build_agent_tools_async(writes=True)` 必须同时提供 `approval_gate`，否则装配失败。桥接层给写工具标注风险并包上审批门；当前 LangGraph 运行时再接入可持久化的审批中断。

这个约束的范围是 Erpilot 的 Agent 装配路径。直接构造 `create_server(include_writes=True)` 并调用原始 MCP 写工具，不会自动经过宿主审批门，调用方需要负责授权与审批。`batch_confirm` 也只是风险标签，不能据此宣称已有合并多项操作的批量审批产品能力。

查询接口在这一篇完成接入。下一篇继续沿写工具往下走：[让 Agent 等待审批：LangGraph 中断与固定版本确认](/articles/ai/langgraph-approval)，讨论如何保存待审批参数、恢复人工决定，以及批准时如何确认操作对象仍与用户看到的一致。
