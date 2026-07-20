import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Plus, Star } from "lucide-react";
import { formatINR } from "../mock/mock";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { toggleWishlist, inWishlist, addToCart } = useCart();
  const [hover, setHover] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const ref = useRef(null);
  const wished = inWishlist(product.id);
  const img = hover && product.images[1] ? product.images[1] : product.images[0];

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ rx: -py * 8, ry: px * 8 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      animate={{ y: hover ? -8 : 0, rotateX: tilt.rx, rotateY: tilt.ry }}
      transition={{ type: "spring", stiffness: 250, damping: 20 }}
      style={{ transformStyle: "preserve-3d", transformPerspective: 900 }}
      className="group relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setTilt({ rx: 0, ry: 0 }); }}
    >
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative overflow-hidden rounded-xl bg-[#131316] aspect-[3/4]">
          <img
            src={img}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {product.badge && (
            <span className="absolute left-3 top-3 rounded-full bg-lime px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0a0a0b]">
              {product.badge}
            </span>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product.id);
            }}
            aria-label="wishlist"
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/50 backdrop-blur transition hover:bg-black/70"
          >
            <Heart
              size={16}
              className={wished ? "fill-magenta text-magenta" : "text-white"}
            />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              addToCart(product, "M", "Colour 1", 1);
            }}
            className="absolute inset-x-3 bottom-3 flex translate-y-14 items-center justify-center gap-2 rounded-lg bg-lime py-2.5 text-sm font-bold text-[#0a0a0b] opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
          >
            <Plus size={16} /> Quick Add
          </button>
        </div>
      </Link>
      <div className="mt-3 px-0.5">
        <div className="flex items-center gap-1 text-xs text-[#8b8b93]">
          <Star size={12} className="fill-lime text-lime" />
          <span className="text-white">{product.rating}</span>
          <span>({product.reviews})</span>
        </div>
        <Link to={`/product/${product.slug}`}>
          <h3 className="mt-1 line-clamp-1 font-grotesk text-sm font-medium text-white transition group-hover:text-lime">
            {product.name}
          </h3>
        </Link>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-grotesk font-semibold text-white">{formatINR(product.price)}</span>
          <span className="text-xs text-[#8b8b93] line-through">{formatINR(product.mrp)}</span>
          <span className="text-xs font-semibold text-lime">{product.discount}% OFF</span>
        </div>
      </div>
    </motion.div>
  );
}
