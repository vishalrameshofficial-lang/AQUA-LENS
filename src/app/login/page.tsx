"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Users,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Droplets,
  Loader2,
  Sparkles,
} from "lucide-react";

// ── Reusable Component: InputField ──
interface InputFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  icon: React.ReactNode;
  required?: boolean;
  rightElement?: React.ReactNode;
}

function InputField({
  label,
  type,
  value,
  onChange,
  placeholder,
  icon,
  required = true,
  rightElement,
}: InputFieldProps) {
  return (
    <div className="space-y-1.5 text-left">
      <label className="block text-xs font-semibold text-cyan-100/90 tracking-wide flex items-center gap-1.5">
        <span className="text-cyan-400">{icon}</span>
        <span>{label}</span>
      </label>
      <div className="relative rounded-xl border border-cyan-500/25 bg-[#07132c]/75 backdrop-blur-md shadow-inner transition-all duration-200 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/25 group">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400/60 group-focus-within:text-cyan-400 transition-colors pointer-events-none">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className="w-full rounded-xl bg-transparent py-2.5 pl-10 pr-10 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none"
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Reusable Component: PrimaryButton ──
interface PrimaryButtonProps {
  type?: "submit" | "button";
  onClick?: () => void;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

function PrimaryButton({
  type = "submit",
  onClick,
  loading = false,
  children,
  className = "",
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 py-3 px-6 text-xs sm:text-sm font-bold text-white shadow-[0_8px_25px_rgba(6,182,212,0.35)] transition-all duration-200 hover:from-blue-500 hover:to-cyan-400 hover:shadow-[0_10px_30px_rgba(6,182,212,0.5)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-white" />
          <span>Authenticating...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

// ── Reusable Component: LogoHeader ──
function LogoHeader() {
  return (
    <div className="flex flex-col items-center text-center mb-6 sm:mb-8 animate-fade-in">
      {/* Water-drop AQUA-LENS logo */}
      <div className="relative mb-3 flex items-center justify-center">
        <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-blue-500/30 to-cyan-500/30 blur-lg" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-blue-600 via-sky-500 to-cyan-400 shadow-xl shadow-cyan-500/25">
          <Droplets className="h-7 w-7 text-white" />
          <div className="absolute top-1.5 right-1.5">
            <Sparkles className="h-3 w-3 text-cyan-200 animate-pulse" />
          </div>
        </div>
      </div>

      {/* AQUA-LENS Title */}
      <h1 className="text-3xl sm:text-4xl font-black tracking-wider text-white">
        <span>AQUA-</span>
        <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-cyan-300 bg-clip-text text-transparent">
          LENS
        </span>
      </h1>

      {/* Tagline */}
      <p className="mt-1.5 text-xs sm:text-sm font-medium tracking-wide text-cyan-200/80 max-w-md">
        Dual-Portal WASH & Grievance Intelligence System
      </p>
    </div>
  );
}

// ── Reusable Component: PortalSelector ──
interface PortalSelectorProps {
  onSelectPortal: (portal: "admin" | "citizen") => void;
  activePortal?: "admin" | "citizen" | null;
  loadingPortal?: "admin" | "citizen" | null;
}

function PortalSelector({ onSelectPortal, activePortal, loadingPortal }: PortalSelectorProps) {
  return (
    <div className="w-full max-w-xl mx-auto mb-5 rounded-2xl sm:rounded-3xl border border-cyan-500/25 bg-[#0b1b3d]/70 p-4 sm:p-5 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
      {/* Card Header with stylish divider lines */}
      <div className="flex items-center justify-center gap-3 mb-3.5">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-cyan-500/60" />
        <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-cyan-300/90 text-center">
          INSTANT DEMO ACCESS (ONE-CLICK)
        </span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-cyan-500/30 to-cyan-500/60" />
      </div>

      {/* Two Portal Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Left: Admin Portal */}
        <button
          type="button"
          onClick={() => onSelectPortal("admin")}
          disabled={loadingPortal !== null}
          className={`group relative flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 text-left ${
            activePortal === "admin"
              ? "border-cyan-400/80 bg-blue-900/40 shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/50 -translate-y-0.5"
              : "border-cyan-500/20 bg-[#07132c]/60 hover:border-cyan-400/60 hover:bg-[#0d224d]/70 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(6,182,212,0.2)]"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-blue-600/25 text-cyan-300 shadow-sm group-hover:scale-105 group-hover:bg-blue-600/35 transition-all">
              {loadingPortal === "admin" ? (
                <Loader2 className="h-5 w-5 animate-spin text-cyan-300" />
              ) : (
                <ShieldCheck className="h-5 w-5 text-cyan-300" />
              )}
            </div>
            <div className="truncate">
              <span className="block text-xs sm:text-sm font-bold text-white group-hover:text-cyan-200 transition-colors">
                Admin Portal
              </span>
              <span className="block text-[11px] text-cyan-200/70 font-medium truncate">
                Command Center
              </span>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-cyan-400/70 transition-transform group-hover:translate-x-1 group-hover:text-cyan-300" />
        </button>

        {/* Right: Citizen Portal */}
        <button
          type="button"
          onClick={() => onSelectPortal("citizen")}
          disabled={loadingPortal !== null}
          className={`group relative flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 text-left ${
            activePortal === "citizen"
              ? "border-teal-400/80 bg-teal-950/40 shadow-[0_0_20px_rgba(20,184,166,0.25)] ring-1 ring-teal-400/50 -translate-y-0.5"
              : "border-cyan-500/20 bg-[#07132c]/60 hover:border-teal-400/60 hover:bg-[#07243d]/70 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(20,184,166,0.2)]"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-500/30 bg-teal-600/25 text-teal-300 shadow-sm group-hover:scale-105 group-hover:bg-teal-600/35 transition-all">
              {loadingPortal === "citizen" ? (
                <Loader2 className="h-5 w-5 animate-spin text-teal-300" />
              ) : (
                <Users className="h-5 w-5 text-teal-300" />
              )}
            </div>
            <div className="truncate">
              <span className="block text-xs sm:text-sm font-bold text-white group-hover:text-teal-200 transition-colors">
                Citizen Portal
              </span>
              <span className="block text-[11px] text-teal-200/70 font-medium truncate">
                Grievance & AI
              </span>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-teal-400/70 transition-transform group-hover:translate-x-1 group-hover:text-teal-300" />
        </button>
      </div>
    </div>
  );
}

// ── Reusable Component: LoginForm ──
interface LoginFormProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  onQuickFill: (role: "admin" | "citizen") => void;
}

function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  onSubmit,
  loading,
  onQuickFill,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Email Address */}
      <InputField
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        icon={<Mail className="h-4 w-4" />}
      />

      {/* Password */}
      <InputField
        label="Password"
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        icon={<Lock className="h-4 w-4" />}
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-cyan-400/70 hover:text-cyan-300 transition-colors p-1"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
      />

      {/* Main CTA button */}
      <div className="pt-1">
        <PrimaryButton type="submit" loading={loading}>
          <span>Sign In to Portal</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </PrimaryButton>
      </div>

      {/* Quick-Fill Section */}
      <div className="pt-4 mt-2 border-t border-cyan-500/20 text-center">
        <span className="block text-[10.5px] font-bold uppercase tracking-widest text-cyan-300/70 mb-2">
          Credentials Quick-Fill
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs">
          <button
            type="button"
            onClick={() => onQuickFill("admin")}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] text-cyan-300 hover:text-white bg-blue-950/60 hover:bg-blue-900/80 px-2.5 py-1 rounded-lg border border-cyan-500/30 transition-all hover:scale-[1.02]"
          >
            <ShieldCheck className="h-3 w-3 text-cyan-400" />
            <span>admin@aqualens.gov.in</span>
          </button>
          <span className="text-cyan-600">|</span>
          <button
            type="button"
            onClick={() => onQuickFill("citizen")}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] text-teal-300 hover:text-white bg-teal-950/60 hover:bg-teal-900/80 px-2.5 py-1 rounded-lg border border-teal-500/30 transition-all hover:scale-[1.02]"
          >
            <Users className="h-3 w-3 text-teal-400" />
            <span>citizen@aqualens.gov.in</span>
          </button>
        </div>
      </div>
    </form>
  );
}

// ── Reusable Component: RegisterForm ──
interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onSubmit: (formData: any) => void;
  loading: boolean;
}

function RegisterForm({ onSwitchToLogin, onSubmit, loading }: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters.");
      return;
    }

    onSubmit({ name, email, phone, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {/* Full Name */}
      <InputField
        label="Full Name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Dr. Rajesh Raman"
        icon={<User className="h-4 w-4" />}
      />

      {/* Email Address */}
      <InputField
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="rajesh@aqualens.gov.in"
        icon={<Mail className="h-4 w-4" />}
      />

      {/* Phone Number */}
      <InputField
        label="Phone Number"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+91 98421 00000"
        icon={<Phone className="h-4 w-4" />}
        required={false}
      />

      {/* Password */}
      <InputField
        label="Password"
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Minimum 6 characters"
        icon={<Lock className="h-4 w-4" />}
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-cyan-400/70 hover:text-cyan-300 transition-colors p-1"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
      />

      {/* Confirm Password */}
      <InputField
        label="Confirm Password"
        type={showPassword ? "text" : "password"}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Re-enter your password"
        icon={<Lock className="h-4 w-4" />}
      />

      {validationError && (
        <div className="flex items-center gap-2 rounded-xl bg-red-950/60 border border-red-500/40 p-2.5 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Create Account Button */}
      <div className="pt-2">
        <PrimaryButton type="submit" loading={loading}>
          <span>Create Account</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </PrimaryButton>
      </div>

      {/* Switch to login link */}
      <div className="pt-3 text-center">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-xs text-cyan-300/80 hover:text-white transition-colors"
        >
          Already have an account? <span className="font-bold underline underline-offset-2 text-cyan-300">Sign In</span>
        </button>
      </div>
    </form>
  );
}

// ── Main Page Component: AQUA-LENS Web Application ──
export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("admin@aqualens.gov.in");
  const [password, setPassword] = useState("Admin@123456");
  const [activePortal, setActivePortal] = useState<"admin" | "citizen" | null>("admin");
  const [loadingPortal, setLoadingPortal] = useState<"admin" | "citizen" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authenticate user with role redirection
  const handleAuth = async (credentials: {
    email: string;
    password: string;
    name?: string;
    phone?: string;
    isRegister?: boolean;
    targetRoute?: string;
  }) => {
    setError(null);
    setLoading(true);

    try {
      const endpoint = credentials.isRegister ? "/api/auth/register" : "/api/auth/login";
      const payload: any = {
        email: credentials.email.toLowerCase().trim(),
        password: credentials.password,
      };

      if (credentials.isRegister) {
        payload.name = credentials.name;
        payload.phone = credentials.phone;
        payload.role = "USER";
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Authentication failed. Please verify credentials.");
        return;
      }

      // Priority route selection: requested route -> server redirectTo -> role fallback
      const dest = credentials.targetRoute || data.redirectTo || (data.user?.role === "ADMIN" ? "/admin" : "/citizen");
      router.push(dest);
      router.refresh();
    } catch (err: any) {
      setError("Network or server connection issue. Please try again.");
    } finally {
      setLoading(false);
      setLoadingPortal(null);
    }
  };

  // Instant 1-Click Portal Demo Selection
  const handleSelectPortal = async (portal: "admin" | "citizen") => {
    setActivePortal(portal);
    setLoadingPortal(portal);
    setError(null);

    if (portal === "admin") {
      setEmail("admin@aqualens.gov.in");
      setPassword("Admin@123456");
      await handleAuth({
        email: "admin@aqualens.gov.in",
        password: "Admin@123456",
        targetRoute: "/admin",
      });
    } else {
      setEmail("citizen@aqualens.gov.in");
      setPassword("User@123456");
      await handleAuth({
        email: "citizen@aqualens.gov.in",
        password: "User@123456",
        targetRoute: "/citizen",
      });
    }
  };

  // Quick-Fill credentials into inputs without auto-submitting
  const handleQuickFill = (role: "admin" | "citizen") => {
    setActivePortal(role);
    if (role === "admin") {
      setEmail("admin@aqualens.gov.in");
      setPassword("Admin@123456");
    } else {
      setEmail("citizen@aqualens.gov.in");
      setPassword("User@123456");
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAuth({ email, password });
  };

  const handleRegisterSubmit = (regData: any) => {
    handleAuth({
      email: regData.email,
      password: regData.password,
      name: regData.name,
      phone: regData.phone,
      isRegister: true,
      targetRoute: "/citizen",
    });
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#060e22] via-[#09173a] to-[#0d2657] font-sans flex flex-col justify-between select-none">
      {/* ── Background: Waves, Glows & Water Bubbles ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Deep cyan-blue glowing orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-600/15 blur-[120px]" />
        <div className="absolute top-1/4 -right-32 w-[30rem] h-[30rem] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute -bottom-32 left-1/3 w-[32rem] h-[32rem] rounded-full bg-sky-600/15 blur-[140px]" />

        {/* Elegant Water Waves at Background */}
        <div className="absolute bottom-0 left-0 right-0 h-44 opacity-25">
          <svg viewBox="0 0 1440 220" fill="none" preserveAspectRatio="none" className="w-full h-full">
            <path
              d="M0,80 C320,130 520,30 840,90 C1160,150 1340,60 1440,80 L1440,220 L0,220 Z"
              fill="url(#wave-grad-1)"
            />
            <path
              d="M0,120 C280,70 560,150 880,100 C1200,50 1360,120 1440,110 L1440,220 L0,220 Z"
              fill="url(#wave-grad-2)"
              opacity="0.6"
            />
            <defs>
              <linearGradient id="wave-grad-1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="wave-grad-2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.9" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Floating Water Bubbles */}
        <div className="absolute top-1/4 left-16 w-3 h-3 rounded-full border border-cyan-400/40 bg-cyan-400/10 animate-pulse" />
        <div className="absolute top-1/3 right-20 w-4 h-4 rounded-full border border-sky-400/30 bg-sky-400/10" />
        <div className="absolute bottom-32 left-1/4 w-2.5 h-2.5 rounded-full border border-cyan-300/40 bg-cyan-300/10" />
        <div className="absolute bottom-48 right-1/4 w-5 h-5 rounded-full border border-blue-400/30 bg-blue-400/10 animate-pulse" />
      </div>

      {/* ── Main Container ── */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 pt-8 sm:pt-12 pb-8 flex-1 flex flex-col items-center justify-center">

        {/* 1. BRAND HEADER */}
        <LogoHeader />

        {/* 2. INSTANT DEMO ACCESS CARD */}
        <PortalSelector
          onSelectPortal={handleSelectPortal}
          activePortal={activePortal}
          loadingPortal={loadingPortal}
        />

        {/* 3. LOGIN & REGISTRATION CARD */}
        <div className="w-full max-w-xl mx-auto rounded-2xl sm:rounded-3xl border border-cyan-500/25 bg-[#0b1b3d]/75 p-6 sm:p-8 backdrop-blur-xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] transition-all">

          {/* Card Tabs: SIGN IN | REGISTER */}
          <div className="flex mb-6 rounded-2xl bg-[#07132c]/80 p-1 border border-cyan-500/15">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
                mode === "login"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <User className="h-4 w-4" />
              <span>SIGN IN</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
                mode === "register"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>REGISTER</span>
            </button>
          </div>

          {/* Server Error Alert */}
          {error && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-red-950/70 border border-red-500/40 p-3 text-xs sm:text-sm text-red-300 animate-shake">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Switcher */}
          {mode === "login" ? (
            <LoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              onSubmit={handleLoginSubmit}
              loading={loading}
              onQuickFill={handleQuickFill}
            />
          ) : (
            <RegisterForm
              onSwitchToLogin={() => setMode("login")}
              onSubmit={handleRegisterSubmit}
              loading={loading}
            />
          )}
        </div>

        {/* 4. SUBTLE FOOTER */}
        <footer className="mt-6 text-center text-xs text-cyan-200/50">
          Role-protected session management with unified complaint routing.
        </footer>
      </main>
    </div>
  );
}
