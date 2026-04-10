import api from "./api.service";

const ENDPOINT_BASE = "/schedule-configs";

const asArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (value && typeof value === "object") {
    const obj = value;
    if (Array.isArray(obj.content)) return obj.content;
    if (Array.isArray(obj.data)) return obj.data;
    if (Array.isArray(obj.items)) return obj.items;
    if (Array.isArray(obj.results)) return obj.results;
    if (Array.isArray(obj.rows)) return obj.rows;
  }

  return [];
};

const toNumericId = (value) => {
  const parsed = Number(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
};

const computeNextScheduleConfigId = async () => {
  const response = await api.get(ENDPOINT_BASE);
  const items = asArray(response);
  const maxId = items.reduce((acc, item) => {
    const current = toNumericId(item?.scheduleConfigId ?? item?.id);
    return current > acc ? current : acc;
  }, 0);

  return String(maxId + 1);
};

export const scheduleConfigApi = {
  getAll: async (params = {}) => {
    return api.get(ENDPOINT_BASE, { params });
  },

  get: async (id) => {
    return api.get(`${ENDPOINT_BASE}/${id}`);
  },

  create: async (data) => {
    return api.post(ENDPOINT_BASE, {
      ...data,
    });
  },

  update: async (id, data) => {
    return api.patch(`${ENDPOINT_BASE}/${id}`, data);
  },

  delete: async (id) => {
    return api.delete(`${ENDPOINT_BASE}/${id}`);
  },
};

export default scheduleConfigApi;
