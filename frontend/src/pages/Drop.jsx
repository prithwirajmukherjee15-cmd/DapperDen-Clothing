import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, Check, Mail, MessageCircle, Zap } from "lucide-react";
import api from "../api";
import ProductCard from "../components/ProductCard";

// Campaign landing page for the weekly drop (every Friday, 8 PM IST).
// Sign-ups record which link they came from (?utm_source=instagram etc.) so each channel can be measured.
const pad = (n) => String(n).padStart(2, "0");
const fans = (n) => (n === 1 ? "1 fan is" : `${n.toLocaleString("en-IN")} fans are`);

// Mirrors growth.next_drop on the server, so the countdown is right before the API answers (or if it doesn't).
function nextFriday8pmIST(from = Date.now()) {
  const IST = 5.5 * 36e5;
  const t = new Date(from + IST);
  const target = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate(), 20, 0, 0));
  let days = (5 - t.getUTCDay() + 7) % 7;
  if (days === 0 && t >= target) days = 7;
  target.setUTCDate(target.getUTCDate() + days);
  return new Date(target.getTime() - IST).toISOString();
}

function useCountdown(target) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const ms = Math.max(0, (target ? new Date(target).getTime() : now) - now);
  return { d: Math.floor(ms / 864e5), h: Math.floor(ms / 36e5) % 24, m: Math.floor(ms / 6e4) % 60, s: Math.floor(ms / 1e3) % 60 };
}

export default function Drop() {
  const [params] = useSearchParams();
  const [info, setInfo] = useState(null);
  const [form, setForm] = useState({ email: "", whatsapp: "", consent: false });
  const [state, setState] = useState({ status: "idle", error: "", result: null });
  const dropsAt = info?.drops_at || nextFriday8pmIST();
  const left = useCountdown(dropsAt);

  useEffect(() => {
    api.get("/drop").then((r) => setInfo(r.data)).catch(() => setInfo({ preview: [], subscribers: 0 }));
  }, []);

  const when = new Date(dropsAt).toLocaleString("en-IN", { weekday: "long", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });

  const submit = async (e) => {
    e.preventDefault();
    setState({ status: "loading", error: "", result: null });
    try {
      const res = await api.post("/drop-alerts", {
        email: form.email.trim() || null,
        whatsapp: form.whatsapp.trim() || null,
        consent: form.consent,
        source: (params.get("utm_source") || "drop-page").slice(0, 40),
      });
      setState({ status: "done", error: "", result: res.data });
    } catch (err) {
      setState({ status: "idle", error: err?.response?.data?.detail || "Couldn't sign you up. Try again.", result: null });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="flex items-center gap-2 font-grotesk text-xs font-bold uppercase tracking-[0.3em] text-lime"><Zap size={14} /> The Friday drop</p>
          <h1 className="mt-3 font-display text-6xl leading-[0.95] text-white sm:text-7xl">ANIME LEGENDS<br /><span className="text-lime">DROPS FRIDAY.</span></h1>
          <p className="mt-4 max-w-lg text-[#c9c9cf]">Ink, neon and battle cries on 240 GSM heavyweight cotton. New pieces every Friday at 8 PM IST. Get on the list to hear first and take 15% off orders above ₹1,499.</p>

          <div className="mt-8 flex gap-3" data-testid="countdown">
            {[["Days", left.d], ["Hours", left.h], ["Mins", left.m], ["Secs", left.s]].map(([l, v]) => (
              <div key={l} className="w-20 rounded-2xl border border-[#2a2a30] bg-[#131316] py-3 text-center">
                <p className="font-display text-4xl text-white">{pad(v)}</p>
                <p className="font-grotesk text-[10px] uppercase tracking-widest text-[#8b8b93]">{l}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-[#8b8b93]">Next drop: {when} IST</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-3xl border border-[#2a2a30] bg-[#131316] p-7" data-testid="drop-form-card">
          {state.status === "done" ? (
            <div data-testid="drop-success">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-lime/15 text-lime"><Check size={28} /></div>
              <h2 className="mt-4 font-display text-4xl text-white">{state.result.already ? "YOU'RE ALREADY IN." : "YOU'RE ON THE LIST."}</h2>
              <p className="mt-2 text-[#c9c9cf]">{fans(state.result.subscribers)} waiting for Friday. Your drop-list code:</p>
              <p className="mt-4 inline-block rounded-xl border border-lime/50 bg-lime/10 px-5 py-3 font-display text-3xl tracking-widest text-lime" data-testid="drop-code">{state.result.code}</p>
              <p className="mt-2 text-sm text-[#8b8b93]">15% off any order above ₹1,499.</p>
              <a href={`https://wa.me/?text=${encodeURIComponent(`Anime Legends drops Friday 8 PM on Dapper Den. Get on the list: ${window.location.origin}/drop?utm_source=whatsapp-share`)}`}
                target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 font-grotesk text-sm font-bold text-[#0a0a0b]">
                <MessageCircle size={16} /> Tell your squad on WhatsApp
              </a>
            </div>
          ) : (
            <form onSubmit={submit}>
              <h2 className="flex items-center gap-2 font-display text-3xl text-white"><Bell size={24} className="text-lime" /> GET THE DROP ALERT</h2>
              <p className="mt-1 text-sm text-[#8b8b93]">Email, WhatsApp, or both. One message when the drop goes live.</p>
              <label className="mt-6 block font-grotesk text-sm text-[#c9c9cf]">Email</label>
              <div className="relative mt-1.5">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8b93]" />
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" data-testid="drop-email"
                  className="w-full rounded-lg border border-[#2a2a30] bg-[#0f0f12] py-3 pl-9 pr-3 text-sm text-white outline-none focus:border-lime" />
              </div>
              <label className="mt-4 block font-grotesk text-sm text-[#c9c9cf]">WhatsApp number</label>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8b8b93]">+91</span>
                <input inputMode="numeric" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value.replace(/\D/g, "").slice(0, 10) })} placeholder="10-digit number" data-testid="drop-whatsapp"
                  className="w-full rounded-lg border border-[#2a2a30] bg-[#0f0f12] py-3 pl-12 pr-3 text-sm text-white outline-none focus:border-lime" />
              </div>
              <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm text-[#c9c9cf]">
                <input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} className="mt-1 h-4 w-4 accent-[#c6ff3d]" data-testid="drop-consent" />
                <span>Message me about this drop. Unsubscribe any time. <span className="text-[#8b8b93]">Dapper Den is a portfolio demo store, so nothing actually ships.</span></span>
              </label>
              {state.error && <p className="mt-3 text-sm text-magenta" data-testid="drop-error">{state.error}</p>}
              <button type="submit" disabled={state.status === "loading"} data-testid="drop-submit"
                className="mt-6 w-full rounded-full bg-lime py-3.5 font-grotesk font-bold text-[#0a0a0b] transition hover:bg-lime-dim disabled:opacity-50">
                {state.status === "loading" ? "Adding you…" : "Notify me + get 15% off"}
              </button>
              <p className="mt-2 text-center text-xs text-[#8b8b93]">15% off orders above ₹1,499. <Link to="/help#referral" className="underline">Bring friends: give ₹200, get ₹200</Link></p>
              {info?.subscribers > 0 && <p className="mt-3 text-center text-xs text-[#8b8b93]">{fans(info.subscribers).replace(/ (is|are)$/, "")} already on the list</p>}
            </form>
          )}
        </motion.div>
      </div>

      {info?.preview?.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-3xl text-white">FIRST LOOK</h2>
          <p className="mt-1 text-sm text-[#8b8b93]">Available now from the Anime Legends collection. New pieces join every Friday.</p>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {info.preview.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
