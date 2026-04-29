"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Droplet, 
  MapPin, 
  PlusCircle, 
  ArrowLeft, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Syringe,
  Info,
  Clock
} from "lucide-react";

export default function NewRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    blood_group: "O+",
    units: 1,
    location: "",
    urgency: "normal",
  });

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/dashboard/requests");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:5000/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Failed to submit request. Please check your connection.");
      }

      setSuccess(true);
      setFormData({ blood_group: "O+", units: 1, location: "", urgency: "normal" }); // Reset form
      
      // Redirect back after a short delay
      setTimeout(() => {
        router.push("/dashboard/requests");
      }, 2000);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'units' ? parseInt(value) || 0 : value 
    }));
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <button
        type="button"
        onClick={handleGoBack}
        className="inline-flex items-center gap-2 text-neutral-500 hover:text-rose-500 transition-colors mb-8 font-bold text-sm group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Requests
      </button>

      <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        {/* Success Overlay */}
        {success && (
          <div className="absolute inset-0 z-50 bg-neutral-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/20">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Request Posted!</h2>
            <p className="text-neutral-400 font-medium">Your emergency blood request has been broadcasted to nearby donors.</p>
          </div>
        )}

        <div className="p-8 md:p-12">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 bg-rose-600/10 border border-rose-500/20 rounded-2xl flex items-center justify-center">
              <PlusCircle className="w-7 h-7 text-rose-500" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Post Blood Request</h1>
              <p className="text-neutral-500 text-sm font-medium">Fill in the details for the emergency requirement</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Blood Group */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">Blood Type Needed</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-rose-500 transition-colors">
                  <Droplet className="w-5 h-5" />
                </div>
                <select 
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleChange}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl pl-14 pr-5 py-4 text-white outline-none focus:border-rose-500 transition-all font-bold appearance-none cursor-pointer"
                >
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Units & Location & Urgency */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-3">
                 <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">Units (Pints)</label>
                 <div className="relative group">
                   <div className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-rose-500 transition-colors">
                     <Syringe className="w-5 h-5" />
                   </div>
                   <input 
                    type="number"
                    name="units"
                    min="1"
                    max="10"
                    value={formData.units}
                    onChange={handleChange}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl pl-14 pr-5 py-4 text-white outline-none focus:border-rose-500 transition-all font-bold"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">Urgency Level</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-rose-500 transition-colors">
                    <Clock className="w-5 h-5" />
                  </div>
                  <select 
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleChange}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl pl-14 pr-5 py-4 text-white outline-none focus:border-rose-500 transition-all font-bold appearance-none cursor-pointer"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">Location / Hospital</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-rose-500 transition-colors">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <input 
                    type="text"
                    name="location"
                    required
                    placeholder="e.g. City Hospital, Wing B"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl pl-14 pr-5 py-4 text-white outline-none focus:border-rose-500 transition-all font-bold placeholder:text-neutral-700"
                  />
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-2xl flex gap-4 items-start">
               <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
               <p className="text-xs text-blue-400/80 leading-relaxed font-medium">
                  Requests are broadcasted immediately to all verified donors in the specified location. Please ensure the hospital details are accurate.
               </p>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-500 text-sm font-bold animate-shake">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-rose-800 disabled:cursor-not-allowed text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-rose-600/30 flex items-center justify-center gap-3 active:scale-[0.98] group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Broadcasting Request...
                </>
              ) : (
                <>
                  Broadcast Emergency Request
                  <PlusCircle className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
