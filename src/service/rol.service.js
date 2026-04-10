import { createCrudService } from './crud.factory';

const ENDPOINT_BASE = '/role'; 

export const roleApi = createCrudService(ENDPOINT_BASE);

export default roleApi;