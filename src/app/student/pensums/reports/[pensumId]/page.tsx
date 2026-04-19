"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import RoleGate from "@/components/auth/RoleGate";
import { PieChartIcon } from "@/icons";
import { studentGradeApi } from "@/service/studentGrade.service";

type StudentGradeItem = {
  id?: number;
  studentGradeId?: number;
  studentPensumId?: number;
  pensumCourseId?: number;
  isApproved?: boolean;
  gradeType?: string;
  grade?: number;
  createdAt?: string;
  studentPensum?: {
    pensum?: {
      pensumId?: number;
      name?: string;
      creditsNeeded?: number;
    };
  };
  pensumCourse?: {
    courseCode?: number;
    course: { name: string };
    credits?: number;
    isMandatory?: boolean;
    semester?: number;
  };
};

type GradeTypeLabel = {
  key: string;
  label: string;
};

const gradeTypeLabels: GradeTypeLabel[] = [
  { key: "FIRST_SEMESTER", label: "Primer Semestre" },
  { key: "SECOND_SEMESTER", label: "Segundo Semestre" },
  { key: "VACATIONS_JUNE", label: "EDV Junio" },
  { key: "VACATIONS_DECEMBER", label: "EDV Diciembre" },
];

const gradeTypeLabelByKey = new Map(gradeTypeLabels.map((item) => [item.key, item.label]));

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toPositive = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
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

const normalizeGrades = (response: unknown): StudentGradeItem[] => {
  if (Array.isArray(response)) return response as StudentGradeItem[];
  if (!response || typeof response !== "object") return [];

  const typed = response as { content?: unknown[]; data?: unknown[]; items?: unknown[]; rows?: unknown[]; results?: unknown[] };
  const candidate = typed.content ?? typed.data ?? typed.items ?? typed.rows ?? typed.results;
  return Array.isArray(candidate) ? (candidate as StudentGradeItem[]) : [];
};

const getGradeTypeLabel = (gradeType?: string): string => {
  if (!gradeType) return "-";
  return gradeTypeLabelByKey.get(gradeType) ?? gradeType;
};

const formatCourseLabel = (courseCode: number, courseName?: string): string => {
  if (courseCode > 0 && courseName) return `${courseCode} ${courseName}`;
  if (courseCode > 0) return `Curso ${courseCode}`;
  return "Curso -";
};

export default function StudentPensumGradesReportPage() {
  const router = useRouter();
  const params = useParams<{ pensumId?: string | string[] }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [grades, setGrades] = useState<StudentGradeItem[]>([]);

  const resolvedPensumId = useMemo(() => {
    const raw = params?.pensumId;
    const value = Array.isArray(raw) ? raw[0] : raw;
    return toPositive(value);
  }, [params]);

  useEffect(() => {
    if (!resolvedPensumId) {
      setError("ID de pensum inválido");
      setGrades([]);
      return;
    }

    let isMounted = true;

    const loadGrades = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await studentGradeApi.getByPensum(resolvedPensumId);
        if (!isMounted) return;
        setGrades(normalizeGrades(response));
      } catch (err) {
        if (!isMounted) return;
        setGrades([]);
        setError(err instanceof Error ? err.message : "No se pudieron cargar las notas del pensum");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadGrades();

    return () => {
      isMounted = false;
    };
  }, [resolvedPensumId]);

  const report = useMemo(() => {
    const approved = grades.filter((grade) => grade.isApproved);
    const unapproved = grades.filter((grade) => !grade.isApproved);
    const approvedCount = approved.length;
    const unapprovedCount = unapproved.length;
    const totalCount = approvedCount + unapprovedCount;
    const approvedPercentage = totalCount === 0 ? 0 : (approvedCount / totalCount) * 100;

    const approvedCredits = approved.reduce((acc, grade) => {
      return acc + toNumber(grade.pensumCourse?.credits);
    }, 0);

    const requiredCredits = toNumber(grades[0]?.studentPensum?.pensum?.creditsNeeded);
    const creditsFractionLabel = requiredCredits > 0
      ? `${approvedCredits} / ${requiredCredits}`
      : `${approvedCredits} / 0`;

    const averageAll = totalCount === 0
      ? 0
      : grades.reduce((acc, grade) => acc + toNumber(grade.grade), 0) / totalCount;
    const averageApproved = approvedCount === 0
      ? 0
      : approved.reduce((acc, grade) => acc + toNumber(grade.grade), 0) / approvedCount;

    const attemptsByCourse = new Map<number, { courseCode: number; courseName?: string; count: number }>();
    grades.forEach((grade) => {
      const courseCode = toPositive(grade.pensumCourse?.courseCode ?? grade.pensumCourseId);
      if (!courseCode) return;
      const courseName = grade.pensumCourse?.course?.name;
      const current = attemptsByCourse.get(courseCode) ?? { courseCode, courseName, count: 0 };
      attemptsByCourse.set(courseCode, {
        courseCode,
        courseName: current.courseName ?? courseName,
        count: current.count + 1,
      });
    });

    const topRepeats = Array.from(attemptsByCourse.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const approvedByCourse = new Map<number, { grade: number; courseName?: string }>();
    approved.forEach((grade) => {
      const courseCode = toPositive(grade.pensumCourse?.courseCode ?? grade.pensumCourseId);
      if (!courseCode) return;
      const courseName = grade.pensumCourse?.course?.name;
      const current = approvedByCourse.get(courseCode) ?? { grade: toNumber(grade.grade), courseName };
      approvedByCourse.set(courseCode, {
        grade: Math.min(current.grade, toNumber(grade.grade)),
        courseName: current.courseName ?? courseName,
      });
    });

    const topLowestApproved = Array.from(approvedByCourse.entries())
      .map(([courseCode, entry]) => ({ courseCode, grade: entry.grade, courseName: entry.courseName }))
      .sort((a, b) => a.grade - b.grade)
      .slice(0, 5);

    return {
      approvedCount,
      unapprovedCount,
      approvedPercentage,
      creditsFractionLabel,
      averageAll,
      averageApproved,
      topRepeats,
      topLowestApproved,
      pensumName: grades[0]?.studentPensum?.pensum?.name ?? `Pensum ${resolvedPensumId}`,
    };
  }, [grades, resolvedPensumId]);

  return (
    <RoleGate allowedRoles={["STUDENT", "ESTUDIANTE", "ROLE_STUDENT"]}>
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-white/5 dark:bg-white/3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Reporte</p>
              <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">Notas del pensum</h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{report.pensumName}</p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/student/pensums")}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Volver
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-4 text-sm text-gray-500 shadow-theme-xs dark:bg-gray-900">Cargando notas...</div>
        ) : error ? (
          <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/10 dark:text-red-400">{error}</div>
        ) : grades.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-white/3 dark:text-gray-400">
            No hay notas registradas para este pensum.
          </div>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-sm dark:border-gray-800 dark:bg-white/3">
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Aprobados</p>
                <p className="mt-2 text-2xl font-semibold text-blue-600">{report.approvedCount}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-sm dark:border-gray-800 dark:bg-white/3">
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Reprobados</p>
                <p className="mt-2 text-2xl font-semibold text-red-600">{report.unapprovedCount}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-sm dark:border-gray-800 dark:bg-white/3">
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Porcentaje aprobado</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                  {report.approvedPercentage.toFixed(1)}%
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-sm dark:border-gray-800 dark:bg-white/3">
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Créditos aprobados</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{report.creditsFractionLabel}</p>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-white/3">
                <div className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Promedios</h2>
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Promedio general</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{report.averageAll.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Promedio limpio (aprobados)</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{report.averageApproved.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-white/3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top 5 de repeticiones</h2>
                <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  {report.topRepeats.length === 0 ? (
                    <li>Sin repeticiones registradas.</li>
                  ) : (
                    report.topRepeats.map((item) => (
                      <li key={`repeat-${item.courseCode}`} className="flex items-center justify-between">
                        <span>{formatCourseLabel(item.courseCode, item.courseName)}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{item.count} registros</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-white/3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top 5 de aprobados con menor nota</h2>
              <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {report.topLowestApproved.length === 0 ? (
                  <li>No hay cursos aprobados.</li>
                ) : (
                  report.topLowestApproved.map((item) => (
                    <li key={`low-${item.courseCode}`} className="flex items-center justify-between">
                      <span>{formatCourseLabel(item.courseCode, item.courseName)}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{item.grade}</span>
                    </li>
                  ))
                )}
              </ul>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-white/3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Listado de notas</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:text-gray-400">
                      <th className="px-3 py-2">Curso</th>
                      <th className="px-3 py-2">Nota</th>
                      <th className="px-3 py-2">Tipo</th>
                      <th className="px-3 py-2">Estado</th>
                      <th className="px-3 py-2">Registro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {grades.map((grade) => {
                      const courseCode = toPositive(grade.pensumCourse?.courseCode ?? grade.pensumCourseId);
                      const courseName = grade.pensumCourse?.course?.name;
                      const isApproved = Boolean(grade.isApproved);
                      return (
                        <tr key={grade.studentGradeId ?? grade.id ?? `${courseCode}-${grade.createdAt ?? "g"}`}>
                          <td className="px-3 py-3 text-gray-700 dark:text-gray-300">
                            {formatCourseLabel(courseCode, courseName)}
                          </td>
                          <td className={`px-3 py-3 font-semibold ${isApproved ? "text-blue-600" : "text-red-600"}`}>
                            {toNumber(grade.grade)}
                          </td>
                          <td className="px-3 py-3 text-gray-600 dark:text-gray-400">{getGradeTypeLabel(grade.gradeType)}</td>
                          <td className={`px-3 py-3 text-sm font-medium ${isApproved ? "text-blue-600" : "text-red-600"}`}>
                            {isApproved ? "Aprobado" : "Reprobado"}
                          </td>
                          <td className="px-3 py-3 text-gray-500 dark:text-gray-400">{formatDateTime(grade.createdAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </RoleGate>
  );
}
