import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Package, Heart, MapPin, LogOut, ShoppingBag, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { PRODUCTS, formatINR } from "../mock/mock";
import ProductCard from "../components/ProductCard";

const MOCK_ORDERS = [
  { id: "DD418209", date: "12 Jul 2026", status: "Delivered", total: 3598, items: 2, img: PRODUCTS[0].images[0] },
  { id: "DD417755", date: "28 Jun 2026", status: "In Transit", total: 2299, items: 1, img: PRODUCTS[2].images[0] },
];

export default function Account() {
  const { user, login, logout } = useAuth();
  const { wishlist } = useCart();
  const [tab, setTab] = useState("orders");

  const wishItems = PRODUCTS.filter((p) => wishlist.includes(p.id));

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-5 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full rounded-3xl border border-[#2a2a30] bg-[#131316] p-8">
          <span className="font-display text-3xl text-white">DAPPER<span className="text-lime">DEN</span></span>
          <h1 className="mt-6 font-display text-3xl text-white">WELCOME BACK</h1>
          <p className="mt-2 text-sm text-[#8b8b93]">Sign in to track orders, save your wishlist and check out faster.</p>
          <button
            onClick={() => login({ name: "Street Legend", email: "legend@dapperden.com", avatar: "" })}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-full bg-white py-3.5 font-grotesk font-semibold text-[#0a0a0b] transition hover:bg-[#e9e9e9]">
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 5.1 29.4 3 24 3 12.9 3 4 11.9 4 23s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-2.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 5.1 29.4 3 24 3 16.3 3 9.7 7.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 43c5.2 0 9.9-2 13.5-5.2l-6.2-5.3C29.2 34 26.7 35 24 35c-5.3 0-9.7-2.6-11.3-7l-6.5 5C9.6 38.6 16.2 43 24 43z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4 5.3l6.2 5.3C41.4 35.7 44 30.2 44 23c0-1.3-.1-2.3-.4-2.5z"/></svg>
            Continue with Google
          </button>
          <p className="mt-4 text-xs text-[#8b8b93]">Demo sign-in for now — real Google login connects in the backend phase.</p>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: "orders", label: "Orders", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "address", label: "Addresses", icon: MapPin },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside>
          <div className="rounded-2xl border border-[#2a2a30] bg-[#131316] p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-lime font-display text-xl text-[#0a0a0b]">
                {user.name[0]}
              </div>
              <div className="min-w-0">
                <p className="truncate font-grotesk font-semibold text-white">{user.name}</p>
                <p className="truncate text-xs text-[#8b8b93]">{user.email}</p>
              </div>
            </div>
            <nav className="mt-5 space-y-1">
              {tabs.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-grotesk transition ${tab === t.id ? "bg-lime text-[#0a0a0b] font-bold" : "text-[#c9c9cf] hover:bg-[#1c1c21]"}`}>
                  <t.icon size={18} /> {t.label}
                  {t.id === "wishlist" && wishItems.length > 0 && (
                    <span className={`ml-auto rounded-full px-2 text-xs ${tab === t.id ? "bg-[#0a0a0b] text-lime" : "bg-magenta text-white"}`}>{wishItems.length}</span>
                  )}
                </button>
              ))}
              <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-grotesk text-[#8b8b93] transition hover:bg-[#1c1c21] hover:text-magenta">
                <LogOut size={18} /> Sign Out
              </button>
            </nav>
          </div>
        </aside>

        <div>
          {tab === "orders" && (
            <div>
              <h2 className="font-display text-3xl text-white">MY ORDERS</h2>
              <div className="mt-6 space-y-4">
                {MOCK_ORDERS.map((o) => (
                  <div key={o.id} className="flex items-center gap-4 rounded-2xl border border-[#2a2a30] bg-[#131316] p-4">
                    <img src={o.img} alt="" className="h-16 w-14 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="font-grotesk font-semibold text-white">Order #{o.id}</p>
                      <p className="text-sm text-[#8b8b93]">{o.date} • {o.items} item(s)</p>
                    </div>
                    <div className="text-right">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${o.status === "Delivered" ? "bg-lime/15 text-lime" : "bg-magenta/15 text-magenta"}`}>{o.status}</span>
                      <p className="mt-1 font-grotesk font-semibold text-white">{formatINR(o.total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "wishlist" && (
            <div>
              <h2 className="font-display text-3xl text-white">WISHLIST</h2>
              {wishItems.length ? (
                <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3">
                  {wishItems.map((p) => (<ProductCard key={p.id} product={p} />))}
                </div>
              ) : (
                <div className="mt-6 grid place-items-center rounded-2xl border border-dashed border-[#2a2a30] py-16 text-center">
                  <Heart size={40} className="text-[#2a2a30]" />
                  <p className="mt-3 text-white">Your wishlist is empty</p>
                  <Link to="/men" className="mt-3 rounded-full bg-lime px-5 py-2 text-sm font-bold text-[#0a0a0b]">Discover products</Link>
                </div>
              )}
            </div>
          )}

          {tab === "address" && (
            <div>
              <h2 className="font-display text-3xl text-white">SAVED ADDRESSES</h2>
              <div className="mt-6 rounded-2xl border border-[#2a2a30] bg-[#131316] p-5">
                <div className="flex items-center gap-2"><MapPin size={16} className="text-lime" /><span className="font-grotesk font-semibold text-white">Home</span></div>
                <p className="mt-2 text-sm text-[#c9c9cf]">221B Street Style Lane, Bandra West, Mumbai, Maharashtra – 400050</p>
                <p className="mt-1 text-sm text-[#8b8b93]">Phone: +91 98765 43210</p>
              </div>
            </div>
          )}

          {tab === "profile" && (
            <div>
              <h2 className="font-display text-3xl text-white">PROFILE</h2>
              <div className="mt-6 max-w-md space-y-4 rounded-2xl border border-[#2a2a30] bg-[#131316] p-6">
                <div><p className="text-xs text-[#8b8b93]">Name</p><p className="text-white">{user.name}</p></div>
                <div><p className="text-xs text-[#8b8b93]">Email</p><p className="text-white">{user.email}</p></div>
                <div><p className="text-xs text-[#8b8b93]">Member since</p><p className="text-white">July 2026</p></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
