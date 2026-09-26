import React, { useState, useEffect } from "react";
import {
  X,
  MapPin,
  Home,
  Briefcase,
  Building,
  Check,
  AlertCircle,
  Loader2,
  User,
  Phone,
  Compass,
  Hash,
  Star,
  ShieldCheck,
} from "lucide-react";
import { useAddAddressMutation, useUpdateAddressMutation } from "@/hooks/useAddresses";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Chandigarh",
];

/**
 * Enterprise Production-Grade Address Modal:
 * - Ambient backdrop blur with smooth scale & fade animations.
 * - Icon-anchored form inputs with real-time validation highlights.
 * - Color-coded Category selectors (Home: Sky, Work: Violet, Other: Amber).
 * - Interactive Default Dispatch switch card.
 * - Sticky responsive footer with high-contrast emerald gradient CTA.
 */
export default function AddressModal({
  isOpen,
  onClose,
  initialData = null,
  isFirstAddress = false,
  onSuccessCallback = null,
}) {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    street: "",
    landmark: "",
    city: "",
    state: "Maharashtra",
    pincode: "",
    addressType: "home",
    isDefault: false,
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const addAddressMutation = useAddAddressMutation();
  const updateAddressMutation = useUpdateAddressMutation();

  const isEditing = Boolean(initialData?._id);
  const isLoading = addAddressMutation.isPending || updateAddressMutation.isPending;

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName || "",
        phone: initialData.phone || "",
        street: initialData.street || "",
        landmark: initialData.landmark || "",
        city: initialData.city || "",
        state: initialData.state || "Maharashtra",
        pincode: initialData.pincode || "",
        addressType: initialData.addressType || "home",
        isDefault: Boolean(initialData.isDefault),
      });
    } else {
      setFormData({
        fullName: "",
        phone: "",
        street: "",
        landmark: "",
        city: "",
        state: "Maharashtra",
        pincode: "",
        addressType: "home",
        isDefault: isFirstAddress,
      });
    }
    setErrors({});
    setApiError("");
  }, [initialData, isOpen, isFirstAddress]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phone.trim() || !phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = "Enter a valid 10-digit mobile number starting with 6-9";
    }

    if (!formData.street.trim() || formData.street.trim().length < 5) {
      newErrors.street = "Street address must be at least 5 characters";
    }

    if (!formData.city.trim() || formData.city.trim().length < 2) {
      newErrors.city = "City name is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "Please select your state";
    }

    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!formData.pincode.toString().trim() || !pincodeRegex.test(formData.pincode.toString().trim())) {
      newErrors.pincode = "Enter a valid 6-digit postal PIN code";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!validate()) return;

    try {
      if (isEditing) {
        await updateAddressMutation.mutateAsync({
          addressId: initialData._id,
          ...formData,
        });
      } else {
        await addAddressMutation.mutateAsync({
          ...formData,
          isDefault: isFirstAddress ? true : formData.isDefault,
        });
      }

      if (onSuccessCallback) {
        onSuccessCallback();
      }
      onClose();
    } catch (err) {
      setApiError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save address. Please verify your details."
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative background ambient flares */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/70 dark:bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/25 shadow-sm shrink-0">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                  {isEditing ? "Edit Shipping Address" : "Add New Shipping Address"}
                </h2>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Precision delivery details for hardware orders & rapid courier dispatch
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 no-scrollbar">
          {apiError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-500 text-xs flex items-center gap-2.5 font-medium animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Full Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Recipient Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Ravi Tiwari"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/[0.04] border ${
                    errors.fullName
                      ? "border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      : "border-slate-200 dark:border-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  } text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-all`}
                />
              </div>
              {errors.fullName && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <span>{errors.fullName}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                10-Digit Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-white/10">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, phone: digits });
                  }}
                  className={`w-full pl-14 pr-8 py-2.5 rounded-xl text-xs font-mono bg-slate-50 dark:bg-white/[0.04] border ${
                    errors.phone
                      ? "border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      : "border-slate-200 dark:border-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  } text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-all`}
                />
                {formData.phone.length === 10 && /^[6-9]\d{9}$/.test(formData.phone) && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-500" />
                )}
              </div>
              {errors.phone && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Street Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Flat, House No., Building, Street Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <textarea
                rows={2}
                placeholder="e.g. Flat 402, Titanium Heights, Tech Park Main Road"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/[0.04] border ${
                  errors.street
                    ? "border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    : "border-slate-200 dark:border-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                } text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-all resize-none`}
              />
            </div>
            {errors.street && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.street}</p>
            )}
          </div>

          {/* Landmark */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Landmark or Delivery Instructions (Optional)
              </label>
              <span className="text-[10px] text-slate-400 font-mono">Assists courier delivery</span>
            </div>
            <div className="relative">
              <Compass className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Near Ambedkar Statue / Opposite City Mall"
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* City, State, PIN Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                City <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Mumbai"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/[0.04] border ${
                  errors.city
                    ? "border-rose-500 focus:border-rose-500"
                    : "border-slate-200 dark:border-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                } text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-all`}
              />
              {errors.city && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                State <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#0c1017] border border-slate-200 dark:border-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white focus:outline-none transition-all"
              >
                {INDIAN_STATES.map((st) => (
                  <option
                    key={st}
                    value={st}
                    className="bg-white dark:bg-[#0c1017] text-slate-900 dark:text-white"
                  >
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Postal PIN Code <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="400001"
                  value={formData.pincode}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, pincode: digits });
                  }}
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs font-mono bg-slate-50 dark:bg-white/[0.04] border ${
                    errors.pincode
                      ? "border-rose-500 focus:border-rose-500"
                      : "border-slate-200 dark:border-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  } text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-all`}
                />
              </div>
              {errors.pincode && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.pincode}</p>
              )}
            </div>
          </div>

          {/* Color-Coded Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Address Category
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                {
                  id: "home",
                  label: "Home",
                  icon: Home,
                  desc: "All Day Delivery",
                  activeClasses:
                    "bg-sky-500/10 border-sky-500 text-sky-600 dark:text-sky-400 ring-2 ring-sky-500/20 shadow-md shadow-sky-500/10",
                  iconBadge: "bg-sky-500/20 text-sky-500",
                },
                {
                  id: "work",
                  label: "Work",
                  icon: Briefcase,
                  desc: "10 AM - 6 PM",
                  activeClasses:
                    "bg-violet-500/10 border-violet-500 text-violet-600 dark:text-violet-400 ring-2 ring-violet-500/20 shadow-md shadow-violet-500/10",
                  iconBadge: "bg-violet-500/20 text-violet-500",
                },
                {
                  id: "other",
                  label: "Other",
                  icon: Building,
                  desc: "Standard Dispatch",
                  activeClasses:
                    "bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500/20 shadow-md shadow-amber-500/10",
                  iconBadge: "bg-amber-500/20 text-amber-500",
                },
              ].map((type) => {
                const Icon = type.icon;
                const isSelected = formData.addressType === type.id;

                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, addressType: type.id })}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-1.5 transition-all duration-200 cursor-pointer active:scale-95 ${
                      isSelected
                        ? type.activeClasses
                        : "bg-slate-50/70 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-100/50 dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div
                        className={`h-7 w-7 rounded-lg flex items-center justify-center ${
                          isSelected
                            ? type.iconBadge
                            : "bg-slate-100 dark:bg-white/[0.06] text-slate-400"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      {isSelected && (
                        <span className="h-4 w-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <span className="font-heading font-bold text-xs">{type.label}</span>
                    <span className="text-[10px] text-slate-400 leading-tight">
                      {type.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Default Dispatch Toggle Card */}
          <div className="pt-1">
            <div
              onClick={() => {
                if (!isFirstAddress) {
                  setFormData({ ...formData, isDefault: !formData.isDefault });
                }
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                formData.isDefault || isFirstAddress
                  ? "bg-emerald-500/[0.08] border-emerald-500/40 ring-1 ring-emerald-500/20"
                  : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                    formData.isDefault || isFirstAddress
                      ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"
                      : "bg-slate-200 dark:bg-white/10 text-slate-400"
                  }`}
                >
                  <Star className="h-4 w-4 fill-current" />
                </div>
                <div>
                  <span className="font-heading font-bold text-xs text-slate-900 dark:text-white block">
                    Set as default delivery address
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    {isFirstAddress
                      ? "First saved address is automatically designated as primary."
                      : "Pre-selected for instant 1-click checkout and rapid dispatches."}
                  </span>
                </div>
              </div>

              {/* Styled Pill Toggle */}
              <div
                className={`w-10 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                  formData.isDefault || isFirstAddress
                    ? "bg-emerald-500 justify-end"
                    : "bg-slate-300 dark:bg-white/20 justify-start"
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
              </div>
            </div>
          </div>

          {/* Modal Actions Footer */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-white/10 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl text-xs font-heading font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{isEditing ? "Save Changes" : "Save Address"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
