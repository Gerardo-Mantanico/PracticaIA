import { useCrud } from "./useCrud";
import horarioApi from "@/service/horario.service";
import type { HorarioGenerado } from "@/interfaces/HorariosDemo";

const transformPayload = (data: unknown): Omit<HorarioGenerado, "id"> => {
  const value = (data ?? {}) as Partial<HorarioGenerado>;
  return {
    configuracionId: Number(value.configuracionId ?? 1),
    cursoCodigo: value.cursoCodigo ?? "",
    cursoNombre: value.cursoNombre ?? "",
    salonNombre: value.salonNombre,
    docenteRegistro: value.docenteRegistro,
    dia: value.dia ?? "Lunes",
    inicio: value.inicio ?? "07:00",
    fin: value.fin ?? "07:50",
    tipo: value.tipo ?? "CURSO",
    sinSalon: Boolean(value.sinSalon),
  };
};

export const useHorario = () => {
  const {
    items: horarios,
    loading,
    error,
    fetchItems: fetchHorarios,
    createItem: createHorario,
    updateItem: updateHorario,
    deleteItem: deleteHorario,
  } = useCrud<HorarioGenerado>(horarioApi, transformPayload);

  const validateHorario = async (payload: Partial<HorarioGenerado>, idToIgnore?: number | string) => {
    if (!horarioApi.validate) return [];
    const normalizedId = idToIgnore == null ? undefined : Number(idToIgnore);
    return horarioApi.validate(payload, normalizedId);
  };

  return {
    horarios,
    loading,
    error,
    fetchHorarios,
    createHorario,
    updateHorario,
    deleteHorario,
    validateHorario,
  };
};
