"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Droplets, Eye, EyeOff, AlertCircle, Lock, Mail, ShieldCheck, UserCheck, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleQuickLogin = async (role: "admin" | "citizen") => {
    if (role === "admin") {
      setEmail("admin@aqualens.gov.in");
      setPassword("Admin@123456");
      await performLogin("admin@aqualens.gov.in", "Admin@123456");
    } else {
      setEmail("citizen@aqualens.gov.in");
      setPassword("User@123456");
      await performLogin("citizen@aqualens.gov.in", "User@123456");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950 p-4 font-sans">
      {/* Background glowing effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-cyan-600/15 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-2xl shadow-blue-500/30">
              <Droplets className="h-7 w-7 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white tracking-wider">AQUA-LENS</h1>
          <p className="text-cyan-400 text-xs font-mono mt-1">
            Dual-Portal WASH & Grievance Intelligence System
          </p>
        </div>

        {/* 1-Click Quick Demo Sign-in Section */}
        <div className="mb-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 p-4 shadow-xl">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-cyan-300 text-center mb-2.5">
            Instant Demo Access (One-Click)
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin("admin")}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/35 border border-blue-400/30 text-white transition-all group disabled:opacity-50"
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-blue-300 group-hover:text-white">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Admin Portal</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5">Command Center</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin("citizen")}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/35 border border-cyan-400/30 text-white transition-all group disabled:opacity-50"
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-cyan-300 group-hover:text-white">
                <UserCheck className="w-4 h-4 text-cyan-400" />
                <span>Citizen Portal</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5">Grievance & AI</span>
            </button>
          </div>
        </div>

        {/* Auth Card */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl p-6 sm:p-8">
          {/* Tab switcher */}
          <div className="flex mb-6 rounded-xl bg-white/5 p-1 border border-white/5">
            <button
              onClick={() => { setMode("login"); setError(null); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === "login"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("register"); setError(null); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === "register"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Your full name"
                  className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-xl bg-white/10 border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-white/10 border border-white/10 pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-xs hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <span>{loading ? "Authenticating..." : mode === "login" ? "Sign In to Portal" : "Create Account"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {mode === "login" && (
            <div className="mt-5 border-t border-white/10 pt-4 text-center">
              <span className="text-[11px] text-slate-500 block mb-2">Credentials Quick-Fill:</span>
              <div className="flex justify-center gap-3 text-[11px] font-mono text-slate-400">
                <button
                  type="button"
                  onClick={() => { setEmail("admin@aqualens.gov.in"); setPassword("Admin@123456"); }}
                  className="hover:text-blue-300 underline underline-offset-2"
                >
                  admin@aqualens.gov.in
                </button>
                <span>|</span>
                <button
                  type="button"
                  onClick={() => { setEmail("citizen@aqualens.gov.in"); setPassword("User@123456"); }}
                  className="hover:text-cyan-300 underline underline-offset-2"
                >
                  citizen@aqualens.gov.in
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-slate-500 mt-5">
          Role-protected session management with unified complaint routing.
        </p>
      </div>
    </div>
  );
}
