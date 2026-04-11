import { createCrudService } from "./crud.factory";
import api from "./api.service";

const ENDPOINT_BASE = "/course";
const baseService = createCrudService(ENDPOINT_BASE);

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeSchedule = (value) => {
  const normalized = String(value || "").trim().toUpperCase();
  return normalized === "AFTERNOON" ? "AFTERNOON" : "MORNING";
};

const normalizeCourse = (item) => {
  if (!item || typeof item !== "object") return item;

  const courseCode = toNumber(item.courseCode ?? item.id, 0);
  const defaultCredits = toNumber(item.defaultCredits ?? item.numberOfPeriods, 1);

  return {
    ...item,
    id: courseCode,
    courseCode,
    name: String(item.name ?? "").trim(),
    semester: toNumber(item.semester, 1),
    isCommonArea: Boolean(item.isCommonArea),
    isMandatory: Boolean(item.isMandatory ?? true),
    hasLab: Boolean(item.hasLab),
    numberOfPeriods: defaultCredits,
    defaultCredits,
    typeOfSchedule: normalizeSchedule(item.typeOfSchedule),
    active: typeof item.active === "boolean" ? item.active : true,
    createdAt: item.createdAt,
    createdBy: item.createdBy,
    updatedAt: item.updatedAt,
    updatedBy: item.updatedBy,
  };
};

const normalizeCollection = (response) => {
  if (Array.isArray(response)) return response.map(normalizeCourse);
  if (!response || typeof response !== "object") return response;

  if (Array.isArray(response.content)) return { ...response, content: response.content.map(normalizeCourse) };
  if (Array.isArray(response.data)) return { ...response, data: response.data.map(normalizeCourse) };
  if (Array.isArray(response.items)) return { ...response, items: response.items.map(normalizeCourse) };
  if (Array.isArray(response.rows)) return { ...response, rows: response.rows.map(normalizeCourse) };
  if (Array.isArray(response.results)) return { ...response, results: response.results.map(normalizeCourse) };

  return normalizeCourse(response);
};

const buildCoursePayload = (payload, id) => {
  const courseCode = toNumber(payload?.courseCode ?? id ?? payload?.id, 0);
  if (courseCode <= 0) throw new TypeError("El código del curso debe ser mayor a cero");

  const defaultCredits = toNumber(payload?.defaultCredits ?? payload?.numberOfPeriods, 0);
  if (defaultCredits <= 0) throw new TypeError("Los créditos por defecto deben ser mayores a cero");

  return {
    courseCode,
    name: String(payload?.name ?? "").trim(),
    defaultCredits,
  };
};

const buildCourseUpdatePayload = (payload) => {
  const defaultCredits = toNumber(payload?.defaultCredits ?? payload?.numberOfPeriods, 0);
  if (defaultCredits <= 0) throw new TypeError("Los créditos por defecto deben ser mayores a cero");

  return {
    name: String(payload?.name ?? "").trim(),
    defaultCredits,
  };
};

const validateCourse = (payload, options = { requireCourseCode: true }) => {
  if (!String(payload?.name ?? "").trim()) throw new Error("El nombre es obligatorio");
  if (options.requireCourseCode && toNumber(payload?.courseCode, 0) <= 0) {
    throw new Error("El código del curso es obligatorio");
  }
  if (toNumber(payload?.defaultCredits ?? payload?.numberOfPeriods, 0) <= 0) {
    throw new Error("Los créditos por defecto deben ser mayores a cero");
  }
};

export const cursoApi = {
  ...baseService,
  getAll: async (params = {}) => normalizeCollection(await baseService.getAll(params)),
  get: async (id) => normalizeCourse(await baseService.get(id)),
  create: async (payload) => {
    validateCourse(payload);
    return normalizeCollection(await baseService.create(buildCoursePayload(payload)));
  },
  update: async (id, payload) => {
    const normalizedId = toNumber(id ?? payload?.courseCode ?? payload?.id, 0);
    if (normalizedId <= 0) throw new TypeError("Id inválido para actualizar");

    validateCourse(payload, { requireCourseCode: false });
    return normalizeCollection(await api.patch(`${ENDPOINT_BASE}/${normalizedId}`, buildCourseUpdatePayload(payload)));
  },
  delete: async (id) => {
    const normalizedId = toNumber(id, 0);
    if (normalizedId <= 0) throw new TypeError("Id inválido para eliminar");
    return baseService.delete(normalizedId);
  },
};

export default cursoApi;
