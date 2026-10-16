import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, Tag, ArrowRight, ShoppingBag, Gift, Truck, Loader2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatINR } from "../mock/mock";
import { useData } from "../context/DataContext";
import api from "../api";
import ProductCard from "../components/ProductCard";
import { FREE_SHIPPING_MIN, SHIPPING_FEE, DELIVERY_TEXT, colourLabel } from "../lib/store";

export default function Cart() {
  const navigate = useNavigate();
  const { items, updateQty, removeFromCart, subtotal, mrpTotal, replaceCart } = useCart();
  const { products } = useData();
  const [params, setParams] = useSearchParams();
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState(null);
  const [msg, setMsg] = useState("");
  const [notice, setNotice] = useState("");
  const [checking, setChecking] = useState(false);
  const [slow, setSlow] = useState(false);
  const referral = (() => { try { return localStorage.getItem("dd_ref") || ""; } catch { return ""; } })();

  // "Complete your order" links from the bag-reminder email refill the bag.
  useEffect(() => {
    const id = params.get("restore");
    if (!id) return;
    api.get(`/checkouts/${encodeURIComponent(id)}`)
      .then((res) => { replaceCart(res.data.items); setNotice("Welcome back. We've saved your bag just as you left it."); })
      .catch(() => setNotice("That bag link has expired, but everything is still in stock."))
      .finally(() => setParams({}, { replace: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A friend's referral link (?ref=CODE) is remembered and applied here automatically.
  useEffect(() => {
    if (referral && !applied && subtotal >= 999) applyCoupon(referral);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referral, subtotal]);

  const applyCoupon = async (override) => {
    const value = typeof override === "string" ? override : code.trim();
    if (typeof override === "string") setCode(override);
    if (!value || checking) return;
    setChecking(true); setMsg("");
    // The API sleeps when idle and can take up to a minute to wake; say so instead of looking frozen.
    const t = setTimeout(() => setSlow(true), 4000);
    try {
      const res = await api.post("/coupon/validate", { code: value, subtotal });
      if (!res.data.valid) { setMsg(res.data.message || "Invalid coupon"); setApplied(null); return; }
      setApplied({ code: res.data.code, label: res.data.label, discount: res.data.discount });
    } catch {
      setMsg("Could not check that code. Please try again.");
    } finally {
      clearTimeout(t); setChecking(false); setSlow(false);
    }
  };

  const discount = applied ? applied.discount : 0;
  const shipping = subtotal >= FREE_SHIPPING_MIN || subtotal === 0 ? 0 : SHIPPING_FEE;
  const total = Math.max(0, subtotal - discount) + shipping;
  const toFree = Math.max(0, FREE_SHIPPING_MIN - subtotal);
  // Suggest pieces from the same section as the bag (kids for a kids bag), cheapest first when they'd unlock free shipping.
  const inBag = new Set(items.map((i) => i.id));
  const bagGender = (() => {
    const g = items.map((i) => (products.find((p) => p.id === i.id) || {}).gender || "men");
    return g.sort((a, b) => g.filter((x) => x === b).length - g.filter((x) => x === a).length)[0] || "men";
  })();
  const pool = products.filter((p) => (p.gender || "men") === bagGender && !inBag.has(p.id));
  const upsell = (toFree > 0 ? pool.filter((p) => p.price >= toFree).sort((a, b) => a.price - b.price) : pool.filter((p) => p.badge)).slice(0, 4);

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
      {notice && <p className="mb-4 rounded-xl border border-lime/40 bg-lime/10 px-4 py-3 text-sm text-lime" data-testid="restore-notice">{notice}</p>}
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
                    <button onClick={() => removeFromCart(it.key)} aria-label={`Remove ${it.name}`} className="text-[#8b8b93] hover:text-magenta"><Trash2 size={18} /></button>
                  </div>
                  <p className="mt-1 text-sm text-[#8b8b93]">Size {it.size}{colourLabel(it.color) ? ` • ${colourLabel(it.color)}` : ""}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="inline-flex items-center rounded-lg border border-[#2a2a30]">
                      <button onClick={() => updateQty(it.key, it.qty - 1)} aria-label={`Decrease quantity of ${it.name}`} className="grid h-8 w-8 place-items-center text-white hover:text-lime"><Minus size={14} /></button>
                      <span className="w-8 text-center text-sm text-white">{it.qty}</span>
                      <button onClick={() => updateQty(it.key, Math.min(20, it.qty + 1))} aria-label={`Increase quantity of ${it.name}`} className="grid h-8 w-8 place-items-center text-white hover:text-lime"><Plus size={14} /></button>
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
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code" aria-label="Coupon code"
                onKeyDown={(e) => { if (e.key === "Enter") applyCoupon(); }}
                className="w-full bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-[#8b8b93]" />
            </div>
            <button onClick={() => applyCoupon()} disabled={checking} data-testid="coupon-apply"
              className="inline-flex items-center gap-1.5 rounded-lg bg-lime px-4 text-sm font-bold text-[#0a0a0b] disabled:opacity-70">
              {checking ? <><Loader2 size={14} className="animate-spin" /> Checking</> : "Apply"}
            </button>
          </div>
          {slow && <p className="mt-2 text-xs text-[#8b8b93]" role="status">Waking our server. This can take up to a minute the first time.</p>}
          {msg && <p className="mt-2 text-xs text-magenta" role="alert">{msg}</p>}
          {applied && <p className="mt-2 text-xs text-lime">Applied {applied.code} — {applied.label}</p>}
          <p className="mt-2 text-xs text-[#8b8b93]">Try: DAPPER10, STREET20, FLAT300</p>
          {referral && !applied && subtotal < 999 && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-lime"><Gift size={13} /> Your friend's code {referral} gives ₹200 off orders above ₹999.</p>
          )}

          <div className="mt-5 rounded-lg border border-[#2a2a30] p-3 text-xs" data-testid="free-ship-progress">
            {toFree > 0 ? (
              <>
                <p className="text-white">Add <b className="text-lime">{formatINR(toFree)}</b> more for free delivery</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#2a2a30]">
                  <div className="h-full rounded-full bg-lime" style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_MIN) * 100)}%` }} />
                </div>
                <p className="mt-1.5 text-[#8b8b93]">Free delivery on orders over {formatINR(FREE_SHIPPING_MIN)} (after product discounts).</p>
              </>
            ) : (
              <p className="text-lime">You've unlocked free delivery.</p>
            )}
            <p className="mt-2 flex items-center gap-1.5 text-[#c9c9cf]"><Truck size={13} className="text-lime" /> {DELIVERY_TEXT}</p>
          </div>

          <div className="mt-5 space-y-3 border-t border-[#2a2a30] pt-5 text-sm">
            <Row l="Subtotal (MRP)" v={formatINR(mrpTotal)} muted />
            <Row l="Product discount" v={"-" + formatINR(mrpTotal - subtotal)} lime />
            <Row l="Subtotal" v={formatINR(subtotal)} />
            {discount > 0 && <Row l={`Coupon (${applied.code})`} v={"-" + formatINR(discount)} lime />}
            <Row l="Shipping" v={shipping === 0 ? "FREE" : formatINR(shipping)} />
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-[#2a2a30] pt-4">
            <span className="font-grotesk text-lg font-semibold text-white">Total</span>
            <span className="font-display text-2xl text-white">{formatINR(total)}</span>
          </div>
          <p className="mt-2 text-right text-xs text-lime" data-testid="prepaid-hint">Pay online at checkout and save ₹50 more</p>
          <button onClick={() => navigate("/checkout", { state: { total, discount, shipping, subtotal, coupon: applied?.code || null } })}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-lime py-3.5 font-grotesk font-bold text-[#0a0a0b] transition hover:bg-lime-dim">
            Proceed to Checkout <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="font-display text-3xl text-white">{toFree > 0 ? "ADD ONE, SHIP FREE" : "COMPLETE THE LOOK"}</h2>
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
