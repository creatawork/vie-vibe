# Agent 求职项目 · 启动计划

> 状态：v4（2026-09-29）——项目定名 **Erpilot**（弃用拼音名），仓库迁至 `E:\workspace\erpilot`，脚手架就绪并通过验证；选型对齐行业真实栈（v2），个人现有技能不作为选型因素
> 目标：12 个月内以本项目为核心作品，转入 agent 应用开发岗位
> 策略：三个深方向（工具设计 / HITL 审批 / 评测体系），每个方向落到可展示的证据——数字、曲线、文章

## 1. 总原则

- 技术选型以"行业真实在用的 agent 栈"为准，多出的学习成本计入 M1–M2，用 ADR 记录选型理由
- 项目独立建仓库，不放进 VIE 站点仓库；VIE 只承载项目档案页（`projects.source.ts`）与系列文章
- 三个深方向优先，其余做减法：宁可三个点深，不要八个点浅
- 一切"精"的标准以数字为准：成功率、成本、延迟、误拦截率
- 每个关键决策写 ADR（架构决策记录），既是写作训练也是面试素材

## 2. 技术选型（对齐行业真实栈）

主栈：**Python 承载全部 agent 核心逻辑，TypeScript 仅用于前端**。

| 层 | 选择 | 说明 |
|---|---|---|
| 语言 | Python 3.12+（主）/ TypeScript（仅前端） | 国内 agent 岗 JD 基本盘是 Python；agent 前端生态集中在 React 侧 |
| 包管理/工程 | uv workspace + ruff + pytest | 当前 Python 事实标准工具链 |
| Agent 核心 | M1–2 手写 loop；M6 起引入 LangGraph | 先懂机制再用框架；LangGraph 的 checkpoint + interrupt 是 HITL 的工业级实现 |
| 框架认知 | LangGraph 主修；OpenAI Agents SDK / Google ADK / CrewAI 认知级 | 面试常问框架横向对比 |
| 工具协议 | MCP（FastMCP） | 事实标准工具协议 |
| 后端 | FastAPI + sse-starlette（SSE）+ Pydantic v2 | 生产 agent 服务最常见组合 |
| 前端 | React + TypeScript（Vite SPA）+ assistant-ui 或 CopilotKit；理解 AG-UI 协议 | generative UI / "Components as Tools" 是主流方向；示例生态多为 Next.js，必要时评估 |
| 数据库 | PostgreSQL + pgvector | LangGraph Postgres checkpointer 与向量检索共用一个库 |
| 模型路由 | LiteLLM 网关；主力 GLM-5.3 Flash（智谱 OpenAI 兼容端点），评测阶段横向对比 DeepSeek / Qwen | 多模型对比与降级的事实标准做法 |
| 可观测 | Langfuse 自托管 + OpenTelemetry GenAI 语义约定 | trace 是评测与事故复盘的数据源 |
| 评测 | pytest 自建 runner + Langfuse datasets + DeepEval（LLM-as-judge） | 自建可控、能讲原理；平台只做展示 |
| 部署 | Docker Compose：api + web + postgres + langfuse | demo 可访问即可 |
| AI 编程工具 | Cursor / Claude Code 深度使用 | 国内 JD（如腾讯 2027 校招 Agent 开发岗）已明确写入该要求 |

### 与岗位 JD 的对照

- Python + FastAPI/Flask 后端能力 → 主栈直接命中
- LangChain / LangGraph 框架经验 → 手写原理（M1）+ 生产级使用（M6 起）双层叙事
- RAG 完整技术链（美团、美的等 JD 明确要求）→ M10 决策场景，面试可讲完整取舍
- MCP → 项目核心架构，"为什么 MCP"是必答题
- AI 编程工具熟练度 → 全程使用，开发过程可写成文章

## 3. 仓库结构

```
erpilot/                          # Erpilot —— 会请示的 ERP 智能体
├── apps/
│   ├── api/                      # FastAPI：agent 服务、会话管理、SSE
│   └── web/                      # React + TS：流式对话、工具时间线、审批卡片
├── packages/
│   ├── agent_core/               # 手写 agent loop（M1 核心产出，不依赖业务）
│   ├── mcp_erp/                  # FastMCP Server：把 ERP 能力暴露为工具
│   ├── erp_store/                # 领域模型（SQLAlchemy）+ Postgres + 种子数据
│   └── evals/                    # pytest 评测 runner + 评测集 + 报告生成
├── docs/
│   └── adr/                      # 架构决策记录（0001-xxx.md …）
├── .github/workflows/            # CI：单测 + 回归评测
└── docker-compose.yml            # api + web + postgres + langfuse
```

Python 侧用 uv workspace 管理四个包；依赖方向：`apps` → `packages`；`mcp_erp` 依赖 `erp_store`；`agent_core` 不依赖任何业务包（保持可复用）。

## 4. 范围冻结

**做：**
- ERP 三模块：商品、库存、订单（含报价计算）
- 单主管 agent + 15~20 个 MCP 工具
- HITL 分级审批：只读放行 / 低风险批量确认 / 资金操作单笔确认
- 评测体系：50+ 条、四类 case（单工具 / 多步 / 边界 / 对抗）、LLM-as-judge 校准、回归进 CI
- 前端：流式对话、工具时间线、审批卡片

**延后：**
- 多 agent 拆分（评测与 HITL 稳定后再决定）
- RAG（M10 决策，仅做"价格政策问答"单场景）

**不做：**
- 登录 / 多用户（单用户 demo 模式）
- 花哨动效、移动端适配、国际化

范围变更必须走 ADR 并更新本节。

## 5. 里程碑

| 月份 | 目标 | 关键产出 |
|---|---|---|
| M1–2 | Python 手写 agent loop | agent_core + 本地 trace + 第一篇文章 + ADR×2 |
| M3–5 | FastMCP Server + 工具设计精研 | 15~20 个工具 + 错误自愈数据 + 评测集起步 |
| M6–8 | LangGraph 重构编排 + HITL + 持久化 | Postgres checkpointer + interrupt 审批流 + 中断恢复 demo；现职落地一个生产 agent 功能 |
| M9–11 | 评测驱动迭代 | 成功率曲线 60%→90% + 成本优化实录（LiteLLM 路由）+ 注入防护 |
| M12 | 收口 | 部署、VIE 档案页、系列文章成册、面试叙事 |

## 6. M1 详细拆解（Python 手写 Agent Loop）

### 第 1 周 — 地基
- [ ] uv workspace 脚手架：四包结构、ruff、pytest、类型标注约定
- [ ] LLM client 最小实现：`AsyncOpenAI`（OpenAI 兼容端点）、SSE 流式解析、usage 统计
- [ ] 用 respx mock 单测（不烧真实 token）
- 产出：`agent_core` 能流式对话并打印 token / 成本

### 第 2 周 — 工具调用协议
- [ ] Pydantic 定义工具签名 → 自动生成 JSON Schema → 注入请求 → 解析 tool_calls → asyncio 执行 → 结果回填 → 循环
- [ ] max steps 防死循环、单工具执行超时（asyncio.wait_for）
- [ ] 结构化输出（Pydantic 强约束解析）
- 产出：能完成"查订单 123 状态"这类单工具任务

### 第 3 周 — 多步任务与错误处理
- [ ] 连续多工具任务（查库存 → 比价 → 给建议）
- [ ] 工具报错的回填策略：错误信息格式、何时重试、何时让模型改道
- [ ] asyncio.gather 并行工具调用；上下文超长的截断/压缩策略 v1
- 产出：3 步以上任务的稳定 demo，错误场景有单测

### 第 4 周 — 可观测与收口
- [ ] 本地 trace：JSONL 落盘，含每轮消息、工具调用、耗时、token、成本
- [ ] typer/rich CLI demo + FastAPI SSE 最小链路 + React 最小流式页（验证前后端协议）
- [ ] ADR：为什么主栈选 Python；为什么手写 loop 而不是先上框架
- [ ] 文章：《手写 Agent Loop：从一次 API 调用到多步任务》

### M1 验收标准
- [ ] 无框架实现完整 loop：流式、tool calling、结构化输出、并行工具调用
- [ ] 防死循环 + 工具超时 + 错误回填，均有测试覆盖
- [ ] 一次完整任务的 trace 可回放，成本/延迟有数字
- [ ] 2 篇 ADR + 1 篇文章发布到 VIE

## 7. 风险与对策

| 风险 | 对策 |
|---|---|
| Python 生态不熟（asyncio、类型标注、uv 工具链） | 第 1 周只做地基不赶进度；AI 编程工具辅助提效；asyncio 模式沉淀成第一篇 ADR 素材 |
| 评测集质量低、case 凑数 | 先写人工标注标准再写 case；每周固定补 5 条；judge 与人工一致率 <85% 就停下校准 |
| API 成本失控 | 设月度预算上限；CI 回归只跑便宜模型；trace 记录单任务成本 |
| 半途需求膨胀 | 第 4 节范围冻结；变更走 ADR |
| 时间不足（在职） | 每周 ≥6h 底线投入；M6 起现职功能与本项目互补而非并行竞争 |
| 模型 API 变动 | LiteLLM 网关层隔离供应商差异，env 一键切换 |

## 8. 已定项与剩余待定

- [x] 项目名：**Erpilot**（ERP + pilot；"掌柜"保留为产品隐喻——掌柜打理日常买卖，动账动货必须请示东家，即 HITL 审批）
- [x] 模型主力：GLM-5.3 Flash（智谱，OpenAI 兼容端点起步；评测阶段横向对比 DeepSeek / Qwen）
- [x] 仓库已初始化：`E:\workspace\erpilot`（uv workspace + 四包骨架 + ADR-0001 + CI），pytest / ruff / API 冒烟全部通过
- [ ] assistant-ui 还是 CopilotKit（M6 前端成型时定；M1–M5 先手写最小 React UI，理解协议层）

## 9. 参考资料

- The New Stack：How to build production-ready AI agents with RAG and FastAPI — https://thenewstack.io/how-to-build-production-ready-ai-agents-with-rag-and-fastapi
- CopilotKit 文档（AG-UI、generative UI、MCP Apps）— https://docs.copilotkit.ai
- ruanyf/weekly 招聘汇总（2026-09）— https://github.com/ruanyf/weekly/issues/11434
- 7 Best AI Agent Frameworks Compared（2026-06，LangGraph / CrewAI / AutoGen / Google ADK / OpenAI Agents SDK 对比）
