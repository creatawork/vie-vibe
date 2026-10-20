# B4 旧请求对账与最终真实验收

日期：2026-10-19。用户授权核对 B4 旧未知账单并执行最终真实模型验收。

结论：**最终同源码 GLM / DeepSeek 均通过三场景七轮，质量门槛与 strict 对照通过**。旧请求本地证据复核完成；用户明确跳过供应商账单核销，保留原未知费用与冻结记录。

## 旧请求对账

重新读取两份历史审计、原始评测报告和全部关联 JSONL，逐一校验 SHA-256。按 trace / run_id / step 配对 `step_start` 与 `step_end`，只计算逐步 usage，不重复累加 `run_end` 汇总；逐请求 Decimal 估价、请求数和原预算 spent 全部与旧记录一致。机器可读结果见 [独立复核](20261019-b4-reconciliation.json)。原报告、旧审计及冻结预算不改写。

| 请求窗口（北京时间） | 本地请求 / usage | 已知估价 | 供应商金额核对 |
|---|---|---|---|
| 2026-10-16 17:17:19.042–17:19:30.394 | 整批 22 / 21 | CNY 0.013707 | 此前用户提供超时单笔 USD 0.000222，保留为用户文本注记，未独立取得供应商账单 |
| 2026-10-17 15:02:48.770–15:11:05.703 | 整批 14 / 13 | CNY 0.008320 | 用户明确跳过供应商账单补录；本地无 usage 或供应商 request ID，实际费用继续记未知 |

10 月 16 日超时的 USD 0.000222 不能移用于 10 月 17 日连接错误。两笔原始缺失 usage 均保留，已知 CNY 估价与 USD 注记不相加、不换算；整批实际账单总额仍未知。缺失计量不写零费用。用户回复“跳过这个吧”，因此结束供应商凭据追索，状态为用户跳过核销；不标为账单已对平，不再阻塞后续工作。

## 本次真实验收契约

使用独立批次 [账本](20261019-b4-live-batch-01.json)，不重开历史冻结预算，也不挪用此前 B6 批次余额。GLM 估价上限 CNY 0.03、DeepSeek 上限 USD 0.02；每次模型请求总截止 60 秒，SDK / 整轮重试均为 0，缺 usage 停止本批次后续调用。按请求前累计估价熔断，单次返回用量可能使累计值越过上限，因此该数值不是供应商硬额度。

固定 `b4-reference` 三场景七轮：明确当前版本第二行、外部改序后澄清及确认旧 SKU、清空聊天后查询并说明库存投影。使用固定种子临时 SQLite、完整工具面及 AutoDeny；只允许用例明确要求的草稿保存，业务库存与正式订单不得变更。原 B4 七场景十五轮属于另一套冻结用例，不以本专项替代其历史结果。

本次不改代码、用例、scorer 或默认模型配置。运行前 source SHA-256：`ed379a4fa35ad72122e0108cb4d884092c4a1825aa0a189de615babb352e1b36`。原 `b4-reference` case SHA-256：`d2d7111aad3a049be6b569a26fb881ff1ac16cade2cc018525a249f1924bad16`；scorer 保留 `b4-reference-1` / `b4-1` / `v2.6`。

离线预检：草稿指代、任务运行、计费与质量门槛四组测试共 110 项通过，退出码 0。

## 真实结果

| 模型 | 场景 / 轮次 | 请求 / tokens | 原币种估价 | 原始报告 / 门槛 |
|---|---|---|---|---|
| GLM `glm-5.3-flash` | 3/3；7/7 | 16 / 104,261 | CNY 0.011127 | [JSON](../evals/20261019-102442-15b3bd.json)、[原文](../evals/20261019-102442-15b3bd.md)、[gate PASS](../gates/20261019-102442-15b3bd.md) |
| DeepSeek `deepseek-v4.1-flash` | 3/3；7/7 | 16 / 110,210 | USD 0.005503 | [JSON](../evals/20261019-102623-1ad1f6.json)、[原文](../evals/20261019-102623-1ad1f6.md)、[gate PASS](../gates/20261019-102623-1ad1f6.md) |

[严格对照](../evals/20261019-b4-reference-final-comparison.md)退出码 0。两次运行共享上述源码、case / scorer、种子、60 秒截止与零重试策略，运行期间源码未变化。各模型完整执行一遍，没有修复后重跑或择优挑选。

- 明确当前版本第二行：两模型均先查到 revision 2，按当前行 2 的 A1004 保存为 50 件，传 `expected_sku=A1004`，得到 revision 3。
- 外部改序后仅说“第二个”：两模型均只调用 `get_order_task`、列出新旧 SKU 对应并请求确认，完整状态 SHA-256 前后相同；没有以错误版本试写。用户确认旧展示 SKU A1005 后，重新查询并绑定 `expected_sku=A1005` 保存当前第一行，其他客户、备注与行保持用例约束。
- 清空聊天后的库存解释：两模型均先查询持久化草稿，取得 `inventory_effect=projection`，明确说明报价时预计值及保存草稿不预留、不扣减库存；查询轮完整状态 SHA-256 前后相同。
- 14 轮检查全部通过，零禁止业务写工具请求。每个模型允许的三次草稿保存使相应草稿状态发生预期变化；原判分核对库存、正式订单与非目标状态保持约束。

独立重读 14 份逐轮 trace，确认 **32 次 step_start = 32 个 usage 响应**；逐请求 Decimal 重算与两个预算 spent 精确相符。未出现新未知用量、未触发预算熔断；CNY / USD 分列，不表示供应商实扣费用。账本包含原始报告与全部 trace 哈希、14 轮状态及 SKU guard 证据。

运行命令（切模型仅覆盖该进程环境，未修改 `.env`）：

```powershell
$env:LLM_MODEL = 'glm-5.3-flash'
uv run python -m evals --suite b4-reference --budget 0.03 --budget-currency CNY --timeout 60 --gate configs/evals/b4-reference.json
$env:LLM_MODEL = 'deepseek-v4.1-flash'
uv run python -m evals --suite b4-reference --budget 0.02 --budget-currency USD --timeout 60 --gate configs/evals/b4-reference.json
uv run python -m evals.compare --strict reports/evals/20261019-102442-15b3bd.json reports/evals/20261019-102623-1ad1f6.json --output reports/evals/20261019-b4-reference-final-comparison.md
```

## 完成范围

本轮完成最终源码的 `b4-reference` 真实验收及旧请求本地审计；供应商核销按用户指示跳过。原 B4 十五轮历史结果、专项首轮 GLM 1/3 / DeepSeek 2/3 和 GLM 诊断失败全部保留，不重新评分、不汇总成长期成功率。

本轮未改应用或评测代码。前述 110 项针对性离线测试及差异检查通过；此前同一源码全仓 948 passed / 21 skipped / 47 deselected 的记录见 [上一批验证](2026-10-19-live-model-validation.md)。本轮没有重复执行前端或浏览器测试。
