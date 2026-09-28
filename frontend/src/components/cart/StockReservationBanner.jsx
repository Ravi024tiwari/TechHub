import React, { useState, useEffect } from "react";
import { Clock, ShieldAlert, XCircle, Sparkles, CheckCircle2, Lock } from "lucide-react";

/**
 * Production-Grade Concurrency Stock Reservation Banner:
 * - Real-time countdown clock (10-minute hold window)
 * - Visual progress indicator
 * - Urgency color shifting (Green/Orange -> Pulsing Crimson)
 * - Interactive release lock action
 */
export default function StockReservationBanner({
  remainingSeconds: initialSeconds,
  expiresAt,
  onExpire,
  onCancelReservation,
  isCancelling = false
}) {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (expiresAt) {
      const diff = Math.max(
        0,
        Math.round((new Date(expiresAt).getTime() - Date.now()) / 1000)
      );
      return diff;
    }
    return initialSeconds || 600;
  });

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (onExpire) onExpire();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onExpire) onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, onExpire]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const TOTAL_HOLD_SECONDS = 600; // 10 minutes
  const progressPercent = Math.min(
    100,
    Math.max(0, (secondsLeft / TOTAL_HOLD_SECONDS) * 100)
  );

  const isUrgent = secondsLeft < 120; // Under 2 minutes

  if (secondsLeft <= 0) {
    return (
      <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-between gap-3 animate-fade-in mb-6">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="h-5 w-5 shrink-0 text-rose-500" />
          <p className="text-xs sm:text-sm font-semibold">
            Stock reservation timeout reached. Inventory has been released to available stock.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-4 sm:p-5 rounded-3xl border transition-all duration-300 relative overflow-hidden mb-6 ${
        isUrgent
          ? "bg-rose-500/10 border-rose-500/40 text-rose-700 dark:text-rose-300 shadow-lg shadow-rose-500/10"
          : "bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-emerald-500/10 border-orange-500/30 text-slate-800 dark:text-slate-200 shadow-md shadow-orange-500/5"
      }`}
    >
      {/* Background Micro Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-200/50 dark:bg-white/10">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${
            isUrgent ? "bg-rose-500" : "bg-gradient-to-r from-orange-500 to-amber-500"
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Lock Status & Description */}
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 border mt-0.5 sm:mt-0 ${
              isUrgent
                ? "bg-rose-500/20 text-rose-500 border-rose-500/30 animate-pulse"
                : "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30"
            }`}
          >
            <Lock className="h-5 w-5" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-heading font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                Stock Hold Active
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider ${
                    isUrgent
                      ? "bg-rose-500 text-white animate-bounce"
                      : "bg-orange-500 text-white"
                  }`}
                >
                  Concurrency Protected
                </span>
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-sans mt-0.5">
              {isUrgent
                ? "Hurry! Less than 2 minutes remain to complete payment before items unlock."
                : "Cart items are temporarily reserved for your order so no one else can purchase them."}
            </p>
          </div>
        </div>

        {/* Right: Live Digital Countdown & Release Action */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0 self-end sm:self-center">
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border font-mono text-base sm:text-lg font-black tracking-wider ${
              isUrgent
                ? "bg-rose-500/20 border-rose-500/50 text-rose-600 dark:text-rose-400 ring-2 ring-rose-500/30"
                : "bg-white dark:bg-[#0c0f17] border-orange-500/40 text-orange-600 dark:text-orange-400"
            }`}
          >
            <Clock className={`h-4 w-4 ${isUrgent ? "animate-spin text-rose-500" : "text-orange-500"}`} />
            <span>{formattedTime}</span>
          </div>

          {onCancelReservation && (
            <button
              type="button"
              onClick={onCancelReservation}
              disabled={isCancelling}
              className="text-xs font-sans font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-rose-500/10"
              title="Unlock items and cancel current reservation"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>{isCancelling ? "Releasing..." : "Release Hold"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
