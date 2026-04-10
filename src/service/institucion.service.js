import { createCrudService } from './crud.factory';

export const institucionApi = createCrudService('/instituciones');

export default institucionApi;
