import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Users,
  Search,
  RefreshCw,
  X,
  AlertCircle,
  Database,
  UserCheck,
  UserX,
  Loader2,
  CheckCircle,
} from "lucide-react";
import {
  useAdminCustomersInfiniteQuery,
  useToggleBlockCustomerMutation,
  useInvalidateAdminCustomers,
} from "../../hooks/useAdminCustomers";
import AdminCustomerCard from "../../components/admin/customers/AdminCustomerCard";
import CustomerFilterTabs from "../../components/admin/customers/CustomerFilterTabs";
import CustomerDetailModal from "../../components/admin/customers/CustomerDetailModal";
import AdminCustomersSkeleton from "../../components/admin/customers/AdminCustomersSkeleton";

export default function AdminCustomers() {
  const [activeStatus, setActiveStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const sentinelRef = useRef(null);

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(""), 3500);
    return () => clearTimeout(t);
  }, [toastMessage]);

  // TanStack Infinite Query Hook with 2-Minute RAM Cache
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useAdminCustomersInfiniteQuery({
    status: activeStatus,
    search: debouncedSearch,
    limit: 10,
  });

  const refreshCache = useInvalidateAdminCustomers();
  const toggleBlockMutation = useToggleBlockCustomerMutation();

  // Flatten paginated customer pages
  const customers = data?.pages?.flatMap((page) => page.customers) || [];
  const firstPage = data?.pages?.[0];
  const summary = firstPage?.summary || {};
  const totalCustomersCount = firstPage?.pagination?.totalCustomers || 0;

  // Infinite Scroll IntersectionObserver with 250px prefetch
  useEffect(() => {
    if (!sentinelRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        rootMargin: "250px",
        threshold: 0.1,
      }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handle Account Block / Unblock Toggle
  const handleToggleBlock = useCallback(
    (userId, isBlocked) => {
      toggleBlockMutation.mutate(
        { userId, isBlocked },
        {
          onSuccess: (res) => {
            const customerName = res?.name || "Customer";
            setToastMessage(
              `${customerName} has been ${isBlocked ? "suspended" : "reactivated"} successfully`
            );
          },
          onError: (err) => {
            setToastMessage(err?.message || "Failed to update account status");
          },
        }
      );
    },
    [toggleBlockMutation]
  );

  // Manual Force Refresh to bypass 2-min cache
  const handleManualRefresh = async () => {
    await refreshCache();
    refetch();
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-2xl border border-slate-700 dark:border-white/30 text-xs font-sans font-semibold animate-in slide-in-from-bottom duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage("")}
            className="ml-2 text-slate-400 hover:text-white dark:hover:text-slate-950"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="text-xs font-sans font-bold text-orange-600 dark:text-orange-400 tracking-wider uppercase">
              Customer Management Directory
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-sans font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.04] px-2.5 py-0.5 rounded-md border border-slate-300 dark:border-white/15">
              <Database className="w-3 h-3 text-emerald-500" /> 2-Min RAM Cache
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
              Registered Customers
            </h1>
            <span className="text-xs font-sans font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-white/15">
              {totalCustomersCount} Total
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
              placeholder="Search by Name, Email, Phone..."
              className="w-full pl-9 pr-8 py-2 text-xs font-sans rounded-xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-orange-500 transition-colors shadow-xs"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Force Refresh Button (Bypass Cache) */}
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-sans font-medium bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-300 hover:text-orange-500 hover:border-slate-400 dark:hover:border-white/50 shadow-xs transition-all cursor-pointer shrink-0 disabled:opacity-60"
            title="Bypass 2-min cache and sync latest customer database"
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
      <CustomerFilterTabs
        activeStatus={activeStatus}
        onSelectStatus={(status) => setActiveStatus(status)}
        summary={summary}
      />

      {/* Active Filter Indicator Tag */}
      {(activeStatus || debouncedSearch) && (
        <div className="flex items-center gap-2 text-xs font-sans text-slate-600 dark:text-slate-400">
          <span>Filtering by:</span>
          {activeStatus && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 font-medium border border-orange-500/25">
              Account: {activeStatus === "active" ? "Active" : "Suspended"}
              <button
                type="button"
                onClick={() => setActiveStatus("")}
                className="hover:opacity-75 cursor-pointer ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {debouncedSearch && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-medium border border-slate-300 dark:border-white/15">
              Search: "{debouncedSearch}"
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="hover:opacity-75 cursor-pointer ml-1"
              >
                <X className="w-3 h-3" />
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
            <strong className="block font-bold">Failed to load customer list:</strong>
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
        <AdminCustomersSkeleton count={4} />
      ) : customers.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/30 shadow-xs max-w-md mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center mx-auto mb-3">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white mb-1">
            No Customers Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mb-4">
            {debouncedSearch || activeStatus
              ? "No customer accounts match your active search or status filters."
              : "No customers have registered on the website yet."}
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
        /* Customers List */
        <div className="space-y-4">
          {customers.map((cust) => (
            <AdminCustomerCard
              key={cust._id}
              customer={cust}
              onViewDetails={(c) => setSelectedCustomer(c)}
              onToggleBlock={handleToggleBlock}
              isToggling={
                toggleBlockMutation.isPending &&
                toggleBlockMutation.variables?.userId === cust._id
              }
            />
          ))}

          {/* Infinite Scroll Sentinel */}
          <div ref={sentinelRef} className="py-4 text-center">
            {isFetchingNextPage ? (
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white dark:bg-[#0c0f17] border border-slate-300 dark:border-white/20 shadow-xs text-xs font-sans text-slate-600 dark:text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                <span>Loading more registered customers...</span>
              </div>
            ) : hasNextPage ? (
              <span className="text-xs text-slate-400 font-sans">
                Scroll down to load more accounts
              </span>
            ) : customers.length > 0 ? (
              <div className="text-xs font-sans text-slate-400 py-3">
                All registered customer accounts loaded • ({customers.length} total)
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* 360-Degree Customer Detail Modal */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onToggleBlock={handleToggleBlock}
          isToggling={toggleBlockMutation.isPending}
        />
      )}
    </div>
  );
}
