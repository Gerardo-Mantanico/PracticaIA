import { useCrud } from "./useCrud";
import studentApi from "@/service/student.service";

export interface Student {
  id: number;
  studentId: number;
  entryDate: string;
  firstname: string;
  lastname: string;
}

type StudentPayload = {
  studentId: number;
  entryDate: string;
  firstname: string;
  lastname: string;
};

const transformPayload = (data: unknown): StudentPayload => {
  const value = (data ?? {}) as Partial<Student>;

  return {
    studentId: Number(value.studentId ?? value.id ?? 0),
    entryDate: String(value.entryDate ?? "").slice(0, 10),
    firstname: String(value.firstname ?? "").trim(),
    lastname: String(value.lastname ?? "").trim(),
  };
};

export const useStudent = () => {
  const {
    items: students,
    loading,
    error,
    fetchItems: fetchStudents,
    createItem: createStudent,
    updateItem: updateStudent,
    deleteItem: deleteStudent,
  } = useCrud<Student>(studentApi, transformPayload);

  return {
    students,
    loading,
    error,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
  };
};