import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Upload,
  Image as ImageIcon,
  Loader2,
  Tag,
  Star,
  Globe,
  Trash2,
  CheckCircle2,
  FileCheck
} from "lucide-react";
import { createAdminBrand, updateAdminBrand } from "../../../api/adminApi";

export default function BrandFormModal({
  isOpen,
  onClose,
  brand = null, // null for create, object for edit
  onSaved,
}) {
  const isEdit = Boolean(brand && brand._id);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    website: "",
    isFeatured: false,
    isActive: true,
  });

  // Logo upload state
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const logoInputRef = useRef(null);

  // Banner upload state
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [isDraggingBanner, setIsDraggingBanner] = useState(false);
  const bannerInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name || "",
        slug: brand.slug || "",
        description: brand.description || "",
        website: brand.website || "",
        isFeatured: Boolean(brand.isFeatured),
        isActive: brand.isActive !== false,
      });
      setLogoPreview(brand.logo?.url || brand.logoUrl || "");
      setBannerPreview(brand.banner?.url || brand.bannerUrl || "");
    } else {
      setFormData({
        name: "",
        slug: "",
        description: "",
        website: "",
        isFeatured: false,
        isActive: true,
      });
      setLogoFile(null);
      setLogoPreview("");
      setBannerFile(null);
      setBannerPreview("");
    }
    setError("");
  }, [brand, isOpen]);

  // Clean up blob URLs when modal closes or unmounts
  useEffect(() => {
    return () => {
      if (logoPreview && logoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
      if (bannerPreview && bannerPreview.startsWith("blob:")) {
        URL.revokeObjectURL(bannerPreview);
      }
    };
  }, [logoPreview, bannerPreview]);

  if (!isOpen) return null;

  // Format bytes helper
  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return "";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Auto-generate slug as name is typed if slug hasn't been custom edited
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

  // Logo file handlers
  const handleLogoSelect = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      setError("Please select a valid image file for the brand logo (PNG, JPG, SVG, WEBP).");
      return;
    }
    if (logoPreview && logoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleCancelLogo = (e) => {
    e.stopPropagation();
    if (logoPreview && logoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoFile(null);
    setLogoPreview("");
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  // Banner file handlers
  const handleBannerSelect = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      setError("Please select a valid image file for the brand banner.");
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

  // Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Brand name is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = new FormData();
      payload.append("name", formData.name.trim());
      if (formData.slug.trim()) payload.append("slug", formData.slug.trim());
      payload.append("description", formData.description.trim());
      payload.append("website", formData.website.trim());
      payload.append("isFeatured", String(formData.isFeatured));
      payload.append("isActive", String(formData.isActive));

      if (logoFile) {
        payload.append("logo", logoFile);
      }
      if (bannerFile) {
        payload.append("banner", bannerFile);
      }

      let savedBrand;
      if (isEdit) {
        savedBrand = await updateAdminBrand(brand._id, payload);
      } else {
        savedBrand = await createAdminBrand(payload);
      }

      onSaved(savedBrand);
      onClose();
    } catch (err) {
      console.error("Save brand error:", err);
      setError(err.response?.data?.message || err.message || "Failed to save brand partner");
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
        <div className="absolute top-0 left-1/4 right-1/4 h-1 bg-gradient-to-r from-transparent via-purple-500/60 to-transparent pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-[#141724]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <Tag className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-extrabold text-base sm:text-lg text-white tracking-tight">
                  {isEdit ? "Edit Brand Partner" : "Register New Brand"}
                </h3>
                {formData.isFeatured && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-amber-400" />
                    Featured
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs font-mono text-slate-400 mt-0.5">
                {isEdit ? `Updating hardware manufacturer profile for ${brand.name}` : "Add an official electronics manufacturer to the catalog ecosystem"}
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
                Brand Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Apple, Sony, ASUS, Bose"
                value={formData.name}
                onChange={handleNameChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-body text-white placeholder-slate-500 focus:outline-none focus:border-purple-400/60 focus:bg-white/[0.06] transition-all"
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
                  placeholder="e.g. apple, sony, asus"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full pl-6 pr-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-400/60 focus:bg-white/[0.06] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Official Website */}
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-200 mb-1.5">
              Official Website
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="https://www.apple.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-400/60 focus:bg-white/[0.06] transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-200 mb-1.5">
              Brand Description / Hardware Specialty
            </label>
            <textarea
              rows="2"
              placeholder="Official hardware focus, flagships, and manufacturer background..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-body text-white placeholder-slate-500 focus:outline-none focus:border-purple-400/60 focus:bg-white/[0.06] transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Media Section: Brand Logo & Brand Banner with Interactive Cancel & Previews */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Brand Media Showcase
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Supports PNG, SVG, JPG, WEBP
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* --- BRAND LOGO ASSET --- */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-semibold text-slate-300">
                    Brand Logo
                  </label>
                  {logoPreview && (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Ready
                    </span>
                  )}
                </div>

                {/* Logo Dropzone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingLogo(true);
                  }}
                  onDragLeave={() => setIsDraggingLogo(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingLogo(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleLogoSelect(file);
                  }}
                  onClick={() => logoInputRef.current?.click()}
                  className={`relative group rounded-xl border-2 border-dashed p-3.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                    isDraggingLogo
                      ? "border-purple-400 bg-purple-500/10 scale-[1.02]"
                      : logoPreview
                      ? "border-purple-500/30 bg-white/[0.02] hover:border-purple-400/50"
                      : "border-white/10 bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.03]"
                  }`}
                >
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleLogoSelect(file);
                    }}
                    className="hidden"
                  />

                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                    <Upload className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-mono font-semibold text-slate-200">
                    {logoPreview ? "Replace Brand Logo" : "Upload Brand Logo"}
                  </p>
                  <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                    Square 1:1 format recommended
                  </p>
                </div>

                {/* Interactive Logo Preview Card (Rendered Below) */}
                {logoPreview && (
                  <div className="relative rounded-xl border border-purple-500/30 bg-[#131622] p-3 shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-12 h-12 rounded-xl bg-black/50 border border-white/15 p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                        <img
                          src={logoPreview}
                          alt="Logo Preview"
                          className="w-full h-full object-contain filter drop-shadow-sm"
                        />
                      </div>

                      <div className="overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <FileCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                          <p className="text-xs font-mono font-bold text-white truncate">
                            {logoFile ? logoFile.name : `${formData.name || "Brand"} Logo`}
                          </p>
                        </div>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {logoFile ? formatBytes(logoFile.size) : "Current Cloudinary Asset"}
                        </p>
                      </div>
                    </div>

                    {/* Interactive Cancel / Remove Button */}
                    <button
                      type="button"
                      onClick={handleCancelLogo}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/30 transition-all shrink-0"
                      title="Cancel and remove selected logo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* --- BRAND BANNER ASSET --- */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-semibold text-slate-300">
                    Brand Banner (Optional)
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
                      ? "border-purple-400 bg-purple-500/10 scale-[1.02]"
                      : bannerPreview
                      ? "border-purple-500/30 bg-white/[0.02] hover:border-purple-400/50"
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

                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                    <Upload className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-mono font-semibold text-slate-200">
                    {bannerPreview ? "Replace Brand Banner" : "Upload Brand Banner"}
                  </p>
                  <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                    Wide 16:9 or 3:1 ratio recommended
                  </p>
                </div>

                {/* Interactive Banner Preview Card (Rendered Below) */}
                {bannerPreview && (
                  <div className="relative rounded-xl border border-purple-500/30 bg-[#131622] p-3 shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
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
                            {bannerFile ? bannerFile.name : `${formData.name || "Brand"} Banner`}
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

          {/* Toggles: Featured & Active */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Featured */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/15 transition-all">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg ${formData.isFeatured ? "bg-amber-400/15 text-amber-300" : "bg-white/5 text-slate-500"}`}>
                  <Star className={`w-4 h-4 ${formData.isFeatured ? "fill-amber-400" : ""}`} />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-white block">Featured Partner</span>
                  <p className="text-[10px] text-slate-400">Highlight in brand carousels</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}
                className={`w-11 h-6 rounded-full p-1 transition-colors flex items-center ${
                  formData.isFeatured ? "bg-amber-400" : "bg-slate-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-black transition-transform ${
                    formData.isFeatured ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Active */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/15 transition-all">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg ${formData.isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-slate-500"}`}>
                  <span className={`block w-2.5 h-2.5 rounded-full ${formData.isActive ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-white block">Catalog Status</span>
                  <p className="text-[10px] text-slate-400">
                    {formData.isActive ? "Visible in filters & store" : "Hidden in draft status"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                className={`w-11 h-6 rounded-full p-1 transition-colors flex items-center ${
                  formData.isActive ? "bg-emerald-500" : "bg-slate-700"
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
              <span>{isEdit ? "Save Brand Changes" : "Register Brand"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
