import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Cpu,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import AuthBackground from "@/components/common/AuthBackground";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !password) {
      setErrorMsg("Please enter both email address and password.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Invalid credentials. Please verify.");
      }

      // Store user and tokens
      if (result.data?.user) {
        localStorage.setItem("techhaven_user", JSON.stringify(result.data.user));
        localStorage.setItem("techhaven_token", result.data.accessToken);
      }

      // Navigate to intended destination
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || "Failed to authenticate. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#07080a] text-white flex items-center justify-center p-4 sm:p-6 lg:p-10 overflow-hidden">
      {/* Interactive Silver Keynote Background */}
      <AuthBackground watermarkLines={["TECH", "HAVEN"]} />

      <div className="relative z-10 w-full max-w-md">
        {/* Branding header */}
        <div className="text-center mb-8 space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-white/20 to-white/5 border border-white/20 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:scale-105 transition-transform">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <span className="font-heading font-extrabold text-2xl tracking-tight text-white">
              TECHHAVEN
            </span>
          </Link>
          <p className="font-tech text-xs text-slate-400 uppercase tracking-widest">
            Security Gateway · Member Authentication
          </p>
        </div>

        {/* Login Glass Card with Silver Backlight Glow */}
        <div className="glass-card-silver p-6 sm:p-8 relative">
          <div className="mb-6 text-left">
            <h1 className="font-heading text-2xl font-bold text-white tracking-tight">
              Sign In to Your Account
            </h1>
            <p className="font-body text-xs sm:text-sm text-slate-400 mt-1">
              Enter your credentials to access your orders, warranty vault, and cart.
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs sm:text-sm flex items-start gap-2.5 text-left animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-slate-300">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="alex@tech.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-9 h-11 bg-white/[0.03] border-white/10 text-white placeholder:text-slate-600 rounded-xl focus-visible:border-white/30 focus-visible:ring-white/10"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-medium text-slate-300">
                  Password
                </Label>
                <a
                  href="#forgot"
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            </div>

            {/* Remember Me Toggle */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded bg-white/5 border-white/20 text-white focus:ring-0 focus:ring-offset-0 cursor-pointer accent-white"
              />
              <label htmlFor="rememberMe" className="text-xs text-slate-400 cursor-pointer">
                Remember this device for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-pill-primary w-full h-11 text-sm font-semibold tracking-wide flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-black" />
                    <span>Authenticating Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4 text-black" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Bottom Switcher */}
          <div className="mt-6 pt-5 border-t border-white/[0.08] text-center">
            <p className="text-xs text-slate-400">
              New to TechHaven?{" "}
              <Link
                to="/signup"
                className="text-white font-semibold hover:text-slate-200 underline underline-offset-4 transition-colors"
              >
                Create an Account
              </Link>
            </p>
          </div>
        </div>

        {/* Security Indicator */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>256-Bit SSL Encrypted Authentication</span>
        </div>
      </div>
    </div>
  );
}
