import React, { useState, useRef } from "react";
import {
  RotateCcw,
  X,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Package,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Trash2,
  Clock,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useSubmitReturnMutation } from "@/hooks/useReturns";

const RETURN_REASON_OPTIONS = [
  { value: "DEFECTIVE_OR_NOT_WORKING", label: "Defective / Dead on Arrival (DOA)" },
  { value: "PHYSICAL_DAMAGE_ON_ARRIVAL", label: "Physical Damage on Delivery" },
  { value: "WRONG_ITEM_DELIVERED", label: "Wrong Model or Specifications Delivered" },
  { value: "MISSING_PARTS_OR_ACCESSORIES", label: "Missing Parts, Charger or Accessories" },
  { value: "DIFFERENT_FROM_DESCRIPTION", label: "Different from Product Description / Benchmarks" },
  { value: "OTHER", label: "Other Technical / Hardware Issue" },
];

export default function OrderReturnModal({
  isOpen,
  onClose,
  order,
  item,
  onSuccess,
}) {
  const [requestType, setRequestType] = useState("RETURN_AND_REFUND");
  const [reason, setReason] = useState(RETURN_REASON_OPTIONS[0].value);
  const [description, setDescription] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef(null);
  const submitReturnMutation = useSubmitReturnMutation();

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setRequestType("RETURN_AND_REFUND");
      setReason(RETURN_REASON_OPTIONS[0].value);
      setDescription("");
      setSerialNumber("");
      setSelectedFiles([]);
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      setPreviewUrls([]);
      setErrorMessage("");
      setIsSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen || !item || !order) return null;

  // Calculate return window countdown (7 days from delivery date)
  const deliveryDate = new Date(order.trackingInfo?.deliveredAt || order.updatedAt || Date.now());
  const elapsedDays = Math.floor((Date.now() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, 7 - elapsedDays);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (selectedFiles.length + files.length > 5) {
      setErrorMessage("You can upload a maximum of 5 evidence photos.");
      return;
    }

    const validFiles = [];
    const newPreviews = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Only image files (JPG, PNG, WEBP) are allowed.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage(`Image '${file.name}' exceeds the 5MB size limit.`);
        return;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
    setErrorMessage("");

    // Reset input value so same files can be re-selected if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (index) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!description.trim() || description.trim().length < 10) {
      setErrorMessage("Please describe the defect symptoms in at least 10 characters.");
      return;
    }

    const formData = new FormData();
    formData.append("orderId", order._id);
    formData.append("orderItemId", item._id);
    formData.append("requestType", requestType);
    formData.append("reason", reason);
    formData.append("description", description.trim());
    if (serialNumber.trim()) {
      formData.append("serialNumber", serialNumber.trim());
    }

    // Attach up to 5 photos
    selectedFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      await submitReturnMutation.mutateAsync(formData);

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 2500);
    } catch (err) {
      setErrorMessage(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to submit return request. An active RMA request may already exist."
      );
    }
  };

  const pickup = order.shippingAddress || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/15 p-5 sm:p-7 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
            <RotateCcw className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-black text-base sm:text-lg text-slate-900 dark:text-white">
                Hardware Return & Replacement Request
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
              Order #{order.orderNumber} • Verified Purchase
            </p>
          </div>
        </div>

        {/* 7-Day Window Assurance Banner */}
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-sans font-medium">
            <Clock className="w-4 h-4 shrink-0 text-amber-500" />
            <span>
              7-Day Concierge Coverage: <strong>{daysRemaining} day{daysRemaining === 1 ? "" : "s"} remaining</strong> to file
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
            Active Window
          </span>
        </div>

        {/* Item Preview */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10">
          <div className="h-14 w-14 rounded-xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 shrink-0 p-1 flex items-center justify-center overflow-hidden">
            {item.image ? (
              <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
            ) : (
              <Package className="h-6 w-6 text-slate-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-heading font-black text-xs sm:text-sm text-slate-900 dark:text-white truncate">
              {item.title}
            </h4>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] font-sans text-slate-500 dark:text-slate-400">
              <span className="font-mono text-orange-600 dark:text-orange-400 font-bold">
                Qty: {item.quantity}
              </span>
              {item.selectedSpecs?.color && <span>• Color: {item.selectedSpecs.color}</span>}
              <span>•</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                ₹{(item.price || 0).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Success State */}
        {isSuccess ? (
          <div className="py-8 text-center space-y-3 animate-in fade-in duration-300">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h4 className="font-heading font-black text-lg text-slate-900 dark:text-white">
              RMA Application Filed Successfully!
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-sans leading-relaxed">
              Our hardware quality team is reviewing your evidence. Reverse doorstep courier pickup or replacement dispatch tracking will update right on your order card.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Resolution Preference (Refund vs Replacement) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-heading font-extrabold text-slate-800 dark:text-slate-200">
                Resolution Preference <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRequestType("RETURN_AND_REFUND")}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    requestType === "RETURN_AND_REFUND"
                      ? "bg-rose-500/[0.08] border-rose-500 text-rose-700 dark:text-rose-400 ring-1 ring-rose-500/30"
                      : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20"
                  }`}
                >
                  <div className="font-heading font-black text-xs">Return & Full Refund</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                    Original payment source refund upon warehouse receipt
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRequestType("REPLACEMENT")}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    requestType === "REPLACEMENT"
                      ? "bg-orange-500/[0.08] border-orange-500 text-orange-700 dark:text-orange-400 ring-1 ring-orange-500/30"
                      : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20"
                  }`}
                >
                  <div className="font-heading font-black text-xs">Replace with Same Product</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                    Brand new sealed unit shipped via priority courier
                  </div>
                </button>
              </div>
            </div>

            {/* Reason for Return Dropdown */}
            <div className="space-y-1">
              <label className="block text-xs font-heading font-bold text-slate-700 dark:text-slate-300">
                Primary Reason <span className="text-rose-500">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:border-rose-500 cursor-pointer"
              >
                {RETURN_REASON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#0c0f17]">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Hardware Serial Number / IMEI */}
            <div className="space-y-1">
              <label className="block text-xs font-heading font-bold text-slate-700 dark:text-slate-300">
                Hardware Serial Number / IMEI (Optional)
              </label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="e.g. SN-8942-019X or IMEI barcode"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:border-rose-500 font-mono"
              />
            </div>

            {/* Detailed Description */}
            <div className="space-y-1">
              <label className="block text-xs font-heading font-bold text-slate-700 dark:text-slate-300">
                Fault / Defect Symptoms <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the hardware failure, screen lines, dead pixels, or courier box damages..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:border-rose-500 resize-none font-sans"
              />
            </div>

            {/* Defect Evidence Photos Upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-heading font-bold text-slate-700 dark:text-slate-300">
                  Defect Proof Photos (Up to 5)
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {selectedFiles.length}/5 photos
                </span>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Upload trigger / Previews grid */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                {previewUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative group aspect-square rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/15 overflow-hidden"
                  >
                    <img src={url} alt={`evidence-${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="absolute top-1 right-1 p-1 rounded-md bg-black/70 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {selectedFiles.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border border-dashed border-slate-300 dark:border-white/20 hover:border-orange-500 dark:hover:border-orange-500 bg-slate-50/50 dark:bg-white/[0.02] flex flex-col items-center justify-center p-2 text-slate-400 hover:text-orange-500 transition-all cursor-pointer group"
                  >
                    <Upload className="w-4 h-4 mb-1 group-hover:-translate-y-0.5 transition-transform" />
                    <span className="text-[10px] font-heading font-bold">Add Photo</span>
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-sans">
                JPG, PNG, or WEBP up to 5MB. Clear photos expedite instant review approval.
              </p>
            </div>

            {/* Reverse Pickup Address Confirmation */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 flex items-start gap-2.5 text-xs">
              <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-heading font-bold text-slate-800 dark:text-slate-200 block">
                  Reverse Doorstep Pickup Destination
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans block mt-0.5">
                  {pickup.fullName || order.user?.name || "Customer"}, {pickup.street || ""}, {pickup.city || ""}, {pickup.state || ""} - {pickup.pincode || ""}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/80 dark:border-white/10">
              <button
                type="button"
                onClick={onClose}
                disabled={submitReturnMutation.isPending}
                className="px-4 py-2.5 rounded-xl text-xs font-heading font-bold bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitReturnMutation.isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-heading font-bold bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white shadow-md shadow-rose-600/25 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
              >
                {submitReturnMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <span>
                    Submit {requestType === "REPLACEMENT" ? "Replacement" : "Return"} Application
                  </span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
