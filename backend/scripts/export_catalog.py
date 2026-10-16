"""Write the storefront's bundled copy of the catalogue (frontend/src/mock/catalog.json).

The storefront shows this copy until the API answers, so the two must match. Run it after changing catalog.py:

    python backend/scripts/export_catalog.py
"""
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "backend"))

import catalog  # noqa: E402

OUT = ROOT / "frontend" / "src" / "mock" / "catalog.json"


def render():
    return json.dumps(catalog.PRODUCTS, ensure_ascii=False, separators=(",", ":")) + "\n"


if __name__ == "__main__":
    OUT.write_text(render(), encoding="utf-8")
    print(f"Wrote {len(catalog.PRODUCTS)} products to {OUT.relative_to(ROOT)}")
