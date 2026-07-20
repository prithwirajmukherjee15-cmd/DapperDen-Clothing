import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { searchProducts } from "../mock/mock";
import ProductCard from "../components/ProductCard";
import Reveal from "../components/Reveal";

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const results = searchProducts(q);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <div className="flex items-center gap-3 text-[#8b8b93]">
        <SearchIcon size={18} />
        <p className="font-grotesk text-sm">Search results for</p>
      </div>
      <h1 className="mt-1 font-display text-5xl text-white">“{q}”</h1>
      <p className="mt-2 text-sm text-[#8b8b93]">{results.length} products found</p>

      {results.length ? (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {results.map((p, idx) => (
            <Reveal key={p.id} delay={(idx % 4) * 0.05}><ProductCard product={p} /></Reveal>
          ))}
        </div>
      ) : (
        <div className="mt-16 grid place-items-center rounded-2xl border border-dashed border-[#2a2a30] py-24 text-center">
          <p className="font-grotesk text-lg text-white">Nothing matches “{q}”</p>
          <p className="mt-1 text-sm text-[#8b8b93]">Try searching for tees, hoodies, joggers or a collection.</p>
          <Link to="/men" className="mt-4 rounded-full bg-lime px-5 py-2 text-sm font-bold text-[#0a0a0b]">Browse Men</Link>
        </div>
      )}
    </div>
  );
}
