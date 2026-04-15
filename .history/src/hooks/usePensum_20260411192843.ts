import { useCrud } from "./useCrud";
import pensumApi from "@/service/pensum.service";

export interface Pensum {
  id: number;
  pensumId?: number;
  pensumCode?: number;
  name: string;
  creditsNeeded: number;
  careerId: number;
  careerName?: string;
  active: boolean;
}

const transformPayload = (data: unknown): {
  name: string;
  creditsNeeded: number;
  careerId?: number;
} => {
  const value = (data ?? {}) as Partial<Pensum>;

  const careerId = Number(value.careerId);

  const payload: {
    name: string;
    creditsNeeded: number;
    careerId?: number;
  } = {
    name: String(value.name ?? "").trim(),
    creditsNeeded: Number(value.creditsNeeded ?? 0),
  };

  if (Number.isFinite(careerId) && careerId > 0) {
    payload.careerId = careerId;
  }

  return payload;
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
