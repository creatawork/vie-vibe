"""Experimental Chinese BM25 and reciprocal rank fusion; no runtime default changes.

Scores belong to distinct spaces. RRF scores are never passed off as the cosine
similarities in ``rag.index.Hit`` or in policy evidence cards.
"""

import hashlib
import math
import re
import unicodedata
from collections import Counter
from collections.abc import Sequence
from dataclasses import dataclass, field

from rag.chunk import Chunk

TOKENIZER_VERSION = "nfkc-cjk-bigrams-ascii-1"
RANKER_VERSION = "bm25-rrf-1"
_TOKENS = re.compile(r"[\u3400-\u9fff]+|[a-z0-9]+(?:[_.-][a-z0-9]+)*")


def tokenize(text: str) -> list[str]:
    tokens = []
    for part in _TOKENS.findall(unicodedata.normalize("NFKC", text).casefold()):
        if "\u3400" <= part[0] <= "\u9fff" and len(part) > 1:
            tokens.extend(part[i:i + 2] for i in range(len(part) - 1))
        else:
            tokens.append(part)
    return tokens


def chunk_id(chunk: Chunk) -> str:
    return hashlib.sha256(chunk.model_dump_json().encode("utf-8")).hexdigest()


@dataclass(frozen=True)
class RankedHit:
    chunk: Chunk
    score: float
    components: dict[str, float] = field(default_factory=dict)
    ranks: dict[str, int] = field(default_factory=dict)


class BM25Index:
    """Body-only BM25, positive IDF, k1=1.2 / b=0.75; query terms counted once."""

    def __init__(self, chunks: Sequence[Chunk], *, k1: float = 1.2, b: float = 0.75):
        if (isinstance(k1, bool) or not math.isfinite(k1) or k1 <= 0
                or isinstance(b, bool) or not math.isfinite(b) or not 0 <= b <= 1):
            raise ValueError("invalid BM25 parameters")
        self.chunks = list(chunks)
        self.ids = [chunk_id(chunk) for chunk in chunks]
        if len(set(self.ids)) != len(self.ids):
            raise ValueError("duplicate chunks")
        self.counts = [Counter(tokenize(chunk.text)) for chunk in chunks]
        self.lengths = [sum(counts.values()) for counts in self.counts]
        self.average_length = sum(self.lengths) / len(chunks) if chunks else 0.0
        self.df = Counter(term for counts in self.counts for term in counts)
        self.k1, self.b = k1, b

    def search(self, query: str, *, k: int = 3, allowed: set[str] | None = None) -> list[RankedHit]:
        if type(k) is not int or k <= 0:
            raise ValueError("k must be a positive integer")
        terms = sorted(set(tokenize(query)))
        if not terms or not self.average_length:
            return []
        hits = []
        for chunk, key, counts, length in zip(
            self.chunks, self.ids, self.counts, self.lengths, strict=True,
        ):
            if allowed is not None and key not in allowed:
                continue
            score = 0.0
            for term in terms:
                frequency = counts[term]
                if frequency:
                    idf = math.log1p((len(self.chunks) - self.df[term] + 0.5)
                                    / (self.df[term] + 0.5))
                    denominator = frequency + self.k1 * (
                        1 - self.b + self.b * length / self.average_length
                    )
                    score += idf * frequency * (self.k1 + 1) / denominator
            if score > 0:
                hits.append(RankedHit(chunk, score, {"bm25": score}))
        hits.sort(key=lambda hit: (-hit.score, chunk_id(hit.chunk)))
        return [RankedHit(h.chunk, h.score, h.components, {"bm25": rank})
                for rank, h in enumerate(hits[:k], 1)]


def reciprocal_rank_fusion(
    rankings: dict[str, Sequence[RankedHit]], *, rank_constant: int = 60, k: int = 3,
) -> list[RankedHit]:
    if type(rank_constant) is not int or rank_constant < 0 or type(k) is not int or k <= 0:
        raise ValueError("invalid RRF parameters")
    fused: dict[str, RankedHit] = {}
    for method, ranking in rankings.items():
        seen = set()
        for rank, hit in enumerate(ranking, 1):
            key = chunk_id(hit.chunk)
            if key in seen or not math.isfinite(hit.score):
                raise ValueError("rankings require unique chunks and finite scores")
            seen.add(key)
            old = fused.get(key, RankedHit(hit.chunk, 0.0))
            fused[key] = RankedHit(
                hit.chunk, old.score + 1 / (rank_constant + rank),
                {**old.components, method: hit.score}, {**old.ranks, method: rank},
            )
    return sorted(fused.values(), key=lambda hit: (-hit.score, chunk_id(hit.chunk)))[:k]
