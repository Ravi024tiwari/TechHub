import React, { useState } from "react";
import {
  Crown,
  Shield,
  Star,
  Gem,
  Award,
  Sparkles,
  ChevronRight,
  Gift,
  CheckCircle2,
  X,
  Zap,
  Lock,
  Flame,
  HelpCircle,
  TrendingUp,
  Cpu,
  ArrowUpRight,
  Coins,
} from "lucide-react";

export default function VipTierCard({ loyalty, badges = [], userName = "" }) {
  const [showBenefitsModal, setShowBenefitsModal] = useState(false);
  const [hoveredBadge, setHoveredBadge] = useState(null);

  const tierKey = loyalty?.tierKey || "BRONZE";
  const tierName = loyalty?.tier || "Bronze Member";
  const multiplier = loyalty?.pointsMultiplier || 1.0;
  const progress = loyalty?.progressToNextTier ?? 0;
  const nextTierName = loyalty?.nextTier || "Max Tier Achieved";
  const neededAmount = loyalty?.amountNeededForNextTier ?? 0;
  const benefits = loyalty?.benefits || [];
  const points = loyalty?.loyaltyPoints || 0;

  // Curated Luxury Metallic Tier Themes
  const tierThemes = {
    BRONZE: {
      gradient: "from-[#1c130d] via-[#120d09] to-[#0a0705]",
      border: "border-amber-500/40 hover:border-amber-400/60 shadow-[0_10px_40px_rgba(245,158,11,0.15)]",
      badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs",
      progressFill: "from-amber-600 via-amber-400 to-yellow-300",
      accentText: "text-amber-400",
      icon: Shield,
      glow: "shadow-[0_0_30px_rgba(245,158,11,0.25)]",
      chipGradient: "from-amber-400 via-yellow-200 to-amber-600 border-amber-300/60",
    },
    SILVER: {
      gradient: "from-[#14161c] via-[#0f1117] to-[#0a0b0f]",
      border: "border-slate-300/40 hover:border-slate-200/60 shadow-[0_10px_40px_rgba(203,213,225,0.1)]",
      badgeBg: "bg-slate-200/20 text-slate-200 border-slate-300/40 shadow-xs",
      progressFill: "from-slate-400 via-slate-200 to-amber-300",
      accentText: "text-slate-200",
      icon: Star,
      glow: "shadow-[0_0_30px_rgba(203,213,225,0.2)]",
      chipGradient: "from-slate-200 via-slate-100 to-slate-400 border-slate-300/60",
    },
    GOLD: {
      gradient: "from-[#211804] via-[#140f02] to-[#0a0701]",
      border: "border-yellow-400/50 hover:border-yellow-300/70 shadow-[0_10px_40px_rgba(250,204,21,0.2)]",
      badgeBg: "bg-yellow-400/25 text-yellow-200 border-yellow-400/50 shadow-xs",
      progressFill: "from-amber-500 via-yellow-400 to-yellow-200",
      accentText: "text-yellow-400",
      icon: Crown,
      glow: "shadow-[0_0_30px_rgba(250,204,21,0.3)]",
      chipGradient: "from-yellow-300 via-amber-100 to-yellow-600 border-yellow-200/70",
    },
    TITANIUM: {
      gradient: "from-[#1a0e2e] via-[#0f091f] to-[#080512]",
      border: "border-purple-400/50 hover:border-purple-300/70 shadow-[0_10px_40px_rgba(168,85,247,0.2)]",
      badgeBg: "bg-purple-500/25 text-purple-200 border-purple-400/50 shadow-xs",
      progressFill: "from-purple-500 via-fuchsia-400 to-indigo-400",
      accentText: "text-purple-400",
      icon: Gem,
      glow: "shadow-[0_0_30px_rgba(168,85,247,0.3)]",
      chipGradient: "from-purple-300 via-fuchsia-100 to-indigo-500 border-purple-200/70",
    },
  };

  const theme = tierThemes[tierKey] || tierThemes.BRONZE;
  const TierIcon = theme.icon;

  const TIERS_ROADMAP = [
    { key: "BRONZE", name: "Bronze VIP", target: "₹0", multiplier: "1.0x", icon: Shield, color: "amber" },
    { key: "SILVER", name: "Silver VIP", target: "₹25,000", multiplier: "1.25x", icon: Star, color: "slate" },
    { key: "GOLD", name: "Gold VIP", target: "₹75,000", multiplier: "1.5x", icon: Crown, color: "yellow" },
    { key: "TITANIUM", name: "Titanium VIP", target: "₹1,50,000", multiplier: "2.0x", icon: Gem, color: "purple" },
  ];

  const currentTierIndex = TIERS_ROADMAP.findIndex((t) => t.key === tierKey);

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-3xl border-2 ${theme.border} bg-gradient-to-br ${theme.gradient} text-white p-5 sm:p-8 shadow-2xl transition-all duration-300`}
      >
        {/* Ambient Holographic Radial Beam & Specular Lines */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        {/* TOP VIP METALLIC BAR */}
        <div className="relative z-10 flex items-center justify-between pb-4 border-b border-white/10 gap-3 flex-wrap">
          {/* Left: Gold Chip & Executive VIP Brand */}
          <div className="flex items-center gap-3">
            <div
              className={`h-7 w-10 sm:h-8 sm:w-11 rounded-md bg-gradient-to-br ${theme.chipGradient} border p-0.5 flex items-center justify-center shadow-md shrink-0`}
            >
              <div className="w-full h-full border border-black/30 rounded-[3px] flex items-center justify-center bg-black/10">
                <Cpu className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-black/70" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-[11px] font-heading font-black tracking-widest uppercase text-white/90">
                TechHub Executive VIP Card
              </span>
              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">
                Precision Hardware Loyalty ID
              </span>
            </div>
          </div>

          {/* Right: Active Status Badge & Multiplier */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-black uppercase tracking-wider border ${theme.badgeBg}`}
            >
              <TierIcon className="h-3.5 w-3.5" />
              {tierName}
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-white/10 text-white/90 border border-white/15 shadow-xs">
              <Zap className="h-3 w-3 text-yellow-400" />
              {multiplier}x Points
            </span>
          </div>
        </div>

        {/* CARD MAIN BODY */}
        <div className="relative z-10 pt-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Privileges & Reward Points Vault */}
          <div className="space-y-4 flex-1 min-w-0">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-heading tracking-tight text-white">
                  {tierName} Privileges
                </h2>
                <Sparkles className="h-5 w-5 text-amber-400 animate-pulse shrink-0" />
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-normal mt-1 max-w-xl leading-relaxed">
                Enjoy precision loyalty privileges on TechHub. Multiplied reward points accumulate on every purchase, with priority express dispatch and direct checkout discounts.
              </p>
            </div>

            {/* Reward Points Vault Capsule */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-0.5">
              <div className="p-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.09] border border-white/15 backdrop-blur-xl flex items-center gap-3.5 transition-all shadow-sm">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-500/25 to-yellow-500/10 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0 shadow-xs">
                  <Coins className="h-6 w-6 text-amber-300" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-tech uppercase tracking-wider text-slate-400 font-bold block">
                    Available Reward Points
                  </span>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
                      {points.toLocaleString("en-IN")} <span className="text-xs text-amber-400 font-bold">PTS</span>
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.2 rounded-full">
                      ≈ ₹{(points * 0.25).toFixed(2)} Credit
                    </span>
                  </div>
                </div>
              </div>

              <div className="hidden xl:flex flex-col text-xs text-slate-400 font-mono space-y-1">
                <span className="flex items-center gap-1 text-slate-300">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" /> 100% Bill Credit Redemption
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Points Never Expire
                </span>
              </div>
            </div>

            {/* Interactive Badges Shelf */}
            {badges.length > 0 && (
              <div className="pt-1 flex items-center gap-2 flex-wrap relative">
                <span className="text-[11px] font-tech text-slate-400 uppercase tracking-wider flex items-center gap-1 font-bold">
                  <Award className="h-3.5 w-3.5 text-amber-400" /> Badges ({badges.length}):
                </span>
                {badges.map((b, idx) => (
                  <div
                    key={b.code || idx}
                    onMouseEnter={() => setHoveredBadge(b)}
                    onMouseLeave={() => setHoveredBadge(null)}
                    onClick={() => setHoveredBadge(hoveredBadge?.code === b.code ? null : b)}
                    className="group relative inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-medium bg-white/10 hover:bg-white/20 border border-white/20 text-white shadow-xs transition-all cursor-pointer active:scale-95"
                  >
                    <Award className="h-3.5 w-3.5 text-amber-300 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold">{b.title}</span>

                    {/* Popover Card for Hovered Badge */}
                    {hoveredBadge?.code === b.code && (
                      <div className="absolute bottom-full mb-2 left-0 w-64 p-3.5 rounded-2xl bg-slate-950/95 backdrop-blur-2xl border-2 border-white/20 text-white shadow-2xl z-30 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Award className="h-4 w-4 text-amber-400" />
                          <h4 className="text-xs font-bold font-heading text-white truncate">
                            {b.title}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-snug">
                          {b.description}
                        </p>
                        <span className="inline-block mt-2.5 text-[9px] font-mono text-emerald-400 uppercase tracking-wider font-bold">
                          ✓ Verified Active Achievement
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Progression Engine Capsule */}
          <div className="w-full lg:w-88 p-5 sm:p-6 rounded-3xl bg-black/60 backdrop-blur-2xl border-2 border-white/15 space-y-4 shrink-0 shadow-2xl">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 flex items-center gap-1.5 font-bold">
                <TrendingUp className="h-4 w-4 text-orange-400" />
                Tier Progression
              </span>
              <span className="font-black text-white text-base font-mono">{progress}%</span>
            </div>

            {/* Glowing Linear Progress Meter */}
            <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/20">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${theme.progressFill} transition-all duration-700 shadow-[0_0_15px_rgba(251,191,36,0.6)]`}
                style={{ width: `${Math.max(6, Math.min(100, progress))}%` }}
              />
            </div>

            <div className="text-xs text-slate-300 flex items-center justify-between font-sans">
              {tierKey === "TITANIUM" ? (
                <span className="text-purple-300 font-bold flex items-center gap-1">
                  🏆 Maximum Tier Achieved!
                </span>
              ) : (
                <div className="space-y-0.5 w-full">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Up Next:</span>
                    <strong className="text-white font-bold">{nextTierName}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Requirement:</span>
                    <span className="text-amber-300 font-bold">
                      ₹{neededAmount.toLocaleString("en-IN")} remaining
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowBenefitsModal(true)}
              className="w-full mt-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-500 text-white font-heading font-black text-xs uppercase tracking-wider shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Explore All VIP Tiers & Perks</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* BOTTOM: INTERACTIVE HARDWARE TIER ROADMAP */}
        <div className="mt-7 pt-6 border-t border-white/15">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-tech uppercase tracking-wider text-slate-400 font-bold">
              TechHub VIP Progression Path
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              4 Progressive Milestones
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3.5">
            {TIERS_ROADMAP.map((t, idx) => {
              const Icon = t.icon;
              const isCurrent = t.key === tierKey;
              const isPassed = idx < currentTierIndex;
              const isNext = idx === currentTierIndex + 1;

              // High-Contrast Tier Styling
              const tierCardStyles = {
                amber: {
                  active: "bg-amber-500/20 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]",
                  next: "bg-amber-500/10 border-amber-500/30",
                  locked: "bg-black/30 border-white/10 opacity-70",
                  text: "text-amber-300",
                },
                slate: {
                  active: "bg-slate-200/20 border-slate-300 shadow-[0_0_20px_rgba(203,213,225,0.3)]",
                  next: "bg-orange-500/10 border-orange-500/30",
                  locked: "bg-black/30 border-white/10 opacity-70",
                  text: "text-slate-200",
                },
                yellow: {
                  active: "bg-yellow-500/20 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.3)]",
                  next: "bg-yellow-500/10 border-yellow-400/40",
                  locked: "bg-black/30 border-white/10 opacity-70",
                  text: "text-yellow-300",
                },
                purple: {
                  active: "bg-purple-500/20 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]",
                  next: "bg-purple-500/10 border-purple-400/40",
                  locked: "bg-black/30 border-white/10 opacity-70",
                  text: "text-purple-300",
                },
              };

              const style = tierCardStyles[t.color] || tierCardStyles.amber;
              const cardClass = isCurrent
                ? style.active
                : isNext
                ? style.next
                : isPassed
                ? "bg-white/10 border-white/20"
                : style.locked;

              return (
                <div
                  key={t.key}
                  className={`p-3.5 rounded-2xl border-2 transition-all ${cardClass}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Icon className={`h-4 w-4 ${isCurrent ? style.text : "text-slate-300"}`} />
                      <span className="font-heading font-black text-xs text-white">
                        {t.name}
                      </span>
                    </div>

                    {isCurrent ? (
                      <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 uppercase shadow-xs">
                        Current
                      </span>
                    ) : isPassed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : isNext ? (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 uppercase">
                        Next
                      </span>
                    ) : (
                      <Lock className="h-3.5 w-3.5 text-slate-400" />
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono pt-1 border-t border-white/10">
                    <span className="text-slate-300 font-medium">{t.target}</span>
                    <span className={`${style.text} font-black text-[13px]`}>
                      {t.multiplier}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal: VIP Perks & Privileges Roadmap */}
      {showBenefitsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowBenefitsModal(false)}
        >
          <div
            className="w-full max-w-xl rounded-3xl bg-slate-950 border-2 border-white/20 p-6 sm:p-7 shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`h-11 w-11 rounded-2xl flex items-center justify-center border shadow-xs ${theme.badgeBg}`}
                >
                  <TierIcon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-xl text-white">
                    {tierName} Privileges
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Tier active with {multiplier}x multiplier & checkout discounts
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBenefitsModal(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Active Tier Perks */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-tech uppercase tracking-wider text-slate-400 font-bold">
                Unlocked Privileges on Your Account
              </h4>
              {benefits.map((benefit, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs font-medium text-slate-200 leading-relaxed">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>

            {/* All Tiers Comparison Matrix */}
            <div className="pt-2 space-y-2.5">
              <h4 className="text-xs font-tech uppercase tracking-wider text-slate-400 font-bold">
                Tier Progression Comparison
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1">
                  <span className="font-bold text-amber-300 block">Bronze VIP (₹0)</span>
                  <p className="text-[11px] text-slate-300">1.0x points, standard warranties, order tracking</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-500/10 border border-slate-500/25 space-y-1">
                  <span className="font-bold text-slate-200 block">Silver VIP (₹25k)</span>
                  <p className="text-[11px] text-slate-300">1.25x points, priority packing, fast RMA support</p>
                </div>
                <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/25 space-y-1">
                  <span className="font-bold text-yellow-300 block">Gold VIP (₹75k)</span>
                  <p className="text-[11px] text-slate-300">1.5x points, free express dispatch, concierge line</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/25 space-y-1">
                  <span className="font-bold text-purple-300 block">Titanium VIP (₹1.5L)</span>
                  <p className="text-[11px] text-slate-300">2.0x points, exclusive drop access, dedicated manager</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowBenefitsModal(false)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-500 text-white font-heading font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
            >
              Close & Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </>
  );
}
