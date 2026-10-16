import React, { useEffect, useState } from "react";
import { useLocation, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PackageSearch, Truck, CheckCircle2, MapPin, Loader2, Package, Download } from "lucide-react";
import api, { receiptUrl } from "../api";
import { formatINR } from "../mock/mock";

const STAGES = ["Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"];

export default function TrackOrder() {
  const { state } = useLocation();
  const [params] = useSearchParams();
  // Links in order emails carry ?order=...&phone=... so the page opens already tracked.
  const [orderId, setOrderId] = useState(params.get("order") || state?.orderId || "");
  const [phone, setPhone] = useState((params.get("phone") || state?.phone || "").replace(/\D/g, "").slice(-10));
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const track = async (e) => {
    e?.preventDefault();
    setErr(""); setOrder(null); setLoading(true);
    try {
      const res = await api.get("/orders/track", { params: { order_id: orderId.trim(), phone: phone.trim() } });
      setOrder(res.data);
    } catch (e2) {
      setErr(e2?.response?.data?.detail || "Could not find that order. Check your details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId && phone.length === 10) track();
    // run once on load for links from emails / the confirmation page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeStage = order ? Math.max(0, STAGES.indexOf(order.status)) : 0;

  return (
    <div className="mx-auto max-w-2xl px-5 py-14">
      <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 font-display text-4xl text-white">
        <PackageSearch size={30} className="text-lime" /> TRACK YOUR ORDER
      </motion.h1>
      <p className="mt-2 text-sm text-[#8b8b93]">No account needed — enter your order ID and the phone number used at checkout.</p>

      <form onSubmit={track} className="mt-8 grid gap-4 rounded-2xl border border-[#2a2a30] bg-[#131316] p-6 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block font-grotesk text-sm text-[#c9c9cf]">Order ID</label>
          <input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="DD1234567890" data-testid="track-order-id"
            className="w-full rounded-lg border border-[#2a2a30] bg-[#0f0f12] px-3 py-2.5 text-sm text-white outline-none transition focus:border-lime" />
        </div>
        <div>
          <label className="mb-1.5 block font-grotesk text-sm text-[#c9c9cf]">Phone Number</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit mobile" data-testid="track-phone"
            className="w-full rounded-lg border border-[#2a2a30] bg-[#0f0f12] px-3 py-2.5 text-sm text-white outline-none transition focus:border-lime" />
        </div>
        <button type="submit" disabled={!orderId || phone.length < 10 || loading} data-testid="track-submit"
          className="mt-1 flex items-center justify-center gap-2 rounded-full bg-lime py-3 font-grotesk font-bold text-[#0a0a0b] transition enabled:hover:bg-lime-dim disabled:opacity-40 sm:col-span-2">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Truck size={18} />} Track Order
        </button>
      </form>

      {err && <p className="mt-4 text-sm text-magenta" data-testid="track-error">{err}</p>}

      {order && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6" data-testid="track-result">
          <div className="rounded-2xl border border-[#2a2a30] bg-[#131316] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-grotesk text-lg font-semibold text-white">Order #{order.order_id}</p>
                <p className="text-sm text-[#8b8b93]">{new Date(order.created_at).toLocaleDateString()} • {order.items?.length} item(s)</p>
              </div>
              <span className="rounded-full bg-lime/15 px-3 py-1 text-sm font-semibold text-lime">{order.status}</span>
            </div>

            {/* Progress tracker */}
            <div className="mt-8">
              <div className="relative flex justify-between">
                <div className="absolute left-0 top-3 h-0.5 w-full bg-[#2a2a30]" />
                <div className="absolute left-0 top-3 h-0.5 bg-lime transition-all" style={{ width: `${(activeStage / (STAGES.length - 1)) * 100}%` }} />
                {STAGES.map((s, i) => (
                  <div key={s} className="relative z-10 flex flex-1 flex-col items-center">
                    <div className={`grid h-6 w-6 place-items-center rounded-full text-[10px] ${i <= activeStage ? "bg-lime text-[#0a0a0b]" : "bg-[#1c1c21] text-[#8b8b93]"}`}>
                      {i <= activeStage ? <CheckCircle2 size={14} /> : i + 1}
                    </div>
                    <span className={`mt-2 text-center text-[10px] leading-tight ${i <= activeStage ? "text-white" : "text-[#8b8b93]"}`}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#2a2a30] bg-[#131316] p-6">
            <div className="space-y-4">
              {order.items?.map((it, i) => (
                <div key={i} className="flex items-center gap-4">
                  <img src={it.image} alt="" className="h-16 w-14 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="font-grotesk font-medium text-white">{it.name}</p>
                    <p className="text-sm text-[#8b8b93]">Size {it.size} • {it.color} • Qty {it.qty}</p>
                  </div>
                  <span className="font-grotesk font-semibold text-white">{formatINR(it.price * it.qty)}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-[#2a2a30] pt-4">
              <span className="text-sm text-[#8b8b93]">{/cash/i.test(order.payment_method || "") ? "Due on delivery" : "Total paid"}</span>
              <span className="font-display text-2xl text-white">{formatINR(order.total)}</span>
            </div>
            <a href={receiptUrl(order.order_id, phone)} target="_blank" rel="noreferrer" data-testid="track-receipt-link"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-lime hover:underline">
              <Download size={15} /> Download receipt
            </a>
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#0f0f12] p-3 text-sm text-[#c9c9cf]">
              <MapPin size={15} className="mt-0.5 shrink-0 text-lime" />
              <span>{order.address?.line}, {order.address?.city}, {order.address?.stateName} – {order.address?.pincode}</span>
            </div>
          </div>
        </motion.div>
      )}

      {!order && !err && (
        <div className="mt-8 grid place-items-center rounded-2xl border border-dashed border-[#2a2a30] py-14 text-center">
          <Package size={40} className="text-[#2a2a30]" />
          <p className="mt-3 text-sm text-[#8b8b93]">Your order status will appear here.</p>
          <Link to="/men" className="mt-3 text-sm font-semibold text-lime hover:underline">Continue shopping</Link>
        </div>
      )}
    </div>
  );
}
