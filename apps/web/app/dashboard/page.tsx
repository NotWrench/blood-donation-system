"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Users, Droplet, Clock, Activity, AlertCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StatCard, LowStockAlert, RecentActivity } from "./shared-components";

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

type UserRole = "admin" | "hospital" | "donor";
type DashboardStats = {
  cardOne: number;
  cardTwo: number;
  cardThree: number;
  cardFour: number;
};

type UserRecord = {
  id?: number | string;
  email?: string;
  role?: string;
};

type RequestRecord = {
  id?: number | string;
  status?: string;
  urgency?: string;
};

type OverviewData = {
  stats: DashboardStats;
  ctaLabel: string;
  ctaDescription: string;
};

export default function DashboardOverview() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return null;
      try {
        return JSON.parse(storedUser) as UserRecord;
      } catch {
        return null;
      }
    },
    staleTime: Number.POSITIVE_INFINITY,
  });

  const userRole: UserRole = React.useMemo(() => {
    const roleRaw = userQuery.data?.role;
    const role = (typeof roleRaw === "string" ? roleRaw : "donor").toLowerCase();
    return role === "admin" || role === "hospital" ? role : "donor";
  }, [userQuery.data]);

  const userEmail = React.useMemo(() => {
    const email = userQuery.data?.email;
    return typeof email === "string" ? email : "";
  }, [userQuery.data]);

  const userId = React.useMemo(() => {
    const id = userQuery.data?.id;
    return typeof id === "number" || typeof id === "string" ? String(id) : "";
  }, [userQuery.data]);

  const overviewQuery = useQuery<OverviewData>({
    queryKey: ["dashboard", "overview", userRole, userEmail, userId],
    enabled: userQuery.isSuccess,
    queryFn: async () => {
      if (userRole === "admin") {
        const [users, requests] = await Promise.all([
          fetchJsonWithTimeout(`${API_BASE_URL}/api/users`),
          fetchJsonWithTimeout(`${API_BASE_URL}/api/requests`),
        ]);

        const donors = (users as Array<{ role?: string }>).filter((u) => (u.role || "donor") === "donor").length;
        const hospitals = (users as Array<{ role?: string }>).filter((u) => (u.role || "donor") === "hospital").length;
        const pending = (requests as RequestRecord[]).filter((r) => r.status === "pending").length;

        return {
          stats: { cardOne: donors, cardTwo: requests.length, cardThree: hospitals, cardFour: pending },
          ctaLabel: "Approve / Reject Requests",
          ctaDescription: "Review all incoming requests and update their status from the central admin queue.",
        };
      }

      if (userRole === "hospital") {
        const query = new URLSearchParams();
        if (userId) query.set("userId", userId);
        if (userEmail) query.set("email", userEmail);
        const queryString = query.toString() ? `?${query.toString()}` : "";

        const hospitalRequests = await fetchJsonWithTimeout(`${API_BASE_URL}/api/hospital/requests${queryString}`);
        const pending = (hospitalRequests as RequestRecord[]).filter((r) => r.status === "pending").length;
        const approved = (hospitalRequests as RequestRecord[]).filter((r) => r.status === "approved").length;
        const rejected = (hospitalRequests as RequestRecord[]).filter((r) => r.status === "rejected").length;

        return {
          stats: { cardOne: hospitalRequests.length, cardTwo: pending, cardThree: approved, cardFour: rejected },
          ctaLabel: "Create Request",
          ctaDescription: "Create and publish a new blood request for your hospital in just a few clicks.",
        };
      }

      const [availableRequests, donorHistory] = await Promise.all([
        fetchJsonWithTimeout(`${API_BASE_URL}/api/donor/available-requests`),
        userEmail
          ? fetchJsonWithTimeout(`${API_BASE_URL}/api/donor/history?email=${encodeURIComponent(userEmail)}`)
          : Promise.resolve([]),
      ]);

      const highPriority = (availableRequests as RequestRecord[]).filter(
        (r) => r.urgency === "critical" || r.urgency === "high"
      ).length;
      const donationCount = donorHistory.length;

      return {
        stats: {
          cardOne: availableRequests.length,
          cardTwo: highPriority,
          cardThree: donationCount,
          cardFour: donorHistory.length,
        },
        ctaLabel: "Donate / Accept Request",
        ctaDescription: "Accept an open request and contribute immediately to a nearby emergency blood requirement.",
      };
    },
    refetchInterval: 3_000,
  });

  const donorPrimaryActionMutation = useMutation({
    mutationFn: async () => {
      const available = await fetchJsonWithTimeout(`${API_BASE_URL}/api/donor/available-requests`);
      if (!Array.isArray(available) || available.length === 0) throw new Error("No pending requests are currently available.");

      const candidate =
        (available as RequestRecord[]).find((r) => r.status === "pending") ||
        (available as Array<{ id?: number | string }>)[0];
      const res = await fetch(`${API_BASE_URL}/api/donor/accept-request/${candidate.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to accept request");
      return { acceptedRequestId: candidate.id };
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] }),
        queryClient.invalidateQueries({ queryKey: ["donor", "availableRequests"] }),
        queryClient.invalidateQueries({ queryKey: ["donor", "history"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory", "lowStockAlerts"] }),
        queryClient.invalidateQueries({ queryKey: ["requests", "recentActivity"] }),
      ]);
    },
  });

  const handlePrimaryAction = async () => {
    if (userRole === "admin") return void router.push("/admin/requests");
    if (userRole === "hospital") return void router.push("/hospital/post-request");
    await donorPrimaryActionMutation.mutateAsync();
  };

  const loading = userQuery.isLoading || overviewQuery.isLoading;
  const error = overviewQuery.isError
    ? "Could not connect to the backend API. Ensure it is running and reachable."
    : null;

  if (loading) {
    return (
      <div className="min-h-100 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-neutral-500 font-black uppercase tracking-widest text-xs">Loading Metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-500/5 border border-rose-500/10 p-8 rounded-[2.5rem] text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-black text-white mb-2">Connection Error</h2>
        <p className="text-neutral-400 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-rose-600 text-white px-8 py-3 rounded-2xl font-black transition-all hover:bg-rose-700">Retry Connection</button>
      </div>
    );
  }

  const overview = overviewQuery.data;
  const stats = overview?.stats ?? { cardOne: 0, cardTwo: 0, cardThree: 0, cardFour: 0 };
  const ctaLabel = overview?.ctaLabel ?? "Launch Campaign";
  const ctaDescription =
    overview?.ctaDescription ??
    "Broadcast emergency requests to all compatible donors within a 15km radius of the hospital.";

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h4 className="text-rose-500 font-black uppercase tracking-[0.2em] text-[10px] mb-2">Central Management Console</h4>
          <h1 className="text-3xl font-black text-white tracking-tight">System <span className="text-neutral-600">Overview</span></h1>
        </div>
        <div className="flex items-center gap-3 text-neutral-400 text-xs bg-neutral-900 border border-neutral-800 px-5 py-3 rounded-2xl">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="font-bold">System Status: <span className="text-emerald-500">Operational</span></span>
        </div>
      </div>

      {/* Critical stock alerts — hospital inventory view only */}
      {userRole !== "donor" && userRole !== "admin" && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-rose-500/10 rounded-lg">
              <AlertCircle className="w-4 h-4 text-rose-500" />
            </div>
            <h2 className="text-xs font-black text-white uppercase tracking-widest">Inventory Vulnerabilities</h2>
          </div>
          <LowStockAlert />
        </section>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label={userRole === "admin" ? "Total Donors" : userRole === "hospital" ? "My Requests" : "Available Requests"}
          value={stats.cardOne.toString()} 
          sub={userRole === "admin" ? "Verified volunteers" : userRole === "hospital" ? "Created by this hospital" : "Open pending requests"}
          icon={Users} 
          trend="up" 
          trendValue="+12%" 
          color="bg-rose-500/10 text-rose-500" 
          barColor="bg-rose-500" 
        />
        <StatCard 
          label={userRole === "admin" ? "Total Requests" : userRole === "hospital" ? "Pending" : "High Priority"}
          value={stats.cardTwo.toString()} 
          sub={userRole === "admin" ? "All-time requirements" : userRole === "hospital" ? "Awaiting review" : "Critical or high urgency"}
          icon={Droplet} 
          trend="up" 
          trendValue="+5%" 
          color="bg-blue-500/10 text-blue-500" 
          barColor="bg-blue-500" 
        />
        <StatCard 
          label={userRole === "admin" ? "Total Hospitals" : userRole === "hospital" ? "Approved" : "My Donations"}
          value={stats.cardThree.toString()} 
          sub={userRole === "admin" ? "Registered centers" : userRole === "hospital" ? "Approved requests" : "Fulfilled donations"}
          icon={Clock} 
          trend="up" 
          trendValue="+2%" 
          color="bg-amber-500/10 text-amber-500" 
          barColor="bg-amber-500" 
        />
        <StatCard 
          label={userRole === "admin" ? "Pending Queue" : userRole === "hospital" ? "Rejected" : "History Entries"}
          value={userRole === "admin" ? stats.cardFour.toString() : stats.cardFour.toString()} 
          sub={userRole === "admin" ? "Awaiting action" : userRole === "hospital" ? "Rejected requests" : "Total personal responses"}
          icon={Activity} 
          trend="up"
          trendValue="+3%" 
          color="bg-emerald-500/10 text-emerald-500" 
          barColor="bg-emerald-500" 
        />
      </div>

      {/* Operational Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-8 shadow-2xl">
           <div className="flex items-center justify-between mb-8 px-2">
             <h3 className="text-xl font-black text-white">Recent Activity</h3>
             <button className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline transition-all">View All</button>
           </div>
           <RecentActivity />
        </div>
        <div className="bg-rose-600 rounded-[2.5rem] p-8 h-full flex flex-col justify-between shadow-2xl shadow-rose-600/20 text-white group">
           <div>
             <Droplet className="w-10 h-10 mb-6 group-hover:scale-110 transition-transform" />
             <h3 className="text-2xl font-black mb-3">
               {userRole === "admin" ? "Request Moderation" : userRole === "hospital" ? "Hospital Requests" : "Donor Action"}
             </h3>
             <p className="text-rose-100 text-sm font-medium leading-relaxed">{ctaDescription}</p>
           </div>
           <button
             onClick={handlePrimaryAction}
            disabled={donorPrimaryActionMutation.isPending}
             className="w-full bg-white text-rose-600 font-black py-4 rounded-2xl transition-all hover:bg-neutral-100 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
           >
            {donorPrimaryActionMutation.isPending ? "Processing..." : ctaLabel}
           </button>
        </div>
      </div>

    </div>
  );
}
