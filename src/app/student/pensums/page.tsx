"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RoleGate from "@/components/auth/RoleGate";
import Input from "@/components/form/input/InputField";
import { EyeIcon } from "@/icons";
import { studentPensumApi } from "@/service/studentPensum.service";

type StudentPensumItem = {
  id?: number;
  studentPensumId?: number;
  pensumId?: number;
  createdAt?: string;
  pensum?: {
    pensumId?: number;
    name?: string;
    creditsNeeded?: number;
    careerId?: number;
  };
};

const normalizeStudentPensumList = (response: unknown): StudentPensumItem[] => {
  if (Array.isArray(response)) return response as StudentPensumItem[];
  if (!response || typeof response !== "object") return [];

  const typed = response as { content?: unknown[]; data?: unknown[]; items?: unknown[]; rows?: unknown[]; results?: unknown[] };
  const candidate = typed.content ?? typed.data ?? typed.items ?? typed.rows ?? typed.results;
  return Array.isArray(candidate) ? (candidate as StudentPensumItem[]) : [];
};

export default function StudentPensumsPage() {
  const router = useRouter();
  const [items, setItems] = useState<StudentPensumItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadPensums = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await studentPensumApi.getAll();
        if (isMounted) {
          setItems(normalizeStudentPensumList(response));
        }
      } catch (err) {
        if (isMounted) {
          setItems([]);
          setError(err instanceof Error ? err.message : "No se pudieron cargar los pensums del estudiante");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadPensums();

    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return items;

    return items.filter((entry) => {
      const name = String(entry.pensum?.name ?? "").toLowerCase();
      const pensumId = String(Number(entry.pensumId ?? entry.pensum?.pensumId ?? 0));
      return name.includes(normalized) || pensumId.includes(normalized);
    });
  }, [items, searchTerm]);

  return (
    <RoleGate allowedRoles={["STUDENT", "ESTUDIANTE", "ROLE_STUDENT"]}>
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-white/5 dark:bg-white/3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Estudiante</p>
          <h3 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">Mis pensums</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Selecciona un pensum para ver su malla y el estado de tus cursos aprobados/disponibles.
          </p>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1.5fr_0.5fr]">
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar pensum por nombre"
            />
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-300">
              <span className="font-semibold text-gray-900 dark:text-white">{filtered.length}</span> resultados encontrados
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-4 text-sm text-gray-500 shadow-theme-xs dark:bg-gray-900">Cargando pensums...</div>
        ) : error ? (
          <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/10 dark:text-red-400">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-white/3 dark:text-gray-400">
            No se encontraron pensums asignados.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((entry) => {
              const pensumId = Number(entry.pensumId ?? entry.pensum?.pensumId ?? 0);
              const name = entry.pensum?.name || `Pensum ${pensumId}`;
              const creditsNeeded = Number(entry.pensum?.creditsNeeded ?? 0);

              return (
                <article
                  key={entry.studentPensumId ?? `${pensumId}-${entry.createdAt ?? "sp"}`}
                  className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-theme-sm transition hover:-translate-y-1 hover:shadow-theme-md dark:border-gray-800 dark:bg-white/3"
                >
                  <div className="border-b border-gray-100 bg-linear-to-br from-brand-50 to-white p-5 dark:border-gray-800 dark:from-brand-500/15 dark:to-gray-900">
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white">{name}</h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Pensum #{pensumId}</p>
                  </div>

                  <div className="space-y-4 p-5">
                    <div className="rounded-2xl bg-gray-50 p-3 dark:bg-gray-900/60">
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Créditos requeridos</p>
                      <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{creditsNeeded}</p>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => router.push(`/student/pensums/${pensumId}`)}
                        title="Ver detalle"
                        className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/20 dark:hover:text-brand-400"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </div>
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
