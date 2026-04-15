import type { Metadata } from "next";
import React from "react";
import {
  CalenderIcon,
  FileIcon,
  ListIcon,
  TaskIcon,
  TableIcon,
  UserCircleIcon,
} from "@/icons";
import StripedCard from "@/components/common/StripedCard";

export const metadata: Metadata = {
  title: "Dashboard administrativo",
  description: "Panel académico con métricas y accesos rápidos.",
};

const summaryCards = [
  {
    title: "Módulos académicos",
    value: "7",
    detail: "Secciones activas del panel",
    icon: FileIcon,
    tone: "bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300",
  },
  {
    title: "Procesos de estudiantes",
    value: "3",
    detail: "Historial, notas y gestión",
    icon: UserCircleIcon,
    tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  {
    title: "Operación del ciclo",
    value: "En curso",
    detail: "Período académico vigente",
    icon: CalenderIcon,
    tone: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  },
];

const accessCards = [
  {
    title: "Pensum",
    description: "Configura estructuras curriculares por carrera y los créditos requeridos.",
    href: "/admin/pensum",
    icon: FileIcon,
    tone: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300",
    stripe: "bg-brand-500",
    cta: "Abrir módulo",
  },
  {
    title: "Carreras",
    description: "Mantén actualizado el catálogo de carreras disponibles.",
    href: "/admin/careers",
    icon: ListIcon,
    tone: "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
    stripe: "bg-violet-500",
    cta: "Abrir módulo",
  },
  {
    title: "Cursos",
    description: "Administra la oferta académica y su información principal.",
    href: "/admin/cursos",
    icon: TableIcon,
    tone: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300",
    stripe: "bg-cyan-500",
    cta: "Abrir módulo",
  },
  {
    title: "Áreas de estudio",
    description: "Organiza las áreas académicas para clasificación y reportes.",
    href: "/admin/study-area",
    icon: TableIcon,
    tone: "bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
    stripe: "bg-orange-500",
    cta: "Abrir módulo",
  },
  {
    title: "Relación Pensum-Curso",
    description: "Asocia cursos y áreas dentro de cada estructura de pensum.",
    href: "/admin/pensum-course",
    icon: TaskIcon,
    tone: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    stripe: "bg-amber-500",
    cta: "Abrir módulo",
  },
  {
    title: "Estudiantes",
    description: "Gestiona el registro estudiantil y fecha de ingreso institucional.",
    href: "/admin/estudiantes",
    icon: UserCircleIcon,
    tone: "bg-pink-50 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300",
    stripe: "bg-pink-500",
    cta: "Abrir módulo",
  },
  {
    title: "Historial de alumnos",
    description: "Carga historial académico y valida consistencia de cursos aprobados.",
    href: "/admin/historial-alumnos",
    icon: TaskIcon,
    tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    stripe: "bg-emerald-500",
    cta: "Abrir módulo",
  },
  {
    title: "Agregar notas",
    description: "Registra notas por estudiante con validación académica.",
    href: "/admin/notas",
    icon: TaskIcon,
    tone: "bg-blue-light-50 text-blue-light-700 dark:bg-blue-light-500/15 dark:text-blue-light-300",
    stripe: "bg-blue-light-500",
    cta: "Abrir módulo",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-white/3">
        <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-brand-100/70 blur-2xl dark:bg-brand-500/10" />
        <div className="pointer-events-none absolute -bottom-16 -left-14 h-44 w-44 rounded-full bg-cyan-100/70 blur-2xl dark:bg-cyan-500/10" />

        <div className="relative">
          <p className="text-xs font-semibold tracking-wide text-brand-600">DASHBOARD ACADÉMICO</p>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900 md:text-3xl dark:text-white">
            Centro de control administrativo
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-gray-600 md:text-base dark:text-gray-400">
            Visualiza métricas del ciclo y accede rápidamente a cada módulo de operación académica.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((card) => (
          <article
            key={card.title}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/3"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
                <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">{card.value}</p>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{card.detail}</p>
              </div>
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${card.tone}`}>
                <card.icon className="h-5 w-5" />
              </span>
            </div>
          </article>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Accesos rápidos</h2>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            {accessCards.length} módulos
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
        </div>
      </section>

    </div>
  );
}
