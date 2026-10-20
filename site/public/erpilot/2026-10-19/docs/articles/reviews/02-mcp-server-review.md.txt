# 第 2 篇文章核对记录

日期：2026-10-19。对象：[02-mcp-server.md](../02-mcp-server.md)。
结果：完成仓库草稿、离线复现和事实核对；尚未导入 Vie，未发布。

## 写作基线

- 本地 HEAD：`0111150f081b687331a6b88d2f80c42b0e80e874`。本次开始时已有其他开发改动，本批仅新增文章、目录、核对记录与复现脚本。
- 公开 GitHub `main`：浏览器核对为 `e2236d2c6cb946c7533bfe73f3370d915d9200de`；本地跟踪状态 ahead 3。文章讨论的查询契约在公开源码可见；摘录的辅助函数体同时与本地工作区和 `origin/main` 逐字核对。
- 现有首篇经浏览器查看，确认站点系列名称、日期、`part 1 of 1` 和下一篇预告。网页抓取工具及终端直连未取得内容，最终以实际浏览器页面为准。
- 历史模型改道与返回类型缺陷引用原始仓库记录；本次没有重跑历史真实模型任务，不新增真实模型成功率或成本结论。

## 代码与输出

- [x] 第一个 Python 代码块与 `examples/articles/02_mcp_server.py` 全文件逐字一致。
- [x] 第二个 Python 代码块中的 `_err` 和 `_not_found` 函数体，与 `server.py` 的 AST 源码区间逐字一致；补入的 `Any` 导入来自同一源文件。
- [x] 示例 JSON 与复现脚本 stdout 分别解析后相等，错误码、订单号、中文消息与 hint 均一致。
- [x] 脚本使用临时数据库，默认关闭业务写工具；未配置模型、嵌入器或 PostgreSQL，也没有调用相关网络接口。
- [x] 复核独立进程入口的 `--db` 参数、默认 stdio 与默认写工具关闭行为；文章不宣称已完成独立进程验收。

实际复现命令（PowerShell，使用工作区现有虚拟环境）：

```powershell
$env:PYTHONIOENCODING = 'utf-8'
.\.venv\Scripts\python.exe examples/articles/02_mcp_server.py
.\.venv\Scripts\python.exe -m ruff check examples/articles/02_mcp_server.py
```

复现成功，静态检查输出 `All checks passed!`。文中给出的 `uv run python ...` 是项目标准入口；
本机当前 shell 找不到 `uv`，所以本次使用已经安装依赖的虚拟环境执行等价脚本路径。

## 相关测试

实际命令：

```powershell
.\.venv\Scripts\python.exe -m pytest packages/mcp_erp/tests/test_mcp_erp.py -k 'get_order_error_contract_v1 or list_orders or get_customer_purchases or aggregate_lists_have_valid_mcp_output or bridge_builds_agent_tools or bridge_handler_calls_through_mcp or bridge_handles_array_params_and_error_contract or bridge_writes_without_gate_raises or tool_cards_doc_matches_server_tools or agent_loop_queries_real_data_over_mcp'
```

输出：`15 passed, 23 deselected in 3.14s`。覆盖错误契约、摘要与明细、分页收紧、
客户聚合及截断、MCP 输出对象、桥接调用、数组参数、缺审批门装配失败、工具卡同步和
mock 模型经实际 MCP 查询临时 SQLite 的链路。未运行全仓测试；这次只新增文稿与独立复现脚本。

## 断言与证据对应

| 文中断言 | 核对位置 |
|---|---|
| 工具描述、参数说明、快照价与现价的区别 | `server.py` 的 `get_order` / `list_orders` / `compute_quote`；`erp_store/pricing.py` |
| 缺失或下架商品在比价结果中单列 | `server.py` 的 `compare_quotes`；非法计价仍会返回整次业务错误，正文未将其写成部分成功 |
| `error` 是业务正文对象，不等同于 MCP `isError` | `server.py` 的 `_err` 和 MCP Tools 规范的 Error Handling |
| 列表摘要、total、returned、聚合条目截断 | `server.py`；`test_mcp_erp.py` 中相关通过测试 |
| schema 桥接只覆盖部分约束 | `bridge.py` 的 `_params_model` / `_annotation_of`，没有递归恢复全部约束 |
| 每次工具调用创建 server 与客户端会话 | `bridge.py` 的 `_convert.handler` |
| 宿主写工具装配必须提供审批门 | `bridge.py` 的 `build_agent_tools_async` / `_with_risk_and_gate` |
| 原始 MCP Server 不自动执行宿主审批 | `server.py` 的 `include_writes` 注册路径；审批包装在桥接层 |
| 当前运行时使用持久化中断 | `agent_core/graph_runtime.py` 与 ADR-0009 |
| 历史字符串错误已能改道；不能证明 hint 的提升 | `docs/error-recovery-log.md` 的 2026-09-30 记录 |
| list / dict 失配曾导致 MCP 结构化处理失败 | `docs/write-reliability.md` 与 `docs/error-recovery-log.md` 的写路径观察 |

## 链接与口吻

- [x] 正文 7 个外链均已访问：首篇与 4 个 GitHub 文件通过浏览器验证；MCP Tools 与 FastMCP 进程内传输通过官方文档工具读取。
- [x] 系列目录中的本地证据链接已检查存在，包含本核对记录。
- [x] Markdown 代码围栏成对；文稿未出现“后来 / 上周 / 好几次 / 被质疑过 / 救了我”等需特别追溯的措辞。
- [x] 未新增成本、延迟、token 节约比例、成功率或工期数字；业务参数及协议字段已对照源码。
- [x] 没有把风险标签写成已产品化的批量审批，也没有把 MCP schema 桥接写成完整约束转换。

## 发布时仍需完成

- [ ] 确认最终正文和发布日期，将草稿标记调整为发布状态。
- [ ] 将新增复现脚本与对应源代码版本同步到公开仓库；如固定源码版本，重查链接。
- [ ] 在 Vie 仓库导入 Markdown 和系列元数据，更新文章列表与前后篇导航。
- [ ] 运行站点构建并在实际阅读页检查代码块、目录、链接与排版。

本批的交付范围为开始补写技术文章；以上站点步骤未执行，不能把本次交付描述为已上线。
