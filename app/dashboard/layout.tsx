"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart, LogOut, Bell, Search, Menu, X, Users,
} from "lucide-react";
import { navItems, UserRole } from "./constants";

import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("admin");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [userData, setUserData] = useState<any>(null);

  React.useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    const storedUser = localStorage.getItem("user");
    
    if (loggedIn !== "true" || !storedUser) {
      router.push("/login");
    } else {
      setUserData(JSON.parse(storedUser));
      setIsAuthorized(true);
    }
  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    router.push("/login");
  };

  const currentNav = navItems.filter(item => item.roles.includes(role));

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const roleLabels: Record<UserRole, { name: string, title: string, color: string }> = {
    admin:    { name: "Dr. Nishita", title: "Central Admin", color: "text-rose-500" },
    donor:    { name: "Aryan Sharma", title: "Universal Donor", color: "text-emerald-500" },
    hospital: { name: "City Hospital", title: "Medical Hub", color: "text-blue-500" },
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex font-sans selection:bg-rose-500/30">
      
      {/* Role Switcher (For Demo Only) */}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2">
        <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest text-right px-2">Role Preview</p>
        <div className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 p-2 rounded-2xl flex gap-1 shadow-2xl">
          {(["admin", "donor", "hospital"] as UserRole[]).map(r => (
            <button 
              key={r} 
              onClick={() => setRole(r)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                role === r ? "bg-rose-600 text-white" : "text-neutral-500 hover:text-white"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ── Sidebar ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-72 bg-neutral-900/50 backdrop-blur-2xl border-r border-neutral-800 z-40 flex flex-col transition-transform duration-500 ease-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        {/* Logo */}
        <div className="flex items-center justify-between px-8 py-8">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-600/30">
              <Heart className="w-6 h-6 fill-white stroke-none" />
            </div>
            <span className="text-xl font-black tracking-tight">
              Life<span className="text-rose-500">Drops</span>
            </span>
          </Link>
          <button className="lg:hidden text-neutral-500 hover:text-white p-2 rounded-xl bg-neutral-800" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          <div className="px-4 mb-4">
            <p className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em]">{role} operations</p>
          </div>
          {currentNav.map(({ id, label, path, icon: Icon }) => {
            const isActive = pathname === path;
            return (
              <Link
                key={id}
                href={path}
                onClick={() => setSidebarOpen(false)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-black transition-all duration-300 group relative ${
                  isActive
                    ? "bg-rose-600 text-white shadow-xl shadow-rose-600/20 active:scale-95"
                    : "text-neutral-500 hover:bg-neutral-800/80 hover:text-white"
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isActive ? "text-white" : "text-neutral-500 group-hover:scale-110 group-hover:text-rose-500"}`} />
                {label}
                {isActive && <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              </Link>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="px-4 py-8 border-t border-neutral-800 bg-neutral-900/30">
          <div className="flex items-center gap-4 p-4 rounded-3xl bg-neutral-800/40 border border-neutral-700/50">
            <div className="w-11 h-11 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 border border-rose-500/10">
               {userData?.name?.[0] || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-white truncate leading-none mb-1">{userData?.name || 'User'}</p>
              <p className={`text-[10px] font-black uppercase tracking-widest truncate ${roleLabels[role].color}`}>{userData?.role || 'Member'}</p>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-3 mt-4 py-4 rounded-2xl text-xs font-black text-neutral-500 hover:bg-rose-500/5 hover:text-rose-500 border border-transparent hover:border-rose-500/20 transition-all duration-300"
          >
            <LogOut className="w-4 h-4" /> Sign Out from Portal
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">

        {/* Top Navbar */}
        <header className="sticky top-0 z-20 bg-neutral-950/80 backdrop-blur-2xl border-b border-neutral-800 px-8 py-6 flex items-center gap-6">
          <button className="lg:hidden text-neutral-400 hover:text-white p-2.5 rounded-2xl bg-neutral-900 border border-neutral-800" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-white tracking-tight capitalize">
                {pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'}
              </h1>
              <span className={`px-2 py-0.5 rounded-lg bg-neutral-800 text-[10px] font-black uppercase tracking-widest ${roleLabels[role].color}`}>
                {role} Mode
              </span>
            </div>
            <p className="text-xs font-bold text-neutral-500 mt-0.5 hidden sm:block">Hello {roleLabels[role].name}, welcome to your terminal.</p>
          </div>

          {role === 'admin' && (
            <div className="hidden xl:flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-2xl px-5 py-3 w-72 transition-all focus-within:border-rose-500 focus-within:w-80 group">
              <Search className="w-4 h-4 text-neutral-600 group-focus-within:text-rose-500 transition-colors" />
              <input placeholder="Global platform search…" className="bg-transparent text-sm font-bold text-neutral-300 placeholder-neutral-700 outline-none w-full" />
            </div>
          )}

          <div className="flex items-center gap-4">
            <button 
              onClick={handleSignOut}
              className="hidden sm:flex items-center gap-2 p-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-500 hover:text-rose-500 hover:border-rose-500/20 transition-all group"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>

            <button className="relative p-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-700 transition-all group">
              <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-[3px] border-neutral-950 animate-bounce"></span>
            </button>

            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-neutral-800 group cursor-pointer">
              <div className="text-right">
                <p className="text-sm font-black text-white leading-none mb-1 group-hover:text-rose-500 transition-colors">{roleLabels[role].name}</p>
                <p className={`text-[10px] uppercase font-black tracking-tighter ${roleLabels[role].color}`}>{roleLabels[role].title}</p>
              </div>
              <div className="w-10 h-10 bg-neutral-800 rounded-2xl flex items-center justify-center border border-neutral-700 group-hover:border-rose-500 transition-all">
                <Users className="w-5 h-5 text-neutral-500 group-hover:text-rose-500" />
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
