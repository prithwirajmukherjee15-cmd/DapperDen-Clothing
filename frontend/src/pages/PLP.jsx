import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, Check } from "lucide-react";
import { CATEGORIES_BY_GENDER, COLLECTIONS, GENDER_LABELS } from "../mock/mock";
import { useData } from "../context/DataContext";
import ProductCard from "../components/ProductCard";
import Reveal from "../components/Reveal";

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-11Y", "12-13Y", "UK6", "UK7", "UK8", "UK9", "UK10", "UK11", "One Size"];
const TYPE_LABELS = { "t-shirts": "T-shirts", oversized: "Oversized", hoodies: "Hoodies", joggers: "Joggers", shirts: "Shirts", dresses: "Dresses", accessories: "Accessories" };
const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "rating", label: "Top Rated" },
  { id: "discount", label: "Biggest Discount" },
];

export default function PLP({ mode, gender = "men" }) {
  const params = useParams();
  const { products, getProductsByCategory, getProductsByCollection } = useData();
  const slug = mode === "collection" ? params.slug : params.category;

  const meta =
    mode === "collection"
      ? COLLECTIONS.find((c) => c.slug === slug)
      : (CATEGORIES_BY_GENDER[gender] || CATEGORIES_BY_GENDER.men).find((c) => c.slug === slug);

  const base = useMemo(() => {
    if (!slug) return products;
    return mode === "collection" ? getProductsByCollection(slug) : getProductsByCategory(slug, gender);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, mode, gender, products]);

  const [sizes, setSizes] = useState([]);
  const [types, setTypes] = useState([]);
  const [genders, setGenders] = useState([]);
  // Filter options come from what's actually on this page (kids ages, shoe sizes, the types in a collection).
  const sizeOpts = useMemo(() => SIZE_ORDER.filter((s) => base.some((p) => p.sizes.includes(s))), [base]);
  const typeOpts = useMemo(() => [...new Set(base.map((p) => p.category))], [base]);
  const genderOpts = useMemo(() => ["men", "women", "kids"].filter((g) => base.some((p) => (p.gender || "men") === g)), [base]);
  const [maxPrice, setMaxPrice] = useState(3600);
  const [sort, setSort] = useState("featured");
  const [mobileFilter, setMobileFilter] = useState(false);

  const filtered = useMemo(() => {
    let list = base.filter((p) => p.price <= maxPrice);
    if (sizes.length) list = list.filter((p) => sizes.some((s) => p.sizes.includes(s)));
    if (types.length) list = list.filter((p) => types.includes(p.category));
    if (genders.length) list = list.filter((p) => genders.includes(p.gender || "men"));
    switch (sort) {
      case "price-asc": list = [...list].sort((a, b) => a.price - b.price); break;
      case "price-desc": list = [...list].sort((a, b) => b.price - a.price); break;
      case "rating": list = [...list].sort((a, b) => b.rating - a.rating); break;
      case "discount": list = [...list].sort((a, b) => b.discount - a.discount); break;
      default: break;
    }
    return list;
  }, [base, sizes, types, genders, maxPrice, sort]);

  const toggle = (arr, set, val) =>
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  const clearAll = () => { setSizes([]); setTypes([]); setGenders([]); setMaxPrice(3600); };
  const Chips = ({ label, opts, value, set, name = (o) => o }) => (
    <div>
      <p className="mb-3 font-grotesk text-xs font-bold uppercase tracking-wider text-[#8b8b93]">{label}</p>
      <div className="flex flex-wrap gap-2">
        {opts.map((o) => (
          <button key={o} onClick={() => toggle(value, set, o)} aria-pressed={value.includes(o)}
            className={`rounded-md border px-3 py-1.5 text-sm font-medium transition ${value.includes(o) ? "border-lime bg-lime text-[#0a0a0b]" : "border-[#2a2a30] text-white hover:border-lime"}`}>
            {name(o)}
          </button>
        ))}
      </div>
    </div>
  );

  const title = meta ? meta.name : "All Products";
  const banner = mode === "collection" && meta ? meta.banner : null;

  const FilterPanel = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="font-grotesk font-semibold text-white">Filters</h3>
        <button onClick={clearAll} className="text-xs text-lime hover:underline">Clear all</button>
      </div>
      {genderOpts.length > 1 && <Chips label="For" opts={genderOpts} value={genders} set={setGenders} name={(g) => GENDER_LABELS[g]} />}
      {typeOpts.length > 1 && <Chips label="Type" opts={typeOpts} value={types} set={setTypes} name={(t) => TYPE_LABELS[t] || t} />}
      {sizeOpts.length > 1 && <Chips label="Size" opts={sizeOpts} value={sizes} set={setSizes} />}
      <div>
        <p className="mb-3 font-grotesk text-xs font-bold uppercase tracking-wider text-[#8b8b93]">Max Price</p>
        <input type="range" min="600" max="3600" step="100" value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[#c6ff3d]" />
        <p className="mt-2 text-sm text-white">Up to ₹{maxPrice.toLocaleString("en-IN")}</p>
      </div>
    </div>
  );

  return (
    <div>
      {banner ? (
        <section className="relative h-[34vh] min-h-[260px] overflow-hidden">
          <img src={banner} alt={title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end">
            <div className="mx-auto w-full max-w-7xl px-5 pb-8">
              <span className="font-grotesk text-sm uppercase tracking-widest" style={{ color: meta.accent }}>{meta.tagline}</span>
              <h1 className="font-display text-6xl text-white">{title.toUpperCase()}</h1>
            </div>
          </div>
        </section>
      ) : (
        <div className="mx-auto max-w-7xl px-5 pt-10">
          <p className="font-grotesk text-sm text-[#8b8b93]">{GENDER_LABELS[gender]} / {title}</p>
          <h1 className="mt-1 font-display text-5xl text-white">{title.toUpperCase()}</h1>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-5 py-8">
        <div className="flex items-center justify-between gap-4 border-b border-[#2a2a30] pb-4">
          <button onClick={() => setMobileFilter(true)} className="flex items-center gap-2 rounded-lg border border-[#2a2a30] px-4 py-2 text-sm text-white lg:hidden">
            <SlidersHorizontal size={16} /> Filters
          </button>
          <p className="hidden text-sm text-[#8b8b93] lg:block">{filtered.length} products</p>
          <div className="flex items-center gap-2">
            <label htmlFor="plp-sort" className="text-sm text-[#8b8b93]">Sort:</label>
            <select id="plp-sort" value={sort} onChange={(e) => setSort(e.target.value)}
              className="rounded-lg border border-[#2a2a30] bg-[#131316] px-3 py-2 text-sm text-white outline-none focus:border-lime">
              {SORTS.map((s) => (<option key={s.id} value={s.id} className="bg-[#131316]">{s.label}</option>))}
            </select>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="hidden lg:block"><FilterPanel /></aside>
          <div>
            {filtered.length ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3">
                {filtered.map((p, idx) => (
                  <Reveal key={p.id} delay={(idx % 3) * 0.05}><ProductCard product={p} /></Reveal>
                ))}
              </div>
            ) : (
              <div className="grid place-items-center rounded-2xl border border-dashed border-[#2a2a30] py-24 text-center">
                <p className="font-grotesk text-lg text-white">No products match your filters</p>
                <button onClick={clearAll} className="mt-3 rounded-full bg-lime px-5 py-2 text-sm font-bold text-[#0a0a0b]">Reset filters</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileFilter && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileFilter(false)} className="fixed inset-0 z-50 bg-black/60" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 260 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-3xl border-t border-[#2a2a30] bg-[#0a0a0b] p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-2xl text-white">FILTERS</h3>
                <button onClick={() => setMobileFilter(false)} aria-label="Close filters"><X className="text-white" /></button>
              </div>
              <FilterPanel />
              <button onClick={() => setMobileFilter(false)} className="mt-6 w-full rounded-full bg-lime py-3 font-bold text-[#0a0a0b]">
                Show {filtered.length} results
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
