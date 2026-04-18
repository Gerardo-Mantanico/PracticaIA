import type { Metadata } from "next";
import React from "react";
import RoleGate from "@/components/auth/RoleGate";

export const metadata: Metadata = {
  title: "Horario generado",
  description: "Detalle de horario generado del estudiante",
};

interface PageProps {
  params: Promise<{
    headerId: string;
  }> | {
    headerId: string;
  };
}

export default async function StudentGeneratedSchedulePage({ params }: Readonly<PageProps>) {
  const resolvedParams = "then" in params ? await params : params;
  const headerId = Number(resolvedParams.headerId);

  return (
    <RoleGate allowedRoles={["STUDENT", "ESTUDIANTE", "ROLE_STUDENT"]}>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-white/3">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Horario generado</h1>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          Vista pendiente de implementación para el header #{Number.isFinite(headerId) ? headerId : "-"}.
        </p>
      </div>
    </RoleGate>
  );
}
