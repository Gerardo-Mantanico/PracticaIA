import api from "./api.service";

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];

  const obj = value;
  return obj.content || obj.data || obj.items || obj.rows || obj.results || [];
};

const toNumericId = (value) => {
  const parsed = Number(String(value ?? "0"));
  return Number.isFinite(parsed) ? parsed : 0;
};

const computeNextId = async (endpoint, idKey) => {
  const response = await api.get(endpoint);
  const items = asArray(response);
  const maxId = items.reduce((acc, item) => {
    const current = toNumericId(item?.[idKey] ?? item?.id);
    return current > acc ? current : acc;
  }, 0);
  return String(maxId + 1);
};

export const scheduleGenerationApi = {
  getCourses: async () => api.get("/courses"),
  getProfessors: async () => api.get("/professors"),
  getClassrooms: async () => api.get("/classrooms"),

  getConfigProfessors: async () => api.get("/config-professors"),
  createConfigProfessor: async (payload) => {
    return api.post("/config-professors", {
      ...payload,
    });
  },

  getConfigClassrooms: async () => api.get("/config-classrooms"),
  createConfigClassroom: async (payload) => {
    return api.post("/config-classrooms", {
      ...payload,
    });
  },

  getConfigCourses: async () => api.get("/config-courses"),
  createConfigCourse: async (payload) => {
    return api.post("/config-courses", {
      ...payload,
    });
  },

  getConfigCourseProfessors: async () => api.get("/config-course-professors"),
  createConfigCourseProfessor: async (payload) => {
    return api.post("/config-course-professors", {
      ...payload,
    });
  },

  generate: async (scheduleConfigId) => api.post(`/ga/generate/${scheduleConfigId}`, {}),
  getGeneratedSchedules: async () => api.get("/generated-schedules"),
  getGeneratedSchedule: async (generatedScheduleId) => api.get(`/generated-schedules/${generatedScheduleId}`),
  patchGeneratedItem: async (generatedScheduleId, generatedScheduleItemId, payload) => {
    return api.patch(
      `/generated-schedules/${generatedScheduleId}/items/${generatedScheduleItemId}`,
      payload
    );
  },
};

export default scheduleGenerationApi;
