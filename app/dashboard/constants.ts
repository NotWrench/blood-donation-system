"use client";

import React from "react";
import {
  LayoutDashboard, Users, FileText, Package, Building2, BarChart3,
  Heart, LogOut, Bell, Search, Droplet, TrendingUp, TrendingDown,
  MapPin, Clock, CheckCircle, AlertCircle, XCircle, Menu, X,
  ArrowUpRight, ChevronRight, Activity, Shield, Plus, Minus, Edit2,
  Eye, History,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
export type UserRole = "admin" | "donor" | "hospital";
export type Section = 
  | "dashboard" | "donors" | "requests" | "inventory" | "hospitals" | "analytics"
  | "my-donations" | "profile" | "post-request" | "my-requests";

// ─── Nav Config ──────────────────────────────────────────────────────────────
export const navItems: { id: Section; label: string; path: string; icon: React.ElementType; roles: UserRole[] }[] = [
  { id: "dashboard",    label: "Dashboard",     path: "/dashboard",           icon: LayoutDashboard, roles: ["admin", "donor", "hospital"] },
  { id: "donors",       label: "Donors List",   path: "/dashboard/donors",    icon: Users,           roles: ["admin"] },
  { id: "requests",     label: "All Requests",  path: "/dashboard/requests",  icon: FileText,        roles: ["admin"] },
  { id: "inventory",    label: "Blood Stock",   path: "/dashboard/inventory", icon: Package,         roles: ["admin"] },
  { id: "hospitals",    label: "Hospitals",     path: "/dashboard/hospitals", icon: Building2,       roles: ["admin"] },
  { id: "analytics",    label: "Analytics",     path: "/dashboard/analytics", icon: BarChart3,       roles: ["admin"] },
  
  // Donor specific
  { id: "my-donations", label: "My History",    path: "/dashboard/my-donations", icon: History,         roles: ["donor"] },
  { id: "profile",      label: "My Profile",    path: "/dashboard/profile",      icon: Heart,           roles: ["donor"] },

  // Hospital specific
  { id: "post-request", label: "Post Request",  path: "/dashboard/post-request", icon: Plus,            roles: ["hospital"] },
  { id: "my-requests",  label: "Our Requests",  path: "/dashboard/my-requests",  icon: Activity,        roles: ["hospital"] },
];

// ─── Mock Data ────────────────────────────────────────────────────────────────
// Donors are now fetched dynamically from the API.


export const requests = [
  { id: 1, patient: "Ravi Kumar",    blood: "O−",  hospital: "City Hospital",  city: "Mumbai",    units: 2, urgency: "critical", status: "pending", posted: "20 min ago" },
  { id: 2, patient: "Meera Patel",   blood: "A+",  hospital: "Apollo",         city: "Delhi",     units: 1, urgency: "urgent",   status: "approved", posted: "1 hr ago"   },
  { id: 3, patient: "Suresh Nair",   blood: "B+",  hospital: "Fortis",         city: "Pune",      units: 3, urgency: "normal",   status: "pending", posted: "3 hrs ago"  },
  { id: 4, patient: "Lakshmi Rao",   blood: "AB−", hospital: "AIIMS",          city: "Delhi",     units: 1, urgency: "critical", status: "pending", posted: "45 min ago" },
  { id: 5, patient: "Deepak Nath",   blood: "O+",  hospital: "Manipal",        city: "Bangalore", units: 2, urgency: "urgent",   status: "rejected", posted: "2 hrs ago"  },
  { id: 6, patient: "Sonal Gupta",   blood: "B−",  hospital: "KEM Hospital",   city: "Mumbai",    units: 1, urgency: "normal",   status: "pending", posted: "5 hrs ago"  },
  { id: 7, patient: "Rajesh Varma",  blood: "O−",  hospital: "Global Hosp.",   city: "Chennai",   units: 4, urgency: "critical", status: "pending", posted: "10 min ago" },
  { id: 8, patient: "Anjali Desai",  blood: "A−",  hospital: "Nanavati",       city: "Mumbai",    units: 2, urgency: "urgent",   status: "pending", posted: "30 min ago" },
];

export const inventory = [
  { type: "A+",  units: 142, max: 200 },
  { type: "A−",  units: 38,  max: 100 },
  { type: "B+",  units: 96,  max: 150 },
  { type: "B−",  units: 21,  max: 100 },
  { type: "O+",  units: 178, max: 200 },
  { type: "O−",  units: 12,  max: 100 },
  { type: "AB+", units: 61,  max: 100 },
  { type: "AB−", units: 18,  max: 100 },
];

export const hospitals = [
  { id: 1, name: "City General Hospital", city: "Mumbai",    beds: 450, active: true,  requests: 8,  joined: "12 May 2024" },
  { id: 2, name: "Apollo Hospitals",      city: "Delhi",     beds: 620, active: true,  requests: 5,  joined: "05 Jan 2024" },
  { id: 3, name: "Fortis Healthcare",     city: "Pune",      beds: 380, active: true,  requests: 3,  joined: "22 Aug 2024" },
  { id: 4, name: "AIIMS Delhi",           city: "Delhi",     beds: 900, active: true,  requests: 12, joined: "15 Feb 2023" },
  { id: 5, name: "Manipal Hospital",      city: "Bangalore", beds: 510, active: false, requests: 0,  joined: "10 Oct 2024" },
  { id: 6, name: "KEM Hospital",          city: "Mumbai",    beds: 342, active: true,  requests: 6,  joined: "30 Mar 2024" },
];

export const hospitalHistory = [
  { id: 101, hospId: 1, type: "Request", blood: "O−", units: 2, date: "24 Oct 2025", status: "Fulfilled" },
  { id: 102, hospId: 1, type: "Request", blood: "A+", units: 1, date: "22 Oct 2025", status: "Fulfilled" },
  { id: 103, hospId: 1, type: "Request", blood: "B+", units: 3, date: "15 Oct 2025", status: "Cancelled" },
  { id: 104, hospId: 2, type: "Request", blood: "AB−", units: 1, date: "20 Oct 2025", status: "Fulfilled" },
];
