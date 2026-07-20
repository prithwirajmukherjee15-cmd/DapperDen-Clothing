import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import { HERO_VIDEO, HERO_IMAGES } from "../mock/mock";

export default function VideoHero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.25]);
  const yText = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const blur = useTransform(scrollYProgress, [0, 1], [0, 6]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);

  const lines = [
    ["WEAR", "IT", "LIKE"],
    ["YOU", "MEAN", "IT"],
  ];

  return (
    <section ref={ref} className="perspective-container relative h-screen min-h-[640px] overflow-hidden">
      <motion.div className="absolute inset-0" style={{ scale, filter }}>
        <video
          className="h-full w-full object-cover"
          src={HERO_VIDEO}
          poster={HERO_IMAGES[0]}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0b]/55 via-[#0a0a0b]/20 to-[#0a0a0b]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0b]/85 via-[#0a0a0b]/20 to-transparent" />
      </motion.div>

      <motion.div
        className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-5"
        style={{ y: yText, opacity }}
      >
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-lime/40 bg-lime/10 px-4 py-1.5 font-grotesk text-xs font-semibold uppercase tracking-[0.2em] text-lime"
        >
          <MapPin size={13} /> Shot across the world · SS26
        </motion.span>

        <h1 className="font-display text-[13vw] leading-[0.85] text-white sm:text-[11vw] lg:text-[8.5rem]">
          {lines.map((line, li) => (
            <span key={li} className="block">
              {line.map((w, i) => (
                <motion.span
                  key={w + li + i}
                  className="mr-4 inline-block"
                  initial={{ opacity: 0, y: 80, rotateX: -90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: 0.15 + (li * 3 + i) * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformPerspective: 600, color: w === "MEAN" ? "#c6ff3d" : undefined }}
                >
                  {w}
                </motion.span>
              ))}
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-6 max-w-md text-lg text-[#c9c9cf]"
        >
          Heavyweight streetwear engineered for the bold. Filmed on the streets of Paris, Tokyo & beyond.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          className="mt-9 flex flex-wrap gap-4"
        >
          <Link to="/men" className="dd-hover group inline-flex items-center gap-2 rounded-full bg-lime px-8 py-4 font-grotesk font-bold text-[#0a0a0b] transition hover:bg-lime-dim">
            Shop the Drop <ArrowRight size={18} className="transition group-hover:translate-x-1" />
          </Link>
          <Link to="/collection/neon-dreams" className="dd-hover inline-flex items-center gap-2 rounded-full border border-white/25 px-8 py-4 font-grotesk font-semibold text-white backdrop-blur transition hover:border-lime hover:text-lime">
            Watch Lookbook
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-white/60"
      >
        <span className="font-grotesk text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <div className="h-10 w-[1px] overflow-hidden bg-white/20">
          <motion.div className="h-4 w-full bg-lime" animate={{ y: [-16, 40] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} />
        </div>
      </motion.div>
    </section>
  );
}
