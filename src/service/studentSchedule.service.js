import api from "./api.service";

export const studentScheduleApi = {
  getClassSchedules: async () => api.get("/class-schedules"),
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
