import type { Metadata } from "next";
import React from "react";
import StudentGradesTable from "@/components/tables/StudentGradesTable";

export const metadata: Metadata = {
  title: "Mis Calificaciones",
  description: "Vista de calificaciones del estudiante",
};

export default function StudentGradesPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-linear-to-r from-white to-blue-50 p-6 shadow-theme-sm dark:border-gray-800 dark:from-white/3 dark:to-blue-500/5">
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
          Calificaciones
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
          Mis Calificaciones
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Consulta y gestiona tus calificaciones asignadas por los docentes
        </p>
      </section>

      <StudentGradesTable />
    </div>
  );
}
