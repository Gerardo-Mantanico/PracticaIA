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
