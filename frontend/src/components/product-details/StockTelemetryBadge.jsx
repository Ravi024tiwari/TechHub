import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Clock, Zap } from "lucide-react";

export default function StockTelemetryBadge({
  stock = 0,
  threshold = 5,
  selectedColorName = "",
}) {
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= threshold;

  if (isOutOfStock) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-mono font-bold">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
        <span>
          Out of Stock {selectedColorName ? `in ${selectedColorName}` : ""}
        </span>
      </div>
    );
  }

  if (isLowStock) {
    return (
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
          <span>
            Critical Stock: Only {stock} {stock === 1 ? "unit" : "units"} remaining{" "}
            {selectedColorName ? `in ${selectedColorName}` : ""}
          </span>
        </div>
        <p className="text-[10px] font-mono text-amber-600 dark:text-amber-400/80 flex items-center gap-1">
          <Clock className="w-3 h-3 shrink-0" />
          <span>High order volume in progress · Reserve your unit now</span>
        </p>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold">
      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
      <span>
        In Stock ({stock} units ready to dispatch)
      </span>
    </div>
  );
}
