"use client";
import React from "react";
import { useInstituciones } from "../../hooks/useInstituciones";
import { ArrowRightIcon } from "../../icons";

export default function ServicesSection() {
  const { instituciones, loading, error } = useInstituciones();

  if (loading) {
    return (
      <section id="instituciones" className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 lg:py-24">
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400">Cargando instituciones...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="instituciones" className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 lg:py-24">
        <div className="text-center">
          <p className="text-lg text-red-600 dark:text-red-400">Error al cargar instituciones: {error}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="instituciones" className="relative py-20 overflow-hidden bg-white dark:bg-gray-900">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-16 text-center">
          <span className="inline-block px-4 py-1 mb-4 text-sm font-semibold tracking-wider text-brand-600 uppercase bg-brand-50 rounded-full dark:bg-brand-900/20 dark:text-brand-400">
            Nuestras Instituciones
          </span>
          <h2 className="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white leading-tight">
            Instituciones <span className="text-brand-600 dark:text-brand-400">Asociadas</span>
          </h2>
        </div>

        {/* Instituciones Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {instituciones.map((institucion) => (
                <div
                  key={institucion.id}
                  className="group relative flex flex-col bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 p-6"
                >
                  <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white group-hover:text-brand-600 transition-colors">
                    {institucion.nombre}
                  </h3>
                  <div className="flex-1 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    {institucion.descripcion && (
                      <p className="line-clamp-3">{institucion.descripcion}</p>
                    )}
                    {institucion.direccion && (
                      <p><span className="font-medium">Dirección:</span> {institucion.direccion}</p>
                    )}
                    {typeof institucion.activo === "boolean" && (
                      <p>
                        <span className="font-medium">Estado:</span> {institucion.activo ? "Activa" : "Inactiva"}
                      </p>
                    )}
                    {Array.isArray(institucion.imgs) && institucion.imgs.length > 0 && (
                      <p>
                        <span className="font-medium">Recursos:</span> {institucion.imgs.length} imagen(es)
                      </p>
                    )}
                  </div>
                  <div className="mt-4">
                    <span className="inline-flex items-center text-brand-600 font-semibold group-hover:text-brand-800 transition-colors cursor-pointer">
                      Más información
                      <ArrowRightIcon className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
}
