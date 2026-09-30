---
title: 手写 Agent Loop：从一次 API 调用到多步任务
date: 2026-09-30
tags: [Agent, LLM, Python]
series: Erpilot 开发实录
description: 从一次流式 API 调用开始手写 agent loop：事件模型、工具循环、防死循环、错误回填、并行调用、上下文压缩与可回放 trace，看清框架替你做了什么。
---

> Erpilot 系列第 1 篇 · 2026-09-30
>
> 代码在 [erpilot/packages/agent_core](https://github.com/creatawork/Erpilot)（M1 第 1–4 周），约 1200 行 Python + 44 项单测。
> 这一版刻意不用任何 agent 框架——为什么、以及什么时候我会换上 LangGraph，文末说。

大模型 API 只会一件事：发一段消息列表，收一段消息。但我的"掌柜助手"已经能完成这样的任务——用户问"订单 123 里买了什么？还有货吗？报个价"，它自己拆成三步：查订单 → 查库存和报价（这一轮它**自发同时调用了两个工具**，没人教过它并行）→ 组织一句能直接发给顾客的回复。三轮 LLM 往返，成本约 ¥0.0003。

中间没有魔法，只有一个循环。市面上的 agent 框架，剥掉 UI 和生态，核心都是这个循环。这篇文章把它从零写一遍：从一次流式 API 调用开始，到多步工具调用、防死循环、错误回填、上下文压缩，最后落一份可回放的 trace。写完你会知道框架在替你做什么——以及哪些它替不了。

## 一、先让流式跑起来

直接调 `chat.completions.create` 拿完整回复当然可以，但一次任务要经历多轮生成，不把字往外吐，用户就只能对着空白界面猜程序是不是死了。所以第一件事是流式：

```python
stream = await client.chat.completions.create(
    model=model, messages=messages, stream=True,
    stream_options={"include_usage": True},
)
async for chunk in stream:
    if chunk.choices and chunk.choices[0].delta.content:
        yield TextDelta(chunk.choices[0].delta.content)
    if chunk.usage is not None:
        usage = Usage(...)   # 最后一个包带 token 计量
```

第一个设计决定在这里：**不要把 SDK 的 chunk 对象泄漏出去**。定义自己的事件模型——

```python
@dataclass(frozen=True, slots=True)
class TextDelta:   text: str
@dataclass(frozen=True, slots=True)
class ToolCall:    id: str; name: str; arguments: str
@dataclass(frozen=True, slots=True)
class StreamEnd:   usage: Usage | None
```

`stream_chat()` 产出 `TextDelta | ToolCall | StreamEnd`，并且保证**恰好以一个 StreamEnd 结束**。有了这层边界，下游就只需要认识三种事件：CLI 等一个终止信号来收口统计，SSE 把事件逐个转发，trace 逐行落盘——SDK 的流式细节被封在 `stream_chat` 里面，谁都不用再碰。

顺带处理一个容易忽略的细节：流式模式下工具调用是**分片到达**的——第一个包只有 `id` 和函数名，参数 JSON 分成好几段。要按 `index` 把碎片归并回完整的 ToolCall：

```python
slot = pending.setdefault(delta.index, {"id": None, "name": None, "arguments": []})
if delta.function.arguments:
    slot["arguments"].append(delta.function.arguments)
```

## 二、工具循环：agent 的本体

有了流式，agent 的本体是这样一个循环：**生成 → 有工具调用就执行 → 结果回填 → 再生成**，直到模型给出不含工具调用的回答。核心不到三十行（真实版本在 `loop.py`，含防护与重试，这里删了枝节）：

```python
async def run(self, messages) -> AsyncIterator[AgentEvent]:
    schemas = [t.openai_schema() for t in self._tools.values()]
    total_usage = None
    for step in range(1, self._config.max_steps + 1):
        yield StepStarted(step=step)
        compress_messages(messages, self._config.context)      # 上下文压缩，第五节
        parts, calls, step_usage = [], [], None
        async for event in self._client.stream_chat(messages, tools=schemas):
            match event:
                case TextDelta(text=text):
                    parts.append(text); yield event
                case ToolCall() as call:
                    calls.append(call)
                case StreamEnd(usage=usage):
                    step_usage = usage                         # 本步 token 计量
        total_usage = _merge_usage(total_usage, step_usage)    # 跨步合计
        yield StepEnd(step=step, usage=step_usage, ...)        # 供 trace 逐轮记录

        if not calls:                                          # 没有工具调用 = 最终回答
            messages.append({"role": "assistant", "content": "".join(parts)})
            yield LoopEnd(steps=step, usage=total_usage, completed=True)
            return

        messages.append(_assistant_toolcall_message("".join(parts), calls))
        for call in calls:
            yield ToolCallStarted(call=call)
        pending = [self._execute_indexed(i, c) for i, c in enumerate(calls)]
        for done in asyncio.as_completed(pending):             # 并行执行，第四节
            index, content, ok = await done
            yield ToolCallFinished(...)                        # 带 call_id，乱序可配对
        # 结果按调用顺序回填进 messages，进入下一轮
```

（重试与工具超时在 `_execute` 里，此处删了枝节；其余与 `loop.py` 一致。）

三个协议细节必须做对：

**schema 注入**。工具用 Pydantic 定义参数模型，`model_json_schema()` 自动生成 OpenAI tools 格式。一个小技巧：生成后递归剥掉所有 `title` 键——Pydantic 会给每个字段加 title，对注入请求是纯噪音，白花 token。

**回填必须成对**。模型发出工具调用后，历史里要有两条消息：assistant 消息带 `tool_calls`（它在请求什么），tool 消息带 `tool_call_id`（结果是什么）。漏掉一半或者 id 对不上，请求直接报错。这也是第五节上下文压缩的约束来源：**裁剪只能按轮进行，不能把 tool 结果和它的父调用拆开**。

**校验放在执行前**。工具入参先过 Pydantic 校验，模型给错参数时，错误信息回填给它自己修正，而不是让 handler 炸出一个堆栈。

到这里，"查订单 123 的状态"就能跑通了：模型请求 `get_order_status` → 执行 → 回填 → 第二轮生成"订单 123 已发货"。两步，这就是一个最小的 agent。

整个循环对外只暴露一条事件流，这是本文最重要的一张图：

```
LLM(流式) ──▶ AgentLoop.run() ──▶ AgentEvent 流 ──┬─▶ trace.py    JSONL 落盘 + 回放
             生成 → 工具 → 回填 → 再生成            ├─▶ cli.py      rich 渲染
                                                   └─▶ FastAPI SSE ──▶ React 页
```

循环本身不知道也不关心谁在消费——第六节的 trace、CLI 的渲染、第七节的前端，挂的都是同一条流。

## 三、防护：循环的第一课是刹车

无限循环并不罕见：模型会在同一处反复调用同一个工具、或者每次都发明一个新参数。三道闸：

**max_steps 防死循环**——到步数上限就停，事件里带 `completed=False`，上层可以提示用户而不是无声失败。

**单工具超时**——`asyncio.wait_for(tool.handler(args), timeout)`。任何工具作者都可能写出死循环或慢查询，不能让一个工具挂死整个 agent。

**异常永不外抛，转成结构化错误回填**。这是我认为 loop 设计里最重要的一个决定。工具抛异常、参数校验失败、超时——统统转成这样的 JSON 塞回对话：

```json
{"error": {"type": "timeout", "message": "工具执行超时（>30s，已重试 1 次）"}}
```

为什么不直接 raise？因为**模型看到错误是可以自救的**：参数错了会改参数，工具坏了会换一条路，甚至直接告诉用户"库存系统暂时查不了"。把异常抛给调用方等于放弃自愈能力，而结构化的 `type` 字段让模型可以稳定地区分"该重试的瞬态故障"和"该改道的确定性错误"。

顺着这个区分就有了重试策略 v1：`timeout` / `execution` 视为瞬态，按次数 + 退避自动重试；`validation` / `unknown_tool` 是确定性错误，重试毫无意义，立刻回填让模型修正。

## 四、并行工具调用

开头那个三步任务里，模型在第二轮同时要了库存和价格。两个调用互相独立，串行执行纯属浪费：

```python
pending = [self._execute_indexed(i, c) for i, c in enumerate(calls)]
for done in asyncio.as_completed(pending):
    index, content, ok = await done
    yield ToolCallFinished(...)   # 完成一个转发一个
```

三个顺序要分清：`Started` 事件按**调用顺序**发（模型请求了什么）；`Finished` 按**完成顺序**发（谁先跑完谁先走，前端时间线如实呈现）；回填消息按**调用顺序**放（与 assistant 消息里的 `tool_calls` 一一对应，协议最稳）。`Finished` 事件带着 `call_id`，前端靠它把 started/finished 配对，不怕乱序。

有意思的是，**并行不是代码教给模型的，是模型自己决定的**。工具定义和系统提示词里都没有"可以并行"的字样——OpenAI 兼容协议本身就允许一轮返回多个 tool_calls，模型自然会用。代码要做的只是别把它们串起来。省下的时间也很直观：trace 里一次工具执行只要几毫秒，任务耗时几乎全花在等 LLM 往返上——把同一轮的两次独立调用并成一次等待，省的就是最贵的那部分。

## 五、上下文压缩：把历史塞回预算里

工具结果往往比对话文本肥——本项目演示数据里一次订单查询就有几十 token，真实 ERP 的记录只会更大，多轮历史会逐渐吃满预算（ContextPolicy 默认 24k）。压缩策略 v1 是两层防线：

1. **单条截断**：超长的 tool 结果保留头尾（头 2/3 尾 1/3），中间换成省略标记——JSON 的结构信息通常在头尾
2. **整轮丢弃**：总体超预算时，从最老的轮次开始一整轮一整轮地丢（一条 user 消息连同它引发的 assistant/tool 消息）。丢弃的边界**绝不能落在工具交换中间**，否则就违反了第二节说的成对约束

system 消息和最近几条永远保留；发生过丢弃就插入一条 system 提示"更早的对话已被省略"，让模型知道自己失忆了。token 估算用 `len/3` 的粗启发式——中英混合场景够用，等接了 LiteLLM 再换真 tokenizer。

## 六、可观测：没有 trace 的 agent 不可调试

agent 的行为是非确定的：同一个问题，可能这次两步、下次三步，工具调用顺序也可能不同。**出了错，你需要的不是堆栈，是完整的过程回放**。

trace 模块在设计上只做一件事：旁观事件流，原样落盘。

```python
recorder = JsonlTraceRecorder(path, model=config.model)
async for event in recorder.run(agent, messages):   # 事件原样透传
    ...
```

一行一个 JSON 记录，追加写、逐行 flush：`run_start`（开跑时的历史快照）→ `step_start` / `step_end`（每轮文本、token、成本、耗时）→ `tool_call`（每次调用的入参出参与耗时）→ `run_end`（结束时完整历史）。异常也留痕：`run_error` 记完再原样抛出。

为什么不是直接上 Langfuse？不是它不好，是 M1 用不上：自托管一套要 Docker + Postgres + ClickHouse + 对象存储，而现在的场景是单机、单进程、低频调用。逐行 flush 的 JSONL 意味着**进程崩了已写的行还在**（观测管道最需要工作的时刻恰恰是故障时刻）；裸文本意味着 `grep`/`jq`/`tail -f` 全都能用；格式是自定义的，将来映射到 OTel GenAI 语义约定或者 Langfuse 只是换个 sink。取舍全文写进了 [ADR-0003](https://github.com/creatawork/Erpilot/blob/main/docs/adr/0003-local-jsonl-trace-first.md)。

`erpilot replay` 把流水还原成可读对话。下面是本文写作当天的一段**真实 trace**——当时上游端点不稳定，一轮请求慢到 266 秒，我在等待第 2 轮结果时手动中止了它：

```
== run b3f76f57cf40 · glm-5.3-flash · 2026-09-30T10:13:38 ==
[用户] 订单 123 里买了什么？现在还有货吗？
--- 第 1 轮 ---
（266261ms · in 332 / out 121 tok · ≈¥0.0001）
[工具✓] get_order_status({"order_id":"123"}) → {"status": "待发货", ...}（5ms）
--- 第 2 轮 ---
（68289ms · in 390 / out 34 tok · ≈¥0.0000）
```

同一天更早的两次尝试直接死在上游（一次 APIError、一次 502 upstream_error），也都被 `run_error` 完整留痕。trace 的第一次实战价值，就是记录它自己没跑成的那几次——顺便注意上面那组数字：工具执行 5ms，LLM 一轮 266 秒，第四节说的"时间都花在等模型"在这里是字面意义的。

## 七、三条入口，一个循环

同一套 loop + 同一批工具，三种消费方式：**CLI**（`erpilot chat`，rich 渲染流式输出与工具时间线，trace 自动落盘）；**FastAPI**（`POST /api/chat/stream`，loop 事件逐个转成 SSE 帧转发）；**React 页**（fetch + ReadableStream 手解 SSE——`EventSource` 不支持 POST——增量文本、工具时间线、token/成本全都在）。

前后端协议就是 loop 的事件模型加三个信封事件（`start` / `done` / `error`），字段表在 `erpilot_api/events.py` 的 docstring 里，TypeScript 侧的镜像类型在 `apps/web/src/protocol.ts`——两侧必须同步改，这是目前协议唯一的"文档"。

## 写在最后：什么时候轮到框架

手写这上千行，收获是知道框架在替你做什么：流式事件归并、工具执行的并发调度、错误回填——各自的实现位置和取舍都过了一遍。同时也确认了**手写解决不了什么**：会话持久化、断点恢复、人工审批的 interrupt/恢复，这些是 LangGraph 的 checkpointer 和 interrupt 所覆盖的，恰好是 Erpilot 的核心设计（分级 HITL 审批）到 M6 才需要的。

所以计划是：M6 把 loop 内核换成 LangGraph，事件协议、trace 格式、前端、评测**全部不动**——这层协议的稳定，是手写阶段换来的。迁移完成后我会再写一篇对比，验证这个判断。

下一篇：《给 ERP 写一个 MCP Server》。
