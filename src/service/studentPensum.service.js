import api from "./api.service";

const endpointCandidates = ["/student-pensum", "/student-pensums"];

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

const normalizeStudentPensum = (item) => {
  if (!item || typeof item !== "object") return item;

  const studentPensumId = toNumber(item.studentPensumId ?? item.id, 0);
  const pensumId = toNumber(item.pensumId ?? item.pensum?.pensumId ?? item.pensum?.id, 0);

  return {
    ...item,
    id: studentPensumId,
    studentPensumId,
    studentId: toNumber(item.studentId ?? item.student?.studentId, 0),
    pensumId,
    createdAt: String(item.createdAt ?? ""),
    pensum: {
      ...(item.pensum ?? {}),
      pensumId,
      name: String(item.pensum?.name ?? item.pensumName ?? ""),
      creditsNeeded: toNumber(item.pensum?.creditsNeeded ?? item.creditsNeeded, 0),
      careerId: toNumber(item.pensum?.careerId ?? 0, 0),
    },
    student: {
      ...(item.student ?? {}),
      studentId: toNumber(item.studentId ?? item.student?.studentId, 0),
      firstname: String(item.student?.firstname ?? ""),
      lastname: String(item.student?.lastname ?? ""),
    },
  };
};

const normalizeCollection = (response) => {
  if (Array.isArray(response)) return response.map(normalizeStudentPensum);
  if (!response || typeof response !== "object") return response;

  if (Array.isArray(response.content)) return { ...response, content: response.content.map(normalizeStudentPensum) };
  if (Array.isArray(response.data)) return { ...response, data: response.data.map(normalizeStudentPensum) };
  if (Array.isArray(response.items)) return { ...response, items: response.items.map(normalizeStudentPensum) };
  if (Array.isArray(response.rows)) return { ...response, rows: response.rows.map(normalizeStudentPensum) };
  if (Array.isArray(response.results)) return { ...response, results: response.results.map(normalizeStudentPensum) };

  return normalizeStudentPensum(response);
};

export const studentPensumApi = {
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
      return normalizeStudentPensum(response);
    });
  },

  create: async (data) => {
    const payload = {
      studentId: toNumber(data.studentId, 0),
      pensumId: toNumber(data.pensumId, 0),
    };
    return requestWithFallback(async (endpoint) => {
      const response = await api.post(endpoint, payload);
      return normalizeStudentPensum(response);
    });
  },

  delete: async (id) => {
    const normalizedId = toNumber(id, 0);
    return requestWithFallback(async (endpoint) => {
      return await api.delete(`${endpoint}/${normalizedId}`);
    });
  },

  joinPensum: async (pensumId, studentId) => {
    const nPensumId = toNumber(pensumId, 0);
    const payload = { studentId: toNumber(studentId, 0) };
    return requestWithFallback(async (endpoint) => {
      const response = await api.post(`${endpoint}/join/${nPensumId}`, payload);
      return normalizeStudentPensum(response);
    });
  },

  getAssignableCourses: async (params = {}) => {
    return requestWithFallback(async (endpoint) => {
      const response = await api.get(`${endpoint}/assignable-courses`, { params });
      return Array.isArray(response) ? response : [];
    });
  },
};

export default studentPensumApi;
