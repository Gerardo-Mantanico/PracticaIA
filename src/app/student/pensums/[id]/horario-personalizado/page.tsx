"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import RoleGate from "@/components/auth/RoleGate";
import Input from "@/components/form/input/InputField";
import studentScheduleApi from "@/service/studentSchedule.service";

type ClassScheduleItem = {
  generatedScheduleId?: string | number;
  name?: string;
  status?: string;
  active?: boolean;
};

type AssignableCourseItem = {
  pensumCourseId?: number;
  courseCode?: number;
  credits?: number;
  semester?: number;
  course?: {
    courseCode?: number;
    name?: string;
  };
};

type AssignableCoursesResponse = {
  studentPensumId?: number;
  assignableCourses?: AssignableCourseItem[];
};

const parsePositiveNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const normalizeClassSchedules = (response: unknown): ClassScheduleItem[] => {
  if (Array.isArray(response)) return response as ClassScheduleItem[];
  if (!response || typeof response !== "object") return [];

  const typed = response as { content?: unknown[]; data?: unknown[]; items?: unknown[]; rows?: unknown[]; results?: unknown[] };
  const candidate = typed.content ?? typed.data ?? typed.items ?? typed.rows ?? typed.results;
  return Array.isArray(candidate) ? (candidate as ClassScheduleItem[]) : [];
};

const normalizeAssignableCoursesResponse = (response: unknown): AssignableCoursesResponse => {
  if (!response || typeof response !== "object") {
    return {
      studentPensumId: 0,
      assignableCourses: [],
    };
  }

  const typed = response as AssignableCoursesResponse;
  return {
    studentPensumId: parsePositiveNumber(typed.studentPensumId),
    assignableCourses: Array.isArray(typed.assignableCourses) ? typed.assignableCourses : [],
  };
};

export default function PersonalizedSchedulePage() {
  const router = useRouter();
  const params = useParams<{ id?: string | string[] }>();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [classSchedules, setClassSchedules] = useState<ClassScheduleItem[]>([]);
  const [selectedGeneratedScheduleId, setSelectedGeneratedScheduleId] = useState<string>("");

  const [studentPensumId, setStudentPensumId] = useState<number>(0);
  const [assignableCourses, setAssignableCourses] = useState<AssignableCourseItem[]>([]);
  const [selectedCourseCodeToAdd, setSelectedCourseCodeToAdd] = useState<string>("");
  const [selectedCourses, setSelectedCourses] = useState<AssignableCourseItem[]>([]);

  const [scheduleName, setScheduleName] = useState("");

  const resolvedPensumId = useMemo(() => {
    const rawParam = params?.id;
    const value = Array.isArray(rawParam) ? rawParam[0] : rawParam;
    return parsePositiveNumber(value);
  }, [params]);

  const schedulesBaseUrl = String(
    process.env.NEXT_PUBLIC_SCHEDULE_CLASS_URL ??
      process.env.NEXT_PUBLIC_SCHEDULES_URL ??
      "http://localhost:8080"
  ).replace(/\/$/, "");

  const selectedSchedulePreviewUrl = useMemo(() => {
    if (!schedulesBaseUrl || !selectedGeneratedScheduleId) return "";
    return `${schedulesBaseUrl}/embebed/horarios/${selectedGeneratedScheduleId}`;
  }, [schedulesBaseUrl, selectedGeneratedScheduleId]);

  const availableToAddCourses = useMemo(() => {
    const selectedCodes = new Set(
      selectedCourses
        .map((course) => parsePositiveNumber(course.courseCode ?? course.course?.courseCode))
        .filter((code) => code > 0)
    );

    return assignableCourses.filter((course) => {
      const courseCode = parsePositiveNumber(course.courseCode ?? course.course?.courseCode);
      return courseCode > 0 && !selectedCodes.has(courseCode);
    });
  }, [assignableCourses, selectedCourses]);

  useEffect(() => {
    if (resolvedPensumId <= 0) {
      setError("ID de pensum inválido");
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [schedulesResponse, assignableResponse] = await Promise.all([
          studentScheduleApi.getClassSchedules(),
          studentScheduleApi.getAssignableCourses(resolvedPensumId),
        ]);

        if (!isMounted) return;

        const normalizedSchedules = normalizeClassSchedules(schedulesResponse);
        const normalizedAssignable = normalizeAssignableCoursesResponse(assignableResponse);

        setClassSchedules(normalizedSchedules);
        setSelectedGeneratedScheduleId(
          normalizedSchedules.length > 0
            ? String(normalizedSchedules[0].generatedScheduleId ?? "")
            : ""
        );

        setStudentPensumId(parsePositiveNumber(normalizedAssignable.studentPensumId));
        setAssignableCourses(normalizedAssignable.assignableCourses ?? []);
        setSelectedCourseCodeToAdd("");
        setSelectedCourses([]);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "No se pudieron cargar los datos para crear el horario personalizado");
        setClassSchedules([]);
        setAssignableCourses([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [resolvedPensumId]);

  const handleAddCourse = () => {
    const codeToAdd = parsePositiveNumber(selectedCourseCodeToAdd);
    if (!codeToAdd) return;

    const alreadyExists = selectedCourses.some(
      (course) => parsePositiveNumber(course.courseCode ?? course.course?.courseCode) === codeToAdd
    );
    if (alreadyExists) return;

    const course = assignableCourses.find(
      (item) => parsePositiveNumber(item.courseCode ?? item.course?.courseCode) === codeToAdd
    );
    if (!course) return;

    setSelectedCourses((current) => [...current, course]);
    setSelectedCourseCodeToAdd("");
  };

  const handleRemoveCourse = (courseCode: number) => {
    setSelectedCourses((current) =>
      current.filter((item) => parsePositiveNumber(item.courseCode ?? item.course?.courseCode) !== courseCode)
    );
  };

  const handleGenerateSchedule = async () => {
    if (saving) return;
    setError(null);

    const trimmedName = scheduleName.trim();
    if (!trimmedName) {
      setError("Debes ingresar un nombre para el horario.");
      return;
    }

    const scheduleId = parsePositiveNumber(selectedGeneratedScheduleId);
    if (!scheduleId) {
      setError("Debes seleccionar un horario base.");
      return;
    }

    if (!studentPensumId) {
      setError("No se encontró el studentPensumId para este pensum.");
      return;
    }

    if (selectedCourses.length === 0) {
      setError("Debes agregar al menos un curso.");
      return;
    }

    const courseCodes = selectedCourses
      .map((course) => parsePositiveNumber(course.courseCode ?? course.course?.courseCode))
      .filter((code) => code > 0);

    if (courseCodes.length === 0) {
      setError("No se pudieron resolver los códigos de curso seleccionados.");
      return;
    }

    setSaving(true);
    try {
      const response = await studentScheduleApi.createStudentSchedule({
        name: trimmedName,
        scheduleId,
        studentPensumId,
        courseCodes,
      });

      const headerId = parsePositiveNumber(
        (response as { header?: { studentGeneratedScheduleHeaderId?: number } })?.header?.studentGeneratedScheduleHeaderId
      );

      if (!headerId) {
        throw new Error("La respuesta no incluyó header.studentGeneratedScheduleHeaderId");
      }

      router.push(`/student/horario/${headerId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar el horario personalizado");
    } finally {
      setSaving(false);
    }
  };

  return (
    <RoleGate allowedRoles={["STUDENT", "ESTUDIANTE", "ROLE_STUDENT"]}>
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-white/5 dark:bg-white/3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Estudiante</p>
              <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">Horario personalizado</h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Selecciona un horario base, agrega cursos disponibles y genera tu horario.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push(`/student/pensums/${resolvedPensumId}`)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Volver al pensum
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-4 text-sm text-gray-500 shadow-theme-xs dark:bg-gray-900">Cargando datos...</div>
        ) : (
          <>
            {error ? (
              <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/10 dark:text-red-400">{error}</div>
            ) : null}

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-white/5 dark:bg-white/3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">1. Horario general base</h2>
              <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_220px]">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Horario disponible</label>
                  <select
                    value={selectedGeneratedScheduleId}
                    onChange={(event) => setSelectedGeneratedScheduleId(event.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    {classSchedules.length === 0 ? (
                      <option value="">Sin horarios disponibles</option>
                    ) : (
                      classSchedules.map((schedule) => {
                        const id = String(schedule.generatedScheduleId ?? "");
                        const name = schedule.name || `Horario ${id}`;
                        return (
                          <option key={id} value={id}>
                            {name}
                          </option>
                        );
                      })
                    )}
                  </select>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-300">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Pensum ID</p>
                  <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">{resolvedPensumId}</p>
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                {selectedSchedulePreviewUrl ? (
                  <iframe
                    title="Vista previa de horario base"
                    src={selectedSchedulePreviewUrl}
                    className="h-[480px] w-full bg-white"
                  />
                ) : (
                  <div className="flex h-[180px] items-center justify-center bg-gray-50 text-sm text-gray-500 dark:bg-gray-900/60 dark:text-gray-400">
                    Selecciona un horario para ver la vista previa.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-white/5 dark:bg-white/3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">2. Cursos para asignar</h2>
              <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Curso disponible</label>
                  <select
                    value={selectedCourseCodeToAdd}
                    onChange={(event) => setSelectedCourseCodeToAdd(event.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    <option value="">Selecciona un curso</option>
                    {availableToAddCourses.map((course) => {
                      const courseCode = parsePositiveNumber(course.courseCode ?? course.course?.courseCode);
                      const courseName = course.course?.name ?? `Curso ${courseCode}`;
                      const credits = parsePositiveNumber(course.credits);
                      return (
                        <option key={`${courseCode}-${course.pensumCourseId ?? "x"}`} value={String(courseCode)}>
                          {courseCode} - {courseName} ({credits} créditos)
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAddCourse}
                    className="h-11 rounded-lg bg-brand-600 px-5 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!selectedCourseCodeToAdd}
                  >
                    Agregar
                  </button>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-gray-200 dark:border-gray-700">
                {selectedCourses.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500 dark:text-gray-400">No has agregado cursos. Debes agregar al menos uno.</div>
                ) : (
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {selectedCourses.map((course) => {
                      const courseCode = parsePositiveNumber(course.courseCode ?? course.course?.courseCode);
                      const courseName = course.course?.name ?? `Curso ${courseCode}`;
                      return (
                        <li key={`selected-${courseCode}`} className="flex items-center justify-between gap-2 p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{courseCode} - {courseName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Semestre {parsePositiveNumber(course.semester)} · {parsePositiveNumber(course.credits)} créditos</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCourse(courseCode)}
                            className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            Eliminar
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-white/5 dark:bg-white/3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">3. Generar horario</h2>
              <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del horario</label>
                  <Input
                    value={scheduleName}
                    onChange={(event) => setScheduleName(event.target.value)}
                    placeholder="Ej. Horario Semestre 2 - 2027"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleGenerateSchedule}
                    disabled={saving || loading}
                    className="h-11 rounded-lg bg-success-600 px-5 text-sm font-medium text-white hover:bg-success-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? "Generando..." : "Generar"}
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </RoleGate>
  );
}
