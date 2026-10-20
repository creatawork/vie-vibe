"""Check same-token replay, conflict and lookup on a disposable ERP database."""

import json
from pathlib import Path
from tempfile import TemporaryDirectory

from erp_store.db import make_engine
from erp_store.mutations import ErpMutations, MutationError
from erp_store.repository import ErpRepository
from erp_store.seed import seed_database


def main() -> None:
    with TemporaryDirectory(prefix="erpilot-idempotency-article-") as folder:
        db = Path(folder) / "erp.db"
        seed_database(db)
        engine = make_engine(db)
        try:
            repo = ErpRepository(engine)
            mutations = ErpMutations(engine)
            before = repo.get_stock("A1001").quantity
            token = "article-fixed-operation"
            first = mutations.adjust_stock("A1001", 5, client_token=token)
            replay = mutations.adjust_stock("A1001", 5, client_token=token)
            status, _ = mutations.lookup_result(
                "adjust_stock", {"sku": "A1001", "delta": 5}, token
            )
            conflict = None
            try:
                mutations.adjust_stock("A1001", 6, client_token=token)
            except MutationError as exc:
                conflict = exc.code
            after = repo.get_stock("A1001").quantity
            print(json.dumps({
                "observed_delta": after - before,
                "replay_same_result": replay == first,
                "lookup_status": status,
                "different_arguments": conflict,
            }, ensure_ascii=False, indent=2))
        finally:
            engine.dispose()


if __name__ == "__main__":
    main()
