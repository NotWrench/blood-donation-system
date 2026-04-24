"use client";

import React, { useState, useEffect } from "react";
import { Search, MapPin, Eye, X, Droplet, Clock, Phone, Mail, ChevronLeft, ChevronRight, Heart, User, Loader2, AlertCircle } from "lucide-react";
import { StatusBadge, BloodBadge } from "../shared-components";

interface Donor {
  id: number;
  name: string;
  email: string;
  blood_group: string;
  location: string;
  role: string;
  created_at: string;
}

export default function DonorsPage() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [bloodFilter, setBloodFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        setLoading(true);
        console.log("🔄 Fetching donors from API...");
        const res = await fetch('http://localhost:5000/api/users');
        
        if (!res.ok) throw new Error('Failed to fetch donors');
        
        const data: Donor[] = await res.json();
        console.log("✅ API Response received:");
        console.log("📊 Total donors fetched:", data.length);
        console.log("📋 Donor data:", data);

        // Since the API now specifically returns donors, we can directly set the state
        setDonors(data);
        console.log("✅ Donors state updated successfully");
        setError(null);
      } catch (err: any) {
        console.error('❌ Fetch error:', err);
        setError('Failed to connect to donor database.');
      } finally {
        setLoading(false);
      }
    };

    fetchDonors();
  }, []);

  const filtered = donors.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      (d.blood_group || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (d.location || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchBlood = bloodFilter === "All" || d.blood_group === bloodFilter;
    return matchSearch && matchBlood;
  });

  const pageSize = 8;
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center">
        <Loader2 className="w-12 h-12 text-rose-500 animate-spin mb-4" />
        <p className="text-neutral-400 font-bold uppercase tracking-widest text-sm">Retrieving donor records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-rose-500/5 border border-rose-500/10 rounded-3xl">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h3 className="text-xl font-black text-white mb-2">Connection Error</h3>
        <p className="text-neutral-400 mb-6 max-w-sm">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-xl font-bold transition-all">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
      
      {/* Donor Quick View Modal */}
      {selectedDonor && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 pb-0 flex justify-end">
              <button onClick={() => setSelectedDonor(null)} className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white transition-all"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-8 pt-0">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-20 h-20 bg-rose-600 rounded-3xl flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-rose-600/30 mb-4">
                  {selectedDonor.name[0]}
                </div>
                <h3 className="text-2xl font-black text-white leading-tight">{selectedDonor.name}</h3>
                <p className="text-neutral-500 font-medium mb-4">{selectedDonor.email}</p>
                <BloodBadge type={selectedDonor.blood_group} />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8">
                <InfoItem icon={MapPin} label="Location" value={selectedDonor.location || "Not specified"} />
                <InfoItem icon={Clock} label="Joined" value={new Date(selectedDonor.created_at).toLocaleDateString()} />
                <InfoItem icon={User} label="User ID" value={`#${selectedDonor.id}`} />
                <InfoItem icon={Mail} label="Status" value="Verified" />
              </div>
              <button className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-rose-600/20">Send Emergency Alert</button>
            </div>
          </div>
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-neutral-900/50 p-2 rounded-[2rem] border border-neutral-800/50">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-rose-500 transition-colors" />
          <input 
            placeholder="Search donors by name, location..." 
            className="w-full bg-transparent rounded-2xl pl-14 pr-4 py-4 text-sm text-neutral-200 outline-none font-bold placeholder:text-neutral-700"
            value={searchTerm}
            onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
          />
        </div>
        <div className="flex items-center gap-2 p-2">
          <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-2 mr-2 hidden lg:block">Filter by Blood:</span>
          <div className="flex flex-wrap gap-1">
            {["All", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(b => (
              <button
                key={b}
                onClick={() => {setBloodFilter(b); setCurrentPage(1);}}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${bloodFilter === b ? 'bg-rose-600 text-white' : 'bg-neutral-800 text-neutral-500 hover:bg-neutral-700'}`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-[2rem] overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-800/20 border-b border-neutral-800">
                <th className="px-8 py-6 text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Donor Identity</th>
                <th className="px-8 py-6 text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Blood Group</th>
                <th className="px-8 py-6 text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Location</th>
                <th className="px-8 py-6 text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {paginated.length > 0 ? (
                paginated.map((d) => (
                  <tr key={d.id} className="hover:bg-neutral-800/30 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-center font-black text-sm text-rose-500 shadow-inner group-hover:scale-105 group-hover:border-rose-500/50 transition-all duration-300">
                          {d.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white group-hover:text-rose-500 transition-colors">{d.name}</p>
                          <p className="text-xs text-neutral-600 font-bold tracking-tight">{d.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <BloodBadge type={d.blood_group} />
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-neutral-400 font-bold text-xs">
                        <MapPin className="w-3.5 h-3.5 text-neutral-600" />
                        {d.location || "Unknown"}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right sm:text-left">
                      <button 
                        onClick={() => setSelectedDonor(d)}
                        className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-rose-600 text-[10px] font-black uppercase text-neutral-400 hover:text-white transition-all border border-neutral-700 hover:border-rose-500"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center opacity-30">
                       <Search className="w-12 h-12 mb-4" />
                       <p className="text-sm font-black uppercase tracking-widest">No donors found matching criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-8 border-t border-neutral-800 bg-neutral-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs font-black text-neutral-600 uppercase tracking-widest">
              Page <span className="text-white">{currentPage}</span> of <span className="text-white">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white disabled:opacity-20 transition-all"
              >
                <ChevronLeft className="w-5 h-5"/>
              </button>
              <div className="flex gap-1.5 mx-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-rose-600 text-white' : 'bg-neutral-800 text-neutral-500 hover:bg-neutral-700'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white disabled:opacity-20 transition-all"
              >
                <ChevronRight className="w-5 h-5"/>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="bg-neutral-800/40 p-4 rounded-2xl border border-neutral-800/50 flex flex-col items-center text-center">
      <Icon className="w-4 h-4 text-rose-500 mb-2 opacity-50" />
      <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xs font-bold text-white truncate w-full">{value}</p>
    </div>
  );
}
