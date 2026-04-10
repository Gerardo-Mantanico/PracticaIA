import { useCrud } from './useCrud';
import { institucionApi } from '../service';

interface Institucion {
  id: number;
  nombre: string;
  descripcion?: string;
  direccion?: string;
  imgs?: string[];
  activo?: boolean;
}

export const useInstituciones = () => {
  const {
    items: instituciones,
    loading,
    error,
    fetchItems: fetchInstituciones,
    createItem: createInstitucion,
    updateItem: updateInstitucion,
    deleteItem: deleteInstitucion,
  } = useCrud<Institucion>(institucionApi);

  return {
    instituciones,
    loading,
    error,
    fetchInstituciones,
    createInstitucion,
    updateInstitucion,
    deleteInstitucion,
  };
};
