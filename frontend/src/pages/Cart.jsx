import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, Tag, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { COUPONS, formatINR, PRODUCTS } from "../mock/mock";
import ProductCard from "../components/ProductCard";

export default function Cart() {
  const navigate = useNavigate();
  const { items, updateQty, removeFromCart, subtotal, mrpTotal } = useCart();
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState(null);
  const [msg, setMsg] = useState("");

  const applyCoupon = () => {
    const c = COUPONS[code.trim().toUpperCase()];
    if (!c) { setMsg("Invalid coupon code"); setApplied(null); return; }
    if (c.min && subtotal < c.min) { setMsg(`Add items worth ${formatINR(c.min - subtotal)} more`); setApplied(null); return; }
    setApplied({ code: code.trim().toUpperCase(), ...c });
    setMsg("");
  };

  const discount = applied ? (applied.type === "percent" ? Math.round((subtotal * applied.value) / 100) : applied.value) : 0;
  const shipping = subtotal >= 1499 || subtotal === 0 ? 0 : 99;
  const total = Math.max(0, subtotal - discount) + shipping;
  const upsell = PRODUCTS.filter((p) => p.badge === "New").slice(0, 4);

  if (!items.length) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-20">
        <div className="grid place-items-center rounded-3xl border border-dashed border-[#2a2a30] py-20 text-center">
          <ShoppingBag size={48} className="text-[#2a2a30]" />
          <h1 className="mt-4 font-display text-4xl text-white">YOUR BAG IS EMPTY</h1>
          <p className="mt-2 text-[#8b8b93]">Time to fill it with some heat.</p>
          <Link to="/men" className="mt-5 rounded-full bg-lime px-7 py-3 font-bold text-[#0a0a0b]">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <h1 className="font-display text-5xl text-white">YOUR BAG <span className="text-lime">({items.length})</span></h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Items */}
        <div className="space-y-4">
          <AnimatePresence>
            {items.map((it) => (
              <motion.div key={it.key} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -30 }}
                className="flex gap-4 rounded-2xl border border-[#2a2a30] bg-[#131316] p-4">
                <Link to={`/product/${it.slug}`} className="h-28 w-24 shrink-0 overflow-hidden rounded-lg">
                  <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/product/${it.slug}`} className="font-grotesk font-medium text-white hover:text-lime">{it.name}</Link>
                    <button onClick={() => removeFromCart(it.key)} className="text-[#8b8b93] hover:text-magenta"><Trash2 size={18} /></button>
                  </div>
                  <p className="mt-1 text-sm text-[#8b8b93]">Size {it.size} • {it.color}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="inline-flex items-center rounded-lg border border-[#2a2a30]">
                      <button onClick={() => updateQty(it.key, it.qty - 1)} className="grid h-8 w-8 place-items-center text-white hover:text-lime"><Minus size={14} /></button>
                      <span className="w-8 text-center text-sm text-white">{it.qty}</span>
                      <button onClick={() => updateQty(it.key, it.qty + 1)} className="grid h-8 w-8 place-items-center text-white hover:text-lime"><Plus size={14} /></button>
                    </div>
                    <div className="text-right">
                      <span className="font-grotesk font-semibold text-white">{formatINR(it.price * it.qty)}</span>
                      <span className="ml-2 text-xs text-[#8b8b93] line-through">{formatINR(it.mrp * it.qty)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="h-fit rounded-2xl border border-[#2a2a30] bg-[#131316] p-6 lg:sticky lg:top-24">
          <h2 className="font-grotesk text-lg font-semibold text-white">Order Summary</h2>
          <div className="mt-4 flex gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-[#2a2a30] px-3">
              <Tag size={16} className="text-lime" />
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code"
                className="w-full bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-[#8b8b93]" />
            </div>
            <button onClick={applyCoupon} className="rounded-lg bg-lime px-4 text-sm font-bold text-[#0a0a0b]">Apply</button>
          </div>
          {msg && <p className="mt-2 text-xs text-magenta">{msg}</p>}
          {applied && <p className="mt-2 text-xs text-lime">Applied {applied.code} — {applied.label}</p>}
          <p className="mt-2 text-xs text-[#8b8b93]">Try: DAPPER10, STREET20, FLAT300</p>

          <div className="mt-5 space-y-3 border-t border-[#2a2a30] pt-5 text-sm">
            <Row l="Subtotal (MRP)" v={formatINR(mrpTotal)} muted />
            <Row l="Product discount" v={"-" + formatINR(mrpTotal - subtotal)} lime />
            {discount > 0 && <Row l={`Coupon (${applied.code})`} v={"-" + formatINR(discount)} lime />}
            <Row l="Shipping" v={shipping === 0 ? "FREE" : formatINR(shipping)} />
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-[#2a2a30] pt-4">
            <span className="font-grotesk text-lg font-semibold text-white">Total</span>
            <span className="font-display text-2xl text-white">{formatINR(total)}</span>
          </div>
          <button onClick={() => navigate("/checkout", { state: { total, discount, shipping } })}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-lime py-3.5 font-grotesk font-bold text-[#0a0a0b] transition hover:bg-lime-dim">
            Proceed to Checkout <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="font-display text-3xl text-white">COMPLETE THE LOOK</h2>
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
          {upsell.map((p) => (<ProductCard key={p.id} product={p} />))}
        </div>
      </section>
    </div>
  );
}

function Row({ l, v, muted, lime }) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? "text-[#8b8b93]" : "text-[#c9c9cf]"}>{l}</span>
      <span className={lime ? "text-lime" : "text-white"}>{v}</span>
    </div>
  );
}
