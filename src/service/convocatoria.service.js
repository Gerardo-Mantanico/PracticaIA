import { createCrudService } from "./crud.factory.js";
import api from "./api.service";

const ENDPOINT_BASE = "/convocatorias";
const DEFAULT_CONVOCATORIA_PARAMS = {
	page: 0,
	size: 1000,
	estado: "ACTIVO",
};

const crud = createCrudService(ENDPOINT_BASE);

const looksLikeConvocatoria = (item) => {
	return (
		item &&
		typeof item === "object" &&
		("nombre" in item || "titulo" in item) &&
		"fechaInicio" in item &&
		"fechaFin" in item
	);
};

const normalizeConvocatoriasResponse = (response) => {
	if (Array.isArray(response)) {
		if (response.length === 0) return [];

		if (looksLikeConvocatoria(response[0])) {
			return response;
		}

		const nested = response
			.filter((item) => item && typeof item === "object" && Array.isArray(item.convocatorias))
			.flatMap((item) => item.convocatorias);

		return nested;
	}

	if (response && typeof response === "object") {
		if (Array.isArray(response.convocatorias)) {
			return response.convocatorias;
		}

		if (Array.isArray(response.content)) {
			return normalizeConvocatoriasResponse(response.content);
		}

		if (Array.isArray(response.data)) {
			return normalizeConvocatoriasResponse(response.data);
		}
	}

	return [];
};

export const convocatoriaApi = {
	...crud,
	getAll: async (params = {}) => {
		const mergedParams = { ...DEFAULT_CONVOCATORIA_PARAMS, ...params };

		if (params?.congresoId !== undefined && params?.congresoId !== null) {
			if (params?.page !== undefined || params?.size !== undefined) {
				return await crud.getAll(mergedParams);
			}
			const response = await api.get(`${ENDPOINT_BASE}/congreso/${params.congresoId}`, {
				params: { estado: mergedParams.estado },
			});
			return normalizeConvocatoriasResponse(response);
		}
		return await crud.getAll(mergedParams);
	},
};

export default convocatoriaApi;
