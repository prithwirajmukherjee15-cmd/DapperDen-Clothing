import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, PackageSearch } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useData } from "../context/DataContext";
import ProductCard from "../components/ProductCard";

export default function Wishlist() {
  const { wishlist } = useCart();
  const { products } = useData();
  const wishItems = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <h1 className="flex items-center gap-3 font-display text-4xl text-white">
          <Heart size={30} className="text-magenta" /> WISHLIST
          {wishItems.length > 0 && <span className="text-lime">({wishItems.length})</span>}
        </h1>
        <Link to="/track" data-testid="wishlist-track-link" className="hidden items-center gap-2 rounded-full border border-[#2a2a30] px-5 py-2.5 text-sm font-semibold text-white transition hover:border-lime sm:flex">
          <PackageSearch size={16} /> Track an Order
        </Link>
      </motion.div>

      {wishItems.length ? (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4" data-testid="wishlist-grid">
          {wishItems.map((p) => (<ProductCard key={p.id} product={p} />))}
        </div>
      ) : (
        <div className="mt-8 grid place-items-center rounded-3xl border border-dashed border-[#2a2a30] py-20 text-center">
          <Heart size={48} className="text-[#2a2a30]" />
          <h2 className="mt-4 font-display text-3xl text-white">NOTHING SAVED YET</h2>
          <p className="mt-2 text-[#8b8b93]">Tap the heart on any product to stash it here.</p>
          <Link to="/men" className="mt-5 rounded-full bg-lime px-7 py-3 font-bold text-[#0a0a0b]">Discover products</Link>
        </div>
      )}
    </div>
  );
}
