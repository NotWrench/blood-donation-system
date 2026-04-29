"use client";

import React from "react";
import { AlertCircle, Clock, CheckCircle, Search, MapPin, Loader2, Check, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StatusBadge } from "../../dashboard/shared-components";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface BloodRequest {
  id: number;
  blood_group: string;
  units: number;
  location: string;
  status: string;
  urgency: string;
  created_at: string;
}

export default function AdminRequestsPage() {
  const [error, setError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState("all");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const queryClient = useQueryClient();

  const requestsQuery = useQuery<BloodRequest[]>({
    queryKey: ["requests", "all"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/requests`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch requests");
      const data = await res.json();
      return Array.isArray(data) ? (data as BloodRequest[]) : [];
    },
    refetchInterval: 3_000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`${API_BASE_URL}/api/requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to update status");
      return data as BloodRequest;
    },
    onMutate: async ({ id, status }) => {
      setSuccessMessage(null);
      setError(null);

      await queryClient.cancelQueries({ queryKey: ["requests", "all"] });
      const previous = queryClient.getQueryData<BloodRequest[]>(["requests", "all"]);

      queryClient.setQueryData<BloodRequest[]>(["requests", "all"], (current) =>
        (current ?? []).map((r) => (r.id === id ? { ...r, status } : r))
      );

      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(["requests", "all"], context.previous);
      setError(err instanceof Error ? err.message : "Failed to update request status.");
    },
    onSuccess: async (_updated, vars) => {
      const message = vars.status === "approved" ? "Request Approved Successfully!" : "Request Rejected";
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(null), 5000);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["requests", "all"] }),
        queryClient.invalidateQueries({ queryKey: ["donor", "availableRequests"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] }),
        queryClient.invalidateQueries({ queryKey: ["requests", "recentActivity"] }),
      ]);
    },
  });

  const requests = requestsQuery.data ?? [];

  const filtered = requests
    .filter(r => {
      const matchesFilter = filter === "all" || r.status === filter;
      const matchesSearch = searchTerm === "" || 
        r.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.blood_group.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      const priority: Record<string, number> = { critical: 3, high: 2, normal: 1, low: 0 };
      const statusPriority: Record<string, number> = { pending: 3, approved: 2, rejected: 1, fulfilled: 0 };
      const statusDelta = (statusPriority[b.status] ?? 0) - (statusPriority[a.status] ?? 0);
      if (statusDelta !== 0) return statusDelta;

      const urgencyDelta = (priority[b.urgency] || 0) - (priority[a.urgency] || 0);
      if (urgencyDelta !== 0) return urgencyDelta;

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  if (requestsQuery.isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center">
        <Loader2 className="w-12 h-12 text-rose-500 animate-spin mb-4" />
        <p className="text-neutral-400 font-bold uppercase tracking-widest text-sm">Loading request queue...</p>
      </div>
    );
  }

  if (requestsQuery.isError || error) {
    const shownError = error || "Failed to connect to request database.";
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-rose-500/5 border border-rose-500/10 rounded-[2.5rem]">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h3 className="text-xl font-black text-white mb-2">Connection Error</h3>
        <p className="text-neutral-400 mb-6 max-w-sm font-medium">{shownError}</p>
        <button onClick={() => requestsQuery.refetch()} className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-2xl font-black transition-all shadow-xl shadow-rose-600/20 active:scale-95">Retry Sync</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Request Queue</h1>
          <p className="text-neutral-400 font-medium">Review and approve/reject blood requests</p>
        </div>
        <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-2xl">
          <span className="text-xs font-black text-neutral-500 uppercase tracking-widest">Total:</span>
          <span className="text-lg font-black text-white">{requests.length}</span>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-bold text-emerald-400">{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span className="text-sm font-bold text-rose-400">{error}</span>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by location or blood type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 pl-10 pr-4 py-3 rounded-2xl text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500/50 transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "approved", "rejected"].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${
                filter === status
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20"
                  : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-neutral-700"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-neutral-900/50 border border-neutral-800 rounded-3xl">
          <AlertCircle className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-400 font-bold">No requests found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((request) => (
            <div
              key={request.id}
              className="bg-neutral-900 border border-neutral-800 p-4 sm:p-6 rounded-2xl hover:border-neutral-700 transition-all group"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
                {/* Blood Type & Units */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-rose-600/20 rounded-xl flex items-center justify-center border border-rose-500/30">
                    <span className="text-rose-400 font-black text-sm">{request.blood_group}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{request.units} units</p>
                    <p className="text-xs text-neutral-500 font-medium">Blood needed</p>
                  </div>
                </div>

                {/* Location & Urgency */}
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-neutral-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-white">{request.location}</p>
                    <p className="text-xs text-neutral-500 font-medium capitalize">{request.urgency} priority</p>
                  </div>
                </div>

                {/* Created At */}
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-neutral-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-white">
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-neutral-500 font-medium">
                      {new Date(request.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div>
                  <StatusBadge status={request.status} />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 justify-end">
                  {request.status === "pending" ? (
                    <>
                      <button
                        onClick={() => updateStatusMutation.mutate({ id: request.id, status: "approved" })}
                        disabled={updateStatusMutation.isPending}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                      >
                        {updateStatusMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline">Approve</span>
                      </button>
                      <button
                        onClick={() => updateStatusMutation.mutate({ id: request.id, status: "rejected" })}
                        disabled={updateStatusMutation.isPending}
                        className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-lg shadow-rose-600/20 active:scale-95"
                      >
                        {updateStatusMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline">Reject</span>
                      </button>
                    </>
                  ) : (
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                      {request.status === "approved" ? "✓ Approved" : "✗ Rejected"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Footer */}
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
