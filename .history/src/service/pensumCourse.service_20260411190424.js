import { createCrudService } from "./crud.factory";

const ENDPOINT_CANDIDATES = ["/pensum-course", "/pensum-courses"];

const isRetryableEndpointError = (error) => {
  const status = Number(error?.status ?? 0);
  return [404, 405].includes(status);
};

const requestWithFallback = async (buildRequest) => {
  let lastError = null;

  for (const endpoint of ENDPOINT_CANDIDATES) {
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

const normalizePensumCourse = (item) => {
  if (!item || typeof item !== "object") return item;

  const resolvedPensumId = toNumber(item.pensumId ?? item.pensum?.id ?? item.pensum?.pensumId, 0);
  const resolvedCourseCode = toNumber(item.courseCode ?? item.course?.courseCode ?? item.course?.id, 0);
  const resolvedStudyAreaId = toNumber(item.studyAreaId ?? item.studyArea?.id ?? item.studyArea?.studyAreaId, 0);

  return {
    ...item,
    id: toNumber(item.id ?? item.pensumCourseId, 0),
    pensumId: resolvedPensumId,
    courseCode: resolvedCourseCode,
    studyAreaId: resolvedStudyAreaId,
    credits: toNumber(item.credits ?? 0, 0),
    requiredCreds: toNumber(item.requiredCreds ?? 0, 0),
    semester: toNumber(item.semester ?? 0, 0),
    isMandatory: Boolean(item.isMandatory ?? false),
    pensumName: String(item.pensumName ?? item.pensum?.name ?? item.pensum?.nombre ?? ""),
    courseName: String(item.courseName ?? item.course?.name ?? ""),
    studyAreaName: String(item.studyAreaName ?? item.studyArea?.name ?? item.studyArea?.nombre ?? ""),
  };
};

const normalizeCollection = (response) => {
  if (Array.isArray(response)) return response.map(normalizePensumCourse);
  if (!response || typeof response !== "object") return response;

  if (Array.isArray(response.content)) return { ...response, content: response.content.map(normalizePensumCourse) };
  if (Array.isArray(response.data)) return { ...response, data: response.data.map(normalizePensumCourse) };
  if (Array.isArray(response.items)) return { ...response, items: response.items.map(normalizePensumCourse) };
  if (Array.isArray(response.rows)) return { ...response, rows: response.rows.map(normalizePensumCourse) };
  if (Array.isArray(response.results)) return { ...response, results: response.results.map(normalizePensumCourse) };

  return normalizePensumCourse(response);
};

const buildPayload = (payload = {}) => ({
  pensumId: toNumber(payload?.pensumId, 0),
  courseCode: toNumber(payload?.courseCode, 0),
  studyAreaId: toNumber(payload?.studyAreaId, 0),
  credits: toNumber(payload?.credits, 0),
  requiredCreds: toNumber(payload?.requiredCreds, 0),
  isMandatory: Boolean(payload?.isMandatory ?? false),
  semester: toNumber(payload?.semester, 0),
});

export const pensumCourseApi = {
  getAll: async (params = {}) => {
    return requestWithFallback(async (endpoint) => {
      const api = createCrudService(endpoint);
      const response = await api.getAll(params);
      return normalizeCollection(response);
    });
  },
  get: async (id) => {
    return requestWithFallback(async (endpoint) => {
      const api = createCrudService(endpoint);
      const response = await api.get(id);
      return normalizeCollection(response);
    });
  },
  create: async (payload) => {
    return requestWithFallback(async (endpoint) => {
      const api = createCrudService(endpoint);
      const response = await api.create(buildPayload(payload));
      return normalizeCollection(response);
    });
  },
  update: async (id, payload) => {
    return requestWithFallback(async (endpoint) => {
      const api = createCrudService(endpoint);
      const response = await api.update(id, buildPayload(payload));
      return normalizeCollection(response);
    });
  },
  delete: async (id) => {
    return requestWithFallback(async (endpoint) => {
      const api = createCrudService(endpoint);
      const response = await api.delete(id);
      return normalizeCollection(response);
    });
  },
};

export default pensumCourseApi;
