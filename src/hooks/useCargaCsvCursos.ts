import { useState } from "react";
import cargaCursosApi from "@/service/cargaCursos.service";

type ImportTarget = "cursos" | "salones" | "docentes";

export const useCargaCsvCursos = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const importCsvText = async (target: ImportTarget, csvText: string) => {
    setLoading(true);
    setError(null);

    try {
      const parsed = cargaCursosApi.parseCsv(csvText);
      if (!parsed.headers.length) {
        throw new Error("El archivo CSV está vacío");
      }

      if (target === "cursos") {
        return cargaCursosApi.importCursos(parsed);
      }

      if (target === "salones") {
        return cargaCursosApi.importSalones(parsed);
      }

      return cargaCursosApi.importDocentes(parsed);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al importar CSV";
      setError(message);
      return { imported: 0, errors: [message] };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    importCsvText,
  };
};
