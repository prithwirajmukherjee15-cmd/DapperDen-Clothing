import React from "react";

export default function MarqueeBar() {
  const items = [
    "FREE SHIPPING OVER ₹1499",
    "NEW DROP EVERY FRIDAY",
    "240 GSM HEAVYWEIGHT COTTON",
    "EASY 15-DAY RETURNS",
    "COD AVAILABLE",
    "DEMO STORE: SANDBOX PAYMENTS, NOTHING SHIPS",
  ];
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden border-b border-[#2a2a30] bg-lime">
      <div className="flex w-max animate-marquee">
        {row.map((t, i) => (
          <span
            key={i}
            className="flex items-center gap-3 whitespace-nowrap px-6 py-1.5 font-grotesk text-xs font-bold uppercase tracking-wider text-[#0a0a0b]"
          >
            {t} <span className="text-[#0a0a0b]/50">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
