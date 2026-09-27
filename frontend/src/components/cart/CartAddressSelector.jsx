import React from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Plus,
  Check,
  Home,
  Briefcase,
  Building,
  AlertCircle,
  Loader2,
  ChevronRight,
} from "lucide-react";

/**
 * Production-Grade Interactive Shipping Address Selector:
 * - Highlights current selected shipping address with brand orange accents.
 * - Multi-address selection grid with category badges (Home, Work, Other).
 * - Instant Add New Address trigger.
 * - Clear warning state for unauthenticated guests.
 */
export default function CartAddressSelector({
  isAuthenticated,
  addresses = [],
  isLoadingAddresses = false,
  selectedAddressId,
  setSelectedAddressId,
  isChangingAddress,
  setIsChangingAddress,
  onOpenAddressModal,
}) {
  const selectedAddress =
    addresses.find((a) => a._id === selectedAddressId) || addresses[0];

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/10 shadow-xs space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center border border-orange-500/20 shrink-0">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
              Delivery Destination
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
              Choose from your saved addresses or add a new verified location.
            </p>
          </div>
        </div>

        {isAuthenticated && addresses.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsChangingAddress(!isChangingAddress)}
              className="px-3 py-1.5 rounded-xl text-xs font-sans font-semibold text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 transition-all cursor-pointer"
            >
              {isChangingAddress ? "Done Selecting" : "Change Address"}
            </button>
            <button
              type="button"
              onClick={onOpenAddressModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs hover:bg-orange-600 dark:hover:bg-orange-500 dark:hover:text-white transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add New</span>
            </button>
          </div>
        )}
      </div>

      {/* Guest / Unauthenticated Notice */}
      {!isAuthenticated ? (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
              Please sign in to select from your saved addresses and proceed to order checkout.
            </p>
          </div>
          <Link
            to="/login?redirect=/cart"
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-heading font-bold text-xs uppercase tracking-wider shrink-0 shadow-xs hover:bg-amber-400 transition-colors"
          >
            Sign In Now
          </Link>
        </div>
      ) : isLoadingAddresses ? (
        <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2 font-mono">
          <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
          <span>Synchronizing delivery addresses...</span>
        </div>
      ) : addresses.length === 0 ? (
        /* Zero Addresses Saved */
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-300 dark:border-white/15 text-center">
          <MapPin className="h-8 w-8 text-orange-500 mx-auto mb-2 opacity-80" />
          <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white mb-1">
            No Shipping Address Found
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4 font-sans">
            Add your primary residence or office address to enable instant delivery dispatch and order tracking.
          </p>
          <button
            type="button"
            onClick={onOpenAddressModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-heading font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Shipping Address</span>
          </button>
        </div>
      ) : isChangingAddress ? (
        /* Multiple Addresses Selection Grid */
        <div className="space-y-3 pt-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
            Choose an address from your saved book:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {addresses.map((addr) => {
              const isSelected = selectedAddressId === addr._id;
              const TypeIcon =
                addr.addressType === "work"
                  ? Briefcase
                  : addr.addressType === "other"
                  ? Building
                  : Home;

              return (
                <div
                  key={addr._id}
                  onClick={() => {
                    setSelectedAddressId(addr._id);
                    setIsChangingAddress(false);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-orange-500/10 border-orange-500 ring-2 ring-orange-500/20 shadow-xs"
                      : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
                      <TypeIcon className="h-3 w-3 text-orange-500" />
                      <span>{addr.addressType || "home"}</span>
                    </span>
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 dark:text-orange-400">
                        <Check className="h-3.5 w-3.5" />
                        <span>Selected</span>
                      </span>
                    ) : addr.isDefault ? (
                      <span className="text-[10px] font-bold text-emerald-500 uppercase font-mono">
                        Default
                      </span>
                    ) : null}
                  </div>
                  <h5 className="font-heading font-bold text-xs text-slate-900 dark:text-white">
                    {addr.fullName}
                  </h5>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5 font-sans">
                    {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">
                    +91 {addr.phone}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Active Single Selected Address Card */
        selectedAddress && (
          <div className="p-4 sm:p-5 rounded-2xl bg-orange-500/5 border border-orange-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                  {selectedAddress.fullName}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-orange-500/20 text-orange-600 dark:text-orange-400 uppercase">
                  {selectedAddress.addressType || "home"}
                </span>
                {selectedAddress.isDefault && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 uppercase">
                    Default
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-sans">
                {selectedAddress.street}
                {selectedAddress.landmark ? `, Landmark: ${selectedAddress.landmark}` : ""}, {selectedAddress.city}, {selectedAddress.state} -{" "}
                <strong className="font-mono text-slate-900 dark:text-white">
                  {selectedAddress.pincode}
                </strong>
              </p>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Contact: +91 {selectedAddress.phone}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsChangingAddress(true)}
              className="text-xs font-sans font-semibold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer shrink-0"
            >
              Choose Different Address
            </button>
          </div>
        )
      )}
    </div>
  );
}
