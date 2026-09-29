import React, { useState, useMemo } from "react";
import { RotateCcw, Loader2, Sparkles } from "lucide-react";
import {
  useAdminReturnsQuery,
  useReviewReturnStatusMutation,
} from "@/hooks/useReturns";
import {
  ReturnKPICards,
  ReturnFilterBar,
  ReturnTicketCard,
  ReturnActionModal,
  ReturnEvidenceModal,
  ReturnEmptyState,
} from "@/components/admin/returns";

const STATUS_FILTERS = [
  { label: "All Returns", value: "", countKey: "total" },
  { label: "Pending Review", value: "REQUESTED", countKey: "requested" },
  { label: "Pickup Scheduled", value: "APPROVED", countKey: "approved" },
  { label: "Warehouse Received", value: "ITEM_RECEIVED", countKey: "received" },
  { label: "Replacement Dispatched", value: "REPLACEMENT_DISPATCHED" },
  { label: "Refund Processed", value: "REFUND_PROCESSED" },
  { label: "Rejected", value: "REJECTED", countKey: "rejected" },
];

/**
 * AdminReturns - Production-grade Hardware Reverse Logistics & RMA Management Portal.
 * Modular, maintainable container managing data lifecycle, filters, and modal dialogs.
 */
export default function AdminReturns() {
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [activeReturnModal, setActiveReturnModal] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const reviewStatusMutation = useReviewReturnStatusMutation();

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const {
    data,
    isLoading,
    refetch,
  } = useAdminReturnsQuery({
    status: statusFilter || undefined,
    requestType: typeFilter || undefined,
    search: searchInput.trim() || undefined,
  });

  const returns = data?.returns || [];
  const pagination = data?.pagination || {};

  // Live aggregated metrics calculation
  const metrics = useMemo(() => {
    if (data?.metrics) {
      return data.metrics;
    }
    const total = pagination.totalReturns ?? returns.length;
    const requested = returns.filter((r) => r.status === "REQUESTED").length;
    const approved = returns.filter((r) => ["APPROVED", "PICKUP_SCHEDULED"].includes(r.status)).length;
    const received = returns.filter((r) => r.status === "ITEM_RECEIVED").length;
    const completed = returns.filter((r) =>
      ["REFUND_PROCESSED", "REPLACEMENT_DISPATCHED", "COMPLETED"].includes(r.status)
    ).length;
    const rejected = returns.filter((r) => r.status === "REJECTED").length;

    return { total, requested, approved, received, completed, rejected };
  }, [returns, pagination, data?.metrics]);

  const handleQuickApprove = async (ret) => {
    try {
      await reviewStatusMutation.mutateAsync({
        returnId: ret._id,
        payload: {
          status: "APPROVED",
          adminRemarks: "Concierge verified defect evidence. Doorstep reverse pickup scheduled.",
        },
      });
      showToast(`RMA #${ret.returnNumber} approved! Pickup scheduled.`);
      refetch();
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to approve RMA");
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text);
    showToast(`Copied ${text} to clipboard`);
  };

  const handleResetFilters = () => {
    setStatusFilter("");
    setTypeFilter("");
    setSearchInput("");
  };

  return (
    <div className="space-y-6 max-w-[1500px] w-full mx-auto pb-12 overflow-x-hidden min-w-0">
      {/* Page Header with Real-Time Telemetry Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Reverse Logistics &amp; RMA Portal
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
            Returns &amp; Replacement Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Inspect customer defect evidence, approve doorstep reverse pickup, process refunds, and dispatch replacement hardware.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
          <div className="hidden md:flex items-center gap-2 px-3 py-2 sm:py-2.5 rounded-xl bg-slate-100 dark:bg-[#121622] border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-600 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Telemetry</span>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 dark:bg-[#121622] dark:hover:bg-[#1a2030] dark:text-slate-300 border border-slate-200 dark:border-white/15 transition-all active:scale-95 shadow-xs cursor-pointer disabled:opacity-50"
            title="Refresh returns telemetry"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-amber-500 ${isLoading ? "animate-spin" : ""}`} />
            <span>{isLoading ? "Syncing..." : "Sync RMA"}</span>
          </button>
        </div>
      </div>

      {/* Industrial-Grade Interactive KPI Cards Carousel / Grid */}
      <ReturnKPICards
        metrics={metrics}
        statusFilter={statusFilter}
        onSelectFilter={setStatusFilter}
      />

      {/* Filter Tabs & Command Center Search Bar */}
      <ReturnFilterBar
        statusFilters={STATUS_FILTERS}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        metrics={metrics}
        totalShowing={returns.length}
      />

      {/* Main RMA Content List */}
      {isLoading ? (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" />
          <p className="text-xs text-slate-400 font-sans">Querying RMA database &amp; reverse logistics...</p>
        </div>
      ) : returns.length === 0 ? (
        <ReturnEmptyState
          hasFilters={Boolean(statusFilter || typeFilter || searchInput)}
          onReset={handleResetFilters}
        />
      ) : (
        <div className="space-y-4">
          {returns.map((ret) => (
            <ReturnTicketCard
              key={ret._id}
              ret={ret}
              onQuickApprove={handleQuickApprove}
              onManage={setActiveReturnModal}
              onOpenLightbox={setLightboxImage}
              onCopy={handleCopy}
            />
          ))}
        </div>
      )}

      {/* RMA Action Decision Modal */}
      {activeReturnModal && (
        <ReturnActionModal
          returnItem={activeReturnModal}
          onClose={() => setActiveReturnModal(null)}
          onSuccess={(msg) => {
            showToast(msg);
            setActiveReturnModal(null);
            refetch();
          }}
        />
      )}

      {/* High-Resolution Evidence Photo Lightbox */}
      <ReturnEvidenceModal
        imageUrl={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />

      {/* Floating Action Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900/95 dark:bg-[#161d2d] text-white shadow-2xl border border-slate-700 dark:border-orange-500/40 text-xs font-sans font-bold animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-orange-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
