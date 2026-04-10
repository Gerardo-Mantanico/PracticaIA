import { useCrud } from './useCrud';
import { userApi } from '../service/user.service';

export interface Role {
  id: number;
  name: string;
  description: string;
}

export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  dpi: number;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
  role: Role;
  use2fa: boolean;
  image?: string;
}

export const useUser = () => {
  const {
    items: users,
    loading,
    error,
    fetchItems: fetchUsers,
    createItem: createUser,
    updateItem: updateUser,
    deleteItem: deleteUser
  , totalItems
  } = useCrud<User>(userApi);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    totalItems,
  };
};
