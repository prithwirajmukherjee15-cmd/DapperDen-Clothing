import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Twitter, Youtube, Facebook } from "lucide-react";

const cols = [
  {
    title: "Shop",
    links: [
      ["Men", "/men"],
      ["T-Shirts", "/men/t-shirts"],
      ["Hoodies", "/men/hoodies"],
      ["Joggers", "/men/joggers"],
      ["Accessories", "/men/accessories"],
    ],
  },
  {
    title: "Help",
    links: [
      ["FAQ", "/help"],
      ["Shipping", "/help"],
      ["Returns & Exchange", "/returns"],
      ["Track Order", "/track"],
      ["Size Guide", "/help"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About Us", "/help"],
      ["Careers", "/help"],
      ["Privacy Policy", "/help"],
      ["Terms", "/help"],
      ["Contact", "/help"],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-[#2a2a30] bg-[#0a0a0b]">
      <div className="mx-auto max-w-7xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="font-display text-3xl tracking-wide text-white">
              DAPPER<span className="text-lime">DEN</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#8b8b93]">
              Premium streetwear engineered for the bold. Heavyweight fabric, loud
              graphics, zero compromise.
            </p>
            <div className="mt-6 flex gap-3">
              {[Instagram, Twitter, Youtube, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-10 w-10 place-items-center rounded-full border border-[#2a2a30] text-[#8b8b93] transition hover:border-lime hover:text-lime"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="font-grotesk text-sm font-semibold uppercase tracking-wider text-white">
                {c.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {c.links.map(([label, href]) => (
                  <li key={label}>
                    <Link to={href} className="text-sm text-[#8b8b93] transition hover:text-lime">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#2a2a30] pt-6 text-xs text-[#8b8b93] md:flex-row">
          <p>© 2026 Dapper Den. All rights reserved.</p>
          <p>Made for the streets. Shipped worldwide.</p>
        </div>
      </div>
    </footer>
  );
}
