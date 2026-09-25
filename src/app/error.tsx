"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Aqua-Lens App Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#060c1c] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-red-400" />
      </div>

      <h1 className="text-2xl font-bold tracking-tight mb-2">
        Something went wrong
      </h1>
      <p className="text-slate-400 text-sm max-w-md mb-6">
        {error?.message || "An unexpected error occurred while loading this section."}
      </p>

      {error?.digest && (
        <p className="text-xs font-mono text-slate-500 mb-6 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
          Digest: {error.digest}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-lg border border-slate-700 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
