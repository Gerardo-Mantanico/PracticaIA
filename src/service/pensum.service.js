import api from "./api.service";

const endpointCandidates = ["/pensum", "/pensums"];

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

const normalizePensum = (pensum) => {
  if (!pensum || typeof pensum !== "object") {
    return pensum;
  }

  const resolvedPensumId = Number(
    pensum.id
      ?? pensum.pensumId
      ?? pensum.pensumCode
      ?? pensum.code
      ?? 0,
  );

  const careerId = Number(
    pensum.careerId ?? pensum.career?.id ?? pensum.career?.careerCode ?? 0,
  );

  return {
    ...pensum,
    id: resolvedPensumId,
    pensumId: resolvedPensumId,
    pensumCode: Number(pensum.pensumCode ?? resolvedPensumId),
    name: String(pensum.name ?? ""),
    creditsNeeded: Number(pensum.creditsNeeded ?? 0),
    careerId,
    careerName: String(pensum.careerName ?? pensum.career?.name ?? ""),
    active: typeof pensum.active === "boolean" ? pensum.active : true,
  };
};

const normalizeCollection = (response) => {
  if (Array.isArray(response)) {
    return response.map(normalizePensum);
  }

  if (!response || typeof response !== "object") {
    return response;
  }

  if (Array.isArray(response.content)) {
    return {
      ...response,
      content: response.content.map(normalizePensum),
    };
  }

  if (Array.isArray(response.data)) {
    return {
      ...response,
      data: response.data.map(normalizePensum),
    };
  }

  if (Array.isArray(response.items)) {
    return {
      ...response,
      items: response.items.map(normalizePensum),
    };
  }

  if (Array.isArray(response.rows)) {
    return {
      ...response,
      rows: response.rows.map(normalizePensum),
    };
  }

  if (Array.isArray(response.results)) {
    return {
      ...response,
      results: response.results.map(normalizePensum),
    };
  }

  return normalizePensum(response);
};

const buildPayload = (payload = {}) => ({
  name: String(payload?.name ?? "").trim(),
  creditsNeeded: Number(payload?.creditsNeeded ?? 0),
  careerId: Number(payload?.careerId ?? 0),
});

export const pensumApi = {
  getAll: async (params = {}) => {
    return requestWithFallback(async (endpoint) => {
      const response = await api.get(endpoint, { params });
      return normalizeCollection(response);
    });
  },
  get: async (id) => {
    return requestWithFallback(async (endpoint) => {
      const response = await api.get(`${endpoint}/${id}`);
      return normalizePensum(response);
    });
  },
  create: async (payload) => {
    return requestWithFallback(async (endpoint) => {
      const response = await api.post(endpoint, buildPayload(payload));
      return normalizeCollection(response);
    });
  },
  update: async (id, payload) => {
    return requestWithFallback(async (endpoint) => {
      const response = await api.patch(`${endpoint}/${id}`, buildPayload(payload));
      return normalizeCollection(response);
    });
  },
  delete: async (id) => {
    return requestWithFallback(async (endpoint) => {
      const response = await api.delete(`${endpoint}/${id}`);
      return normalizeCollection(response);
    });
  },
};

export default pensumApi;
