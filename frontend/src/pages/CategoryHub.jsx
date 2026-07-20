import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { CATEGORIES_BY_GENDER, COLLECTIONS, HERO_IMAGES, GENDER_LABELS } from "../mock/mock";
import { useData } from "../context/DataContext";
import ProductCard from "../components/ProductCard";
import Reveal from "../components/Reveal";

const HERO_BY_GENDER = {
  men: HERO_IMAGES[3],
  women: "https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=1600&q=80",
  kids: "https://images.unsplash.com/photo-1611428813653-aa606c998586?w=1600&q=80",
};
const TAGLINE = {
  men: "The Men's Edit",
  women: "The Women's Edit",
  kids: "The Kids' Edit",
};

export default function CategoryHub({ gender = "men" }) {
  const { byGender } = useData();
  const cats = CATEGORIES_BY_GENDER[gender] || CATEGORIES_BY_GENDER.men;
  const all = byGender(gender);
  const fresh = all.filter((p) => p.badge === "New" || p.badge === "Bestseller").slice(0, 4);

  return (
    <div>
      <section className="relative h-[42vh] min-h-[320px] overflow-hidden">
        <img src={HERO_BY_GENDER[gender]} alt={gender} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="mx-auto w-full max-w-7xl px-5 pb-10">
            <span className="font-grotesk text-sm uppercase tracking-widest text-lime">{TAGLINE[gender]}</span>
            <h1 className="mt-2 font-display text-6xl text-white sm:text-7xl">{GENDER_LABELS[gender].toUpperCase()}</h1>
            <p className="mt-2 max-w-md text-[#c9c9cf]">Every fit, every universe. Built heavyweight, worn loud.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14">
        <Reveal><h2 className="mb-8 font-display text-4xl text-white">CATEGORIES</h2></Reveal>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {cats.map((c, idx) => (
            <Reveal key={c.id} delay={idx * 0.05}>
              <Link to={`/${gender}/${c.slug}`} className="group relative block overflow-hidden rounded-xl">
                <div className="aspect-[3/4]">
                  <img src={c.image} alt={c.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
                <span className="absolute bottom-3 left-3 font-grotesk text-sm font-semibold uppercase text-white">{c.name}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-6">
        <Reveal>
          <div className="mb-8">
            <span className="font-grotesk text-sm uppercase tracking-widest text-magenta">Licensed Universes</span>
            <h2 className="mt-2 font-display text-4xl text-white">SHOP BY COLLECTION</h2>
          </div>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {COLLECTIONS.map((c, idx) => (
            <Reveal key={c.id} delay={idx * 0.05}>
              <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 220, damping: 20 }}>
                <Link to={`/collection/${c.slug}`} className="group relative block h-56 overflow-hidden rounded-2xl">
                  <img src={c.banner} alt={c.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                  <div className="absolute inset-x-5 bottom-5">
                    <span className="font-grotesk text-xs uppercase tracking-widest" style={{ color: c.accent }}>{c.tagline}</span>
                    <h3 className="font-display text-2xl text-white">{c.name.toUpperCase()}</h3>
                  </div>
                </Link>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14">
        <Reveal>
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-display text-4xl text-white">FRESH DROPS</h2>
            <Link to={`/${gender}/${cats[0].slug}`} className="flex items-center gap-1 font-grotesk text-sm text-lime hover:underline">View all <ArrowRight size={16} /></Link>
          </div>
        </Reveal>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
          {fresh.map((p, idx) => (
            <Reveal key={p.id} delay={idx * 0.05}><ProductCard product={p} /></Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
