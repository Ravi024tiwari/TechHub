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
  Layers,
  Eye,
  FileEdit,
  X,
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
            top: Math.max(0, relativeTop - 120),
            behavior: "smooth",
          });
        } else {
          const yOffset = -120;
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
        ? viewport.scrollTop + 150
        : window.scrollY + 150;

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
    setSubmitSuccess("Form inputs restored to saved state.");
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
          "Flagship product successfully published to store catalog!"
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
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 animate-pulse flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
          </div>
        </div>
        <p className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
          Loading product specifications and media catalog...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-28 sm:pb-20 animate-in fade-in duration-300">
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
        mobileTab={mobileTab}
        setMobileTab={setMobileTab}
      />

      {/* Sticky Quick-Jump Section Navigation Tabs */}
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

      {/* Mobile View Switcher (Only visible below lg breakpoint) */}
      <div className="lg:hidden flex items-center p-1.5 bg-slate-100 dark:bg-[#0c0f17] rounded-2xl border border-slate-300 dark:border-white/20 mb-3 shadow-xs">
        <button
          type="button"
          onClick={() => setMobileTab("form")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-sans font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            mobileTab === "form"
              ? "bg-white dark:bg-[#181a24] text-orange-600 dark:text-orange-400 shadow-sm border border-slate-300 dark:border-white/20"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <FileEdit className="w-3.5 h-3.5" />
          <span>Specifications Form</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("preview")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-sans font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            mobileTab === "preview"
              ? "bg-white dark:bg-[#181a24] text-orange-600 dark:text-orange-400 shadow-sm border border-slate-300 dark:border-white/20"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Live Store Preview</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </button>
      </div>

      {/* Global Status Alerts */}
      {submitError && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-sans font-semibold flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500" />
            <div className="min-w-0">
              <p className="font-bold">Validation or Database Error</p>
              <p className="text-rose-800 dark:text-rose-200 mt-0.5">
                {submitError}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSubmitError("")}
            className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {submitSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-sans font-semibold flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
            <div className="min-w-0">
              <p className="font-bold">Success</p>
              <p className="text-emerald-800 dark:text-emerald-200 mt-0.5">
                {submitSuccess}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSubmitSuccess("")}
            className="p-1 rounded-lg text-emerald-500 hover:bg-emerald-500/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
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
          <section id="section-general" className="scroll-mt-36">
            <BasicInfoSection
              formData={formData}
              setFormData={setFormData}
              categories={categories}
              brands={brands}
              onGenerateSku={handleGenerateSku}
            />
          </section>

          {/* 2. Pricing & Warehouse Stock */}
          <section id="section-pricing" className="scroll-mt-36">
            <PricingStockSection
              formData={formData}
              setFormData={setFormData}
              colorVariants={colorVariants}
            />
          </section>

          {/* 3. Product Photography & Gallery */}
          <section id="section-media" className="scroll-mt-36">
            <MediaDropzoneSection
              selectedFiles={selectedFiles}
              setSelectedFiles={setSelectedFiles}
              existingImages={existingImages}
              setExistingImages={setExistingImages}
              primaryIndex={primaryIndex}
              setPrimaryIndex={setPrimaryIndex}
            />
          </section>

          {/* 4. Color Combinations & Finish Studio */}
          <section id="section-variants" className="scroll-mt-36">
            <ColorVariantsSection
              colorVariants={colorVariants}
              setColorVariants={setColorVariants}
              masterSku={formData.sku}
            />
          </section>

          {/* 5. Dynamic Technical Specifications */}
          <section id="section-specs" className="scroll-mt-36">
            <DynamicSpecsSection
              categoryName={formData.categoryName}
              specifications={specifications}
              setSpecifications={setSpecifications}
            />
          </section>

          {/* 6. Key Features, Box Contents, & Warranty */}
          <section id="section-highlights" className="scroll-mt-36">
            <HighlightsSection
              keyFeatures={keyFeatures}
              setKeyFeatures={setKeyFeatures}
              boxContents={boxContents}
              setBoxContents={setBoxContents}
              warranty={warranty}
              setWarranty={setWarranty}
            />
          </section>

          {/* Bottom Submit Banner */}
          <div className="relative rounded-2xl sm:rounded-3xl border border-slate-300 dark:border-white/30 bg-white dark:bg-[#0c0f17] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-xl transition-all overflow-hidden group">
            {/* Contained Ambient Background Glow */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl pointer-events-none">
              <div className="absolute -top-16 -right-16 w-52 h-52 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500" />
            </div>

            <div className="relative z-10">
              <p className="text-sm sm:text-base font-heading font-black text-slate-900 dark:text-white">
                {isEditMode
                  ? "Commit modifications to live catalog?"
                  : "Ready to deploy flagship hardware to store?"}
              </p>
              <p className="text-xs font-sans text-slate-500 dark:text-slate-400 mt-0.5">
                All specifications, prices, inventory units, and color finishes will sync immediately.
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => navigate("/admin/products")}
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-sans font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer text-center justify-center border border-slate-300 dark:border-white/15"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-heading font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg shadow-orange-500/25 cursor-pointer disabled:opacity-50 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-white shrink-0" />
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

      {/* Mobile Sticky Bottom Floating Action Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#08090a]/95 backdrop-blur-md border-t border-slate-300 dark:border-white/20 p-3 flex items-center gap-2.5 shadow-2xl">
        <button
          type="button"
          onClick={() =>
            setMobileTab((prev) => (prev === "form" ? "preview" : "form"))
          }
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-sans font-bold border border-slate-300 dark:border-white/20 shrink-0"
        >
          {mobileTab === "form" ? (
            <>
              <Eye className="w-4 h-4 text-orange-500" />
              <span>Preview</span>
            </>
          ) : (
            <>
              <FileEdit className="w-4 h-4 text-orange-500" />
              <span>Form</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-heading font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-500/25 disabled:opacity-50 active:scale-95"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-white" />
              <span>{isEditMode ? "Save Changes" : "Publish Product"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
