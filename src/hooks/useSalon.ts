import { useCrud } from "./useCrud";
import salonApi from "../service/salon.service.js";

export interface Salon {
  id: number;
  classroomId?: number;
  name: string;
  classTypeId: number;
  capacity: number;
  typeOfSchedule: "MORNING" | "AFTERNOON" | "NIGHT";
  active?: boolean;
  createdAt?: string;
  createdBy?: string | null;
  updatedAt?: string;
  updatedBy?: string | null;
}

type SalonPayload = {
  name: string;
  classTypeId: number;
  capacity: number;
  typeOfSchedule: "MORNING" | "AFTERNOON" | "NIGHT";
};

const transformPayload = (data: unknown): SalonPayload => {
  const value = (data ?? {}) as Partial<Salon>;
  const rawSchedule = String(value.typeOfSchedule ?? "MORNING").toUpperCase();
  const normalizedSchedule = rawSchedule === "AFTERNOON" || rawSchedule === "NIGHT" ? rawSchedule : "MORNING";

  return {
    name: String(value.name ?? "").trim(),
    classTypeId: Number(value.classTypeId ?? 0),
    capacity: Number(value.capacity ?? 1),
    typeOfSchedule: normalizedSchedule,
  };
};

export const useSalon = () => {
  const {
    items: salones,
    loading,
    error,
    fetchItems: fetchSalones,
    createItem: createSalon,
    updateItem: updateSalon,
    deleteItem: deleteSalon,
  } = useCrud<Salon>(salonApi, transformPayload);

  return {
    salones,
    loading,
    error,
    fetchSalones,
    createSalon,
    updateSalon,
    deleteSalon,
  };
};
