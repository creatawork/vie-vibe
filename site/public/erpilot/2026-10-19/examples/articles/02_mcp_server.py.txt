"""Reproduce the article's MCP error response without a model or existing database."""

import asyncio
import json
from pathlib import Path
from tempfile import TemporaryDirectory

from erp_store.seed import seed_database
from fastmcp import Client
from mcp_erp.server import create_server


async def main() -> None:
    with TemporaryDirectory(prefix="erpilot-mcp-article-") as folder:
        db = Path(folder) / "erp.db"
        seed_database(db)
        async with Client(create_server(db)) as client:
            result = await client.call_tool("get_order", {"order_id": "123"})
        print(json.dumps(result.data, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
