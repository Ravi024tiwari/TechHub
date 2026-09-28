import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AddressModal from "@/components/profile/AddressModal";
import CartItemCard from "@/components/cart/CartItemCard";
import CartAddressSelector from "@/components/cart/CartAddressSelector";
import CartPaymentSelector from "@/components/cart/CartPaymentSelector";
import CartOrderSummary from "@/components/cart/CartOrderSummary";
import CartEmptyState from "@/components/cart/CartEmptyState";
import CartOrderSuccess from "@/components/cart/CartOrderSuccess";
import StockReservationBanner from "@/components/cart/StockReservationBanner";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useAddressesQuery } from "@/hooks/useAddresses";
import { usePlaceCodOrderMutation } from "@/hooks/useOrders";
import { syncCartApi, clearCartApi, applyCouponApi } from "@/api/cartApi";
import {
  createRazorpayOrderApi,
  verifyRazorpayPaymentApi,
  cancelStockReservationApi,
  getActiveStockReservationApi,
} from "@/api/orderApi";
import { loadRazorpayScript } from "@/utils/loadRazorpay";
import {
  ShoppingBag,
  Trash2,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";

/**
 * Production-Grade Shopping Bag & Checkout Page:
 * - Direct architectural sibling of the rest of the customer portal.
 * - Solid Cyber Orange & Emerald palette unified across the storefront.
 * - Concurrency-Safe Two-Phase Stock Reservation with 10-Minute Hold Timer.
 * - Multi-Document ACID Transaction Order Verification and Placement.
 * - Zero-redirect shipping address management and AddressModal integration.
 * - Interactive voucher engine with instant test suggestions and remove capability.
 * - Robust server-side cart synchronization and COD / Online order placement.
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

  const { data: addresses = [], isLoading: isLoadingAddresses } =
    useAddressesQuery();
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
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Concurrency Stock Reservation state
  const [activeReservation, setActiveReservation] = useState(null);
  const [isCancellingReservation, setIsCancellingReservation] = useState(false);

  // Check for active stock hold on mount (e.g. if page was reloaded)
  useEffect(() => {
    if (isAuthenticated) {
      getActiveStockReservationApi()
        .then((res) => {
          if (res?.data?.hasActiveReservation) {
            setActiveReservation(res.data);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const totalItemsCount = getTotalCount();
  const subtotal = getSubtotal();

  // Set default selected address when addresses are loaded
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr._id);
    }
  }, [addresses, selectedAddressId]);

  const selectedAddress =
    addresses.find((a) => a._id === selectedAddressId) || addresses[0];

  // Handle Coupon Application
  const handleApplyCoupon = (e) => {
    if (e?.preventDefault) e.preventDefault();
    setCouponError("");
    setCouponSuccess("");

    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === "TECH10") {
      const discount = Math.round(subtotal * 0.1);
      setAppliedDiscount(discount);
      setCouponSuccess("10% TechHub member discount applied!");
    } else if (code === "PRO2000") {
      const discount = Math.min(2000, subtotal);
      setAppliedDiscount(discount);
      setCouponSuccess("₹2,000 Flat voucher discount applied!");
    } else {
      setCouponError("Invalid promo code. Try TECH10 or PRO2000.");
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedDiscount(0);
    setCouponSuccess("");
    setCouponError("");
  };

  const finalTotal = Math.max(0, subtotal - appliedDiscount);

  // Voluntarily cancel and unlock stock hold
  const handleCancelReservation = async () => {
    if (!activeReservation?.razorpayOrderId) return;
    setIsCancellingReservation(true);
    try {
      await cancelStockReservationApi(activeReservation.razorpayOrderId);
      setActiveReservation(null);
      setOrderError("");
    } catch (err) {
      console.error("Failed to cancel stock reservation:", err);
    } finally {
      setIsCancellingReservation(false);
    }
  };

  // Stock hold expired handler
  const handleReservationExpired = () => {
    setActiveReservation(null);
    setOrderError(
      "Your 10-minute stock reservation expired. Inventory has been returned to stock. Click 'Proceed to Checkout' to re-reserve."
    );
  };

  // Handle Checkout Order Placement with Production Server-Side Cart Synchronization
  const handleProceedCheckout = async () => {
    setOrderError("");

    if (!isAuthenticated) {
      navigate("/login?redirect=/cart");
      return;
    }

    if (items.length === 0) {
      setOrderError("Your shopping bag is empty. Please add items to checkout.");
      return;
    }

    if (!selectedAddressId) {
      setOrderError("Please add and select a shipping address before checking out.");
      return;
    }

    setIsSubmittingOrder(true);

    try {
      // Step 1: Format items and synchronize with MongoDB backend
      const syncItems = items.map((item) => ({
        productId: item._id,
        quantity: item.quantity || 1,
        selectedSpecs: {
          color: item.selectedColor || "",
        },
      }));

      // Flush previous session cart on server and push fresh items
      await clearCartApi();
      await syncCartApi(syncItems);

      // Step 2: If a promo coupon was applied, synchronize it with backend
      if (couponSuccess && couponCode) {
        try {
          await applyCouponApi(couponCode);
        } catch (couponErr) {
          console.warn("Backend coupon notice:", couponErr);
        }
      }

      // Step 3: Place order via Cash on Delivery
      if (paymentMethod === "COD") {
        const response = await placeCodMutation.mutateAsync({
          shippingAddressId: selectedAddressId,
        });

        setIsOrderPlaced(true);
        setPlacedOrderDetails(response?.data?.order || response?.order || null);
        setActiveReservation(null);
        clearCart();
      } else {
        // Step 4: Online Instant Payment via Razorpay with Two-Phase Stock Reservation
        const isRzpLoaded = await loadRazorpayScript();
        if (!isRzpLoaded) {
          throw new Error(
            "Unable to connect to Razorpay payment gateway. Please check your network connection and try again."
          );
        }

        // Initialize Razorpay order & reserve stock atomically on backend
        const rzpInitRes = await createRazorpayOrderApi({
          shippingAddressId: selectedAddressId,
        });

        const rzpData = rzpInitRes?.data;
        if (!rzpData?.razorpayOrderId) {
          throw new Error("Failed to initialize gateway order. Please retry.");
        }

        // Activate reservation timer banner
        setActiveReservation(rzpData);

        // Open Razorpay Standard Checkout Modal
        const options = {
          key: rzpData.keyId,
          amount: rzpData.amount,
          currency: rzpData.currency || "INR",
          name: "TechHub Electronics",
          description: `Order Checkout (${totalItemsCount} item${totalItemsCount > 1 ? "s" : ""})`,
          order_id: rzpData.razorpayOrderId,
          prefill: {
            name: selectedAddress?.fullName || user?.fullName || "",
            email: user?.email || "",
            contact: selectedAddress?.phone || user?.phone || "",
          },
          theme: {
            color: "#f97316", // Cyber orange brand accent
          },
          handler: async (response) => {
            try {
              setIsSubmittingOrder(true);
              const verifyRes = await verifyRazorpayPaymentApi({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                shippingAddressId: selectedAddressId,
              });

              setIsOrderPlaced(true);
              setPlacedOrderDetails(verifyRes?.data?.order || null);
              setActiveReservation(null);
              clearCart();
            } catch (verifyErr) {
              setOrderError(
                verifyErr?.response?.data?.message ||
                  verifyErr?.message ||
                  "Payment verification failed. If your bank account was debited, an automated refund has been initiated."
              );
            } finally {
              setIsSubmittingOrder(false);
            }
          },
          modal: {
            ondismiss: () => {
              setOrderError(
                "Payment window closed. Your items remain held for the remaining time displayed above. Click 'Proceed to Checkout' to complete payment or 'Release Hold' to unlock."
              );
            },
          },
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.on("payment.failed", (failedRes) => {
          setOrderError(
            `Payment declined: ${failedRes.error?.description || "Transaction failed at issuing bank."}`
          );
        });
        razorpayInstance.open();
      }
    } catch (err) {
      setOrderError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to place order. Please review your cart and try again."
      );
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // If order was successfully placed, display confirmation screen
  if (isOrderPlaced) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-white flex flex-col">
        <Navbar />
        <CartOrderSuccess
          selectedAddress={selectedAddress}
          placedOrderDetails={placedOrderDetails}
        />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-white flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1 w-full max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-sans text-slate-500 dark:text-slate-400 mb-6"
        >
          <Link
            to="/"
            className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
          >
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
          <Link
            to="/products"
            className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
          >
            Catalog
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
          <span className="text-slate-900 dark:text-white font-semibold">
            Shopping Bag
          </span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Shopping Bag
              </h1>
              <span className="px-3 py-0.5 rounded-full text-xs font-sans font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                {totalItemsCount} {totalItemsCount === 1 ? "Item" : "Items"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-sans">
              Review your items, select your delivery destination, and finalize order dispatch.
            </p>
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-2.5">
              <Link
                to="/products"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-sans font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Are you sure you want to empty your shopping bag?")) {
                    clearCart();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-sans font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 transition-all cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Empty Bag</span>
              </button>
            </div>
          )}
        </div>

        {/* Active Concurrency Stock Reservation Countdown Banner */}
        {activeReservation && (
          <StockReservationBanner
            remainingSeconds={activeReservation.remainingSeconds}
            expiresAt={activeReservation.expiresAt}
            onExpire={handleReservationExpired}
            onCancelReservation={handleCancelReservation}
            isCancelling={isCancellingReservation}
          />
        )}

        {/* Bag Content */}
        {items.length === 0 ? (
          <CartEmptyState />
        ) : (
          /* Two-Column Responsive Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Cart Items & Address / Payment Selection */}
            <div className="lg:col-span-8 space-y-6">
              {/* SECTION 1: Cart Line Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-orange-500" />
                    <span>Selected Items ({totalItemsCount})</span>
                  </h2>
                </div>

                <div className="space-y-3">
                  {items.map((item) => (
                    <CartItemCard
                      key={`${item._id}-${item.selectedColor || item.color || "default"}`}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemoveItem={removeItem}
                      onMoveToWishlist={() => {
                        removeItem(item._id, item.selectedColor || item.color);
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* SECTION 2: Shipping Destination */}
              <CartAddressSelector
                isAuthenticated={isAuthenticated}
                addresses={addresses}
                isLoadingAddresses={isLoadingAddresses}
                selectedAddressId={selectedAddressId}
                setSelectedAddressId={setSelectedAddressId}
                isChangingAddress={isChangingAddress}
                setIsChangingAddress={setIsChangingAddress}
                onOpenAddressModal={() => setIsAddressModalOpen(true)}
              />

              {/* SECTION 3: Payment Preferences */}
              <CartPaymentSelector
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
              />
            </div>

            {/* Right: Order Summary Sidebar (Sticky on Desktop) */}
            <div className="lg:col-span-4 sticky top-24 space-y-4">
              <CartOrderSummary
                subtotal={subtotal}
                totalItemsCount={totalItemsCount}
                appliedDiscount={appliedDiscount}
                finalTotal={finalTotal}
                couponCode={couponCode}
                setCouponCode={setCouponCode}
                couponSuccess={couponSuccess}
                couponError={couponError}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={handleRemoveCoupon}
                selectedAddress={selectedAddress}
                paymentMethod={paymentMethod}
                isSubmittingOrder={isSubmittingOrder}
                orderError={orderError}
                onProceedCheckout={handleProceedCheckout}
              />
            </div>
          </div>
        )}
      </main>

      {/* Address Creation Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        initialData={null}
        isFirstAddress={addresses.length === 0}
        onSuccessCallback={() => {
          // Addresses re-fetched automatically by TanStack Query
        }}
      />

      <Footer />
    </div>
  );
}
