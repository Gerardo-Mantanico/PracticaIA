import { createCrudService } from "./crud.factory";
import api from "./api.service";

const ENDPOINT_BASE = "/professors";
const baseService = createCrudService(ENDPOINT_BASE);

const normalizeProfessor = (item) => {
  if (!item || typeof item !== "object") return item;

  const professorCode = Number(item.professorCode ?? item.id ?? 0);

  return {
    id: professorCode,
    professorCode,
    firstName: String(item.firstName ?? "").trim(),
    secondName: String(item.secondName ?? "").trim(),
    lastName: String(item.lastName ?? "").trim(),
    secondLastName: String(item.secondLastName ?? "").trim(),
    entryTime: item.entryTime,
    exitTime: item.exitTime,
  };
};

const normalizeCollection = (response) => {
  if (Array.isArray(response)) return response.map(normalizeProfessor);
  if (!response || typeof response !== "object") return response;

  if (Array.isArray(response.content)) return { ...response, content: response.content.map(normalizeProfessor) };
  if (Array.isArray(response.data)) return { ...response, data: response.data.map(normalizeProfessor) };
  if (Array.isArray(response.items)) return { ...response, items: response.items.map(normalizeProfessor) };
  if (Array.isArray(response.rows)) return { ...response, rows: response.rows.map(normalizeProfessor) };
  if (Array.isArray(response.results)) return { ...response, results: response.results.map(normalizeProfessor) };

  return normalizeProfessor(response);
};

const toIsoDateTime = (timeValue) => {
  if (!timeValue) return null;

  if (String(timeValue).includes("T")) {
    const parsedIso = new Date(timeValue);
    if (!Number.isNaN(parsedIso.getTime())) return parsedIso.toISOString();
  }

  const now = new Date();
  const [hoursRaw, minutesRaw] = String(timeValue).split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;

  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
  return date.toISOString();
};

const buildProfessorPayload = (payload, id) => {
  const professorCode = Number(payload?.professorCode ?? id ?? payload?.id ?? 0);
  if (!Number.isFinite(professorCode) || professorCode <= 0) {
    throw new TypeError("El código del docente debe ser mayor a cero");
  }

  const entryTime = toIsoDateTime(payload?.entryTime);
  const exitTime = toIsoDateTime(payload?.exitTime);

  if (!entryTime || !exitTime) {
    throw new TypeError("Debes indicar hora de entrada y salida válidas");
  }

  return {
    professorCode,
    firstName: String(payload?.firstName ?? "").trim(),
    secondName: String(payload?.secondName ?? "").trim(),
    lastName: String(payload?.lastName ?? "").trim(),
    secondLastName: String(payload?.secondLastName ?? "").trim(),
    entryTime,
    exitTime,
  };
};

const validateProfessor = (payload) => {
  if (!String(payload?.firstName ?? "").trim()) throw new Error("El primer nombre es obligatorio");
  if (!String(payload?.lastName ?? "").trim()) throw new Error("El primer apellido es obligatorio");
};

export const docenteApi = {
  ...baseService,
  getAll: async (params = {}) => normalizeCollection(await baseService.getAll(params)),
  get: async (id) => normalizeProfessor(await baseService.get(id)),
  create: async (payload) => {
    validateProfessor(payload);
    return normalizeCollection(await baseService.create(buildProfessorPayload(payload)));
  },
  update: async (id, payload) => {
    const normalizedId = Number(id ?? payload?.professorCode ?? payload?.id ?? 0);
    if (!Number.isFinite(normalizedId) || normalizedId <= 0) {
      throw new TypeError("Id inválido para actualizar");
    }

    validateProfessor(payload);
    return normalizeCollection(await api.patch(`${ENDPOINT_BASE}/${normalizedId}`, buildProfessorPayload(payload, normalizedId)));
  },
  delete: async (id) => {
    const normalizedId = Number(id);
    if (!Number.isFinite(normalizedId) || normalizedId <= 0) {
      throw new TypeError("Id inválido para eliminar");
    }

    return baseService.delete(normalizedId);
  },
};

export default docenteApi;
