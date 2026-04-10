"use client";

import React, { useState, useEffect } from "react";
import SearchableSelect from "@/components/form/SearchableSelect";

interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  dpi?: string;
  phoneNumber?: string;
}

export default function EmployeeSearchExample() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Función para buscar usuarios en el backend
  const searchUsers = async (name: string) => {
    if (!name || name.trim().length < 2) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8090/api/v1/users/search?name=${encodeURIComponent(name)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error("Error al buscar usuarios:", response.status);
        setUsers([]);
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Buscar cuando cambia el término de búsqueda (con debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        searchUsers(searchTerm);
      }
    }, 300); // Espera 300ms después de que el usuario deja de escribir

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Transformar usuarios a opciones para el select
  const userOptions = users.map((user) => ({
    value: String(user.id),
    label: `${user.firstname} ${user.lastname}`,
    searchText: `DPI: ${user.dpi || 'N/A'} - Email: ${user.email}`,
  }));

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Búsqueda de Empleados</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Ejemplo de búsqueda usando: <code className="bg-gray-100 px-2 py-1 rounded dark:bg-gray-800">
            GET /api/v1/users/search?name=mocho
          </code>
        </p>
      </div>

      {/* Input de búsqueda manual */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Buscar por nombre
        </label>
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          placeholder="Escribe un nombre (ej: mocho)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {loading && (
          <p className="text-sm text-gray-500 mt-1">Buscando...</p>
        )}
      </div>

      {/* Select con resultados */}
      <SearchableSelect
        label="Seleccionar Empleado"
        options={userOptions}
        placeholder="Selecciona un empleado de los resultados..."
        searchPlaceholder="Filtrar resultados..."
        value={selectedUserId}
        onChange={(value) => setSelectedUserId(value)}
      />

      {/* Resultados de la búsqueda */}
      {users.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg dark:bg-blue-900/20">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
            Se encontraron {users.length} resultado(s)
          </p>
          <div className="space-y-2">
            {users.slice(0, 3).map((user) => (
              <div key={user.id} className="text-sm text-blue-800 dark:text-blue-400">
                • {user.firstname} {user.lastname} - {user.email}
              </div>
            ))}
            {users.length > 3 && (
              <p className="text-xs text-blue-600 dark:text-blue-500">
                Y {users.length - 3} más...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Usuario seleccionado */}
      {selectedUserId && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg dark:bg-green-900/20">
          <p className="text-sm font-medium text-green-900 dark:text-green-300 mb-2">
            Usuario seleccionado:
          </p>
          <p className="text-sm text-green-800 dark:text-green-400">
            <strong>ID:</strong> {selectedUserId}
          </p>
          <p className="text-sm text-green-800 dark:text-green-400">
            <strong>Nombre:</strong> {users.find((u) => String(u.id) === selectedUserId)?.firstname}{" "}
            {users.find((u) => String(u.id) === selectedUserId)?.lastname}
          </p>
          <p className="text-sm text-green-800 dark:text-green-400">
            <strong>Email:</strong> {users.find((u) => String(u.id) === selectedUserId)?.email}
          </p>
        </div>
      )}

      {/* Ejemplo de código */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg dark:bg-gray-800">
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Código de ejemplo:
        </p>
        <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
{`const searchUsers = async (name: string) => {
  const response = await fetch(
    \`http://localhost:8090/api/v1/users/search?name=\${name}\`
  );
  const data = await response.json();
  return data;
};

// Uso:
const results = await searchUsers("mocho");`}
        </pre>
      </div>
    </div>
  );
}
