import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Carga de historial de alumnos",
  description: "Módulo para carga masiva de historial académico.",
};

export default function HistorialAlumnosPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-white/3">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Carga de historial de alumnos</h1>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          Este módulo está reservado para la carga masiva del historial de estudiantes.
        </p>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Criterios de aceptación</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-600 dark:text-gray-400">
          <li>Se debe definir un formato de carga.</li>
          <li>Validar que no existan 2 registros de cursos ganados para el mismo estudiante.</li>
          <li>Crear el registro del estudiante si no existe.</li>
        </ul>
      </section>
    </div>
  );
}