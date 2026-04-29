"use client";

import React from "react";
import { CalendarClock, Droplet, MapPin, FileText } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type DonationHistoryItem = {
  id: number;
  blood_group: string;
  units?: number;
  hospital?: string;
  location: string;
  status: string;
  created_at: string;
};

const seededHistory: DonationHistoryItem[] = [
  {
    id: 1001,
    blood_group: "O+",
    units: 1,
    hospital: "City Hospital",
    location: "City Hospital",
    status: "approved",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 1002,
    blood_group: "A+",
    units: 1,
    hospital: "Metro Care",
    location: "Metro Care",
    status: "approved",
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
];

export default function DonorHistoryPage() {
  const [history, setHistory] = React.useState<DonationHistoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchHistory = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const parsed = storedUser ? JSON.parse(storedUser) : null;
        const email = parsed?.email;

        if (!email) {
          setHistory([]);
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/donor/history?email=${encodeURIComponent(email)}`, { 
          cache: "no-store" 
        });
        
        if (!res.ok) throw new Error("Failed to fetch donor history");

        const data = await res.json();
        setHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching history:", err);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-3 duration-500">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">My Donation History</h1>
        <p className="text-neutral-500 font-medium mt-1">Recent fulfilled donation events</p>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-800/20">
                <th className="text-left px-8 py-5 text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Date</th>
                <th className="text-left px-8 py-5 text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Hospital</th>
                <th className="text-left px-8 py-5 text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Blood Group</th>
                <th className="text-left px-8 py-5 text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-800/30 transition-all">
                  <td className="px-8 py-5 text-neutral-400 font-bold text-xs">
                    <span className="inline-flex items-center gap-2">
                      <CalendarClock className="w-4 h-4 text-neutral-500" />
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-neutral-300 font-bold">
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-neutral-500" />
                      {item.hospital || item.location}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="inline-flex items-center gap-2 text-rose-500 font-black">
                      <Droplet className="w-4 h-4" />
                      {item.blood_group}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {history.length === 0 && (
          <div className="py-16 text-center text-neutral-500">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="font-black uppercase tracking-widest text-xs">No history available</p>
          </div>
        )}
      </div>
    </div>
  );
}
