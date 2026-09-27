import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight, Package, Truck, Calendar } from "lucide-react";

/**
 * Production-Grade Order Confirmation Screen
 */
export default function CartOrderSuccess({
  selectedAddress,
  placedOrderDetails,
}) {
  const orderId =
    placedOrderDetails?._id ||
    placedOrderDetails?.orderId ||
    placedOrderDetails?.id;

  return (
    <main className="flex-1 w-full max-w-[720px] mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center animate-in fade-in zoom-in-95 duration-200">
      <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/10 shadow-xl">
        <div className="h-20 w-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 dark:text-white mb-2">
          Hardware Order Confirmed!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 font-sans">
          Thank you for shopping with TechHub. Your order has been placed successfully and is being prepped for rapid courier dispatch.
        </p>

        {orderId && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-xs font-mono font-bold mb-6">
            <span>Order ID: #{String(orderId).slice(-8).toUpperCase()}</span>
          </div>
        )}

        {selectedAddress && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-left mb-6 text-xs space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">
              Delivery Destination
            </span>
            <p className="font-bold text-slate-900 dark:text-white text-sm">
              {selectedAddress.fullName}
            </p>
            <p className="text-slate-600 dark:text-slate-300 font-sans">
              {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} -{" "}
              <strong className="font-mono text-slate-900 dark:text-white">
                {selectedAddress.pincode}
              </strong>
            </p>
            <p className="text-slate-500 dark:text-slate-400 font-mono">
              Contact: +91 {selectedAddress.phone}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={orderId ? `/orders/${orderId}` : "/orders"}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-heading font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-500/25 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
          >
            <Package className="h-4 w-4" />
            <span>Track My Order</span>
          </Link>
          <Link
            to="/products"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 dark:bg-white/[0.06] text-slate-800 dark:text-white font-heading font-bold text-xs uppercase tracking-wider border border-slate-200 dark:border-white/10 hover:border-slate-300 transition-all text-center"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
