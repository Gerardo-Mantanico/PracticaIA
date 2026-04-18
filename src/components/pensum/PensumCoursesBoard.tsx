"use client";

import React, { useMemo, useState } from "react";
import Input from "@/components/form/input/InputField";
import { LockIcon } from "@/icons";
import type { PensumCourse } from "@/hooks/usePensumCourse";

export type CourseAvailabilityStatus = "available" | "blocked" | "approved";

export type PensumCourseBoardItem = PensumCourse & {
  course?: { name?: string; courseCode?: number };
  studyArea?: { name?: string; id?: number };
  prerequisites?: unknown[];
  postrequisites?: unknown[];
};

type PensumCoursesBoardProps = {
  loading: boolean;
  error: string | null;
  pensumCourses: PensumCourseBoardItem[];
  courseMap: Map<number, string>;
  studyAreaMap: Map<number, string>;
  onCourseClick?: (course: PensumCourseBoardItem) => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
  noResultsMessage?: string;
  statusByCourseId?: Map<number, CourseAvailabilityStatus>;
};

const SEMESTER_OPTIONS = [
  { value: 1, label: "Primer semestre" },
  { value: 2, label: "Segundo semestre" },
  { value: 3, label: "Tercer semestre" },
  { value: 4, label: "Cuarto semestre" },
  { value: 5, label: "Quinto semestre" },
  { value: 6, label: "Sexto semestre" },
  { value: 7, label: "Séptimo semestre" },
  { value: 8, label: "Octavo semestre" },
  { value: 9, label: "Noveno semestre" },
  { value: 10, label: "Décimo semestre" },
] as const;

const formatPrerequisiteCode = (item: unknown): string => {
  if (typeof item === "number") return String(item).padStart(4, "0");
  if (typeof item === "string") {
    const parsed = Number(item);
    return Number.isFinite(parsed) && parsed > 0 ? String(parsed).padStart(4, "0") : item;
  }
  if (!item || typeof item !== "object") return "N/A";

  const value = item as { courseCode?: number; prerequisite?: { courseCode?: number }; course?: { courseCode?: number } };
  const code = Number(value.courseCode ?? value.prerequisite?.courseCode ?? value.course?.courseCode ?? 0);
  return code > 0 ? String(code).padStart(4, "0") : "N/A";
};

const COURSE_CARD_STYLES: Record<CourseAvailabilityStatus, string> = {
  available: "border-blue-300 bg-blue-100/70 hover:bg-blue-200/70",
  blocked: "border-gray-300 bg-gray-100/80 text-gray-500 hover:bg-gray-200/80 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-300",
  approved: "border-green-300 bg-green-100/80 hover:bg-green-200/80 dark:border-green-700 dark:bg-green-900/25",
};

export default function PensumCoursesBoard({
  loading,
  error,
  pensumCourses,
  courseMap,
  studyAreaMap,
  onCourseClick,
  searchPlaceholder = "Buscar curso por nombre",
  emptyMessage = "Este pensum aún no tiene cursos asociados.",
  noResultsMessage = "No se encontraron cursos con ese nombre.",
  statusByCourseId,
}: Readonly<PensumCoursesBoardProps>) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPensumCourses = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return pensumCourses;

    return pensumCourses.filter((course) => {
      const courseCode = Number(course.courseCode ?? 0);
      const courseName = course.courseName || course.course?.name || courseMap.get(courseCode) || "";
      return (
        courseName.toLowerCase().includes(normalized)
        || String(courseCode).padStart(4, "0").includes(normalized)
      );
    });
  }, [pensumCourses, searchTerm, courseMap]);

  const semesterValues = useMemo(
    () =>
      Array.from(
        new Set(
          filteredPensumCourses.map((course) => {
            const value = Number(course.semester ?? 0);
            return Number.isFinite(value) && value > 0 ? value : 0;
          }),
        ),
      ).sort((a, b) => {
        if (a === 0) return 1;
        if (b === 0) return -1;
        return a - b;
      }),
    [filteredPensumCourses],
  );

  const studyAreaRows = useMemo(
    () =>
      Array.from(
        filteredPensumCourses.reduce((acc, course) => {
          const rawId = Number(course.studyAreaId ?? 0);
          const studyAreaId = Number.isFinite(rawId) && rawId > 0 ? rawId : 0;
          const studyAreaName =
            course.studyAreaName
            || course.studyArea?.name
            || studyAreaMap.get(studyAreaId)
            || "Área no definida";

          if (!acc.has(studyAreaId)) {
            acc.set(studyAreaId, studyAreaName);
          }

          return acc;
        }, new Map<number, string>()),
      )
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" })),
    [filteredPensumCourses, studyAreaMap],
  );

  const coursesByCell = useMemo(() => {
    const cellMap = filteredPensumCourses.reduce((acc, course) => {
      const rawStudyAreaId = Number(course.studyAreaId ?? 0);
      const studyAreaId = Number.isFinite(rawStudyAreaId) && rawStudyAreaId > 0 ? rawStudyAreaId : 0;
      const rawSemester = Number(course.semester ?? 0);
      const semester = Number.isFinite(rawSemester) && rawSemester > 0 ? rawSemester : 0;
      const key = `${studyAreaId}-${semester}`;

      if (!acc.has(key)) {
        acc.set(key, []);
      }

      acc.get(key)?.push(course);
      return acc;
    }, new Map<string, PensumCourseBoardItem[]>());

    cellMap.forEach((items) => {
      items.sort((a, b) => Number(a.courseCode ?? 0) - Number(b.courseCode ?? 0));
    });

    return cellMap;
  }, [filteredPensumCourses]);

  const semesterLabelMap = useMemo(() => new Map(SEMESTER_OPTIONS.map((option: {readonly value: number, readonly label: string}) => [option.value, option.label])), []);
  const gridTemplateColumns = `minmax(220px, 220px) repeat(${Math.max(semesterValues.length, 1)}, minmax(260px, 1fr))`;

  return (
    <div className="space-y-3">
      <Input
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        placeholder={searchPlaceholder}
      />

      {loading ? (
        <div className="rounded-2xl bg-white p-4 text-sm text-gray-500 shadow-theme-xs dark:bg-gray-900">Cargando cursos...</div>
      ) : error ? (
        <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/10 dark:text-red-400">{error}</div>
      ) : pensumCourses.length === 0 ? (
        <div className="rounded-2xl bg-white p-4 text-sm text-gray-500 shadow-theme-xs dark:bg-gray-900">{emptyMessage}</div>
      ) : filteredPensumCourses.length === 0 ? (
        <div className="rounded-2xl bg-white p-4 text-sm text-gray-500 shadow-theme-xs dark:bg-gray-900">{noResultsMessage}</div>
      ) : (
        <div className="overflow-x-auto pb-2">
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900" style={{ minWidth: `${220 + Math.max(semesterValues.length, 1) * 260}px` }}>
            <div className="grid border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60" style={{ gridTemplateColumns }}>
              <div className="sticky left-0 z-20 border-r border-gray-200 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-300">
                Área de estudio
              </div>
              {semesterValues.map((semester) => (
                <div
                  key={`header-${semester}`}
                  className="border-r border-gray-200 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600 last:border-r-0 dark:border-gray-800 dark:text-gray-300"
                >
                  {semester > 0 ? semesterLabelMap.get(semester) || `Semestre ${semester}` : "Sin semestre"}
                </div>
              ))}
            </div>

            {studyAreaRows.map((row) => (
              <div
                key={`row-${row.id}`}
                className="grid border-b border-gray-200 last:border-b-0 dark:border-gray-800"
                style={{ gridTemplateColumns }}
              >
                <div className="sticky left-0 z-10 flex items-center border-r border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
                  {row.name}
                </div>

                {semesterValues.map((semester) => {
                  const cellKey = `${row.id}-${semester}`;
                  const cellCourses = coursesByCell.get(cellKey) || [];

                  return (
                    <div key={cellKey} className="border-r border-gray-200 p-2 last:border-r-0 dark:border-gray-800">
                      {cellCourses.length > 0 ? (
                        <div className="space-y-2">
                          {cellCourses.map((course) => {
                            const courseCode = Number(course.courseCode ?? 0);
                            const name = course.courseName || course.course?.name || courseMap.get(courseCode) || `Curso ${courseCode}`;
                            const credits = Number(course.credits ?? 0);
                            const prereqs = Array.isArray(course.prerequisites) ? course.prerequisites : [];
                            const prereqCodes = prereqs.map(formatPrerequisiteCode).filter((code) => code !== "N/A");
                            const status = statusByCourseId?.get(Number(course.id ?? 0)) || "available";
                            const requiredCreds = Number(course.requiredCreds ?? 0);

                            const content = (
                              <>
                                <div className="grid grid-cols-[58px_1fr_58px] overflow-hidden">
                                  <div className={`grid grid-rows-2 text-white ${status === "approved" ? "bg-green-600" : status === "blocked" ? "bg-gray-500" : "bg-blue-600"}`}>
                                    <div className="flex items-center justify-center text-sm font-semibold">{String(courseCode).padStart(4, "0")}</div>
                                    <div className={`flex items-center justify-center border-t text-sm font-semibold ${status === "approved" ? "border-green-300" : status === "blocked" ? "border-gray-300" : "border-blue-300"}`}>
                                      {credits}
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-center px-3 py-3 text-center text-sm font-medium text-gray-800 dark:text-gray-100">
                                    <div>
                                      <p>{name}</p>
                                      <p className="mt-0.5 text-[11px] text-gray-600 dark:text-gray-400">
                                        {course.studyAreaName
                                          || course.studyArea?.name
                                          || studyAreaMap.get(Number(course.studyAreaId))
                                          || "Área no definida"}
                                      </p>
                                      {status === "blocked" && (
                                        <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                                          <LockIcon className="h-3 w-3" />
                                          Bloqueado
                                        </p>
                                      )}
                                      {status === "approved" && (
                                        <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-green-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-800 dark:bg-green-700/60 dark:text-green-200">
                                          Aprobado
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className={`flex items-center justify-center px-1 text-white ${status === "approved" ? "bg-green-600" : status === "blocked" ? "bg-gray-500" : "bg-blue-600"}`}>
                                    {prereqCodes.length > 0 || requiredCreds > 0 ? (
                                      <div className="flex max-h-full flex-col items-center justify-center gap-0.5 overflow-hidden text-center text-[10px] font-semibold leading-tight">
                                        {prereqCodes.map((code, index) => (
                                          <span key={`${code}-${index}`} className="block w-full truncate">
                                            {code}
                                          </span>
                                        ))}
                                        {requiredCreds > 0 && (
                                          <span className="block w-full truncate">
                                            {requiredCreds}Cr.
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-xl leading-none">•</span>
                                    )}
                                  </div>
                                </div>
                              </>
                            );

                            if (!onCourseClick) {
                              return (
                                <div
                                  key={course.id || `${courseCode}-${course.semester}`}
                                  className={`w-full overflow-hidden rounded-sm border text-left ${COURSE_CARD_STYLES[status]}`}
                                >
                                  {content}
                                </div>
                              );
                            }

                            return (
                              <button
                                key={course.id || `${courseCode}-${course.semester}`}
                                type="button"
                                onClick={() => onCourseClick(course)}
                                className={`w-full overflow-hidden rounded-sm border text-left transition-colors ${COURSE_CARD_STYLES[status]}`}
                              >
                                {content}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="min-h-[92px] rounded-lg border border-dashed border-gray-200 bg-gray-50/40 dark:border-gray-800 dark:bg-gray-900/20" />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
