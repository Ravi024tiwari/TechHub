import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  ShoppingBag,
  Search,
  X,
  RefreshCw,
  SlidersHorizontal,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Database,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import {
  useAdminOrdersInfiniteQuery,
  useUpdateOrderStatusMutation,
  useUpdateOrderTrackingMutation,
  useRefreshAdminOrders,
} from "../../hooks/useAdminOrders";
import OrderFilterTabs from "../../components/admin/orders/OrderFilterTabs";
import AdminOrderCard from "../../components/admin/orders/AdminOrderCard";
import OrderTrackingModal from "../../components/admin/orders/OrderTrackingModal";
import AdminOrdersSkeleton from "../../components/admin/orders/AdminOrdersSkeleton";

// Helper for Indian Rupee currency formatting
const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export default function AdminOrders() {
  const [activeStatus, setActiveStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Modals state
  const [trackingOrder, setTrackingOrder] = useState(null);

  // Sentinel ref for infinite scroll
  const sentinelRef = useRef(null);

  // Search debounce (350ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 350);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Infinite Query Hook with 2-minute memory cache
  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useAdminOrdersInfiniteQuery({
    status: activeStatus,
    search: debouncedSearch,
    limit: 8,
  });

  // Mutations
  const updateStatusMutation = useUpdateOrderStatusMutation();
  const updateTrackingMutation = useUpdateOrderTrackingMutation();
  const refreshCache = useRefreshAdminOrders();

  // Flattened orders list across all paginated pages
  const orders = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page?.orders || []);
  }, [data]);

  // Total orders in current filter according to backend pagination
  const totalOrdersCount = data?.pages?.[0]?.pagination?.totalOrders ?? orders.length;

  // Infinite scroll observer setup
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        rootMargin: "250px", // Pre-fetch before user reaches absolute bottom
        threshold: 0.1,
      }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handle status update
  const handleUpdateStatus = useCallback(
    ({ orderId, status, notes }) => {
      updateStatusMutation.mutate({ orderId, status, notes });
    },
    [updateStatusMutation]
  );

  // Handle tracking submission
  const handleTrackingSubmit = useCallback(
    ({ orderId, trackingData }) => {
      updateTrackingMutation.mutate(
        { orderId, trackingData },
        {
          onSuccess: () => {
            setTrackingOrder(null);
          },
        }
      );
    },
    [updateTrackingMutation]
  );

  // Manual force refresh
  const handleManualRefresh = async () => {
    await refreshCache();
    refetch();
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="text-xs font-sans font-bold text-orange-600 dark:text-orange-400 tracking-wider uppercase">
              Fulfillment Command Center
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-sans font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.04] px-2.5 py-0.5 rounded-md border border-slate-300 dark:border-white/15">
              <Database className="w-3 h-3 text-emerald-500" /> 2-Min RAM Cache
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
              Customer Orders
            </h1>
            <span className="text-xs font-sans font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-white/15">
              {totalOrdersCount} Total
            </span>
          </div>
        </div>

        {/* Top Controls: Search Bar & Force Refresh */}
        <div className="flex items-center gap-3">
          {/* Instant Search Bar */}
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by Order #, Name, Phone..."
              className="w-full pl-9 pr-8 py-2 text-xs font-sans rounded-xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-orange-500 transition-colors shadow-xs"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Force Refresh Button */}
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-sans font-medium bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-300 hover:text-orange-500 hover:border-slate-400 dark:hover:border-white/50 shadow-xs transition-all cursor-pointer shrink-0 disabled:opacity-60"
            title="Bypass 2-min cache and sync latest orders from database"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isFetching ? "animate-spin text-orange-500" : ""
              }`}
            />
            <span className="hidden sm:inline">
              {isFetching ? "Syncing..." : "Sync DB"}
            </span>
          </button>
        </div>
      </div>

      {/* Filter Tabs Component */}
      <OrderFilterTabs
        activeStatus={activeStatus}
        onSelectStatus={(status) => setActiveStatus(status)}
      />

      {/* Active Filter Indicator Tag */}
      {(activeStatus || debouncedSearch) && (
        <div className="flex items-center gap-2 text-xs font-sans text-slate-600 dark:text-slate-400">
          <span>Filtering by:</span>
          {activeStatus && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 font-medium border border-orange-500/25">
              Status: {activeStatus}
              <button
                type="button"
                onClick={() => setActiveStatus("")}
                className="hover:text-orange-700 ml-0.5"
              >
                ×
              </button>
            </span>
          )}
          {debouncedSearch && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-white/15">
              Query: "{debouncedSearch}"
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="hover:text-red-500 ml-0.5"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="text-xs font-mono">
            <strong className="block font-bold">Failed to load orders:</strong>
            <span>{error?.message || "Internal server communication error."}</span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="ml-auto px-3.5 py-1.5 rounded-xl text-xs font-sans font-semibold bg-rose-500 text-white shadow-xs hover:bg-rose-600 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Initial Loading Skeleton */}
      {isLoading ? (
        <AdminOrdersSkeleton count={4} />
      ) : orders.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/30 shadow-xs max-w-md mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center mx-auto mb-3">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white mb-1">
            No Orders Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mb-4">
            {debouncedSearch || activeStatus
              ? "No orders match the selected filters or search keyword."
              : "No customer orders have been placed in the store yet."}
          </p>
          {(activeStatus || debouncedSearch) && (
            <button
              type="button"
              onClick={() => {
                setActiveStatus("");
                setSearchInput("");
              }}
              className="px-4 py-2 rounded-xl text-xs font-sans font-semibold bg-orange-500 text-white shadow-md shadow-orange-500/25 hover:bg-orange-600 transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        /* Orders List */
        <div className="space-y-4">
          {orders.map((order) => (
            <AdminOrderCard
              key={order._id}
              order={order}
              onUpdateStatus={handleUpdateStatus}
              onOpenTracking={(ord) => setTrackingOrder(ord)}
              isUpdating={
                updateStatusMutation.isPending &&
                updateStatusMutation.variables?.orderId === order._id
              }
              currencyFormatter={formatINR}
            />
          ))}

          {/* Infinite Scroll Bottom Sentinel */}
          <div ref={sentinelRef} className="h-6 w-full flex items-center justify-center" />

          {/* Skeleton when fetching next page */}
          {isFetchingNextPage && <AdminOrdersSkeleton count={2} />}

          {/* End of list reached badge */}
          {!hasNextPage && orders.length > 0 && (
            <div className="text-center py-6">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-sans font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/20">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                All {totalOrdersCount} orders loaded from database
              </span>
            </div>
          )}
        </div>
      )}

      {/* Courier Tracking Modal */}
      <OrderTrackingModal
        isOpen={Boolean(trackingOrder)}
        onClose={() => setTrackingOrder(null)}
        order={trackingOrder}
        onSubmit={handleTrackingSubmit}
        isSubmitting={updateTrackingMutation.isPending}
      />
    </div>
  );
}
