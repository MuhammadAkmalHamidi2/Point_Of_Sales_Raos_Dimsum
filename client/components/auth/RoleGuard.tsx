"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";

type RoleGuardProps = {
  children: React.ReactNode;
  allowedRoles: string[];
};

function redirectForRole(role: string | undefined, pathname: string) {
  if ((role === "admin" || role === "master") && !pathname.startsWith("/admin")) {
    return "/admin";
  }

  if (role === "kasir" && !pathname.startsWith("/kasir")) {
    return "/kasir";
  }

  return "/login";
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const validateSession = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await api.get("/api/auth/me");
        const role = response.data?.data?.Role?.role;

        if (!allowedRoles.includes(role)) {
          router.replace(redirectForRole(role, pathname));
          return;
        }

        if (!cancelled) setIsChecking(false);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("outletId");
        router.replace("/login");
      }
    };

    void validateSession();
    return () => {
      cancelled = true;
    };
  }, [allowedRoles, pathname, router]);

  if (isChecking) return null;
  return <>{children}</>;
}
