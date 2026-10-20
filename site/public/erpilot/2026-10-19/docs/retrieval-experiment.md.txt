# 可复跑的政策检索实验

已完成实验框架、冻结问答集、代理对照和用户重新授权后的真实查询向量对照。实验比较向量余弦、BM25 和 RRF，记录原始排名与阈值后的取证行为。正式 `search_policy` / 取消资格查询仍使用原来的向量检索与 0.57 阈值；真实查询采集与离线排名分开计量。

## 冻结数据与实验问题

数据位于 `packages/rag/src/rag/benchmarks/policy-retrieval-v1.json`，版本 `policy-retrieval-1`，固定时点 `2026-10-19T12:00:00+08:00`。

- 现有 3 份政策、18 个片段；政策正文和元数据一起计算 corpus SHA256，变化后拒绝复用此版本实验。
- 36 条工程标注问答：24 条有依据、12 条语料外。相关小节使用 source + title 标注，包含数字、状态、SKU、舍入、幂等、审批、多小节和近义表达。
- dev 为 8 正 / 4 负，test 为 16 正 / 8 负；两组不重复查询。语料外包含“会员券叠加折扣”“退款银行手续费”“退货地址”等词面相关、实际缺少答案的困难负例。
- 标注基于当前政策人工编写，未经第二名标注者独立复核；语料规模小。相关片段可能存在冗余，Recall 不等于必须引用所有片段才能回答。

数据规范化 SHA256：`bb0029d8ddb092d58533bac2ddaaf75e9d3776c513e235ee51f9a61e57f0aabc`。单测固定该指纹，新增查询、变更 split 或改判需显式更新实验版本与证据，不根据 test 分数临时改标签。

当前真实索引绑定的 corpus SHA256：`4ea1453f38e33a87a2fe863cc6a9883bbdb8f0d003c2b5be9f1021428515ae1e`。

## 方法与分数空间

`rag.lexical` 不引入外部检索依赖。分词版本 `nfkc-cjk-bigrams-ascii-1`：先 NFKC 和 casefold；连续中文生成相邻双字片段，单字保留；ASCII 的 SKU、数字、点号和下划线标识作为完整 token。索引仅使用正文，与原嵌入输入一致。

BM25 使用 `k1=1.2`、`b=0.75`，正 IDF 为 `log(1 + (N - df + 0.5) / (df + 0.5))`。同一查询的重复词只计一次。参数与正 IDF 的来源见 [Lucene BM25Similarity 文档](https://lucene.apache.org/core/9_10_0/core/org/apache/lucene/search/similarities/BM25Similarity.html)。

RRF 使用 `sum(1 / (60 + rank))`，从 1 开始计名次，合并两路排名并按稳定片段 ID 打破并列。公式与 60 常量参考 [Cormack 等人的原始论文](https://cormack.uwaterloo.ca/cormacksigir09-rrf.pdf)。输出单独保存 cosine、BM25 分数和两路排名；融合分数不进入当前 `Hit.score` 的余弦相似度展示契约。

正式检索与实验共用 `select_policy_scope`：先核对元数据、版本冲突、有效期与规则小节，再把相同候选集合交给各算法。默认查询行为不变，过期或冲突政策不会因关键词命中而重新进入实验候选。

## 校准与指标

三种方法各自只用 dev 选择阈值：候选为 0，以及 dev top-3 每个观测分数的下一个可表示浮点数。目标是最大化 `(正例至少命中一个相关片段的比例 + 负例拒答率) / 2`；并列时依次偏好负例拒答、更高正例命中、更少返回片段、更高阈值。算法不读取 test 的标签或分数来调参。

test 在阈值冻结后独立计分；不把 RRF、BM25 和余弦分数套用同一数值阈值。缓存真实向量模式还额外记录固定 0.57 阈值的 `vector_current`，与 dev 校准的 `vector` 分开。

| 指标 | 口径 |
|---|---|
| Raw Recall@1 / @3 | 阈值前、正例逐题相关小节召回的宏平均 |
| Raw MRR@3 | 正例 top-3 第一个相关小节的倒数排名，未命中为 0 |
| Accepted Recall@3 | 阈值后正例逐题召回的宏平均 |
| Evidence precision | 所有查询返回的相关片段数 / 返回片段总数，含语料外的错误返回；全部为空时为 null |
| Supported positive rate | 正例阈值后至少命中一个相关小节的比例 |
| False reject rate | 正例没有返回任何片段的比例 |
| OOD rejection | 负例返回空的比例；不是模型最终可见回答的拒答率 |
| p50 / p95 ranking ms | 单次本地排名计时，nearest-rank；RRF 含两路排名和融合；不含嵌入、政策筛选、建索引或网络延迟 |

所有逐题 query、split、标注理由、来源、小节、分数、排名、阈值是否接纳及待复核 case 都写入 JSON。待复核包含未找齐相关小节或负例有返回，不等同于已经判定模型回答错误。

## 两种明确的运行方式

离线代理烟测：

```bash
uv run --package rag python -m rag.benchmark --backend local-tfidf --output reports/rag/retrieval-proxy
```

`local-tfidf` 使用仅在语料正文拟合的 TF-IDF 词项向量。它测试余弦排序、BM25、RRF、阈值与评测代码，**不代表已部署的 qwen 语义嵌入质量**。没有 `vector_current` 指标，不从代理结果推导真实模型效果。

导出完整查询请求清单（只写文件，不发 HTTP）：

```bash
uv run --package rag python -m rag.benchmark --export-queries reports/rag/retrieval-query-request.json
```

清单绑定当前真实 index 文件 hash、语料 hash、数据集 hash、维度和全部 36 条查询。[请求清单](../reports/rag/20261019-retrieval-v1-query-request.json)本身不发请求。2026-10-19 用户允许真实模型验收后，已使用单独采集器完成 36 条配套查询向量：4 次请求、1,038 token，响应模型均为 `qwen3.7-text-embedding-flash`，维度 1024，原文档索引未重建。

显式发起真实嵌入（会使用供应商额度，不属于离线基准命令）：

```bash
uv run --env-file .env --package rag python -m rag.collect --expected-model qwen3.7-text-embedding-flash --max-requests 4 --max-total-tokens 3000 --timeout 30 --output traces/rag/new-query-vectors.json --audit reports/rag/new-query-audit.json
```

每次请求先持久化计数；SDK 不重试，单次请求总截止 30 秒。用量缺失或超时会保留未知记录并停止后续请求；模型不符、响应 index 重复、维度或数值错误也停止。输出或账本已经存在时拒绝重开。token 上限根据每次已返回用量决定后续是否继续，不能阻止最后一次响应超过阈值；嵌入端点价目未确认，不把金额未知记成免费。

本轮[真实采集账本](../reports/rag/20261019-retrieval-v1-collection-audit.json)保存每批状态、用量、请求模型及完整查询向量，便于不发新请求地恢复实验材料；临时向量包位于 `traces/rag/20261019-retrieval-v1-real-vectors.json`。`scripts/collect_retrieval_queries.py` 是工作区组合入口，只加载本地 `.env` 后调用同一采集器，不输出密钥。

严格缓存对照：

```bash
uv run --package rag python -m rag.benchmark --backend cached --query-vectors <完整查询向量包.json> --output reports/rag/retrieval-cached
```

向量包格式：

```json
{
  "schema_version": 1,
  "model": "与文档索引相同的嵌入模型",
  "provenance": "生成批次、来源和计量记录",
  "index_sha256": "请求清单中的索引文件指纹",
  "corpus_sha256": "请求清单中的语料指纹",
  "dimensions": 1024,
  "query_vectors": {"完整原始查询": ["此处需替换为真实浮点向量"]}
}
```

以上仅为结构示意，不能直接作为合法向量包。缓存必须包含恰好全部冻结查询，维度一致、非零且数值有限；文档索引也检查相同约束。缺项、额外查询、index 文件指纹不一致、旧语料或损坏向量会退出，不回退到付费请求或代理向量。模型名和 provenance 是生成方声明，代码不能独立证明供应商模型身份。

CLI 必须明确选择 backend；完整运行返回 0，非法输入返回 2。完整实验里方法指标差仍正常产出，不能把“命令成功”解释为“可上线”。JSON / Markdown 输出不能覆盖输入数据、索引或缓存。

CI 在普通单测后运行显式代理烟测并上传产物，不增加真实模型步骤。基准没有导入模型客户端、读取 `.env` 或发送网络请求。

## 首轮结果与取舍

2026-10-19 的[首轮代理报告](../reports/rag/20261019-retrieval-v1-proxy.md)与[逐题数据](../reports/rag/20261019-retrieval-v1-proxy.json)均保留。测试集数据：

| 方法（均使用代理向量条件） | Raw Recall@3 | 阈值后 Recall@3 | 证据精度 | OOD 拒答 |
|---|---|---|---|---|
| 向量余弦 | 100% | 71.9% | 86.7% | 75.0%（6/8） |
| BM25 | 100% | 87.5% | 54.8% | 62.5%（5/8） |
| RRF | 100% | 78.1% | 66.7% | 37.5%（3/8） |

BM25 在代理条件下提高了阈值后召回，同时带来更多无关片段；RRF 的负例误接纳更明显。

用户授权后的[真实向量对照](../reports/rag/20261019-retrieval-v1-real.md)与[逐题数据](../reports/rag/20261019-retrieval-v1-real.json)已完整执行。同一代码另外保存[配套代理复跑](../reports/rag/20261019-retrieval-v1-proxy-final.md)，原首轮数据不覆盖。真实向量条件下 test 结果：

| 方法 | 阈值 | 阈值后 Recall@3 | 证据精度 | OOD 拒答 | 正例空返回 |
|---|---|---|---|---|---|
| 当前向量策略 | 0.57（预先固定） | 96.9% | 58.1% | 87.5%（7/8） | 0% |
| dev 校准向量 | 0.670668 | 59.4% | 100% | 100%（8/8） | 37.5% |
| BM25 | dev 校准 | 87.5% | 54.8% | 62.5%（5/8） | 见逐题 JSON |
| RRF | dev 校准 | 78.1% | 87.5% | 75.0%（6/8） | 12.5% |

这些结果仍支持保留当前 0.57 默认策略。直接提高阈值虽然减少无关片段，也漏掉更多有依据的问题；RRF 的拒答与召回均未超过当前策略。当前策略仍会返回“退货地址 / 电话”问题 n12 的相关主题片段，但片段并不提供地址或电话，说明主题相似不等于足够回答。后续需要冻结新的独立样本验证证据充分性和生成回答，而非按本次 test 分数继续调阈值。36 条问题本轮只跑片段检索，没有声称完成逐题模型答复验收。

初始离线工程记录见[代理实验验收](../reports/acceptance/2026-10-19-retrieval-experiment.md)，新授权批次的真实向量、B6、失败复盘和费用见[真实模型验收](../reports/acceptance/2026-10-19-live-model-validation.md)。
