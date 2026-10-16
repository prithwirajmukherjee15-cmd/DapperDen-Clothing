import os
import sys
from pathlib import Path

import pytest

# server.py reads these at import time; the offline tests swap in a fake DB.
os.environ.setdefault("MONGO_URL", "mongodb://localhost:27017")
os.environ.setdefault("DB_NAME", "dapperden_test")
os.environ["RESEND_API_KEY"] = ""
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))


class FakeOrders:
    """Just enough of a Motor collection for the order routes."""

    def __init__(self):
        self.docs = {}

    async def create_index(self, *args, **kwargs):
        return "order_id_1"

    async def insert_one(self, doc):
        from pymongo.errors import DuplicateKeyError

        if doc["order_id"] in self.docs:
            raise DuplicateKeyError("duplicate order_id")
        self.docs[doc["order_id"]] = dict(doc)
        doc["_id"] = object()

    async def find_one(self, query, projection=None):
        doc = self.docs.get(query.get("order_id"))
        return dict(doc) if doc else None

    async def update_one(self, query, update):
        doc = self.docs[query["order_id"]]
        doc.update(update.get("$set", {}))
        for k, v in update.get("$push", {}).items():
            doc.setdefault(k, []).append(v)

    def find(self, query=None, projection=None):
        return FakeCursor(list(self.docs.values()))


class FakeCursor:
    def __init__(self, docs):
        self.docs = docs

    def sort(self, key, direction):
        self.docs.sort(key=lambda d: d[key], reverse=direction < 0)
        return self

    def limit(self, n):
        self.docs = self.docs[:n]
        return self

    async def to_list(self, n):
        return [dict(d) for d in self.docs[:n]]


class FakeDB:
    def __init__(self):
        self.orders = FakeOrders()


@pytest.fixture
def client(monkeypatch):
    from fastapi.testclient import TestClient
    import server

    fake = FakeDB()
    monkeypatch.setattr(server, "db", fake)
    with TestClient(server.app) as c:
        c.fake_db = fake
        yield c
