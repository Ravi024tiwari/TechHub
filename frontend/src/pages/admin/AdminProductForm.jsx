import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import EditModeProductHUD from "../../components/admin/product-form/EditModeProductHUD";
import SectionNavTabs from "../../components/admin/product-form/SectionNavTabs";
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

  // Product metadata for Edit Mode
  const [rawProduct, setRawProduct] = useState(null);
  const [originalSnapshot, setOriginalSnapshot] = useState(null);

  // Active section tracking for tabs
  const [activeSection, setActiveSection] = useState("section-general");

  // Mobile viewport tab toggle ('form' | 'preview')
  const [mobileTab, setMobileTab] = useState("form");

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
          setSubmitError("Product not found in inventory.");
          return;
        }

        const initialForm = {
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
        };

        const loadedImages =
          Array.isArray(product.images) && product.images.length > 0
            ? product.images
            : [];
        const loadedColors = Array.isArray(product.colors) ? product.colors : [];
        const loadedSpecs = product.specifications
          ? product.specifications instanceof Map
            ? Object.fromEntries(product.specifications)
            : product.specifications
          : {};
        const loadedFeatures = Array.isArray(product.keyFeatures)
          ? product.keyFeatures
          : [];
        const loadedBoxes = Array.isArray(product.boxContents)
          ? product.boxContents
          : [];
        const loadedWarranty = product.warranty
          ? {
              durationMonths: product.warranty.durationMonths || 12,
              claimType: product.warranty.claimType || "Manufacturer Warranty",
            }
          : { durationMonths: 12, claimType: "Manufacturer Warranty" };

        setFormData(initialForm);
        setExistingImages(loadedImages);
        setColorVariants(loadedColors);
        setSpecifications(loadedSpecs);
        setKeyFeatures(loadedFeatures);
        setBoxContents(loadedBoxes);
        setWarranty(loadedWarranty);

        setRawProduct(product);
        setOriginalSnapshot({
          formData: initialForm,
          existingImages: loadedImages,
          colorVariants: loadedColors,
          specifications: loadedSpecs,
          keyFeatures: loadedFeatures,
          boxContents: loadedBoxes,
          warranty: loadedWarranty,
        });
      } catch (err) {
        console.error("Failed to load product for editing:", err);
        setSubmitError(
          err.response?.data?.message || err.message || "Failed to load product"
        );
      } finally {
        setLoadingInitial(false);
      }
    };

    loadProduct();
  }, [id, isEditMode]);

  // Compute Unsaved Changes state
  const hasUnsavedChanges = useMemo(() => {
    if (!isEditMode || !originalSnapshot) return false;
    if (selectedFiles.length > 0) return true;

    return (
      JSON.stringify(formData) !== JSON.stringify(originalSnapshot.formData) ||
      JSON.stringify(existingImages) !==
        JSON.stringify(originalSnapshot.existingImages) ||
      JSON.stringify(colorVariants) !==
        JSON.stringify(originalSnapshot.colorVariants) ||
      JSON.stringify(specifications) !==
        JSON.stringify(originalSnapshot.specifications) ||
      JSON.stringify(keyFeatures) !==
        JSON.stringify(originalSnapshot.keyFeatures) ||
      JSON.stringify(boxContents) !==
        JSON.stringify(originalSnapshot.boxContents) ||
      JSON.stringify(warranty) !== JSON.stringify(originalSnapshot.warranty)
    );
  }, [
    isEditMode,
    originalSnapshot,
    formData,
    selectedFiles,
    existingImages,
    colorVariants,
    specifications,
    keyFeatures,
    boxContents,
    warranty,
  ]);

  // Auto-synchronize master warehouse inventory when color variants are configured
  useEffect(() => {
    if (colorVariants.length > 0) {
      const sumStock = colorVariants.reduce(
        (sum, v) => sum + (Number(v.stock) || 0),
        0
      );
      setFormData((prev) => {
        if (Number(prev.stock) !== sumStock) {
          return { ...prev, stock: sumStock };
        }
        return prev;
      });
    }
  }, [colorVariants]);

  // Scroll helpers that respect AdminLayout's #admin-main-viewport
  const scrollToTop = useCallback(() => {
    const viewport = document.getElementById("admin-main-viewport");
    if (viewport) {
      viewport.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const scrollToSection = useCallback((sectionId) => {
    setMobileTab("form");
    setActiveSection(sectionId);
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      const viewport = document.getElementById("admin-main-viewport");

      if (element) {
        if (viewport) {
          const viewportRect = viewport.getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();
          const relativeTop =
            elementRect.top - viewportRect.top + viewport.scrollTop;
          viewport.scrollTo({
            top: Math.max(0, relativeTop - 110),
            behavior: "smooth",
          });
        } else {
          const yOffset = -110;
          const y =
            element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
        }
      }
    }, 60);
  }, []);

  // Track active section on scroll
  useEffect(() => {
    const sectionIds = [
      "section-general",
      "section-pricing",
      "section-media",
      "section-variants",
      "section-specs",
      "section-highlights",
    ];

    const viewport = document.getElementById("admin-main-viewport");
    const target = viewport || window;

    const handleScroll = () => {
      const scrollPosition = viewport
        ? viewport.scrollTop + 140
        : window.scrollY + 140;

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const section = document.getElementById(sectionIds[i]);
        if (section) {
          const top = viewport
            ? section.offsetTop - viewport.offsetTop
            : section.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(sectionIds[i]);
            break;
          }
        }
      }
    };

    target.addEventListener("scroll", handleScroll, { passive: true });
    return () => target.removeEventListener("scroll", handleScroll);
  }, []);

  // Revert all edits back to loaded database state
  const handleResetChanges = useCallback(() => {
    if (!originalSnapshot) return;
    const confirmReset = window.confirm(
      "Are you sure you want to discard all uncommitted changes and revert to the saved database state?"
    );
    if (!confirmReset) return;

    setFormData({ ...originalSnapshot.formData });
    setExistingImages([...originalSnapshot.existingImages]);
    setColorVariants([...originalSnapshot.colorVariants]);
    setSpecifications({ ...originalSnapshot.specifications });
    setKeyFeatures([...originalSnapshot.keyFeatures]);
    setBoxContents([...originalSnapshot.boxContents]);
    setWarranty({ ...originalSnapshot.warranty });

    selectedFiles.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    setSelectedFiles([]);
    setPrimaryIndex(0);
    setSubmitError("");
    setSubmitSuccess("Form inputs restored to the saved state.");
    setTimeout(() => setSubmitSuccess(""), 2500);
  }, [originalSnapshot, selectedFiles]);

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
    if (e && e.preventDefault) e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    // Client-side validations
    if (!formData.title.trim()) {
      setSubmitError("Product title is required.");
      scrollToSection("section-general");
      return;
    }

    if (!formData.category) {
      setSubmitError("Please select a product category.");
      scrollToSection("section-general");
      return;
    }

    if (!formData.brand) {
      setSubmitError("Please select a product brand.");
      scrollToSection("section-general");
      return;
    }

    const regPrice = Number(formData.regularPrice);
    if (isNaN(regPrice) || regPrice < 0) {
      setSubmitError("Please provide a valid Regular Price (MRP).");
      scrollToSection("section-pricing");
      return;
    }

    const salePrice =
      formData.salePrice !== "" && formData.salePrice !== null
        ? Number(formData.salePrice)
        : null;
    if (salePrice !== null && salePrice > regPrice) {
      setSubmitError("Promotional Sale Price cannot exceed Regular Price.");
      scrollToSection("section-pricing");
      return;
    }

    if (!isEditMode && selectedFiles.length === 0) {
      setSubmitError(
        "At least one product image is required for catalog render."
      );
      scrollToSection("section-media");
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
      payload.append(
        "lowStockThreshold",
        Number(formData.lowStockThreshold) || 5
      );
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
        const updated = await updateAdminProduct(id, payload);
        if (updated) {
          setRawProduct(updated);
        }
        setSubmitSuccess("Product successfully updated with all specifications!");
      } else {
        await createAdminProduct(payload);
        setSubmitSuccess(
          "New flagship product successfully published to catalog!"
        );
      }

      // Smooth redirection to product inventory
      setTimeout(() => {
        navigate("/admin/products");
      }, 1200);
    } catch (err) {
      console.error("Submission failed:", err);
      const msg =
        err.response?.data?.message || err.message || "Failed to save product.";
      setSubmitError(msg);
      scrollToTop();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard shortcut Ctrl+S or Cmd+S to quickly save
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (!isSubmitting) {
          handleSubmit(e);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSubmitting, handleSubmit]);

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
    <div className="space-y-4 sm:space-y-5 pb-28 sm:pb-20">
      {/* Top Production-Grade Header HUD */}
      <EditModeProductHUD
        isEditMode={isEditMode}
        product={rawProduct}
        formData={formData}
        primaryPreviewUrl={primaryPreviewUrl}
        hasUnsavedChanges={hasUnsavedChanges}
        isSubmitting={isSubmitting}
        onSave={handleSubmit}
        onDiscard={() => navigate("/admin/products")}
        onReset={handleResetChanges}
      />

      {/* Sticky Quick-Jump Section Navigation Tabs (Hidden when viewing Live Preview on mobile) */}
      <div className={mobileTab === "preview" ? "hidden lg:block" : "block"}>
        <SectionNavTabs
          activeSection={activeSection}
          onSelectSection={scrollToSection}
          counts={{
            images: existingImages.length + selectedFiles.length,
            colors: colorVariants.length,
            specs: Object.keys(specifications).length,
          }}
        />
      </div>

      {/* Mobile View Switcher (Visible only below lg breakpoint) */}
      <div className="lg:hidden flex items-center p-1 bg-slate-200/80 dark:bg-white/[0.06] rounded-2xl border border-slate-300 dark:border-white/10 mb-3 shadow-xs">
        <button
          type="button"
          onClick={() => setMobileTab("form")}
          className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            mobileTab === "form"
              ? "bg-white dark:bg-[#12141c] text-sky-600 dark:text-sky-400 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <span>Specifications Form</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("preview")}
          className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            mobileTab === "preview"
              ? "bg-white dark:bg-[#12141c] text-sky-600 dark:text-sky-400 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <span>Live Store Preview</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </button>
      </div>

      {/* Global Status Alerts */}
      {submitError && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-rose-500/15 border-2 border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs font-mono flex items-center gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500 dark:text-rose-400" />
          <div className="flex-1">
            <p className="font-bold">Validation or Database Error</p>
            <p className="text-rose-800 dark:text-rose-200/90 mt-0.5">
              {submitError}
            </p>
          </div>
        </div>
      )}

      {submitSuccess && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-mono flex items-center gap-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500 dark:text-emerald-400" />
          <div className="flex-1">
            <p className="font-bold">Success</p>
            <p className="text-emerald-800 dark:text-emerald-200/90 mt-0.5">
              {submitSuccess}
            </p>
          </div>
        </div>
      )}

      {/* Main Studio Dual-Column Layout */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
      >
        {/* Left Column (Sections 1 to 6) */}
        <div
          className={`lg:col-span-8 space-y-6 sm:space-y-8 ${
            mobileTab === "form" ? "block" : "hidden lg:block"
          }`}
        >
          {/* 1. General Info & Classification */}
          <div id="section-general" className="scroll-mt-36">
            <BasicInfoSection
              formData={formData}
              setFormData={setFormData}
              categories={categories}
              brands={brands}
              onGenerateSku={handleGenerateSku}
            />
          </div>

          {/* 2. Pricing & Warehouse Stock */}
          <div id="section-pricing" className="scroll-mt-36">
            <PricingStockSection
              formData={formData}
              setFormData={setFormData}
              colorVariants={colorVariants}
            />
          </div>

          {/* 3. Product Photography & Gallery */}
          <div id="section-media" className="scroll-mt-36">
            <MediaDropzoneSection
              selectedFiles={selectedFiles}
              setSelectedFiles={setSelectedFiles}
              existingImages={existingImages}
              setExistingImages={setExistingImages}
              primaryIndex={primaryIndex}
              setPrimaryIndex={setPrimaryIndex}
            />
          </div>

          {/* 4. Color Combinations & Finish Studio */}
          <div id="section-variants" className="scroll-mt-36">
            <ColorVariantsSection
              colorVariants={colorVariants}
              setColorVariants={setColorVariants}
              masterSku={formData.sku}
            />
          </div>

          {/* 5. Dynamic Technical Specifications */}
          <div id="section-specs" className="scroll-mt-36">
            <DynamicSpecsSection
              categoryName={formData.categoryName}
              specifications={specifications}
              setSpecifications={setSpecifications}
            />
          </div>

          {/* 6. Key Features, Box Contents, & Warranty */}
          <div id="section-highlights" className="scroll-mt-36">
            <HighlightsSection
              keyFeatures={keyFeatures}
              setKeyFeatures={setKeyFeatures}
              boxContents={boxContents}
              setBoxContents={setBoxContents}
              warranty={warranty}
              setWarranty={setWarranty}
            />
          </div>

          {/* Bottom Submit Banner */}
          <div className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-white/15 bg-white dark:bg-[#090b10] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-sm dark:shadow-lg">
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {isEditMode
                  ? "Commit modifications to live catalog?"
                  : "Ready to deploy hardware to live store?"}
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                All changes, specifications, stock units, and color swatches
                will be updated immediately.
              </p>
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
                    <span>
                      {isEditMode ? "Save Changes" : "Publish Product"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (Live Preview Sticky Pane) */}
        <div
          className={`lg:col-span-4 ${
            mobileTab === "preview" ? "block" : "hidden lg:block"
          }`}
        >
          <LiveProductPreview
            formData={formData}
            primaryPreviewUrl={primaryPreviewUrl}
            colorVariants={colorVariants}
            specifications={specifications}
            isEditMode={isEditMode}
            productId={rawProduct?._id || id}
            productSlug={rawProduct?.slug}
            onJumpToSection={scrollToSection}
          />
        </div>
      </form>
    </div>
  );
}
