# 评测质量门槛

`evals.gate` 只读取已有 JSON 报告和版本化策略，不加载 `.env`、不创建模型客户端、不调用工具。它生成独立的 JSON / Markdown 判定，不修改原始失败、scorer 或历史报告。

政策分段验收生成的 `*-summary.json` 同样可检查；其中保留全部原始分段路径与哈希，未知计量仍会使 gate / strict 拒绝。`configs/evals/rag-grounding-structured.json` 的版本指门槛策略；实际 scorer 版本由报告元数据和冻结用例清单标明。分段 CLI 与失败保留规则见[续跑契约](resumable-grounding-evaluation.md)，最新真实两模型各 11/13，不能把 strict 可比当成质量通过。

## 为什么增加这层

`compare --strict` 回答的是“两个模型的报告是否来自同一源码与相同实验条件”。质量门槛回答“这份报告能否验收；相对同模型旧版本是否退步”。后者允许源码哈希变化，保留 case、scorer、seed、重试、超时和各业务套件指纹一致的要求。两种用途分开，原 strict 行为不变。

成功率不变也可能退步：旧版 A 通过、B 失败，新版 A 失败、B 通过，两者都是 50%。提供 `--baseline` 时，A 会被单独标记为回退。

## 运行方式

检查已有 B4 指代失败报告，无付费请求：

```bash
uv run python -m evals.gate reports/evals/20261017-150138-f81491.json --policy configs/evals/b4-reference.json --output reports/gates/b4-reference-audit
```

该命令预期返回 **1**：原报告只有六轮、存在未知计量，且旧报告没有新增的调用请求证据。失败判定不代表重新运行了模型，也不重写历史结论。

新评测可在结束时自动执行质量门槛（会使用真实模型；运行前应已确定该批预算）：

```bash
uv run python -m evals --suite b6 --budget 0.05 --budget-currency CNY --timeout 60 --gate configs/evals/b6.json
```

跨版本检查同模型旧报告：

```bash
uv run python -m evals.gate reports/evals/candidate.json --policy configs/evals/b6.json --baseline reports/evals/reference.json --output reports/gates/b6-regression
# 新评测也可使用 --gate <策略> --regression-baseline <旧报告>
```

示例中的 candidate / reference 是占位文件名；本轮未运行这两条真实模型命令。CLI 的策略范围会在解析供应商配置前检查，完整策略不能搭配 `--case` 子集。派生产物放在 `reports/gates/`，避免混入只接收原始运行报告的聚合器。

## 判定契约

- **固定分母**：策略显式列出 case ID。缺项、重复项、额外项、suite 声明与实际行不一致均失败。执行数、完整标记和未执行占位结果交叉核对；运行期间源码变化也失败。
- **逐轮完整**：B4 策略固定每场景轮数；检查子结果、非空 trace 引用、轮次 ID 唯一及全局轮数。不会因为父结果写着完成就忽略未执行的子轮次。trace 检查为引用检查，不保证本地文件存在或内容正确。
- **结果一致**：passed 与 completed、error、failed_checks、子轮次相矛盾时不能通过。使用策略声明的固定分母计算成功率。
- **调用请求证据**：新报告的 `tool_attempts` 在 `ToolCallStarted` 时记录，跨重试累计；`tool_calls` 仍保留原来的完成顺序。禁止工具检查同时消费开始请求、完成调用及工具结果，包括拒绝和错误。多轮报告汇总每轮请求。旧报告的 `None` 表示未记录，不能解释为没有尝试。
- **原币种计量**：优先使用 billing，旧 CNY 路径使用 cost / cost_complete。usage 未知、金额未知、估价不完整或 suite 预算标记未知都不能当作零成本。多轮金额 / token / 时延只累计父结果一次，并交叉核对子轮次的合计。父金额未知时保留可读取的子轮次金额小计，`costs_complete=false`；未知请求内部未保留下来的部分无法反推，该小计不等于完整费用或账本 spent。
- **延迟 / token / 成本**：策略可显式配置 `max_p95_duration_ms`、`max_total_tokens`、`cost_limits`。分位数采用 nearest-rank，样本是每个 case 的总时长（包含其重试和轮次），不等于首 token 延迟。成本使用 Decimal，CNY / USD 独立检查，不换算；未配置相应币种不能通过成本门槛。金额是估价，不是账单硬上限。
- **逐用例回退**：参考报告必须有完整覆盖、稳定源码、结果一致和所需证据；允许它保留已知失败。只有同模型、相同实验条件才计算回退；不兼容时明确失败，不输出可比较结论。模型身份沿用报告的 model 字段，不证明两个端点内部实现一致。

`configs/evals/{baseline,b4,b4-reference,b5,b6,rag-grounding}.json` 默认要求成功率 1.0、完整计量和调用请求证据。B4 禁止提交 / 业务写入；B5 / B6 / rag-grounding 禁止包括草稿编辑在内的所有写工具。baseline 含合法审批写场景，业务安全义务继续由原 case scorer 与状态判分承担。rag-grounding 的来源 / 原文检查、固定条件断言和全表零变更见[回答可靠性契约](rag-answer-reliability.md)；自动通过还需结合逐条语义复核。

延迟、token 和金额数值阈值没有拍脑袋写入默认策略；需要先测量、明确运行环境与业务目标，再形成新的策略版本。未知字段、非法数值、重复 ID 或拼错配置会被拒绝。

旧报告若只做历史分析，可复制策略、更名并显式设置 `require_tool_attempts: false`；该宽松结果不能替代新策略验收。历史报告是否缺少请求证据与模型是否通过旧 scorer 是两件事。

## 输出与自动化

独立命令返回码：0 = 通过，1 = 质量门槛失败，2 = 输入 / 策略错误。JSON 保存判定版本、策略快照、规范化 JSON 的 SHA256、参考报告 SHA256、每个检查项和指标。`--output` 不能覆盖输入报告或策略。

带 `--gate` 的真实评测默认生成 `reports/gates/<运行报告名>.json/.md`，由策略决定验收返回码；默认策略要求全部通过。未带策略时保留原来的全 case 通过条件。参考报告缺少完整性证据时在模型配置解析前拒绝。CI 的既有真实 baseline 步骤已接入 baseline 策略，并同时上传 gate 产物；未配置模型 secrets 时继续跳过该付费步骤。普通 pytest 的模拟供应商和真实 MCP / 临时库测试不会产生真实模型费用。

本次验收与已知限制见[2026-10-19 验收记录](../reports/acceptance/2026-10-19-job-readiness.md)。

2026-10-19 生成验收审计发现，旧 runner 将预算跳过的占位行计入 `complete=True`，旧 strict 只信任此标记，可能放行未完整执行的报告。质量门槛的独立执行计数已经正确拒绝。现修复 runner 的标记，并让 strict 独立核对用例覆盖、唯一性、实际 / 报告执行数、跳过项、多轮计数、源码稳定性和未知计量；原错误报告不回填。真实故障、错误派生对照和修复后实际拒绝结果见[回答可靠性审计](../reports/acceptance/2026-10-19-rag-answer-reliability.md)。
