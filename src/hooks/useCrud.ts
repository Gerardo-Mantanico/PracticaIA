
"use client";

import { useState, useEffect, useCallback } from 'react';

interface ApiService {
  getAll: (params?: Record<string, unknown>) => Promise<unknown>;
  create: (data: unknown) => Promise<unknown>;
  update: (id: number | string, data: unknown) => Promise<unknown>;
  delete: (id: number | string) => Promise<unknown>;
  get?: (id: number | string) => Promise<unknown>; 
}

export const useCrud = <T extends { id: number | string }>(
  apiService: ApiService,
  transformPayload?: (data: unknown) => unknown
) => {
  const [items, setItems] = useState<T[]>([]);
  const [item, setItem] = useState<T | null>(null); // Estado para un solo ítem
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState<number | null>(null);

  // Obtener elementos
  const fetchItems = useCallback(async (params: Record<string, unknown> = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getAll(params);

      // Si el backend devuelve un array directamente
      if (Array.isArray(response)) {
        setItems(response as T[]);
        setTotalItems((response as T[]).length);
        return { items: response as T[], total: (response as T[]).length };
      }

      // Intentar parsear estructura de paginación típica de Spring Data
      type PageResp = {
        content?: unknown[];
        data?: unknown[];
        items?: unknown[];
        rows?: unknown[];
        results?: unknown[];
        totalElements?: number;
        total?: number;
        totalItems?: number;
      };
      const respObj = response as PageResp;
      const content = respObj.content || respObj.data || respObj.items || null;
      let total: number | null = null;
      if (typeof respObj.totalElements === 'number') {
        total = respObj.totalElements;
      } else if (typeof respObj.total === 'number') {
        total = respObj.total;
      } else if (typeof respObj.totalItems === 'number') {
        total = respObj.totalItems;
      }

      if (Array.isArray(content)) {
        setItems(content as T[]);
        setTotalItems(total ?? (content as T[]).length);
        return { items: content as T[], total: total ?? (content as T[]).length };
      }

      // Si response contiene un campo 'rows' o es un objeto con lista directamente
      const fallbackArray = respObj?.rows || respObj?.results || null;
      if (Array.isArray(fallbackArray)) {
        setItems(fallbackArray as T[]);
        setTotalItems(total ?? (fallbackArray as T[]).length);
        return { items: fallbackArray as T[], total: total ?? (fallbackArray as T[]).length };
      }

      console.error('Formato de respuesta inesperado:', response);
      setItems([]);
      setTotalItems(0);
      setError('Formato de datos inválido');
      return { items: [], total: 0 };
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Error al cargar datos');
      } else {
        setError('Error desconocido al cargar datos');
      }
      console.error(err);
      return { items: [], total: 0 };
    } finally {
      setLoading(false);
    }
  }, [apiService]);

  const createItem = async (data: Partial<T>) => {
    setLoading(true);
    try {
      const payload = transformPayload ? transformPayload(data) : data;
      await apiService.create(payload);
      // Recargar desde backend para evitar filas parciales o nulas en tablas.
      await fetchItems();

      return true;
    } catch (err: unknown) {
      let errorMessage = 'Error al crear elemento';
      if (err instanceof Error) {
        errorMessage = err.message || errorMessage;
        // Log del error completo para debugging
        console.error('Error detallado al crear:', {
          message: err.message,
          stack: err.stack,
          payload: data,
        });
      } else {
        console.error('Error desconocido al crear:', err);
      }
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar elemento
  const updateItem = async (id: number | string, data: Partial<T>) => {
    setLoading(true);
    try {
      const payload = transformPayload ? transformPayload({ ...data, id }) : { ...data, id };
      console.log(`Actualizando elemento ${id} con payload:`, payload);
      
      await apiService.update(id, payload);
      await fetchItems(); // Recargar lista
      return true;
    } catch (err: unknown) {
      console.error("Error en updateItem:", err);
      if (err instanceof Error) {
        let errorMessage = err.message || 'Error al actualizar elemento';
        setError(errorMessage);
      } else {
        setError('Error desconocido al actualizar elemento');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar elemento
  const deleteItem = async (id: number | string) => {
    setLoading(true);
    try {
      await apiService.delete(id);
      await fetchItems(); // Recargar lista
      return true;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Error al eliminar elemento');
      } else {
        setError('Error desconocido al eliminar elemento');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Obtener un solo elemento por ID (GET /{id})
  const getItem = async (id: number | string): Promise<T | null> => {
    if (!apiService.get) {
      console.error('El servicio no implementa get(id)');
      setError('Operación no soportada');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.get(id);

      if (response && typeof response === 'object') {
        setItem(response as T); // <-- Cambio clave: Actualiza el estado 'item'
        return response as T;
      }

      console.error('Formato de respuesta inesperado en getItem:', response);
      setItem(null);
      setError('Formato de datos inválido');
      return null;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Error al obtener elemento');
      } else {
        setError('Error desconocido al obtener elemento');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Cargar al montar
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);


  const createFormDataItem = async (data: Partial<T>) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Si es un archivo, lo agregamos como tal
          if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        }
      });
      await apiService.create(formData);
      return true;
    } catch (err: unknown) {
      let errorMessage = 'Error al crear elemento (FormData)';
      if (err instanceof Error) {
        const extra = (err as unknown as { data?: unknown }).data;
        errorMessage = err.message || errorMessage;
        if (extra) {
          try {
            errorMessage = `${errorMessage} — ${JSON.stringify(extra)}`;
          } catch {}
        }
        console.error('Error detallado al crear (FormData):', {
          message: err.message,
          data: extra,
          stack: err.stack,
          payload: data,
        });
      } else {
        console.error('Error desconocido al crear (FormData):', err);
      }
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    items,
    item, // <-- Cambio clave: Devuelve el estado 'item'
    loading,
    error,
    totalItems,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    getItem,
    createFormDataItem
  };
};
