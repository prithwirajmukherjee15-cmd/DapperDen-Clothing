import React, { useState } from "react";
import { ChevronDown, LifeBuoy, Truck, RotateCcw, Shield } from "lucide-react";
import Reveal from "../components/Reveal";

const FAQS = [
  { q: "How long does shipping take?", a: "Orders are dispatched within 24 hours and delivered in 3–5 business days. Free shipping on all orders above ₹1499." },
  { q: "What is your return policy?", a: "We offer easy 15-day returns and exchanges. Products must be unworn with tags intact. Refunds are processed within 5–7 business days." },
  { q: "How do I find my size?", a: "Every product page has a detailed size guide. Our tees run true to size — size up one for the oversized streetwear fit." },
  { q: "What payment methods do you accept?", a: "We accept UPI, all major credit/debit cards, and Cash on Delivery across India." },
  { q: "Are the graphics durable?", a: "All graphics are screen-printed on 240 GSM heavyweight cotton and tested for zero cracking or fading through 30+ washes." },
];

export default function Help() {
  const [open, setOpen] = useState(0);
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Reveal>
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-lime/10 text-lime"><LifeBuoy size={26} /></div>
          <h1 className="mt-4 font-display text-5xl text-white">HELP CENTER</h1>
          <p className="mt-2 text-[#8b8b93]">Everything you need to know about Dapper Den.</p>
        </div>
      </Reveal>

      <div className="mt-10 grid grid-cols-3 gap-3">
        {[[Truck, "Shipping"], [RotateCcw, "Returns"], [Shield, "Warranty"]].map(([Icon, t]) => (
          <div key={t} className="flex flex-col items-center gap-2 rounded-2xl border border-[#2a2a30] bg-[#131316] p-5 text-center">
            <Icon size={22} className="text-lime" />
            <span className="font-grotesk text-sm text-white">{t}</span>
          </div>
        ))}
      </div>

      <div className="mt-10 space-y-3">
        {FAQS.map((f, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-[#2a2a30] bg-[#131316]">
            <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
              <span className="font-grotesk font-medium text-white">{f.q}</span>
              <ChevronDown size={18} className={`shrink-0 text-lime transition ${open === i ? "rotate-180" : ""}`} />
            </button>
            {open === i && <p className="px-5 pb-4 text-sm leading-relaxed text-[#c9c9cf]">{f.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
