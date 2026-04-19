import api from "./api.service";

const endpointCandidates = ["/student-grade", "/student-grades"];

const isRetryableEndpointError = (error) => {
  const status = Number(error?.status ?? 0);
  return [404, 405].includes(status);
};

const requestWithFallback = async (buildRequest) => {
  let lastError = null;

  for (const endpoint of endpointCandidates) {
    try {
      return await buildRequest(endpoint);
    } catch (error) {
      lastError = error;
      if (!isRetryableEndpointError(error)) {
        break;
      }
    }
  }

  throw lastError;
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeStudentGrade = (item) => {
  if (!item || typeof item !== "object") return item;

  const pensumCourseId = toNumber(item.pensumCourseId ?? item.pensumCourse?.pensumCourseId ?? item.pensumCourse?.id, 0);

  return {
    ...item,
    id: toNumber(item.studentGradeId ?? item.id, 0),
    studentGradeId: toNumber(item.studentGradeId ?? item.id, 0),
    studentPensumId: toNumber(item.studentPensumId ?? item.studentPensum?.studentPensumId, 0),
    pensumCourseId,
    isApproved: Boolean(item.isApproved ?? false),
    grade: toNumber(item.grade ?? 0, 0),
    pensumCourse: {
      ...(item.pensumCourse ?? {}),
      pensumCourseId,
      credits: toNumber(item.pensumCourse?.credits ?? 0, 0),
      requiredCreds: toNumber(item.pensumCourse?.requiredCreds ?? 0, 0),
    },
  };
};

const normalizeCollection = (response) => {
  if (Array.isArray(response)) return response.map(normalizeStudentGrade);
  if (!response || typeof response !== "object") return response;

  if (Array.isArray(response.content)) return { ...response, content: response.content.map(normalizeStudentGrade) };
  if (Array.isArray(response.data)) return { ...response, data: response.data.map(normalizeStudentGrade) };
  if (Array.isArray(response.items)) return { ...response, items: response.items.map(normalizeStudentGrade) };
  if (Array.isArray(response.rows)) return { ...response, rows: response.rows.map(normalizeStudentGrade) };
  if (Array.isArray(response.results)) return { ...response, results: response.results.map(normalizeStudentGrade) };

  return normalizeStudentGrade(response);
};

export const studentGradeApi = {
  getAll: async (params = {}) => {
    return requestWithFallback(async (endpoint) => {
      const response = await api.get(endpoint, { params });
      return normalizeCollection(response);
    });
  },

  get: async (id) => {
    const normalizedId = toNumber(id, 0);
    return requestWithFallback(async (endpoint) => {
      const response = await api.get(`${endpoint}/${normalizedId}`);
      return normalizeStudentGrade(response);
    });
  },

  create: async (data) => {
    const payload = {
      studentPensumId: toNumber(data.studentPensumId ?? 0, 0),
      pensumCourseId: toNumber(data.pensumCourseId ?? 0, 0),
      isApproved: Boolean(data.isApproved ?? false),
      gradeType: String(data.gradeType ?? "").trim(),
      grade: toNumber(data.grade ?? 0, 0),
    };

    return requestWithFallback(async (endpoint) => {
      const response = await api.post(endpoint, payload);
      return normalizeStudentGrade(response);
    });
  },

  update: async (id, data) => {
    const normalizedId = toNumber(id, 0);
    const payload = {
      isApproved: Boolean(data.isApproved ?? false),
      gradeType: String(data.gradeType ?? "").trim(),
      grade: toNumber(data.grade ?? 0, 0),
    };

    return requestWithFallback(async (endpoint) => {
      const response = await api.patch(`${endpoint}/${normalizedId}`, payload);
      return normalizeStudentGrade(response);
    });
  },

  delete: async (id) => {
    const normalizedId = toNumber(id, 0);
    return requestWithFallback(async (endpoint) => {
      return await api.delete(`${endpoint}/${normalizedId}`);
    });
  },

  getGradeTypes: async () => {
    return requestWithFallback(async (endpoint) => {
      const response = await api.get(`${endpoint}/grade-types`);
      return Array.isArray(response) ? response : [];
    });
  },

  getApprovedByPensum: async (pensumId) => {
    const normalizedPensumId = toNumber(pensumId, 0);
    return requestWithFallback(async (endpoint) => {
      const response = await api.get(endpoint, {
        params: {
          pensumId: normalizedPensumId,
          isApproved: true,
        },
      });
      return normalizeCollection(response);
    });
  },
  getByPensum: async (pensumId) => {
    const normalizedPensumId = toNumber(pensumId, 0);
    return requestWithFallback(async (endpoint) => {
      const response = await api.get(endpoint, {
        params: {
          pensumId: normalizedPensumId,
        },
      });
      return normalizeCollection(response);
    });
  },
};

export default studentGradeApi;
