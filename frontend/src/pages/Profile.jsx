import React, { useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabsNav from "@/components/profile/ProfileTabsNav";
import PersonalDetailsSection from "@/components/profile/PersonalDetailsSection";
import AddressBookSection from "@/components/profile/AddressBookSection";
import SecuritySection from "@/components/profile/SecuritySection";
import { useAuthStore } from "@/store/useAuthStore";
import { useAddressesQuery } from "@/hooks/useAddresses";
import { User, ChevronRight } from "lucide-react";




export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "details";

  const { data: addresses = [] } = useAddressesQuery();
  const fileInputRef = useRef(null);

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  const handleAvatarClick = () => {
    if (currentTab !== "details") {
      handleTabChange("details");
    }
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  // Unauthenticated State
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="max-w-md p-8 rounded-3xl bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/10 shadow-xl">
            <User className="h-12 w-12 mx-auto text-sky-500 mb-4" />
            <h1 className="text-xl font-bold font-heading mb-2">Please Sign In</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              You must be logged in to view and manage your account profile and addresses.
            </p>
            <Link
              to="/login"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-heading font-bold text-xs uppercase tracking-wider shadow-md shadow-sky-500/25 hover:scale-105 active:scale-95 transition-all inline-block"
            >
              Sign In Now
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-white flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1 w-full max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-tech text-slate-500 dark:text-slate-400 mb-6">
          <Link to="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="text-slate-900 dark:text-white font-medium">Customer Profile</span>
        </nav>

        {/* Master Profile Header Card */}
        <ProfileHeader user={user} onAvatarClick={handleAvatarClick} />

        {/* Tab Navigation Pill Bar */}
        <ProfileTabsNav
          activeTab={currentTab}
          onTabChange={handleTabChange}
          addressCount={addresses.length}
        />

        {/* Render Tab Sections with smooth interactive transitions */}
        <div key={currentTab} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {currentTab === "details" && (
            <PersonalDetailsSection user={user} fileInputRef={fileInputRef} />
          )}

          {currentTab === "addresses" && <AddressBookSection />}

          {currentTab === "security" && <SecuritySection />}
        </div>
      </main>

      <Footer />
    </div>
  );
}
