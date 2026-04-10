import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Agregar notas",
  description: "Módulo para registro de notas por estudiante.",
};

export default function NotasPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-white/3">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Agregar notas</h1>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          Este módulo está enfocado en registrar notas por estudiante y reflejar su avance académico.
        </p>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Criterios de aceptación</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-600 dark:text-gray-400">
          <li>Permitir agregar una nota a un estudiante si no ha ganado el curso.</li>
          <li>Mostrar error si el estudiante no cumple requisitos del curso.</li>
          <li>Mostrar error si el estudiante ya superó su límite de cursos.</li>
        </ul>
      </section>
    </div>
  );
}