import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AddressModal from "@/components/profile/AddressModal";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useAddressesQuery } from "@/hooks/useAddresses";
import { usePlaceCodOrderMutation } from "@/hooks/useOrders";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Tag,
  Check,
  ChevronRight,
  Lock,
  MapPin,
  Home,
  Briefcase,
  Building,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CreditCard,
  Banknote,
} from "lucide-react";

/**
 * Enterprise Production-Grade Shopping Cart & Checkout Page:
 * - Line item quantity adjusters & instant removal.
 * - Dynamic Shipping Address Selector with multi-address support.
 * - Inline AddressModal trigger for 0-redirect address creation.
 * - Order summary breakdown (MRP, Savings, GST, Free Express Delivery).
 * - Interactive Coupon engine with validation.
 * - COD / Online payment selection with 1-click order placement.
 */
export default function Cart() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getSubtotal,
    getTotalCount,
  } = useCartStore();

  const { data: addresses = [], isLoading: isLoadingAddresses } = useAddressesQuery();
  const placeCodMutation = usePlaceCodOrderMutation();

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isChangingAddress, setIsChangingAddress] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD"); // "COD" | "ONLINE"

  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [orderError, setOrderError] = useState("");
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);

  const totalItemsCount = getTotalCount();
  const subtotal = getSubtotal();

  // Set default selected address when addresses are loaded
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr._id);
    }
  }, [addresses, selectedAddressId]);

  const selectedAddress = addresses.find((a) => a._id === selectedAddressId) || addresses[0];

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");

    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === "TECH10") {
      const discount = Math.round(subtotal * 0.1);
      setAppliedDiscount(discount);
      setCouponSuccess("10% TechHaven member discount applied!");
    } else if (code === "PRO2000") {
      const discount = Math.min(2000, subtotal);
      setAppliedDiscount(discount);
      setCouponSuccess("₹2,000 Flat voucher discount applied!");
    } else {
      setCouponError("Invalid promo code. Try TECH10.");
    }
  };

  const finalTotal = Math.max(0, subtotal - appliedDiscount);

  const formatINR = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);

  // Handle Checkout Order Placement
  const handleProceedCheckout = async () => {
    setOrderError("");

    if (!isAuthenticated) {
      navigate("/login?redirect=/cart");
      return;
    }

    if (!selectedAddressId) {
      setOrderError("Please add and select a shipping address before checking out.");
      return;
    }

    if (paymentMethod === "COD") {
      try {
        const response = await placeCodMutation.mutateAsync({
          shippingAddressId: selectedAddressId,
        });

        setIsOrderPlaced(true);
        setPlacedOrderDetails(response?.data?.order || response?.order || null);
        clearCart();
      } catch (err) {
        setOrderError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to place order. Please try again."
        );
      }
    } else {
      alert(
        "Online Razorpay / Card gateway initialized! In test mode, please switch to 'Cash on Delivery' to test end-to-end order placement."
      );
    }
  };

  // If order was successfully placed, display confirmation screen
  if (isOrderPlaced) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-white flex flex-col">
        <Navbar />
        <main className="flex-1 w-full max-w-[700px] mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
          <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/10 shadow-2xl">
            <div className="h-20 w-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white mb-2">
              Hardware Order Confirmed!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
              Thank you for shopping with TechHub. Your order has been placed successfully and is being routed for rapid dispatch.
            </p>

            {selectedAddress && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-left mb-6 text-xs space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">
                  Delivery Destination
                </span>
                <p className="font-bold text-slate-900 dark:text-white">{selectedAddress.fullName}</p>
                <p className="text-slate-600 dark:text-slate-300">{selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</p>
                <p className="text-slate-500 dark:text-slate-400 font-mono">+91 {selectedAddress.phone}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/orders"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-heading font-bold text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all text-center"
              >
                Track My Orders
              </Link>
              <Link
                to="/products"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-800 dark:text-white font-heading font-bold text-xs uppercase tracking-wider border border-slate-200 dark:border-white/10 hover:border-slate-300 transition-all text-center"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-white flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1 w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-tech text-slate-500 dark:text-slate-400 mb-6">
          <Link to="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <Link to="/products" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Catalog
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="text-slate-900 dark:text-white font-medium">Shopping Bag & Checkout</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-200 dark:border-white/10 mb-8">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Hardware Shopping Bag
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Select your delivery destination address and payment preference to finalize order dispatch.
            </p>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 transition-all cursor-pointer w-fit"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Empty Bag</span>
            </button>
          )}
        </div>

        {/* Bag Content */}
        {items.length === 0 ? (
          /* Empty State */
          <div className="py-16 sm:py-24 text-center max-w-md mx-auto">
            <div className="h-20 w-20 rounded-3xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <ShoppingBag className="h-10 w-10 text-slate-400" />
            </div>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Your Shopping Bag is Empty
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Explore our precision computing workstations, studio displays, and audio flagships to start your order.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-heading font-bold text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              <span>Explore Products</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          /* Two-Column Checkout Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Cart Items & Address Selection Section */}
            <div className="lg:col-span-8 space-y-6">
              {/* SECTION 1: Cart Items */}
              <div className="space-y-4">
                <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-sky-500" />
                  <span>Selected Hardware Items ({totalItemsCount})</span>
                </h3>

                {items.map((item) => {
                  const product = item.product || item;
                  const price = product.salePrice ?? product.regularPrice ?? 0;
                  const lineTotal = price * item.quantity;
                  const image =
                    product.images?.[0]?.url ||
                    product.image ||
                    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=300&q=80";

                  return (
                    <div
                      key={`${product._id}-${item.selectedColor || item.color || "default"}`}
                      className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/[0.08] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
                    >
                      {/* Product Image & Title */}
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl bg-slate-100 dark:bg-[#07090e] border border-slate-200 dark:border-white/10 shrink-0 overflow-hidden p-2 flex items-center justify-center">
                          <img
                            src={image}
                            alt={product.title}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        <div className="min-w-0">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            {product.brandName || product.brand?.name || "GENUINE HARDWARE"}
                          </span>
                          <Link
                            to={`/product/${product.slug || product._id}`}
                            className="font-heading font-semibold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-sky-500 dark:hover:text-sky-400 transition-colors line-clamp-1"
                          >
                            {product.title}
                          </Link>
                          {(item.selectedColor || item.color) && (
                            <span className="inline-block mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              Color: <strong className="text-slate-800 dark:text-slate-200">{item.selectedColor || item.color}</strong>
                            </span>
                          )}
                          <div className="text-xs font-bold text-slate-900 dark:text-white mt-1.5 sm:hidden">
                            {formatINR(price)}
                          </div>
                        </div>
                      </div>

                      {/* Quantity Stepper & Price */}
                      <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/[0.06]">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-slate-300 dark:border-white/15 rounded-xl bg-slate-50 dark:bg-white/[0.04] overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateQuantity(product._id, Math.max(1, item.quantity - 1), item.selectedColor || item.color)}
                            className="h-8 w-8 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="h-8 w-10 flex items-center justify-center font-mono font-bold text-xs text-slate-900 dark:text-white border-x border-slate-300 dark:border-white/10 bg-white dark:bg-black/40">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(product._id, item.quantity + 1, item.selectedColor || item.color)}
                            className="h-8 w-8 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Line Price */}
                        <div className="text-right min-w-[90px]">
                          <span className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white block">
                            {formatINR(lineTotal)}
                          </span>
                          {item.quantity > 1 && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {formatINR(price)} each
                            </span>
                          )}
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => removeItem(product._id, item.selectedColor || item.color)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* SECTION 2: SHIPPING ADDRESS SELECTION */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                        Delivery Shipping Destination
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Choose from your saved addresses or add a new delivery location.
                      </p>
                    </div>
                  </div>

                  {isAuthenticated && addresses.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsChangingAddress(!isChangingAddress)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 transition-all cursor-pointer"
                      >
                        {isChangingAddress ? "Done Selecting" : "Change Address"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddressModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add New</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Not Authenticated State */}
                {!isAuthenticated ? (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                      <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                        Please sign in to select from your saved addresses and proceed to order placement.
                      </p>
                    </div>
                    <Link
                      to="/login?redirect=/cart"
                      className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-heading font-bold text-xs uppercase tracking-wider shrink-0 shadow-sm hover:bg-amber-400 transition-colors"
                    >
                      Sign In Now
                    </Link>
                  </div>
                ) : isLoadingAddresses ? (
                  <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
                    <span>Loading saved addresses...</span>
                  </div>
                ) : addresses.length === 0 ? (
                  /* No Address Saved State */
                  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-300 dark:border-white/15 text-center">
                    <MapPin className="h-8 w-8 text-sky-500 mx-auto mb-2 opacity-80" />
                    <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white mb-1">
                      No Shipping Address Found
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                      Add your home or office address to enable instant delivery dispatch and order tracking.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsAddressModalOpen(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-heading font-bold text-xs uppercase tracking-wider shadow-md shadow-sky-500/25 active:scale-95 transition-all cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Shipping Address</span>
                    </button>
                  </div>
                ) : isChangingAddress ? (
                  /* Multiple Addresses Radio List Selection */
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
                                ? "bg-sky-500/10 border-sky-500 ring-1 ring-sky-500/20 shadow-sm"
                                : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
                                <TypeIcon className="h-3 w-3 text-sky-400" />
                                <span>{addr.addressType || "home"}</span>
                              </span>
                              {isSelected ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400">
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
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5">
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
                    <div className="p-4 rounded-2xl bg-sky-500/5 border border-sky-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                            {selectedAddress.fullName}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-sky-500/20 text-sky-600 dark:text-sky-400 uppercase">
                            {selectedAddress.addressType || "home"}
                          </span>
                          {selectedAddress.isDefault && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-500 uppercase">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {selectedAddress.street}{selectedAddress.landmark ? `, Landmark: ${selectedAddress.landmark}` : ""}, {selectedAddress.city}, {selectedAddress.state} - <strong className="font-mono">{selectedAddress.pincode}</strong>
                        </p>
                        <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                          Contact: +91 {selectedAddress.phone}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsChangingAddress(true)}
                        className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer shrink-0"
                      >
                        Choose Different Address
                      </button>
                    </div>
                  )
                )}
              </div>

              {/* SECTION 3: PAYMENT METHOD SELECTION */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                  Payment Preference
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setPaymentMethod("COD")}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      paymentMethod === "COD"
                        ? "bg-sky-500/10 border-sky-500 ring-1 ring-sky-500/20 shadow-sm"
                        : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                    }`}
                  >
                    <Banknote className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-xs text-slate-900 dark:text-white">
                          Cash on Delivery (COD)
                        </span>
                        {paymentMethod === "COD" && <Check className="h-3.5 w-3.5 text-sky-500" />}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Pay in cash or UPI upon delivery inspection. No advance payment required.
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setPaymentMethod("ONLINE")}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      paymentMethod === "ONLINE"
                        ? "bg-sky-500/10 border-sky-500 ring-1 ring-sky-500/20 shadow-sm"
                        : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                    }`}
                  >
                    <CreditCard className="h-5 w-5 text-sky-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-xs text-slate-900 dark:text-white">
                          Instant Online Payment
                        </span>
                        {paymentMethod === "ONLINE" && <Check className="h-3.5 w-3.5 text-sky-500" />}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Razorpay, Credit/Debit Cards, UPI, NetBanking with 256-Bit SSL protection.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Order Summary Sidebar */}
            <div className="lg:col-span-4 sticky top-24 space-y-4">
              <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-5">
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                  Order Summary
                </h3>

                {/* Subtotal, Shipping, Tax */}
                <div className="space-y-3 text-xs divide-y divide-slate-100 dark:divide-white/[0.06]">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400 pt-1">
                    <span>Items Subtotal ({totalItemsCount})</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{formatINR(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-slate-600 dark:text-slate-400 pt-3">
                    <span className="flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Insured Express Shipping</span>
                    </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">FREE</span>
                  </div>

                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 pt-3">
                      <span>Voucher Discount</span>
                      <span className="font-mono font-bold">-{formatINR(appliedDiscount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-900 dark:text-white font-extrabold text-base pt-3">
                    <span>Total Payable</span>
                    <span className="font-mono text-lg text-sky-600 dark:text-sky-400">{formatINR(finalTotal)}</span>
                  </div>
                </div>

                {/* Coupon Code Input */}
                <form onSubmit={handleApplyCoupon} className="space-y-2 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Coupon (e.g. TECH10)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full h-9 pl-9 pr-3 text-xs uppercase font-mono rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="h-9 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>

                  {couponSuccess && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      <span>{couponSuccess}</span>
                    </p>
                  )}
                  {couponError && (
                    <p className="text-[11px] text-rose-500 font-medium">
                      {couponError}
                    </p>
                  )}
                </form>

                {/* Delivery Badge Preview */}
                {selectedAddress && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 text-xs">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                      Shipping To:
                    </span>
                    <p className="font-bold text-slate-900 dark:text-white truncate">
                      {selectedAddress.fullName}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
                      {selectedAddress.city}, {selectedAddress.state} ({selectedAddress.pincode})
                    </p>
                  </div>
                )}

                {orderError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2 font-medium">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{orderError}</span>
                  </div>
                )}

                {/* Checkout CTA */}
                <button
                  type="button"
                  onClick={handleProceedCheckout}
                  disabled={placeCodMutation.isPending}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-heading font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                >
                  {placeCodMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  <span>
                    {placeCodMutation.isPending
                      ? "Placing Order..."
                      : paymentMethod === "COD"
                      ? "Confirm COD Order"
                      : "Proceed to Payment Gateway"}
                  </span>
                </button>

                {/* Security Pillars */}
                <div className="pt-2 flex items-center justify-center gap-4 text-[10px] font-tech text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span>256-Bit SSL</span>
                  </div>
                  <span>·</span>
                  <div className="flex items-center gap-1">
                    <RotateCcw className="h-3.5 w-3.5 text-sky-400" />
                    <span>7-Day Return</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Address Modal for adding address from Cart */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        initialData={null}
        isFirstAddress={addresses.length === 0}
        onSuccessCallback={() => {
          // Addresses will be re-fetched by TanStack Query
        }}
      />

      <Footer />
    </div>
  );
}
