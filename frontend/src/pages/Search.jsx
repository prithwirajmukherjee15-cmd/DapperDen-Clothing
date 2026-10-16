import React, { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { useData } from "../context/DataContext";
import { parseQuery } from "../lib/search";
import { formatINR } from "../mock/mock";
import ProductCard from "../components/ProductCard";
import Reveal from "../components/Reveal";

const GENDERS = [["all", "All"], ["men", "Men"], ["women", "Women"], ["kids", "Kids"]];
const SORTS = [["relevance", "Best match"], ["price-asc", "Price: low to high"], ["price-desc", "Price: high to low"]];

export default function Search() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const q = params.get("q") || "";
  const [text, setText] = useState(q);
  const [gender, setGender] = useState("all");
  const [sort, setSort] = useState("relevance");
  const { searchProducts } = useData();
  useEffect(() => { setText(q); setGender("all"); }, [q]);

  const all = searchProducts(q);
  const { maxPrice } = parseQuery(q);
  let results = gender === "all" ? all : all.filter((p) => (p.gender || "men") === gender);
  if (sort !== "relevance") results = [...results].sort((a, b) => (sort === "price-asc" ? a.price - b.price : b.price - a.price));
  const counts = Object.fromEntries(GENDERS.map(([k]) => [k, k === "all" ? all.length : all.filter((p) => (p.gender || "men") === k).length]));

  const submit = (e) => { e.preventDefault(); if (text.trim()) navigate(`/search?q=${encodeURIComponent(text.trim())}`); };

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <form onSubmit={submit} role="search" className="flex max-w-xl items-center gap-2 rounded-full border border-[#2a2a30] bg-[#131316] px-4 py-2.5 focus-within:border-lime">
        <SearchIcon size={18} className="text-[#8b8b93]" aria-hidden="true" />
        <input value={text} onChange={(e) => setText(e.target.value)} type="search" aria-label="Search products" data-testid="search-page-input"
          placeholder="Try: oversized anime tee, hoodie under 1500" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#8b8b93]" />
        <button type="submit" className="rounded-full bg-lime px-4 py-1.5 text-xs font-bold text-[#0a0a0b]">Search</button>
      </form>
      <h1 className="mt-6 font-display text-4xl text-white sm:text-5xl">“{q}”</h1>
      <p className="mt-2 text-sm text-[#8b8b93]">
        {results.length} {results.length === 1 ? "product" : "products"} found{maxPrice ? ` under ${formatINR(maxPrice)}` : ""}
      </p>

      {all.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {GENDERS.filter(([k]) => counts[k] > 0).map(([k, label]) => (
            <button key={k} onClick={() => setGender(k)} aria-pressed={gender === k}
              className={`rounded-full border px-3.5 py-1.5 font-grotesk text-xs font-semibold transition ${gender === k ? "border-lime bg-lime text-[#0a0a0b]" : "border-[#2a2a30] text-white hover:border-lime"}`}>
              {label} ({counts[k]})
            </button>
          ))}
          <label className="ml-auto flex items-center gap-2 text-sm text-[#8b8b93]">
            Sort:
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="rounded-lg border border-[#2a2a30] bg-[#131316] px-3 py-1.5 text-sm text-white outline-none focus:border-lime">
              {SORTS.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
            </select>
          </label>
        </div>
      )}

      {results.length ? (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {results.map((p, idx) => (
            <Reveal key={p.id} delay={(idx % 4) * 0.05}><ProductCard product={p} showGender /></Reveal>
          ))}
        </div>
      ) : (
        <div className="mt-12 grid place-items-center rounded-2xl border border-dashed border-[#2a2a30] py-20 text-center">
          <p className="font-grotesk text-lg text-white">Nothing matches “{q}”</p>
          <p className="mt-1 max-w-sm text-sm text-[#8b8b93]">Try a type (tee, hoodie, joggers, sneakers), a collection (anime, cosmic) or a budget (under 1500).</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link to="/men" className="rounded-full bg-lime px-5 py-2 text-sm font-bold text-[#0a0a0b]">Men</Link>
            <Link to="/women" className="rounded-full border border-[#2a2a30] px-5 py-2 text-sm font-bold text-white">Women</Link>
            <Link to="/kids" className="rounded-full border border-[#2a2a30] px-5 py-2 text-sm font-bold text-white">Kids</Link>
          </div>
        </div>
      )}
    </div>
  );
}
