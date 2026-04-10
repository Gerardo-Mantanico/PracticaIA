import { useCrud } from "./useCrud";
import pensumApi from "@/service/pensum.service";

export interface Pensum {
  id: number;
  name: string;
  creditsNeeded: number;
  careerId: number;
  careerName?: string;
  active: boolean;
}

const transformPayload = (data: unknown): Pick<Pensum, "name" | "creditsNeeded" | "careerId"> => {
  const value = (data ?? {}) as Partial<Pensum>;

  return {
    name: String(value.name ?? "").trim(),
    creditsNeeded: Number(value.creditsNeeded ?? 0),
    careerId: Number(value.careerId ?? 0),
  };
};

export const usePensum = () => {
  const {
    items: pensums,
    loading,
    error,
    fetchItems: fetchPensums,
    createItem: createPensum,
    updateItem: updatePensum,
    deleteItem: deletePensum,
  } = useCrud<Pensum>(pensumApi, transformPayload);

  return {
    pensums,
    loading,
    error,
    fetchPensums,
    createPensum,
    updatePensum,
    deletePensum,
  };
};
