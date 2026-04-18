import api from "./api.service";

export const studentScheduleApi = {
  getClassSchedules: async () => api.get("/class-schedules"),
  getStudentScheduleHeaders: async () => api.get("/student-schedules", { params: { active: "true" } }),
  getStudentScheduleHeaderById: async (headerId) => api.get(`/student-schedules/${headerId}`),
  getAssignableCourses: async (pensumId) => {
    return api.get("/student-pensum/assignable-courses", {
      params: {
        pensumId: String(pensumId ?? ""),
      },
    });
  },
  createStudentSchedule: async (payload) => api.post("/student-schedules", payload),
};

export default studentScheduleApi;
