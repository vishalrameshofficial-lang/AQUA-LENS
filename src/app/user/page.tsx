"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import {
  Sparkles,
  MessageSquareWarning,
  ArrowRight,
  ShieldCheck,
  Clock,
  FileText,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Building,
} from "lucide-react";

export default function UserPortalPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    async function loadUserDataAndComplaints() {
      try {
        const [userRes, compRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/complaints"),
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.authenticated && userData.user) {
            setCurrentUser(userData.user);
          }
        }

        if (compRes.ok) {
          const json = await compRes.json();
          setComplaints(json.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadUserDataAndComplaints();
  }, []);

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        {/* Welcome Header */}
        <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/20 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-xs font-bold text-blue-600 uppercase tracking-widest">
                  CITIZEN ACCESS PORTAL
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
                <ShieldCheck className="w-7 h-7 text-blue-600" />
                <span>
                  Welcome{currentUser?.name ? `, ${currentUser.name}` : ""}
                </span>
              </h1>
              <p className="text-slate-500 mt-1 text-sm max-w-2xl">
                Access verified village WASH data, ask questions using AI, or register grievances directly with local administration with GPS and photo evidence.
              </p>
            </div>

            <Link
              href="/complaints/register"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all shrink-0 self-start md:self-center"
            >
              <Plus className="w-4 h-4" />
              <span>Register Grievance</span>
            </Link>
          </div>
        </div>

        {/* Primary Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Register Grievance */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200 flex flex-col justify-between hover:shadow-lg transition-all group bg-white">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-amber-100 p-2.5 rounded-xl">
                  <MessageSquareWarning className="w-6 h-6 text-amber-600" />
                </div>
                <h2 className="text-base font-bold text-slate-800">Register Grievance</h2>
              </div>
              <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                Submit an issue regarding drinking water supply, contamination, or drainage. Includes camera verification and automatic department routing.
              </p>
            </div>
            <Link
              href="/complaints/register"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-xs font-bold hover:from-amber-600 hover:to-orange-600 transition-all shadow-md group-hover:shadow-amber-500/25"
            >
              <span>FILE NEW GRIEVANCE</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* 2. Track Grievance */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200 flex flex-col justify-between hover:shadow-lg transition-all group bg-white">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-100 p-2.5 rounded-xl">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-base font-bold text-slate-800">Track Grievance</h2>
              </div>
              <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                Check live resolution status, assigned field officers, inspection notes, and official resolution timeline using your Tracking ID.
              </p>
            </div>
            <Link
              href="/complaints/track"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md group-hover:shadow-blue-500/25"
            >
              <span>TRACK STATUS</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* 3. Ask Aqua-Lens AI */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200 flex flex-col justify-between hover:shadow-lg transition-all group bg-white">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-cyan-100 p-2.5 rounded-xl">
                  <Sparkles className="w-6 h-6 text-cyan-600" />
                </div>
                <h2 className="text-base font-bold text-slate-800">Ask Aqua-Lens</h2>
              </div>
              <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                Query water quality, flood hazard levels, safe sources, and village vulnerability data in your native Indian language with AI assistance.
              </p>
            </div>
            <Link
              href="/ask"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl text-xs font-bold hover:from-cyan-700 hover:to-teal-700 transition-all shadow-md group-hover:shadow-cyan-500/25"
            >
              <span>ASK QUESTIONS</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* My Registered Grievances */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900 tracking-wide uppercase">
                My Grievance Submissions
              </h2>
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                {complaints.length}
              </span>
            </div>

            <Link
              href="/complaints/register"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Grievance</span>
            </Link>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Clock className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-xs">Loading your complaints...</span>
            </div>
          ) : complaints.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <MessageSquareWarning className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No grievances registered yet</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                When you report an issue, it will be assigned a permanent Tracking ID and tracked here with live status updates.
              </p>
              <Link
                href="/complaints/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register a Grievance Now</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Tracking ID</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Assigned Department</th>
                    <th className="px-4 py-3">Submitted Date</th>
                    <th className="px-4 py-3 rounded-tr-lg text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          {c.trackingId}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium">
                        {c.category?.replace(/_/g, " ") || "Water Service"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-1 rounded text-[10px] font-bold border ${
                            c.status === "RESOLVED" || c.status === "CLOSED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : c.status === "IN_PROGRESS" || c.status === "ASSIGNED"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs truncate max-w-[200px]">
                        {c.routedDepartment || "Municipal Administration"}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {new Date(c.createdAt).toLocaleDateString([], {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-right font-bold">
                        <Link
                          href={`/complaints/${c.id}`}
                          className="text-blue-600 hover:text-blue-800 text-xs inline-flex items-center gap-1"
                        >
                          <span>Track</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
