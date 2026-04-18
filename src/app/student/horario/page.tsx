"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RoleGate from "@/components/auth/RoleGate";
import studentScheduleApi from "@/service/studentSchedule.service";

type StudentScheduleHeader = {
  studentGeneratedScheduleHeaderId?: number;
  name?: string;
  generatedScheduleId?: string | number;
  createdAt?: string;
  studentPensum?: {
    pensum?: {
      name?: string;
    };
  };
};

const normalizeHeaders = (response: unknown): StudentScheduleHeader[] => {
  if (Array.isArray(response)) return response as StudentScheduleHeader[];
  if (!response || typeof response !== "object") return [];

  const typed = response as { content?: unknown[]; data?: unknown[]; items?: unknown[]; rows?: unknown[]; results?: unknown[] };
  const candidate = typed.content ?? typed.data ?? typed.items ?? typed.rows ?? typed.results;
  return Array.isArray(candidate) ? (candidate as StudentScheduleHeader[]) : [];
};

const formatDateTime = (value?: string): string => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("es-GT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export default function StudentHorarioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [headers, setHeaders] = useState<StudentScheduleHeader[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadHeaders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await studentScheduleApi.getStudentScheduleHeaders();
        if (!isMounted) return;
        setHeaders(normalizeHeaders(response));
      } catch (err) {
        if (!isMounted) return;
        setHeaders([]);
        setError(err instanceof Error ? err.message : "No se pudieron cargar los horarios generados");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadHeaders();

    return () => {
      isMounted = false;
    };
  }, []);

  const sortedHeaders = useMemo(() => {
    return [...headers].sort((a, b) => {
      const aTime = new Date(a.createdAt ?? "").getTime();
      const bTime = new Date(b.createdAt ?? "").getTime();
      return (Number.isFinite(bTime) ? bTime : 0) - (Number.isFinite(aTime) ? aTime : 0);
    });
  }, [headers]);

  return (
    <RoleGate allowedRoles={["STUDENT", "ESTUDIANTE", "ROLE_STUDENT"]}>
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-white/5 dark:bg-white/3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Estudiante</p>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">Mis horarios generados</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Consulta tus horarios personalizados y abre el detalle de cada propuesta.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-4 text-sm text-gray-500 shadow-theme-xs dark:bg-gray-900">Cargando horarios...</div>
        ) : error ? (
          <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/10 dark:text-red-400">{error}</div>
        ) : sortedHeaders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-white/3 dark:text-gray-400">
            No tienes horarios generados activos.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sortedHeaders.map((header) => {
              const headerId = Number(header.studentGeneratedScheduleHeaderId ?? 0);
              const name = header.name ?? `Horario #${headerId}`;
              const pensumName = header.studentPensum?.pensum?.name ?? "Sin pensum";

              return (
                <article
                  key={headerId || `${name}-${header.createdAt ?? "h"}`}
                  className="rounded-3xl border border-gray-200 bg-white p-5 shadow-theme-sm transition hover:-translate-y-1 hover:shadow-theme-md dark:border-gray-800 dark:bg-white/3"
                >
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{name}</h2>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Pensum: {pensumName}</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Creado: {formatDateTime(header.createdAt)}</p>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => router.push(`/student/horario/${headerId}`)}
                      className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
                    >
                      Ver detalle
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </RoleGate>
  );
}
