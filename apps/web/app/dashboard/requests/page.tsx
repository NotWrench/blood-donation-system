"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, Clock, CheckCircle, XCircle, Search, MapPin, Building2, TrendingUp, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { StatusBadge, BloodBadge } from "../shared-components";

interface BloodRequest {
  id: number;
  blood_group: string;
  units: number;
  location: string;
  status: string;
  urgency: string;
  created_at: string;
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

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

  const [processingId, setProcessingId] = useState<number | null>(null);

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      setProcessingId(id);
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
    } catch (err: any) {
      console.error('Update error:', err);
      alert(err.message || 'Failed to update request status.');
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = requests
    .filter(r => filter === "all" || r.status === filter)
    .sort((a, b) => {
      const priority: Record<string, number> = { critical: 3, urgent: 2, normal: 1 };
      return (priority[b.urgency] || 0) - (priority[a.urgency] || 0);
    });

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center">
        <Loader2 className="w-12 h-12 text-rose-500 animate-spin mb-4" />
        <p className="text-neutral-400 font-bold uppercase tracking-widest text-sm">Synchronizing request queue...</p>
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
      
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <Link 
            href="/dashboard/requests/new"
            className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
            Post New Request
          </Link>
          
          <div className="flex bg-neutral-900 border border-neutral-800 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto">
            {["all", "pending", "approved", "rejected"].map((f) => {
              const count = f === "all" ? requests.length : requests.filter(r => r.status === f).length;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${filter === f ? 'bg-neutral-800 text-rose-500 shadow-inner' : 'text-neutral-500 hover:text-white'}`}
                >
                  {f}
                  <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${filter === f ? 'bg-rose-500/20 text-rose-500' : 'bg-neutral-800 text-neutral-600'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800/50 px-6 py-4 rounded-3xl hidden lg:block">
          <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-1">Queue Performance</p>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-xl font-black text-white">Live Data</span>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-800/20 border-b border-neutral-800">
                {["Requirement", "Status", "Logistics", "Priority", "Actions"].map(h => (
                   <th key={h} className="text-left text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] px-8 py-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {filtered.length > 0 ? (
                filtered.map((r) => (
                  <tr key={r.id} className={`hover:bg-neutral-800/30 transition-all group ${r.urgency === 'critical' ? 'bg-rose-500/[0.03]' : ''}`}>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-center font-black text-sm text-rose-600 shadow-inner">
                          <BloodBadge type={r.blood_group} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-white">{r.units} Units Required</p>
                          <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest">
                            Posted {new Date(r.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-neutral-400 font-bold text-xs">
                        <MapPin className="w-3.5 h-3.5 text-neutral-600" />
                        {r.location}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${
                           r.urgency === 'critical' ? 'bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 
                           r.urgency === 'urgent' ? 'bg-orange-500' : 'bg-blue-500'
                         }`} />
                         <span className={`text-[10px] font-black uppercase tracking-widest ${
                           r.urgency === 'critical' ? 'text-rose-500' : 
                           r.urgency === 'urgent' ? 'text-orange-500' : 'text-blue-500'
                         }`}>
                           {r.urgency || 'normal'}
                         </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        {r.status === 'pending' ? (
                          <>
                            <button 
                              onClick={() => updateStatus(r.id, 'approved')}
                              disabled={processingId === r.id}
                              className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all shadow-lg disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              {processingId === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4"/>}
                            </button>
                            <button 
                              onClick={() => updateStatus(r.id, 'rejected')}
                              disabled={processingId === r.id}
                              className="p-3 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all shadow-lg disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              {processingId === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4"/>}
                            </button>
                          </>
                        ) : (
                          <div className="text-[10px] font-black text-neutral-600 uppercase tracking-widest border border-neutral-800 px-4 py-2 rounded-xl">
                            Archived
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center opacity-30">
                       <Clock className="w-16 h-16 mb-4" />
                       <p className="text-sm font-black uppercase tracking-widest">No requests in this queue</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
