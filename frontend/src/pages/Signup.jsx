import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Zap,
  ShieldCheck,
  Truck,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Phone,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Loader2,
  Cpu
} from "lucide-react";
import AuthBackground from "@/components/common/AuthBackground";
import { useRegisterMutation } from "@/hooks/useAuth";

export default function Signup() {
  const navigate = useNavigate();
  const registerMutation = useRegisterMutation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const isLoading = registerMutation.isPending;

  // Handle Form Change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    if (errorMsg) setErrorMsg("");
  };

  // Real-time password strength calculation (0 - 4)
  const calculatePasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strengthScore = calculatePasswordStrength(formData.password);
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Strong", "Titanium Secure"];
  const strengthColors = ["bg-red-500", "bg-amber-500", "bg-yellow-400", "bg-emerald-400", "bg-cyan-400"];

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Client-side validations
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setErrorMsg("Please fill in all mandatory fields.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify.");
      return;
    }

    if (!formData.agreeTerms) {
      setErrorMsg("Please accept TechHaven Terms of Service to proceed.");
      return;
    }

    registerMutation.mutate(
      {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim() || undefined,
      },
      {
        onSuccess: (response) => {
          setSuccessMsg(
            response.message ||
              "Welcome to TechHaven! Your account has been initialized successfully."
          );
          // Seamlessly redirect to home/storefront after showing success badge
          setTimeout(() => {
            navigate("/", { replace: true });
          }, 1200);
        },
        onError: (err) => {
          setErrorMsg(
            err.userMessage ||
              err.message ||
              "Something went wrong during registration."
          );
        },
      }
    );
  };

  return (
    <div className="relative min-h-screen w-full bg-[#07080a] text-white selection:bg-white/20 selection:text-white flex items-center justify-center p-4 sm:p-6 lg:p-10 overflow-hidden">
      {/* Interactive Silver Keynote Background */}
      <AuthBackground watermarkLines={["TECH", "HAVEN"]} />

      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* =========================================================================
            LEFT COLUMN: The Hardware Ecosystem & Tech Privileges Showcase
            ========================================================================= */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-8 text-left py-4">
          {/* Brand Logo & Chip Badge */}
          <Link to="/" className="flex items-center gap-3 group w-fit">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-white/20 to-white/5 border border-white/20 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:scale-105 transition-transform">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-xl tracking-tight text-white block leading-none">
                TECHHAVEN
              </span>
              <span className="font-tech text-[10px] tracking-widest text-slate-400 uppercase">
                Hardware & Audio Architecture
              </span>
            </div>
          </Link>

          {/* Access Pill Badge */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-tech text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>MEMBER PRIVILEGES · PASS ACCESS</span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="space-y-3">
            <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.1]">
              Engineered for the{" "}
              <span className="text-gradient-silver">Pure Obsession</span> with Tech.
            </h1>
            <p className="font-body text-slate-400 text-sm sm:text-base leading-relaxed">
              Create your unified TechHaven passport to unlock early hardware drops, registered warranty vaults, and unthrottled member pricing.
            </p>
          </div>

          {/* Floating Flagship Device Preview Card (Luxury Glass) */}
          <div className="glass-card p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.03] rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="badge-tech text-[10px] text-cyan-300 border-cyan-500/20 bg-cyan-500/5 mb-1.5">
                  FEATURED HARDWARE
                </span>
                <h2 className="font-heading font-bold text-lg text-white">
                  Studio Display Pro 5K
                </h2>
              </div>
              <span className="text-xs font-tech text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                IN STOCK
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4 line-clamp-2">
              Nano-texture glass, 120Hz ProMotion, and 6-speaker sound system with force-cancelling woofers.
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
              <div className="font-tech text-xs text-slate-400">
                Member Price:{" "}
                <span className="text-white font-bold text-sm">₹1,44,900</span>
              </div>
              <span className="text-xs text-slate-400 flex items-center gap-1 group-hover:text-white transition-colors">
                Explore Specs <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </div>

          {/* 3 Core Member Privileges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <Zap className="h-4 w-4 text-amber-300 mb-2" />
              <h3 className="font-heading text-xs font-semibold text-white mb-0.5">Flash Access</h3>
              <p className="text-[11px] text-slate-400 leading-tight">Priority 2-hr drop windows</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <ShieldCheck className="h-4 w-4 text-cyan-300 mb-2" />
              <h3 className="font-heading text-xs font-semibold text-white mb-0.5">Digital Vault</h3>
              <p className="text-[11px] text-slate-400 leading-tight">Auto-synced device warranty</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <Truck className="h-4 w-4 text-purple-300 mb-2" />
              <h3 className="font-heading text-xs font-semibold text-white mb-0.5">Air Dispatch</h3>
              <p className="text-[11px] text-slate-400 leading-tight">Secured insured courier</p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: The Titanium Signup Form
            ========================================================================= */}
        <div className="lg:col-span-7 flex justify-center w-full">
          <div className="glass-card-silver w-full max-w-xl p-6 sm:p-8 lg:p-10 relative">
            {/* Form Header */}
            <div className="mb-6 text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-tech text-slate-400 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-slate-300" />
                <span>NEW ACCOUNT INITIALIZATION</span>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Create your TechHaven ID
              </h2>
              <p className="font-body text-xs sm:text-sm text-slate-400 mt-1">
                Join over 45,000+ creators, developers, and hardware enthusiasts.
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs sm:text-sm flex items-start gap-2.5 text-left animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Message Alert */}
            {successMsg && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs sm:text-sm flex items-start gap-2.5 text-left animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium text-slate-300">
                  Full Name <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="e.g. Ravi Tiwari"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="pl-9 h-11 bg-white/[0.03] border-white/10 text-white placeholder:text-slate-600 rounded-xl focus-visible:border-white/30 focus-visible:ring-white/10"
                  />
                </div>
              </div>

              {/* Email & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Email Address */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-medium text-slate-300">
                    Email Address <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="alex@tech.dev"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      className="pl-9 h-11 bg-white/[0.03] border-white/10 text-white placeholder:text-slate-600 rounded-xl focus-visible:border-white/30 focus-visible:ring-white/10"
                    />
                  </div>
                </div>

                {/* Phone Number (Optional) */}
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-medium text-slate-300">
                    Phone <span className="text-slate-500">(For Delivery SMS)</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="pl-9 h-11 bg-white/[0.03] border-white/10 text-white placeholder:text-slate-600 rounded-xl focus-visible:border-white/30 focus-visible:ring-white/10"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium text-slate-300">
                  Password <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 chars with mixed case & digits"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="pl-9 pr-10 h-11 bg-white/[0.03] border-white/10 text-white placeholder:text-slate-600 rounded-xl focus-visible:border-white/30 focus-visible:ring-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Real-time Password Strength Meter */}
                {formData.password.length > 0 && (
                  <div className="pt-1.5 space-y-1">
                    <div className="flex gap-1 h-1">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`h-full flex-1 rounded-full transition-all duration-300 ${
                            strengthScore >= step
                              ? strengthColors[strengthScore]
                              : "bg-white/[0.08]"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-tech text-slate-400">
                      <span>Security Level</span>
                      <span
                        className={
                          strengthScore >= 3
                            ? "text-emerald-400 font-semibold"
                            : strengthScore === 2
                            ? "text-amber-400 font-semibold"
                            : "text-red-400 font-semibold"
                        }
                      >
                        {strengthLabels[strengthScore]}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-medium text-slate-300">
                  Confirm Password <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat your chosen password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className={`pl-9 pr-10 h-11 bg-white/[0.03] text-white placeholder:text-slate-600 rounded-xl focus-visible:ring-white/10 ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? "border-red-500/50 focus-visible:border-red-500"
                        : formData.confirmPassword && formData.password === formData.confirmPassword
                        ? "border-emerald-500/50 focus-visible:border-emerald-500"
                        : "border-white/10 focus-visible:border-white/30"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Terms and Privacy Checkbox */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  id="agreeTerms"
                  name="agreeTerms"
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 rounded bg-white/5 border-white/20 text-white focus:ring-0 focus:ring-offset-0 cursor-pointer accent-white"
                />
                <label htmlFor="agreeTerms" className="text-xs text-slate-400 leading-tight cursor-pointer">
                  I agree to TechHaven's{" "}
                  <a href="#terms" className="text-white underline underline-offset-2 hover:text-slate-200">
                    Terms of Service
                  </a>{" "}
                  and acknowledge the{" "}
                  <a href="#privacy" className="text-white underline underline-offset-2 hover:text-slate-200">
                    Hardware Warranty Policy
                  </a>
                  .
                </label>
              </div>

              {/* Primary Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-pill-primary w-full h-11 text-sm font-semibold tracking-wide flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-black" />
                      <span>Initializing Member Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight className="h-4 w-4 text-black" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Bottom Switcher */}
            <div className="mt-6 pt-5 border-t border-white/[0.08] text-center">
              <p className="text-xs text-slate-400">
                Already registered with TechHaven?{" "}
                <Link
                  to="/login"
                  className="text-white font-semibold hover:text-slate-200 underline underline-offset-4 transition-colors"
                >
                  Sign In to Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
