"use client";

import React from "react";
import {
  Droplet, TrendingUp, TrendingDown,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

async function fetchJsonWithTimeout(url: string, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal, cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    available:   "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    unavailable: "bg-neutral-500/15 text-neutral-400 border border-neutral-500/30",
    cooldown:    "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    critical:    "bg-rose-500/15 text-rose-400 border border-rose-500/30",
    urgent:      "bg-orange-500/15 text-orange-400 border border-orange-500/30",
    normal:      "bg-blue-500/15 text-blue-400 border border-blue-500/30",
    approved:    "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    pending:     "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    rejected:    "bg-rose-500/15 text-rose-400 border border-rose-500/30",
  };
  return (
    <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full capitalize ${map[status.toLowerCase()] ?? map.normal}`}>
      {status}
    </span>
  );
}

export function BloodBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center gap-1 bg-rose-500/15 text-rose-400 border border-rose-500/25 text-xs font-bold px-2.5 py-1 rounded-full">
      <Droplet className="w-3 h-3 fill-rose-400 stroke-none" />
      {type}
    </span>
  );
}

export function StatCard({
  label, value, sub, icon: Icon, trend, trendValue, color, barColor,
}: {
  label: string; value: string; sub: string; icon: React.ElementType;
  trend?: "up" | "down"; trendValue?: string; color: string; barColor: string;
}) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl group transition-all duration-300 hover:bg-neutral-800/80 hover:scale-[1.02] hover:shadow-2xl shadow-black/50">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${color} transition-colors`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter ${trend === "up" ? "text-emerald-400" : "text-rose-400"}`}>
            {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trendValue}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-[10px] text-neutral-500 font-black uppercase tracking-[0.15em]">{label}</p>
        <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
        <p className="text-xs text-neutral-500 font-medium">{sub}</p>
      </div>
      <div className="mt-4 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
        <div className={`h-full ${barColor} rounded-full transition-all duration-1000 ease-out`} style={{ width: trend === "up" ? "75%" : "40%" }} />
      </div>
    </div>
  );
}
export function LowStockAlert() {
  const lowStockQuery = useQuery({
    queryKey: ["inventory", "lowStockAlerts"],
    queryFn: async () => {
      const data = await fetchJsonWithTimeout(`${API_BASE_URL}/api/inventory`);
      if (!Array.isArray(data)) return [];

      return (data as Array<{ blood_group: string; units: number }>).filter((item) => item.units < 10);
    },
  });

  const alerts = lowStockQuery.data ?? [];

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div key={alert.blood_group} className="flex items-center gap-4 bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl animate-in slide-in-from-top-4 duration-500">
          <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0 shadow-lg shadow-rose-600/20 animate-pulse">
            {alert.blood_group}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-black text-rose-500 uppercase tracking-widest">Critical Shortage Detected</h4>
            <p className="text-xs text-rose-500/60 font-bold">Only {alert.units} units remaining in the main reserve.</p>
          </div>
          <div className="px-3 py-1 bg-rose-600 text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-xl shadow-rose-600/20">
            Urgent
          </div>
        </div>
      ))}
    </div>
  );
}
export function RecentActivity() {
  const recentActivityQuery = useQuery({
    queryKey: ["requests", "recentActivity"],
    queryFn: async () => {
      const data = await fetchJsonWithTimeout(`${API_BASE_URL}/api/requests`);
      if (!Array.isArray(data)) return [];

      return (data as Array<{ id: number | string; blood_group: string; location: string; created_at: string; status: string }>)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
    },
  });

  if (recentActivityQuery.isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-neutral-800/50 rounded-2xl w-full" />
        ))}
      </div>
    );
  }

  const activities = recentActivityQuery.data ?? [];

  if (activities.length === 0) {
    return (
    <div className="py-10 text-center opacity-20">
      <p className="text-xs font-black uppercase tracking-widest">No recent activity</p>
    </div>
  );
  }

  return (
    <div className="space-y-4">
      {activities.map((act) => (
        <div key={act.id} className="flex items-center gap-4 group">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-rose-500 font-black text-[10px] group-hover:scale-110 group-hover:border-rose-500/50 transition-all duration-300">
            {act.blood_group}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">New request at {act.location}</p>
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
              {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {act.status}
            </p>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        </div>
      ))}
    </div>
  );
}
