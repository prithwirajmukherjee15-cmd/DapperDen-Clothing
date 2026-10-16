import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Truck, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { CATEGORIES, COLLECTIONS } from "../mock/mock";
import { useData } from "../context/DataContext";
import ProductCard from "../components/ProductCard";
import Reveal from "../components/Reveal";
import TiltCard from "../components/TiltCard";
import VideoHero from "../components/VideoHero";
import GlobalLookbook from "../components/GlobalLookbook";

function BigMarquee() {
  const row = ["HEAVYWEIGHT", "•", "BOLD GRAPHICS", "•", "LIMITED DROPS", "•", "WORN LOUD", "•"];
  const items = [...row, ...row];
  return (
    <div className="overflow-hidden border-y border-[#2a2a30] bg-[#0a0a0b] py-6">
      <div className="flex w-max animate-marquee gap-6">
        {items.map((t, i) => (
          <span key={i} className={`font-display text-4xl uppercase tracking-tight sm:text-6xl ${t === "•" ? "text-lime" : "text-white/90"}`}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function CategoryStrip() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20">
      <Reveal>
        <div className="mb-10 flex items-end justify-between">
          <div>
            <span className="font-grotesk text-sm uppercase tracking-[0.3em] text-lime">Find your fit</span>
            <h2 className="mt-2 font-display text-5xl text-white sm:text-6xl">SHOP BY CATEGORY</h2>
          </div>
          <Link to="/men" className="dd-hover hidden items-center gap-1 font-grotesk text-sm text-lime hover:underline sm:flex">
            View all <ArrowUpRight size={16} />
          </Link>
        </div>
      </Reveal>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {CATEGORIES.map((c, idx) => (
          <Reveal key={c.id} delay={idx * 0.05}>
            <TiltCard intensity={8}>
              <Link to={`/men/${c.slug}`} className="dd-hover group relative block overflow-hidden rounded-xl">
                <div className="aspect-[3/4]">
                  <img src={c.image} alt={c.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                <span className="absolute bottom-3 left-3 font-grotesk text-sm font-semibold uppercase tracking-wide text-white">{c.name}</span>
              </Link>
            </TiltCard>
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
        <div className="mb-10">
          <span className="font-grotesk text-sm uppercase tracking-[0.3em] text-magenta">Limited Universes</span>
          <h2 className="mt-2 font-display text-5xl text-white sm:text-6xl">THEMED COLLECTIONS</h2>
        </div>
      </Reveal>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {COLLECTIONS.map((c, idx) => (
          <Reveal key={c.id} delay={idx * 0.06}>
            <TiltCard intensity={12}>
              <Link to={`/collection/${c.slug}`} className="dd-hover group relative block h-72 overflow-hidden rounded-2xl">
                <img src={c.banner} alt={c.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute inset-x-5 bottom-5" style={{ transform: "translateZ(40px)" }}>
                  <span className="font-grotesk text-xs uppercase tracking-widest" style={{ color: c.accent }}>{c.tagline}</span>
                  <h3 className="mt-1 font-display text-3xl text-white">{c.name.toUpperCase()}</h3>
                  <span className="mt-2 inline-flex items-center gap-1 font-grotesk text-sm text-white/80 transition group-hover:text-lime">
                    Shop now <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function FeaturedGrid() {
  const { products } = useData();
  const featured = products.filter((p) => p.badge === "Bestseller" || p.badge === "Trending").slice(0, 8);
  return (
    <section className="mx-auto max-w-7xl px-5 py-20">
      <Reveal>
        <div className="mb-10 flex items-end justify-between">
          <div>
            <span className="font-grotesk text-sm uppercase tracking-[0.3em] text-lime">Flying off shelves</span>
            <h2 className="mt-2 font-display text-5xl text-white sm:text-6xl">TRENDING NOW</h2>
          </div>
          <Link to="/men" className="dd-hover hidden items-center gap-1 font-grotesk text-sm text-lime hover:underline sm:flex">
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

function Stats() {
  const stats = [
    ["2.4M+", "Tees shipped"],
    ["48", "Countries"],
    ["240 GSM", "Heavyweight cotton"],
    ["4.8★", "Avg rating"],
  ];
  return (
    <section className="mx-auto max-w-7xl px-5 py-14">
      <div className="grid grid-cols-2 gap-4 rounded-3xl border border-[#2a2a30] bg-[#101012] p-8 md:grid-cols-4">
        {stats.map(([n, l], idx) => (
          <Reveal key={l} delay={idx * 0.08}>
            <div className="text-center">
              <p className="font-display text-4xl text-lime sm:text-5xl">{n}</p>
              <p className="mt-1 font-grotesk text-sm text-[#8b8b93]">{l}</p>
            </div>
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
          <img src={COLLECTIONS[1].banner} alt="editorial" className="h-[460px] w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16">
            <span className="flex items-center gap-2 font-grotesk text-sm uppercase tracking-widest text-magenta">
              <Sparkles size={14} /> The Anime Legends Drop
            </span>
            <h2 className="mt-3 max-w-lg font-display text-6xl leading-none text-white md:text-7xl">
              INK THAT<br />NEVER FADES
            </h2>
            <p className="mt-4 max-w-md text-[#c9c9cf]">
              Hand-illustrated graphics on 240 GSM heavyweight cotton. Built for the fans who wear their fandom loud.
            </p>
            <Link to="/collection/anime-legends" className="dd-hover mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-white px-7 py-3.5 font-grotesk font-bold text-[#0a0a0b] transition hover:bg-lime">
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
      <VideoHero />
      <BigMarquee />
      <CategoryStrip />
      <CollectionsRail />
      <GlobalLookbook />
      <FeaturedGrid />
      <Stats />
      <Editorial />
      <Perks />
    </div>
  );
}
