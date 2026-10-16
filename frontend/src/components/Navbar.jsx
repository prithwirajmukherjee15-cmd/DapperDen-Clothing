import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Heart, PackageSearch, Menu, X, ChevronDown } from "lucide-react";
import { CATEGORIES_BY_GENDER, COLLECTIONS, formatINR } from "../mock/mock";
import { useData } from "../context/DataContext";
import { useCart } from "../context/CartContext";

const GENDERS = [
  { key: "men", label: "Men" },
  { key: "women", label: "Women" },
  { key: "kids", label: "Kids" },
];
const FEATURE = {
  men: { img: COLLECTIONS[0].banner, title: "COSMIC HEROES", to: "/collection/cosmic-heroes" },
  women: { img: "https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=800&q=80", title: "DRESSES & CO-ORDS", to: "/women/dresses" },
  kids: { img: "https://images.unsplash.com/photo-1611428813653-aa606c998586?w=800&q=80", title: "LITTLE LEGENDS", to: "/kids/t-shirts" },
};

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { count, wishlist } = useCart();
  const { searchProducts } = useData();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGender, setOpenGender] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const boxRef = useRef(null);
  const mobileBoxRef = useRef(null);
  const menuBtnRef = useRef(null);
  const drawerRef = useRef(null);

  const results = searchProducts(q).slice(0, 5);

  useEffect(() => {
    const h = (e) => {
      const inBox = [boxRef, mobileBoxRef].some((r) => r.current && r.current.contains(e.target));
      if (!inBox) setFocus(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    if (q.trim()) {
      navigate(`/search?q=${encodeURIComponent(q.trim())}`);
      setFocus(false);
      setMobileSearch(false);
      setMenuOpen(false);
    }
  };

  // Close the menu and mobile search on navigation.
  useEffect(() => { setMenuOpen(false); setMobileSearch(false); }, [location.pathname]);

  // Menu drawer: focus moves into it, Tab stays inside, Escape closes it and focus returns to the menu button.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => drawerRef.current?.querySelector("button, a, input")?.focus(), 50);
    const onKey = (e) => {
      if (e.key === "Escape") { setMenuOpen(false); return; }
      if (e.key !== "Tab" || !drawerRef.current) return;
      const nodes = drawerRef.current.querySelectorAll("a[href], button, input");
      if (!nodes.length) return;
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    const btn = menuBtnRef.current;
    return () => { clearTimeout(t); document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; btn?.focus(); };
  }, [menuOpen]);

  const suggestions = (onPick) => (
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
                onClick={onPick}
                className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-[#1c1c21]"
              >
                <img src={p.images[0]} alt="" className="h-12 w-10 rounded object-cover" />
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">{p.name}</p>
                  <p className="text-xs text-lime">{formatINR(p.price)} <span className="capitalize text-[#8b8b93]">· {p.gender || "men"}</span></p>
                </div>
              </Link>
            ))
          ) : (
            <p className="px-4 py-4 text-sm text-[#8b8b93]">No matches for “{q}”</p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  const searchForm = (autoFocus) => (
    <form onSubmit={submitSearch} role="search" className="flex items-center gap-2 rounded-full border border-[#2a2a30] bg-[#131316] px-4 py-2 transition focus-within:border-lime">
      <Search size={16} className="text-[#8b8b93]" aria-hidden="true" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setFocus(true)}
        autoFocus={autoFocus}
        type="search"
        aria-label="Search products"
        placeholder="Search the drip..."
        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#8b8b93]"
      />
    </form>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-[#2a2a30] bg-[#0a0a0b]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-4">
        <button ref={menuBtnRef} className="lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu"
          aria-expanded={menuOpen} aria-controls="mobile-menu" data-testid="nav-menu">
          <Menu className="text-white" />
        </button>

        <Link to="/" className="font-display text-2xl tracking-wide text-white shrink-0">
          DAPPER<span className="text-lime">DEN</span>
        </Link>

        {/* Desktop gender nav with animated underline + mega menus */}
        <nav className="ml-6 hidden items-center gap-1 lg:flex" onMouseLeave={() => { setHovered(null); setOpenGender(null); }}>
          {GENDERS.map((g) => {
            const active = location.pathname.startsWith(`/${g.key}`);
            return (
              <div
                key={g.key}
                className="relative"
                onMouseEnter={() => { setHovered(g.key); setOpenGender(g.key); }}
              >
                <motion.div whileTap={{ scale: 0.92 }} className="relative">
                  <Link
                    to={`/${g.key}`}
                    className={`flex items-center gap-1 px-3 py-2 font-grotesk text-sm font-medium transition ${active || hovered === g.key ? "text-lime" : "text-white"}`}
                  >
                    {g.label}
                    <ChevronDown size={14} className={`transition-transform ${openGender === g.key ? "rotate-180" : ""}`} />
                  </Link>
                  {(hovered === g.key || (active && !hovered)) && (
                    <motion.span
                      layoutId="navUnderline"
                      className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-lime"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.div>

                <AnimatePresence>
                  {openGender === g.key && (
                    <motion.div
                      initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute left-0 top-full z-50 w-[720px] pt-4"
                    >
                      <div className="grid grid-cols-3 gap-6 rounded-2xl border border-[#2a2a30] bg-[#131316] p-6 dd-shadow">
                        <div>
                          <p className="mb-3 font-grotesk text-xs font-bold uppercase tracking-wider text-lime">Categories</p>
                          <ul className="space-y-1">
                            {(CATEGORIES_BY_GENDER[g.key] || []).map((c, i) => (
                              <motion.li key={c.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                                <Link to={`/${g.key}/${c.slug}`} className="block rounded-md px-2 py-1.5 text-sm text-[#c9c9cf] transition hover:bg-[#1c1c21] hover:text-white">
                                  {c.name}
                                </Link>
                              </motion.li>
                            ))}
                            {g.key === "men" && (
                              <motion.li initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.24 }}>
                                <Link to="/men/accessories" className="block rounded-md px-2 py-1.5 text-sm text-[#c9c9cf] transition hover:bg-[#1c1c21] hover:text-white">Accessories</Link>
                              </motion.li>
                            )}
                          </ul>
                        </div>
                        <div>
                          <p className="mb-3 font-grotesk text-xs font-bold uppercase tracking-wider text-lime">Collections</p>
                          <ul className="space-y-1">
                            {COLLECTIONS.map((c, i) => (
                              <motion.li key={c.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                                <Link to={`/collection/${c.slug}`} className="block rounded-md px-2 py-1.5 text-sm text-[#c9c9cf] transition hover:bg-[#1c1c21] hover:text-white">
                                  {c.name}
                                </Link>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                        <Link to={FEATURE[g.key].to} className="group relative overflow-hidden rounded-xl">
                          <img src={FEATURE[g.key].img} alt="featured" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
                          <div className="absolute bottom-3 left-3">
                            <p className="font-grotesk text-xs text-lime">Featured</p>
                            <p className="font-display text-lg text-white">{FEATURE[g.key].title}</p>
                          </div>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Search */}
        <div ref={boxRef} className="relative ml-auto hidden max-w-xs flex-1 md:block">
          {searchForm(false)}
          {suggestions(() => setFocus(false))}
        </div>

        <div className="ml-auto flex items-center gap-4 md:ml-0">
          <Link to="/drop" data-testid="nav-drop"
            className="hidden rounded-full border border-lime/60 px-3 py-1 font-grotesk text-xs font-bold uppercase tracking-wider text-lime transition hover:bg-lime hover:text-[#0a0a0b] md:inline-block">
            Friday drop
          </Link>
          <button onClick={() => { setMobileSearch((v) => !v); setFocus(true); }} className="text-white transition hover:text-lime md:hidden"
            aria-label="Search" aria-expanded={mobileSearch} data-testid="nav-search-mobile">
            <Search size={20} />
          </button>
          <motion.div whileTap={{ scale: 0.8 }} className="relative hidden sm:block">
            <Link to="/track" className="text-white transition hover:text-lime" aria-label="Track order" title="Track order" data-testid="nav-track-order">
              <PackageSearch size={20} />
            </Link>
          </motion.div>
          <motion.div whileTap={{ scale: 0.8 }} className="relative">
            <Link to="/wishlist" className="text-white transition hover:text-lime" aria-label="Wishlist" data-testid="nav-wishlist">
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-magenta px-1 text-[10px] font-bold text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>
          </motion.div>
          <motion.div whileTap={{ scale: 0.8 }} className="relative">
            <Link to="/cart" className="text-white transition hover:text-lime" aria-label={count ? `Bag, ${count} items` : "Bag"}>
              <ShoppingBag size={20} />
              {count > 0 && (
                <motion.span key={count} initial={{ scale: 0.4 }} animate={{ scale: 1 }} className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-lime px-1 text-[10px] font-bold text-[#0a0a0b]">
                  {count}
                </motion.span>
              )}
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Mobile search */}
      {mobileSearch && (
        <div ref={mobileBoxRef} className="relative mx-auto max-w-7xl px-5 pb-3 md:hidden" data-testid="mobile-search">
          {searchForm(true)}
          {suggestions(() => { setFocus(false); setMobileSearch(false); })}
        </div>
      )}

      {/* Mobile drawer. Rendered into <body>: the header's backdrop blur would otherwise clip a fixed child to the header's height. */}
      {createPortal(
        <AnimatePresence>
          {menuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 z-[60] bg-black/60 lg:hidden"
              />
              <motion.aside
                ref={drawerRef} id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" data-testid="mobile-menu"
                initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 260 }}
                className="fixed inset-y-0 left-0 z-[60] w-80 max-w-[85vw] overflow-y-auto border-r border-[#2a2a30] bg-[#0a0a0b] p-6 lg:hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl text-white">DAPPER<span className="text-lime">DEN</span></span>
                  <button onClick={() => setMenuOpen(false)} aria-label="Close menu"><X className="text-white" /></button>
                </div>
                <div className="relative mt-5">{searchForm(false)}</div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link to="/drop" className="rounded-full border border-lime/60 px-3 py-1 font-grotesk text-xs font-bold uppercase tracking-wider text-lime">Friday drop</Link>
                  <Link to="/men/accessories" className="rounded-full border border-[#2a2a30] px-3 py-1 font-grotesk text-xs font-semibold text-white">Sneakers &amp; caps</Link>
                  <Link to="/track" className="rounded-full border border-[#2a2a30] px-3 py-1 font-grotesk text-xs font-semibold text-white">Track order</Link>
                </div>
                {GENDERS.map((g) => (
                  <div key={g.key} className="mt-7">
                    <Link to={`/${g.key}`} className="font-display text-xl text-lime">{g.label.toUpperCase()}</Link>
                    <ul className="mt-3 space-y-2.5">
                      {(CATEGORIES_BY_GENDER[g.key] || []).map((c) => (
                        <li key={c.id}><Link to={`/${g.key}/${c.slug}`} aria-label={`${g.label} ${c.name}`} className="text-sm text-[#c9c9cf]">{c.name}</Link></li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div className="mt-7">
                  <p className="font-display text-xl text-lime">COLLECTIONS</p>
                  <ul className="mt-3 space-y-2.5">
                    {COLLECTIONS.map((c) => (
                      <li key={c.id}><Link to={`/collection/${c.slug}`} className="text-sm text-[#c9c9cf]">{c.name}</Link></li>
                    ))}
                  </ul>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </header>
  );
}
