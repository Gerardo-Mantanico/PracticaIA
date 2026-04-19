"use client";

import { useState, useEffect, useCallback } from "react";
import studentGradeApi from "@/service/studentGrade.service";

export interface GradeType {
  id: string;
  description: string;
}

export interface StudentGrade {
  id: number;
  studentGradeId: number;
  studentPensumId: number;
  pensumCourseId: number;
  isApproved: boolean;
  gradeType: string;
  grade: number;
  createdAt?: string;
  studentPensum?: {
    studentPensumId?: number;
    studentId?: number;
    pensumId?: number;
    firstname?: string;
    lastname?: string;
    student?: {
      studentId?: number;
      firstname?: string;
      lastname?: string;
      entryDate?: string;
    };
    pensum?: {
      pensumId?: number;
      name?: string;
      creditsNeeded?: number;
      careerId?: number;
    };
  };
  pensumCourse?: {
    pensumCourseId: number;
    pensumId?: number;
    courseCode?: number;
    credits: number;
    requiredCreds: number;
    name?: string;
    course?: {
      courseCode?: number;
      name?: string;
      defaultCredits?: number;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export type StudentGradeCreatePayload = {
  studentPensumId: number;
  pensumCourseId: number;
  isApproved: boolean;
  gradeType: string;
  grade: number;
};

export type StudentGradeUpdatePayload = {
  isApproved: boolean;
  gradeType: string;
  grade: number;
};

export const useStudentGrade = () => {
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([]);
  const [gradeTypes, setGradeTypes] = useState<GradeType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener todos los tipos de calificación
  const fetchGradeTypes = useCallback(async () => {
    try {
      setError(null);
      const response = await studentGradeApi.getGradeTypes();
      setGradeTypes(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar tipos de calificación";
      setError(errorMessage);
      console.error("Error fetching grade types:", err);
      return [];
    }
  }, []);

  // Obtener todas las calificaciones de estudiantes
  const fetchStudentGrades = useCallback(async (params: Record<string, unknown> = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await studentGradeApi.getAll(params);

      // Si el backend devuelve un array directamente
      if (Array.isArray(response)) {
        setStudentGrades(response as StudentGrade[]);
        return response;
      }

      // Intentar parsear estructura de paginación
      const respObj = response as Record<string, unknown>;
      const content =
        (respObj.content as StudentGrade[]) ||
        (respObj.data as StudentGrade[]) ||
        (respObj.items as StudentGrade[]) ||
        [];

      if (Array.isArray(content)) {
        setStudentGrades(content);
        return content;
      }

      return [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar calificaciones";
      setError(errorMessage);
      console.error("Error fetching student grades:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar notas por estudiante y pensum
  const fetchByStudentAndPensum = useCallback(
    async (studentId: number, pensumId: number) => {
      return fetchStudentGrades({ studentId, pensumId });
    },
    [fetchStudentGrades]
  );

  // Cargar notas por ID de estudiante usando el endpoint directo
  const fetchByStudentId = useCallback(async (studentId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await studentGradeApi.getByStudentId(studentId);
      
      // Manejar si retorna un objeto singular o un array
      if (Array.isArray(response)) {
        setStudentGrades(response as StudentGrade[]);
        return response;
      } else if (response && typeof response === 'object') {
        // Si retorna un objeto singular, convertir a array
        setStudentGrades([response as StudentGrade]);
        return [response as StudentGrade];
      }
      
      return [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar notas del estudiante";
      setError(errorMessage);
      console.error("Error fetching student grades by student id:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nueva calificación
  const createStudentGrade = useCallback(
    async (data: StudentGradeCreatePayload) => {
      setLoading(true);
      setError(null);
      try {
        const newGrade = await studentGradeApi.create(data);
        await fetchStudentGrades();
        return newGrade;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error al crear calificación";
        setError(errorMessage);
        console.error("Error creating student grade:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchStudentGrades]
  );

  // Actualizar calificación
  const updateStudentGrade = useCallback(
    async (id: number, data: StudentGradeUpdatePayload) => {
      setLoading(true);
      setError(null);
      try {
        const updatedGrade = await studentGradeApi.update(id, data);
        await fetchStudentGrades();
        return updatedGrade;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error al actualizar calificación";
        setError(errorMessage);
        console.error("Error updating student grade:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchStudentGrades]
  );

  // Eliminar calificación
  const deleteStudentGrade = useCallback(
    async (id: number) => {
      setLoading(true);
      setError(null);
      try {
        await studentGradeApi.delete(id);
        await fetchStudentGrades();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error al eliminar calificación";
        setError(errorMessage);
        console.error("Error deleting student grade:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchStudentGrades]
  );

  // Cargar tipos de grado al montar
  useEffect(() => {
    fetchGradeTypes();
  }, [fetchGradeTypes]);

  return {
    studentGrades,
    gradeTypes,
    loading,
    error,
    fetchStudentGrades,
    fetchByStudentAndPensum,
    fetchByStudentId,
    createStudentGrade,
    updateStudentGrade,
    deleteStudentGrade,
    fetchGradeTypes,
  };
};
