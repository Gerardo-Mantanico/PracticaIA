"use client";
import React from "react";
import { useConvocatoria } from "../../hooks/useConvocatoria";
import {
  ShootingStarIcon,
  UserIcon,
  GroupIcon,
  BoxIconLine,
  BoltIcon,
  GridIcon,
  TimeIcon,
  CheckCircleIcon,
  CloseLineIcon,
} from "../../icons";

const convocatoriaStyles = [
  {
    icon: <ShootingStarIcon className="w-6 h-6" />,
    bgClass: "bg-indigo-50 dark:bg-indigo-900/20",
    textClass: "text-indigo-600 dark:text-indigo-400",
    borderClass: "border-indigo-100 dark:border-indigo-800",
  },
  {
    icon: <UserIcon className="w-6 h-6" />,
    bgClass: "bg-rose-50 dark:bg-rose-900/20",
    textClass: "text-rose-600 dark:text-rose-400",
    borderClass: "border-rose-100 dark:border-rose-800",
  },
  {
    icon: <GroupIcon className="w-6 h-6" />,
    bgClass: "bg-emerald-50 dark:bg-emerald-900/20",
    textClass: "text-emerald-600 dark:text-emerald-400",
    borderClass: "border-emerald-100 dark:border-emerald-800",
  },
  {
    icon: <BoxIconLine className="w-6 h-6" />,
    bgClass: "bg-amber-50 dark:bg-amber-900/20",
    textClass: "text-amber-600 dark:text-amber-400",
    borderClass: "border-amber-100 dark:border-amber-800",
  },
  {
    icon: <BoltIcon className="w-6 h-6" />,
    bgClass: "bg-cyan-50 dark:bg-cyan-900/20",
    textClass: "text-cyan-600 dark:text-cyan-400",
    borderClass: "border-cyan-100 dark:border-cyan-800",
  },
  {
    icon: <GridIcon className="w-6 h-6" />,
    bgClass: "bg-fuchsia-50 dark:bg-fuchsia-900/20",
    textClass: "text-fuchsia-600 dark:text-fuchsia-400",
    borderClass: "border-fuchsia-100 dark:border-fuchsia-800",
  },
];

const formatDate = (date?: string) => {
  if (!date) return "Sin fecha";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getEstadoLabel = (estado?: boolean | string) => {
  if (typeof estado === "boolean") return estado ? "Activa" : "Inactiva";
  if (typeof estado === "string") {
    const normalized = estado.trim().toLowerCase();
    if (normalized === "activo" || normalized === "activa" || normalized === "true") {
      return "Activa";
    }
    if (normalized === "inactivo" || normalized === "inactiva" || normalized === "false") {
      return "Inactiva";
    }
    return estado;
  }
  return "No definido";
};

const isEstadoActivo = (estado?: boolean | string) => {
  if (typeof estado === "boolean") return estado;
  if (typeof estado === "string") {
    const normalized = estado.trim().toLowerCase();
    return normalized === "activo" || normalized === "activa" || normalized === "true";
  }
  return false;
};

const getCongresoLabel = (congresoRef: unknown) => {
  if (typeof congresoRef === "number" || typeof congresoRef === "string") {
    return String(congresoRef);
  }

  if (congresoRef && typeof congresoRef === "object") {
    const congreso = congresoRef as {
      titulo?: unknown;
      nombre?: unknown;
      id?: unknown;
    };

    if (typeof congreso.titulo === "string" && congreso.titulo.trim()) {
      return congreso.titulo;
    }

    if (typeof congreso.nombre === "string" && congreso.nombre.trim()) {
      return congreso.nombre;
    }

    if (typeof congreso.id === "number" || typeof congreso.id === "string") {
      return `ID ${String(congreso.id)}`;
    }
  }

  return "No disponible";
};

export default function ConvocatoriaSection() {
  const { convocatorias, loading, error } = useConvocatoria();
  const hasUnavailableData = Boolean(error) || !convocatorias || convocatorias.length === 0;

  if (loading) {
    return (
      <section id="convocatorias" className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 lg:py-24">
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400">Cargando convocatorias...</p>
        </div>
      </section>
    );
  }

  if (hasUnavailableData) {
    return (
      <section id="convocatorias" className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 lg:py-24">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-theme-sm dark:border-gray-800 dark:bg-white/3 sm:p-10">
          <span className="inline-flex rounded-full bg-brand-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
            Información pública
          </span>
          <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">
            Convocatorias
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            La sección pública de convocatorias no tiene datos disponibles en este momento. Puedes
            continuar explorando la demo e ingresar al panel administrativo para revisar el flujo
            completo del sistema.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="convocatorias" className="relative px-4 py-16 overflow-hidden bg-gray-50 dark:bg-gray-900 sm:px-6 lg:px-8 lg:py-24">
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        <svg className="w-full h-full" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern-convocatorias" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 40L40 0H20L0 20M40 40V20L20 40" stroke="currentColor" strokeWidth="2" fill="none" className="text-gray-900 dark:text-white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern-convocatorias)" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <span className="inline-block px-4 py-1 mb-4 text-sm font-semibold tracking-wider text-brand-600 uppercase bg-brand-50 rounded-full dark:bg-brand-900/20 dark:text-brand-400">
            Nuestras Convocatorias
          </span>
          <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">
            Oportunidades Disponibles
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
            Revisa las convocatorias vigentes con fechas, estado y el congreso asociado.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {convocatorias.map((convocatoria, index) => {
            const style = convocatoriaStyles[index % convocatoriaStyles.length];
            return (
              <div
                key={convocatoria.id}
                className={`group relative p-8 bg-white dark:bg-gray-800 border rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${style.borderClass}`}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 mb-6 rounded-xl ${style.bgClass} ${style.textClass} group-hover:scale-110 transition-transform duration-300`}>
                  {style.icon}
                </div>

                <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {convocatoria.nombre}
                </h3>

                <p className="mb-4 text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                  {convocatoria.descripcion}
                </p>

                <div className="mb-4">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                      isEstadoActivo(convocatoria.estado)
                        ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {isEstadoActivo(convocatoria.estado) ? (
                      <CheckCircleIcon className="h-4 w-4" />
                    ) : (
                      <CloseLineIcon className="h-4 w-4" />
                    )}
                    {getEstadoLabel(convocatoria.estado)}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <p className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                      <TimeIcon className="h-3.5 w-3.5" />
                    </span>
                    <span><span className="font-medium">Inicio:</span> {formatDate(convocatoria.fechaInicio)}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                      <TimeIcon className="h-3.5 w-3.5" />
                    </span>
                    <span><span className="font-medium">Fin:</span> {formatDate(convocatoria.fechaFin)}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                      <BoxIconLine className="h-3.5 w-3.5" />
                    </span>
                    <span><span className="font-medium">Congreso:</span> {getCongresoLabel(convocatoria.congresoId)}</span>
                  </p>
                </div>

                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity duration-300">
                  <div className={`transform rotate-12 scale-150 ${style.textClass}`}>
                    {style.icon}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}