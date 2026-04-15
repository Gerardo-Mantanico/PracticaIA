import { createCrudService } from "./crud.factory";

const ENDPOINT_BASE = "/student";
const baseService = createCrudService(ENDPOINT_BASE);

const normalizeStudent = (item) => {
  if (!item || typeof item !== "object") {
    return item;
  }

  const studentId = Number(item.studentId ?? item.id ?? 0);

  return {
    id: studentId,
    studentId,
    entryDate: String(item.entryDate ?? "").slice(0, 10),
    firstname: String(item.firstname ?? item.firstName ?? "").trim(),
    lastname: String(item.lastname ?? item.lastName ?? "").trim(),
  };
};

const normalizeCollection = (response) => {
  if (Array.isArray(response)) return response.map(normalizeStudent);
  if (!response || typeof response !== "object") return response;

  if (Array.isArray(response.content)) return { ...response, content: response.content.map(normalizeStudent) };
  if (Array.isArray(response.data)) return { ...response, data: response.data.map(normalizeStudent) };
  if (Array.isArray(response.items)) return { ...response, items: response.items.map(normalizeStudent) };
  if (Array.isArray(response.rows)) return { ...response, rows: response.rows.map(normalizeStudent) };
  if (Array.isArray(response.results)) return { ...response, results: response.results.map(normalizeStudent) };

  return normalizeStudent(response);
};

const validateStudent = (payload) => {
  if (!Number.isFinite(Number(payload?.studentId)) || Number(payload.studentId) < 0) {
    throw new Error("El código de estudiante debe ser mayor o igual a 0");
  }

  if (!String(payload?.entryDate ?? "").trim()) {
    throw new Error("La fecha de ingreso es obligatoria");
  }

  if (!String(payload?.firstname ?? "").trim()) {
    throw new Error("El nombre es obligatorio");
  }

  if (!String(payload?.lastname ?? "").trim()) {
    throw new Error("El apellido es obligatorio");
  }
};

const buildStudentPayload = (payload, id) => {
  const studentId = Number(payload?.studentId ?? id ?? payload?.id ?? 0);

  return {
    studentId,
    entryDate: String(payload?.entryDate ?? "").slice(0, 10),
    firstname: String(payload?.firstname ?? payload?.firstName ?? "").trim(),
    lastname: String(payload?.lastname ?? payload?.lastName ?? "").trim(),
  };
};

export const studentApi = {
  ...baseService,
  getAll: async (params = {}) => normalizeCollection(await baseService.getAll(params)),
  get: async (id) => normalizeStudent(await baseService.get(id)),
  create: async (payload) => {
    const body = buildStudentPayload(payload);
    validateStudent(body);
    return normalizeCollection(await baseService.create(body));
  },
  update: async (id, payload) => {
    const normalizedId = Number(id ?? payload?.studentId ?? payload?.id ?? 0);
    if (!Number.isFinite(normalizedId) || normalizedId < 0) {
      throw new TypeError("Id inválido para actualizar");
    }

    const body = buildStudentPayload(payload, normalizedId);
    validateStudent(body);
    return normalizeCollection(await baseService.update(normalizedId, body));
  },
  delete: async (id) => {
    const normalizedId = Number(id);
    if (!Number.isFinite(normalizedId) || normalizedId < 0) {
      throw new TypeError("Id inválido para eliminar");
    }

    return baseService.delete(normalizedId);
  },
};

export default studentApi;