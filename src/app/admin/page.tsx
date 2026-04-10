import type { Metadata } from "next";
import React from "react";
import {
  FileIcon,
  TaskIcon,
  ListIcon,
  TableIcon,
} from "@/icons";
import StripedCard from "@/components/common/StripedCard";

export const metadata: Metadata = {
  title: "Panel administrativo",
  description: "Administra carga de pensums, historial de alumnos y notas.",
};

const accessCards = [
  {
    title: "Pensum (CRUD)",
    description: "Administra pensums creando, editando y eliminando, asignando carrera y créditos requeridos.",
    href: "/admin/pensum",
    icon: FileIcon,
    tone: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300",
    stripe: "bg-brand-500",
    cta: "Gestionar pensums",
  },
  {
    title: "Career (CRUD)",
    description: "Administra el catálogo de carreras con operaciones de crear, editar y eliminar.",
    href: "/admin/careers",
    icon: ListIcon,
    tone: "bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
    stripe: "bg-purple-500",
    cta: "Gestionar careers",
  },
  {
    title: "Course (CRUD)",
    description: "Administra cursos con operaciones de crear, editar y eliminar registros académicos.",
    href: "/admin/cursos",
    icon: TableIcon,
    tone: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300",
    stripe: "bg-cyan-500",
    cta: "Gestionar courses",
  },
  {
    title: "Study Area (CRUD)",
    description: "Administra áreas de estudio con operaciones de crear, editar y eliminar.",
    href: "/admin/study-area",
    icon: TableIcon,
    tone: "bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
    stripe: "bg-orange-500",
    cta: "Gestionar study areas",
  },
  {
    title: "Pensum-Course (CRUD)",
    description: "Relaciona pensum, curso y área de estudio enviando solo IDs al servidor.",
    href: "/admin/pensum-course",
    icon: TaskIcon,
    tone: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    stripe: "bg-amber-500",
    cta: "Gestionar relaciones",
  },
  {
    title: "Historial de alumnos",
    description: "Importa historial académico y valida duplicados de cursos aprobados por estudiante.",
    href: "/admin/historial-alumnos",
    icon: TaskIcon,
    tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    stripe: "bg-emerald-500",
    cta: "Cargar historial",
  },
  {
    title: "Agregar notas",
    description: "Registra notas por estudiante validando prerrequisitos y límite de cursos.",
    href: "/admin/notas",
    icon: TaskIcon,
    tone: "bg-blue-light-50 text-blue-light-700 dark:bg-blue-light-500/15 dark:text-blue-light-300",
    stripe: "bg-blue-light-500",
    cta: "Registrar notas",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-7">
      <section className="rounded-2xl border border-gray-200 bg-linear-to-r from-white to-brand-50 p-6 shadow-theme-sm dark:border-gray-800 dark:from-white/3 dark:to-brand-500/5">
        <p className="text-sm font-medium text-brand-600">Dashboard</p>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
          Panel administrativo académico
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-gray-600 dark:text-gray-400">
          Este panel incluye los flujos acordados: gestión de pensum/career/course/study area (CRUD),
          carga de historial de alumnos y registro de notas por estudiante.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {accessCards.map((card) => (
          <StripedCard
            key={card.href}
            title={card.title}
            icon={card.icon}
            tone={card.tone}
            stripe={card.stripe}
            href={card.href}
            actionText={card.cta}
          >
            <p>{card.description}</p>
          </StripedCard>
        ))}
      </section>

    </div>
  );
}
