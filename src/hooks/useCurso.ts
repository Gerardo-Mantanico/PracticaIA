import { useCrud } from "./useCrud";
import cursoApi from "@/service/curso.service";

export interface Curso {
  id: number;
  courseCode?: number;
  name: string;
  defaultCredits: number;
  numberOfPeriods?: number;
  semester?: number;
  isCommonArea?: boolean;
  isMandatory?: boolean;
  hasLab?: boolean;
  typeOfSchedule?: "MORNING" | "AFTERNOON";
  active?: boolean;
  createdAt?: string;
  createdBy?: string | null;
  updatedAt?: string;
  updatedBy?: string | null;
}

type CursoPayload = {
  courseCode: number;
  name: string;
  defaultCredits: number;
};

const transformPayload = (data: unknown): CursoPayload => {
  const value = (data ?? {}) as Partial<Curso>;

  return {
    courseCode: Number(value.courseCode ?? value.id ?? 0),
    name: String(value.name ?? "").trim(),
    defaultCredits: Number(value.defaultCredits ?? value.numberOfPeriods ?? 1),
  };
};

export const useCurso = () => {
  const {
    items: cursos,
    loading,
    error,
    fetchItems: fetchCursos,
    createItem: createCurso,
    updateItem: updateCurso,
    deleteItem: deleteCurso,
  } = useCrud<Curso>(cursoApi, transformPayload);

  return {
    cursos,
    loading,
    error,
    fetchCursos,
    createCurso,
    updateCurso,
    deleteCurso,
  };
};
