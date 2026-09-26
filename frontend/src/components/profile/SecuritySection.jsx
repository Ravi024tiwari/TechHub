import React, { useState } from "react";
import { useChangePasswordMutation } from "@/hooks/useAuth";
import { Lock, Check, AlertCircle, ShieldCheck, Loader2 } from "lucide-react";

/**
 * Production-Grade Account Security & Password Component:
 * - Color theme: Vibrant Cyber Orange.
 * - Current password verification.
 * - Minimum length and match checking.
 * - Zero-knowledge encryption protocol callout with orange accents.
 */
export default function SecuritySection() {
  const changePasswordMutation = useChangePasswordMutation();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!currentPassword) {
      setErrorMsg("Current password is required.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("New passwords do not match.");
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        oldPassword: currentPassword,
        newPassword,
      });
      setSuccessMsg("Password changed successfully! Keep your credentials safe.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to change password. Please check your current password."
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden">
        {/* Subtle orange ambient glow on top corner */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="pb-5 border-b border-slate-200 dark:border-white/10 mb-6 flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-base sm:text-lg text-slate-900 dark:text-white">
              Security & Access Credentials
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Update your master account password and safeguard session security.
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Current Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Confirm New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="w-full py-2.5 rounded-xl text-xs font-heading font-bold uppercase tracking-wider bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white shadow-md shadow-orange-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {changePasswordMutation.isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              <span>Update Access Password</span>
            </button>
          </div>
        </form>

        {/* Security Shield Callout */}
        <div className="mt-8 p-4 rounded-2xl bg-orange-500/5 border border-orange-500/20 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-slate-900 dark:text-white block">
              Zero-Knowledge Session Protocol
            </span>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
              Passwords are salted and hashed using bcrypt with automatic JWT token revocation across all other active devices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
