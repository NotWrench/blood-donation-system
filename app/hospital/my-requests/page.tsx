"use client";

import React from "react";
import { AlertCircle, Loader2, MapPin, Droplet, Clock, RefreshCw } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type HospitalRequest = {
  id: number;
  blood_group: string;
  units: number;
  location: string;
  status: string;
  urgency: string;
  created_at: string;
};

const seededRequests: HospitalRequest[] = [
  {
    id: 2001,
    blood_group: "O-",
    units: 2,
    location: "City Hospital",
    status: "pending",
    urgency: "critical",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2002,
    blood_group: "A+",
    units: 1,
    location: "City Hospital",
    status: "approved",
    urgency: "normal",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export default function HospitalRequestsPage() {
  const [requests, setRequests] = React.useState<HospitalRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchHospitalRequests = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      const parsed = storedUser ? JSON.parse(storedUser) : null;
      const query = new URLSearchParams();
      if (parsed?.id) query.set("userId", String(parsed.id));
      if (parsed?.email) query.set("email", parsed.email);
      const queryString = query.toString() ? `?${query.toString()}` : "";

      const res = await fetch(`${API_BASE_URL}/api/hospital/requests${queryString}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch hospital requests");

      const data = await res.json();
      setRequests(Array.isArray(data) && data.length > 0 ? data : seededRequests);
      setError(null);
    } catch {
      setRequests(seededRequests);
      setError("Live request feed unavailable. Showing seeded data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    fetchHospitalRequests();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchHospitalRequests();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";
      case "rejected":
        return "bg-rose-500/15 text-rose-400 border border-rose-500/30";
      case "pending":
        return "bg-amber-500/15 text-amber-400 border border-amber-500/30";
      default:
        return "bg-neutral-500/15 text-neutral-400 border border-neutral-500/30";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "bg-rose-500/15 text-rose-400 border border-rose-500/30";
      case "high":
      case "urgent":
        return "bg-orange-500/15 text-orange-400 border border-orange-500/30";
      case "normal":
        return "bg-blue-500/15 text-blue-400 border border-blue-500/30";
      default:
        return "bg-neutral-500/15 text-neutral-400 border border-neutral-500/30";
    }
  };

  if (loading) {
    return (
      <div className="min-h-100 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-rose-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Our Requests</h1>
          <p className="text-neutral-400 font-medium">Track blood requests submitted by your hospital</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-rose-600/20 active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-400">{error}</p>
          </div>
        </div>
      )}

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="text-center py-16 bg-neutral-900/50 border border-neutral-800 rounded-3xl">
          <AlertCircle className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-400 font-bold">No requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl hover:border-neutral-700 transition-all"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
                {/* Blood Type */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-rose-600/20 rounded-xl flex items-center justify-center border border-rose-500/30">
                    <Droplet className="w-6 h-6 text-rose-400 fill-rose-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{request.blood_group}</p>
                    <p className="text-xs text-neutral-500 font-medium">{request.units} units</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-neutral-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-white">{request.location}</p>
                    <p className="text-xs text-neutral-500 font-medium">Hospital location</p>
                  </div>
                </div>

                {/* Created Date */}
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-neutral-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-white">
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-neutral-500 font-medium">
                      {new Date(request.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                {/* Urgency & Status */}
                <div className="flex flex-col gap-2">
                  <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full capitalize text-center ${getUrgencyColor(request.urgency)}`}>
                    {request.urgency}
                  </span>
                  <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full capitalize text-center ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>

                {/* Status Indicator */}
                <div className="text-right">
                  {request.status === "approved" && (
                    <div className="flex items-center justify-end gap-2 text-emerald-400">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                      <span className="text-xs font-bold uppercase tracking-widest">Approved</span>
                    </div>
                  )}
                  {request.status === "rejected" && (
                    <div className="flex items-center justify-end gap-2 text-rose-400">
                      <div className="w-2 h-2 bg-rose-400 rounded-full" />
                      <span className="text-xs font-bold uppercase tracking-widest">Rejected</span>
                    </div>
                  )}
                  {request.status === "pending" && (
                    <div className="flex items-center justify-end gap-2 text-amber-400">
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-widest">Pending</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl">
        <div className="text-center">
          <p className="text-2xl font-black text-amber-400">{requests.filter(r => r.status === "pending").length}</p>
          <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-1">Pending</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-emerald-400">{requests.filter(r => r.status === "approved").length}</p>
          <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-1">Approved</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-rose-400">{requests.filter(r => r.status === "rejected").length}</p>
          <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-1">Rejected</p>
        </div>
      </div>
    </div>
  );
}
