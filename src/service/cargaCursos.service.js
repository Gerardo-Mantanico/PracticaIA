import api from "./api.service";

const parseCsvLine = (line) => {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }

  result.push(current.trim());
  return result;
};

const parseCsv = (text) => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase());
  const rows = lines.slice(1).map((line) => parseCsvLine(line));
  return { headers, rows };
};

const postToEndpoint = async (candidates, payload) => {
  let lastError = null;

  for (const endpoint of candidates) {
    try {
      return await api.post(endpoint, payload);
    } catch (error) {
      lastError = error;
      const status = Number(error?.status ?? 0);
      if (![404, 405].includes(status)) {
        break;
      }
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error("No se encontró un endpoint compatible para la importación");
};

const importCursos = async (parsed) => {
  const required = ["nombre", "código", "carrera", "semestre", "sección", "tipo"];
  const missing = required.filter((field) => !parsed.headers.includes(field));
  if (missing.length > 0) {
    throw new Error(`Encabezados faltantes: ${missing.join(", ")}`);
  }

  const errors = [];
  let imported = 0;

  for (const [index, row] of parsed.rows.entries()) {
    const [nombre, codigo, carrera, semestre, seccion, tipo] = row;
    if (!nombre || !codigo || !carrera || !semestre || !tipo) {
      errors.push(`Fila ${index + 2}: campos obligatorios incompletos`);
      continue;
    }

    try {
      await postToEndpoint(["/course", "/courses"], {
        courseCode: Number(codigo),
        name: String(nombre).trim(),
        defaultCredits: Number(semestre) > 0 ? Number(semestre) : 1,
        metadata: {
          carrera,
          seccion,
          tipo: String(tipo).trim(),
        },
      });
      imported += 1;
    } catch (error) {
      errors.push(`Fila ${index + 2}: ${error instanceof Error ? error.message : "Error al importar curso"}`);
    }
  }

  return { imported, errors };
};

const importSalones = async (parsed) => {
  const required = ["nombre del salón", "id"];
  const missing = required.filter((field) => !parsed.headers.includes(field));
  if (missing.length > 0) {
    throw new Error(`Encabezados faltantes: ${missing.join(", ")}`);
  }

  const errors = [];
  let imported = 0;

  for (const [index, row] of parsed.rows.entries()) {
    const [nombre, id] = row;
    if (!nombre || !id) {
      errors.push(`Fila ${index + 2}: nombre o id incompleto`);
      continue;
    }

    try {
      await postToEndpoint(["/classrooms", "/classroom"], {
        name: String(nombre).trim(),
        classTypeId: 1,
        capacity: Number(id) > 0 ? Number(id) : 1,
        typeOfSchedule: "MORNING",
      });
      imported += 1;
    } catch (error) {
      errors.push(`Fila ${index + 2}: ${error instanceof Error ? error.message : "Error al importar salón"}`);
    }
  }

  return { imported, errors };
};

const importDocentes = async (parsed) => {
  const required = ["nombre", "registro de personal", "hora de entrada y salida"];
  const missing = required.filter((field) => !parsed.headers.includes(field));
  if (missing.length > 0) {
    throw new Error(`Encabezados faltantes: ${missing.join(", ")}`);
  }

  const errors = [];
  let imported = 0;

  for (const [index, row] of parsed.rows.entries()) {
    const [nombre, registroPersonal, horas] = row;
    if (!nombre || !registroPersonal || !horas) {
      errors.push(`Fila ${index + 2}: campos incompletos`);
      continue;
    }

    const [horaEntrada, horaSalida] = String(horas).split("-").map((value) => value?.trim());

    try {
      await postToEndpoint(["/professors", "/professor"], {
        professorCode: Number(registroPersonal) || Number(index + 1),
        firstName: String(nombre).trim(),
        secondName: "",
        lastName: "",
        secondLastName: "",
        entryTime: horaEntrada || "07:00",
        exitTime: horaSalida || "13:00",
      });
      imported += 1;
    } catch (error) {
      errors.push(`Fila ${index + 2}: ${error instanceof Error ? error.message : "Error al importar docente"}`);
    }
  }

  return { imported, errors };
};

export const cargaCursosApi = {
  parseCsv,
  importCursos,
  importSalones,
  importDocentes,
};

export default cargaCursosApi;
