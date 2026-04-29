"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Droplet, Clock, Activity, TrendingUp, AlertCircle } from "lucide-react";
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

export default function DashboardOverview() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<"admin" | "hospital" | "donor">("donor");
  const [userData, setUserData] = useState<any>(null);
  const [stats, setStats] = useState({
    cardOne: 0,
    cardTwo: 0,
    cardThree: 0,
    cardFour: 0,
  });
  const [ctaLabel, setCtaLabel] = useState("Launch Campaign");
  const [ctaDescription, setCtaDescription] = useState("Broadcast emergency requests to all compatible donors within a 15km radius of the hospital.");
  const [actionLoading, setActionLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const role = (parsed?.role || "donor").toLowerCase();
        setUserRole(role === "admin" || role === "hospital" ? role : "donor");
        setUserData(parsed);
      } catch {
        setUserRole("donor");
      }
    }
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        if (userRole === "admin") {
          const [users, requests] = await Promise.all([
            fetchJsonWithTimeout(`${API_BASE_URL}/api/users`),
            fetchJsonWithTimeout(`${API_BASE_URL}/api/requests`),
          ]);

          const donors = users.filter((u: any) => (u.role || "donor") === "donor").length;
          const hospitals = users.filter((u: any) => (u.role || "donor") === "hospital").length;
          const pending = requests.filter((r: any) => r.status === "pending").length;

          setStats({
            cardOne: donors,
            cardTwo: requests.length,
            cardThree: hospitals,
            cardFour: pending,
          });
          setCtaLabel("Approve / Reject Requests");
          setCtaDescription("Review all incoming requests and update their status from the central admin queue.");
        } else if (userRole === "hospital") {
          const query = new URLSearchParams();
          if (userData?.id) query.set("userId", String(userData.id));
          if (userData?.email) query.set("email", userData.email);
          const queryString = query.toString() ? `?${query.toString()}` : "";

          const hospitalRequests = await fetchJsonWithTimeout(`${API_BASE_URL}/api/hospital/requests${queryString}`);
          const pending = hospitalRequests.filter((r: any) => r.status === "pending").length;
          const approved = hospitalRequests.filter((r: any) => r.status === "approved").length;
          const rejected = hospitalRequests.filter((r: any) => r.status === "rejected").length;

          setStats({
            cardOne: hospitalRequests.length,
            cardTwo: pending,
            cardThree: approved,
            cardFour: rejected,
          });
          setCtaLabel("Create Request");
          setCtaDescription("Create and publish a new blood request for your hospital in just a few clicks.");
        } else {
          const email = userData?.email || "";
          const [availableRequests, donorHistory] = await Promise.all([
            fetchJsonWithTimeout(`${API_BASE_URL}/api/donor/available-requests`),
            email ? fetchJsonWithTimeout(`${API_BASE_URL}/api/donor/history?email=${encodeURIComponent(email)}`) : Promise.resolve([]),
          ]);

          const highPriority = availableRequests.filter((r: any) => r.urgency === "critical" || r.urgency === "high").length;
          
          // Count total donations (all entries in history are fulfilled donations)
          const donationCount = donorHistory.length;

          setStats({
            cardOne: availableRequests.length,
            cardTwo: highPriority,
            cardThree: donationCount,
            cardFour: donorHistory.length,
          });
          setCtaLabel("Donate / Accept Request");
          setCtaDescription("Accept an open request and contribute immediately to a nearby emergency blood requirement.");
        }
        setError(null);
      } catch (err) {
        setError('Could not connect to the backend API. Ensure it is running and reachable.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [userRole, userData?.email, userData?.id]);

  const handlePrimaryAction = async () => {
    if (userRole === "admin") {
      router.push("/admin/requests");
      return;
    }

    if (userRole === "hospital") {
      router.push("/hospital/post-request");
      return;
    }

    setActionLoading(true);
    try {
      const available = await fetchJsonWithTimeout(`${API_BASE_URL}/api/donor/available-requests`);
      if (!Array.isArray(available) || available.length === 0) {
        setError("No pending requests are currently available.");
        return;
      }

      const candidate = available.find((r: any) => r.status === "pending") || available[0];
      const res = await fetch(`${API_BASE_URL}/api/donor/accept-request/${candidate.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userData?.email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to accept request");
      }

      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Failed to accept request");
    } finally {
      setActionLoading(false);
    }
  };

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
             disabled={actionLoading}
             className="w-full bg-white text-rose-600 font-black py-4 rounded-2xl transition-all hover:bg-neutral-100 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
           >
             {actionLoading ? "Processing..." : ctaLabel}
           </button>
        </div>
      </div>

    </div>
  );
}
