"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, Clock, CheckCircle, XCircle, Search, MapPin, Building2, TrendingUp, Plus, Loader2, Check, X } from "lucide-react";
import Link from "next/link";
import { StatusBadge, BloodBadge } from "../../dashboard/shared-components";

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
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/requests');
      if (!res.ok) throw new Error('Failed to fetch requests');
      const data = await res.json();
      setRequests(data);
      setError(null);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError('Failed to connect to request database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      setProcessingId(id);
      setSuccessMessage(null);
      setError(null);
      
      const res = await fetch(`http://localhost:5000/api/requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update status');
      }

      // Update UI instantly
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      
      // Show success message
      const message = newStatus === "approved" ? "Request Approved Successfully!" : "Request Rejected";
      setSuccessMessage(message);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('Update error:', err);
      setError(err.message || 'Failed to update request status.');
    } finally {
      setProcessingId(null);
    }
  };

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
      return (priority[b.urgency] || 0) - (priority[a.urgency] || 0);
    });

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center">
        <Loader2 className="w-12 h-12 text-rose-500 animate-spin mb-4" />
        <p className="text-neutral-400 font-bold uppercase tracking-widest text-sm">Loading request queue...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-rose-500/5 border border-rose-500/10 rounded-[2.5rem]">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h3 className="text-xl font-black text-white mb-2">Connection Error</h3>
        <p className="text-neutral-400 mb-6 max-w-sm font-medium">{error}</p>
        <button onClick={() => fetchRequests()} className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-2xl font-black transition-all shadow-xl shadow-rose-600/20 active:scale-95">Retry Sync</button>
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
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-sm font-bold text-emerald-400">{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
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
                  <MapPin className="w-4 h-4 text-neutral-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-white">{request.location}</p>
                    <p className="text-xs text-neutral-500 font-medium capitalize">{request.urgency} priority</p>
                  </div>
                </div>

                {/* Created At */}
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

                {/* Status Badge */}
                <div>
                  <StatusBadge status={request.status} />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 justify-end">
                  {request.status === "pending" ? (
                    <>
                      <button
                        onClick={() => updateStatus(request.id, "approved")}
                        disabled={processingId === request.id}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                      >
                        {processingId === request.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline">Approve</span>
                      </button>
                      <button
                        onClick={() => updateStatus(request.id, "rejected")}
                        disabled={processingId === request.id}
                        className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-lg shadow-rose-600/20 active:scale-95"
                      >
                        {processingId === request.id ? (
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
