import { useCallback } from "react";
import { useCrud } from "./useCrud";
import convocatoriaApi from "@/service/convocatoria.service";

export interface Convocatoria {
  id: number;
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  congresoId: number;
  estado?: boolean | string;
  createdAt?: string;
  updatedAt?: string;
}

type ConvocatoriaPayload = {
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  congresoId: number;
  estado?: boolean | string;
};

const transformPayload = (data: unknown): ConvocatoriaPayload => {
  const value = (data ?? {}) as Partial<Convocatoria>;
  const legacyActivo = (value as { activo?: unknown }).activo;
  let normalizedEstado: boolean | string | undefined;

  if (typeof value.estado === "boolean") {
    normalizedEstado = value.estado;
  } else if (typeof value.estado === "string") {
    normalizedEstado = value.estado;
  } else if (typeof legacyActivo === "boolean") {
    normalizedEstado = legacyActivo;
  }

  return {
    nombre: value.nombre ?? "",
    descripcion: value.descripcion ?? "",
    fechaInicio: value.fechaInicio ?? "",
    fechaFin: value.fechaFin ?? "",
    congresoId: Number(value.congresoId ?? 0),
    estado: normalizedEstado,
  };
};

export const useConvocatoria = () => {
  const {
    items: convocatorias,
    loading,
    error,
    totalItems,
    fetchItems,
    createItem: createConvocatoria,
    updateItem: updateConvocatoria,
    deleteItem: deleteConvocatoria,
  } = useCrud<Convocatoria>(convocatoriaApi, transformPayload);

  const fetchConvocatoriasByCongreso = useCallback(
    async (congresoId: number, page = 0, size = 1000) => {
      return fetchItems({ congresoId, page, size, estado: "ACTIVO" });
    },
    [fetchItems]
  );

  return {
    convocatorias,
    loading,
    error,
    totalItems,
    fetchConvocatoriasByCongreso,
    createConvocatoria,
    updateConvocatoria,
    deleteConvocatoria,
  };
};
