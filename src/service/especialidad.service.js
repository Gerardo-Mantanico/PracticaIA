import { createCrudService } from './crud.factory';

const ENDPOINT_BASE = '/study-area';
const baseService = createCrudService(ENDPOINT_BASE);

const normalizeStudyArea = (item) => {
	if (!item || typeof item !== 'object') return item;

	return {
		...item,
		id: item.id,
		name: String(item.name ?? item.nombre ?? '').trim(),
		description: String(item.description ?? item.descripcion ?? '').trim(),
	};
};

const normalizeCollection = (response) => {
	if (Array.isArray(response)) return response.map(normalizeStudyArea);
	if (!response || typeof response !== 'object') return response;

	if (Array.isArray(response.content)) return { ...response, content: response.content.map(normalizeStudyArea) };
	if (Array.isArray(response.data)) return { ...response, data: response.data.map(normalizeStudyArea) };

	return normalizeStudyArea(response);
};

const buildPayload = (payload) => ({
	name: String(payload?.name ?? payload?.nombre ?? '').trim(),
	description: String(payload?.description ?? payload?.descripcion ?? '').trim(),
});

export const especialidadApi = {
	...baseService,
	getAll: async (params = {}) => normalizeCollection(await baseService.getAll(params)),
	get: async (id) => normalizeStudyArea(await baseService.get(id)),
	create: async (payload) => normalizeStudyArea(await baseService.create(buildPayload(payload))),
	update: async (id, payload) => normalizeStudyArea(await baseService.update(id, buildPayload(payload))),
};

export default especialidadApi;