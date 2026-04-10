import type { Metadata } from "next";
import React from "react";
import RoleGate from "@/components/auth/RoleGate";

export const metadata: Metadata = {
  title: "Perfil de estudiante",
  description: "Datos del perfil del estudiante",
};

export default function StudentProfilePage() {
  return (
    <RoleGate allowedRoles={["STUDENT", "ESTUDIANTE", "ROLE_STUDENT"]}>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-white/3">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Perfil</h1>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          Aquí podrás revisar y editar tu información personal cuando el backend lo permita.
        </p>
      </div>
    </RoleGate>
  );
}