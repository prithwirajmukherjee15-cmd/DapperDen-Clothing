import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Heart, ShoppingBag, Truck, RotateCcw, ShieldCheck, ChevronRight, Ruler, Minus, Plus, X, Check } from "lucide-react";
import { formatINR } from "../mock/mock";
import { useData } from "../context/DataContext";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import Reveal from "../components/Reveal";
import { useToast } from "../hooks/use-toast";

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
    if (!size) { setErr(true); toast({ title: "Please select a size" }); return; }
    addToCart(product, size, `Colour ${activeImg + 1}`, qty);
    if (buyNow) navigate("/cart");
    else toast({ title: "Added to bag", description: `${product.name} • ${size}` });
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      <nav className="flex items-center gap-1 text-xs text-[#8b8b93]">
        <Link to="/" className="hover:text-lime">Home</Link><ChevronRight size={12} />
        <Link to="/men" className="hover:text-lime">Men</Link><ChevronRight size={12} />
        <Link to={`/men/${product.category}`} className="capitalize hover:text-lime">{product.category.replace("-", " ")}</Link><ChevronRight size={12} />
        <span className="text-white">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-3">
            {product.images.map((img, i) => (
              <button key={i} onClick={() => setActiveImg(i)}
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
            {product.collection.replace("-", " ")}
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

          {/* Colourways (image variants) */}
          {product.images.length > 1 && (
            <div className="mt-7">
              <p className="mb-2 font-grotesk text-sm font-semibold text-white">Colour: <span className="text-[#8b8b93]">{activeImg + 1} of {product.images.length}</span></p>
              <div className="flex flex-wrap gap-2">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`h-16 w-14 overflow-hidden rounded-lg border-2 transition ${activeImg === i ? "border-lime" : "border-[#2a2a30] hover:border-[#4a4a52]"}`}>
                    <img src={img} alt={`${product.name} colourway ${i + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-grotesk text-sm font-semibold text-white">Select Size</p>
              <button onClick={() => setSizeGuide(true)} className="flex items-center gap-1 text-sm text-lime hover:underline">
                <Ruler size={14} /> Size Guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button key={s} onClick={() => { setSize(s); setErr(false); }}
                  className={`h-11 w-14 rounded-lg border text-sm font-semibold transition ${size === s ? "border-lime bg-lime text-[#0a0a0b]" : "border-[#2a2a30] text-white hover:border-lime"}`}>
                  {s}
                </button>
              ))}
            </div>
            {err && <p className="mt-2 text-sm text-magenta">Please select a size to continue.</p>}
          </div>

          {/* Qty */}
          <div className="mt-6">
            <p className="mb-2 font-grotesk text-sm font-semibold text-white">Quantity</p>
            <div className="inline-flex items-center rounded-lg border border-[#2a2a30]">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-10 w-10 place-items-center text-white hover:text-lime"><Minus size={16} /></button>
              <span className="w-10 text-center font-grotesk text-white">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="grid h-10 w-10 place-items-center text-white hover:text-lime"><Plus size={16} /></button>
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
            <button onClick={() => toggleWishlist(product.id)}
              className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full border border-[#2a2a30] transition hover:border-magenta">
              <Heart size={20} className={wished ? "fill-magenta text-magenta" : "text-white"} />
            </button>
          </div>

          {/* Perks */}
          <div className="mt-8 grid grid-cols-3 gap-3 border-t border-[#2a2a30] pt-6">
            {[[Truck, "Free Shipping"], [RotateCcw, "15-Day Returns"], [ShieldCheck, "Secure Pay"]].map(([Icon, t], i) => (
              <div key={i} className="flex flex-col items-center gap-1 text-center">
                <Icon size={20} className="text-lime" />
                <span className="text-xs text-[#c9c9cf]">{t}</span>
              </div>
            ))}
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
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {[
            { n: "Arjun M.", r: 5, t: "Fabric is genuinely heavyweight. Fit is perfect for oversized lovers." },
            { n: "Rohan K.", r: 4, t: "Print quality is crisp. Slightly boxy but that's the vibe." },
            { n: "Karan S.", r: 5, t: "Best streetwear tee I own. Zero fade after multiple washes." },
          ].map((rv) => (
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
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#2a2a30] bg-[#131316] p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl text-white">SIZE GUIDE</h3>
                <button onClick={() => setSizeGuide(false)}><X className="text-white" /></button>
              </div>
              <p className="mt-1 text-sm text-[#8b8b93]">Measurements in inches (chest / length)</p>
              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2a2a30] text-left text-[#8b8b93]">
                    <th className="py-2">Size</th><th>Chest</th><th>Length</th>
                  </tr>
                </thead>
                <tbody className="text-white">
                  {[["XS","36","26"],["S","38","27"],["M","40","28"],["L","42","29"],["XL","44","30"],["XXL","46","31"]].map((r) => (
                    <tr key={r[0]} className="border-b border-[#2a2a30]/60">
                      <td className="py-2 font-semibold">{r[0]}</td><td>{r[1]}"</td><td>{r[2]}"</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-lime/10 p-3 text-sm text-lime">
                <Check size={16} className="mt-0.5 shrink-0" /> Prefer oversized? Size up by one for the boxy streetwear fit.
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
