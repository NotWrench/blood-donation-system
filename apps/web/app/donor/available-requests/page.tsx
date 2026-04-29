"use client";

import React from "react";
import { Droplet, MapPin, Clock, AlertCircle, Loader2, Heart, CheckCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type AvailableRequest = {
  id: number;
  blood_group: string;
  units: number;
  location: string;
  status: string;
  urgency: string;
  created_at: string;
};

const seededRequests: AvailableRequest[] = [
  {
    id: 3001,
    blood_group: "O-",
    units: 2,
    location: "City Hospital",
    status: "pending",
    urgency: "critical",
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
];

export default function DonorAvailableRequestsPage() {
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const normalizeBloodGroup = (value: string) => value.trim().toUpperCase().replaceAll(" ", "");

  const queryClient = useQueryClient();

  const donorBloodGroupQuery = useQuery({
    queryKey: ["auth", "user", "blood_group"],
    queryFn: async () => {
      const storedUser = localStorage.getItem("user");
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      const donorBloodGroup: string = parsedUser?.blood_group ?? "";
      const normalizedDonorBloodGroup = donorBloodGroup ? normalizeBloodGroup(donorBloodGroup) : "";

      if (!normalizedDonorBloodGroup) {
        throw new Error("Your donor profile is missing a blood group. Update your profile to see compatible requests.");
      }

      return normalizedDonorBloodGroup;
    },
    staleTime: Number.POSITIVE_INFINITY,
  });

  const availableRequestsQuery = useQuery({
    queryKey: ["donor", "availableRequests", donorBloodGroupQuery.data],
    enabled: donorBloodGroupQuery.isSuccess,
    queryFn: async () => {
      const url = new URL(`${API_BASE_URL}/api/donor/available-requests`);
      url.searchParams.set("blood_group", donorBloodGroupQuery.data ?? "");

      const res = await fetch(url.toString(), { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch available requests");

      const data = await res.json();
      const incoming: AvailableRequest[] = Array.isArray(data) ? data : [];
      const donorGroup = donorBloodGroupQuery.data ?? "";

      const filtered = incoming.filter((req) => normalizeBloodGroup(req.blood_group) === donorGroup);
      return filtered.length > 0
        ? filtered
        : seededRequests.filter((r) => normalizeBloodGroup(r.blood_group) === donorGroup);
    },
    refetchInterval: 3_000,
  });

  React.useEffect(() => {
    if (donorBloodGroupQuery.isError) {
      setError(donorBloodGroupQuery.error instanceof Error ? donorBloodGroupQuery.error.message : "Missing blood group.");
    }
  }, [donorBloodGroupQuery.isError, donorBloodGroupQuery.error]);

  React.useEffect(() => {
    if (availableRequestsQuery.isError) {
      setError("Failed to load available requests. Showing sample data.");
    }
  }, [availableRequestsQuery.isError]);

  const acceptRequestMutation = useMutation({
    mutationFn: async (requestId: number) => {
      const storedUser = localStorage.getItem("user");
      const parsed = storedUser ? JSON.parse(storedUser) : null;
      const email = parsed?.email;

      if (!email) throw new Error("Please log in to accept requests");

      const res = await fetch(`${API_BASE_URL}/api/donor/accept-request/${requestId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to accept request");
      return data;
    },
    onMutate: async (requestId) => {
      setSuccessMessage(null);
      setError(null);

      const donorGroup = donorBloodGroupQuery.data;
      await queryClient.cancelQueries({ queryKey: ["donor", "availableRequests", donorGroup] });

      const previous = queryClient.getQueryData<AvailableRequest[]>(["donor", "availableRequests", donorGroup]);
      queryClient.setQueryData<AvailableRequest[]>(
        ["donor", "availableRequests", donorGroup],
        (current) => (current ?? []).filter((r) => r.id !== requestId)
      );

      return { previous };
    },
    onError: (err, _requestId, context) => {
      if (context?.previous && donorBloodGroupQuery.data) {
        queryClient.setQueryData(["donor", "availableRequests", donorBloodGroupQuery.data], context.previous);
      }

      setError(err instanceof Error ? err.message : "Failed to accept request. Please try again.");
      setTimeout(() => setError(null), 8000);
    },
    onSuccess: async () => {
      setSuccessMessage("Donation Successful! Thank you for saving lives.");
      setTimeout(() => setSuccessMessage(null), 5000);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["donor", "availableRequests"] }),
        queryClient.invalidateQueries({ queryKey: ["donor", "history"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory", "lowStockAlerts"] }),
        queryClient.invalidateQueries({ queryKey: ["requests", "recentActivity"] }),
      ]);
    },
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
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

  if (donorBloodGroupQuery.isLoading || availableRequestsQuery.isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center">
        <Loader2 className="w-12 h-12 text-rose-500 animate-spin mb-4" />
        <p className="text-neutral-400 font-bold uppercase tracking-widest text-sm">Loading available requests...</p>
      </div>
    );
  }

  const requests = availableRequestsQuery.data ?? [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-3 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Available Requests</h1>
          <p className="text-neutral-400 font-medium">Help save lives by accepting blood donation requests</p>
        </div>
        <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-2xl">
          <span className="text-xs font-black text-neutral-500 uppercase tracking-widest">Available:</span>
          <span className="text-lg font-black text-white">{requests.length}</span>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-sm font-bold text-emerald-400">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <p className="text-sm font-bold text-rose-400">{error}</p>
        </div>
      )}

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="text-center py-16 bg-neutral-900/50 border border-neutral-800 rounded-3xl">
          <Heart className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-400 font-bold text-lg mb-2">No requests available</p>
          <p className="text-neutral-500 text-sm">Check back later for new donation opportunities</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl hover:border-neutral-700 transition-all group"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
                {/* Blood Type & Units */}
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-rose-600/20 rounded-xl flex items-center justify-center border border-rose-500/30">
                    <Droplet className="w-7 h-7 text-rose-400 fill-rose-400" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-white">{request.blood_group}</p>
                    <p className="text-xs text-neutral-500 font-medium">{request.units} {request.units === 1 ? 'unit' : 'units'}</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-neutral-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-white">{request.location}</p>
                    <p className="text-xs text-neutral-500 font-medium">Hospital location</p>
                  </div>
                </div>

                {/* Created Date */}
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

                {/* Urgency Badge */}
                <div className="flex items-center">
                  <span className={`text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full capitalize ${getUrgencyColor(request.urgency)}`}>
                    {request.urgency === "critical" && "🚨 "}
                    {request.urgency}
                  </span>
                </div>

                {/* Accept Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => acceptRequestMutation.mutate(request.id)}
                    disabled={acceptRequestMutation.isPending}
                    className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-rose-600/20 active:scale-95"
                  >
                    {acceptRequestMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="hidden sm:inline">Processing...</span>
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4" />
                        <span className="hidden sm:inline">Accept / Donate</span>
                        <span className="sm:hidden">Accept</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-black text-blue-400 mb-2 uppercase tracking-widest">Important Information</h3>
            <ul className="text-xs text-blue-300/80 space-y-1 font-medium">
              <li>• Accepting a request marks it as partially fulfilled</li>
              <li>• The request will be saved in your donation history</li>
              <li>• Blood inventory will be automatically updated</li>
              <li>• Please ensure you meet all donation eligibility criteria</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
