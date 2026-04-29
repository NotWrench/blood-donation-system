"use client";

import React from "react";
import RoleGuard from "../components/role-guard";
import DashboardLayout from "../dashboard/layout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRole="admin">
      <DashboardLayout>{children}</DashboardLayout>
    </RoleGuard>
  );
}
