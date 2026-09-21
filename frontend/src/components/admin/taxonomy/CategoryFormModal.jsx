import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Upload,
  Image as ImageIcon,
  Loader2,
  Layers,
  Trash2,
  CheckCircle2,
  FileCheck
} from "lucide-react";
import { createAdminCategory, updateAdminCategory } from "../../../api/adminApi";

export default function CategoryFormModal({
  isOpen,
  onClose,
  category = null, // null for create mode, object for edit mode
  parentCategories = [],
  onSaved,
}) {
  const isEdit = Boolean(category && category._id);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    parent: "",
    displayOrder: 0,
    isActive: true,
  });

  // Icon upload state
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState("");
  const [isDraggingIcon, setIsDraggingIcon] = useState(false);
  const iconInputRef = useRef(null);

  // Banner upload state
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [isDraggingBanner, setIsDraggingBanner] = useState(false);
  const bannerInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        slug: category.slug || "",
        description: category.description || "",
        parent: category.parent?._id || category.parent || "",
        displayOrder: category.displayOrder || 0,
        isActive: category.isActive !== false,
      });
      setIconPreview(category.icon?.url || category.iconUrl || "");
      setBannerPreview(category.banner?.url || category.bannerUrl || "");
    } else {
      setFormData({
        name: "",
        slug: "",
        description: "",
        parent: "",
        displayOrder: 0,
        isActive: true,
      });
      setIconFile(null);
      setIconPreview("");
      setBannerFile(null);
      setBannerPreview("");
    }
    setError("");
  }, [category, isOpen]);

  // Clean up blob URLs
  useEffect(() => {
    return () => {
      if (iconPreview && iconPreview.startsWith("blob:")) {
        URL.revokeObjectURL(iconPreview);
      }
      if (bannerPreview && bannerPreview.startsWith("blob:")) {
        URL.revokeObjectURL(bannerPreview);
      }
    };
  }, [iconPreview, bannerPreview]);

  if (!isOpen) return null;

  // Format bytes helper
  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return "";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: isEdit ? prev.slug : generatedSlug,
    }));
  };

  // Icon handlers
  const handleIconSelect = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      setError("Please select a valid image file for the category icon.");
      return;
    }
    if (iconPreview && iconPreview.startsWith("blob:")) {
      URL.revokeObjectURL(iconPreview);
    }
    setIconFile(file);
    setIconPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleCancelIcon = (e) => {
    e.stopPropagation();
    if (iconPreview && iconPreview.startsWith("blob:")) {
      URL.revokeObjectURL(iconPreview);
    }
    setIconFile(null);
    setIconPreview("");
    if (iconInputRef.current) iconInputRef.current.value = "";
  };

  // Banner handlers
  const handleBannerSelect = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      setError("Please select a valid image file for the banner.");
      return;
    }
    if (bannerPreview && bannerPreview.startsWith("blob:")) {
      URL.revokeObjectURL(bannerPreview);
    }
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleCancelBanner = (e) => {
    e.stopPropagation();
    if (bannerPreview && bannerPreview.startsWith("blob:")) {
      URL.revokeObjectURL(bannerPreview);
    }
    setBannerFile(null);
    setBannerPreview("");
    if (bannerInputRef.current) bannerInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = new FormData();
      payload.append("name", formData.name.trim());
      if (formData.slug.trim()) payload.append("slug", formData.slug.trim());
      payload.append("description", formData.description.trim());
      if (formData.parent) payload.append("parent", formData.parent);
      payload.append("displayOrder", String(formData.displayOrder || 0));
      payload.append("isActive", String(formData.isActive));

      if (iconFile) {
        payload.append("icon", iconFile);
      }
      if (bannerFile) {
        payload.append("banner", bannerFile);
      }

      let savedCategory;
      if (isEdit) {
        savedCategory = await updateAdminCategory(category._id, payload);
      } else {
        savedCategory = await createAdminCategory(payload);
      }

      onSaved(savedCategory);
      onClose();
    } catch (err) {
      console.error("Save category error:", err);
      setError(err.response?.data?.message || err.message || "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Container */}
      <div className="relative w-full max-w-2xl bg-[#0f121a] border border-white/[0.14] rounded-2xl sm:rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] z-10 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/4 right-1/4 h-1 bg-gradient-to-r from-transparent via-sky-500/60 to-transparent pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-[#141724]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-[0_0_15px_rgba(14,165,233,0.2)]">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base sm:text-lg text-white tracking-tight">
                {isEdit ? "Edit Category Node" : "Register New Category"}
              </h3>
              <p className="text-[11px] sm:text-xs font-mono text-slate-400 mt-0.5">
                {isEdit ? `Updating taxonomy branch for ${category.name}` : "Create an electronics taxonomy department"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
              <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Name & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-200 mb-1.5">
                Category Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Gaming Laptops, Audio, Wearables"
                value={formData.name}
                onChange={handleNameChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-body text-white placeholder-slate-500 focus:outline-none focus:border-sky-400/60 focus:bg-white/[0.06] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-slate-200 mb-1.5">
                URL Slug Identifier
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500 pointer-events-none">
                  /
                </span>
                <input
                  type="text"
                  placeholder="e.g. gaming-laptops"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full pl-6 pr-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-sky-400/60 focus:bg-white/[0.06] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Parent Category & Display Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-200 mb-1.5">
                Parent Hierarchy Node
              </label>
              <select
                value={formData.parent}
                onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141724] border border-white/10 text-xs font-body text-white focus:outline-none focus:border-sky-400/60 focus:bg-[#181c2c] transition-all"
              >
                <option value="">None (Top-Level Root Category)</option>
                {parentCategories
                  .filter((c) => !isEdit || c._id !== category._id)
                  .map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-slate-200 mb-1.5">
                Display Order Priority
              </label>
              <input
                type="number"
                min="0"
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData({ ...formData, displayOrder: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-sky-400/60 focus:bg-white/[0.06] transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-200 mb-1.5">
              Category Description
            </label>
            <textarea
              rows="2"
              placeholder="Electronics category taxonomy branch with dynamic specifications..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-body text-white placeholder-slate-500 focus:outline-none focus:border-sky-400/60 focus:bg-white/[0.06] transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Media Section: Icon & Banner with Previews and Cancel Buttons */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Department Graphics & Branding
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Supports PNG, SVG, JPG, WEBP
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* --- CATEGORY ICON ASSET --- */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-semibold text-slate-300">
                    Category Icon (Optional)
                  </label>
                  {iconPreview && (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Ready
                    </span>
                  )}
                </div>

                {/* Icon Dropzone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingIcon(true);
                  }}
                  onDragLeave={() => setIsDraggingIcon(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingIcon(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleIconSelect(file);
                  }}
                  onClick={() => iconInputRef.current?.click()}
                  className={`relative group rounded-xl border-2 border-dashed p-3.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                    isDraggingIcon
                      ? "border-sky-400 bg-sky-500/10 scale-[1.02]"
                      : iconPreview
                      ? "border-sky-500/30 bg-white/[0.02] hover:border-sky-400/50"
                      : "border-white/10 bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.03]"
                  }`}
                >
                  <input
                    ref={iconInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleIconSelect(file);
                    }}
                    className="hidden"
                  />

                  <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                    <Upload className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-mono font-semibold text-slate-200">
                    {iconPreview ? "Replace Category Icon" : "Upload Category Icon"}
                  </p>
                  <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                    Square 1:1 format recommended
                  </p>
                </div>

                {/* Interactive Icon Preview Card Below */}
                {iconPreview && (
                  <div className="relative rounded-xl border border-sky-500/30 bg-[#131622] p-3 shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-12 h-12 rounded-xl bg-black/50 border border-white/15 p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                        <img
                          src={iconPreview}
                          alt="Icon Preview"
                          className="w-full h-full object-contain filter drop-shadow-sm"
                        />
                      </div>

                      <div className="overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <FileCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                          <p className="text-xs font-mono font-bold text-white truncate">
                            {iconFile ? iconFile.name : `${formData.name || "Category"} Icon`}
                          </p>
                        </div>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                              {iconFile ? formatBytes(iconFile.size) : "Current Cloudinary Asset"}
                        </p>
                      </div>
                    </div>

                    {/* Interactive Cancel / Remove Button */}
                    <button
                      type="button"
                      onClick={handleCancelIcon}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/30 transition-all shrink-0"
                      title="Cancel and remove selected icon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* --- CATEGORY BANNER ASSET --- */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-semibold text-slate-300">
                    Department Banner (Optional)
                  </label>
                  {bannerPreview && (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Ready
                    </span>
                  )}
                </div>

                {/* Banner Dropzone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingBanner(true);
                  }}
                  onDragLeave={() => setIsDraggingBanner(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingBanner(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleBannerSelect(file);
                  }}
                  onClick={() => bannerInputRef.current?.click()}
                  className={`relative group rounded-xl border-2 border-dashed p-3.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                    isDraggingBanner
                      ? "border-sky-400 bg-sky-500/10 scale-[1.02]"
                      : bannerPreview
                      ? "border-sky-500/30 bg-white/[0.02] hover:border-sky-400/50"
                      : "border-white/10 bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.03]"
                  }`}
                >
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleBannerSelect(file);
                    }}
                    className="hidden"
                  />

                  <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                    <Upload className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-mono font-semibold text-slate-200">
                    {bannerPreview ? "Replace Banner Graphic" : "Upload Banner Graphic"}
                  </p>
                  <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                    Wide 16:9 ratio recommended
                  </p>
                </div>

                {/* Interactive Banner Preview Card Below */}
                {bannerPreview && (
                  <div className="relative rounded-xl border border-sky-500/30 bg-[#131622] p-3 shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-16 h-12 rounded-xl bg-black/50 border border-white/15 overflow-hidden shrink-0">
                        <img
                          src={bannerPreview}
                          alt="Banner Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <FileCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                          <p className="text-xs font-mono font-bold text-white truncate">
                            {bannerFile ? bannerFile.name : `${formData.name || "Category"} Banner`}
                          </p>
                        </div>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {bannerFile ? formatBytes(bannerFile.size) : "Current Cloudinary Asset"}
                        </p>
                      </div>
                    </div>

                    {/* Interactive Cancel / Remove Button */}
                    <button
                      type="button"
                      onClick={handleCancelBanner}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/30 transition-all shrink-0"
                      title="Cancel and remove selected banner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active Toggle */}
          <div className="pt-1">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/15 transition-all">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg ${formData.isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-slate-500"}`}>
                  <span className={`block w-2.5 h-2.5 rounded-full ${formData.isActive ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-white block">Active Catalog Node</span>
                  <p className="text-[10px] text-slate-400">
                    {formData.isActive ? "Visible in mega menus & product filters" : "Hidden in draft taxonomy"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                className={`w-11 h-6 rounded-full p-1 transition-colors flex items-center ${
                  formData.isActive ? "bg-sky-500" : "bg-slate-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    formData.isActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="py-2.5 px-4 rounded-xl text-xs font-mono font-semibold text-slate-300 hover:text-white bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-5 rounded-xl text-xs font-mono font-bold text-black bg-white hover:bg-slate-200 shadow-lg shadow-white/10 disabled:opacity-50 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isEdit ? "Save Category Node" : "Publish Category"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
