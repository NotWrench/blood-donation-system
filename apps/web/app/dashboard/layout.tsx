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
  const [role, setRole] = useState<UserRole>("donor");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const notificationMenuRef = React.useRef<HTMLDivElement | null>(null);

  const [userData, setUserData] = useState<any>(null);

  const dummyNotifications = React.useMemo(
    () => [
      { id: 1, title: "Critical O- request", detail: "City Hospital posted 2 units request", time: "2m ago" },
      { id: 2, title: "Request approved", detail: "Your latest request was approved", time: "18m ago" },
      { id: 3, title: "Inventory updated", detail: "A+ stock was replenished", time: "1h ago" },
    ],
    []
  );

  React.useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    const storedUser = localStorage.getItem("user");
    
    if (loggedIn !== "true" || !storedUser) {
      setIsAuthorized(false);
      setAuthChecked(true);
      router.push("/login");
    } else {
      try {
        const parsedUser = JSON.parse(storedUser);
        const storedRole = (parsedUser?.role || "donor").toLowerCase();
        const normalizedRole: UserRole = storedRole === "admin" || storedRole === "hospital" ? storedRole : "donor";
        parsedUser.role = normalizedRole;
        setRole(normalizedRole);
        setUserData(parsedUser);
        setIsAuthorized(true);
        setAuthChecked(true);
      } catch {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("user");
        setIsAuthorized(false);
        setAuthChecked(true);
        router.push("/login");
      }
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    localStorage.removeItem("userEmail");
    setIsAuthorized(false);
    router.push("/login");
  };

  const handleProfileNavigate = () => {
    const routeByRole: Record<UserRole, string> = {
      donor: "/donor/profile",
      hospital: "/hospital/profile",
      admin: "/admin/profile",
    };

    router.push(routeByRole[role]);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentNav = navItems.filter(item => item.roles.includes(role));

  if (!authChecked || !isAuthorized) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const roleLabels: Record<UserRole, { title: string, color: string }> = {
    admin:    { title: "Central Admin", color: "text-rose-500" },
    donor:    { title: "Universal Donor", color: "text-emerald-500" },
    hospital: { title: "Medical Hub", color: "text-blue-500" },
  };

  // Get user name from userData, fallback to role-based default
  const getUserName = () => {
    if (userData?.name) return userData.name;
    return role === 'admin' ? 'Admin' : role === 'hospital' ? 'Hospital' : 'Donor';
  };

  const userName = getUserName();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex font-sans selection:bg-rose-500/30">

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
            <p className="text-xs font-bold text-neutral-500 mt-0.5 hidden sm:block">Hello {userName}, welcome to your terminal.</p>
          </div>

          {role === 'admin' && (
            <div className="hidden xl:flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-2xl px-5 py-3 w-72 transition-all focus-within:border-rose-500 focus-within:w-80 group">
              <Search className="w-4 h-4 text-neutral-600 group-focus-within:text-rose-500 transition-colors" />
              <input placeholder="Global platform search…" className="bg-transparent text-sm font-bold text-neutral-300 placeholder-neutral-700 outline-none w-full" />
            </div>
          )}

          <div className="flex items-center gap-4">
            <div ref={notificationMenuRef} className="relative">
              <button
                onClick={() => setNotificationsOpen((prev) => !prev)}
                className="relative p-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-700 transition-all group"
                aria-label="Open notifications"
              >
                <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-[3px] border-neutral-950 animate-bounce"></span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-neutral-800">
                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Notifications</p>
                  </div>
                  <div className="max-h-80 overflow-auto">
                    {dummyNotifications.map((item) => (
                      <button
                        key={item.id}
                        className="w-full text-left px-4 py-3 border-b border-neutral-800/60 last:border-b-0 hover:bg-neutral-800/60 transition-colors"
                      >
                        <p className="text-sm font-black text-white">{item.title}</p>
                        <p className="text-xs font-medium text-neutral-400 mt-0.5">{item.detail}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600 mt-2">{item.time}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleProfileNavigate}
              className="hidden sm:flex items-center gap-3 pl-4 border-l border-neutral-800 group cursor-pointer"
              title="Open profile"
            >
              <div className="text-right">
                <p className="text-sm font-black text-white leading-none mb-1 group-hover:text-rose-500 transition-colors">{userName}</p>
                <p className={`text-[10px] uppercase font-black tracking-tighter ${roleLabels[role].color}`}>{roleLabels[role].title}</p>
              </div>
              <div className="w-10 h-10 bg-neutral-800 rounded-2xl flex items-center justify-center border border-neutral-700 group-hover:border-rose-500 transition-all">
                <Users className="w-5 h-5 text-neutral-500 group-hover:text-rose-500" />
              </div>
            </button>
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
