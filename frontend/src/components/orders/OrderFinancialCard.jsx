import React, { useState } from "react";
import {
  CreditCard,
  Banknote,
  Receipt,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  Tag,
  FileCheck,
} from "lucide-react";

const formatINR = (val) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val || 0);

export default function OrderFinancialCard({ order }) {
  const [copiedTxn, setCopiedTxn] = useState(false);

  const pricing = order?.pricing || {};
  const payment = order?.paymentInfo || {};
  const coupon = order?.coupon || {};

  const handleCopyTxn = (id) => {
    if (!id) return;
    navigator.clipboard?.writeText(id);
    setCopiedTxn(true);
    setTimeout(() => setCopiedTxn(false), 2000);
  };

  const getPaymentStatusBadge = (st) => {
    switch (st) {
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 ring-1 ring-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>PAID</span>
          </span>
        );
      case "REFUNDED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/30 ring-1 ring-purple-500/20">
            <Clock className="w-3.5 h-3.5" />
            <span>REFUNDED</span>
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30 ring-1 ring-rose-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>FAILED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 ring-1 ring-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            <span>PENDING</span>
          </span>
        );
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/30 hover:border-slate-400 dark:hover:border-white/50 shadow-sm transition-all space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30 flex items-center justify-center shrink-0 shadow-xs">
            <Receipt className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="font-heading font-black text-base sm:text-lg text-slate-900 dark:text-white">
              Financial & Invoice Ledger
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
              Itemized charges, GST tax breakdown, and gateway status
            </p>
          </div>
        </div>
      </div>

      {/* Itemized Calculation List with Admin Palette */}
      <div className="space-y-3 text-xs sm:text-sm font-sans">
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <span>Items Subtotal</span>
          <span className="font-mono font-bold text-slate-900 dark:text-white">
            {formatINR(pricing.itemsTotal)}
          </span>
        </div>

        {/* Coupon Discount */}
        {pricing.discountAmount > 0 && (
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Tag className="w-3.5 h-3.5" />
              <span>Coupon Discount {coupon.code ? `(${coupon.code})` : ""}</span>
            </span>
            <span className="font-mono font-bold">
              -{formatINR(pricing.discountAmount)}
            </span>
          </div>
        )}

        {/* GST Tax Breakdown */}
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Applicable GST (CGST 9% + SGST 9%)</span>
          </span>
          <span className="font-mono font-bold text-slate-900 dark:text-white">
            {formatINR(pricing.taxAmount)}
          </span>
        </div>

        {/* Shipping & Delivery Fee */}
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <span>Courier Shipping & Handling</span>
          <span className="font-mono font-bold text-slate-900 dark:text-white">
            {pricing.shippingFee === 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase text-xs">
                FREE Delivery
              </span>
            ) : (
              formatINR(pricing.shippingFee)
            )}
          </span>
        </div>

        {/* Grand Total Hero Block */}
        <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/10 border-2 border-orange-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
          <div>
            <span className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider block">
              Grand Total (Net Amount)
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
              All inclusive • GST & express logistics settled
            </span>
          </div>
          <span className="font-mono font-black text-2xl sm:text-3xl text-orange-600 dark:text-orange-400 tracking-tight">
            {formatINR(pricing.grandTotal)}
          </span>
        </div>
      </div>

      {/* Payment Details Container matching Admin Card */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-300 dark:border-white/20 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-sans uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
            Payment Mode & Gateway
          </span>
          {getPaymentStatusBadge(payment.status)}
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/20 flex items-center justify-center shrink-0 shadow-xs">
            {payment.method === "COD" ? (
              <Banknote className="w-4 h-4 text-emerald-500" />
            ) : (
              <CreditCard className="w-4 h-4 text-orange-500" />
            )}
          </div>
          <div>
            <p className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
              {payment.method === "COD"
                ? "Cash on Delivery"
                : "Razorpay Secure Gateway (Prepaid)"}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
              {payment.method === "COD"
                ? "Pay cash or scan UPI upon courier doorstep delivery"
                : "256-bit automated transaction clearance verified"}
            </p>
          </div>
        </div>

        {/* Transaction ID if paid online */}
        {payment.razorpayPaymentId && (
          <div className="pt-2 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">Txn ID:</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
              <span>{payment.razorpayPaymentId}</span>
              <button
                type="button"
                onClick={() => handleCopyTxn(payment.razorpayPaymentId)}
                title="Copy Transaction ID"
                className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                {copiedTxn ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Paid At date */}
        {payment.paidAt && (
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Settled At:</span>
            <span>{new Date(payment.paidAt).toLocaleString("en-IN")}</span>
          </div>
        )}
      </div>
    </div>
  );
}
