import React, { useRef, useState } from "react";
import { UploadCloud, Image as ImageIcon, Star, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";

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

    const totalAllowed = MAX_FILES - (existingImages.length + selectedFiles.length);

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
        setErrorMsg(`"${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB size limit.`);
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
      const updated = prev.filter((_, i) => i !== idx);
      return updated;
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
    <div className="rounded-2xl border-2 border-slate-200 dark:border-white/15 bg-white dark:bg-gradient-to-b dark:from-[#141824] dark:via-[#0d1017] dark:to-[#080a0e] p-3.5 sm:p-6 lg:p-7 shadow-sm dark:shadow-[0_4px_25px_rgba(0,0,0,0.8),_0_0_15px_rgba(255,255,255,0.05)] space-y-4 sm:space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-600 dark:text-violet-400 font-mono font-bold text-xs sm:text-sm shrink-0 mt-0.5 sm:mt-0">
            03
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-lg font-heading font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
              <span>Product Photography & Gallery</span>
              <span className="text-rose-500 dark:text-rose-400 text-sm">*</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              Upload edge-to-edge flagship photos. At least 1 image is required for catalog render.
            </p>
          </div>
        </div>

        <span className="text-[11px] sm:text-xs font-mono px-2.5 sm:px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 w-fit">
          {totalImagesCount} / {MAX_FILES} Photos
        </span>
      </div>

      {/* Error alert if any */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed p-4 sm:p-7 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-2.5 ${
          isDragging
            ? "border-sky-500 bg-sky-500/10 scale-[1.01]"
            : "border-slate-300 dark:border-white/20 hover:border-slate-400 dark:hover:border-white/40 bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-100/50 dark:hover:bg-white/[0.04]"
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

        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-sky-500/10 dark:bg-white/[0.06] border border-sky-500/20 dark:border-white/10 flex items-center justify-center text-sky-600 dark:text-sky-400 shadow-inner group-hover:scale-110 transition-transform">
          <UploadCloud className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>

        <div>
          <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
            <span className="text-sky-600 dark:text-sky-400 underline decoration-sky-500/50 underline-offset-4">Click to browse</span> or drag photos here
          </p>
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 font-mono">
            High-res WebP, PNG, or JPG (Up to 6MB per image, max 6 images)
          </p>
        </div>
      </div>

      {/* Uploaded Thumbnails Grid */}
      {totalImagesCount > 0 && (
        <div className="space-y-3">
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 text-[11px] sm:text-xs font-mono text-slate-500 dark:text-slate-400">
            <span>Uploaded Gallery (Click star to set Primary Thumbnail):</span>
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Ready for Cloudinary CDN</span>
            </span>
          </div>

          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
            {/* Existing Server Images (Edit Mode) */}
            {existingImages.map((img, idx) => (
              <div
                key={`existing-${idx}`}
                className="group relative rounded-xl border border-slate-200 dark:border-white/15 overflow-hidden aspect-square bg-slate-100 dark:bg-[#090b10] shadow-sm"
              >
                <img
                  src={img.url}
                  alt="Product"
                  className="w-full h-full object-cover"
                />
                {/* Delete Button (Accessible on mobile touch & desktop hover) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveExistingImage(idx);
                  }}
                  className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/70 hover:bg-rose-500 text-white backdrop-blur-md transition-all cursor-pointer shadow-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                  title="Remove Image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                {idx === 0 && (
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-sky-500 text-white dark:text-black text-[9px] font-mono font-bold uppercase shadow-sm">
                    Primary
                  </div>
                )}
              </div>
            ))}

            {/* Newly Selected Local Files */}
            {selectedFiles.map((item, idx) => {
              const isPrimary = existingImages.length === 0 && primaryIndex === idx;
              return (
                <div
                  key={`new-${idx}`}
                  className={`group relative rounded-xl border-2 overflow-hidden aspect-square bg-slate-100 dark:bg-[#090b10] shadow-sm transition-all ${
                    isPrimary ? "border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]" : "border-slate-200 dark:border-white/15 hover:border-slate-300 dark:hover:border-white/40"
                  }`}
                >
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Primary Star Pill */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPrimaryIndex(idx);
                    }}
                    className={`absolute top-1.5 left-1.5 p-1 rounded-lg backdrop-blur-md transition-all ${
                      isPrimary
                        ? "bg-amber-500 text-black"
                        : "bg-black/60 text-slate-300 hover:text-amber-300 hover:bg-black/80"
                    }`}
                    title="Set as Primary Cover"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveNewFile(idx);
                    }}
                    className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/60 hover:bg-rose-500 text-slate-300 hover:text-white backdrop-blur-md transition-all"
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
