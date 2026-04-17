"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import RoleGate from "@/components/auth/RoleGate";
import PensumCoursesBoard, { type CourseAvailabilityStatus, type PensumCourseBoardItem } from "@/components/pensum/PensumCoursesBoard";
import { useCurso } from "@/hooks/useCurso";
import { useEspecialidad } from "@/hooks/useEspecialidad";
import { pensumCourseApi } from "@/service/pensumCourse.service";
import { studentGradeApi } from "@/service/studentGrade.service";

type PensumCourseLike = PensumCourseBoardItem;
type RawPensumCourseLike = PensumCourseBoardItem & { pensumCourseId?: number };

type StudentGradeLike = {
  studentGradeId?: number;
  pensumCourseId?: number;
  pensumCourse?: {
    pensumCourseId?: number;
    credits?: number;
  };
  isApproved?: boolean;
};

const normalizePensumCourseItem = (item: unknown): PensumCourseLike | null => {
  if (!item || typeof item !== "object") return null;

  const value = item as RawPensumCourseLike;
  const pensumCourseId = Number(value.id ?? value.pensumCourseId ?? 0);

  return {
    ...value,
    id: pensumCourseId,
    pensumId: Number(value.pensumId ?? 0),
    courseCode: Number(value.courseCode ?? value.course?.courseCode ?? 0),
    studyAreaId: Number(value.studyAreaId ?? value.studyArea?.id ?? 0),
    credits: Number(value.credits ?? 0),
    requiredCreds: Number(value.requiredCreds ?? 0),
    isMandatory: Boolean(value.isMandatory ?? false),
    semester: Number(value.semester ?? 0),
    courseName: value.courseName ?? value.course?.name,
    studyAreaName: value.studyAreaName ?? value.studyArea?.name,
    prerequisites: Array.isArray(value.prerequisites) ? value.prerequisites : [],
    postrequisites: Array.isArray(value.postrequisites) ? value.postrequisites : [],
  };
};

const normalizePensumCourseList = (response: unknown): PensumCourseLike[] => {
  if (Array.isArray(response)) {
    return response.map(normalizePensumCourseItem).filter((item): item is PensumCourseLike => item !== null);
  }
  if (!response || typeof response !== "object") return [];

  const typedResponse = response as { content?: unknown[]; data?: unknown[]; items?: unknown[]; rows?: unknown[]; results?: unknown[] };
  const candidate = typedResponse.content ?? typedResponse.data ?? typedResponse.items ?? typedResponse.rows ?? typedResponse.results;
  if (!Array.isArray(candidate)) return [];

  return candidate.map(normalizePensumCourseItem).filter((item): item is PensumCourseLike => item !== null);
};

const normalizeStudentGradeList = (response: unknown): StudentGradeLike[] => {
  if (Array.isArray(response)) return response as StudentGradeLike[];
  if (!response || typeof response !== "object") return [];

  const typed = response as { content?: unknown[]; data?: unknown[]; items?: unknown[]; rows?: unknown[]; results?: unknown[] };
  const candidate = typed.content ?? typed.data ?? typed.items ?? typed.rows ?? typed.results;
  return Array.isArray(candidate) ? (candidate as StudentGradeLike[]) : [];
};

const resolvePrerequisiteAssignmentId = (item: unknown, pensumCourses: PensumCourseLike[]): number => {
  if (!item || typeof item !== "object") return 0;

  const value = item as {
    prerequisiteId?: number;
    pensumCoursePrerequisiteId?: number;
    courseCode?: number;
    prerequisite?: { id?: number; courseCode?: number };
    course?: { id?: number; courseCode?: number };
  };

  const directId = Number(value.prerequisiteId ?? value.pensumCoursePrerequisiteId ?? value.prerequisite?.id ?? value.course?.id ?? 0);
  if (directId > 0) return directId;

  const code = Number(value.courseCode ?? value.prerequisite?.courseCode ?? value.course?.courseCode ?? 0);
  if (code <= 0) return 0;

  const candidate = pensumCourses.find((entry) => Number(entry.courseCode ?? 0) === code);
  return Number(candidate?.id ?? 0);
};

export default function StudentPensumDetailPage() {
  const router = useRouter();
  const params = useParams<{ id?: string | string[] }>();
  const { cursos } = useCurso();
  const { especialidades } = useEspecialidad();

  const [pensumCourses, setPensumCourses] = useState<PensumCourseLike[]>([]);
  const [approvedGrades, setApprovedGrades] = useState<StudentGradeLike[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolvedPensumId = useMemo(() => {
    const rawParam = params?.id;
    const value = Array.isArray(rawParam) ? rawParam[0] : rawParam;
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }, [params]);

  useEffect(() => {
    if (resolvedPensumId <= 0) {
      setError("ID de pensum inválido");
      setPensumCourses([]);
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [pensumCourseResponse, gradesResponse] = await Promise.all([
          pensumCourseApi.get(resolvedPensumId),
          studentGradeApi.getApprovedByPensum(resolvedPensumId),
        ]);

        if (!isMounted) return;
        setPensumCourses(normalizePensumCourseList(pensumCourseResponse));
        setApprovedGrades(normalizeStudentGradeList(gradesResponse));
      } catch (err) {
        if (!isMounted) return;
        setPensumCourses([]);
        setApprovedGrades([]);
        setError(err instanceof Error ? err.message : "No se pudo cargar el pensum del estudiante");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [resolvedPensumId]);

  const courseMap = useMemo(() => {
    const map = new Map<number, string>();
    cursos.forEach((course) => {
      map.set(Number(course.courseCode ?? course.id ?? 0), course.name);
    });
    return map;
  }, [cursos]);

  const studyAreaMap = useMemo(() => {
    const map = new Map<number, string>();
    especialidades.forEach((studyArea) => {
      map.set(Number(studyArea.id ?? 0), studyArea.name);
    });
    return map;
  }, [especialidades]);

  const approvedCourseIds = useMemo(() => {
    const ids = new Set<number>();
    approvedGrades.forEach((grade) => {
      const id = Number(grade.pensumCourseId ?? grade.pensumCourse?.pensumCourseId ?? 0);
      if (id > 0 && grade.isApproved) ids.add(id);
    });
    return ids;
  }, [approvedGrades]);

  const approvedCredits = useMemo(() => {
    const creditsByCourseId = new Map<number, number>();
    pensumCourses.forEach((course) => {
      const id = Number(course.id ?? 0);
      if (id > 0) creditsByCourseId.set(id, Number(course.credits ?? 0));
    });

    let total = 0;
    approvedCourseIds.forEach((id) => {
      total += Number(creditsByCourseId.get(id) ?? 0);
    });
    return total;
  }, [approvedCourseIds, pensumCourses]);

  const courseStatusMap = useMemo(() => {
    const statusMap = new Map<number, CourseAvailabilityStatus>();

    pensumCourses.forEach((course) => {
      const courseId = Number(course.id ?? 0);
      if (courseId <= 0) return;

      if (approvedCourseIds.has(courseId)) {
        statusMap.set(courseId, "approved");
        return;
      }

      const requiredCreds = Number(course.requiredCreds ?? 0);
      const meetsCredits = approvedCredits >= requiredCreds;

      const prerequisites = Array.isArray(course.prerequisites) ? course.prerequisites : [];
      const prerequisiteIds = prerequisites
        .map((item) => resolvePrerequisiteAssignmentId(item, pensumCourses))
        .filter((id) => id > 0);
      const meetsPrerequisites = prerequisiteIds.every((id) => approvedCourseIds.has(id));

      statusMap.set(courseId, meetsCredits && meetsPrerequisites ? "available" : "blocked");
    });

    return statusMap;
  }, [approvedCourseIds, approvedCredits, pensumCourses]);

  return (
    <RoleGate allowedRoles={["STUDENT", "ESTUDIANTE", "ROLE_STUDENT"]}>
      <div className="space-y-6">
        <div className="w-full rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
          <div className="mb-6 flex items-center gap-2">
            <button
              onClick={() => router.push("/student/pensums")}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900"
            >
              ←
            </button>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Mi pensum</h1>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            Verde: aprobado, gris: bloqueado, azul: disponible para cursar.
          </p>

          <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-300">
            Créditos aprobados acumulados: <span className="font-semibold">{approvedCredits}</span>
          </div>

          <div className="mt-4">
            <PensumCoursesBoard
              loading={loading}
              error={error}
              pensumCourses={pensumCourses}
              courseMap={courseMap}
              studyAreaMap={studyAreaMap}
              statusByCourseId={courseStatusMap}
              searchPlaceholder="Buscar curso por nombre o código"
              emptyMessage="No se encontraron cursos para este pensum."
              noResultsMessage="No se encontraron cursos con ese criterio."
            />
          </div>
        </div>
      </div>
    </RoleGate>
  );
}
