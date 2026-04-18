"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import RoleGate from "@/components/auth/RoleGate";
import studentScheduleApi from "@/service/studentSchedule.service";

type ScheduleSlot = {
  slotIndex?: number;
  label?: string;
  startTime?: string;
  endTime?: string;
};

type ScheduleItem = {
  studentGeneratedScheduleItemId?: number;
  courseCode?: number;
  courseName?: string;
  sectionIndex?: number;
  sessionType?: string;
  dayIndex?: number;
  startSlot?: number;
  periodCount?: number;
  classroomName?: string;
  professorName?: string;
  isMandatory?: boolean;
};

type StudentSchedule = {
  studentGeneratedScheduleId?: number;
  isBest?: boolean;
  active?: boolean;
  createdAt?: string;
  slots?: ScheduleSlot[];
  items?: ScheduleItem[];
};

type ScheduleHeaderDetail = {
  studentGeneratedScheduleHeaderId?: number;
  name?: string;
  createdAt?: string;
  generatedScheduleId?: string | number;
  schedules?: StudentSchedule[];
  studentPensum?: {
    pensum?: {
      name?: string;
    };
  };
};

const dayColumns = [
  { key: "MONDAY", label: "Lunes", dayIndexes: [0] },
  { key: "TUESDAY", label: "Martes", dayIndexes: [1] },
  { key: "WEDNESDAY", label: "Miércoles", dayIndexes: [0] },
  { key: "THURSDAY", label: "Jueves", dayIndexes: [2] },
  { key: "FRIDAY", label: "Viernes", dayIndexes: [0] },
] as const;

const toPositive = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeHeaderDetail = (response: unknown): ScheduleHeaderDetail | null => {
  if (!response || typeof response !== "object") return null;
  return response as ScheduleHeaderDetail;
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

const buildSlotLabel = (slot: ScheduleSlot): string => {
  if (slot.label) return slot.label;
  if (slot.startTime && slot.endTime) return `${slot.startTime}-${slot.endTime}`;
  return "-";
};

const isItemInSlot = (item: ScheduleItem, slotIndex: number): boolean => {
  const start = toNumber(item.startSlot);
  const periodCount = Math.max(1, toNumber(item.periodCount));
  return slotIndex >= start && slotIndex < start + periodCount;
};

const isItemStartingAtSlot = (item: ScheduleItem, slotIndex: number): boolean => {
  return toNumber(item.startSlot) === slotIndex;
};

export default function StudentGeneratedSchedulePage() {
  const router = useRouter();
  const params = useParams<{ headerId?: string | string[] }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [headerDetail, setHeaderDetail] = useState<ScheduleHeaderDetail | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number>(0);

  const resolvedHeaderId = useMemo(() => {
    const raw = params?.headerId;
    const value = Array.isArray(raw) ? raw[0] : raw;
    return toPositive(value);
  }, [params]);

  useEffect(() => {
    if (!resolvedHeaderId) {
      setError("Header inválido");
      setHeaderDetail(null);
      return;
    }

    let isMounted = true;

    const loadDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await studentScheduleApi.getStudentScheduleHeaderById(resolvedHeaderId);
        if (!isMounted) return;

        const normalized = normalizeHeaderDetail(response);
        if (!normalized) {
          setError("No se pudo interpretar el detalle del horario.");
          setHeaderDetail(null);
          return;
        }

        setHeaderDetail(normalized);
        const schedules = Array.isArray(normalized.schedules) ? normalized.schedules : [];
        const best = schedules.find((schedule) => schedule.isBest);
        const initialId = toPositive(best?.studentGeneratedScheduleId) || toPositive(schedules[0]?.studentGeneratedScheduleId);
        setSelectedScheduleId(initialId);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "No se pudo cargar el detalle del horario");
        setHeaderDetail(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadDetail();

    return () => {
      isMounted = false;
    };
  }, [resolvedHeaderId]);

  const schedules = useMemo(() => {
    return Array.isArray(headerDetail?.schedules) ? headerDetail.schedules : [];
  }, [headerDetail]);

  const selectedSchedule = useMemo(() => {
    return schedules.find((schedule) => toPositive(schedule.studentGeneratedScheduleId) === selectedScheduleId) ?? null;
  }, [schedules, selectedScheduleId]);

  const slots = useMemo(() => {
    return Array.isArray(selectedSchedule?.slots)
      ? [...selectedSchedule.slots].sort((a, b) => toNumber(a.slotIndex) - toNumber(b.slotIndex))
      : [];
  }, [selectedSchedule]);

  const items = useMemo(() => {
    return Array.isArray(selectedSchedule?.items) ? selectedSchedule.items : [];
  }, [selectedSchedule]);

  const getCellItemsForDayAndSlot = (dayIndexGroup: readonly number[], slotIndex: number) => {
    return items.filter((item) => dayIndexGroup.includes(toNumber(item.dayIndex)) && isItemInSlot(item, slotIndex));
  };

  return (
    <RoleGate allowedRoles={["STUDENT", "ESTUDIANTE", "ROLE_STUDENT"]}>
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-white/5 dark:bg-white/3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Horario</p>
              <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                {headerDetail?.name ?? `Header #${resolvedHeaderId}`}
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Creado: {formatDateTime(headerDetail?.createdAt)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/student/horario")}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Volver
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-4 text-sm text-gray-500 shadow-theme-xs dark:bg-gray-900">Cargando detalle...</div>
        ) : error ? (
          <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/10 dark:text-red-400">{error}</div>
        ) : (
          <>
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-white/5 dark:bg-white/3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Opciones de horario</h2>
              {schedules.length === 0 ? (
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Este header no tiene horarios disponibles.</p>
              ) : (
                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {schedules.map((schedule) => {
                    const scheduleId = toPositive(schedule.studentGeneratedScheduleId);
                    const isSelected = scheduleId === selectedScheduleId;

                    return (
                      <button
                        key={scheduleId || String(schedule.createdAt ?? "schedule")}
                        type="button"
                        onClick={() => setSelectedScheduleId(scheduleId)}
                        className={`rounded-2xl border p-4 text-left transition ${
                          isSelected
                            ? "border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-900/20"
                            : "border-gray-200 bg-white hover:border-brand-300 dark:border-gray-700 dark:bg-gray-900/40"
                        }`}
                      >
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Horario #{scheduleId || "-"}</p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Creado: {formatDateTime(schedule.createdAt)}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                          {schedule.isBest ? (
                            <span className="rounded-full bg-success-100 px-2 py-1 font-medium text-success-700 dark:bg-success-900/20 dark:text-success-400">
                              Mejor opción
                            </span>
                          ) : null}
                          {schedule.active ? (
                            <span className="rounded-full bg-blue-100 px-2 py-1 font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                              Activo
                            </span>
                          ) : null}
                          <span className="rounded-full bg-gray-100 px-2 py-1 font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            {Array.isArray(schedule.items) ? schedule.items.length : 0} cursos
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-white/5 dark:bg-white/3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tabla de horario</h2>
              {!selectedSchedule ? (
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Selecciona un horario para ver la tabla.</p>
              ) : slots.length === 0 ? (
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">No hay slots definidos en este horario.</p>
              ) : (
                <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                  <table className="min-w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-900/50">
                        <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-200">
                          Hora
                        </th>
                        {dayColumns.map((day) => (
                          <th
                            key={day.key}
                            className="border-b border-gray-200 px-3 py-2 text-left font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-200"
                          >
                            {day.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {slots.map((slot) => {
                        const slotIndex = toNumber(slot.slotIndex);
                        const slotLabel = buildSlotLabel(slot);

                        return (
                          <tr key={`slot-${slotIndex}`} className="align-top">
                            <td className="border-b border-gray-100 px-3 py-3 text-xs font-medium text-gray-700 dark:border-gray-800 dark:text-gray-300">
                              {slotLabel}
                            </td>
                            {dayColumns.map((day) => {
                              const inCellItems = getCellItemsForDayAndSlot(day.dayIndexes, slotIndex);
                              const startItems = inCellItems.filter((item) => isItemStartingAtSlot(item, slotIndex));
                              const hasContinuingOnly = inCellItems.length > 0 && startItems.length === 0;

                              return (
                                <td
                                  key={`${day.key}-${slotIndex}`}
                                  className="border-b border-gray-100 px-2 py-2 dark:border-gray-800"
                                >
                                  {startItems.length === 0 ? (
                                    hasContinuingOnly ? (
                                      <div className="rounded-md border border-dashed border-brand-200 bg-brand-50/50 px-2 py-1 text-xs text-brand-700 dark:border-brand-800 dark:bg-brand-900/10 dark:text-brand-300">
                                        Continuación
                                      </div>
                                    ) : (
                                      <div className="h-6" />
                                    )
                                  ) : (
                                    <div className="space-y-2">
                                      {startItems.map((item) => {
                                        const sessionType = String(item.sessionType ?? "-");
                                        const courseCode = toPositive(item.courseCode);
                                        const periodCount = Math.max(1, toNumber(item.periodCount));

                                        return (
                                          <div
                                            key={toPositive(item.studentGeneratedScheduleItemId) || `${courseCode}-${slotIndex}-${sessionType}`}
                                            className="rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-900/60"
                                          >
                                            <div className="flex items-start justify-between gap-2">
                                              <p className="text-xs font-semibold text-gray-900 dark:text-white">
                                                {item.courseName ?? "Curso"} ({courseCode || "-"})
                                              </p>
                                              {item.isMandatory ? (
                                                <span
                                                  title="Obligatorio"
                                                  className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-red-500"
                                                />
                                              ) : null}
                                            </div>
                                            <p className="mt-1 text-[11px] text-gray-600 dark:text-gray-300">
                                              {sessionType} · Sección {toNumber(item.sectionIndex) || "-"} · {periodCount} bloque(s)
                                            </p>
                                            <p className="mt-1 text-[11px] text-gray-600 dark:text-gray-300">
                                              {item.classroomName || "Sin salón"}
                                            </p>
                                            <p className="text-[11px] text-gray-600 dark:text-gray-300">
                                              {item.professorName || "Sin docente"}
                                            </p>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </RoleGate>
  );
}
