import React, { useRef, useState } from "react";
import {
  UploadCloud,
  Image as ImageIcon,
  Star,
  Trash2,
  AlertCircle,
  CheckCircle2,
  FileImage,
} from "lucide-react";

export default function MediaDropzoneSection({
  selectedFiles = [],
  setSelectedFiles,
  existingImages = [],
  setExistingImages,
  primaryIndex = 0,
  setPrimaryIndex,
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const MAX_FILES = 6;
  const MAX_FILE_SIZE_MB = 6;

  const handleFilesAdded = (filesList) => {
    setErrorMsg("");
    const newFiles = Array.from(filesList);
    const validFiles = [];

    const totalAllowed =
      MAX_FILES - (existingImages.length + selectedFiles.length);

    if (totalAllowed <= 0) {
      setErrorMsg(`Maximum of ${MAX_FILES} photos allowed per product.`);
      return;
    }

    for (const file of newFiles.slice(0, totalAllowed)) {
      if (!file.type.startsWith("image/")) {
        setErrorMsg("Only image files (JPEG, PNG, WebP) are supported.");
        continue;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setErrorMsg(
          `"${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB size limit.`
        );
        continue;
      }

      // Add preview URL
      validFiles.push({
        file,
        previewUrl: URL.createObjectURL(file),
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      });
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const handleRemoveNewFile = (idx) => {
    setSelectedFiles((prev) => {
      const removed = prev[idx];
      if (removed?.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return prev.filter((_, i) => i !== idx);
    });

    if (primaryIndex === idx) {
      setPrimaryIndex(0);
    } else if (primaryIndex > idx) {
      setPrimaryIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const handleRemoveExistingImage = (idx) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const totalImagesCount = existingImages.length + selectedFiles.length;

  return (
    <div className="relative rounded-2xl sm:rounded-3xl border border-slate-300 dark:border-white/30 bg-white dark:bg-[#0c0f17] p-4 sm:p-7 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 group overflow-hidden space-y-5 sm:space-y-6">
      {/* Contained Ambient Background Glow */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl pointer-events-none">
        <div className="absolute -top-16 -right-16 w-52 h-52 bg-gradient-to-br from-violet-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500" />
      </div>

      {/* Section Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-slate-200 dark:border-white/15">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-violet-500/20 via-purple-500/15 to-violet-500/10 text-violet-600 dark:text-violet-400 font-mono font-bold text-xs sm:text-sm flex items-center justify-center border border-violet-500/30 shrink-0 shadow-xs">
            03
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-heading font-black text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
              <span>Product Photography & Gallery</span>
              <span className="text-rose-500">*</span>
            </h2>
            <p className="text-xs font-sans text-slate-500 dark:text-slate-400 line-clamp-1">
              High-resolution product media. At least 1 image is required for storefront rendering.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-300 w-fit shrink-0">
          {totalImagesCount} / {MAX_FILES} Photos
        </span>
      </div>

      {/* Error alert if any */}
      {errorMsg && (
        <div className="relative z-10 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-sans font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative z-10 rounded-2xl border-2 border-dashed p-6 sm:p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-3 ${
          isDragging
            ? "border-orange-500 bg-orange-500/10 scale-[1.01]"
            : "border-slate-300 dark:border-white/20 hover:border-orange-500 dark:hover:border-orange-400 bg-slate-50/70 dark:bg-[#07090e] hover:bg-slate-100/70 dark:hover:bg-white/[0.03]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFilesAdded(e.target.files);
          }}
        />

        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/30 flex items-center justify-center text-orange-600 dark:text-orange-400 shadow-xs group-hover:scale-110 transition-transform">
          <UploadCloud className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>

        <div>
          <p className="text-xs sm:text-sm font-sans font-bold text-slate-900 dark:text-white">
            <span className="text-orange-600 dark:text-orange-400 underline decoration-orange-500/50 underline-offset-4">
              Click to browse
            </span>{" "}
            or drag & drop flagship photos here
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-sans">
            High-res WebP, PNG, or JPG (Up to 6MB per photo, max 6 images)
          </p>
        </div>
      </div>

      {/* Uploaded Thumbnails Grid */}
      {totalImagesCount > 0 && (
        <div className="relative z-10 space-y-3 pt-2">
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 text-xs font-sans text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Uploaded Gallery ({totalImagesCount}): Click star to set Primary Cover
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Optimized for CDN</span>
            </span>
          </div>

          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {/* Existing Server Images (Edit Mode) */}
            {existingImages.map((img, idx) => (
              <div
                key={`existing-${idx}`}
                className="group relative rounded-2xl border border-slate-300 dark:border-white/20 overflow-hidden aspect-square bg-slate-100 dark:bg-[#07090e] shadow-xs"
              >
                <img
                  src={img.url}
                  alt="Product"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Primary Cover Badge */}
                {idx === 0 && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-orange-500 text-white text-[9px] font-sans font-extrabold uppercase shadow-sm flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-white" />
                    <span>Cover</span>
                  </div>
                )}

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveExistingImage(idx);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-xl bg-black/75 hover:bg-rose-600 text-white backdrop-blur-md transition-all cursor-pointer shadow-md active:scale-95"
                  title="Remove Image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Newly Selected Local Files */}
            {selectedFiles.map((item, idx) => {
              const isPrimary =
                existingImages.length === 0 && primaryIndex === idx;
              return (
                <div
                  key={`new-${idx}`}
                  className={`group relative rounded-2xl border-2 overflow-hidden aspect-square bg-slate-100 dark:bg-[#07090e] shadow-xs transition-all ${
                    isPrimary
                      ? "border-orange-500 shadow-md shadow-orange-500/20"
                      : "border-slate-300 dark:border-white/20 hover:border-slate-400 dark:hover:border-white/40"
                  }`}
                >
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Primary Star Pill */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPrimaryIndex(idx);
                    }}
                    className={`absolute top-2 left-2 p-1.5 rounded-xl backdrop-blur-md transition-all cursor-pointer shadow-md active:scale-95 ${
                      isPrimary
                        ? "bg-orange-500 text-white"
                        : "bg-black/60 text-slate-300 hover:text-orange-400 hover:bg-black/80"
                    }`}
                    title="Set as Primary Cover"
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        isPrimary ? "fill-white" : ""
                      }`}
                    />
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveNewFile(idx);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-xl bg-black/60 hover:bg-rose-600 text-slate-200 hover:text-white backdrop-blur-md transition-all cursor-pointer shadow-md active:scale-95"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Bottom details */}
                  <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/90 to-transparent">
                    <p className="text-[10px] font-mono text-slate-300 truncate">
                      {item.size}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
