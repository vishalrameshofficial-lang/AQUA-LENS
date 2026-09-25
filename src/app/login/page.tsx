"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  AlertCircle,
  Lock,
  Mail,
  Shield,
  ShieldCheck,
  User,
  Users,
  BarChart3,
  Leaf,
  PenLine,
  ArrowRight,
  Droplet,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [selectedPortal, setSelectedPortal] = useState<"admin" | "citizen">("admin");
  const [email, setEmail] = useState("admin@aqualens.gov.in");
  const [password, setPassword] = useState("Admin@123456");
  const [name, setName] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performLogin = async (loginEmail: string, loginPassword: string, registerName?: string) => {
    setError(null);
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body: any = { email: loginEmail, password: loginPassword };
      if (mode === "register") body.name = registerName || name;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Authentication failed");
        return;
      }

      // Redirect based on role returned from server
      const destination = json.redirectTo || (json.user?.role === "ADMIN" ? "/" : "/user");
      router.push(destination);
      router.refresh();
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(email, password, name);
  };

  const handleSelectPortal = (portal: "admin" | "citizen", autoSubmit: boolean = false) => {
    setSelectedPortal(portal);
    if (portal === "admin") {
      setEmail("admin@aqualens.gov.in");
      setPassword("Admin@123456");
      if (autoSubmit) {
        performLogin("admin@aqualens.gov.in", "Admin@123456");
      }
    } else {
      setEmail("citizen@aqualens.gov.in");
      setPassword("User@123456");
      if (autoSubmit) {
        performLogin("citizen@aqualens.gov.in", "User@123456");
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-[#eaf4fd] via-[#e2f0fc] to-[#cae6fc] font-sans flex flex-col justify-between select-none">
      {/* ── Realistic Water Landscape Background Layer ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Soft Sun/Sky Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-white/90 via-sky-100/50 to-transparent rounded-full blur-3xl opacity-70" />

        {/* Misty Hills Silhouette in Background */}
        <div className="absolute bottom-28 left-0 right-0 h-44 opacity-25">
          <svg viewBox="0 0 1440 240" fill="none" preserveAspectRatio="none" className="w-full h-full">
            <path
              d="M0,160 C320,120 420,200 680,140 C940,80 1100,170 1440,110 L1440,240 L0,240 Z"
              fill="#7baece"
            />
            <path
              d="M0,190 C220,150 480,210 740,160 C1000,110 1220,190 1440,150 L1440,240 L0,240 Z"
              fill="#9bc5e2"
              opacity="0.7"
            />
          </svg>
        </div>

        {/* Lake / Water Surface Reflection Across Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-[#60a5fa]/40 via-[#93c5fd]/30 to-transparent">
          {/* Gentle water shimmer waves */}
          <svg viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none" className="w-full h-full opacity-60">
            <path
              d="M0,40 C180,60 360,20 540,40 C720,60 900,20 1080,40 C1260,60 1380,30 1440,40 L1440,120 L0,120 Z"
              fill="url(#water-grad-1)"
            />
            <path
              d="M0,70 C240,50 480,90 720,70 C960,50 1200,80 1440,65 L1440,120 L0,120 Z"
              fill="url(#water-grad-2)"
              opacity="0.8"
            />
            <defs>
              <linearGradient id="water-grad-1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="water-grad-2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="0.9" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Lush Green Tropical Leaves - Top Right Corner */}
        <div className="absolute -top-6 -right-6 w-56 h-56 opacity-80 pointer-events-none transform rotate-12">
          <svg viewBox="0 0 200 200" fill="none" className="w-full h-full drop-shadow-md">
            <path
              d="M190,10 C140,20 110,60 100,110 C120,80 160,50 190,10 Z"
              fill="#22c55e"
              opacity="0.8"
            />
            <path
              d="M170,0 C120,15 90,55 70,100 C95,70 140,40 170,0 Z"
              fill="#16a34a"
              opacity="0.9"
            />
            <path
              d="M200,30 C150,50 120,90 115,140 C135,110 170,80 200,30 Z"
              fill="#15803d"
              opacity="0.75"
            />
            <path
              d="M150,0 C110,25 75,70 60,120 C80,85 120,50 150,0 Z"
              fill="#4ade80"
              opacity="0.85"
            />
          </svg>
        </div>

        {/* Delicate Green Leaf - Bottom Left */}
        <div className="absolute bottom-16 -left-6 w-44 h-44 opacity-75 pointer-events-none transform -rotate-12">
          <svg viewBox="0 0 200 200" fill="none" className="w-full h-full drop-shadow-md">
            <path
              d="M10,190 C30,130 65,95 120,80 C85,105 55,145 10,190 Z"
              fill="#16a34a"
              opacity="0.85"
            />
            <path
              d="M0,170 C20,115 55,80 105,65 C75,90 45,130 0,170 Z"
              fill="#22c55e"
              opacity="0.8"
            />
            <path
              d="M25,200 C50,145 90,115 145,105 C110,125 75,160 25,200 Z"
              fill="#15803d"
              opacity="0.7"
            />
          </svg>
        </div>

        {/* Giant Crystal Water Droplet with Ripples - Bottom Right */}
        <div className="absolute bottom-6 right-8 md:right-20 pointer-events-none flex flex-col items-center">
          {/* Concentric Water Ripple Rings */}
          <div className="relative w-44 h-24 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-sky-400/40 animate-ping opacity-30" style={{ animationDuration: "3s" }} />
            <div className="absolute w-36 h-16 rounded-full border border-sky-300/50 shadow-[0_0_15px_rgba(56,189,248,0.3)]" />
            <div className="absolute w-24 h-10 rounded-full border-2 border-sky-200/70" />
            <div className="absolute w-12 h-5 rounded-full border border-white/80" />

            {/* Glowing 3D Crystal Water Drop Hanging/Resting */}
            <div className="absolute -top-24 w-20 h-28">
              <svg viewBox="0 0 100 140" fill="none" className="w-full h-full drop-shadow-[0_12px_20px_rgba(2,132,199,0.35)]">
                <defs>
                  <linearGradient id="drop-base" x1="20" y1="10" x2="80" y2="130" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.95" />
                    <stop offset="35%" stopColor="#38bdf8" stopOpacity="0.85" />
                    <stop offset="70%" stopColor="#0284c7" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#0369a1" stopOpacity="0.95" />
                  </linearGradient>
                  <linearGradient id="drop-highlight" x1="30" y1="20" x2="60" y2="90" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Main Droplet Teardrop Form */}
                <path
                  d="M50,10 C50,10 15,70 15,95 C15,117 31,135 50,135 C69,135 85,117 85,95 C85,70 50,10 50,10 Z"
                  fill="url(#drop-base)"
                  stroke="#bae6fd"
                  strokeWidth="2"
                />
                {/* Specular Light Reflection / Glint */}
                <ellipse cx="38" cy="75" rx="8" ry="18" transform="rotate(-20 38 75)" fill="url(#drop-highlight)" />
                <circle cx="62" cy="105" r="4" fill="#ffffff" opacity="0.6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Small floating crystal water bubbles */}
        <div className="absolute bottom-16 right-72 w-5 h-5 rounded-full border border-sky-300 bg-white/40 shadow-sm blur-[0.5px]" />
        <div className="absolute bottom-24 right-56 w-3 h-3 rounded-full border border-sky-200 bg-white/50" />
        <div className="absolute bottom-8 left-48 w-6 h-6 rounded-full border border-sky-300/60 bg-sky-100/30" />
        <div className="absolute bottom-14 left-28 w-4 h-4 rounded-full border border-sky-200/50 bg-white/40" />
      </div>

      {/* ── Main Interactive Content Container ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 pt-6 sm:pt-10 pb-8 flex-1 flex flex-col items-center justify-center">

        {/* ── Header: Logo + Title ── */}
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="flex items-center gap-3.5 mb-1.5">
            {/* Custom Aqua-Lens Logo Badge */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] flex items-center justify-center shadow-lg shadow-sky-500/25 border-2 border-white/60">
              <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8">
                {/* Water droplet + waves logo */}
                <path
                  d="M18 6C18 6 11 16 11 21C11 24.866 14.134 28 18 28C21.866 28 25 24.866 25 21C25 16 18 6 18 6Z"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="16" cy="19" r="1.5" fill="white" />
                <path
                  d="M10 30C13 32 15 32 18 30C21 28 23 28 26 30"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-wider text-[#0f2851] font-sans">
              AQUA-LENS
            </h1>
          </div>

          <p className="text-slate-500 text-xs sm:text-[13px] font-medium tracking-wide">
            Dual-Portal WASH & Grievance Intelligence System
          </p>
        </div>

        {/* ── Middle Row: Left Badges + Center Forms + Right Badges ── */}
        <div className="w-full flex items-center justify-center gap-6 xl:gap-14">

          {/* ── Left Floating Feature Badges (Desktop) ── */}
          <div className="hidden lg:flex flex-col gap-5 w-44">
            {/* Badge 1: Monitor Water Quality */}
            <div className="flex items-center gap-3.5 bg-white/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/90 shadow-[0_8px_20px_rgba(2,132,199,0.06)] hover:shadow-md transition-all">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0">
                <Droplet className="w-5 h-5 fill-blue-500/20" />
              </div>
              <div className="text-left leading-tight">
                <span className="block text-xs font-semibold text-slate-700">Monitor</span>
                <span className="block text-[11px] text-slate-500">Water Quality</span>
              </div>
            </div>

            {/* Badge 2: Smarter Decisions */}
            <div className="flex items-center gap-3.5 bg-white/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/90 shadow-[0_8px_20px_rgba(2,132,199,0.06)] hover:shadow-md transition-all">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="text-left leading-tight">
                <span className="block text-xs font-semibold text-slate-700">Smarter</span>
                <span className="block text-[11px] text-slate-500">Decisions</span>
              </div>
            </div>

            {/* Badge 3: Cleaner Communities */}
            <div className="flex items-center gap-3.5 bg-white/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/90 shadow-[0_8px_20px_rgba(2,132,199,0.06)] hover:shadow-md transition-all">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-left leading-tight">
                <span className="block text-xs font-semibold text-slate-700">Cleaner</span>
                <span className="block text-[11px] text-slate-500">Communities</span>
              </div>
            </div>
          </div>

          {/* ── Center Column: Auth Cards ── */}
          <div className="w-full max-w-[480px] flex flex-col gap-4">

            {/* 1. INSTANT DEMO ACCESS (ONE-CLICK) CARD */}
            <div className="rounded-3xl bg-white/95 backdrop-blur-xl border border-white/90 shadow-[0_12px_32px_rgba(2,132,199,0.08)] p-5">
              {/* Header Divider */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-slate-200" />
                <span className="text-[10.5px] font-extrabold uppercase tracking-widest text-[#0f2851]">
                  INSTANT DEMO ACCESS (ONE-CLICK)
                </span>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-slate-200" />
              </div>

              {/* Two Portal Selection Buttons */}
              <div className="grid grid-cols-2 gap-3.5">
                {/* Admin Portal Button */}
                <button
                  type="button"
                  onClick={() => handleSelectPortal("admin", true)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl transition-all border text-left group ${
                    selectedPortal === "admin"
                      ? "bg-[#ebf4ff] border-2 border-[#3b82f6] shadow-sm ring-2 ring-blue-100/70"
                      : "bg-white hover:bg-slate-50 border-slate-200/80"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-blue-100/70 flex items-center justify-center text-blue-600 shrink-0">
                      <Shield className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="truncate">
                      <span className="block text-xs font-bold text-[#0f2851] group-hover:text-blue-600 transition-colors">
                        Admin Portal
                      </span>
                      <span className="block text-[10px] text-slate-500 font-medium">
                        Command Center
                      </span>
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1 ${
                    selectedPortal === "admin" ? "text-blue-600" : "text-slate-400"
                  }`} />
                </button>

                {/* Citizen Portal Button */}
                <button
                  type="button"
                  onClick={() => handleSelectPortal("citizen", true)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl transition-all border text-left group ${
                    selectedPortal === "citizen"
                      ? "bg-[#ecfeff] border-2 border-[#06b6d4] shadow-sm ring-2 ring-cyan-100/70"
                      : "bg-white hover:bg-slate-50 border-slate-200/80"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-teal-100/70 flex items-center justify-center text-teal-600 shrink-0">
                      <Users className="w-4 h-4 text-teal-600" />
                    </div>
                    <div className="truncate">
                      <span className="block text-xs font-bold text-[#0f2851] group-hover:text-teal-600 transition-colors">
                        Citizen Portal
                      </span>
                      <span className="block text-[10px] text-slate-500 font-medium">
                        Grievance & AI
                      </span>
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1 ${
                    selectedPortal === "citizen" ? "text-cyan-600" : "text-slate-400"
                  }`} />
                </button>
              </div>
            </div>

            {/* 2. MAIN CREDENTIALS & FORM CARD */}
            <div className="rounded-3xl bg-white/95 backdrop-blur-xl border border-white/90 shadow-[0_16px_40px_rgba(2,132,199,0.1)] p-6 sm:p-7">
              {/* Tab Switcher: Sign In vs Register */}
              <div className="flex mb-6 rounded-2xl bg-[#edf2f7] p-1 border border-slate-200/50">
                <button
                  type="button"
                  onClick={() => { setMode("login"); setError(null); }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    mode === "login"
                      ? "bg-[#2563eb] text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("register"); setError(null); }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    mode === "register"
                      ? "bg-[#2563eb] text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <PenLine className="w-4 h-4" />
                  <span>Register</span>
                </button>
              </div>

              {/* Form Elements */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "register" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>Full Name</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      placeholder="Your full name"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
                    />
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>Email Address</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Password</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type={showPwd ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-600">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Vibrant Gradient Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#2563eb] via-[#0284c7] to-[#06b6d4] hover:from-[#1d4ed8] hover:to-[#0891b2] text-white font-bold text-xs shadow-lg shadow-sky-500/25 hover:shadow-sky-500/35 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>{loading ? "Authenticating..." : mode === "login" ? "Sign In to Portal" : "Create Account"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Credentials Quick-Fill section */}
              {mode === "login" && (
                <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                  <span className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">
                    Credentials Quick-Fill
                  </span>
                  <div className="flex items-center justify-center gap-3 text-xs font-medium text-slate-600">
                    <button
                      type="button"
                      onClick={() => handleSelectPortal("admin", false)}
                      className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 transition-colors"
                    >
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span className="font-mono text-[11px]">admin@aqualens.gov.in</span>
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => handleSelectPortal("citizen", false)}
                      className="flex items-center gap-1.5 text-slate-600 hover:text-cyan-600 transition-colors"
                    >
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span className="font-mono text-[11px]">citizen@aqualens.gov.in</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Security Note */}
            <p className="text-center text-[11px] text-slate-500 mt-1 font-medium">
              Role-protected session management with unified complaint routing.
            </p>
          </div>

          {/* ── Right Floating Feature Badges (Desktop) ── */}
          <div className="hidden lg:flex flex-col gap-5 w-44">
            {/* Badge 1: Safe Water */}
            <div className="flex items-center gap-3.5 bg-white/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/90 shadow-[0_8px_20px_rgba(2,132,199,0.06)] hover:shadow-md transition-all">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left leading-tight">
                <span className="block text-xs font-semibold text-slate-700">Safe Water</span>
              </div>
            </div>

            {/* Badge 2: Sustainable Tomorrow */}
            <div className="flex items-center gap-3.5 bg-white/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/90 shadow-[0_8px_20px_rgba(2,132,199,0.06)] hover:shadow-md transition-all">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shrink-0">
                <Leaf className="w-5 h-5" />
              </div>
              <div className="text-left leading-tight">
                <span className="block text-xs font-semibold text-slate-700">Sustainable</span>
                <span className="block text-[11px] text-slate-500">Tomorrow</span>
              </div>
            </div>

            {/* Badge 3: Community First */}
            <div className="flex items-center gap-3.5 bg-white/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/90 shadow-[0_8px_20px_rgba(2,132,199,0.06)] hover:shadow-md transition-all">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-left leading-tight">
                <span className="block text-xs font-semibold text-slate-700">Community</span>
                <span className="block text-[11px] text-slate-500">First</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
