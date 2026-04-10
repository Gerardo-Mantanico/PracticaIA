import { createCrudService } from "./crud.factory";
import api from "./api.service";

const ENDPOINT_BASE = "/classrooms";
const baseService = createCrudService(ENDPOINT_BASE);

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeSchedule = (value) => {
  const normalized = String(value || "").trim().toUpperCase();
  if (normalized === "AFTERNOON") return "AFTERNOON";
  if (normalized === "NIGHT") return "NIGHT";
  return "MORNING";
};

const normalizeClassroom = (item) => {
  if (!item || typeof item !== "object") return item;

  const classroomId = Number(item.id ?? item.classroomId ?? 0);

  return {
    ...item,
    id: classroomId,
    classroomId,
    name: String(item.name ?? "").trim(),
    classTypeId: toNumber(item.classTypeId, 0),
    capacity: toNumber(item.capacity, 1),
    typeOfSchedule: normalizeSchedule(item.typeOfSchedule),
    active: typeof item.active === "boolean" ? item.active : true,
  };
};

const normalizeCollection = (response) => {
  if (Array.isArray(response)) {
    return response.map(normalizeClassroom);
  }

  if (!response || typeof response !== "object") {
    return response;
  }

  if (Array.isArray(response.content)) {
    return { ...response, content: response.content.map(normalizeClassroom) };
  }

  if (Array.isArray(response.data)) {
    return { ...response, data: response.data.map(normalizeClassroom) };
  }

  if (Array.isArray(response.items)) {
    return { ...response, items: response.items.map(normalizeClassroom) };
  }

  if (Array.isArray(response.rows)) {
    return { ...response, rows: response.rows.map(normalizeClassroom) };
  }

  if (Array.isArray(response.results)) {
    return { ...response, results: response.results.map(normalizeClassroom) };
  }

  return normalizeClassroom(response);
};

const buildClassroomPayload = (payload) => {
  return {
    name: String(payload?.name ?? "").trim(),
    classTypeId: toNumber(payload?.classTypeId, 0),
    capacity: toNumber(payload?.capacity, 1),
    typeOfSchedule: normalizeSchedule(payload?.typeOfSchedule),
  };
};

const validateSalon = (payload) => {
  if (!String(payload?.name ?? "").trim()) {
    throw new Error("El nombre es obligatorio");
  }

  if (toNumber(payload?.classTypeId, 0) <= 0) {
    throw new Error("El tipo de salón es obligatorio y debe ser mayor a cero");
  }

  if (toNumber(payload?.capacity, 0) <= 0) {
    throw new Error("La capacidad debe ser mayor a cero");
  }
};

export const salonApi = {
  ...baseService,
  getAll: async (params = {}) => {
    const response = await baseService.getAll(params);
    return normalizeCollection(response);
  },
  get: async (id) => {
    const response = await baseService.get(id);
    return normalizeClassroom(response);
  },
  create: async (payload) => {
    validateSalon(payload);
    const response = await baseService.create(buildClassroomPayload(payload));
    return normalizeCollection(response);
  },
  update: async (id, payload) => {
    const normalizedId = Number(id ?? payload?.id ?? payload?.classroomId ?? 0);
    if (!Number.isFinite(normalizedId) || normalizedId <= 0) {
      throw new TypeError("Id inválido para actualizar");
    }

    validateSalon(payload);
    const response = await api.patch(`${ENDPOINT_BASE}/${normalizedId}`, buildClassroomPayload(payload));
    return normalizeCollection(response);
  },
  delete: async (id) => {
    const normalizedId = Number(id);
    if (!Number.isFinite(normalizedId) || normalizedId <= 0) {
      throw new TypeError("Id inválido para eliminar");
    }

    return baseService.delete(normalizedId);
  },
};

export default salonApi;
