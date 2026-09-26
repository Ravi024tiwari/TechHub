import React, { useState } from "react";
import AddressModal from "./AddressModal";
import AddressCard from "./AddressCard";
import {
  useAddressesQuery,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} from "@/hooks/useAddresses";
import {
  MapPin,
  Plus,
  Check,
  Loader2,
  ShieldCheck,
  Compass,
} from "lucide-react";

export default function AddressBookSection() {
  const { data: addresses = [], isLoading } = useAddressesQuery();
  const deleteAddressMutation = useDeleteAddressMutation();
  const setDefaultAddressMutation = useSetDefaultAddressMutation();

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deletingAddressId, setDeletingAddressId] = useState(null);
  const [settingDefaultId, setSettingDefaultId] = useState(null);
  const [notificationMsg, setNotificationMsg] = useState("");

  const showNotification = (msg) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(""), 3500);
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      setSettingDefaultId(addressId);
      await setDefaultAddressMutation.mutateAsync(addressId);
      showNotification("Default delivery address updated.");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to set default address.");
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to remove this delivery address?")) return;
    try {
      setDeletingAddressId(addressId);
      await deleteAddressMutation.mutateAsync(addressId);
      showNotification("Address removed from your address book.");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete address.");
    } finally {
      setDeletingAddressId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Address Header Bar */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-5 relative overflow-hidden">
        {/* Subtle ambient corner flare */}
        <div className="absolute -top-14 -left-14 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-sm mt-0.5 sm:mt-0">
            <Compass className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                Delivery Address Book
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                {addresses.length} / 10 Saved
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
              Manage verified shipping destinations for rapid 1-click checkout and courier dispatch.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingAddress(null);
            setIsAddressModalOpen(true);
          }}
          disabled={addresses.length >= 10}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-heading font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Address</span>
        </button>
      </div>

      {notificationMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2 font-medium animate-in fade-in">
          <Check className="h-4 w-4 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Addresses Grid or Empty State */}
      {isLoading ? (
        <div className="py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-500 mb-2" />
          <p className="text-xs text-slate-400 font-mono">Synchronizing address vault...</p>
        </div>
      ) : addresses.length === 0 ? (
        <div className="py-16 text-center max-w-md mx-auto p-8 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <MapPin className="h-8 w-8" />
          </div>
          <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 dark:text-white mb-2">
            No Saved Delivery Addresses
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Add your primary delivery location now to enjoy streamlined, 1-click checkout whenever you order hardware flagships.
          </p>
          <button
            type="button"
            onClick={() => {
              setEditingAddress(null);
              setIsAddressModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-heading font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.03] active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add First Address</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {addresses.map((addr) => (
            <AddressCard
              key={addr._id}
              address={addr}
              isDefault={Boolean(addr.isDefault)}
              isDeleting={deletingAddressId === addr._id}
              isSettingDefault={settingDefaultId === addr._id}
              onSetDefault={() => handleSetDefaultAddress(addr._id)}
              onEdit={() => {
                setEditingAddress(addr);
                setIsAddressModalOpen(true);
              }}
              onDelete={() => handleDeleteAddress(addr._id)}
            />
          ))}
        </div>
      )}

      {/* Address Edit/Add Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => {
          setIsAddressModalOpen(false);
          setEditingAddress(null);
        }}
        initialData={editingAddress}
        isFirstAddress={addresses.length === 0}
        onSuccessCallback={() => {
          showNotification(
            editingAddress ? "Address updated successfully." : "New address added to your address book."
          );
        }}
      />
    </div>
  );
}
