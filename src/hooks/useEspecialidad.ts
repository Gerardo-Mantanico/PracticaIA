import { useCrud } from './useCrud';
import { especialidadApi } from '../service/especialidad.service';

export interface Especialidad {
  id: number;
  name: string;
  description?: string;
}

export const useEspecialidad = () => {
  const {
    items: especialidades,
    loading,
    error,
    fetchItems: fetchEspecialidades,
    createItem: createEspecialidad,
    updateItem: updateEspecialidad,
    deleteItem: deleteEspecialidad
  } = useCrud<Especialidad>(especialidadApi);

  return {
    especialidades,
    loading,
    error,
    fetchEspecialidades,
    createEspecialidad,
    updateEspecialidad,
    deleteEspecialidad,
  };
};
