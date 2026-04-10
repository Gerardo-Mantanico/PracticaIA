import { createDemoCrudService } from "./demoCrud.service";
import { configuracionesSeed } from "./demoSeed.data";

const baseService = createDemoCrudService({
  storageKey: "demo:configuracion-horarios",
  seed: configuracionesSeed,
  sortBy: "nombre",
});

const validateConfig = (payload) => {
  const minutos = Number(payload.minutosPorPeriodo || 0);
  if (minutos < 40 || minutos > 60) {
    throw new Error("El tiempo por periodo debe estar entre 40 y 60 minutos");
  }

  if (Number(payload.maxGeneraciones || 0) <= 0) {
    throw new Error("El máximo de generaciones debe ser mayor a cero");
  }

  if (Number(payload.poblacionInicial || 0) <= 0) {
    throw new Error("La población inicial debe ser mayor a cero");
  }
};

export const horarioConfiguracionApi = {
  ...baseService,
  create: async (payload) => {
    validateConfig(payload);
    return baseService.create(payload);
  },
  update: async (id, payload) => {
    validateConfig(payload);
    return baseService.update(id, payload);
  },
};

export default horarioConfiguracionApi;
