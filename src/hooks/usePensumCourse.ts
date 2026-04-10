import { useCrud } from "./useCrud";
import pensumCourseApi from "@/service/pensumCourse.service";

export interface PensumCourse {
  id: number;
  pensumId: number;
  courseCode: number;
  studyAreaId: number;
  credits: number;
  requiredCreds: number;
  isMandatory: boolean;
  semester: number;
  pensumName?: string;
  courseName?: string;
  studyAreaName?: string;
}

const transformPayload = (
  data: unknown,
): Pick<
  PensumCourse,
  "pensumId" | "courseCode" | "studyAreaId" | "credits" | "requiredCreds" | "isMandatory" | "semester"
> => {
  const value = (data ?? {}) as Partial<PensumCourse>;

  return {
    pensumId: Number(value.pensumId ?? 0),
    courseCode: Number(value.courseCode ?? 0),
    studyAreaId: Number(value.studyAreaId ?? 0),
    credits: Number(value.credits ?? 0),
    requiredCreds: Number(value.requiredCreds ?? 0),
    isMandatory: Boolean(value.isMandatory ?? false),
    semester: Number(value.semester ?? 0),
  };
};

export const usePensumCourse = () => {
  const {
    items: pensumCourses,
    loading,
    error,
    fetchItems: fetchPensumCourses,
    createItem: createPensumCourse,
    updateItem: updatePensumCourse,
    deleteItem: deletePensumCourse,
  } = useCrud<PensumCourse>(pensumCourseApi, transformPayload);

  return {
    pensumCourses,
    loading,
    error,
    fetchPensumCourses,
    createPensumCourse,
    updatePensumCourse,
    deletePensumCourse,
  };
};
