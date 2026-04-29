"use client";

import React from "react";
import { useRouter } from "next/navigation";

type UserRole = "admin" | "donor" | "hospital";

type RoleGuardProps = {
  allowedRole: UserRole;
  children: React.ReactNode;
};

export default function RoleGuard({ allowedRole, children }: RoleGuardProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    const storedUser = localStorage.getItem("user");

    if (loggedIn !== "true" || !storedUser) {
      setAuthorized(false);
      router.replace("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      const role = (parsedUser?.role || "donor").toLowerCase();
      const normalizedRole: UserRole = role === "admin" || role === "hospital" ? role : "donor";

      if (normalizedRole !== allowedRole) {
        setAuthorized(false);
        router.replace("/login");
        return;
      }

      setAuthorized(true);
    } catch {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("user");
      setAuthorized(false);
      router.replace("/login");
    }
  }, [allowedRole, router]);

  if (authorized !== true) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
