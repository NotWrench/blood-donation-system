"use client";

import React from "react";
import RoleGuard from "../components/role-guard";
import DashboardLayout from "../dashboard/layout";

export default function DonorLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRole="donor">
      <DashboardLayout>{children}</DashboardLayout>
    </RoleGuard>
  );
}
