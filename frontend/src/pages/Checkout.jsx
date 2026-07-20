import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, CreditCard, Truck, Wallet, Landmark, PartyPopper } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatINR } from "../mock/mock";

const STEPS = ["Address", "Payment", "Confirmation"];

export default function Checkout() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { items, subtotal, clearCart } = useCart();
  const [step, setStep] = useState(0);
  const [addr, setAddr] = useState({ name: "", phone: "", pincode: "", line: "", city: "", stateName: "" });
  const [pay, setPay] = useState("upi");
  const [orderId] = useState("DD" + Math.floor(100000 + Math.random() * 900000));

  const total = state?.total ?? subtotal;

  const canProceed = addr.name && addr.phone.length >= 10 && addr.pincode.length >= 6 && addr.line && addr.city;

  const placeOrder = () => {
    clearCart();
    setStep(2);
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
              <span className={`hidden text-sm font-grotesk sm:block ${i <= step ? "text-white" : "text-[#8b8b93]"}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`h-0.5 w-10 ${i < step ? "bg-lime" : "bg-[#2a2a30]"}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="mt-10">
        {step === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="flex items-center gap-2 font-display text-3xl text-white"><Truck size={24} className="text-lime" /> DELIVERY ADDRESS</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Full Name" value={addr.name} onChange={(v) => setAddr({ ...addr, name: v })} />
              <Field label="Phone" value={addr.phone} onChange={(v) => setAddr({ ...addr, phone: v.replace(/\D/g, "").slice(0, 10) })} />
              <Field label="Pincode" value={addr.pincode} onChange={(v) => setAddr({ ...addr, pincode: v.replace(/\D/g, "").slice(0, 6) })} />
              <Field label="City" value={addr.city} onChange={(v) => setAddr({ ...addr, city: v })} />
              <div className="sm:col-span-2"><Field label="Address Line" value={addr.line} onChange={(v) => setAddr({ ...addr, line: v })} /></div>
              <Field label="State" value={addr.stateName} onChange={(v) => setAddr({ ...addr, stateName: v })} />
            </div>
            <button disabled={!canProceed} onClick={() => setStep(1)}
              className="mt-8 w-full rounded-full bg-lime py-3.5 font-grotesk font-bold text-[#0a0a0b] transition enabled:hover:bg-lime-dim disabled:cursor-not-allowed disabled:opacity-40">
              Continue to Payment
            </button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="flex items-center gap-2 font-display text-3xl text-white"><CreditCard size={24} className="text-lime" /> PAYMENT</h2>
            <div className="mt-6 space-y-3">
              {[
                { id: "upi", label: "UPI", icon: Wallet, desc: "GPay, PhonePe, Paytm" },
                { id: "card", label: "Credit / Debit Card", icon: CreditCard, desc: "Visa, Mastercard, RuPay" },
                { id: "cod", label: "Cash on Delivery", icon: Landmark, desc: "Pay when it arrives" },
              ].map((m) => (
                <button key={m.id} onClick={() => setPay(m.id)}
                  className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${pay === m.id ? "border-lime bg-lime/5" : "border-[#2a2a30] hover:border-[#3a3a42]"}`}>
                  <m.icon size={22} className={pay === m.id ? "text-lime" : "text-[#8b8b93]"} />
                  <div className="flex-1">
                    <p className="font-grotesk font-semibold text-white">{m.label}</p>
                    <p className="text-sm text-[#8b8b93]">{m.desc}</p>
                  </div>
                  <span className={`grid h-5 w-5 place-items-center rounded-full border ${pay === m.id ? "border-lime" : "border-[#2a2a30]"}`}>
                    {pay === m.id && <span className="h-2.5 w-2.5 rounded-full bg-lime" />}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between rounded-2xl border border-[#2a2a30] bg-[#131316] p-4">
              <span className="font-grotesk text-white">Amount payable</span>
              <span className="font-display text-2xl text-white">{formatINR(total)}</span>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setStep(0)} className="flex-1 rounded-full border border-[#2a2a30] py-3.5 font-grotesk font-semibold text-white hover:border-lime">Back</button>
              <button onClick={placeOrder} className="flex-1 rounded-full bg-lime py-3.5 font-grotesk font-bold text-[#0a0a0b] hover:bg-lime-dim">Place Order</button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-lime/15">
              <PartyPopper size={38} className="text-lime" />
            </div>
            <h2 className="mt-6 font-display text-4xl text-white">ORDER CONFIRMED!</h2>
            <p className="mt-2 text-[#c9c9cf]">Thanks for the order. Your drip is on the way.</p>
            <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-[#2a2a30] bg-[#131316] p-5 text-left">
              <Line l="Order ID" v={orderId} />
              <Line l="Amount Paid" v={formatINR(total)} />
              <Line l="Payment" v={pay.toUpperCase()} />
              <Line l="Delivery" v="3–5 business days" />
            </div>
            <div className="mt-6 flex justify-center gap-3">
              <Link to="/account" className="rounded-full border border-[#2a2a30] px-6 py-3 font-grotesk font-semibold text-white hover:border-lime">Track Order</Link>
              <Link to="/men" className="rounded-full bg-lime px-6 py-3 font-grotesk font-bold text-[#0a0a0b]">Keep Shopping</Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-1.5 block font-grotesk text-sm text-[#c9c9cf]">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[#2a2a30] bg-[#131316] px-3 py-2.5 text-sm text-white outline-none transition focus:border-lime" />
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
