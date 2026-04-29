"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, LineChart, Line, Cell
} from 'recharts';
import { BarChart3, Activity, Droplet, TrendingUp, Loader2 } from "lucide-react";

interface BloodRequest {
  id: number;
  blood_group: string;
  units: number;
  created_at: string;
  status: string;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [distribution, setDistribution] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:5000/api/requests');
        if (!res.ok) throw new Error('Failed to fetch requests');
        const json: BloodRequest[] = await res.json();
        setData(json);

        // Process Distribution
        const distMap: Record<string, number> = {};
        json.forEach(r => {
          distMap[r.blood_group] = (distMap[r.blood_group] || 0) + 1;
        });
        const distArray = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(type => ({
          type,
          count: distMap[type] || 0
        }));
        setDistribution(distArray);

        // Process Timeline (Strictly last 7 days)
        const timelineData: any[] = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(today.getDate() - i);
          const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
          const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          
          const count = json.filter(r => {
            const rDate = new Date(r.created_at).toISOString().split('T')[0];
            return rDate === dateStr;
          }).length;

          timelineData.push({ day: label, requests: count });
        }
        setTimeline(timelineData);

      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center">
        <Loader2 className="w-12 h-12 text-rose-500 animate-spin mb-4" />
        <p className="text-neutral-400 font-bold uppercase tracking-widest text-sm">Processing clinical data...</p>
      </div>
    );
  }

  if (data.length === 0 && !loading) {
     return (
       <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-neutral-900 border border-neutral-800 rounded-[2.5rem]">
         <BarChart3 className="w-12 h-12 text-neutral-700 mb-4" />
         <h3 className="text-xl font-black text-white mb-2">Insufficient Data</h3>
         <p className="text-neutral-500 mb-6 max-w-sm font-medium">Analytics will be available once the system processes its first set of blood requests.</p>
         <Link href="/dashboard/requests/new" className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-2xl font-black transition-all">Post First Request</Link>
       </div>
     );
  }

  const COLORS = ['#F43F5E', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#14B8A6'];

  return (
    <div className="space-y-8 animate-in slide-in-from-top-4 duration-700">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard label="Live Demand" value={data.length.toString()} icon={Activity} sub="Active blood requests" />
        <StatCard label="Most Requested" value={distribution.reduce((a, b) => a.count > b.count ? a : b).type} icon={Droplet} sub="Critical requirement" />
        <StatCard label="Avg Daily Load" value={(data.length / 7).toFixed(1)} icon={TrendingUp} sub="Past week average" />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Blood Group Distribution Bar Chart */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-10 px-2">
            <div>
              <h4 className="text-xl font-black text-white tracking-tight">Demand Distribution</h4>
              <p className="text-sm text-neutral-500 mt-1 font-medium">Frequency by blood group</p>
            </div>
            <div className="p-3 bg-rose-600/10 rounded-2xl">
              <BarChart3 className="w-6 h-6 text-rose-500" />
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="type" stroke="#737373" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#737373" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: '16px' }}
                  cursor={{ fill: '#262626' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40}>
                  {distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Request Timeline Area Chart */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-10 px-2">
            <div>
              <h4 className="text-xl font-black text-white tracking-tight">Requirement Intensity</h4>
              <p className="text-sm text-neutral-500 mt-1 font-medium">Daily request volume (7d)</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline}>
                <defs>
                  <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="day" stroke="#737373" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#737373" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: '16px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="requests" 
                  stroke="#3B82F6" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorReq)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon }: { label: string, value: string, sub: string, icon: any }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-8 group transition-all hover:bg-neutral-800/80 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] text-neutral-500 font-black uppercase tracking-[0.2em]">{label}</p>
        <Icon className="w-5 h-5 text-neutral-700 group-hover:text-rose-500 transition-colors" />
      </div>
      <div className="space-y-1">
        <p className="text-4xl font-black text-white leading-none tracking-tighter">{value}</p>
        <p className="text-xs text-neutral-600 font-bold">{sub}</p>
      </div>
    </div>
  );
}
