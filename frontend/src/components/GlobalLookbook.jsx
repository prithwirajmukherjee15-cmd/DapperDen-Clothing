import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, MapPin } from "lucide-react";
import { LOOKBOOK } from "../mock/mock";

// Pinned horizontal-scroll cinematic city lookbook — the signature scroll experience
export default function GlobalLookbook() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // translate the horizontal track as the user scrolls through the pinned section
  const x = useTransform(scrollYProgress, [0, 1], ["2%", "-82%"]);

  return (
    <section ref={ref} className="relative h-[420vh]" aria-label="Global lookbook">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="pointer-events-none absolute left-0 right-0 top-10 z-20 mx-auto max-w-7xl px-5">
          <span className="font-grotesk text-sm uppercase tracking-[0.3em] text-lime">The World Tour</span>
          <h2 className="mt-1 font-display text-5xl text-white sm:text-6xl">DAPPER DEN, EVERYWHERE</h2>
        </div>

        <motion.div style={{ x }} className="flex gap-6 pl-[4vw]">
          {LOOKBOOK.map((c, i) => (
            <article key={c.id} className="group relative h-[74vh] w-[78vw] shrink-0 overflow-hidden rounded-3xl sm:w-[62vw] lg:w-[46vw]">
              <video
                className="absolute inset-0 h-full w-full object-cover"
                src={c.video}
                poster={c.poster}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/20 to-[#0a0a0b]/30" />
              <div className="absolute left-6 top-6 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur">
                <span className="font-grotesk text-xs font-bold text-lime">0{i + 1}</span>
                <span className="h-3 w-[1px] bg-white/30" />
                <MapPin size={12} className="text-white" />
                <span className="font-grotesk text-xs text-white">{c.landmark}</span>
              </div>
              <div className="absolute inset-x-6 bottom-6">
                <p className="font-grotesk text-sm uppercase tracking-widest text-[#c9c9cf]">{c.country}</p>
                <h3 className="font-display text-6xl leading-none text-white">{c.city}</h3>
                <p className="mt-2 max-w-xs text-[#c9c9cf]">{c.line}</p>
              </div>
            </article>
          ))}

          {/* Closing CTA panel */}
          <div className="flex h-[74vh] w-[78vw] shrink-0 flex-col items-center justify-center rounded-3xl border border-[#2a2a30] bg-[#101012] sm:w-[52vw] lg:w-[36vw]">
            <span className="font-grotesk text-sm uppercase tracking-widest text-magenta">Your city next</span>
            <h3 className="mt-3 text-center font-display text-5xl text-white">JOIN THE<br />MOVEMENT</h3>
            <Link to="/men" className="dd-hover mt-7 inline-flex items-center gap-2 rounded-full bg-lime px-8 py-4 font-grotesk font-bold text-[#0a0a0b] transition hover:bg-lime-dim">
              Shop Now <ArrowUpRight size={18} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
