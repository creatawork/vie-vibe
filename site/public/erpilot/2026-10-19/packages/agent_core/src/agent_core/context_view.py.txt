"""Opt-in request projection. Tool data keeps its original role and call pairing.

The source conversation is never modified. Projectors are installed by trusted
application code; tool output cannot select a projector or become a system message.
"""

import hashlib
import json
from collections.abc import Callable, Mapping
from copy import deepcopy
from dataclasses import dataclass, field

from agent_core.context import ContextPolicy, estimate_tokens

ToolProjector = Callable[[str], str | None]


class ContextBudgetExceeded(ValueError):
    """Protected messages exceed the estimated request budget; no request is sent."""


@dataclass(frozen=True)
class ContextView:
    projectors: Mapping[str, ToolProjector] = field(default_factory=dict)
    remember_tools: tuple[str, ...] = ()
    recent_only: bool = True
    retain_user_messages: bool = False
    fail_on_overflow: bool = False

    def __call__(self, history: list[dict], policy: ContextPolicy) -> list[dict]:
        messages = deepcopy(history)
        calls = {}
        for i, message in enumerate(messages):
            for call in message.get("tool_calls", []):
                calls[call["id"]] = (i, call["function"]["name"])
            if message["role"] != "tool" or not isinstance(message.get("content"), str):
                continue
            name = calls.get(message.get("tool_call_id"), (None, None))[1]
            projector = self.projectors.get(name)
            projected = projector(message["content"]) if projector else None
            # A large structured summary is also omitted, never cut into invalid JSON.
            if projected is not None and (
                policy.max_tool_chars <= 0 or len(projected) <= policy.max_tool_chars
            ):
                message["content"] = projected
                continue
            if policy.max_tool_chars > 0 and len(message["content"]) > policy.max_tool_chars:
                content = message["content"]
                message["content"] = json.dumps({
                    "context_view": "omitted", "refresh_required": True,
                    "original_chars": len(content),
                    "sha256": hashlib.sha256(content.encode()).hexdigest(),
                }, ensure_ascii=False)

        # Each unit includes its complete assistant/tool exchange. A recent window
        # may expand to the beginning of a unit rather than split a parallel call.
        units: list[list[int]] = []
        for i, message in enumerate(messages):
            if message["role"] == "tool" and units:
                units[-1].append(i)
            else:
                units.append([i])
        protected = {i for i, m in enumerate(messages) if m["role"] == "system"}
        if self.retain_user_messages:
            # Preserve original instructions as user data, without interpreting or
            # promoting them to system instructions or cross-session memory.
            protected.update(i for i, m in enumerate(messages) if m["role"] == "user")
        boundary = max(0, len(messages) - max(1, policy.keep_last_messages))
        protected.update(range(boundary, len(messages)))
        # Retain the most recent observation, including errors/none/ambiguity.
        # Never resurrect an older successful observation after a newer failure.
        for name in self.remember_tools:
            indices = [i for i, m in enumerate(messages) if m["role"] == "tool"
                       and calls.get(m.get("tool_call_id"), (None, None))[1] == name]
            if indices:
                latest = indices[-1]
                protected.add(latest)
                user = next((i for i in range(latest - 1, -1, -1)
                             if messages[i]["role"] == "user"), None)
                if user is not None:
                    protected.add(user)
        for unit in units:
            if protected.intersection(unit):
                protected.update(unit)
        selected = set(protected) if self.recent_only else set(range(len(messages)))
        for unit in units:
            if estimate_tokens([messages[i] for i in sorted(selected)]) <= policy.max_tokens:
                break
            if not protected.intersection(unit):
                selected.difference_update(unit)
        result = [messages[i] for i in sorted(selected)]
        if self.fail_on_overflow and estimate_tokens(result) > policy.max_tokens:
            raise ContextBudgetExceeded("protected context exceeds estimated token budget")
        return result
