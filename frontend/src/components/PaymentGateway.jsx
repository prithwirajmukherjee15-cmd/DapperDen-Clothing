import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, Smartphone, Landmark, Wallet, Banknote, ShieldCheck, Lock,
  Loader2, CheckCircle2, ChevronRight, Clock, CalendarClock,
} from "lucide-react";
import { formatINR } from "../mock/mock";
import { INDIAN_BANKS } from "../mock/india";

/* ----------------------------- Brand logo bits ----------------------------- */
const Visa = () => <span className="font-serif text-lg font-bold italic tracking-tight text-[#1a1f71]">VISA</span>;
const Mastercard = () => (
  <span className="relative inline-flex items-center">
    <span className="h-4 w-4 rounded-full bg-[#eb001b]" />
    <span className="-ml-2 h-4 w-4 rounded-full bg-[#f79e1b] opacity-90" />
  </span>
);
const Amex = () => <span className="rounded bg-[#2e77bc] px-1 text-[10px] font-bold text-white">AMEX</span>;
const RuPay = () => (
  <span className="text-sm font-extrabold italic">
    <span className="text-[#e97626]">Ru</span><span className="text-[#097a3f]">Pay</span>
  </span>
);
const Diners = () => <span className="text-xs font-bold text-[#0165ac]">Diners</span>;
const GPayLogo = () => (
  <span className="text-sm font-semibold">
    <span className="text-[#4285F4]">G</span><span className="text-[#EA4335]"> </span>
    <span className="text-[#5f6368]">Pay</span>
  </span>
);
const PhonePeLogo = () => <span className="rounded bg-[#5f259f] px-1.5 py-0.5 text-[11px] font-bold text-white">PhonePe</span>;
const PaytmLogo = () => <span className="text-sm font-extrabold"><span className="text-[#002970]">pay</span><span className="text-[#00baf2]">tm</span></span>;
const BhimLogo = () => <span className="text-xs font-bold text-[#e77817]">BHIM</span>;
const RazorpayLogo = () => <span className="text-sm font-bold text-[#3395FF]">Razorpay</span>;

/* ----------------------------- Card detection ------------------------------ */
function detectCard(number) {
  const n = number.replace(/\s/g, "");
  if (/^4/.test(n)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  if (/^(60|65|81|82|508)/.test(n)) return "rupay";
  if (/^3(0[0-5]|6|8)/.test(n)) return "diners";
  return "";
}
function formatCardNumber(value, brand) {
  const digits = value.replace(/\D/g, "").slice(0, brand === "amex" ? 15 : 16);
  if (brand === "amex") return digits.replace(/(\d{4})(\d{0,6})(\d{0,5})/, (m, a, b, c) => [a, b, c].filter(Boolean).join(" "));
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

const METHODS = [
  { id: "upi", label: "UPI", sub: "GPay / PhonePe / Paytm / BHIM", icon: Smartphone, tag: "Recommended" },
  { id: "card", label: "Cards", sub: "Visa, Mastercard, Amex, RuPay", icon: CreditCard },
  { id: "emi", label: "No Cost EMI", sub: "3 / 6 / 9 / 12 months", icon: CalendarClock, minAmount: 3000, tag: "0% interest" },
  { id: "razorpay", label: "Razorpay", sub: "Secure quick checkout", icon: ShieldCheck },
  { id: "paytm", label: "Paytm", sub: "Wallet & Postpaid", icon: Wallet },
  { id: "netbanking", label: "Netbanking", sub: "All Indian banks", icon: Landmark },
  { id: "wallet", label: "Wallets", sub: "Amazon Pay, Mobikwik", icon: Wallet },
  { id: "cod", label: "Cash on Delivery", sub: "Pay when it arrives", icon: Banknote },
];

const EMI_BANKS = ["HDFC Bank", "ICICI Bank", "Axis Bank", "SBI Card", "Kotak Bank"];
const EMI_TENURES = [3, 6, 9, 12];

const CardBrandIcon = ({ brand }) => {
  const map = { visa: <Visa />, mastercard: <Mastercard />, amex: <Amex />, rupay: <RuPay />, diners: <Diners /> };
  return map[brand] || <CreditCard size={18} className="text-slate-400" />;
};

// onSuccess(label) places the order and must reject if it fails; onComplete runs
// after the success animation.
export default function PaymentGateway({ amount, onSuccess, onComplete, onBack }) {
  const [method, setMethod] = useState("upi");
  const [processing, setProcessing] = useState(null); // {label, phase}
  const [err, setErr] = useState("");

  // form state
  const [card, setCard] = useState({ number: "", name: "", exp: "", cvv: "" });
  const [upiApp, setUpiApp] = useState("gpay");
  const [upiId, setUpiId] = useState("");
  const [bank, setBank] = useState("");
  const [walletApp, setWalletApp] = useState("amazonpay");
  const [emi, setEmi] = useState({ bank: "HDFC Bank", months: 6 });

  const availableMethods = useMemo(() => METHODS.filter((m) => !m.minAmount || amount >= m.minAmount), [amount]);

  const cardBrand = useMemo(() => detectCard(card.number), [card.number]);

  const runPayment = async (label) => {
    setErr("");
    setProcessing({ label, phase: "processing" });
    const minDelay = new Promise((r) => setTimeout(r, 2200));
    try {
      await Promise.all([onSuccess(label), minDelay]);
    } catch (e) {
      await minDelay;
      setProcessing(null);
      setErr(e?.message || "We couldn't place your order. Please try again.");
      return;
    }
    setProcessing({ label, phase: "success" });
    setTimeout(() => onComplete?.(), 1100);
  };

  const payCard = () => {
    const digits = card.number.replace(/\s/g, "");
    const need = cardBrand === "amex" ? 15 : 16;
    if (digits.length < need) return setErr("Enter a valid card number");
    if (!card.name.trim()) return setErr("Enter the name on card");
    if (!/^\d{2}\/\d{2}$/.test(card.exp)) return setErr("Enter expiry as MM/YY");
    if (card.cvv.length < 3) return setErr("Enter a valid CVV");
    runPayment(`Card ${cardBrand ? "•" : ""} ${cardBrand.toUpperCase()}`.trim());
  };

  const payUpi = () => {
    if (upiApp === "id" && !/^[\w.\-]{2,}@[\w]{2,}$/.test(upiId)) return setErr("Enter a valid UPI ID (e.g. name@okhdfc)");
    const labels = { gpay: "Google Pay", phonepe: "PhonePe", paytm: "Paytm UPI", bhim: "BHIM UPI", id: "UPI" };
    runPayment(labels[upiApp]);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl" data-testid="payment-gateway">
      {/* Gateway header */}
      <div className="flex items-center justify-between bg-[#072654] px-5 py-4 text-white">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 font-display text-sm">DD</div>
          <div>
            <p className="text-sm font-semibold leading-tight">Dapper Den</p>
            <p className="flex items-center gap-1 text-[11px] text-white/70"><Lock size={11} /> Secured by Razorpay</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-white/70">Amount payable</p>
          <p className="text-lg font-bold" data-testid="gateway-amount">{formatINR(amount)}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-[220px_1fr]">
        {/* Method rail */}
        <div className="border-b border-slate-100 bg-slate-50 p-2 md:border-b-0 md:border-r">
          <p className="hidden px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 md:block">Payment Options</p>
          <div className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
            {availableMethods.map((m) => (
              <button key={m.id} onClick={() => { setMethod(m.id); setErr(""); }}
                data-testid={`pay-method-${m.id}`}
                className={`flex min-w-[150px] items-center gap-3 rounded-xl px-3 py-2.5 text-left transition md:min-w-0 ${method === m.id ? "bg-white shadow-sm ring-1 ring-[#3395FF]" : "hover:bg-white/70"}`}>
                <m.icon size={18} className={method === m.id ? "text-[#3395FF]" : "text-slate-400"} />
                <div className="flex-1">
                  <p className="text-[13px] font-semibold leading-tight">{m.label}</p>
                  {m.tag && <span className="text-[10px] font-medium text-emerald-600">{m.tag}</span>}
                </div>
                <ChevronRight size={14} className={`hidden md:block ${method === m.id ? "text-[#3395FF]" : "text-slate-300"}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Form area */}
        <div className="min-h-[340px] p-5">
          <AnimatePresence mode="wait">
            <motion.div key={method} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {method === "card" && (
                <div className="space-y-4" data-testid="pay-panel-card">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold">Card details</h3>
                    <div className="flex items-center gap-2"><Visa /><Mastercard /><Amex /><RuPay /></div>
                  </div>
                  <div className="relative">
                    <GInput label="Card number" value={card.number} placeholder="1234 5678 9012 3456"
                      onChange={(v) => setCard({ ...card, number: formatCardNumber(v, cardBrand) })} testid="card-number" inputMode="numeric" />
                    <span className="absolute right-3 top-[34px]"><CardBrandIcon brand={cardBrand} /></span>
                  </div>
                  <GInput label="Name on card" value={card.name} placeholder="As printed on card"
                    onChange={(v) => setCard({ ...card, name: v.toUpperCase() })} testid="card-name" />
                  <div className="grid grid-cols-2 gap-3">
                    <GInput label="Expiry (MM/YY)" value={card.exp} placeholder="MM/YY" testid="card-exp"
                      onChange={(v) => { let d = v.replace(/\D/g, "").slice(0, 4); if (d.length >= 3) d = d.slice(0, 2) + "/" + d.slice(2); setCard({ ...card, exp: d }); }} />
                    <GInput label="CVV" value={card.cvv} placeholder="•••" type="password" testid="card-cvv" inputMode="numeric"
                      onChange={(v) => setCard({ ...card, cvv: v.replace(/\D/g, "").slice(0, cardBrand === "amex" ? 4 : 3) })} />
                  </div>
                  <PayBtn amount={amount} onClick={payCard} testid="card-pay-btn" />
                </div>
              )}

              {method === "emi" && (
                <div className="space-y-4" data-testid="pay-panel-emi">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold">No Cost EMI</h3>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">0% interest</span>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">Select bank / card issuer</label>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                      {EMI_BANKS.map((b) => (
                        <button key={b} onClick={() => setEmi({ ...emi, bank: b })} data-testid={`emi-bank-${b}`}
                          className={`rounded-lg border px-2 py-2 text-[11px] font-medium transition ${emi.bank === b ? "border-[#3395FF] bg-[#3395FF]/5" : "border-slate-200 hover:border-slate-300"}`}>{b}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">Choose tenure</label>
                    <div className="grid grid-cols-4 gap-2">
                      {EMI_TENURES.map((mo) => (
                        <button key={mo} onClick={() => setEmi({ ...emi, months: mo })} data-testid={`emi-tenure-${mo}`}
                          className={`rounded-xl border p-3 text-center transition ${emi.months === mo ? "border-[#3395FF] bg-[#3395FF]/5 ring-1 ring-[#3395FF]" : "border-slate-200 hover:border-slate-300"}`}>
                          <p className="text-sm font-bold text-slate-900">{formatINR(Math.round(amount / mo))}</p>
                          <p className="text-[11px] text-slate-500">/mo × {mo}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700">
                    {emi.months} months × {formatINR(Math.round(amount / emi.months))} · Total {formatINR(amount)} · No interest, no extra cost.
                  </p>
                  <PayBtn amount={amount} onClick={() => runPayment(`No Cost EMI · ${emi.bank} · ${emi.months} mo`)} label={`Pay ${formatINR(Math.round(amount / emi.months))}/mo via EMI`} testid="emi-pay-btn" />
                </div>
              )}

              {method === "upi" && (
                <div className="space-y-4" data-testid="pay-panel-upi">
                  <h3 className="text-base font-semibold">Pay via UPI</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "gpay", node: <GPayLogo /> },
                      { id: "phonepe", node: <PhonePeLogo /> },
                      { id: "paytm", node: <PaytmLogo /> },
                      { id: "bhim", node: <BhimLogo /> },
                    ].map((a) => (
                      <button key={a.id} onClick={() => setUpiApp(a.id)} data-testid={`upi-app-${a.id}`}
                        className={`grid h-16 place-items-center rounded-xl border transition ${upiApp === a.id ? "border-[#3395FF] bg-[#3395FF]/5 ring-1 ring-[#3395FF]" : "border-slate-200 hover:border-slate-300"}`}>
                        {a.node}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setUpiApp("id")} data-testid="upi-app-id"
                    className={`w-full rounded-xl border p-3 text-left text-sm transition ${upiApp === "id" ? "border-[#3395FF] bg-[#3395FF]/5" : "border-slate-200"}`}>
                    Enter UPI ID / VPA
                  </button>
                  {upiApp === "id" && (
                    <GInput label="UPI ID" value={upiId} placeholder="yourname@okhdfc" onChange={setUpiId} testid="upi-id-input" />
                  )}
                  {upiApp !== "id" && (
                    <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">A collect request will be sent to your {{ gpay: "Google Pay", phonepe: "PhonePe", paytm: "Paytm", bhim: "BHIM" }[upiApp]} app. Approve within 5 minutes.</p>
                  )}
                  <PayBtn amount={amount} onClick={payUpi} label="Verify & Pay" testid="upi-pay-btn" />
                </div>
              )}

              {method === "razorpay" && (
                <BrandQuickPay amount={amount} testid="pay-panel-razorpay" accent="#3395FF" title={<RazorpayLogo />}
                  desc="One-tap secure checkout across cards, UPI, netbanking & wallets." onPay={() => runPayment("Razorpay")} />
              )}
              {method === "paytm" && (
                <BrandQuickPay amount={amount} testid="pay-panel-paytm" accent="#00baf2" title={<PaytmLogo />}
                  desc="Pay using Paytm Wallet, UPI or Paytm Postpaid instantly." onPay={() => runPayment("Paytm")} />
              )}

              {method === "netbanking" && (
                <div className="space-y-4" data-testid="pay-panel-netbanking">
                  <h3 className="text-base font-semibold">Select your bank</h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {INDIAN_BANKS.slice(0, 6).map((b) => (
                      <button key={b} onClick={() => setBank(b)} data-testid={`bank-${b}`}
                        className={`rounded-xl border p-3 text-xs font-medium transition ${bank === b ? "border-[#3395FF] bg-[#3395FF]/5" : "border-slate-200 hover:border-slate-300"}`}>{b}</button>
                    ))}
                  </div>
                  <GSelect label="More banks" value={bank} onChange={setBank} options={INDIAN_BANKS} testid="bank-select" />
                  <PayBtn amount={amount} onClick={() => { if (!bank) return setErr("Select a bank"); runPayment(`Netbanking · ${bank}`); }} testid="netbanking-pay-btn" />
                </div>
              )}

              {method === "wallet" && (
                <div className="space-y-4" data-testid="pay-panel-wallet">
                  <h3 className="text-base font-semibold">Choose a wallet</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "amazonpay", label: "Amazon Pay" },
                      { id: "mobikwik", label: "Mobikwik" },
                      { id: "freecharge", label: "Freecharge" },
                      { id: "paytmwallet", label: "Paytm Wallet" },
                    ].map((w) => (
                      <button key={w.id} onClick={() => setWalletApp(w.id)} data-testid={`wallet-${w.id}`}
                        className={`rounded-xl border p-3 text-sm font-medium transition ${walletApp === w.id ? "border-[#3395FF] bg-[#3395FF]/5" : "border-slate-200 hover:border-slate-300"}`}>{w.label}</button>
                    ))}
                  </div>
                  <PayBtn amount={amount} onClick={() => runPayment("Wallet")} testid="wallet-pay-btn" />
                </div>
              )}

              {method === "cod" && (
                <div className="space-y-4" data-testid="pay-panel-cod">
                  <h3 className="text-base font-semibold">Cash on Delivery</h3>
                  <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">Pay {formatINR(amount)} in cash when your order arrives. Please keep exact change ready.</p>
                  <PayBtn amount={amount} onClick={() => runPayment("Cash on Delivery")} label="Place COD Order" testid="cod-pay-btn" />
                </div>
              )}

              {err && <p className="mt-3 text-sm text-red-500" data-testid="pay-error">{err}</p>}
            </motion.div>
          </AnimatePresence>

          <button onClick={onBack} className="mt-5 text-xs font-medium text-slate-400 hover:text-slate-600" data-testid="gateway-back">← Change delivery address</button>
        </div>
      </div>

      {/* Processing / success overlay */}
      <AnimatePresence>
        {processing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 grid place-items-center bg-[#072654]/95 backdrop-blur-sm" data-testid="pay-processing">
            <div className="text-center text-white">
              {processing.phase === "processing" ? (
                <>
                  <Loader2 size={44} className="mx-auto animate-spin text-[#3395FF]" />
                  <p className="mt-4 text-lg font-semibold">Processing payment…</p>
                  <p className="mt-1 flex items-center justify-center gap-1 text-sm text-white/70"><Clock size={13} /> Do not press back or refresh</p>
                  <p className="mt-3 text-xs text-white/50">{processing.label} · {formatINR(amount)}</p>
                </>
              ) : (
                <motion.div initial={{ scale: 0.7 }} animate={{ scale: 1 }} data-testid="pay-success">
                  <CheckCircle2 size={54} className="mx-auto text-emerald-400" />
                  <p className="mt-4 text-lg font-semibold">Payment successful</p>
                  <p className="mt-1 text-sm text-white/70">{formatINR(amount)} paid via {processing.label}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------- Sub widgets ------------------------------- */
function PayBtn({ amount, onClick, label, testid }) {
  return (
    <button onClick={onClick} data-testid={testid}
      className="mt-2 w-full rounded-xl bg-[#3395FF] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#3395FF]/30 transition hover:bg-[#1a7ae6]">
      {label || `Pay ${formatINR(amount)}`}
    </button>
  );
}

function BrandQuickPay({ amount, title, desc, onPay, accent, testid }) {
  return (
    <div className="space-y-5" data-testid={testid}>
      <div className="flex items-center gap-2 text-lg">{title}</div>
      <p className="text-sm text-slate-500">{desc}</p>
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
        <span className="text-sm text-slate-500">Total</span>
        <span className="text-lg font-bold text-slate-900">{formatINR(amount)}</span>
      </div>
      <button onClick={onPay} data-testid={`${testid}-btn`}
        className="w-full rounded-xl py-3.5 text-sm font-bold text-white shadow-lg transition"
        style={{ backgroundColor: accent, boxShadow: `0 10px 25px -8px ${accent}` }}>
        Pay {formatINR(amount)}
      </button>
      <p className="flex items-center justify-center gap-1 text-xs text-slate-400"><ShieldCheck size={13} /> 100% secure sandbox transaction</p>
    </div>
  );
}

function GInput({ label, value, onChange, placeholder, type = "text", testid, inputMode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500">{label}</label>
      <input type={type} value={value} inputMode={inputMode} placeholder={placeholder} data-testid={testid}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-[#3395FF] focus:ring-2 focus:ring-[#3395FF]/20" />
    </div>
  );
}

function GSelect({ label, value, onChange, options, testid }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} data-testid={testid}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#3395FF] focus:ring-2 focus:ring-[#3395FF]/20">
        <option value="">Select bank</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
