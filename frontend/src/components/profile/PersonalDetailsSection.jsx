import React, { useState, useRef, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useUpdateProfileMutation } from "@/hooks/useAuth";
import {
  User,
  Camera,
  Mail,
  Lock,
  ShieldCheck,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";

/**
 * Production-Grade Personal Details & Profile Photo Section:
 * - Direct Cloudinary image upload with instant client preview.
 * - Profile avatar removal option.
 * - Full name and 10-digit phone number editing with validation.
 * - Immutable verified email address display.
 */
export default function PersonalDetailsSection({ user, fileInputRef: externalFileInputRef }) {
  const localFileInputRef = useRef(null);
  const fileInputRef = externalFileInputRef || localFileInputRef;

  const updateProfileMutation = useUpdateProfileMutation();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [removeAvatarFlag, setRemoveAvatarFlag] = useState(false);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const currentAvatarUrl =
    avatarPreview ||
    (!removeAvatarFlag &&
      (typeof user?.avatar === "object" ? user?.avatar?.url : user?.avatar));

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrorMsg("Please choose an image file (JPG, PNG, WebP).");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("Image size exceeds 5MB limit.");
        return;
      }
      setAvatarFile(file);
      setRemoveAvatarFlag(false);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      setErrorMsg("");
    }
  };

  const handleRemovePhoto = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setRemoveAvatarFlag(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setErrorMsg("Full name must be at least 2 characters.");
      return;
    }

    const trimmedPhone = phone.trim();
    if (trimmedPhone && !/^[6-9]\d{9}$/.test(trimmedPhone)) {
      setErrorMsg("Please enter a valid 10-digit mobile number starting with 6-9.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", trimmedName);
      formData.append("phone", trimmedPhone);

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      } else if (removeAvatarFlag) {
        formData.append("removeAvatar", "true");
      }

      await updateProfileMutation.mutateAsync(formData);
      setSuccessMsg("Profile details and photo updated successfully!");
      setAvatarFile(null);
      setRemoveAvatarFlag(false);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message || err?.message || "Failed to update profile."
      );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left: Avatar Management Card */}
      <div className="lg:col-span-4">
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/10 shadow-sm text-center">
          <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white mb-4">
            Profile Photo
          </h3>

          <div className="relative inline-block mx-auto mb-4 group">
            <Avatar className="size-32 border-4 border-slate-100 dark:border-white/10 shadow-xl">
              {currentAvatarUrl && <AvatarImage src={currentAvatarUrl} alt={user?.name} />}
              <AvatarFallback className="text-4xl font-extrabold bg-gradient-to-tr from-sky-500 to-blue-600 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/jpg"
              onChange={handlePhotoSelect}
              className="hidden"
            />
          </div>

          <div className="space-y-2 max-w-xs mx-auto">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-heading font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-sky-500/20 hover:shadow-sky-500/35 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <Camera className="h-4 w-4" />
              <span>Upload New Photo</span>
            </button>

            {(currentAvatarUrl || avatarFile) && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 transition-colors cursor-pointer"
              >
                Remove Photo
              </button>
            )}

            <p className="text-[11px] text-slate-400 pt-2">
              Supports JPG, PNG or WebP up to 5MB. Photo is securely processed via Cloudinary CDN.
            </p>
          </div>
        </div>
      </div>

      {/* Right: Personal Information Form */}
      <div className="lg:col-span-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between pb-5 border-b border-slate-200 dark:border-white/10 mb-6">
            <div>
              <h2 className="font-heading font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                Personal Information
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Update your identity and contact info used for deliveries & order communications.
              </p>
            </div>
          </div>

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2 font-medium">
              <Check className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Legal Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ravi Tiwari"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 focus:border-sky-500 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Mobile Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Mobile Number (for SMS & OTP updates)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 font-bold">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="9876543210"
                  className="w-full pl-12 pr-3.5 py-2.5 rounded-xl text-xs font-mono bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 focus:border-sky-500 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                10 digits starting with 6-9. Used by courier dispatch for delivery alerts.
              </p>
            </div>

            {/* Email Address (Immutable) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Permanent Email Address
                </label>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Verified Account Anchor</span>
                </span>
              </div>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs font-mono bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 cursor-not-allowed select-none"
                />
                <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Email address is permanent for account authentication security and cannot be changed directly.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="px-6 py-2.5 rounded-xl text-xs font-heading font-bold uppercase tracking-wider bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-md shadow-sky-500/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {updateProfileMutation.isPending && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
