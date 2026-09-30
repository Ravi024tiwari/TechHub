import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Zap,
  Gift,
  Crown,
  Percent,
  Tag,
  Flame,
  ShieldCheck,
  Calendar,
  Clock,
  Check,
  Copy,
  AlertCircle,
  HelpCircle,
  Wand2,
  Loader2,
  DollarSign,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import CouponCard from "./CouponCard";
import { createCouponApi, updateCouponApi } from "../../api/couponApi";

// Icon selector options
const ICON_OPTIONS = [
  { id: "zap", label: "Lightning", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
  { id: "sparkles", label: "Sparkles", icon: Sparkles, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { id: "crown", label: "Crown", icon: Crown, color: "text-amber-400", bg: "bg-amber-400/10" },
  { id: "gift", label: "Gift", icon: Gift, color: "text-rose-500", bg: "bg-rose-500/10" },
  { id: "percent", label: "Percent", icon: Percent, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "flame", label: "Flame", icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
  { id: "shield-check", label: "Shield", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { id: "tag", label: "Tag", icon: Tag, color: "text-slate-400", bg: "bg-slate-400/10" },
];

/**
 * Format a Date to YYYY-MM-DDTHH:mm for datetime-local input
 */
const toDateTimeLocal = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function AdminCouponModal({
  isOpen,
  onClose,
  couponToEdit = null,
  onSuccess,
}) {
  const isEditing = Boolean(couponToEdit);

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE", // "PERCENTAGE" | "FLAT"
    discountValue: 10,
    maxDiscountAmount: "",
    minOrderValue: 0,
    startDate: toDateTimeLocal(new Date()),
    expiryDate: toDateTimeLocal(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // default 30 days
    usageLimit: "",
    usageLimitPerUser: 1,
    icon: "percent",
    badgeText: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Populate form if editing
  useEffect(() => {
    if (couponToEdit) {
      setFormData({
        code: couponToEdit.code || "",
        description: couponToEdit.description || "",
        discountType: couponToEdit.discountType || "PERCENTAGE",
        discountValue: couponToEdit.discountValue ?? 10,
        maxDiscountAmount: couponToEdit.maxDiscountAmount ?? "",
        minOrderValue: couponToEdit.minOrderValue ?? 0,
        startDate: toDateTimeLocal(couponToEdit.startDate || new Date()),
        expiryDate: toDateTimeLocal(couponToEdit.expiryDate),
        usageLimit: couponToEdit.usageLimit ?? "",
        usageLimitPerUser: couponToEdit.usageLimitPerUser ?? 1,
        icon: couponToEdit.icon || "percent",
        badgeText: couponToEdit.badgeText || "",
        isActive: couponToEdit.isActive !== undefined ? couponToEdit.isActive : true,
      });
    } else {
      // Defaults for new coupon
      setFormData({
        code: "",
        description: "",
        discountType: "PERCENTAGE",
        discountValue: 15,
        maxDiscountAmount: 2000,
        minOrderValue: 5000,
        startDate: toDateTimeLocal(new Date()),
        expiryDate: toDateTimeLocal(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        usageLimit: 1000,
        usageLimitPerUser: 1,
        icon: "zap",
        badgeText: "LIMITED DEAL",
        isActive: true,
      });
    }
    setErrors({});
  }, [couponToEdit, isOpen]);

  if (!isOpen) return null;

  // Handle inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "code"
          ? value.toUpperCase().replace(/\s+/g, "")
          : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Quick Preset for Expiry Date
  const applyDatePreset = (days) => {
    const start = new Date(formData.startDate || new Date());
    const future = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
    setFormData((prev) => ({
      ...prev,
      expiryDate: toDateTimeLocal(future),
    }));
  };

  // Generate random promo code suggestion
  const generateRandomCode = () => {
    const prefixes = ["DEAL", "SAVE", "TECH", "PROMO", "MEGA", "VIP", "FEST"];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(10 + Math.random() * 90);
    setFormData((prev) => ({
      ...prev,
      code: `${randomPrefix}${randomNum}`,
    }));
  };

  // Form Validation
  const validateForm = () => {
    const errs = {};
    if (!formData.code.trim()) {
      errs.code = "Coupon code is required";
    } else if (formData.code.length < 3) {
      errs.code = "Code must be at least 3 characters";
    }

    if (!formData.description.trim()) {
      errs.description = "Please provide a customer-facing description";
    }

    if (!formData.discountValue || Number(formData.discountValue) <= 0) {
      errs.discountValue = "Discount value must be greater than 0";
    } else if (formData.discountType === "PERCENTAGE" && Number(formData.discountValue) > 100) {
      errs.discountValue = "Percentage cannot exceed 100%";
    }

    if (!formData.expiryDate) {
      errs.expiryDate = "Expiry date is required";
    } else {
      const start = new Date(formData.startDate);
      const end = new Date(formData.expiryDate);
      if (end <= start) {
        errs.expiryDate = "Expiry date must be after the start date";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const payload = {
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        maxDiscountAmount:
          formData.discountType === "PERCENTAGE" && formData.maxDiscountAmount
            ? Number(formData.maxDiscountAmount)
            : null,
        minOrderValue: Number(formData.minOrderValue) || 0,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString(),
        expiryDate: new Date(formData.expiryDate).toISOString(),
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        usageLimitPerUser: Number(formData.usageLimitPerUser) || 1,
        icon: formData.icon || "percent",
        badgeText: formData.badgeText.trim(),
        isActive: Boolean(formData.isActive),
      };

      if (isEditing) {
        await updateCouponApi(couponToEdit._id, payload);
      } else {
        await createCouponApi(payload);
      }

      onSuccess(isEditing ? "Coupon updated successfully" : "New coupon campaign launched");
      onClose();
    } catch (err) {
      console.error("Error saving coupon:", err);
      const message = err.response?.data?.message || "Failed to save coupon campaign";
      setErrors((prev) => ({ ...prev, server: message }));
    } finally {
      setSubmitting(false);
    }
  };

  // Synthetic preview coupon object for live rendering
  const previewCoupon = {
    _id: "preview-card",
    code: formData.code || "SAMPLECODE",
    description: formData.description || "Get instant discount on eligible electronics and accessories.",
    discountType: formData.discountType,
    discountValue: Number(formData.discountValue) || 10,
    maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
    minOrderValue: Number(formData.minOrderValue) || 0,
    startDate: formData.startDate,
    expiryDate: formData.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    usageLimit: formData.usageLimit ? Number(formData.usageLimit) : 1000,
    usedCount: couponToEdit ? couponToEdit.usedCount : 0,
    icon: formData.icon,
    badgeText: formData.badgeText,
    isActive: formData.isActive,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl rounded-3xl bg-white dark:bg-[#0c0e15] border-2 border-slate-200/90 dark:border-white/10 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* =========================================================
            MODAL HEADER
            ========================================================= */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center shadow-md">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-heading font-black text-slate-950 dark:text-white">
                {isEditing ? `Edit Campaign: ${couponToEdit.code}` : "Create Promotional Campaign"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure discount rules, cart limits, and branding presentation.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Server error alert if any */}
        {errors.server && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errors.server}</span>
          </div>
        )}

        {/* =========================================================
            SPLIT BODY: FORM ON LEFT, LIVE PREVIEW ON RIGHT
            ========================================================= */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: FORM FIELDS (7 cols) */}
          <form onSubmit={handleSubmit} id="coupon-form" className="lg:col-span-7 space-y-5">
            {/* Promo Code & Random Generator */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span>Coupon Code</span>
                  <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={generateRandomCode}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white cursor-pointer transition-colors"
                >
                  <Wand2 className="size-3" />
                  <span>Suggest Code</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g. FLASH25, SAVE500"
                  maxLength={25}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.05] border ${
                    errors.code
                      ? "border-rose-500"
                      : "border-slate-300 dark:border-white/10"
                  } text-sm font-mono font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white transition-all uppercase`}
                />
              </div>
              {errors.code && (
                <span className="text-[11px] text-rose-500 mt-1 block font-mono">
                  {errors.code}
                </span>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1.5">
                <span>Description & Terms</span>
                <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                placeholder="Brief summary visible to shoppers at checkout..."
                className={`w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] border ${
                  errors.description
                    ? "border-rose-500"
                    : "border-slate-300 dark:border-white/10"
                } text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white transition-all`}
              />
              {errors.description && (
                <span className="text-[11px] text-rose-500 mt-1 block font-mono">
                  {errors.description}
                </span>
              )}
            </div>

            {/* Discount Type & Value Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Discount Type Radio Selector */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1.5">
                  Discount Type
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-300 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({ ...p, discountType: "PERCENTAGE" }))
                    }
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      formData.discountType === "PERCENTAGE"
                        ? "bg-white text-slate-950 dark:bg-white/20 dark:text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                    }`}
                  >
                    % Percentage
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({ ...p, discountType: "FLAT" }))
                    }
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      formData.discountType === "FLAT"
                        ? "bg-white text-slate-950 dark:bg-white/20 dark:text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                    }`}
                  >
                    ₹ Flat Off
                  </button>
                </div>
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1.5">
                  {formData.discountType === "PERCENTAGE" ? "Discount Rate (%)" : "Flat Amount (₹)"}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  name="discountValue"
                  value={formData.discountValue}
                  onChange={handleChange}
                  min={1}
                  max={formData.discountType === "PERCENTAGE" ? 100 : 1000000}
                  className={`w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] border ${
                    errors.discountValue
                      ? "border-rose-500"
                      : "border-slate-300 dark:border-white/10"
                  } text-sm font-mono font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white transition-all`}
                />
                {errors.discountValue && (
                  <span className="text-[11px] text-rose-500 mt-1 block font-mono">
                    {errors.discountValue}
                  </span>
                )}
              </div>
            </div>

            {/* Max Discount & Min Order Value */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Max Discount Cap (only for percentage) */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1.5">
                  <span>Max Cap (₹)</span>
                  <span className="text-slate-400 font-normal ml-1">
                    {formData.discountType === "PERCENTAGE" ? "(Optional)" : "(N/A)"}
                  </span>
                </label>
                <input
                  type="number"
                  name="maxDiscountAmount"
                  value={formData.maxDiscountAmount}
                  onChange={handleChange}
                  disabled={formData.discountType === "FLAT"}
                  placeholder={formData.discountType === "PERCENTAGE" ? "e.g. 2500" : "Not applicable"}
                  min={0}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-300 dark:border-white/10 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white transition-all disabled:opacity-40"
                />
              </div>

              {/* Minimum Order Value */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1.5">
                  Min. Cart Order (₹)
                </label>
                <input
                  type="number"
                  name="minOrderValue"
                  value={formData.minOrderValue}
                  onChange={handleChange}
                  placeholder="0 for no minimum"
                  min={0}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-300 dark:border-white/10 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white transition-all"
                />
              </div>
            </div>

            {/* Branding: Icon Pod & Badge Text */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Visual Branding & Ribbon
                </span>
                <span className="text-[11px] font-mono text-slate-500">Pick theme icon</span>
              </div>

              {/* Icon selector pill grid */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {ICON_OPTIONS.map((item) => {
                  const Icon = item.icon;
                  const isSelected = formData.icon === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, icon: item.id }))}
                      title={item.label}
                      className={`h-11 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950 ring-2 ring-slate-950 dark:ring-white scale-105 shadow-xs"
                          : "bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:scale-102"
                      }`}
                    >
                      <Icon className="size-4" />
                      <span className="text-[9px] font-mono font-bold mt-0.5 truncate max-w-[90%]">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Promotional Ribbon Text */}
              <div>
                <label className="block text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ribbon Badge Text (Optional)
                </label>
                <input
                  type="text"
                  name="badgeText"
                  value={formData.badgeText}
                  onChange={handleChange}
                  placeholder="e.g. LIGHTNING DEAL, VIP HARDWARE, STOREWIDE"
                  maxLength={22}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-xs font-mono uppercase text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white transition-all"
                />
              </div>
            </div>

            {/* Validity Dates & Presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1">
                  <span>Campaign Timeline</span>
                  <span className="text-rose-500">*</span>
                </label>
                {/* Quick Presets */}
                <div className="flex items-center gap-1">
                  {[
                    { days: 7, label: "+7d" },
                    { days: 30, label: "+30d" },
                    { days: 90, label: "+90d" },
                  ].map((p) => (
                    <button
                      key={p.days}
                      type="button"
                      onClick={() => applyDatePreset(p.days)}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/10 dark:hover:bg-white/20 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="block text-[11px] font-mono text-slate-500 mb-1">
                    Start Date & Time
                  </span>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-300 dark:border-white/10 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white"
                  />
                </div>

                <div>
                  <span className="block text-[11px] font-mono text-slate-500 mb-1">
                    Expiry Date & Time
                  </span>
                  <input
                    type="datetime-local"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] border ${
                      errors.expiryDate
                        ? "border-rose-500"
                        : "border-slate-300 dark:border-white/10"
                    } text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white`}
                  />
                  {errors.expiryDate && (
                    <span className="text-[11px] text-rose-500 mt-1 block font-mono">
                      {errors.expiryDate}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Usage Limits & Active Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                  Total Uses
                </label>
                <input
                  type="number"
                  name="usageLimit"
                  value={formData.usageLimit}
                  onChange={handleChange}
                  placeholder="Unlimited"
                  min={1}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-300 dark:border-white/10 text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                  Per Shopper
                </label>
                <input
                  type="number"
                  name="usageLimitPerUser"
                  value={formData.usageLimitPerUser}
                  onChange={handleChange}
                  min={1}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-300 dark:border-white/10 text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-300 dark:border-white/10 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="size-4 accent-slate-950 dark:accent-white rounded cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    Publish Active
                  </span>
                </label>
              </div>
            </div>
          </form>

          {/* RIGHT: LIVE INTERACTIVE PREVIEW (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-slate-50/50 dark:bg-[#080a0f] p-4 sm:p-5 rounded-3xl border-2 border-slate-200/80 dark:border-white/10">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Live Ticket Preview
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  Real-time render
                </span>
              </div>

              {/* Render actual CouponCard */}
              <div className="pt-2">
                <CouponCard coupon={previewCoupon} mode="admin" />
              </div>
            </div>

            {/* Helper tips */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <HelpCircle className="size-3.5 text-blue-500" />
                <span>Conversion Best Practices</span>
              </div>
              <p>
                • Keep promo codes memorable, concise, and easy to type (e.g. <strong className="font-mono">TECH10</strong>).
              </p>
              <p>
                • Set a minimum cart value to protect your sales margins on high-tier discounts.
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================
            MODAL FOOTER ACTIONS
            ========================================================= */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-white/10 transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="coupon-form"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all hover:scale-102 active:scale-98 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Saving Campaign...</span>
              </>
            ) : (
              <>
                <span>{isEditing ? "Update Coupon" : "Launch Campaign"}</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
