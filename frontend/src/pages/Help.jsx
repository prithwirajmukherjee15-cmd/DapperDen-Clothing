import React, { useEffect, useRef, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { ChevronDown, LifeBuoy, Truck, RotateCcw, Ruler, Gift, Mail } from "lucide-react";
import Reveal from "../components/Reveal";

export const FAQS = [
  { id: "shipping", q: "How long does shipping take?", a: "Orders are dispatched within 24 hours and delivered in 3–5 business days. Shipping is free on orders above ₹1,499 (after product discounts); below that it's ₹99." },
  { id: "returns", q: "What is your return policy?", a: "15-day returns and size exchanges. Products must be unworn with tags intact. Refunds are processed within 5–7 business days of pickup." },
  { id: "size", q: "How do I find my size?", a: "Every product page has a size guide for that product type (tees, hoodies, kids by age, sneakers in UK sizes) and a note on how it fits. Once three buyers have told us how it fit, the page also shows a true-to-size score." },
  { id: "payment", q: "What payment methods do you accept?", a: "UPI (Google Pay, PhonePe, Paytm, BHIM), cards, no-cost EMI from ₹3,000, netbanking, wallets and cash on delivery. Paying online saves ₹50. On this demo store the payment step is a sandbox, so no money moves." },
  { id: "referral", q: "How does Give ₹200, get ₹200 work?", a: "1) Place an order and you'll get your own code on the confirmation page and in your receipt email. 2) Share it: a friend gets ₹200 off their first order above ₹999. 3) When they order, you get a one-time ₹200 code. You can't use your own code." },
  { id: "drop", q: "What is the Friday drop?", a: "New pieces land every Friday at 8 PM IST. Join the drop list on the Friday drop page to hear first and get 15% off orders above ₹1,499." },
  { id: "durable", q: "Are the graphics durable?", a: "Graphics are screen-printed on 240 GSM heavyweight cotton and made to survive 30+ washes without cracking or fading." },
];

const TOPICS = [[Truck, "Shipping", "shipping"], [RotateCcw, "Returns", "returns"], [Ruler, "Sizing", "size"], [Gift, "Refer a friend", "referral"]];

export default function Help() {
  const { pathname, hash } = useLocation();
  const initial = hash ? hash.slice(1) : pathname === "/returns" ? "returns" : "shipping";
  const [open, setOpen] = useState(initial);
  const refs = useRef({});
  const show = (id) => { setOpen(id); setTimeout(() => refs.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" }), 50); };
  useEffect(() => { if (initial !== "shipping") show(initial); }, [initial]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Reveal>
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-lime/10 text-lime"><LifeBuoy size={26} /></div>
          <h1 className="mt-4 font-display text-5xl text-white">HELP CENTER</h1>
          <p className="mt-2 text-[#8b8b93]">Shipping, returns, sizing and payments, answered.</p>
        </div>
      </Reveal>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TOPICS.map(([Icon, t, id]) => (
          <button key={id} onClick={() => show(id)} aria-pressed={open === id}
            className={`flex flex-col items-center gap-2 rounded-2xl border bg-[#131316] p-5 text-center transition hover:border-lime ${open === id ? "border-lime" : "border-[#2a2a30]"}`}>
            <Icon size={22} className="text-lime" />
            <span className="font-grotesk text-sm text-white">{t}</span>
          </button>
        ))}
      </div>

      <div className="mt-10 space-y-3">
        {FAQS.map((f) => (
          <div key={f.id} id={f.id} ref={(el) => (refs.current[f.id] = el)} className="overflow-hidden rounded-2xl border border-[#2a2a30] bg-[#131316]">
            <button onClick={() => setOpen(open === f.id ? "" : f.id)} aria-expanded={open === f.id} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
              <span className="font-grotesk font-medium text-white">{f.q}</span>
              <ChevronDown size={18} className={`shrink-0 text-lime transition ${open === f.id ? "rotate-180" : ""}`} />
            </button>
            {open === f.id && <p className="px-5 pb-4 text-sm leading-relaxed text-[#c9c9cf]">{f.a}</p>}
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-[#2a2a30] bg-[#131316] p-6" data-testid="contact">
        <h2 className="flex items-center gap-2 font-display text-2xl text-white"><Mail size={20} className="text-lime" /> CONTACT</h2>
        <p className="mt-2 text-sm text-[#c9c9cf]">
          Dapper Den is a portfolio demo store: nothing ships and no payment is taken, so there's no customer service desk.
          To ask about the project, open an issue on the <a className="text-lime underline" href="https://github.com/prithwirajmukherjee15-cmd/DapperDen-Clothing" target="_blank" rel="noreferrer">GitHub repository</a>.
        </p>
        <p className="mt-3 text-sm text-[#8b8b93]">Looking for an order? <Link to="/track" className="text-lime underline">Track it here</Link> with your order ID and phone number.</p>
      </div>
    </div>
  );
}
