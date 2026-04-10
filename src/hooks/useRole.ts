import { useCrud } from './useCrud';
import { roleApi } from '../service/rol.service';

export interface Role {
  id: number;
  name: string;
  description: string;
}

export const useRole = () => {
  const {
    items: roles,
    loading,
    error,
    fetchItems: fetchRoles,
    createItem: createRole,
    updateItem: updateRole,
    deleteItem: deleteRole
  } = useCrud<Role>(roleApi);

  return {
    roles,
    loading,
    error,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
  };
};
