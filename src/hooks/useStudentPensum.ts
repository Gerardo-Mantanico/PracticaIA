"use client";

import { useCallback, useState } from "react";
import studentPensumApi from "@/service/studentPensum.service";

export interface StudentPensum {
  id: number;
  studentPensumId: number;
  studentId: number;
  pensumId: number;
  createdAt?: string;
  pensum?: {
    pensumId?: number;
    name?: string;
    creditsNeeded?: number;
    careerId?: number;
  };
  student?: {
    studentId?: number;
    firstname?: string;
    lastname?: string;
  };
}

export interface AssignableCourse {
  id: number;
  pensumCourseId?: number;
  name?: string;
  courseName?: string;
  pensumId?: number;
  credits?: number;
  courseCode?: number;
  course?: {
    courseCode?: number;
    name?: string;
    defaultCredits?: number;
  };
  [key: string]: unknown;
}

const toArray = (response: unknown): StudentPensum[] => {
  if (Array.isArray(response)) return response as StudentPensum[];
  if (!response || typeof response !== "object") return [];

  const value = response as Record<string, unknown>;
  const candidates = [value.content, value.data, value.items, value.rows, value.results];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate as StudentPensum[];
    }
  }

  return [];
};

export const useStudentPensum = () => {
  const [studentPensums, setStudentPensums] = useState<StudentPensum[]>([]);
  const [assignableCourses, setAssignableCourses] = useState<AssignableCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async (params: Record<string, unknown> = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await studentPensumApi.getAll(params);
      const list = toArray(response);
      setStudentPensums(list);
      return list;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar student-pensum";
      setError(msg);
      setStudentPensums([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByStudentId = useCallback(async (studentId: number, pensumId?: number) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = { studentId };
      if (Number.isFinite(Number(pensumId)) && Number(pensumId) > 0) {
        params.pensumId = Number(pensumId);
      }
      const response = await studentPensumApi.getAll(params);
      const list = toArray(response);
      setStudentPensums(list);
      return list;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar student-pensum";
      setError(msg);
      setStudentPensums([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await studentPensumApi.get(id);
      return response as StudentPensum;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al obtener student-pensum";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createStudentPensum = useCallback(
    async (data: { studentId: number; pensumId: number }) => {
      setLoading(true);
      setError(null);
      try {
        const result = await studentPensumApi.create(data);
        await fetchAll();
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error al crear student-pensum";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchAll]
  );

  const deleteStudentPensum = useCallback(
    async (id: number) => {
      setLoading(true);
      setError(null);
      try {
        await studentPensumApi.delete(id);
        await fetchAll();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error al eliminar student-pensum";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchAll]
  );

  const joinPensum = useCallback(
    async (pensumId: number, studentId: number) => {
      setLoading(true);
      setError(null);
      try {
        const result = await studentPensumApi.joinPensum(pensumId, studentId);
        await fetchAll();
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error al registrar en pensum";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchAll]
  );

  const fetchAssignableCourses = useCallback(async (params: Record<string, unknown> = {}) => {
    setError(null);
    try {
      const response = await studentPensumApi.getAssignableCourses(params);
      setAssignableCourses(response as AssignableCourse[]);
      return response as AssignableCourse[];
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al obtener cursos asignables";
      setError(msg);
      return [];
    }
  }, []);

  const clearAssignableCourses = useCallback(() => {
    setAssignableCourses([]);
  }, []);

  const clearStudentPensums = useCallback(() => {
    setStudentPensums([]);
    setAssignableCourses([]);
    setError(null);
  }, []);

  return {
    studentPensums,
    assignableCourses,
    loading,
    error,
    fetchAll,
    fetchByStudentId,
    fetchById,
    createStudentPensum,
    deleteStudentPensum,
    joinPensum,
    fetchAssignableCourses,
    clearAssignableCourses,
    clearStudentPensums,
  };
};
