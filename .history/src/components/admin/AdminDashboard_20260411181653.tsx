"use client";

import dynamic from "next/dynamic";
import React from "react";
import type { ApexOptions } from "apexcharts";
import {
  ArrowUpIcon,
  CheckCircleIcon,
  FileIcon,
  GridIcon,
  ListIcon,
  TableIcon,
  TaskIcon,
  UserCircleIcon,
} from "@/icons";
import StripedCard from "@/components/common/StripedCard";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const kpis = [
  {
    title: "Estudiantes activos",
    value: "1,248",
    change: "+12%",
    icon: UserCircleIcon,
    tone: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300",
  },
  {
    title: "Cursos programados",
    value: "84",
    change: "+8%",
    icon: TableIcon,
    tone: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300",
  },
  {
    title: "Procesos en curso",
    value: "16",
    change: "+3",
    icon: TaskIcon,
    tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  {
    title: "Bloques sin asignar",
    value: "5",
    change: "-2",
    icon: CheckCircleIcon,
    tone: "bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  },
];

const accessCards = [
  {
    title: "Pensum",
    description: "Configura la estructura académica por carrera.",
    href: "/admin/pensum",
    icon: FileIcon,
    tone: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300",
    stripe: "bg-brand-500",
  },
  {
    title: "Carreras",
    description: "Mantén actualizado el catálogo institucional.",
    href: "/admin/careers",
    icon: ListIcon,
    tone: "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
    stripe: "bg-violet-500",
  },
  {
    title: "Cursos",
    description: "Gestiona la oferta académica disponible.",
    href: "/admin/cursos",
    icon: TableIcon,
    tone: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300",
    stripe: "bg-cyan-500",
  },
  {
    title: "Estudiantes",
    description: "Accede al registro de estudiantes y su fecha de ingreso.",
    href: "/admin/estudiantes",
    icon: UserCircleIcon,
    tone: "bg-pink-50 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300",
    stripe: "bg-pink-500",
  },
  {
    title: "Historial alumnos",
    description: "Carga el historial y valida duplicados.",
    href: "/admin/historial-alumnos",
    icon: GridIcon,
    tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    stripe: "bg-emerald-500",
  },
  {
    title: "Agregar notas",
    description: "Registra calificaciones con validación académica.",
    href: "/admin/notas",
    icon: TaskIcon,
    tone: "bg-blue-light-50 text-blue-light-700 dark:bg-blue-light-500/15 dark:text-blue-light-300",
    stripe: "bg-blue-light-500",
  },
];

const trendSeries = [
  {
    name: "Actividad",
    data: [18, 24, 22, 31, 27, 39, 45],
  },
];

const trendOptions: ApexOptions = {
  chart: {
    type: "area",
    toolbar: { show: false },
    sparkline: { enabled: false },
    fontFamily: "inherit",
    foreColor: "#667085",
    zoom: { enabled: false },
  },
  stroke: {
    curve: "smooth",
    width: 3,
  },
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 0.6,
      opacityFrom: 0.35,
      opacityTo: 0.05,
      stops: [0, 90, 100],
    },
  },
  grid: {
    borderColor: "#E4E7EC",
    strokeDashArray: 4,
  },
  colors: ["#465FFF"],
  dataLabels: { enabled: false },
  xaxis: {
    categories: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      formatter: (value) => String(Math.round(value)),
    },
  },
  tooltip: {
    theme: "light",
    y: {
      formatter: (value) => `${value} acciones`,
    },
  },
};

const mixSeries = [48, 29, 23];

const mixOptions: ApexOptions = {
  chart: {
    type: "donut",
    fontFamily: "inherit",
  },
  labels: ["Académico", "Administrativo", "Operativo"],
  colors: ["#465FFF", "#0BA5EC", "#12B76A"],
  dataLabels: { enabled: false },
  legend: {
    position: "bottom",
    horizontalAlign: "center",
    fontSize: "13px",
    markers: { width: 10, height: 10, radius: 999 },
  },
  stroke: {
    width: 0,
  },
  plotOptions: {
    pie: {
      donut: {
        size: "72%",
        labels: {
          show: true,
          name: { show: true },
          value: {
            show: true,
            formatter: (value) => `${value}%`,
          },
          total: {
            show: true,
            label: "Distribución",
            formatter: () => "100%",
          },
        },
      },
    },
  },
  tooltip: {
    y: {
      formatter: (value) => `${value}%`,
    },
  },
};

const actionItems = [
  "Revisa pensums y carga las estructuras activas.",
  "Verifica estudiantes y su fecha de ingreso.",
  "Confirma horarios y cursos antes de publicar.",
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-900 p-6 shadow-theme-lg dark:border-white/5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(70,95,255,0.35),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(18,183,106,0.22),transparent_28%)]" />
        <div className="relative grid gap-8 xl:grid-cols-[1.6fr_1fr] xl:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-success-400" />
              Panel en tiempo real
            </div>
            <h1 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
              Un dashboard que se ve serio, moderno y útil.
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-gray-300 md:text-base">
              Resume la operación académica con métricas, gráficos y accesos directos para que la gente encuentre rápido lo que necesita.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white">
                <ArrowUpIcon className="h-4 w-4 text-success-400" />
                +18% actividad esta semana
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white">
                <CheckCircleIcon className="h-4 w-4 text-success-400" />
                7 módulos listos para operar
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {[
              { label: "Última actualización", value: "Hoy, 08:15" },
              { label: "Estado del sistema", value: "Estable" },
              { label: "Acciones pendientes", value: "5" },
              { label: "Usuarios conectados", value: "24" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-gray-300">{item.label}</p>
                <p className="mt-2 text-xl font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => (
          <article key={item.title} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-white/3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.title}</p>
                <p className="mt-3 text-3xl font-semibold text-gray-900 dark:text-white">{item.value}</p>
              </div>
              <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${item.tone}`}>
                <item.icon className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-success-600 dark:text-success-400">
              <ArrowUpIcon className="h-4 w-4" />
              {item.change} vs. periodo anterior
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-white/3">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tendencia semanal</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Actividad general del panel durante los últimos 7 días.</p>
            </div>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
              +18% crecimiento
            </span>
          </div>

          <Chart options={trendOptions} series={trendSeries} type="area" height={300} />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-white/3">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Distribución del trabajo</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Balance entre tareas académicas, administrativas y operativas.</p>
          </div>

          <Chart options={mixOptions} series={mixSeries} type="donut" height={300} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
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
                actionText="Abrir módulo"
              >
                <p>{card.description}</p>
              </StripedCard>
            ))}
          </div>
        </div>

        <aside className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-white/3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Enfoque del día</h2>
          <div className="mt-4 space-y-3">
            {actionItems.map((item, index) => (
              <div key={item} className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900/60">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white">
                  {index + 1}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{item}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}