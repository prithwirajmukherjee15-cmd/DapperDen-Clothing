// Product search that understands how shoppers type: several words ("anime oversized"),
// everyday names ("tshirt", "kicks", "trackpants") and a price cap ("hoodie under 1500").

const CATEGORY_WORDS = {
  "t-shirts": "tee tees tshirt tshirts t-shirt t-shirts",
  oversized: "oversized tee tees tshirt tshirts t-shirt baggy",
  hoodies: "hoodie hoodies sweatshirt sweatshirts hooded jumper",
  joggers: "jogger joggers pants trackpants trousers track lowers",
  shirts: "shirt shirts",
  dresses: "dress dresses co-ord coord",
  accessories: "accessory accessories",
};
const GENDER_WORDS = {
  men: "men mens man male guys",
  women: "women womens woman ladies female girls",
  kids: "kids kid children child boys girls baby",
};
const SYNONYMS = { "t": "", shirt: "shirt", tshirt: "tshirt", kicks: "sneakers", shoes: "sneakers", shoe: "sneakers", sneaker: "sneakers", cap: "caps", hat: "caps" };
const STOP = new Set(["a", "an", "the", "for", "in", "with", "and", "of", "to", "me", "my", "buy", "online", "price", "rs", "inr", "size", "best", "new", "cheap", "show", "want", "i"]);
// Colours aren't catalogue fields, so they rank results but never filter everything out.
const COLOURS = new Set(["black", "white", "grey", "gray", "blue", "red", "green", "pink", "purple", "yellow", "orange", "brown", "beige", "navy", "maroon", "cream"]);

const haystack = (p) =>
  [p.name, p.category, CATEGORY_WORDS[p.category] || "", p.gender || "men", GENDER_WORDS[p.gender || "men"] || "",
    p.collection.replace(/-/g, " "), /sneaker/i.test(p.name) ? "sneakers shoes footwear" : "", /cap\b/i.test(p.name) ? "caps hat" : ""]
    .join(" ").toLowerCase();

export function parseQuery(q) {
  let text = (q || "").toLowerCase().replace(/₹/g, " ").replace(/t[\s-]shirts?/g, "tshirt");
  let maxPrice = null;
  const m = text.match(/(?:under|below|less than|upto|up to|within|<)\s*(\d{3,5})/);
  if (m) { maxPrice = Number(m[1]); text = text.replace(m[0], " "); }
  const words = text.split(/[^a-z0-9-]+/).filter(Boolean)
    .map((w) => (w in SYNONYMS ? SYNONYMS[w] : w)).filter((w) => w && !STOP.has(w) && !/^\d+$/.test(w));
  return { words, maxPrice };
}

const wordMatch = (hay, w) => {
  const re = (t) => new RegExp(`(^|[^a-z])${t.replace(/[-]/g, "\\-")}`);
  return re(w).test(hay) || (w.length > 3 && w.endsWith("s") && re(w.slice(0, -1)).test(hay));
};

export function searchCatalog(products, q) {
  const { words, maxPrice } = parseQuery(q);
  if (!words.length && maxPrice == null) return [];
  const must = words.filter((w) => !COLOURS.has(w));
  const colours = words.filter((w) => COLOURS.has(w));
  return products
    .map((p, i) => ({ p, i, hay: haystack(p) }))
    .filter(({ p, hay }) => (maxPrice == null || p.price <= maxPrice) && must.every((w) => wordMatch(hay, w)))
    .map((r) => ({ ...r, score: colours.filter((c) => wordMatch(r.hay, c)).length * 2 + must.filter((w) => wordMatch(r.p.name.toLowerCase(), w)).length }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .map((r) => r.p);
}
