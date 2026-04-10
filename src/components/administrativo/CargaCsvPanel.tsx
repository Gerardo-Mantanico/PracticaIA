"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import Label from "@/components/form/Label";
import FileInput from "@/components/form/input/FileInput";
import Button from "@/components/ui/button/Button";
import { useCargaCsvCursos } from "@/hooks/useCargaCsvCursos";

type ImportTarget = "cursos" | "salones" | "docentes";

const formatHelpByTarget: Record<ImportTarget, string> = {
  cursos: "Formato: Nombre, código, carrera, semestre, sección, tipo",
  salones: "Formato: Nombre del salón, id",
  docentes: "Formato: Nombre, registro de personal, hora de entrada y salida",
};

export default function CargaCsvPanel() {
  const { loading, error, importCsvText } = useCargaCsvCursos();
  const [target, setTarget] = useState<ImportTarget>("cursos");
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null);

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const content = await file.text();
    const response = await importCsvText(target, content);
    setResult(response);

    if (response.errors.length === 0) {
      toast.success(`Importación completada (${response.imported} registros)`);
    } else {
      toast.error(`Importación parcial (${response.imported} OK / ${response.errors.length} con error)`);
    }
  };

  return (
    <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 dark:border-white/5 dark:bg-white/3">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Carga de datos por CSV</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Carga cursos, salones y docentes para poblar la demo sin depender del backend.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <Label>Tipo de carga</Label>
          <select
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700"
            value={target}
            onChange={(event) => setTarget(event.target.value as ImportTarget)}
          >
            <option value="cursos">Cursos</option>
            <option value="salones">Salones</option>
            <option value="docentes">Docentes</option>
          </select>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{formatHelpByTarget[target]}</p>
        </div>

        <div>
          <Label>Archivo CSV</Label>
          <FileInput onChange={handleFile} />
        </div>
      </div>

      {loading && <p className="text-sm text-gray-500 dark:text-gray-400">Procesando archivo...</p>}

      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/10 dark:text-red-400">{error}</div>}

      {result && (
        <div className="rounded-lg border border-gray-200 p-4 dark:border-white/10">
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">Registros importados: {result.imported}</p>
          {result.errors.length > 0 ? (
            <div className="mt-3">
              <p className="mb-2 text-sm font-medium text-red-600 dark:text-red-300">Errores detectados:</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-red-600 dark:text-red-300">
                {result.errors.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-2 text-sm text-green-600 dark:text-green-300">Archivo procesado sin errores.</p>
          )}
        </div>
      )}

      <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600 dark:bg-white/5 dark:text-gray-300">
        <p className="font-medium">Nota:</p>
        <p>La relación Docente-Curso se recomienda cargar después de tener cursos y docentes en el sistema.</p>
      </div>

      <div className="flex justify-end">
        <Button size="sm" variant="outline" type="button" onClick={() => setResult(null)}>
          Limpiar resultado
        </Button>
      </div>
    </div>
  );
}
