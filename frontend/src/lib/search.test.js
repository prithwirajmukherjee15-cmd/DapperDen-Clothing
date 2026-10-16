import { searchCatalog, parseQuery } from "./search";
import catalog from "../mock/catalog.json";

const names = (q) => searchCatalog(catalog, q).map((p) => p.name);

test("matches every word, not the whole phrase", () => {
  const r = names("anime oversized");
  expect(r.length).toBeGreaterThan(0);
  r.forEach((n) => expect(n).toMatch(/Oversized/));
});

test("understands everyday names for products", () => {
  expect(names("black tshirt").length).toBeGreaterThan(10);
  expect(names("t-shirt")).toEqual(names("tshirt"));
  expect(names("kicks")).toEqual(expect.arrayContaining(["Astro Trail Sneakers", "Volt Runner Sneakers"]));
  expect(names("tshirt")).not.toContain("Eclipse Hooded Sweatshirt");
});

test("reads a price cap", () => {
  expect(parseQuery("hoodie under 1500")).toEqual({ words: ["hoodie"], maxPrice: 1500 });
  searchCatalog(catalog, "hoodie under 1500").forEach((p) => {
    expect(p.price).toBeLessThanOrEqual(1500);
    expect(p.category).toBe("hoodies");
  });
});

test("keeps men and women apart", () => {
  searchCatalog(catalog, "men joggers").forEach((p) => expect(p.gender).toBe("men"));
});

test("returns nothing for nonsense or an empty query", () => {
  expect(names("xyzzy")).toEqual([]);
  expect(names("  ")).toEqual([]);
});
