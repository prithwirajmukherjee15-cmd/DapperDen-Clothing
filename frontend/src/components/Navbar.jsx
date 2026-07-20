import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown } from "lucide-react";
import { CATEGORIES, COLLECTIONS, searchProducts, formatINR } from "../mock/mock";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { count, wishlist } = useCart();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mega, setMega] = useState(false);
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const boxRef = useRef(null);

  const results = searchProducts(q).slice(0, 5);

  useEffect(() => {
    const h = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setFocus(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    if (q.trim()) {
      navigate(`/search?q=${encodeURIComponent(q.trim())}`);
      setFocus(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#2a2a30] bg-[#0a0a0b]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-4">
        <button className="lg:hidden" onClick={() => setMenuOpen(true)} aria-label="menu">
          <Menu className="text-white" />
        </button>

        <Link to="/" className="font-display text-2xl tracking-wide text-white shrink-0">
          DAPPER<span className="text-lime">DEN</span>
        </Link>

        <nav className="ml-6 hidden items-center gap-6 lg:flex">
          <div
            className="relative"
            onMouseEnter={() => setMega(true)}
            onMouseLeave={() => setMega(false)}
          >
            <button className="flex items-center gap-1 font-grotesk text-sm font-medium text-white transition hover:text-lime">
              <Link to="/men">Men</Link>
              <ChevronDown size={14} />
            </button>
            <AnimatePresence>
              {mega && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-1/2 top-full z-50 w-[720px] -translate-x-1/3 pt-4"
                >
                  <div className="grid grid-cols-3 gap-6 rounded-2xl border border-[#2a2a30] bg-[#131316] p-6 dd-shadow">
                    <div>
                      <p className="mb-3 font-grotesk text-xs font-bold uppercase tracking-wider text-lime">Categories</p>
                      <ul className="space-y-2">
                        {CATEGORIES.map((c) => (
                          <li key={c.id}>
                            <Link to={`/men/${c.slug}`} className="text-sm text-[#c9c9cf] transition hover:text-white">
                              {c.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-3 font-grotesk text-xs font-bold uppercase tracking-wider text-lime">Collections</p>
                      <ul className="space-y-2">
                        {COLLECTIONS.map((c) => (
                          <li key={c.id}>
                            <Link to={`/collection/${c.slug}`} className="text-sm text-[#c9c9cf] transition hover:text-white">
                              {c.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Link to="/collection/cosmic-heroes" className="group relative overflow-hidden rounded-xl">
                      <img src={COLLECTIONS[0].banner} alt="featured" className="h-full w-full object-cover transition group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-3 left-3">
                        <p className="font-grotesk text-xs text-lime">Featured</p>
                        <p className="font-display text-lg text-white">COSMIC HEROES</p>
                      </div>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Link to="/collection/anime-legends" className="font-grotesk text-sm font-medium text-white transition hover:text-lime">Anime</Link>
          <Link to="/collection/neon-dreams" className="font-grotesk text-sm font-medium text-white transition hover:text-lime">Neon Dreams</Link>
          <Link to="/men/oversized" className="font-grotesk text-sm font-medium text-magenta transition hover:text-lime">Oversized</Link>
        </nav>

        <div ref={boxRef} className="relative ml-auto hidden max-w-xs flex-1 md:block">
          <form onSubmit={submitSearch} className="flex items-center gap-2 rounded-full border border-[#2a2a30] bg-[#131316] px-4 py-2">
            <Search size={16} className="text-[#8b8b93]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setFocus(true)}
              placeholder="Search the drip..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#8b8b93]"
            />
          </form>
          <AnimatePresence>
            {focus && q.trim() && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-[#2a2a30] bg-[#131316] dd-shadow"
              >
                {results.length ? (
                  results.map((p) => (
                    <Link
                      key={p.id}
                      to={`/product/${p.slug}`}
                      onClick={() => setFocus(false)}
                      className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-[#1c1c21]"
                    >
                      <img src={p.images[0]} alt={p.name} className="h-12 w-10 rounded object-cover" />
                      <div className="min-w-0">
                        <p className="truncate text-sm text-white">{p.name}</p>
                        <p className="text-xs text-lime">{formatINR(p.price)}</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="px-4 py-4 text-sm text-[#8b8b93]">No matches for “{q}”</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/account" className="relative hidden text-white transition hover:text-lime sm:block" aria-label="account">
            <User size={20} />
            {user && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-lime" />}
          </Link>
          <Link to="/account" className="relative text-white transition hover:text-lime" aria-label="wishlist">
            <Heart size={20} />
            {wishlist.length > 0 && (
              <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-magenta px-1 text-[10px] font-bold text-white">
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link to="/cart" className="relative text-white transition hover:text-lime" aria-label="cart">
            <ShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-lime px-1 text-[10px] font-bold text-[#0a0a0b]">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 left-0 z-50 w-80 overflow-y-auto border-r border-[#2a2a30] bg-[#0a0a0b] p-6 lg:hidden"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-2xl text-white">DAPPER<span className="text-lime">DEN</span></span>
                <button onClick={() => setMenuOpen(false)}><X className="text-white" /></button>
              </div>
              <p className="mt-8 font-grotesk text-xs font-bold uppercase tracking-wider text-lime">Categories</p>
              <ul className="mt-3 space-y-3">
                {CATEGORIES.map((c) => (
                  <li key={c.id}><Link onClick={() => setMenuOpen(false)} to={`/men/${c.slug}`} className="text-white">{c.name}</Link></li>
                ))}
              </ul>
              <p className="mt-8 font-grotesk text-xs font-bold uppercase tracking-wider text-lime">Collections</p>
              <ul className="mt-3 space-y-3">
                {COLLECTIONS.map((c) => (
                  <li key={c.id}><Link onClick={() => setMenuOpen(false)} to={`/collection/${c.slug}`} className="text-white">{c.name}</Link></li>
                ))}
              </ul>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
