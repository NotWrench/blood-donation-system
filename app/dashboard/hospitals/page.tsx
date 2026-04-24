"use client";

import React, { useState } from "react";
import { Building2, MapPin, History, X, CheckCircle, Activity, Heart, Shield, Search } from "lucide-react";
import { hospitals as initialHospitals, hospitalHistory } from "../constants";
import { StatusBadge } from "../shared-components";

export default function HospitalsPage() {
  const [hospList, setHospList] = useState(initialHospitals);
  const [selectedHosp, setSelectedHosp] = useState<typeof hospList[0] | null>(null);

  const toggleStatus = (id: number) => {
    setHospList(prev => prev.map(h => h.id === id ? { ...h, active: !h.active } : h));
  };

  const currentHistory = hospitalHistory.filter(h => h.hospId === selectedHosp?.id);

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      {/* History Modal */}
      {selectedHosp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-600/10 text-rose-500 rounded-2xl flex items-center justify-center">
                  <History className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="text-xl font-black text-white">Request History</h3>
                   <p className="text-sm text-neutral-500">{selectedHosp.name}</p>
                </div>
              </div>
              <button onClick={() => setSelectedHosp(null)} className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white transition-all"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-8">
              <div className="space-y-4">
                {currentHistory.map(h => (
                  <div key={h.id} className="p-5 rounded-2xl bg-neutral-800/40 border border-neutral-800 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center text-rose-500 font-black text-xs border border-neutral-700">
                         {h.blood}
                       </div>
                       <div>
                         <p className="text-sm font-black text-white">{h.units} Units Required</p>
                         <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">{h.date} · {h.type}</p>
                       </div>
                    </div>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-tighter ${h.status === 'Fulfilled' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-neutral-700 text-neutral-400'}`}>
                      {h.status}
                    </span>
                  </div>
                ))}
                {currentHistory.length === 0 && (
                   <div className="p-12 text-center text-neutral-600 font-bold italic">No history records found for this facility.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hospList.map((h) => (
          <div key={h.id} className={`bg-neutral-900 border rounded-3xl p-8 shadow-xl transition-all group hover:-translate-y-1 ${h.active ? 'border-neutral-800' : 'border-neutral-800/50 opacity-60'}`}>
             <div className="flex items-start justify-between mb-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center relative ${h.active ? 'bg-rose-600/10 text-rose-500' : 'bg-neutral-800 text-neutral-600'}`}>
                   <Building2 className="w-7 h-7" />
                   {h.active && <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 border-4 border-neutral-900 rounded-full animate-pulse" />}
                </div>
                <button 
                  onClick={() => toggleStatus(h.id)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                    h.active 
                    ? 'border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white' 
                    : 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white'
                  }`}
                >
                  {h.active ? 'Revoke Access' : 'Approve Access'}
                </button>
             </div>

             <div className="space-y-1 mb-6">
                <h4 className={`text-lg font-black tracking-tight ${h.active ? 'text-white' : 'text-neutral-500'}`}>{h.name}</h4>
                <p className="text-sm font-bold text-neutral-500 flex items-center gap-2"><MapPin className="w-3.5 h-3.5" />{h.city}</p>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-neutral-800/40 p-4 rounded-2xl border border-neutral-800">
                   <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-1">Capacity</p>
                   <p className="text-sm font-black text-white">{h.beds} Beds</p>
                </div>
                <div className="bg-neutral-800/40 p-4 rounded-2xl border border-neutral-800">
                   <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-1">Impact</p>
                   <p className="text-sm font-black text-white">{h.requests} Requests</p>
                </div>
             </div>

             <div className="flex items-center gap-3">
                <button 
                  disabled={!h.active}
                  onClick={() => setSelectedHosp(h)}
                  className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-black py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 border border-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed group-hover:border-rose-500/50"
                >
                  <History className="w-4 h-4" /> View History
                </button>
                <div className="w-12 h-12 bg-neutral-800 rounded-2xl flex items-center justify-center border border-neutral-700 text-neutral-500 hover:text-white transition-all cursor-pointer">
                   <Shield className="w-5 h-5" />
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
