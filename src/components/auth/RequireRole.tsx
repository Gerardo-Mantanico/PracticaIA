"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getRoleName } from "@/utils/role";

type RequireRoleProps = {
  children: React.ReactNode;
  allowedRoles?: string[];
};

export default function RequireRole({ children, allowedRoles = [] }: RequireRoleProps) {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();
  const roleSource = (currentUser as any)?.role ?? (currentUser as any)?.roleId ?? currentUser;
  const normalizedRole = getRoleName(roleSource).toLowerCase();
  const normalizedAllowed = allowedRoles.map((role) => role.toLowerCase());
  const hasAccess = normalizedAllowed.length === 0 || normalizedAllowed.includes(normalizedRole);

  useEffect(() => {
    if (isLoading) return;

    if (!currentUser) {
      router.push("/signin");
      return;
    }

    if (!hasAccess) {
      router.push("/unauthorized");
    }
  }, [isLoading, currentUser, hasAccess, router]);

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center p-8">
        <div className="text-sm text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (!currentUser || !hasAccess) {
    return null;
  }

  return <>{children}</>;
}
