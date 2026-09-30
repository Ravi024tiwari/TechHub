import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Search,
  RotateCcw,
  Sparkles,
  Ticket,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Layers,
  X,
  Loader2,
  ArrowUpDown,
  Filter,
  Check,
} from "lucide-react";
import CouponCard from "../../components/coupon/CouponCard";
import AdminCouponModal from "../../components/coupon/AdminCouponModal";
import {
  fetchAdminCouponsApi,
  toggleCouponStatusApi,
  deleteCouponApi,
} from "../../api/couponApi";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState({
    totalAll: 0,
    activeCount: 0,
    expiredCount: 0,
    totalRedemptions: 0,
  });
  const [pagination, setPagination] = useState({
    totalCoupons: 0,
    currentPage: 1,
    totalPages: 1,
    limit: 12,
  });

  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'expired' | 'upcoming'
  const [sortBy, setSortBy] = useState("newest"); // 'newest' | 'expiry' | 'discount' | 'popular'
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [couponToEdit, setCouponToEdit] = useState(null);

  const [togglingId, setTogglingId] = useState(null);
  const [deletingCoupon, setDeletingCoupon] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Show transient toast
  const showToast = (message, type = "success") => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Coupons from Backend
  const loadCoupons = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const data = await fetchAdminCouponsApi({
          page,
          limit: 12,
          status: statusFilter !== "all" ? statusFilter : undefined,
          search: debouncedSearch.trim() || undefined,
        });

        if (data) {
          setCoupons(data.coupons || []);
          if (data.stats) {
            setStats(data.stats);
          }
          if (data.pagination) {
            setPagination(data.pagination);
          }
        }
      } catch (err) {
        console.error("Error loading coupons:", err);
        showToast("Failed to fetch coupons. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, debouncedSearch]
  );

  useEffect(() => {
    loadCoupons(1);
  }, [loadCoupons]);

  // Handle Toggle Active/Inactive
  const handleToggleStatus = async (coupon) => {
    try {
      setTogglingId(coupon._id);
      const res = await toggleCouponStatusApi(coupon._id);
      const newStatus = res?.couponId ? res.isActive : !coupon.isActive;

      setCoupons((prev) =>
        prev.map((c) => (c._id === coupon._id ? { ...c, isActive: newStatus } : c))
      );

      // Update local stats counter
      setStats((prev) => ({
        ...prev,
        activeCount: newStatus ? prev.activeCount + 1 : Math.max(0, prev.activeCount - 1),
      }));

      showToast(`Coupon '${coupon.code}' is now ${newStatus ? "ACTIVE" : "INACTIVE"}`);
    } catch (err) {
      console.error("Toggle error:", err);
      showToast("Could not toggle status", "error");
    } finally {
      setTogglingId(null);
    }
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingCoupon) return;

    try {
      setIsDeleting(true);
      await deleteCouponApi(deletingCoupon._id);

      setCoupons((prev) => prev.filter((c) => c._id !== deletingCoupon._id));
      setStats((prev) => ({
        ...prev,
        totalAll: Math.max(0, prev.totalAll - 1),
        activeCount: deletingCoupon.isActive
          ? Math.max(0, prev.activeCount - 1)
          : prev.activeCount,
      }));

      showToast(`Coupon '${deletingCoupon.code}' removed successfully`);
      setDeletingCoupon(null);
    } catch (err) {
      console.error("Delete error:", err);
      showToast(err.response?.data?.message || "Could not delete coupon", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (coupon) => {
    setCouponToEdit(coupon);
    setIsModalOpen(true);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setCouponToEdit(null);
    setIsModalOpen(true);
  };

  // Modal Success callback
  const handleModalSuccess = (msg) => {
    showToast(msg);
    loadCoupons(pagination.currentPage);
  };

  // Client-side sorting for instantaneous response
  const sortedCoupons = useMemo(() => {
    const list = [...coupons];
    switch (sortBy) {
      case "expiry":
        return list.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
      case "discount":
        return list.sort((a, b) => (b.discountValue || 0) - (a.discountValue || 0));
      case "popular":
        return list.sort((a, b) => (b.usedCount || 0) - (a.usedCount || 0));
      case "newest":
      default:
        return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
  }, [coupons, sortBy]);

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-5 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-2xl border border-slate-800 dark:border-slate-200 text-xs font-semibold animate-in slide-in-from-top-3 duration-300">
          <CheckCircle2 className="size-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage.message}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 hover:opacity-75 cursor-pointer"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* =========================================================
          PAGE HEADER: Title, Subtitle & "+ Add New Coupon"
          ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-heading font-black text-slate-950 dark:text-white tracking-tight">
              Promotional Coupons & Vouchers
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-white border border-slate-200 dark:border-white/15 shadow-2xs">
              {stats.totalAll} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Create discount codes, set minimum cart limits, and monitor live campaign redemptions.
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all hover:scale-102 active:scale-98 cursor-pointer shrink-0"
        >
          <Plus className="size-4" />
          <span>Add New Coupon</span>
        </button>
      </div>

      {/* =========================================================
          CONTROLS BAR: STATUS TABS, SORT & SEARCH
          ========================================================= */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#0c0e15] border-2 border-slate-200/90 dark:border-white/10 shadow-xs">
        {/* Status Filter Tabs with Counts (smooth scrollable) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth pb-1 lg:pb-0">
          {[
            { id: "all", label: "All Campaigns", count: stats.totalAll },
            { id: "active", label: "Active", count: stats.activeCount },
            { id: "expired", label: "Expired", count: stats.expiredCount },
            { id: "upcoming", label: "Upcoming" },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-xs"
                    : "text-slate-600 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                      isActive
                        ? "bg-white/20 text-white dark:bg-slate-950/20 dark:text-slate-950"
                        : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right side: Sort Dropdown, Search Input & Refresh */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          {/* Sort By Dropdown */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-7.5 pr-6 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-xs font-mono font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white transition-all cursor-pointer"
            >
              <option value="newest">Sort: Newest</option>
              <option value="expiry">Sort: Expiry Soonest</option>
              <option value="discount">Sort: Highest Discount</option>
              <option value="popular">Sort: Most Redeemed</option>
            </select>
            <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-slate-400 pointer-events-none" />
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search code or description..."
              className="w-full pl-9 pr-7 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white transition-all font-mono"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => loadCoupons(pagination.currentPage)}
            title="Refresh list"
            disabled={loading}
            className="size-8.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white flex items-center justify-center transition-all cursor-pointer shrink-0 border border-slate-200 dark:border-white/10"
          >
            <RotateCcw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* =========================================================
          COUPONS GRID
          ========================================================= */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 pt-2">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="h-72 rounded-3xl bg-slate-100 dark:bg-white/[0.04] animate-pulse border-2 border-slate-200/60 dark:border-white/5"
            />
          ))}
        </div>
      ) : sortedCoupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border-2 border-dashed border-slate-300 dark:border-white/15 bg-white/50 dark:bg-white/[0.02] my-4 space-y-3">
          <div className="size-16 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 flex items-center justify-center shadow-xs">
            <Ticket className="size-8" />
          </div>
          <div>
            <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white">
              No Promotional Campaigns Found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
              {searchTerm
                ? `No campaigns match '${searchTerm}'. Try checking code spelling or reset your status filters.`
                : "Get started by launching your first promotional discount voucher."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-xs font-bold hover:scale-102 transition-all cursor-pointer shadow-md"
          >
            <Plus className="size-3.5" />
            <span>Create First Coupon</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 pt-2">
          {sortedCoupons.map((coupon) => (
            <CouponCard
              key={coupon._id}
              coupon={coupon}
              mode="admin"
              onToggleStatus={handleToggleStatus}
              isToggling={togglingId === coupon._id}
              onEdit={handleOpenEdit}
              onDelete={(c) => setDeletingCoupon(c)}
            />
          ))}
        </div>
      )}

      {/* =========================================================
          CREATE & EDIT COUPON MODAL
          ========================================================= */}
      <AdminCouponModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        couponToEdit={couponToEdit}
        onSuccess={handleModalSuccess}
      />

      {/* =========================================================
          DELETE CONFIRMATION MODAL
          ========================================================= */}
      {deletingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-[#0c0e15] border-2 border-slate-200 dark:border-white/15 shadow-2xl space-y-4">
            <div className="size-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-500/30">
              <AlertTriangle className="size-6" />
            </div>

            <div>
              <h4 className="font-heading font-black text-lg text-slate-950 dark:text-white">
                Delete Coupon '{deletingCoupon.code}'?
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                {deletingCoupon.usedCount > 0
                  ? "This coupon has previous customer redemptions. To preserve order receipts and audit safety, it will be deactivated instead of permanently deleted."
                  : "Are you sure you want to permanently delete this promotional code? This action cannot be undone."}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCoupon(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                {isDeleting && <Loader2 className="size-3.5 animate-spin" />}
                <span>
                  {deletingCoupon.usedCount > 0 ? "Deactivate Safely" : "Delete Permanently"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
