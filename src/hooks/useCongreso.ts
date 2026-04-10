import { useCrud } from './useCrud';
import { congresoApi } from '../service/congreso.service';

export interface Congreso {
  id: number;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  ubicacion: string;
  precioInscripcion: number;
  comisionPorcentaje: number;
  fotoUrl: string;
  activo: boolean;
  institucionId: number;
  createdAt: string;
  updatedAt: string;
}

type CongresoPayload = {
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  ubicacion: string;
  precioInscripcion: number;
  comisionPorcentaje: number;
  fotoUrl: string;
  institucionId: number;
};

export const useCongreso = () => {
  const toIsoDate = (value?: string) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toISOString();
  };

  const transformPayload = (data: unknown): CongresoPayload => {
    const value = (data ?? {}) as Partial<Congreso>;

    return {
      titulo: value.titulo ?? "",
      descripcion: value.descripcion ?? "",
      fechaInicio: toIsoDate(value.fechaInicio),
      fechaFin: toIsoDate(value.fechaFin),
      ubicacion: value.ubicacion ?? "",
      precioInscripcion: Number(value.precioInscripcion ?? 0),
      comisionPorcentaje: Number(value.comisionPorcentaje ?? 0),
      fotoUrl: value.fotoUrl ?? "",
      institucionId: Number(value.institucionId ?? 0),
    };
  };

  const {
    items: congresos,
    loading,
    error,
    fetchItems: fetchCongresos,
    createItem: createCongreso,
    updateItem: updateCongreso,
    deleteItem: deleteCongreso
  } = useCrud<Congreso>(congresoApi, transformPayload);

  return {
    congresos,
    loading,
    error,
    fetchCongresos,
    createCongreso,
    updateCongreso,
    deleteCongreso,
  };
};
