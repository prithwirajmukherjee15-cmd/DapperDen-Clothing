import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

// 3D mouse-follow tilt wrapper for premium depth on cards
export default function TiltCard({ children, className = "", intensity = 10 }) {
  const ref = useRef(null);
  const [t, setT] = useState({ rx: 0, ry: 0 });

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setT({ rx: -py * intensity, ry: px * intensity });
  };
  const reset = () => setT({ rx: 0, ry: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className={className}
      style={{ transformStyle: "preserve-3d", transformPerspective: 900 }}
      animate={{ rotateX: t.rx, rotateY: t.ry }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
    >
      {children}
    </motion.div>
  );
}
