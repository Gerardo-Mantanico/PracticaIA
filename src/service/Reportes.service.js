import { createCrudService } from './crud.factory';

const ENDPOINT_BASE = '/reporte/sesiones-congreso-servicio'; 

export const sesionesCongresoServicioApi = createCrudService(ENDPOINT_BASE);

export default

sesionesCongresoServicioApi;