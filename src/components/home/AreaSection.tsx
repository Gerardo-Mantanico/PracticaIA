"use client";
import React from "react";
import { useCongreso } from "../../hooks/useCongreso";
import { 
  UserIcon, 
  ShootingStarIcon, 
  GroupIcon, 
  BoxIconLine, 
  BoltIcon, 
  GridIcon 
} from "../../icons";

const cardStyles = [
  {
    icon: <UserIcon className="w-7 h-7" />,
    containerClass: "bg-blue-50/80 hover:bg-blue-100/80 border-blue-200 dark:bg-blue-950/30 dark:hover:bg-blue-900/40 dark:border-blue-800",
    iconClass: "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
  },
  {
    icon: <ShootingStarIcon className="w-7 h-7" />,
    containerClass: "bg-purple-50/80 hover:bg-purple-100/80 border-purple-200 dark:bg-purple-950/30 dark:hover:bg-purple-900/40 dark:border-purple-800",
    iconClass: "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400"
  },
  {
    icon: <GroupIcon className="w-7 h-7" />,
    containerClass: "bg-green-50/80 hover:bg-green-100/80 border-green-200 dark:bg-green-950/30 dark:hover:bg-green-900/40 dark:border-green-800",
    iconClass: "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400"
  },
  {
    icon: <BoxIconLine className="w-7 h-7" />,
    containerClass: "bg-orange-50/80 hover:bg-orange-100/80 border-orange-200 dark:bg-orange-950/30 dark:hover:bg-orange-900/40 dark:border-orange-800",
    iconClass: "bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400"
  },
  {
    icon: <BoltIcon className="w-7 h-7" />,
    containerClass: "bg-red-50/80 hover:bg-red-100/80 border-red-200 dark:bg-red-950/30 dark:hover:bg-red-900/40 dark:border-red-800",
    iconClass: "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400"
  },
  {
    icon: <GridIcon className="w-7 h-7" />,
    containerClass: "bg-teal-50/80 hover:bg-teal-100/80 border-teal-200 dark:bg-teal-950/30 dark:hover:bg-teal-900/40 dark:border-teal-800",
    iconClass: "bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400"
  }
];

export default function CongresoSection() {

  const { congresos, loading, error } = useCongreso();
  const hasUnavailableData = Boolean(error) || !congresos || congresos.length === 0;

  const formatDate = (value?: string) => {
    if (!value) return "Sin fecha";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <section id="congresos" className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 lg:py-24">
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400">Cargando congresos...</p>
        </div>
      </section>
    );
  }

  if (hasUnavailableData) {
     return (
      <section id="congresos" className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 lg:py-24">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-theme-sm dark:border-gray-800 dark:bg-white/3 sm:p-10">
          <span className="inline-flex rounded-full bg-brand-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
            Información institucional
          </span>
           <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">
              Congresos
            </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            El catálogo público de congresos no está disponible por ahora. La demo sigue habilitada
            para conocer la experiencia general y el panel administrativo del sistema.
          </p>
        </div>
      </section>
    );
  }

  return (
   <section id="congresos" className="px-4 py-20 bg-white dark:bg-gray-900 sm:px-6 lg:px-8 lg:py-28 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-brand-50/50 blur-3xl dark:bg-brand-900/10"></div>
            <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-50/50 blur-3xl dark:bg-blue-900/10"></div>
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
              Congresos
            </h2>
            <p className="max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-400">
              Explora nuestros congresos disponibles y su información más relevante.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {congresos.map((congreso, index) => {
              const style = cardStyles[index % cardStyles.length];
              return (
                <div
                  key={congreso.id}
                  className={`group relative p-8 transition-all duration-300 border rounded-3xl hover:-translate-y-2 hover:shadow-xl ${style.containerClass}`}
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm ${style.iconClass}`}>
                    {style.icon}
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {congreso.titulo}
                  </h3>
                  <p className="mb-4 text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
                    {congreso.descripcion}
                  </p>

                  <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <p>
                      <span className="font-medium">Ubicación:</span> {congreso.ubicacion || "No definida"}
                    </p>
                    <p>
                      <span className="font-medium">Fecha inicio:</span> {formatDate(congreso.fechaInicio)}
                    </p>
                    <p>
                      <span className="font-medium">Fecha fin:</span> {formatDate(congreso.fechaFin)}
                    </p>
                    <p>
                      <span className="font-medium">Inscripción:</span> ${Number(congreso.precioInscripcion ?? 0).toFixed(2)}
                    </p>
                    <p>
                      <span className="font-medium">Comisión:</span> {Number(congreso.comisionPorcentaje ?? 0)}%
                    </p>
                    <p>
                      <span className="font-medium">Estado:</span> {congreso.activo ? "Activo" : "Inactivo"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
  );
}
