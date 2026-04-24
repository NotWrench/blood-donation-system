"use client";

import React, { useState, useEffect } from "react";
import { Users, Droplet, Clock, Activity, TrendingUp, AlertCircle } from "lucide-react";
import { StatCard, LowStockAlert, RecentActivity } from "./shared-components";

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    totalDonors: 0,
    totalRequests: 0,
    pendingRequests: 0,
    fulfillmentRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [usersRes, requestsRes] = await Promise.all([
          fetch('http://localhost:5000/api/users'),
          fetch('http://localhost:5000/api/requests')
        ]);

        if (!usersRes.ok || !requestsRes.ok) throw new Error('API connection failed');

        const users = await usersRes.json();
        const requests = await requestsRes.json();

        const donors = users.filter((u: any) => u.role === 'donor' || u.role === undefined).length;
        const pending = requests.filter((r: any) => r.status === 'pending').length;
        const fulfilled = requests.filter((r: any) => r.status === 'approved').length;
        const rate = requests.length > 0 ? (fulfilled / requests.length) * 100 : 0;

        setStats({
          totalDonors: donors,
          totalRequests: requests.length,
          pendingRequests: pending,
          fulfillmentRate: Math.round(rate),
        });
        setError(null);
      } catch (err) {
        setError('Could not connect to the database. Please ensure the backend server is active.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center">
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

      {/* Critical Stock Alerts */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-rose-500/10 rounded-lg">
             <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <h2 className="text-xs font-black text-white uppercase tracking-widest">Inventory Vulnerabilities</h2>
        </div>
        <LowStockAlert />
      </section>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Donors" 
          value={stats.totalDonors.toString()} 
          sub="Verified volunteers" 
          icon={Users} 
          trend="up" 
          trendValue="+12%" 
          color="bg-rose-500/10 text-rose-500" 
          barColor="bg-rose-500" 
        />
        <StatCard 
          label="Total Requests" 
          value={stats.totalRequests.toString()} 
          sub="All-time requirements" 
          icon={Droplet} 
          trend="up" 
          trendValue="+5%" 
          color="bg-blue-500/10 text-blue-500" 
          barColor="bg-blue-500" 
        />
        <StatCard 
          label="Pending Queue" 
          value={stats.pendingRequests.toString()} 
          sub="Awaiting fulfillment" 
          icon={Clock} 
          trend="down" 
          trendValue="-2%" 
          color="bg-amber-500/10 text-amber-500" 
          barColor="bg-amber-500" 
        />
        <StatCard 
          label="Fulfillment" 
          value={`${stats.fulfillmentRate}%`} 
          sub="Operational efficiency" 
          icon={Activity} 
          trend="up" 
          trendValue="+8%" 
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
             <h3 className="text-2xl font-black mb-3">Donor Outreach</h3>
             <p className="text-rose-100 text-sm font-medium leading-relaxed">Broadcast emergency requests to all compatible donors within a 15km radius of the hospital.</p>
           </div>
           <button className="w-full bg-white text-rose-600 font-black py-4 rounded-2xl transition-all hover:bg-neutral-100 active:scale-95">Launch Campaign</button>
        </div>
      </div>

    </div>
  );
}
