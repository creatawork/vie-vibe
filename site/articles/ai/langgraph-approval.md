---
title: 让 Agent 等待审批：LangGraph 中断与固定版本确认
date: 2026-10-20
tags: [Agent, LangGraph, HITL, Python]
series: Erpilot 开发实录
seriesOrder: 3
description: 从工具门到持久化中断，说明审批参数、草稿版本与业务预览如何固定，以及刷新后怎样找回原审批。
---

> Erpilot 系列第 3 篇 · 2026-10-20 发布 · 实现与验收截至 2026-10-19
>
> 上一篇：[给 ERP 写一个 MCP Server](/articles/ai/mcp-server-tool-contracts)。本篇讨论 Erpilot 宿主的审批与恢复，业务提交结果不明时的对账留到下一篇。

本文引用的源码与报告保存在[随文资料清单](/erpilot/2026-10-19/manifest.json)中，包含当时尚未推送到项目仓库的工作区内容，文件版本由 SHA-256 校验值标识。代码文本与复现脚本为局部摘录，运行仍需 Erpilot 工作区依赖。

“给客户建一张订单”比“查询客户订单”多了一条执行条件：用户需要确认这次操作。模型可以准备参数、解释影响，实际写入必须等到程序拿到有效决定。

在界面上增加批准按钮，只完成了交互的一部分。按钮确认的是哪份参数？页面刷新后，审批还在吗？等待期间商品价格变了，原决定能否继续执行？这些问题决定了审批数据需要存在哪里，以及确认和执行之间还要做哪些检查。

Erpilot 将它分成两个层次：通用运行时保存工具调用与审批决定；ERP 业务层保存用户实际看到的草稿或操作预览。两者通过固定引用连接。

## 一、把人的等待从工具执行里分出来

项目最初在工具 handler 外包了一层 `guarded()`：先调用审批门，放行后执行原 handler。写工具没有审批门就不能装配，这让执行条件落在代码里。

同步回调适合自动拒绝或脚本策略。真人交互则需要额外处理：如果等待决定的代码也包在工具超时里，用户尚未决定，调用就可能超时；随后重试又可能生成一次审批。

[ADR-0006](/erpilot/2026-10-19/docs/adr/0006-suspending-approval-events.md.txt)记录了手写循环阶段的改造。工具层发出 `ApprovalSuspended` 控制流信号，循环将其转译为待审批事件，等待发生在真正工具执行的超时保护之外。批准后执行续段，拒绝则返回未执行结果。

这使界面和 trace 能看到等待过程，但当时的 Future 和续段闭包仍在进程内。进程退出后，这些对象不能作为恢复依据。

因此，当前运行时进一步把等待改成 LangGraph 的持久化中断。它承接的是同一个业务约束：在有效批准到达前，不进入写 handler。

## 二、先保存调用，再进入中断

当前图按职责拆出 `model`、`prepare`、`reads`、`write`、`collect` 等节点。模型发出调用后，`prepare_tool_calls()` 先校验参数；对于写调用，再准备稳定的调用身份与审批元数据。

| 字段 | 用途 |
|---|---|
| `call_id` | 将工具请求、结果和界面时间线配对 |
| `pending_id` | 标识这次待处理审批，恢复决定必须与它匹配 |
| `client_token` | 将这次写请求与业务幂等记录关联 |
| `arguments` | 校验和规范化后的工具参数 |
| `tool_schema_version`、`arguments_fingerprint` | 核对恢复时的参数契约是否仍兼容 |
| `approval_created_at`、`approval_expires_at` | 保存原始审批期限，重载时不重新起算 |

这些值进入 graph state，再由后续写节点触发 `interrupt()`。checkpoint 中保存的是 JSON 可表示的数据；工具函数、数据库连接和回调由应用重建，不放进状态里。

写节点传给中断的载荷由以下函数构造。它完整摘自 `graph_approval.py`，包含所需导入：

```python
from copy import deepcopy

def make_approval_payload(call):
    return {
        "call_id": call["call_id"],
        "pending_id": call["pending_id"],
        "tool": call["name"],
        "risk": call["risk"],
        "arguments": deepcopy(call["arguments"]),
        "expires_at": call.get("approval_expires_at"),
    }
```

恢复时，`ResumeDecision` 校验决定，运行时检查 `pending_id`；写节点也会再次核对对应关系和期限。过期批准落为 `expired`，不调用写 handler。

LangGraph 的一个相关语义是：恢复中断会重新进入所在节点，中断之前的代码可能再次运行。这也是此实现把 token 和参数放在准备节点、写节点消费已保存值的理由。框架语义可对照[官方中断文档](https://docs.langchain.com/oss/python/langgraph/interrupts)，本项目的节点安排见[图实现](/erpilot/2026-10-19/packages/agent_core/src/agent_core/graph.py.txt)。

## 三、刷新页面后，从执行状态找回审批

恢复需要能找到原 checkpoint。Erpilot 将 session 映射到稳定的 checkpoint thread；API 使用 PostgreSQL 的 `AsyncPostgresSaver`。缺少数据库配置或连接失败时，API 拒绝启动，不自动改成内存存储。

这里有几个存储角色需要分清：

| 存储 | 保存内容 | 恢复时的作用 |
|---|---|---|
| PostgreSQL graph checkpoint | 图节点、调用参数、待审批中断与执行结果 | 决定图从哪里继续 |
| ERP SQLite | 草稿、操作预览、订单、库存和业务提交记录 | 核对批准对象与业务事实 |
| API RunStore SQLite | 历史会话和展示事件 | 恢复阅读与时间线 |

前端通过 `GET /api/sessions/{session_id}/state` 读取状态，再经 `POST /api/chat/approve/stream` 提交审批决定。一般节点中断的显式继续则使用 session 的 `resume/stream` 路由；它与批准某个 pending 是不同入口。

原活动流上的审批接口仍保留。页面断连后，新的订阅与恢复请求需要重新核对服务端状态，不能因为本地按钮曾被点击过，就把卡片认定为批准成功。

CLI、离线评测和演示使用显式装配的 `InMemorySaver`。它们验证的范围不能直接外推成 PostgreSQL 重启恢复；各条验收需要注明实际 saver 和运行环境。这个选择及存储分工记录在 [ADR-0009](/erpilot/2026-10-19/docs/adr/0009-langgraph-runtime.md.txt)。

## 四、批准参数之前，先固定业务对象

通用审批层保存工具参数，但原始 JSON 仍不一定方便人核对。用户需要看到客户、商品、报价以及库存影响，而且这些内容必须与提交依据一致。

订单流程因此先保存草稿。保存草稿不扣库存；每次修改生成新 `revision`，旧版本保留。用户提交时，调用绑定 `draft_id` 与指定版本，页面显示这份报价的内容。

这个版本引用解决了确认对象的歧义：审批期间即使有新草稿版本出现，执行也不能静默把旧批准替换成最新内容。当前版本不匹配时，业务层返回 `draft_changed`，需要重新读取并确认。

即使版本仍一致，也要在写事务里重新核对条件。提交逻辑检查草稿有效期、商品状态与名称、基础价、折扣结果以及库存快照。相关条件变化时返回 `quote_changed` 或 `stock_changed`；它不会悄悄按新价或新库存完成原批准。

这里对库存的要求比“仍然够卖”更严格：代码核对当前库存是否与报价时记录的 `stock_before` 一致。这样的确认方式保守，但与页面展示的快照相对应。草稿中的库存是报价时观察值，不是已预留库存。

取消订单和库存调整使用另一种固定对象：先保存不可变 `operation_id`，再审批这个引用。预览包括订单原状态与金额，或库存调整前后数量；事务内重新核对受影响事实。取消不执行退款，预览与结果需要如实表达这一能力范围。

对应实现分别在[订单草稿](/erpilot/2026-10-19/packages/erp_store/src/erp_store/drafts.py.txt)与[业务操作](/erpilot/2026-10-19/packages/erp_store/src/erp_store/operations.py.txt)。模型不负责传入可信 session 身份；宿主装配工具时绑定会话。

## 五、事件要说明处于哪个阶段

一次工具调用从请求到结果，会经过不同状态。前后端使用的事件语义是：

```text
tool_started：已收到工具调用请求
    ↓
approval_pending：等待决定
    ↓
approval_resolved：决定已回填
    ↓ 批准且执行检查通过
tool_executing：即将进入 handler
    ↓
tool_finished：已取得结果，还需解释业务成功、失败或拒绝
```

批准只说明允许尝试指定操作，业务复核仍可能失败；拒绝则返回未执行结果。界面需要区分这些阶段，不能把 `approval_resolved` 或已收到 HTTP 响应渲染成“订单已创建”。

当前协议由后端 `events.py` 编码，TypeScript 的 `protocol.ts` 镜像其类型；待审批事件可带 `expires_at`，结果还可以带业务展示数据。它沿用了首篇的事件消费方式，同时随审批与恢复增加了字段和事件，不能把迁移描述成所有协议都没有变化。

## 六、这条链路证明到哪里

相关测试覆盖了中断载荷、稳定 token、错误 pending、期限重载、拒绝与过期不执行，以及草稿变化后拒绝沿用批准。业务接口测试还核对版本、会话归属和执行后的数据库状态。

这些检查回答不同问题：中断测试检查执行状态能否恢复，业务测试检查确认对象是否一致，界面验证检查人能否看到和提交正确决定。单独展示一张审批卡片，不能替代其余证据。

本项目范围仍为本机可信单用户、单 API 进程。会话绑定不是生产身份认证；进程内互斥也不是多 worker 执行租约。`batch_confirm` 是风险标签，当前文章不据此宣称已有合并多项操作的批量审批能力。直接调用开放写工具的原始 MCP Server，也不自动经过宿主审批。

还有一个独立问题：用户已经批准，业务库可能已经提交，但 graph 尚未保存结果。此时重新执行会不会重复扣库存？下一篇[幂等与崩溃对账](/articles/ai/idempotency-and-recovery)继续处理这个提交窗口。
