import React, { useEffect, useId, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Truck, ShieldCheck, PartyPopper, MapPin, Download, Gift, Copy } from "lucide-react";
import { useCart } from "../context/CartContext";
import api, { receiptUrl } from "../api";
import { formatINR } from "../mock/mock";
import { INDIAN_CITIES, INDIAN_STATES, placeFromPincode } from "../mock/india";
import { DELIVERY_TEXT, FREE_SHIPPING_MIN, colourLabel } from "../lib/store";
import PaymentGateway from "../components/PaymentGateway";

const STEPS = ["Address", "Payment", "Confirmation"];
const PREPAID_OFF = 50; // same as PREPAID_DISCOUNT on the server
const SITE = typeof window !== "undefined" ? window.location.origin : "";

export default function Checkout() {
  const { state } = useLocation();
  const { items, subtotal, clearCart } = useCart();
  const [step, setStep] = useState(0);
  const [addr, setAddr] = useState({ name: "", phone: "", email: "", pincode: "", line: "", city: "", stateName: "" });
  const [order, setOrder] = useState(null);
  const [checkoutId, setCheckoutId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [tried, setTried] = useState(false);

  // Each step starts at the top: the URL doesn't change, so the route-level scroll reset doesn't run.
  useEffect(() => { window.scrollTo(0, 0); }, [step]);

  // Save the bag once the address is in, so a reminder can bring the shopper back if they don't finish.
  const toPayment = () => {
    setStep(1);
    api.post("/checkouts", {
      items: items.map((i) => ({ id: i.id, size: i.size, color: i.color, qty: i.qty })),
      name: addr.name, phone: addr.phone, email: addr.email || null,
    }).then((res) => setCheckoutId(res.data.checkout_id)).catch(() => {});
  };

  const total = state?.total ?? subtotal;

  const missing = [
    !addr.name && "full name", addr.phone.length < 10 && "10-digit phone", !addr.line && "address",
    addr.pincode.length < 6 && "6-digit pincode", !addr.city && "city", !addr.stateName && "state",
  ].filter(Boolean);
  const canProceed = missing.length === 0;
  const setPincode = (v) => {
    const pincode = v.replace(/\D/g, "").slice(0, 6);
    const place = placeFromPincode(pincode);
    setAddr((a) => ({ ...a, pincode, city: a.city || place?.city || "", stateName: a.stateName || place?.stateName || "" }));
  };
  const summary = state || { subtotal, discount: 0, shipping: subtotal >= FREE_SHIPPING_MIN ? 0 : 99, coupon: null };

  // The backend prices the order from its own catalog; we only send what was picked.
  const placeOrder = async (label) => {
    const payload = {
      items: items.map((i) => ({ id: i.id, size: i.size, color: i.color, qty: i.qty })),
      coupon: state?.coupon ?? null,
      payment_method: label,
      address: addr,
      checkout_id: checkoutId,
    };
    let res;
    try {
      res = await api.post("/orders", payload);
    } catch (e) {
      const detail = e?.response?.data?.detail;
      throw new Error(typeof detail === "string" ? detail : "We couldn't place your order. Please try again.");
    }
    setOrder(res.data);
  };

  const isCod = /cash/i.test(order?.payment_method || "");

  const finishOrder = () => {
    setStep(2);
    clearCart();
  };

  if (!items.length && step < 2) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <h1 className="font-display text-4xl text-white">NOTHING TO CHECKOUT</h1>
        <Link to="/men" className="mt-4 inline-block rounded-full bg-lime px-6 py-2.5 font-bold text-[#0a0a0b]">Shop now</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      {/* Stepper */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex items-center gap-2">
              <div className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold transition ${i <= step ? "bg-lime text-[#0a0a0b]" : "bg-[#1c1c21] text-[#8b8b93]"}`}>
                {i < step ? <Check size={16} /> : i + 1}
              </div>
              <span className={`text-xs font-grotesk sm:text-sm ${i <= step ? "text-white" : "text-[#8b8b93]"}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`h-0.5 w-5 sm:w-10 ${i < step ? "bg-lime" : "bg-[#2a2a30]"}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="mt-10">
        {step === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <OrderSummary items={items} summary={summary} />
            <h2 className="mt-8 flex items-center gap-2 font-display text-3xl text-white"><Truck size={24} className="text-lime" /> DELIVERY ADDRESS</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Full Name" value={addr.name} onChange={(v) => setAddr({ ...addr, name: v })} testid="addr-name" autoComplete="name" />
              <Field label="Phone" value={addr.phone} onChange={(v) => setAddr({ ...addr, phone: v.replace(/\D/g, "").slice(0, 10) })} testid="addr-phone" autoComplete="tel-national" inputMode="numeric" />
              <div className="sm:col-span-2">
                <Field label="Email (for your receipt, and one reminder if you don't finish)" value={addr.email} onChange={(v) => setAddr({ ...addr, email: v })} testid="addr-email" autoComplete="email" type="email" />
              </div>
              <div className="sm:col-span-2">
                <Field label="Flat / House No, Building, Street, Area" value={addr.line} onChange={(v) => setAddr({ ...addr, line: v })} testid="addr-line" autoComplete="street-address" icon={<MapPin size={15} className="text-lime" />} />
              </div>
              <Field label="Pincode (fills in city and state)" value={addr.pincode} onChange={setPincode} testid="addr-pincode" autoComplete="postal-code" inputMode="numeric" />
              <Select label="City" value={addr.city} onChange={(v) => setAddr({ ...addr, city: v })} options={INDIAN_CITIES} placeholder="Select your city" testid="addr-city" />
              <Select label="State / UT" value={addr.stateName} onChange={(v) => setAddr({ ...addr, stateName: v })} options={INDIAN_STATES} placeholder="Select state" testid="addr-state" />
              <Field label="Country" value="India" onChange={() => {}} disabled testid="addr-country" />
            </div>
            {tried && !canProceed && (
              <p className="mt-6 text-sm text-magenta" role="alert" data-testid="address-missing">Please add your {missing.join(", ")}.</p>
            )}
            <button onClick={() => (canProceed ? toPayment() : setTried(true))} data-testid="continue-to-payment-btn" aria-disabled={!canProceed}
              className={`mt-6 w-full rounded-full bg-lime py-3.5 font-grotesk font-bold text-[#0a0a0b] transition hover:bg-lime-dim ${canProceed ? "" : "opacity-60"}`}>
              Continue to Payment
            </button>
            <p className="mt-3 text-center text-xs text-[#8b8b93]" data-testid="demo-checkout-note">
              Demo store: the payment step is a sandbox, so no money is taken and nothing ships.
            </p>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="flex items-center gap-2 font-display text-3xl text-white"><ShieldCheck size={24} className="text-lime" /> SECURE PAYMENT</h2>
            <p className="mt-1 text-sm text-[#8b8b93]">Delivering to {addr.name}, {addr.city}, {addr.stateName} — {addr.pincode}</p>
            <div className="mt-5"><OrderSummary items={items} summary={summary} prepaidOff={PREPAID_OFF} collapsed /></div>
            <div className="mt-6">
              <PaymentGateway amount={total} prepaidOff={PREPAID_OFF} onSuccess={placeOrder} onComplete={finishOrder} onBack={() => setStep(0)} />
            </div>
          </motion.div>
        )}

        {step === 2 && order && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center" data-testid="order-confirmation">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-lime/15">
              <PartyPopper size={38} className="text-lime" />
            </div>
            <h2 className="mt-6 font-display text-4xl text-white">ORDER CONFIRMED!</h2>
            <p className="mt-2 text-[#c9c9cf]">Thanks {addr.name?.split(" ")[0] || "there"}. Your drip is on the way.{addr.email ? ` Your receipt is on its way to ${addr.email}.` : ""}</p>
            <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-[#2a2a30] bg-[#131316] p-5 text-left" data-testid="order-summary">
              <Line l="Order ID" v={order.order_id} />
              <Line l="Payment" v={order.payment_method} />
              <Line l={`Items (${order.items.reduce((n, i) => n + i.qty, 0)})`} v={formatINR(order.subtotal)} />
              {order.discount > 0 && <Line l={`Coupon (${order.coupon})`} v={"-" + formatINR(order.discount)} />}
              {order.prepaid_discount > 0 && <Line l="Paid online" v={"-" + formatINR(order.prepaid_discount)} />}
              <Line l="Shipping" v={order.shipping ? formatINR(order.shipping) : "FREE"} />
              <Line l={isCod ? "Due on delivery" : "Amount paid"} v={formatINR(order.total)} />
              <Line l="Ship to" v={`${addr.city}, ${addr.stateName}`} />
              <Line l="Delivery" v="3–5 business days" />
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a href={receiptUrl(order.order_id, addr.phone)} target="_blank" rel="noreferrer" data-testid="confirm-receipt-link"
                className="inline-flex items-center gap-2 rounded-full border border-[#2a2a30] px-6 py-3 font-grotesk font-semibold text-white hover:border-lime">
                <Download size={16} /> Receipt
              </a>
              <Link to="/track" state={{ orderId: order.order_id, phone: addr.phone }} data-testid="confirm-track-link" className="rounded-full border border-[#2a2a30] px-6 py-3 font-grotesk font-semibold text-white hover:border-lime">Track Order</Link>
              <Link to="/men" className="rounded-full bg-lime px-6 py-3 font-grotesk font-bold text-[#0a0a0b]">Keep Shopping</Link>
            </div>
            {order.referral_code && <ReferralCard code={order.referral_code} copied={copied} onCopy={() => {
              navigator.clipboard?.writeText(`${SITE}/?ref=${order.referral_code}`).then(() => setCopied(true)).catch(() => {});
            }} />}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function ReferralCard({ code, copied, onCopy }) {
  const link = `${SITE}/?ref=${code}`;
  const text = `I got my streetwear from Dapper Den. Use my code ${code} for ₹200 off your first order (above ₹999): ${link}`;
  return (
    <div className="mx-auto mt-8 max-w-sm rounded-2xl border border-lime/40 bg-lime/5 p-5 text-left" data-testid="referral-card">
      <p className="flex items-center gap-2 font-grotesk text-xs font-bold uppercase tracking-widest text-lime"><Gift size={14} /> Give ₹200, get ₹200</p>
      <p className="mt-2 text-sm text-[#c9c9cf]">Your friend gets ₹200 off their first order. When they order, you get a ₹200 code too.</p>
      <p className="mt-3 font-display text-3xl tracking-widest text-white" data-testid="referral-code">{code}</p>
      <div className="mt-4 flex gap-2">
        <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer" data-testid="referral-whatsapp"
          className="flex-1 rounded-full bg-[#25D366] px-4 py-2.5 text-center font-grotesk text-sm font-bold text-[#0a0a0b]">Share on WhatsApp</a>
        <button onClick={onCopy} className="inline-flex items-center gap-1.5 rounded-full border border-[#2a2a30] px-4 py-2.5 font-grotesk text-sm font-semibold text-white hover:border-lime">
          <Copy size={14} /> {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}

// Bag contents and price breakdown, shown on both checkout steps so the shopper can check them before paying.
function OrderSummary({ items, summary, prepaidOff, collapsed = false }) {
  const n = items.reduce((t, i) => t + i.qty, 0);
  const total = Math.max(0, summary.subtotal - (summary.discount || 0)) + (summary.shipping || 0);
  return (
    <details className="group rounded-2xl border border-[#2a2a30] bg-[#131316] p-4" open={!collapsed && items.length <= 2} data-testid="checkout-summary">
      <summary className="flex cursor-pointer list-none items-center justify-between font-grotesk text-sm text-white">
        <span>Order summary ({n} {n === 1 ? "item" : "items"})</span>
        <span className="font-semibold">{formatINR(total)} <span className="text-xs text-[#8b8b93] group-open:hidden">· show</span></span>
      </summary>
      <ul className="mt-3 space-y-3">
        {items.map((i) => (
          <li key={i.key} className="flex items-center gap-3">
            <img src={i.image} alt="" className="h-14 w-11 rounded object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-white">{i.name}</p>
              <p className="text-xs text-[#8b8b93]">Size {i.size}{colourLabel(i.color) ? ` · ${colourLabel(i.color)}` : ""} · Qty {i.qty}</p>
            </div>
            <span className="text-sm text-white">{formatINR(i.price * i.qty)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 border-t border-[#2a2a30] pt-2">
        <Line l="Items" v={formatINR(summary.subtotal)} />
        {summary.discount > 0 && <Line l={`Coupon (${summary.coupon})`} v={"-" + formatINR(summary.discount)} />}
        <Line l="Shipping" v={summary.shipping ? formatINR(summary.shipping) : "FREE"} />
        <Line l="Total" v={formatINR(total)} />
        {prepaidOff ? <p className="pt-1 text-xs text-lime">Paying online takes another {formatINR(prepaidOff)} off: see the amount payable below.</p> : null}
      </div>
      <p className="mt-2 text-xs text-[#8b8b93]">{DELIVERY_TEXT} · 15-day returns and size exchanges</p>
    </details>
  );
}

function Field({ label, value, onChange, testid, disabled, icon, autoComplete, type = "text", inputMode }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-grotesk text-sm text-[#c9c9cf]">{label}</label>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</span>}
        <input id={id} type={type} inputMode={inputMode} autoComplete={autoComplete} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} data-testid={testid}
          className={`w-full rounded-lg border border-[#2a2a30] bg-[#131316] py-2.5 text-sm text-white outline-none transition focus:border-lime disabled:opacity-60 ${icon ? "pl-9 pr-3" : "px-3"}`} />
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options, placeholder, testid }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-grotesk text-sm text-[#c9c9cf]">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} data-testid={testid}
        className={`w-full appearance-none rounded-lg border border-[#2a2a30] bg-[#131316] px-3 py-2.5 text-sm outline-none transition focus:border-lime ${value ? "text-white" : "text-[#8b8b93]"}`}>
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o} className="text-white">{o}</option>)}
      </select>
    </div>
  );
}

function Line({ l, v }) {
  return (
    <div className="flex items-center justify-between border-b border-[#2a2a30]/60 py-2 last:border-0">
      <span className="text-sm text-[#8b8b93]">{l}</span>
      <span className="text-sm font-semibold text-white">{v}</span>
    </div>
  );
}
