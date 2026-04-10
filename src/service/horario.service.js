import { createDemoCrudService } from "./demoCrud.service";
import { horariosSeed } from "./demoSeed.data";

const baseService = createDemoCrudService({
  storageKey: "demo:horarios",
  seed: horariosSeed,
  sortBy: "dia",
});

const toMinutes = (hhmm) => {
  const [hour, minute] = String(hhmm || "0:0").split(":").map(Number);
  return hour * 60 + minute;
};

const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd;

const validatePayload = (payload) => {
  if (!payload.cursoCodigo?.trim()) throw new Error("El código de curso es obligatorio");
  if (!payload.dia?.trim()) throw new Error("El día es obligatorio");
  if (!payload.inicio || !payload.fin) throw new Error("Debes indicar hora de inicio y fin");
  if (!payload.sinSalon && !payload.salonNombre?.trim()) throw new Error("Debes asignar salón o marcar sin salón");

  if (toMinutes(payload.fin) <= toMinutes(payload.inicio)) {
    throw new Error("La hora de fin debe ser mayor a la de inicio");
  }
};

const detectWarnings = (items, candidate, idToIgnore = null) => {
  const warnings = [];
  for (const row of items) {
    if (String(row.id) === String(idToIgnore)) continue;
    if (row.dia !== candidate.dia) continue;

    const conflict = overlaps(toMinutes(row.inicio), toMinutes(row.fin), toMinutes(candidate.inicio), toMinutes(candidate.fin));
    if (!conflict) continue;

    if (row.salonNombre && candidate.salonNombre && row.salonNombre === candidate.salonNombre) {
      warnings.push(`Choque de salón: ${row.salonNombre} (${row.inicio}-${row.fin})`);
    }

    if (row.docenteRegistro && candidate.docenteRegistro && row.docenteRegistro === candidate.docenteRegistro) {
      warnings.push(`Choque de docente: ${row.docenteRegistro} (${row.inicio}-${row.fin})`);
    }
  }

  return warnings;
};

/**
 * @param {Partial<import("@/interfaces/HorariosDemo").HorarioGenerado>} payload
 * @param {string | number | null | undefined} idToIgnore
 */
const validateHorario = async (payload, idToIgnore = null) => {
  const items = await baseService.getAll();
  return detectWarnings(items, payload, idToIgnore);
};

export const horarioApi = {
  ...baseService,
  create: async (payload) => {
    validatePayload(payload);
    const items = await baseService.getAll();
    const warnings = detectWarnings(items, payload);
    const created = await baseService.create(payload);
    return {
      ...created,
      warnings,
    };
  },
  update: async (id, payload) => {
    validatePayload(payload);
    const items = await baseService.getAll();
    const warnings = detectWarnings(items, payload, id);
    const updated = await baseService.update(id, payload);
    return {
      ...updated,
      warnings,
    };
  },
  validate: validateHorario,
};

export default horarioApi;
