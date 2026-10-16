import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, Loader2, Ruler, Star } from "lucide-react";
import api from "../api";

// Reached from the "How did it fit?" button in the delivered email.
// Answers feed the "true to size" score shown on each product page.
const FITS = [["small", "Too small"], ["right", "Just right"], ["large", "Too big"]];

export default function Feedback() {
  const [params] = useSearchParams();
  const orderId = params.get("order") || "";
  const token = params.get("token") || "";
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/feedback", { params: { order_id: orderId, token } })
      .then((r) => { setForm(r.data); setStatus(r.data.submitted ? "done" : "ready"); })
      .catch((e) => { setError(e?.response?.data?.detail || "This feedback link isn't valid."); setStatus("error"); });
  }, [orderId, token]);

  const set = (id, patch) => setAnswers((a) => ({ ...a, [id]: { ...a[id], ...patch } }));
  const complete = form && form.items.every((i) => answers[i.product_id]?.fit);

  const submit = async () => {
    setStatus("sending");
    try {
      await api.post("/feedback", {
        order_id: orderId, token, comment,
        answers: form.items.map((i) => ({ product_id: i.product_id, fit: answers[i.product_id].fit, rating: answers[i.product_id].rating || null })),
      });
      setStatus("done");
    } catch (e) {
      setError(e?.response?.data?.detail || "Couldn't save that. Try again.");
      setStatus("ready");
    }
  };

  if (status === "loading") return <div className="grid min-h-[50vh] place-items-center"><Loader2 className="animate-spin text-lime" /></div>;

  if (status === "error") {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="font-display text-4xl text-white">LINK EXPIRED</h1>
        <p className="mt-2 text-[#8b8b93]">{error}</p>
        <Link to="/" className="mt-6 inline-block rounded-full bg-lime px-6 py-3 font-bold text-[#0a0a0b]">Back to the store</Link>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center" data-testid="feedback-done">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-lime/15 text-lime"><Check size={30} /></div>
        <h1 className="mt-5 font-display text-4xl text-white">THANKS{form?.first_name ? `, ${form.first_name.toUpperCase()}` : ""}.</h1>
        <p className="mt-2 text-[#c9c9cf]">Your answer is now part of the fit score on the product page, so the next shopper picks the right size first time.</p>
        <Link to="/drop" className="mt-6 inline-block rounded-full bg-lime px-6 py-3 font-bold text-[#0a0a0b]">See Friday's drop</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <p className="flex items-center gap-2 font-grotesk text-xs font-bold uppercase tracking-[0.3em] text-lime"><Ruler size={14} /> Order #{form.order_id}</p>
      <h1 className="mt-3 font-display text-5xl text-white">HOW DID IT FIT?</h1>
      <p className="mt-2 text-[#c9c9cf]">Two taps per piece. Your answer helps the next shopper pick the right size.</p>

      <div className="mt-8 space-y-4">
        {form.items.map((i) => (
          <div key={i.product_id} className="rounded-2xl border border-[#2a2a30] bg-[#131316] p-5" data-testid="feedback-item">
            <div className="flex items-center gap-4">
              <img src={i.image} alt="" className="h-16 w-14 rounded-lg object-cover" />
              <div>
                <p className="font-grotesk font-semibold text-white">{i.name}</p>
                <p className="text-sm text-[#8b8b93]">You ordered size {i.size}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {FITS.map(([k, label]) => (
                <button key={k} onClick={() => set(i.product_id, { fit: k })} data-testid={`fit-${k}`}
                  className={`rounded-lg border py-2.5 font-grotesk text-sm font-semibold transition ${answers[i.product_id]?.fit === k ? "border-lime bg-lime text-[#0a0a0b]" : "border-[#2a2a30] text-white hover:border-lime"}`}>
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-1" aria-label="rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => set(i.product_id, { rating: n })} aria-label={`${n} stars`}>
                  <Star size={20} className={(answers[i.product_id]?.rating || 0) >= n ? "fill-lime text-lime" : "text-[#4a4a52]"} />
                </button>
              ))}
              <span className="ml-2 text-xs text-[#8b8b93]">Optional rating</span>
            </div>
          </div>
        ))}
      </div>

      <label className="mt-6 block font-grotesk text-sm text-[#c9c9cf]">Anything else? (optional)</label>
      <textarea value={comment} onChange={(e) => setComment(e.target.value.slice(0, 1000))} rows={3}
        className="mt-1.5 w-full rounded-lg border border-[#2a2a30] bg-[#131316] p-3 text-sm text-white outline-none focus:border-lime" />
      {error && <p className="mt-3 text-sm text-magenta">{error}</p>}
      <button onClick={submit} disabled={!complete || status === "sending"} data-testid="feedback-submit"
        className="mt-6 w-full rounded-full bg-lime py-3.5 font-grotesk font-bold text-[#0a0a0b] transition disabled:opacity-40">
        {status === "sending" ? "Saving…" : "Send"}
      </button>
    </div>
  );
}
