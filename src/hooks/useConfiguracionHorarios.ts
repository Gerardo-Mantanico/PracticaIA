"use client";

import { useCallback, useEffect, useState } from "react";
import scheduleConfigApi from "@/service/scheduleConfig.service";
import type {
  ConfiguracionHorario,
  ConfiguracionHorarioPayload,
  ScheduleConfigDto,
} from "@/interfaces/ScheduleConfig";

const asArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];

  const response = value as {
    content?: unknown[];
    data?: unknown[];
    items?: unknown[];
    rows?: unknown[];
    results?: unknown[];
  };

  return response.content || response.data || response.items || response.rows || response.results || [];
};

const toTimeOnly = (value: string | undefined, fallback: string): string => {
  if (!value) return fallback;

  const normalized = String(value).trim();
  if (/^\d{2}:\d{2}/.test(normalized)) {
    return normalized.slice(0, 5);
  }

  const date = new Date(normalized);
  if (!Number.isNaN(date.getTime())) {
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  const match = normalized.match(/(\d{2}:\d{2})/);
  return match?.[1] || fallback;
};

const toTodayDateWithZ = (timeValue: string | undefined, fallback: string): string => {
  const hhmm = toTimeOnly(timeValue, fallback);
  const [hoursRaw, minutesRaw] = hhmm.split(":");
  const hours = String(Number(hoursRaw || "0")).padStart(2, "0");
  const minutes = String(Number(minutesRaw || "0")).padStart(2, "0");

  const today = new Date();
  const year = String(today.getFullYear());
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:00.000Z`;
};

const toMethodValue = (value: unknown, fallback: 1 | 2): 1 | 2 => {
  const parsed = Number(value);
  return parsed === 2 ? 2 : fallback;
};

const toConfiguracionHorario = (dto: Partial<ScheduleConfigDto>): ConfiguracionHorario => {
  const id = String(dto.scheduleConfigId ?? "");
  return {
    id,
    nombre: `Configuración ${id || "sin ID"}`,
    minutosPorPeriodo: Number(dto.periodDurationM ?? 50),
    jornadaMananaInicio: toTimeOnly(dto.morningStartTime, "07:00"),
    jornadaMananaFin: toTimeOnly(dto.morningEndTime, "12:00"),
    jornadaTardeInicio: toTimeOnly(dto.afternoonStartTime, "13:00"),
    jornadaTardeFin: toTimeOnly(dto.afternoonEndTime, "18:00"),
    maxGeneraciones: Number(dto.maxGeneration ?? 200),
    poblacionInicial: Number(dto.startPopulationSize ?? 100),
    criterioFinalizacion: "max_generaciones",
    metodoSeleccion: toMethodValue(dto.selectionMethod, 1),
    metodoCruce: toMethodValue(dto.crossMethod, 1),
    metodoMutacion: toMethodValue(dto.mutationMethod, 1),
    activa: true,
  };
};

const toScheduleConfigPayload = (data: ConfiguracionHorarioPayload) => {
  return {
    periodDurationM: Number(data.minutosPorPeriodo ?? 50),
    morningStartTime: toTodayDateWithZ(data.jornadaMananaInicio, "07:00"),
    morningEndTime: toTodayDateWithZ(data.jornadaMananaFin, "12:00"),
    afternoonStartTime: toTodayDateWithZ(data.jornadaTardeInicio, "13:00"),
    afternoonEndTime: toTodayDateWithZ(data.jornadaTardeFin, "18:00"),
    maxGeneration: Number(data.maxGeneraciones ?? 200),
    startPopulationSize: Number(data.poblacionInicial ?? 100),
    selectionMethod: Number(data.metodoSeleccion ?? 1),
    crossMethod: Number(data.metodoCruce ?? 1),
    mutationMethod: Number(data.metodoMutacion ?? 1),
  };
};

export const useConfiguracionHorarios = () => {
  const [configuraciones, setConfiguraciones] = useState<ConfiguracionHorario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfiguraciones = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await scheduleConfigApi.getAll();
      const rows = asArray(response) as Partial<ScheduleConfigDto>[];
      setConfiguraciones(rows.map(toConfiguracionHorario));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Error al cargar configuraciones");
      } else {
        setError("Error al cargar configuraciones");
      }
      setConfiguraciones([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createConfiguracion = async (data: ConfiguracionHorarioPayload) => {
    setLoading(true);
    setError(null);

    try {
      const created = await scheduleConfigApi.create(toScheduleConfigPayload(data));
      await fetchConfiguraciones();

      const createdConfig = toConfiguracionHorario(created as Partial<ScheduleConfigDto>);
      return createdConfig;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Error al crear configuración");
      } else {
        setError("Error al crear configuración");
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateConfiguracion = async (id: string, data: ConfiguracionHorarioPayload) => {
    setLoading(true);
    setError(null);

    try {
      await scheduleConfigApi.update(id, toScheduleConfigPayload(data));
      await fetchConfiguraciones();
      return true;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Error al actualizar configuración");
      } else {
        setError("Error al actualizar configuración");
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteConfiguracion = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await scheduleConfigApi.delete(id);
      await fetchConfiguraciones();
      return true;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Error al eliminar configuración");
      } else {
        setError("Error al eliminar configuración");
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfiguraciones();
  }, [fetchConfiguraciones]);

  return {
    configuraciones,
    loading,
    error,
    fetchConfiguraciones,
    createConfiguracion,
    updateConfiguracion,
    deleteConfiguracion,
  };
};
