import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import CategoryRail from "@/components/home/CategoryRail";
import HeroBannerCarousel from "@/components/home/HeroBannerCarousel";
import TrustBadges from "@/components/home/TrustBadges";
import BrandMarqueeRail from "@/components/home/BrandMarqueeRail";
import OffersSpotlightBanner from "@/components/home/OffersSpotlightBanner";
import ProductShelf from "@/components/home/ProductShelf";
import StockAlertSection from "@/components/home/StockAlertSection";
import Footer from "@/components/layout/Footer";
import { useProductsQuery } from "@/hooks/useProducts";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("all");

  // Dynamic SEO Title and Meta update
  useEffect(() => {
    document.title = "TechHub — Authorized Flagship Smartphones, Computing & Electronics";
    
    // Update or insert meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content =
      "Shop certified flagship smartphones, M3 MacBooks, RTX 4090 GPUs, and audiophile acoustic gear at TechHub. 100% genuine hardware with official brand warranty & express air delivery.";
  }, []);

  // Query 1: Filtered / Featured products based on active category
  const { data: mainData, isLoading: isMainLoading } = useProductsQuery({
    category: activeCategory !== "all" ? activeCategory : undefined,
    isFeatured: activeCategory === "all" ? true : undefined,
    limit: 8,
  });

  // Query 2: Laptops / Flagship Computing rail
  const { data: laptopsData, isLoading: isLaptopsLoading } = useProductsQuery({
    category: "laptops",
    limit: 4,
  });

  const mainProducts = mainData?.products || [];
  const laptopProducts = laptopsData?.products || [];

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#050608] text-slate-900 dark:text-white flex flex-col transition-colors duration-300 relative overflow-x-clip">
      {/* Universal Desktop & Mobile Header */}
      <Navbar />

      {/* Iconic Quick Category Strip */}
      <CategoryRail
        activeCategory={activeCategory}
        onSelectCategory={(catId) => setActiveCategory(catId)}
      />

      {/* Main Landing Page Content */}
      <main className="flex-1 w-full space-y-6 sm:space-y-10 lg:space-y-12 z-10 pb-16 relative">
        {/* Subtle Ambient Radial Lighting Behind Hero */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-orange-500/5 to-transparent dark:from-blue-600/15 dark:via-orange-600/5 pointer-events-none -z-10" />

        {/* 1. Promotional Keynote Deals Hero Carousel */}
        <HeroBannerCarousel />

        {/* 2. 4 Official Trust Pillars (Delivery, Warranty, Return, Genuine) */}
        <TrustBadges />

        {/* 3. Official OEM Brand Partners Scrolling Marquee */}
        <BrandMarqueeRail />

        {/* 4. Active Offers & Flash Deals Spotlight Banner */}
        <OffersSpotlightBanner />

        {/* 5. Product Shelf 1: Active Category / Featured Deals */}
        <ProductShelf
          title={
            activeCategory === "all"
              ? "Top Featured Flagships"
              : `Explore ${activeCategory.toUpperCase()}`
          }
          subtitle="Studio workstations, high-end mobile computing, and audiophile gear"
          badgeText={activeCategory === "all" ? "BESTSELLERS" : "CATEGORY SPOTLIGHT"}
          showAllLink={`/products${activeCategory !== "all" ? `?category=${activeCategory}` : ""}`}
          products={mainProducts}
          isLoading={isMainLoading}
          limit={8}
          hasCountdown={true}
        />

        {/* 6. Product Shelf 2: Dedicated Computing & Laptops Section */}
        {activeCategory === "all" && (
          <ProductShelf
            title="High-Performance Computing"
            subtitle="Studio displays, workstations, and high-performance gaming rigs"
            badgeText="PRO HARDWARE"
            showAllLink="/products?category=laptops"
            products={laptopProducts}
            isLoading={isLaptopsLoading}
            limit={4}
            hasCountdown={false}
          />
        )}

        {/* 7. VIP Stock Drop & Launch Alert Section */}
        <StockAlertSection />
      </main>

      {/* Universal Enterprise Footer */}
      <Footer />
    </div>
  );
}
