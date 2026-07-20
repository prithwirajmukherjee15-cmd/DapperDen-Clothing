import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { HERO_SLIDES, CATEGORIES, COLLECTIONS, PRODUCTS } from "../mock/mock";
import ProductCard from "../components/ProductCard";
import Reveal from "../components/Reveal";

function Hero() {
  const [i, setI] = useState(0);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yImg = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % HERO_SLIDES.length), 5500);
    return () => clearInterval(t);
  }, []);

  const s = HERO_SLIDES[i];
  return (
    <section ref={ref} className="relative h-[86vh] min-h-[560px] overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.div
          key={s.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9 }}
          className="absolute inset-0"
          style={{ y: yImg, scale }}
        >
          <img src={s.image} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0b] via-[#0a0a0b]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl"
          >
            <span className="inline-block rounded-full border border-lime/40 bg-lime/10 px-3 py-1 font-grotesk text-xs font-semibold uppercase tracking-widest text-lime">
              {s.eyebrow}
            </span>
            <h1 className="mt-5 whitespace-pre-line font-display text-6xl leading-[0.92] text-white sm:text-7xl md:text-8xl">
              {s.title}
            </h1>
            <p className="mt-5 max-w-md text-lg text-[#c9c9cf]">{s.subtitle}</p>
            <Link
              to={s.href}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-lime px-7 py-3.5 font-grotesk font-bold text-[#0a0a0b] transition hover:bg-lime-dim"
            >
              {s.cta} <ArrowRight size={18} />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {HERO_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            className={`h-1.5 rounded-full transition-all ${idx === i ? "w-8 bg-lime" : "w-4 bg-white/30"}`}
            aria-label={`slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

function CategoryStrip() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16">
      <Reveal>
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-4xl text-white sm:text-5xl">SHOP BY CATEGORY</h2>
          <Link to="/men" className="hidden items-center gap-1 font-grotesk text-sm text-lime hover:underline sm:flex">
            View all <ArrowUpRight size={16} />
          </Link>
        </div>
      </Reveal>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {CATEGORIES.map((c, idx) => (
          <Reveal key={c.id} delay={idx * 0.05}>
            <Link to={`/men/${c.slug}`} className="group relative block overflow-hidden rounded-xl">
              <div className="aspect-[3/4]">
                <img src={c.image} alt={c.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
              <span className="absolute bottom-3 left-3 font-grotesk text-sm font-semibold uppercase tracking-wide text-white">
                {c.name}
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function CollectionsRail() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-10">
      <Reveal>
        <div className="mb-8">
          <span className="font-grotesk text-sm font-semibold uppercase tracking-widest text-magenta">Limited Universes</span>
          <h2 className="mt-2 font-display text-4xl text-white sm:text-5xl">THEMED COLLECTIONS</h2>
        </div>
      </Reveal>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {COLLECTIONS.map((c, idx) => (
          <Reveal key={c.id} delay={idx * 0.06}>
            <motion.div whileHover={{ y: -10, rotateX: 6 }} style={{ transformPerspective: 900 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}>
              <Link to={`/collection/${c.slug}`} className="group relative block h-64 overflow-hidden rounded-2xl">
                <img src={c.banner} alt={c.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute inset-x-5 bottom-5">
                  <span className="font-grotesk text-xs uppercase tracking-widest" style={{ color: c.accent }}>{c.tagline}</span>
                  <h3 className="mt-1 font-display text-3xl text-white">{c.name.toUpperCase()}</h3>
                  <span className="mt-2 inline-flex items-center gap-1 font-grotesk text-sm text-white/80 transition group-hover:text-lime">
                    Shop now <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function FeaturedGrid() {
  const featured = PRODUCTS.filter((p) => p.badge === "Bestseller" || p.badge === "Trending").slice(0, 8);
  return (
    <section className="mx-auto max-w-7xl px-5 py-16">
      <Reveal>
        <div className="mb-8 flex items-end justify-between">
          <div>
            <span className="font-grotesk text-sm font-semibold uppercase tracking-widest text-lime">Flying off shelves</span>
            <h2 className="mt-2 font-display text-4xl text-white sm:text-5xl">TRENDING NOW</h2>
          </div>
          <Link to="/men" className="hidden items-center gap-1 font-grotesk text-sm text-lime hover:underline sm:flex">
            View all <ArrowUpRight size={16} />
          </Link>
        </div>
      </Reveal>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
        {featured.map((p, idx) => (
          <Reveal key={p.id} delay={(idx % 4) * 0.05}>
            <ProductCard product={p} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Editorial() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-10">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl">
          <img src={COLLECTIONS[1].banner} alt="editorial" className="h-[420px] w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16">
            <span className="font-grotesk text-sm uppercase tracking-widest text-magenta">The Anime Legends Drop</span>
            <h2 className="mt-3 max-w-lg font-display text-5xl leading-none text-white md:text-6xl">
              INK THAT<br />NEVER FADES
            </h2>
            <p className="mt-4 max-w-md text-[#c9c9cf]">
              Hand-illustrated graphics on 240 GSM heavyweight cotton. Built for the fans who wear their fandom loud.
            </p>
            <Link to="/collection/anime-legends" className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-white px-7 py-3.5 font-grotesk font-bold text-[#0a0a0b] transition hover:bg-lime">
              Explore Drop <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Perks() {
  const perks = [
    { icon: Truck, t: "Free Shipping", d: "On all orders above ₹1499" },
    { icon: RotateCcw, t: "15-Day Returns", d: "Easy, no-questions returns" },
    { icon: ShieldCheck, t: "Secure Checkout", d: "100% protected payments" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-5 py-14">
      <div className="grid gap-4 md:grid-cols-3">
        {perks.map((p, idx) => (
          <Reveal key={p.t} delay={idx * 0.08}>
            <div className="flex items-center gap-4 rounded-2xl border border-[#2a2a30] bg-[#131316] p-6">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-lime/10 text-lime">
                <p.icon size={22} />
              </div>
              <div>
                <p className="font-grotesk font-semibold text-white">{p.t}</p>
                <p className="text-sm text-[#8b8b93]">{p.d}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div>
      <Hero />
      <CategoryStrip />
      <CollectionsRail />
      <FeaturedGrid />
      <Editorial />
      <Perks />
    </div>
  );
}
