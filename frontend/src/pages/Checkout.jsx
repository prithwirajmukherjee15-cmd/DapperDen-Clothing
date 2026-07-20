import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Truck, ShieldCheck, PartyPopper, MapPin, Plus } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import { formatINR } from "../mock/mock";
import { INDIAN_CITIES, INDIAN_STATES } from "../mock/india";
import PaymentGateway from "../components/PaymentGateway";

const STEPS = ["Address", "Payment", "Confirmation"];

export default function Checkout() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [addr, setAddr] = useState({ name: "", phone: "", email: "", pincode: "", line: "", city: "", stateName: "" });
  const [payLabel, setPayLabel] = useState("");
  const [paidAmount, setPaidAmount] = useState(0);
  const [orderId, setOrderId] = useState("DD" + Math.floor(100000 + Math.random() * 900000));
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddrId, setSelectedAddrId] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const [saveThis, setSaveThis] = useState(true);

  const total = state?.total ?? subtotal;

  useEffect(() => {
    if (user) {
      setAddr((a) => ({ ...a, email: a.email || user.email || "" }));
      api.get("/addresses").then((res) => {
        const list = res.data?.addresses || [];
        setSavedAddresses(list);
        if (list.length) {
          setShowForm(false);
          setSelectedAddrId(list[0].id);
          pickAddress(list[0]);
        }
      }).catch(() => {});
    }
  }, [user]);

  const pickAddress = (a) => {
    setSelectedAddrId(a.id);
    setShowForm(false);
    setAddr((prev) => ({ ...prev, name: a.name, phone: a.phone, pincode: a.pincode, line: a.line, city: a.city, stateName: a.stateName }));
  };

  const canProceed = addr.name && addr.phone.length >= 10 && addr.pincode.length >= 6 && addr.line && addr.city && addr.stateName;

  const placeOrder = async (label) => {
    setPayLabel(label);
    setPaidAmount(total);
    if (user) {
      try {
        if (saveThis && showForm) {
          const res = await api.post("/addresses", { label: "Home", name: addr.name, phone: addr.phone, pincode: addr.pincode, line: addr.line, city: addr.city, stateName: addr.stateName });
          setSavedAddresses(res.data?.addresses || []);
        }
      } catch { /* ignore */ }
      try {
        const payload = {
          items: items.map((i) => ({ id: i.id, name: i.name, slug: i.slug, image: i.image, price: i.price, size: i.size, color: i.color, qty: i.qty })),
          total,
          subtotal: state?.subtotal ?? subtotal,
          discount: state?.discount ?? 0,
          shipping: state?.shipping ?? 0,
          coupon: state?.coupon ?? null,
          payment_method: label,
          address: addr,
        };
        const res = await api.post("/orders", payload);
        if (res.data?.order_id) setOrderId(res.data.order_id);
      } catch {
        /* keep local order id on failure */
      }
    } else {
      try {
        const payload = {
          items: items.map((i) => ({ id: i.id, name: i.name, slug: i.slug, image: i.image, price: i.price, size: i.size, color: i.color, qty: i.qty })),
          total, subtotal: state?.subtotal ?? subtotal, discount: state?.discount ?? 0,
          shipping: state?.shipping ?? 0, coupon: state?.coupon ?? null, payment_method: label, address: addr,
        };
        const res = await api.post("/orders", payload);
        if (res.data?.order_id) setOrderId(res.data.order_id);
      } catch { /* ignore */ }
    }
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

            {user && savedAddresses.length > 0 && (
              <div className="mt-6 space-y-3" data-testid="saved-addresses">
                <p className="font-grotesk text-sm text-[#8b8b93]">Choose a saved address</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {savedAddresses.map((a) => (
                    <button key={a.id} onClick={() => pickAddress(a)} data-testid={`saved-address-${a.id}`}
                      className={`rounded-2xl border p-4 text-left transition ${selectedAddrId === a.id && !showForm ? "border-lime bg-lime/5" : "border-[#2a2a30] hover:border-[#3a3a42]"}`}>
                      <p className="flex items-center gap-1.5 font-grotesk font-semibold text-white"><MapPin size={14} className="text-lime" /> {a.label} · {a.name}</p>
                      <p className="mt-1 text-sm text-[#c9c9cf]">{a.line}, {a.city}, {a.stateName} – {a.pincode}</p>
                      <p className="mt-1 text-xs text-[#8b8b93]">Phone: {a.phone}</p>
                    </button>
                  ))}
                  <button onClick={() => { setShowForm(true); setSelectedAddrId(null); setAddr({ name: "", phone: "", email: user.email || "", pincode: "", line: "", city: "", stateName: "" }); }}
                    data-testid="add-new-address-btn"
                    className={`flex items-center justify-center gap-2 rounded-2xl border border-dashed p-4 font-grotesk text-sm transition ${showForm ? "border-lime text-lime" : "border-[#2a2a30] text-[#8b8b93] hover:border-lime hover:text-lime"}`}>
                    <Plus size={16} /> Add a new address
                  </button>
                </div>
              </div>
            )}

            {showForm && (
              <>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Field label="Full Name" value={addr.name} onChange={(v) => setAddr({ ...addr, name: v })} testid="addr-name" />
                  <Field label="Phone" value={addr.phone} onChange={(v) => setAddr({ ...addr, phone: v.replace(/\D/g, "").slice(0, 10) })} testid="addr-phone" />
                  <div className="sm:col-span-2">
                    <Field label="Email (for order confirmation)" value={addr.email} onChange={(v) => setAddr({ ...addr, email: v })} testid="addr-email" />
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Flat / House No, Building, Street, Area" value={addr.line} onChange={(v) => setAddr({ ...addr, line: v })} testid="addr-line" icon={<MapPin size={15} className="text-lime" />} />
                  </div>
                  <Field label="Pincode" value={addr.pincode} onChange={(v) => setAddr({ ...addr, pincode: v.replace(/\D/g, "").slice(0, 6) })} testid="addr-pincode" />
                  <Select label="City" value={addr.city} onChange={(v) => setAddr({ ...addr, city: v })} options={INDIAN_CITIES} placeholder="Select your city" testid="addr-city" />
                  <Select label="State / UT" value={addr.stateName} onChange={(v) => setAddr({ ...addr, stateName: v })} options={INDIAN_STATES} placeholder="Select state" testid="addr-state" />
                  <Field label="Country" value="India" onChange={() => {}} disabled testid="addr-country" />
                </div>
                {user && (
                  <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-[#c9c9cf]" data-testid="save-address-toggle">
                    <input type="checkbox" checked={saveThis} onChange={(e) => setSaveThis(e.target.checked)} className="h-4 w-4 accent-lime" />
                    Save this address for faster checkout next time
                  </label>
                )}
              </>
            )}

            <button disabled={!canProceed} onClick={() => setStep(1)} data-testid="continue-to-payment-btn"
              className="mt-8 w-full rounded-full bg-lime py-3.5 font-grotesk font-bold text-[#0a0a0b] transition enabled:hover:bg-lime-dim disabled:cursor-not-allowed disabled:opacity-40">
              Continue to Payment
            </button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="flex items-center gap-2 font-display text-3xl text-white"><ShieldCheck size={24} className="text-lime" /> SECURE PAYMENT</h2>
            <p className="mt-1 text-sm text-[#8b8b93]">Delivering to {addr.name}, {addr.city}, {addr.stateName} — {addr.pincode}</p>
            <div className="mt-6">
              <PaymentGateway amount={total} onSuccess={placeOrder} onBack={() => setStep(0)} />
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center" data-testid="order-confirmation">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-lime/15">
              <PartyPopper size={38} className="text-lime" />
            </div>
            <h2 className="mt-6 font-display text-4xl text-white">ORDER CONFIRMED!</h2>
            <p className="mt-2 text-[#c9c9cf]">Thanks {addr.name?.split(" ")[0] || "there"}. Your drip is on the way.</p>
            <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-[#2a2a30] bg-[#131316] p-5 text-left">
              <Line l="Order ID" v={orderId} />
              <Line l="Amount Paid" v={formatINR(paidAmount)} />
              <Line l="Payment" v={payLabel || "Paid"} />
              <Line l="Ship to" v={`${addr.city}, ${addr.stateName}`} />
              <Line l="Delivery" v="3–5 business days" />
            </div>
            <div className="mt-6 flex justify-center gap-3">
              <Link to="/track" state={{ orderId, phone: addr.phone }} data-testid="confirm-track-link" className="rounded-full border border-[#2a2a30] px-6 py-3 font-grotesk font-semibold text-white hover:border-lime">Track Order</Link>
              <Link to="/men" className="rounded-full bg-lime px-6 py-3 font-grotesk font-bold text-[#0a0a0b]">Keep Shopping</Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, testid, disabled, icon }) {
  return (
    <div>
      <label className="mb-1.5 block font-grotesk text-sm text-[#c9c9cf]">{label}</label>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</span>}
        <input value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} data-testid={testid}
          className={`w-full rounded-lg border border-[#2a2a30] bg-[#131316] py-2.5 text-sm text-white outline-none transition focus:border-lime disabled:opacity-60 ${icon ? "pl-9 pr-3" : "px-3"}`} />
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options, placeholder, testid }) {
  return (
    <div>
      <label className="mb-1.5 block font-grotesk text-sm text-[#c9c9cf]">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} data-testid={testid}
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
