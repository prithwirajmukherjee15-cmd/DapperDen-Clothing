import React from "react";
import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      className="fixed left-0 top-0 z-[9998] h-0.5 w-full origin-left bg-gradient-to-r from-lime via-lime to-magenta"
      style={{ scaleX }}
    />
  );
}
