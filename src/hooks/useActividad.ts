import { useCrud } from "./useCrud";
import actividadApi from "@/service/actividad.service";

export interface Actividad {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  horaInicio: string;
  horaFin: string;
  capacidadMaxima: number;
  salonId?: number;
  congresoId: number;
  convocatoriaId?: number;
  archivoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

type ActividadPayload = {
  nombre: string;
  descripcion: string;
  tipo: string;
  horaInicio: string;
  horaFin: string;
  capacidadMaxima: number;
  congresoId: number;
  salonId?: number;
  convocatoriaId?: number;
  archivoUrl?: string;
};

const toIsoDate = (value?: string) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toISOString();
};

const transformPayload = (data: unknown): ActividadPayload => {
  const value = (data ?? {}) as Partial<Actividad>;

  const payload: ActividadPayload = {
    nombre: value.nombre ?? "",
    descripcion: value.descripcion ?? "",
    tipo: value.tipo ?? "",
    horaInicio: toIsoDate(value.horaInicio),
    horaFin: toIsoDate(value.horaFin),
    capacidadMaxima: Number(value.capacidadMaxima ?? 0),
    congresoId: Number(value.congresoId ?? 0),
  };

  if (value.salonId !== undefined && value.salonId !== null) {
    payload.salonId = Number(value.salonId);
  }

  if (value.convocatoriaId !== undefined && value.convocatoriaId !== null) {
    payload.convocatoriaId = Number(value.convocatoriaId);
  }

  if (typeof value.archivoUrl === "string") {
    payload.archivoUrl = value.archivoUrl;
  }

  return payload;
};

export const useActividad = () => {
  const {
    items: actividades,
    loading,
    error,
    fetchItems: fetchActividades,
    createItem: createActividad,
    updateItem: updateActividad,
    deleteItem: deleteActividad,
  } = useCrud<Actividad>(actividadApi, transformPayload);

  return {
    actividades,
    loading,
    error,
    fetchActividades,
    createActividad,
    updateActividad,
    deleteActividad,
  };
};
