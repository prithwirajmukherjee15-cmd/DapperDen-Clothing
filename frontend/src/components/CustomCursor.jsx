import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// Premium magnetic custom cursor (desktop only)
export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });
  const ringX = useSpring(x, { stiffness: 150, damping: 20, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 150, damping: 20, mass: 0.6 });

  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) setEnabled(true);
    else return;

    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target;
      const interactive = t.closest("a,button,[role='button'],input,select,.dd-hover");
      setHovering(!!interactive);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[10000] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime"
        style={{ x: sx, y: sy }}
      />
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[10000] -translate-x-1/2 -translate-y-1/2 rounded-full border border-lime/60"
        style={{ x: ringX, y: ringY }}
        animate={{ width: hovering ? 52 : 30, height: hovering ? 52 : 30, opacity: hovering ? 1 : 0.5 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      />
    </>
  );
}
