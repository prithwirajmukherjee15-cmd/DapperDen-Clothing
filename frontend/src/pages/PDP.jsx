import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Heart, ShoppingBag, Truck, RotateCcw, ShieldCheck, ChevronRight, Ruler, Minus, Plus, X, Check, Banknote } from "lucide-react";
import { formatINR } from "../mock/mock";
import { useData } from "../context/DataContext";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import Reveal from "../components/Reveal";
import { useToast } from "../hooks/use-toast";
import api from "../api";
import { FREE_SHIPPING_MIN, DELIVERY_TEXT } from "../lib/store";

const FITS = {
  "t-shirts": "Regular fit. Take your usual size.",
  oversized: "Oversized fit with dropped shoulders. Take your usual size for the boxy look, or size down for a closer fit.",
  hoodies: "Relaxed fit with room to layer. Take your usual size.",
  joggers: "Tapered leg with an elastic waist and drawcord. Take your usual waist size.",
  shirts: "Relaxed camp-collar fit. Take your usual size.",
  dresses: "Relaxed fit. Between sizes? Size down for a closer fit.",
};
const SHOE_CHART = { cols: ["UK", "EU", "US (men)", "Foot length (cm)"], unit: "foot length, heel to longest toe", rows: [["UK6","40","7","24.5"],["UK7","41","8","25.4"],["UK8","42","9","26.2"],["UK9","43","10","27.1"],["UK10","44.5","11","27.9"],["UK11","46","12","28.8"]], tip: "True to size. Wide feet? Go half a size up, or a full size if you're between sizes." };
const CHARTS = {
  men: { cols: ["Size", "Chest", "Length"], unit: "body chest and garment length, in inches", rows: [["XS","36","26"],["S","38","27"],["M","40","28"],["L","42","29"],["XL","44","30"],["XXL","46","31"]], tip: "Measure around the fullest part of your chest and pick the size that matches." },
  women: { cols: ["Size", "Bust", "Waist"], unit: "body measurements, in inches", rows: [["XS","32","25"],["S","34","27"],["M","36","29"],["L","38","31"],["XL","40","33"],["XXL","42","35"]], tip: "Between sizes? Size up for a relaxed fit, down for a fitted look." },
  kids: { cols: ["Age", "Height (cm)", "Chest"], unit: "child's age, height and chest", rows: [["2-3Y","92-98","21\""],["4-5Y","104-110","23\""],["6-7Y","116-122","25\""],["8-9Y","128-134","27\""],["10-11Y","140-146","29\""],["12-13Y","152-158","31\""]], tip: "Kids grow fast. Size up if they're between ages." },
};
const REVIEWS = {
  tee: [["Arjun M.", 5, "Fabric is genuinely heavyweight and the print hasn't cracked after a dozen washes."], ["Rohan K.", 4, "Crisp print. Slightly boxy, but that's the look."], ["Neha S.", 5, "Got my usual size and it fits exactly like the chart says."]],
  hoodies: [["Kabir A.", 5, "Thick, warm and the hood actually holds its shape."], ["Isha P.", 4, "Roomy enough to layer over a tee. Sleeves are a touch long."], ["Dev R.", 5, "Print still sharp after a month of daily wear."]],
  joggers: [["Aman T.", 5, "Comfortable waistband and the taper looks clean with sneakers."], ["Riya D.", 4, "Soft fleece. I'd size down if you're between sizes."], ["Varun G.", 5, "Pockets are deep enough for a phone. Wear them all day."]],
  shirts: [["Sameer J.", 5, "Light and breathable, good for Indian summers."], ["Ananya R.", 4, "Nice drape. Iron it once and it stays crisp."], ["Rahul V.", 5, "The print looks even better in person."]],
  dresses: [["Meher K.", 5, "Flowy and comfortable, true to the size chart."], ["Tanvi S.", 4, "Fabric is soft. Slightly long on me at 5'2\"."], ["Aditi N.", 5, "Got compliments the first time I wore it."]],
  sneakers: [["Dev S.", 5, "True to size and light on the feet. Good grip."], ["Karan M.", 4, "Comfortable from day one. The toe box is a little narrow."], ["Aditya P.", 5, "Look exactly like the photos and go with everything."]],
  accessories: [["Zoya F.", 5, "Solid build quality for the price."], ["Nikhil B.", 4, "Looks premium. Shipping was quick."], ["Sana Q.", 5, "Exactly as pictured. Would buy again."]],
  kids: [["Meera C.", 5, "Soft on the skin and survived a lot of washes."], ["Ritu A.", 5, "My son loves the print. The age sizing was spot on."], ["Pooja L.", 4, "Good quality. Sized up as the chart suggests and it fits well."]],
};
const isShoe = (p) => p.sizes.some((s) => /^UK\d/.test(s));
const reviewSet = (p) => (p.gender === "kids" ? "kids" : isShoe(p) ? "sneakers" : ["t-shirts", "oversized"].includes(p.category) ? "tee" : REVIEWS[p.category] ? p.category : "accessories");

export default function PDP() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getProduct, products } = useData();
  const product = getProduct(slug);
  const { addToCart, toggleWishlist, inWishlist } = useCart();

  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [sizeGuide, setSizeGuide] = useState(false);
  const [err, setErr] = useState(false);
  const [fit, setFit] = useState(null);
  const closeGuideRef = React.useRef(null);

  // Size guide: Escape closes it, and focus moves to its close button when it opens.
  useEffect(() => {
    if (!sizeGuide) return undefined;
    closeGuideRef.current?.focus();
    const onKey = (e) => { if (e.key === "Escape") setSizeGuide(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sizeGuide]);

  // Fit score from post-delivery feedback ("How did it fit?"); shown once enough buyers have answered.
  useEffect(() => {
    setFit(null);
    api.get(`/products/${slug}/fit`).then((r) => setFit(r.data.enough ? r.data : null)).catch(() => {});
  }, [slug]);

  if (!product) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-5 text-center">
        <div>
          <h1 className="font-display text-4xl text-white">PRODUCT NOT FOUND</h1>
          <Link to="/men" className="mt-4 inline-block rounded-full bg-lime px-6 py-2.5 font-bold text-[#0a0a0b]">Back to shop</Link>
        </div>
      </div>
    );
  }

  const wished = inWishlist(product.id);
  const related = products.filter((p) => p.collection === product.collection && p.id !== product.id).slice(0, 4);

  const handleAdd = (buyNow = false) => {
    if (!size) { setErr(true); return; }
    addToCart(product, size, "", qty);
    if (buyNow) navigate("/cart");
    else toast({ title: "Added to bag", description: `${product.name} • ${size}` });
  };

  const gender = product.gender || "men";
  const oneSize = product.sizes.length === 1;
  const chart = isShoe(product) ? SHOE_CHART : CHARTS[gender] || CHARTS.men;
  const fitNote = gender === "kids" ? "Comfortable regular fit, sized by age." : isShoe(product) ? "True to size." : FITS[product.category];
  const freeShip = product.price >= FREE_SHIPPING_MIN;

  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      <nav className="flex items-center gap-1 text-xs text-[#8b8b93]">
        <Link to="/" className="hover:text-lime">Home</Link><ChevronRight size={12} />
        <Link to={`/${gender}`} className="capitalize hover:text-lime">{gender}</Link><ChevronRight size={12} />
        <Link to={`/${gender}/${product.category}`} className="capitalize hover:text-lime">{product.category.replace(/-/g, " ")}</Link><ChevronRight size={12} />
        <span className="text-white">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-3">
            {product.images.map((img, i) => (
              <button key={i} onClick={() => setActiveImg(i)} aria-label={`View photo ${i + 1} of ${product.images.length}`} aria-pressed={activeImg === i}
                className={`h-20 w-16 overflow-hidden rounded-lg border-2 transition ${activeImg === i ? "border-lime" : "border-transparent opacity-60 hover:opacity-100"}`}>
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <motion.div key={activeImg} initial={{ opacity: 0.4, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
            className="relative flex-1 overflow-hidden rounded-2xl bg-[#131316]">
            <img src={product.images[activeImg]} alt={product.name} className="h-full max-h-[640px] w-full object-cover" />
            {product.badge && (
              <span className="absolute left-4 top-4 rounded-full bg-lime px-3 py-1 text-xs font-bold uppercase text-[#0a0a0b]">{product.badge}</span>
            )}
          </motion.div>
        </div>

        {/* Info */}
        <div>
          <Link to={`/collection/${product.collection}`} className="font-grotesk text-sm uppercase tracking-widest text-magenta hover:underline">
            {product.collection.replace(/-/g, " ")}
          </Link>
          <h1 className="mt-2 font-display text-4xl leading-tight text-white sm:text-5xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-md bg-lime/10 px-2 py-0.5 text-sm font-semibold text-lime">
              <Star size={12} className="fill-lime" /> {product.rating}
            </span>
            <span className="text-sm text-[#8b8b93]">{product.reviews} reviews</span>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <span className="font-display text-3xl text-white">{formatINR(product.price)}</span>
            <span className="text-lg text-[#8b8b93] line-through">{formatINR(product.mrp)}</span>
            <span className="rounded-md bg-magenta/15 px-2 py-1 text-sm font-bold text-magenta">{product.discount}% OFF</span>
          </div>
          <p className="mt-1 text-xs text-[#8b8b93]">Inclusive of all taxes</p>

          {/* Size */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-grotesk text-sm font-semibold text-white" id="size-label">{oneSize ? "Size" : "Select Size"}</p>
              {!oneSize && (
                <button onClick={() => setSizeGuide(true)} className="flex items-center gap-1 text-sm text-lime hover:underline" data-testid="size-guide-btn">
                  <Ruler size={14} /> Size Guide
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-labelledby="size-label">
              {product.sizes.map((s) => (
                <button key={s} onClick={() => { setSize(s); setErr(false); }} aria-pressed={size === s}
                  className={`h-11 w-14 rounded-lg border text-sm font-semibold transition ${size === s ? "border-lime bg-lime text-[#0a0a0b]" : "border-[#2a2a30] text-white hover:border-lime"}`}>
                  {s}
                </button>
              ))}
            </div>
            {err && <p className="mt-2 text-sm text-magenta" role="alert">Please select a size to continue.</p>}
            {fitNote && !fit && <p className="mt-3 text-sm text-[#8b8b93]" data-testid="fit-note"><span className="text-white">Fit:</span> {fitNote}</p>}
            {fit && (
              <p className="mt-3 flex items-center gap-1.5 text-sm text-[#c9c9cf]" data-testid="fit-score">
                <Ruler size={14} className="text-lime" />
                <span><b className="text-white">{fit.true_to_size}% say true to size</b> · {fit.runs_small}% small · {fit.runs_large}% big <span className="text-[#8b8b93]">({fit.responses} buyers)</span></span>
              </p>
            )}
          </div>

          {/* Qty */}
          <div className="mt-6">
            <p className="mb-2 font-grotesk text-sm font-semibold text-white">Quantity</p>
            <div className="inline-flex items-center rounded-lg border border-[#2a2a30]">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" className="grid h-10 w-10 place-items-center text-white hover:text-lime"><Minus size={16} /></button>
              <span className="w-10 text-center font-grotesk text-white" aria-live="polite">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="Increase quantity" className="grid h-10 w-10 place-items-center text-white hover:text-lime"><Plus size={16} /></button>
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button onClick={() => handleAdd(false)}
              className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-lime py-3.5 font-grotesk font-bold text-lime transition hover:bg-lime hover:text-[#0a0a0b]">
              <ShoppingBag size={18} /> Add to Bag
            </button>
            <button onClick={() => handleAdd(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-lime py-3.5 font-grotesk font-bold text-[#0a0a0b] transition hover:bg-lime-dim">
              Buy Now
            </button>
            <button onClick={() => toggleWishlist(product.id)} aria-label={wished ? "Remove from wishlist" : "Add to wishlist"} aria-pressed={wished}
              className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full border border-[#2a2a30] transition hover:border-magenta">
              <Heart size={20} className={wished ? "fill-magenta text-magenta" : "text-white"} />
            </button>
          </div>

          {/* Delivery and perks: the promise and its condition, where the shopper decides */}
          <div className="mt-6 rounded-xl border border-[#2a2a30] bg-[#131316] p-4 text-sm" data-testid="delivery-info">
            <p className="flex items-center gap-2 text-white"><Truck size={16} className="text-lime" /> {DELIVERY_TEXT}</p>
            <p className="mt-1.5 pl-6 text-[#8b8b93]">{freeShip ? "Free shipping on this item." : `Free shipping on orders over ${formatINR(FREE_SHIPPING_MIN)}. Below that it's ${formatINR(99)}.`}</p>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-[#2a2a30] pt-5">
            <Link to="/returns" className="flex flex-col items-center gap-1 text-center hover:text-lime">
              <RotateCcw size={20} className="text-lime" /><span className="text-xs text-[#c9c9cf]">15-day returns &amp; size exchange</span>
            </Link>
            <div className="flex flex-col items-center gap-1 text-center">
              <Banknote size={20} className="text-lime" /><span className="text-xs text-[#c9c9cf]">Cash on delivery</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <ShieldCheck size={20} className="text-lime" /><span className="text-xs text-[#c9c9cf]">Secure payment</span>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="font-grotesk font-semibold text-white">Product Details</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#c9c9cf]">{product.description}</p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16">
        <Reveal><h2 className="font-display text-3xl text-white">RATINGS & REVIEWS</h2></Reveal>
        <p className="mt-1 text-xs text-[#8b8b93]">Sample reviews: this is a demo store.</p>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {REVIEWS[reviewSet(product)].map(([n, r, t]) => ({ n, r, t })).map((rv) => (
            <Reveal key={rv.n}>
              <div className="rounded-2xl border border-[#2a2a30] bg-[#131316] p-5">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className={i < rv.r ? "fill-lime text-lime" : "text-[#2a2a30]"} />
                  ))}
                </div>
                <p className="mt-3 text-sm text-[#c9c9cf]">"{rv.t}"</p>
                <p className="mt-3 text-sm font-semibold text-white">{rv.n}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <Reveal><h2 className="font-display text-3xl text-white">YOU MIGHT ALSO LIKE</h2></Reveal>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {related.map((p, idx) => (<Reveal key={p.id} delay={(idx % 4) * 0.05}><ProductCard product={p} /></Reveal>))}
          </div>
        </section>
      )}

      {/* Size guide modal */}
      <AnimatePresence>
        {sizeGuide && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSizeGuide(false)} className="fixed inset-0 z-50 bg-black/70" />
            {/* Centred by a flex wrapper: Framer Motion's transform would override translate-based centring. */}
            <div className="pointer-events-none fixed inset-0 z-50 grid place-items-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              role="dialog" aria-modal="true" aria-labelledby="size-guide-title" data-testid="size-guide"
              className="pointer-events-auto max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#2a2a30] bg-[#131316] p-6">
              <div className="flex items-center justify-between">
                <h3 id="size-guide-title" className="font-display text-2xl text-white">SIZE GUIDE</h3>
                <button ref={closeGuideRef} onClick={() => setSizeGuide(false)} aria-label="Close size guide"><X className="text-white" /></button>
              </div>
              <p className="mt-1 text-sm text-[#8b8b93]">Measurements: {chart.unit}</p>
              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2a2a30] text-left text-[#8b8b93]">
                    {chart.cols.map((c) => (<th key={c} className="py-2">{c}</th>))}
                  </tr>
                </thead>
                <tbody className="text-white">
                  {chart.rows.map((r) => (
                    <tr key={r[0]} className="border-b border-[#2a2a30]/60">
                      {r.map((cell, ci) => (<td key={ci} className={ci === 0 ? "py-2 font-semibold" : ""}>{cell}</td>))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {fitNote && <p className="mt-4 text-sm text-[#c9c9cf]"><span className="text-white">Fit:</span> {fitNote}</p>}
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-lime/10 p-3 text-sm text-lime">
                <Check size={16} className="mt-0.5 shrink-0" /> {chart.tip}
              </div>
              <p className="mt-3 text-xs text-[#8b8b93]">Wrong size? Exchanges are free within 15 days.</p>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
