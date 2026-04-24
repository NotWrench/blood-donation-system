"use client";

import React, { useState, useEffect } from "react";
import { Droplet, AlertCircle, TrendingUp, TrendingDown, Edit2, Plus, Minus, History, Loader2 } from "lucide-react";

interface InventoryItem {
  id: number;
  blood_group: string;
  units: number;
}

export default function InventoryPage() {
  const [stock, setStock] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/inventory');
      if (!res.ok) throw new Error('Failed to fetch inventory');
      const data = await res.json();
      setStock(data);
      setError(null);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError('Failed to connect to inventory server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const updateUnits = async (group: string, delta: number) => {
    const item = stock.find(s => s.blood_group === group);
    if (!item) return;

    const newUnits = Math.max(0, item.units + delta);
    
    try {
      const res = await fetch(`http://localhost:5000/api/inventory/${encodeURIComponent(group)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ units: newUnits })
      });

      if (!res.ok) throw new Error('Failed to update stock');
      
      setStock(prev => prev.map(s => s.blood_group === group ? { ...s, units: newUnits } : s));
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update stock levels.');
    }
  };

  const getStockStatus = (units: number) => {
    if (units < 10) return { label: 'Low Stock', color: 'text-rose-500', bar: 'bg-rose-500', bg: 'bg-rose-500/5', border: 'border-rose-500/20' };
    if (units <= 20) return { label: 'Medium', color: 'text-amber-500', bar: 'bg-amber-500', bg: 'bg-amber-500/5', border: 'border-amber-500/20' };
    return { label: 'Healthy', color: 'text-emerald-500', bar: 'bg-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20' };
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center">
        <Loader2 className="w-12 h-12 text-rose-500 animate-spin mb-4" />
        <p className="text-neutral-400 font-bold uppercase tracking-widest text-sm">Auditing blood reserves...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-rose-500/5 border border-rose-500/10 rounded-[2.5rem]">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h3 className="text-xl font-black text-white mb-2">Inventory Sync Error</h3>
        <p className="text-neutral-400 mb-6 max-w-sm font-medium">{error}</p>
        <button onClick={() => fetchInventory()} className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-2xl font-black transition-all shadow-xl shadow-rose-600/20 active:scale-95">Retry Audit</button>
      </div>
    );
  }

  const totalUnits = stock.reduce((acc, item) => acc + item.units, 0);
  const criticalGroups = stock.filter(item => item.units < 10).length;

  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-500">
      
      {/* Inventory Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <InventoryStat label="Total Reserves" value={totalUnits.toString()} sub="Total Units" color="text-rose-500" />
        <InventoryStat label="Blood Groups" value={stock.length.toString()} sub="Types Tracked" color="text-blue-500" />
        <InventoryStat label="Critical Alerts" value={criticalGroups.toString()} sub="Low Stock" color="text-amber-500" />
        <InventoryStat label="Last Audit" value="Today" sub={new Date().toLocaleDateString()} color="text-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Stock Grid */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-10 px-2">
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">Inventory Monitor</h3>
              <p className="text-sm text-neutral-500 mt-1 font-medium">Global stock levels across all blood types</p>
            </div>
            <button 
              onClick={fetchInventory}
              className="p-3 rounded-2xl bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white transition-all"
            >
              <History className="w-5 h-5"/>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stock.map((item) => {
              const status = getStockStatus(item.units);
              const progress = Math.min(100, (item.units / 30) * 100); // 30 is our "max" for visualization
              
              return (
                <div key={item.blood_group} className={`p-6 rounded-3xl border transition-all duration-300 ${status.bg} ${status.border} hover:scale-[1.02]`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${item.units < 10 ? 'bg-rose-600 text-white animate-pulse' : 'bg-neutral-950 text-rose-500 border border-neutral-800'}`}>
                        {item.blood_group}
                      </div>
                      <div>
                        <p className="text-2xl font-black text-white leading-none">{item.units} <span className="text-xs text-neutral-500 font-bold uppercase">Units</span></p>
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1 ${status.color}`}>
                          {status.label}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-2xl p-1 gap-1">
                      <button onClick={() => updateUnits(item.blood_group, -1)} className="p-2 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 text-neutral-600 transition-all active:scale-90"><Minus className="w-4 h-4"/></button>
                      <button onClick={() => updateUnits(item.blood_group, 1)} className="p-2 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500 text-neutral-600 transition-all active:scale-90"><Plus className="w-4 h-4"/></button>
                    </div>
                  </div>
                  
                  <div className="h-2 bg-neutral-950 rounded-full overflow-hidden p-[1px]">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${status.bar} shadow-[0_0_10px_rgba(0,0,0,0.5)]`} 
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Alerts */}
        <div className="space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
             <AlertCircle className="absolute -top-10 -right-10 w-40 h-40 text-rose-500/5 rotate-12" />
             <h4 className="text-lg font-black text-white mb-6 relative z-10">Shortage Alerts</h4>
             <div className="space-y-4 relative z-10">
                {stock.filter(s => s.units < 10).map(s => (
                  <div key={s.blood_group} className="flex gap-4 p-5 rounded-3xl bg-rose-500/10 border border-rose-500/20 animate-in slide-in-from-right-4">
                     <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center font-black text-white shrink-0">
                        {s.blood_group}
                     </div>
                     <div>
                       <p className="text-sm font-black text-rose-500">Critical Shortage</p>
                       <p className="text-[10px] text-rose-500/60 font-black uppercase tracking-widest">Only {s.units} units left</p>
                     </div>
                  </div>
                ))}
                {stock.filter(s => s.units < 10).length === 0 && (
                  <div className="text-center py-10 opacity-20">
                     <History className="w-12 h-12 mx-auto mb-2" />
                     <p className="text-xs font-black uppercase tracking-widest">All reserves healthy</p>
                  </div>
                )}
             </div>
          </div>

          <div className="bg-rose-600 rounded-[2.5rem] p-8 shadow-2xl shadow-rose-600/20 text-white">
             <h4 className="text-lg font-black mb-2">Emergency Protocol</h4>
             <p className="text-rose-100 text-sm font-medium leading-relaxed mb-6">
                When stock falls below 10 units, system automatically restricts non-emergency requests for that blood group.
             </p>
             <button className="w-full bg-white text-rose-600 font-black py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-98">
                Request Supply
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function InventoryStat({ label, value, sub, color }: { label: string, value: string, sub: string, color: string }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-[2.25rem] p-6 shadow-xl group hover:border-neutral-700 transition-all">
       <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-1">{label}</p>
       <p className={`text-4xl font-black ${color} mb-1 group-hover:scale-105 transition-transform origin-left tracking-tighter`}>{value}</p>
       <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight">{sub}</p>
    </div>
  );
}
