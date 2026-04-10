import { createCrudService } from "./crud.factory";

const ENDPOINT_BASE = "/career";
const baseService = createCrudService(ENDPOINT_BASE);

const normalizeCareer = (career) => {
  if (!career || typeof career !== "object") {
    return career;
  }

  const resolvedCareerId = Number(career.careerId ?? career.id ?? career.careerCode ?? 0);

  return {
    ...career,
    careerId: resolvedCareerId,
    id: resolvedCareerId,
    careerCode: Number(career.careerCode ?? resolvedCareerId),
    name: String(career.name ?? ""),
    active: typeof career.active === "boolean" ? career.active : true,
  };
};

const normalizeCollection = (response) => {
  if (Array.isArray(response)) {
    return response.map(normalizeCareer);
  }

  if (!response || typeof response !== "object") {
    return response;
  }

  if (Array.isArray(response.content)) {
    return {
      ...response,
      content: response.content.map(normalizeCareer),
    };
  }

  if (Array.isArray(response.data)) {
    return {
      ...response,
      data: response.data.map(normalizeCareer),
    };
  }

  if (Array.isArray(response.items)) {
    return {
      ...response,
      items: response.items.map(normalizeCareer),
    };
  }

  if (Array.isArray(response.rows)) {
    return {
      ...response,
      rows: response.rows.map(normalizeCareer),
    };
  }

  if (Array.isArray(response.results)) {
    return {
      ...response,
      results: response.results.map(normalizeCareer),
    };
  }

  return normalizeCareer(response);
};

export const careerApi = {
  ...baseService,
  getAll: async (params = {}) => {
    const response = await baseService.getAll(params);
    return normalizeCollection(response);
  },
  get: async (id) => {
    const response = await baseService.get(id);
    return normalizeCareer(response);
  },
  create: async (payload) => {
    const response = await baseService.create({
      name: String(payload?.name ?? "").trim(),
    });
    return normalizeCollection(response);
  },
  update: async (id, payload) => {
    const response = await baseService.update(id, {
      name: String(payload?.name ?? "").trim(),
    });
    return normalizeCollection(response);
  },
};

export default careerApi;
