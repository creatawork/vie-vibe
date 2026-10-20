# 第 3–7 篇统一核对记录

日期：2026-10-19。五篇正文已完成，待导入 Vie 发布；本记录不代表已发布。

## 交付

| 文稿 | 核心内容 | 主要依据 |
|---|---|---|
| [03：持久化审批](../03-langgraph-approval.md) | 等待与执行分离、准备节点、固定参数、版本与预览、状态恢复和事件语义 | `graph.py`、`graph_tools.py`、`graph_approval.py`、ERP drafts / operations、API events / web protocol、ADR-0006 / 0009 |
| [04：幂等与崩溃对账](../04-idempotency-and-recovery.md) | 原 token 重放、异参冲突、同事务结果记账、写锁、found / absent / unknown、故障窗口 | mutations、graph、MCP reconciler、历史进程测试 XML、ADR-0007 / 0010 |
| [05：评测](../05-agent-evaluation.md) | 成功执行、业务状态、请求尝试、评分器修正、可比性、质量门槛与未知费用 | checks / runner / model / gate / compare、原始评测 JSON、历史注入复判记录 |
| [06：政策 RAG](../06-rag-evidence-and-answers.md) | 固定检索集、dev / test、分数空间、原文绑定、结构化选证与保留失败 | 检索原始 JSON、冻结数据集、policy_answer、图响应契约、结构化最终报告 |
| [07：上下文](../07-context-and-multi-turn-state.md) | 状态与视图区别、角色与工具配对、快照答题、真实连续任务、SKU guard 与预算停止 | 两层 context_view、快照及连续任务原始 JSON、对应验收 |

新增 [04_idempotency.py](../../../examples/articles/04_idempotency.py)，使用临时数据库复现同 token 重放、查询与异参冲突。
第 02 篇补入下一篇链接；系列目录补齐文稿链接、状态、摘要、标签与建议 slug；根 README 的文章入口已更新。
原有开发代码、业务库与历史评测结论未在本批修改。

## 机器核对

[03-07-evidence.json](03-07-evidence.json)记录读取的原始输入哈希、逐项重算值和文稿哈希：

- 从历史 JUnit 核对进程测试 19 项、0 失败、0 错误、0 跳过；没有重新运行 PostgreSQL 故障矩阵。
- 从原始评测 JSON 核对完整基线 32/35、定点 2/3 和 1/1；没有跨报告拼接成绩。
- 从原始检索 JSON 核对四种方法的 test 指标，从冻结数据核对问题数量、正负例和 dev / test 划分。
- 从结构化最终 JSON 核对两模型各执行 13 例、通过 11 例。
- 从快照 JSON 累计每策略输入 token 与通过数，独立重算输入降幅；从连续任务 JSON 核对各策略完成场景、执行轮、计划轮与通过轮。
- 第 03 篇 `make_approval_payload` 摘录与源文件函数体逐字一致，包含独立所需导入并能编译执行。
- 第 04 篇 JSON 与本次脚本实际 stdout 解析后相同；脚本 Ruff 通过。

注入 v2.6 复判数值来自已保存的历史复判说明；原始 v2.5 分数另经 JSON 核对。
历史说明引用的原 trace 文件在当前工作区不存在，本次没有重放这些旧 trace，也没有宣称重新获得模型观察。

## 本次实际测试

使用工作区已有 `.venv/Scripts/python.exe`；当前 shell 未提供 `uv`。文章中的 `uv run` 为项目标准入口，
本次执行等价虚拟环境命令，不安装依赖、不新增真实模型或嵌入请求。

```powershell
.\.venv\Scripts\python.exe -m pytest packages/agent_core/tests/test_graph_approval.py packages/agent_core/tests/test_graph_runtime.py packages/erp_store/tests/test_mutations.py packages/erp_store/tests/test_drafts.py packages/erp_store/tests/test_operations.py
```

结果：`83 passed in 7.08s`。

```powershell
.\.venv\Scripts\python.exe -m pytest packages/evals/tests/test_checks.py packages/evals/tests/test_gate.py packages/evals/tests/test_compare.py packages/evals/tests/test_campaign.py packages/evals/tests/test_structured_grounding.py packages/mcp_erp/tests/test_policy_answer.py packages/rag/tests/test_benchmark.py packages/agent_core/tests/test_context_view.py packages/evals/tests/test_context_experiment.py packages/evals/tests/test_context_workflow.py
```

结果：`195 passed in 41.36s`。两组共 278 项离线测试通过，没有重跑全仓或真实模型验收。

第 05 篇的离线 gate 命令也已用等价入口执行，实际退出码为 `1`，符合预期：
旧报告完整性、轮次、成功率、请求证据与计量检查失败；没有修改原输入。

## 内容核对

- 代码、事件名、API 路由、版本与 token 字段均按当前源码核对；审批事件同时查看 Python 与 TypeScript。
- 数字分别标明是历史原始报告、当前离线输出、检索结果、模型生成或工程测试，没有混合分母。
- 五篇文稿的本地链接、代码围栏、行尾空白和写作规则关键词扫描通过；官方 LangGraph 中断和 SQLite 事务链接已经读取。
- 历史 ADR 与当前实现区分：ADR-0010 仍是提案；R01–R06 为进程测试，R07–R10 为当时组件覆盖；不把旧四工具矩阵扩写为新业务路径都已重验。
- RAG 两模型 11/13、GLM 客户全称失败、原策略缺 guard 但未实际改错行等事实保留；候选视图仍非默认。
- 末篇保留未通过项与后续证据要求，系列没有遗留仅有提纲的第 03–07 篇。

## 发布状态

本文稿以仓库相对链接引用实现和原始证据，便于在仓库审阅。导入 Vie 时需要将前后篇链接转换为站点路由，
将源码和证据链接转换为已推送的公开仓库路径，或保留明确的外部资料入口。
本批没有推送代码、导入站点、构建站点或发布文章；发布前仍需检查实际阅读页排版与元数据。
