import { createCrudService } from "./crud.factory";

const ENDPOINT_BASE = "/actividades";

export const actividadApi = createCrudService(ENDPOINT_BASE);

export default actividadApi;
