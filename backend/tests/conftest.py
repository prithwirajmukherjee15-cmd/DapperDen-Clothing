import os
import sys
from pathlib import Path

import pytest

# server.py reads these at import time; the offline tests swap in a fake DB.
os.environ.setdefault("MONGO_URL", "mongodb://localhost:27017")
os.environ.setdefault("DB_NAME", "dapperden_test")
os.environ["RESEND_API_KEY"] = ""
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))


UNIQUE = {"orders": ["order_id", "referral_code"], "coupons": ["code"], "checkouts": ["checkout_id"]}


def _get(doc, path):
    for part in path.split("."):
        if not isinstance(doc, dict) or part not in doc:
            return None
        doc = doc[part]
    return doc


def _match(doc, query):
    for key, cond in (query or {}).items():
        if key == "$or":
            if not any(_match(doc, q) for q in cond):
                return False
            continue
        val = _get(doc, key)
        if isinstance(cond, dict) and any(k.startswith("$") for k in cond):
            for op, arg in cond.items():
                ok = {"$gte": lambda: val is not None and val >= arg, "$lte": lambda: val is not None and val <= arg,
                      "$gt": lambda: val is not None and val > arg, "$lt": lambda: val is not None and val < arg,
                      "$ne": lambda: val != arg, "$in": lambda: val in arg,
                      "$type": lambda: isinstance(val, str) if arg == "string" else True}[op]()
                if not ok:
                    return False
        elif val != cond:
            return False
    return True


def _project(doc, projection):
    doc = {k: v for k, v in doc.items() if k != "_id"}
    if not projection:
        return doc
    keep = [k for k, v in projection.items() if v and k != "_id"]
    if keep:
        return {k: doc[k] for k in keep if k in doc}
    return {k: v for k, v in doc.items() if projection.get(k, 1)}


class Result:
    def __init__(self, n):
        self.modified_count = self.matched_count = n


class FakeCollection:
    """Just enough of a Motor collection for the API: equality, $or, ranges, $set/$push/$inc, upserts."""

    def __init__(self, name):
        self.name, self.docs = name, []

    async def create_index(self, *args, **kwargs):
        return "idx"

    async def insert_one(self, doc):
        from pymongo.errors import DuplicateKeyError

        for field in UNIQUE.get(self.name, []):
            if doc.get(field) is not None and any(d.get(field) == doc[field] for d in self.docs):
                raise DuplicateKeyError(f"duplicate {field}")
        self.docs.append(dict(doc))
        doc["_id"] = object()

    async def find_one(self, query, projection=None):
        doc = next((d for d in self.docs if _match(d, query)), None)
        return _project(doc, projection) if doc else None

    def _apply(self, doc, update):
        doc.update(update.get("$set", {}))
        for k, v in update.get("$push", {}).items():
            doc.setdefault(k, []).append(v)
        for k, v in update.get("$inc", {}).items():
            doc[k] = doc.get(k, 0) + v

    async def update_one(self, query, update, upsert=False):
        doc = next((d for d in self.docs if _match(d, query)), None)
        if doc is None:
            if upsert:
                new = {k: v for k, v in query.items() if not k.startswith("$")}
                self._apply(new, update)
                self.docs.append(new)
            return Result(0)
        self._apply(doc, update)
        return Result(1)

    async def update_many(self, query, update):
        hits = [d for d in self.docs if _match(d, query)]
        for d in hits:
            self._apply(d, update)
        return Result(len(hits))

    async def count_documents(self, query):
        return sum(1 for d in self.docs if _match(d, query))

    def find(self, query=None, projection=None):
        return FakeCursor([_project(d, projection) for d in self.docs if _match(d, query)])


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
        self._cols = {}

    def __getattr__(self, name):
        if name.startswith("_"):
            raise AttributeError(name)
        return self._cols.setdefault(name, FakeCollection(name))

    async def command(self, name):
        return {"ok": 1}


@pytest.fixture
def client(monkeypatch):
    from fastapi.testclient import TestClient
    import server

    fake = FakeDB()
    monkeypatch.setattr(server, "db", fake)
    with TestClient(server.app) as c:
        c.fake_db = fake
        yield c
