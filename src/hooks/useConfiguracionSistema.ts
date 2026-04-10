"use client";

import { useCallback, useEffect, useState } from "react";
import { configuracionSistemaApi } from "../service/configuracionSistema.service";

export interface ConfiguracionSistema {
  id: number;
  comision: number;
  createdAt: string;
  updatedAt: string;
}

export const useConfiguracionSistema = () => {
  const [configuracion, setConfiguracion] = useState<ConfiguracionSistema | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfiguracion = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await configuracionSistemaApi.getConfiguracion();
      setConfiguracion(response as ConfiguracionSistema);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Error al cargar configuración del sistema");
      } else {
        setError("Error al cargar configuración del sistema");
      }
      setConfiguracion(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateComision = async (id: number, comision: number) => {
    setSaving(true);
    setError(null);

    try {
      await configuracionSistemaApi.updateConfiguracion(id, { comision });
      await fetchConfiguracion();
      return true;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Error al actualizar comisión");
      } else {
        setError("Error al actualizar comisión");
      }
      return false;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchConfiguracion();
  }, [fetchConfiguracion]);

  return {
    configuracion,
    loading,
    saving,
    error,
    fetchConfiguracion,
    updateComision,
  };
};
