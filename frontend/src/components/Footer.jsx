import React from "react";
import { Link } from "react-router-dom";

const cols = [
  {
    title: "Shop",
    links: [
      ["Men", "/men"],
      ["Women", "/women"],
      ["Kids", "/kids"],
      ["Sneakers & caps", "/men/accessories"],
      ["Friday drop", "/drop"],
    ],
  },
  {
    title: "Help",
    links: [
      ["Shipping", "/help#shipping"],
      ["Returns & exchanges", "/returns"],
      ["Size guide", "/help#size"],
      ["Track order", "/track"],
      ["Refer a friend", "/help#referral"],
    ],
  },
  {
    title: "About",
    links: [
      ["FAQ", "/help"],
      ["Contact", "/help#contact"],
      ["How this store was built", "https://github.com/prithwirajmukherjee15-cmd/DapperDen-Clothing"],
      ["Watch the walkthrough", "/walkthrough/"],
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
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="font-grotesk text-sm font-semibold uppercase tracking-wider text-white">
                {c.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {c.links.map(([label, href]) => (
                  <li key={label}>
                    {/^https?:|^\/walkthrough/.test(href) ? (
                      <a href={href} className="text-sm text-[#8b8b93] transition hover:text-lime" {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>{label}</a>
                    ) : (
                      <Link to={href} className="text-sm text-[#8b8b93] transition hover:text-lime">{label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#2a2a30] pt-6 text-xs text-[#8b8b93] md:flex-row">
          <p>© 2026 Dapper Den. All rights reserved.</p>
          <p className="max-w-xl text-center md:text-right" data-testid="demo-note">
            Portfolio demo store: payments run in a sandbox and nothing ships. Ratings and reviews are sample data.
            Photos from Unsplash and Pexels, retouched with original Dapper Den prints.
          </p>
        </div>
      </div>
    </footer>
  );
}
