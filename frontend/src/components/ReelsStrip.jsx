import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Volume2, X } from "lucide-react";
import Reveal from "./Reveal";

// 20-second brand reels (9:16). Cards play muted while on screen; tapping opens the full-quality
// version with sound. Small "-web" files keep the homepage light; the full files load only on tap.
const REELS = [
  { id: "drop", title: "Drops Friday", sub: "Anime Legends · 8 PM IST" },
  { id: "fit", title: "Will it fit?", sub: "Size guide + fit notes" },
  { id: "pay", title: "Pay your way", sub: "UPI first · ₹50 off · COD" },
  { id: "refer", title: "Give ₹200, get ₹200", sub: "Bring your squad" },
];
const src = (id, full) => `/reels/${id}${full ? "" : "-web"}.mp4`;
const poster = (id) => `/reels/${id}.jpg`;

function ReelCard({ reel, onOpen }) {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && e.intersectionRatio >= 0.6) v.play().catch(() => {});
      else v.pause();
    }, { threshold: [0, 0.6, 1] });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <button onClick={onOpen} data-testid={`reel-${reel.id}`} aria-label={`Play reel: ${reel.title}`}
      className="group relative aspect-[9/16] w-[62vw] max-w-[300px] shrink-0 snap-center overflow-hidden rounded-2xl border border-[#2a2a30] bg-[#131316] text-left transition hover:border-lime md:w-auto md:max-w-none">
      <video ref={ref} src={src(reel.id)} poster={poster(reel.id)} muted loop playsInline preload="none"
        className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/85 to-transparent" />
      <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/55 text-white backdrop-blur transition group-hover:bg-lime group-hover:text-[#0a0a0b]">
        <Play size={16} className="translate-x-px" />
      </span>
      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="font-display text-2xl uppercase leading-none text-white">{reel.title}</p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-[#c9c9cf]"><Volume2 size={12} className="text-lime" /> {reel.sub}</p>
      </div>
    </button>
  );
}

export default function ReelsStrip() {
  const [open, setOpen] = useState(null);
  const go = (d) => setOpen((i) => (i + d + REELS.length) % REELS.length);

  useEffect(() => {
    if (open === null) return undefined;
    const onKey = (e) => { if (e.key === "Escape") setOpen(null); if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open]);

  return (
    <section className="mx-auto max-w-7xl px-5 py-16" data-testid="reels-strip">
      <Reveal>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-grotesk text-xs font-bold uppercase tracking-[0.3em] text-lime">In motion</p>
            <h2 className="mt-2 font-display text-4xl text-white sm:text-5xl">WATCH THE DROP</h2>
          </div>
          <p className="hidden max-w-xs text-right text-sm text-[#8b8b93] sm:block">Twenty seconds each. Tap one for sound.</p>
        </div>
      </Reveal>
      <div className="-mx-5 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {REELS.map((r, i) => <ReelCard key={r.id} reel={r} onOpen={() => setOpen(i)} />)}
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} data-testid="reel-modal"
            className="fixed inset-0 z-[60] grid place-items-center bg-black/95 p-4 backdrop-blur-sm" onClick={() => setOpen(null)}>
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <video key={REELS[open].id} src={src(REELS[open].id, true)} poster={poster(REELS[open].id)} controls autoPlay playsInline
                onEnded={() => go(1)} className="aspect-[9/16] max-h-[86vh] w-[min(92vw,calc(86vh*9/16))] rounded-2xl bg-black" />
              <button onClick={() => setOpen(null)} aria-label="Close" className="absolute -top-3 -right-3 grid h-10 w-10 place-items-center rounded-full bg-lime text-[#0a0a0b]"><X size={20} /></button>
              <button onClick={() => go(-1)} aria-label="Previous reel" className="absolute left-0 top-1/2 -translate-x-[120%] -translate-y-1/2 rounded-full border border-[#2a2a30] bg-black/60 p-2 text-white hover:border-lime max-sm:hidden"><ChevronLeft /></button>
              <button onClick={() => go(1)} aria-label="Next reel" className="absolute right-0 top-1/2 translate-x-[120%] -translate-y-1/2 rounded-full border border-[#2a2a30] bg-black/60 p-2 text-white hover:border-lime max-sm:hidden"><ChevronRight /></button>
              <p className="mt-3 text-center font-grotesk text-sm text-[#c9c9cf]">{REELS[open].title} · {open + 1} / {REELS.length}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
