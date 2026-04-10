import { useCrud } from "./useCrud";
import docenteApi from "@/service/docente.service";

export interface Docente {
  id: number;
  professorCode?: number;
  firstName: string;
  secondName: string;
  lastName: string;
  secondLastName: string;
  entryTime: string;
  exitTime: string;
}

type DocentePayload = {
  professorCode: number;
  firstName: string;
  secondName: string;
  lastName: string;
  secondLastName: string;
  entryTime: string;
  exitTime: string;
};

const transformPayload = (data: unknown): DocentePayload => {
  const value = (data ?? {}) as Partial<Docente>;

  return {
    professorCode: Number(value.professorCode ?? value.id ?? 0),
    firstName: String(value.firstName ?? "").trim(),
    secondName: String(value.secondName ?? "").trim(),
    lastName: String(value.lastName ?? "").trim(),
    secondLastName: String(value.secondLastName ?? "").trim(),
    entryTime: String(value.entryTime ?? ""),
    exitTime: String(value.exitTime ?? ""),
  };
};

export const useDocente = () => {
  const {
    items: docentes,
    loading,
    error,
    fetchItems: fetchDocentes,
    createItem: createDocente,
    updateItem: updateDocente,
    deleteItem: deleteDocente,
  } = useCrud<Docente>(docenteApi, transformPayload);

  return {
    docentes,
    loading,
    error,
    fetchDocentes,
    createDocente,
    updateDocente,
    deleteDocente,
  };
};
