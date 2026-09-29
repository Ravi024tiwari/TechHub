import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Camera,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useUpdateProfileMutation } from "../../hooks/useAuth";

/**
 * AdminProfilePhotoModal - Production-grade responsive modal mounted via Portal.
 * Guaranteed to center within the viewport on all screen resolutions and orientations.
 */
export default function AdminProfilePhotoModal({ isOpen, onClose, user }) {
  const fileInputRef = useRef(null);
  const updateProfileMutation = useUpdateProfileMutation();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Clean up object URLs on unmount / file change
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Lock body scroll while modal is active
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentAvatarUrl =
    typeof user?.avatar === "object" ? user?.avatar?.url : user?.avatar;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "A";

  const handleFileSelect = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please choose an image file (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Image size exceeds the 5MB upload limit.");
      return;
    }

    setErrorMsg("");
    setSelectedFile(file);
    setIsRemoving(false);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const onFileInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  };

  const handleRemoveClick = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsRemoving(true);
    setErrorMsg("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCancelSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsRemoving(false);
    setErrorMsg("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const formData = new FormData();

      if (selectedFile) {
        formData.append("avatar", selectedFile);
      } else if (isRemoving) {
        formData.append("removeAvatar", "true");
      } else {
        onClose();
        return;
      }

      await updateProfileMutation.mutateAsync(formData);
      setSuccessMsg(
        isRemoving
          ? "Profile photo removed successfully!"
          : "Profile photo updated successfully!"
      );

      setTimeout(() => {
        setSuccessMsg("");
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update profile photo."
      );
    }
  };

  const isPending = updateProfileMutation.isPending;
  const hasChanges = Boolean(selectedFile || isRemoving);

  // Active preview image
  const displayImage = isRemoving
    ? null
    : previewUrl || currentAvatarUrl;

  const modalNode = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150"
      style={{ minHeight: "100dvh" }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) onClose();
      }}
    >
      <div
        className="relative w-full max-w-sm sm:max-w-md my-auto rounded-2xl bg-white dark:bg-[#0e121b] border-2 border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-2rem)] animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
              <Camera className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3
                id="modal-title"
                className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate"
              >
                Update Profile Photo
              </h3>
              <p className="text-[10px] sm:text-[11px] font-sans text-slate-500 dark:text-slate-400 truncate">
                Admin identity &amp; avatar management
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50 shrink-0 ml-2"
            title="Close dialog"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
          {/* Notifications */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs font-sans">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="break-words">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-sans">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Current / Preview Avatar Display */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative group/circle">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-3 border-slate-200 dark:border-white/15 shadow-lg bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 flex items-center justify-center text-white shrink-0">
                {displayImage ? (
                  <img
                    src={displayImage}
                    alt={user?.name || "Admin"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl sm:text-3xl font-heading font-black">
                    {initials}
                  </span>
                )}
              </div>

              {/* Status Shield Badge */}
              <div className="absolute bottom-0 right-0 p-1 rounded-full bg-emerald-500 text-white ring-2 ring-white dark:ring-[#0e121b] shadow-sm">
                <ShieldCheck className="w-3 h-3" />
              </div>
            </div>

            <div className="mt-1.5 text-center min-w-0 max-w-full">
              <p className="text-xs font-heading font-bold text-slate-800 dark:text-slate-200 truncate">
                {user?.name || "Administrator"}
              </p>
              <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-3 sm:p-4 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-amber-500 bg-amber-500/10 scale-[1.01]"
                : "border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-white/[0.02] hover:border-amber-500 hover:bg-slate-100/70 dark:hover:bg-white/[0.04]"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/jpg"
              onChange={onFileInputChange}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center gap-1 text-xs">
              <div className="p-2 rounded-full bg-amber-500/10 text-amber-500">
                <Upload className="w-4 h-4" />
              </div>
              <p className="font-heading font-bold text-slate-800 dark:text-slate-200 text-xs">
                Click to browse or drag &amp; drop
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans">
                JPG, PNG, WebP up to 5MB (Square ratio recommended)
              </p>
            </div>
          </div>

          {/* Selected File Chip or Remove State */}
          {selectedFile ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
              <div className="flex items-center gap-2 truncate">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate">
                  {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                </span>
              </div>
              <button
                type="button"
                onClick={handleCancelSelection}
                className="text-xs text-rose-500 hover:underline cursor-pointer shrink-0 font-medium ml-2"
              >
                Clear
              </button>
            </div>
          ) : isRemoving ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs">
              <span className="text-rose-600 dark:text-rose-400 font-sans font-medium text-[11px]">
                Photo will be removed upon saving.
              </span>
              <button
                type="button"
                onClick={handleCancelSelection}
                className="text-xs text-slate-500 hover:underline cursor-pointer shrink-0"
              >
                Undo
              </button>
            </div>
          ) : currentAvatarUrl ? (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleRemoveClick}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-heading font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Current Photo</span>
              </button>
            </div>
          ) : null}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-end gap-2 px-4 sm:px-5 py-3 border-t border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02] shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-white/10 transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges || isPending}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 sm:py-2 rounded-xl text-xs font-heading font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-sm shadow-amber-500/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5" />
                <span>Save Profile Photo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalNode, document.body)
    : modalNode;
}
