import { useCrud } from "./useCrud";
import careerApi from "@/service/career.service";

export interface Career {
  careerId: number;
  id: number;
  careerCode: number;
  name: string;
  active: boolean;
}

const transformPayload = (data: unknown): Pick<Career, "name"> => {
  const value = (data ?? {}) as Partial<Career>;

  return {
    name: String(value.name ?? "").trim(),
  };
};

export const useCareer = () => {
  const {
    items: careers,
    loading,
    error,
    fetchItems: fetchCareers,
    createItem: createCareer,
    updateItem: updateCareer,
    deleteItem: deleteCareer,
  } = useCrud<Career>(careerApi, transformPayload);

  return {
    careers,
    loading,
    error,
    fetchCareers,
    createCareer,
    updateCareer,
    deleteCareer,
  };
};
