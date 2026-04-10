"use client";
import React, { useState } from "react";
import Image from "next/image";

import { useModal } from "../../hooks/useModal";
import { useUser } from "../../hooks/useUser";
import { useRole } from "../../hooks/useRole";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { GenericTable, Column } from "../ui/table/GenericTable";

interface Role {
  id: number;
  name: string;
  description: string;
}

interface User {
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

const columns: Column<User>[] = [
  {
    header: "Usuario",
    cell: (user) => (
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 overflow-hidden rounded-full">
          <Image
            width={40}
            height={40}
            src={user.image || "/images/user/user-17.jpg"}
            alt={user.firstname + " " + user.lastname}
          />
        </div>
        <div>
          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
            {user.firstname + " " + user.lastname}
          </span>
          <span className="block text-xs text-gray-500 dark:text-gray-400">
            {user.email}
          </span>
        </div>
      </div>  
    ),
  },
  {
    header: "Teléfono",
    accessorKey: "phoneNumber",
  },
  {
    header: "DPI",
    accessorKey: "dpi",
  },
  {
    header: "Rol",
    cell: (user) => {
      const getRoleColor = (roleName: string) => {
        switch (roleName.toUpperCase()) {
          case "ADMIN":
            return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
  
          case "PARTICIPANTE":
            return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
          case "CLIENTE":
            return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
        
            case "RECEPCIONISTA":
          case "RECEPTIONIST":
            return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
          default:
            return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
        }
      };
      return (
        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role.name)}`}>
          {user.role.name}
        </span>
      );
    },
  },
  {
    header: "Estado",
    cell: (user) => (
      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
        user.active 
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" 
          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
      }`}>
        {user.active ? "Activo" : "Inactivo"}
      </span>
    ),
  },
  {
    header: "2FA",
    cell: (user) => (
      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
        user.use2fa 
          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" 
          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
      }`}>
        {user.use2fa ? "Habilitado" : "Deshabilitado"}
      </span>
    ),
  },
];

export default function UserTable() {
  const { isOpen, openModal, closeModal } = useModal();
  const {users, loading, error, fetchUsers, totalItems, updateUser, deleteUser, createUser } = useUser();
  const { roles } = useRole();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    dpi: 0,
    phoneNumber: "",
    active: true,
    use2fa: false,
    roleId: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const totalPages = Math.max(1, Math.ceil((totalItems || 0) / itemsPerPage));

  // Fetch page when currentPage or page size changes
  React.useEffect(() => {
    fetchUsers({ page: currentPage - 1, size: itemsPerPage });
  }, [currentPage, itemsPerPage, fetchUsers]);

  const handleAddUser = () => {
    setIsCreating(true);
    setSelectedUser(null);
    setLocalError(null);
    setFormData({
      firstname: "",
      lastname: "",
      email: "",
      dpi: 0,
      phoneNumber: "",
      active: true,
      use2fa: false,
      roleId: 0,
    });
    openModal();
  };

  const handleEdit = (user: User) => {
    setIsCreating(false);
    setSelectedUser(user);
    setLocalError(null);
    setFormData({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      dpi: user.dpi,
      phoneNumber: user.phoneNumber,
      active: user.active,
      use2fa: user.use2fa,
      roleId: user.role.id,
    });
    openModal();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    
    if (isCreating) {
      // Validación mínima para creación
      if (!formData.firstname || !formData.lastname || !formData.email) {
        setLocalError("Completa nombre, apellido y email.");
        return;
      }
      if (!formData.phoneNumber) {
        setLocalError("Ingresa un teléfono válido.");
        return;
      }
      if (!formData.roleId || formData.roleId === 0) {
        setLocalError("Selecciona un rol válido.");
        return;
      }
      // Crear nuevo usuario - estructura específica del backend
      const createData = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        dpi: Number(formData.dpi),
        phoneNumber: formData.phoneNumber,
        password: "123456789", 
        roleId: formData.roleId,
      };
      const success = await createUser(createData);
      if (success) {
        // refresh current page
        await fetchUsers({ page: currentPage - 1, size: itemsPerPage });
        closeModal();
        setIsCreating(false);
      }
    } else if (selectedUser) {
      // Actualizar usuario existente
      const dataToSend = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        dpi: Number(formData.dpi),
        phoneNumber: formData.phoneNumber,
        isActive: formData.active,
        use2fa: formData.use2fa,
        roleId: formData.roleId,
      };
      const success = await updateUser(selectedUser.id, dataToSend);
      if (success) {
        await fetchUsers({ page: currentPage - 1, size: itemsPerPage });
        closeModal();
        setIsCreating(false);
      }
    }
  };

  if (loading && users.length === 0) return <div>Cargando user...</div>;
  // Solo mostrar error a pantalla completa si no hay datos
  if (error && users.length === 0) return <div>Error: {error}</div>;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
      {/* Header con botón a la derecha */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Lista de Usuarios
        </h3>
        <button
          onClick={handleAddUser}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          + Agregar Usuario
        </button>
      </div>

      <GenericTable
        data={users}
        columns={columns}
        onEdit={handleEdit}
        onDelete={(user) => deleteUser(user.id)}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
      />
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {isCreating ? "Agregar Usuario" : "Editar Usuario"}
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              {isCreating ? "Crear un nuevo usuario en el sistema" : "Actualizar los detalles del usuario"}
            </p>
          </div>
          <form className="flex flex-col" onSubmit={handleSave}>
            <div className="custom-scrollbar h-[500px] overflow-y-auto px-2 pb-3">
              {(localError || error) && (
                <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 rounded-lg dark:bg-red-900/10 dark:text-red-400">
                  <p className="font-semibold mb-1">Error:</p>
                  <p className="overflow-wrap break-word">{localError || error}</p>
                </div>
              )}
              <div className="mt-7">
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  {/* Nombre */}
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Nombre</Label>
                    <Input
                      type="text"
                      placeholder="Ingrese el nombre"
                      value={formData.firstname}
                      onChange={(e) =>
                        setFormData({ ...formData, firstname: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* Apellido */}
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Apellido</Label>
                    <Input
                      type="text"
                      placeholder="Ingrese el apellido"
                      value={formData.lastname}
                      onChange={(e) =>
                        setFormData({ ...formData, lastname: e.target.value })
                      }
                    />
                  </div>

                  {/* Email */}
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="Ingrese el email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* DPI */}
                  <div className="col-span-2 lg:col-span-1">
                    <Label>DPI</Label>
                    <Input
                      type="number"
                      placeholder="Ingrese el DPI"
                      value={formData.dpi}
                      onChange={(e) =>
                        setFormData({ ...formData, dpi: Number(e.target.value) })
                      }
                    />
                  </div>

                  {/* Teléfono */}
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Teléfono</Label>
                    <Input
                      type="tel"
                      placeholder="Ingrese el teléfono"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, phoneNumber: e.target.value })
                      }
                    />
                  </div>

                  {/* Rol */}
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Rol</Label>
                    <select
                      value={formData.roleId}
                      onChange={(e) =>
                        setFormData({ ...formData, roleId: Number(e.target.value) })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="0" disabled>Seleccione un rol</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Estado Activo - Solo edición */}
                  {!isCreating && (
                    <div className="col-span-2 lg:col-span-1">
                      <Label>Estado</Label>
                      <select
                        value={formData.active ? "active" : "inactive"}
                        onChange={(e) =>
                          setFormData({ ...formData, active: e.target.value === "active" })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                      </select>
                    </div>
                  )}

                  {/* 2FA - Solo edición */}
                  {!isCreating && (
                    <div className="col-span-2 lg:col-span-1">
                      <Label>Autenticación de dos factores</Label>
                      <select
                        value={formData.use2fa ? "enabled" : "disabled"}
                        onChange={(e) =>
                          setFormData({ ...formData, use2fa: e.target.value === "enabled" })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="enabled">Habilitado</option>
                        <option value="disabled">Deshabilitado</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <button 
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {isCreating ? "Crear Usuario" : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}