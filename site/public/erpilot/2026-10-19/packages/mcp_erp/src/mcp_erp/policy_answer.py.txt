"""Extractive policy answers bound to this turn's actual search results.

This validates provenance and rendering, not semantic entailment. The model still
selects which question belongs to a passage; evaluation must check that choice.
"""

import json
from dataclasses import replace
from typing import Literal

from agent_core.policy_display import policy_search_fields
from agent_core.response_contract import ResponseContract
from pydantic import BaseModel, ConfigDict, Field
from rag.citations import citation_label, text_digest


class PolicyAnswerPart(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    question_quote: str = Field(
        min_length=1, max_length=8000,
        description="当前用户问题的连续原文子串，不改写；逐个政策问题选择证据或标记缺口",
    )
    status: Literal["evidence", "gap"] = Field(
        description="原文能回答该问题选 evidence；缺依据选 gap，不能套用主题相近的条款",
    )
    citations: list[str] = Field(
        default_factory=list, max_length=15,
        description="仅复制 search_policy.matches[].citation 标签；不可用 quoted_citation 或正文；"
        "gap 时必须为空数组",
    )


class PolicyAnswerProposal(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    parts: list[PolicyAnswerPart] = Field(min_length=1, max_length=12)


_BLOCKED = {
    "unavailable": "政策检索当前不可用，请稍后联系店铺核对。",
    "conflict": "政策版本存在冲突，请联系店铺核对。",
    "inactive": "未找到当前生效的政策，请联系店铺核对。",
    "no_match": "本轮检索未覆盖这一问题，无法确认，请联系店铺核对。",
}
_GAP = "本轮检索未覆盖这一问题，无法确认，请联系店铺核对。"


def _evidence(history):
    references, blocked = {}, None
    versions = {}
    for item in history:
        if item["name"] != "search_policy":
            continue
        try:
            payload = json.loads(item["content"])
            if not item.get("ok") or policy_search_fields(item["arguments"], payload) is None:
                blocked = "unavailable"
                continue
            state = payload["policy_state"]
            if state != "matched":
                blocked = state
                continue
            for ref in payload["matches"]:
                label = citation_label(ref)
                quoted = label + "「" + " ".join(ref["text"].split()) + "」"
                if (
                    ref.get("citation") != label or ref.get("quoted_citation") != quoted
                    or ref.get("text_sha256") != text_digest(ref["text"])
                ):
                    raise ValueError("invalid evidence digest or citation")
                identity = (ref["version"], ref["effective_from"], ref["effective_until"])
                if versions.setdefault(ref["policy_id"], identity) != identity:
                    blocked = "conflict"
                if label in references and references[label]["text_sha256"] != ref["text_sha256"]:
                    blocked = "conflict"
                references[label] = ref
        except (ValueError, TypeError, KeyError):
            blocked = "unavailable"
    return ({} if blocked else references), blocked


def render_policy_answer(proposal, history, messages):
    question = next(
        (m["content"] for m in reversed(messages) if m.get("role") == "user"), ""
    )
    if not isinstance(question, str) or not question.strip():
        raise ValueError("policy answer requires a user question")
    refs, blocked = _evidence(history)
    fallback = proposal is None
    if fallback:
        parts = [PolicyAnswerPart(question_quote=question, status="gap")]
    else:
        parts = PolicyAnswerProposal.model_validate(proposal).parts
    rendered_parts, texts, used = [], [], set()
    quote_numbers = {}
    covered = set()
    for part in parts:
        if part.question_quote not in question:
            raise ValueError(
                "question_quote must be an exact substring of the current user question"
            )
        start = 0
        while (start := question.find(part.question_quote, start)) >= 0:
            covered.update(range(start, start + len(part.question_quote)))
            start += len(part.question_quote)
        if part.status == "evidence":
            if not part.citations or len(set(part.citations)) != len(part.citations):
                raise ValueError("evidence parts require unique current-search citations")
            if any(label not in refs for label in part.citations):
                raise ValueError("citation is absent from this turn's valid search results")
        elif part.citations:
            raise ValueError("gap parts cannot assert supporting citations")
        rendered_parts.append(part.model_dump())
        # A question is identified as user text; no generated claim is accepted.
        texts.append(f"问题 {len(rendered_parts)}（用户原话）：{part.question_quote}")
        if part.status == "gap":
            texts.append(_BLOCKED.get(blocked, _GAP))
        else:
            texts.append("相关政策原文：")
            for label in part.citations:
                if label in quote_numbers:
                    texts.append(f"参见证据 {quote_numbers[label]} 的原文。")
                else:
                    quote_numbers[label] = len(quote_numbers) + 1
                    texts.append(f"证据 {quote_numbers[label]}：" + refs[label]["quoted_citation"])
                used.add(label)
    uncovered = any(c.isalnum() and i not in covered for i, c in enumerate(question))
    if uncovered:
        texts.append("其余原话未列入本次证据选择，不能据此确认。")
    if fallback and refs:
        texts.append("以下为检索到的原文，尚未完成逐问适用性判断：")
        texts.extend(ref["quoted_citation"] for ref in refs.values())
        used.update(refs)
    return {
        "schema_version": 1, "contract": "policy-extractive-1",
        "mode": "fallback" if fallback else "selected-evidence",
        "parts": rendered_parts, "unassessed_remainder": uncovered,
        "policy_state": blocked or ("matched" if refs else "no_match"),
        "references": [refs[label] for label in sorted(used)],
        "text": "\n\n".join(texts),
    }


POLICY_RESPONSE_CONTRACT = ResponseContract(
    "policy-extractive-1", "search_policy", "compose_policy_answer", render_policy_answer,
)


def bind_policy_response(tools):
    return [
        replace(
            tool, response_contract=POLICY_RESPONSE_CONTRACT,
            params_model=(
                PolicyAnswerProposal if tool.name == "compose_policy_answer" else tool.params_model
            ),
        )
        if tool.name in {"search_policy", "compose_policy_answer"} else tool
        for tool in tools
    ]
