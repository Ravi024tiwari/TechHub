import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Package,
} from "lucide-react";
import {
  fetchAdminCategories,
  fetchAdminBrands,
  createAdminProduct,
  fetchAdminProductById,
  updateAdminProduct,
} from "../../api/adminApi";

// Modular Form Sections
import BasicInfoSection from "../../components/admin/product-form/BasicInfoSection";
import PricingStockSection from "../../components/admin/product-form/PricingStockSection";
import MediaDropzoneSection from "../../components/admin/product-form/MediaDropzoneSection";
import ColorVariantsSection from "../../components/admin/product-form/ColorVariantsSection";
import DynamicSpecsSection from "../../components/admin/product-form/DynamicSpecsSection";
import HighlightsSection from "../../components/admin/product-form/HighlightsSection";
import LiveProductPreview from "../../components/admin/product-form/LiveProductPreview";

export default function AdminProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // Loading & submission state
  const [loadingInitial, setLoadingInitial] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  // Taxonomies loaded from DB
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Primary form data state
  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    brandName: "",
    category: "",
    categoryName: "",
    sku: "",
    description: "",
    regularPrice: "",
    salePrice: "",
    stock: 20,
    lowStockThreshold: 5,
    isActive: true,
    isFeatured: false,
  });

  // Media state
  const [selectedFiles, setSelectedFiles] = useState([]); // [{ file, previewUrl, name, size }]
  const [existingImages, setExistingImages] = useState([]); // [{ url, public_id, isPrimary }]
  const [primaryIndex, setPrimaryIndex] = useState(0);

  // Color variants state
  const [colorVariants, setColorVariants] = useState([]);

  // Specifications state (Dynamic Key-Value Map)
  const [specifications, setSpecifications] = useState({});

  // Highlights, Box Contents, Warranty state
  const [keyFeatures, setKeyFeatures] = useState([]);
  const [boxContents, setBoxContents] = useState([]);
  const [warranty, setWarranty] = useState({
    durationMonths: 12,
    claimType: "Manufacturer Warranty",
  });

  // Fetch categories and brands on mount
  useEffect(() => {
    const loadTaxonomies = async () => {
      try {
        const [catsRes, brandsRes] = await Promise.all([
          fetchAdminCategories({ limit: 100 }),
          fetchAdminBrands({ limit: 100 }),
        ]);

        const loadedCats = catsRes?.categories || catsRes || [];
        const loadedBrands = brandsRes?.brands || brandsRes || [];

        setCategories(loadedCats);
        setBrands(loadedBrands);
      } catch (err) {
        console.error("Failed to load taxonomy metadata:", err);
      }
    };

    loadTaxonomies();
  }, []);

  // Fetch product if in Edit Mode
  useEffect(() => {
    if (!isEditMode) return;

    const loadProduct = async () => {
      setLoadingInitial(true);
      try {
        const product = await fetchAdminProductById(id);
        if (!product) {
          setSubmitError("Product not found");
          return;
        }

        setFormData({
          title: product.title || "",
          brand: product.brand?._id || product.brand || "",
          brandName: product.brandName || product.brand?.name || "",
          category: product.category?._id || product.category || "",
          categoryName: product.categoryName || product.category?.name || "",
          sku: product.sku || "",
          description: product.description || "",
          regularPrice: product.regularPrice ?? "",
          salePrice: product.salePrice ?? "",
          stock: product.stock ?? 0,
          lowStockThreshold: product.lowStockThreshold ?? 5,
          isActive: product.isActive !== false,
          isFeatured: product.isFeatured === true,
        });

        if (Array.isArray(product.images) && product.images.length > 0) {
          setExistingImages(product.images);
        }

        if (Array.isArray(product.colors)) {
          setColorVariants(product.colors);
        }

        if (product.specifications) {
          setSpecifications(
            product.specifications instanceof Map
              ? Object.fromEntries(product.specifications)
              : product.specifications
          );
        }

        if (Array.isArray(product.keyFeatures)) {
          setKeyFeatures(product.keyFeatures);
        }

        if (Array.isArray(product.boxContents)) {
          setBoxContents(product.boxContents);
        }

        if (product.warranty) {
          setWarranty({
            durationMonths: product.warranty.durationMonths || 12,
            claimType: product.warranty.claimType || "Manufacturer Warranty",
          });
        }
      } catch (err) {
        console.error("Failed to load product for editing:", err);
        setSubmitError(err.response?.data?.message || err.message || "Failed to load product");
      } finally {
        setLoadingInitial(false);
      }
    };

    loadProduct();
  }, [id, isEditMode]);

  // Auto-generate Industrial SKU
  const handleGenerateSku = () => {
    const brandStr = (formData.brandName || "PRD")
      .replace(/[^a-zA-Z]/g, "")
      .slice(0, 3)
      .toUpperCase();
    const catStr = (formData.categoryName || "GEN")
      .replace(/[^a-zA-Z]/g, "")
      .slice(0, 3)
      .toUpperCase();
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const sku = `${brandStr}-${catStr}-${Date.now().toString().slice(-4)}${randCode}`;
    setFormData((prev) => ({ ...prev, sku }));
  };

  // Compute Primary Image Preview URL for Live Card
  const primaryPreviewUrl =
    existingImages[0]?.url ||
    selectedFiles[primaryIndex]?.previewUrl ||
    selectedFiles[0]?.previewUrl ||
    "";

  // Form Submission Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    // Client-side validations
    if (!formData.title.trim()) {
      setSubmitError("Product title is required.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!formData.category) {
      setSubmitError("Please select a product category.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!formData.brand) {
      setSubmitError("Please select a product brand.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const regPrice = Number(formData.regularPrice);
    if (isNaN(regPrice) || regPrice < 0) {
      setSubmitError("Please provide a valid Regular Price (MRP).");
      return;
    }

    const salePrice = formData.salePrice !== "" && formData.salePrice !== null ? Number(formData.salePrice) : null;
    if (salePrice !== null && salePrice > regPrice) {
      setSubmitError("Promotional Sale Price cannot exceed Regular Price.");
      return;
    }

    if (!isEditMode && selectedFiles.length === 0) {
      setSubmitError("At least one product image is required for catalog render.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();

      // Core textual fields
      payload.append("title", formData.title.trim());
      payload.append("category", formData.category);
      payload.append("categoryName", formData.categoryName || "");
      payload.append("brand", formData.brand);
      payload.append("brandName", formData.brandName || "");
      payload.append("regularPrice", regPrice);
      if (salePrice !== null) {
        payload.append("salePrice", salePrice);
      }
      payload.append("stock", Number(formData.stock) || 0);
      payload.append("lowStockThreshold", Number(formData.lowStockThreshold) || 5);
      payload.append("description", formData.description.trim());
      if (formData.sku?.trim()) {
        payload.append("sku", formData.sku.trim().toUpperCase());
      }
      payload.append("isActive", formData.isActive);
      payload.append("isFeatured", formData.isFeatured);

      // JSON stringified fields
      payload.append("specifications", JSON.stringify(specifications));
      payload.append("keyFeatures", JSON.stringify(keyFeatures));
      payload.append("boxContents", JSON.stringify(boxContents));
      payload.append("warranty", JSON.stringify(warranty));
      payload.append("colors", JSON.stringify(colorVariants));

      // Append image files
      selectedFiles.forEach((item) => {
        payload.append("images", item.file);
      });

      if (isEditMode) {
        await updateAdminProduct(id, payload);
        setSubmitSuccess("Product successfully updated with technical specifications!");
      } else {
        await createAdminProduct(payload);
        setSubmitSuccess("New flagship product successfully published to catalog!");
      }

      // Smooth redirection to product inventory
      setTimeout(() => {
        navigate("/admin/products");
      }, 1200);
    } catch (err) {
      console.error("Submission failed:", err);
      const msg = err.response?.data?.message || err.message || "Failed to save product.";
      setSubmitError(msg);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-sky-400" />
        <p className="text-xs font-mono text-slate-400">
          Loading product specifications and media catalog...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-28 sm:pb-20">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <Link
            to="/admin/products"
            className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 transition-colors shrink-0"
            title="Return to inventory"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-sky-600 dark:text-sky-400 font-bold truncate">
                {isEditMode ? "Inventory Studio · Edit Mode" : "Catalog Creator · New Product"}
              </span>
            </div>
            <h1 className="text-base sm:text-2xl font-heading font-extrabold text-slate-900 dark:text-white truncate">
              {isEditMode ? `Edit: ${formData.title || "Product"}` : "Create New Flagship Product"}
            </h1>
          </div>
        </div>

        {/* Top Action CTAs - Responsive Full Width Row on Mobile */}
        <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            disabled={isSubmitting}
            className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/15 text-xs font-mono font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer text-center justify-center flex items-center"
          >
            Discard
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-[2] sm:flex-initial px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-black font-bold text-xs font-mono flex items-center justify-center gap-1.5 sm:gap-2 transition-all shadow-[0_0_20px_rgba(56,189,248,0.35)] cursor-pointer disabled:opacity-50 active:scale-98"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black shrink-0" />
                <span className="truncate">Publishing...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-black shrink-0" />
                <span className="truncate">{isEditMode ? "Save Changes" : "Publish Product"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {submitError && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-rose-500/15 border-2 border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs font-mono flex items-center gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500 dark:text-rose-400" />
          <div className="flex-1">
            <p className="font-bold">Validation or Database Error</p>
            <p className="text-rose-800 dark:text-rose-200/90 mt-0.5">{submitError}</p>
          </div>
        </div>
      )}

      {submitSuccess && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-mono flex items-center gap-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500 dark:text-emerald-400" />
          <div className="flex-1">
            <p className="font-bold">Success</p>
            <p className="text-emerald-800 dark:text-emerald-200/90 mt-0.5">{submitSuccess}</p>
          </div>
        </div>
      )}

      {/* Main Studio Dual-Column Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Sections 1 to 6) */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          {/* 1. General Info & Classification */}
          <BasicInfoSection
            formData={formData}
            setFormData={setFormData}
            categories={categories}
            brands={brands}
            onGenerateSku={handleGenerateSku}
          />

          {/* 2. Pricing & Warehouse Stock */}
          <PricingStockSection
            formData={formData}
            setFormData={setFormData}
          />

          {/* 3. Product Photography & Gallery */}
          <MediaDropzoneSection
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
            existingImages={existingImages}
            setExistingImages={setExistingImages}
            primaryIndex={primaryIndex}
            setPrimaryIndex={setPrimaryIndex}
          />

          {/* 4. Color Combinations & Finish Studio */}
          <ColorVariantsSection
            colorVariants={colorVariants}
            setColorVariants={setColorVariants}
          />

          {/* 5. Dynamic Technical Specifications */}
          <DynamicSpecsSection
            categoryName={formData.categoryName}
            specifications={specifications}
            setSpecifications={setSpecifications}
          />

          {/* 6. Key Features, Box Contents, & Warranty */}
          <HighlightsSection
            keyFeatures={keyFeatures}
            setKeyFeatures={setKeyFeatures}
            boxContents={boxContents}
            setBoxContents={setBoxContents}
            warranty={warranty}
            setWarranty={setWarranty}
          />

          {/* Bottom Submit Banner */}
          <div className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-white/15 bg-white dark:bg-[#090b10] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-sm dark:shadow-lg">
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Ready to deploy hardware to live store?</p>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">All specifications, stock units, and color swatches will be indexed immediately.</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => navigate("/admin/products")}
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-mono text-slate-700 dark:text-slate-300 transition-colors cursor-pointer text-center justify-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] sm:flex-initial px-5 sm:px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(56,189,248,0.4)] cursor-pointer disabled:opacity-50 active:scale-98"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black shrink-0" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-black shrink-0" />
                    <span>{isEditMode ? "Save Changes" : "Publish Product"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (Live Preview Sticky Pane) */}
        <div className="lg:col-span-4">
          <LiveProductPreview
            formData={formData}
            primaryPreviewUrl={primaryPreviewUrl}
            colorVariants={colorVariants}
            specifications={specifications}
          />
        </div>
      </form>
    </div>
  );
}
