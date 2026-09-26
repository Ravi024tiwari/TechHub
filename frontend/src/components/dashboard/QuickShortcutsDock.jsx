import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Heart,
  Headphones,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
  Copy,
  Check,
  MessageSquare,
  Sparkles,
  Zap,
} from "lucide-react";

export default function QuickShortcutsDock({
  defaultAddress,
  wishlist = [],
  totalAddresses = 0,
}) {
  const [copiedAddr, setCopiedAddr] = useState(false);

  const wishlistItems = Array.isArray(wishlist)
    ? wishlist
    : Array.isArray(wishlist?.preview)
    ? wishlist.preview
    : [];

  const wishlistCount =
    typeof wishlist?.totalItems === "number"
      ? wishlist.totalItems
      : wishlistItems.length;

  const handleCopyAddress = () => {
    if (!defaultAddress) return;
    const addrString = `${defaultAddress.fullName}, ${defaultAddress.street}, ${defaultAddress.city}, ${defaultAddress.state} - ${defaultAddress.pincode}, Phone: ${defaultAddress.phone}`;
    navigator.clipboard?.writeText(addrString);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 1. Default Shipping Destination */}
      <div className="rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200/90 dark:border-white/10 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4" />
              </div>
              <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white">
                Primary Delivery Address
              </h4>
            </div>

            <Link
              to="/profile?tab=addresses"
              className="text-xs font-heading font-bold text-orange-600 dark:text-orange-400 hover:text-orange-500 flex items-center gap-1"
            >
              <span>Manage</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {defaultAddress ? (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 space-y-1.5 relative group">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-white">
                  {defaultAddress.fullName}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase font-bold">
                  {defaultAddress.addressType || "Home"}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                {defaultAddress.street}, {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode}
              </p>
              <div className="flex items-center justify-between pt-1">
                <p className="text-[11px] text-slate-400 font-mono">
                  Tel: {defaultAddress.phone}
                </p>
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  title="Copy formatted address"
                  className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-white transition-colors cursor-pointer"
                >
                  {copiedAddr ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-500" />
                      <span className="text-emerald-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 text-center text-xs text-slate-400 font-mono space-y-2">
              <p>No default shipping destination configured.</p>
              <Link
                to="/profile?tab=addresses"
                className="inline-block text-xs font-heading font-bold text-orange-600 dark:text-orange-400 hover:underline"
              >
                + Add Address Now
              </Link>
            </div>
          )}
        </div>

        <Link
          to="/profile?tab=addresses"
          className="text-xs text-slate-500 dark:text-slate-400 font-mono block hover:text-slate-700 dark:hover:text-slate-200"
        >
          {totalAddresses} saved {totalAddresses === 1 ? "address" : "addresses"} in address book →
        </Link>
      </div>

      {/* 2. Wishlist Quick Shelf */}
      <div className="rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200/90 dark:border-white/10 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                <Heart className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white">
                  Saved Wishlist
                </h4>
              </div>
            </div>

            <Link
              to="/wishlist"
              className="text-xs font-heading font-bold text-orange-600 dark:text-orange-400 hover:text-orange-500 flex items-center gap-1"
            >
              <span>View All ({wishlistCount})</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 text-center text-xs text-slate-400 font-mono space-y-2">
              <p>Your wishlist is currently empty.</p>
              <Link
                to="/products"
                className="inline-block text-xs font-heading font-bold text-orange-600 dark:text-orange-400 hover:underline"
              >
                Explore Catalog & Save Items
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {wishlistItems.slice(0, 4).map((item) => (
                <Link
                  key={item.productId || item._id}
                  to={`/product/${item.slug || item.productId || item._id}`}
                  className="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 aspect-square bg-slate-100 dark:bg-white/5 hover:border-orange-500 transition-all shadow-xs"
                  title={item.title}
                >
                  {item.thumbnail || item.images?.[0] ? (
                    <img
                      src={item.thumbnail || item.images?.[0]?.url || item.images?.[0]}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <ShoppingBag className="h-4 w-4" />
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        <Link
          to="/wishlist"
          className="text-xs text-slate-500 dark:text-slate-400 font-mono block hover:text-slate-700 dark:hover:text-slate-200"
        >
          {wishlistCount} {wishlistCount === 1 ? "item" : "items"} saved in wishlist →
        </Link>
      </div>

      {/* 3. VIP Concierge & Support Hub */}
      <div className="rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200/90 dark:border-white/10 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
                <Headphones className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white">
                  24/7 VIP Concierge
                </h4>
              </div>
            </div>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 font-bold uppercase">
              Priority SLA
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Dedicated Technical Support</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Fast-tracked resolution on dispatch, RMA hardware replacements, and custom PC component inquiries.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/profile"
            className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-heading font-bold text-slate-700 dark:text-slate-200 text-center transition-all"
          >
            Support Tickets
          </Link>
          <a
            href="mailto:support@techhub.com"
            className="py-2 px-3 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-500 text-white text-xs font-heading font-bold text-center transition-all shadow-md shadow-orange-500/20 flex items-center gap-1"
          >
            <span>Email Concierge</span>
          </a>
        </div>
      </div>
    </div>
  );
}
