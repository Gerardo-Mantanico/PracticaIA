import { createCrudService } from "./crud.factory";

const ENDPOINT_BASE = "/student";
const baseService = createCrudService(ENDPOINT_BASE);
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const buildDateFromParts = (yearRaw, monthRaw, dayRaw) => {
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return "";
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return "";
  }

  const normalized = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const probe = new Date(`${normalized}T00:00:00Z`);
  if (Number.isNaN(probe.getTime())) {
    return "";
  }

  return probe.toISOString().slice(0, 10) === normalized ? normalized : "";
};

const normalizeEntryDate = (value) => {
  if (value == null) return "";

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return "";
    return value.toISOString().slice(0, 10);
  }

  const raw = String(value).trim();
  if (!raw) return "";
  if (DATE_REGEX.test(raw)) return raw;

  if (raw.includes("T")) {
    const parsedIso = new Date(raw);
    if (!Number.isNaN(parsedIso.getTime())) {
      return parsedIso.toISOString().slice(0, 10);
    }
  }

  const slashYmd = raw.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (slashYmd) {
    return buildDateFromParts(slashYmd[1], slashYmd[2], slashYmd[3]);
  }

  const slashDmy = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashDmy) {
    return buildDateFromParts(slashDmy[3], slashDmy[2], slashDmy[1]);
  }

  const dashFlexible = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (dashFlexible) {
    return buildDateFromParts(dashFlexible[1], dashFlexible[2], dashFlexible[3]);
  }

  return "";
};

const normalizeStudent = (item) => {
  if (!item || typeof item !== "object") {
    return item;
  }

  const studentId = Number(item.studentId ?? item.id ?? 0);

  return {
    id: studentId,
    studentId,
    entryDate: normalizeEntryDate(item.entryDate),
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

  if (!DATE_REGEX.test(String(payload.entryDate))) {
    throw new Error("La fecha de ingreso debe tener formato YYYY-MM-DD");
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
    entryDate: normalizeEntryDate(payload?.entryDate),
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