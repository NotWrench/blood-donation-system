"use client";

import React from "react";
import RoleGuard from "../components/role-guard";
import DashboardLayout from "../dashboard/layout";

export default function HospitalLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRole="hospital">
      <DashboardLayout>{children}</DashboardLayout>
    </RoleGuard>
  );
}
