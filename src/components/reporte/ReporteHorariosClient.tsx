"use client";

import React, { useMemo, useRef, useState } from "react";
import Button from "@/components/ui/button/Button";
import StripedCard from "@/components/common/StripedCard";
import { MdImage, MdTableChart, MdBarChart } from "react-icons/md";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useReporteHorarios } from "@/hooks/reporte/useReporteHorarios";
import { TableIcon, FileIcon, TaskIcon, CheckCircleIcon } from "@/icons";

export default function ReporteHorariosClient() {
  const refReporte = useRef<HTMLDivElement>(null);
  const [tipo, setTipo] = useState<"MIXTO" | "CURSO" | "LAB">("MIXTO");
  const [anio, setAnio] = useState("2026");
  const [semestre, setSemestre] = useState("1");
  const [carrera, setCarrera] = useState("Todas");

  const filters = useMemo(
    () => ({
      tipo,
      anio,
      semestre,
      carrera,
    }),
    [tipo, anio, semestre, carrera]
  );

  const { stats, grid, salones, loading } = useReporteHorarios(filters);

  const handleDescargarImagen = async () => {
    if (!refReporte.current) return;
    const canvas = await html2canvas(refReporte.current);
    canvas.toBlob((blob) => {
      if (blob) saveAs(blob, "reporte_horarios.png");
    });
  };

  const handleDescargarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(grid);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "reporte_horarios.xlsx");
  };

  return (
    <div className="mx-auto space-y-4 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-900">
      <div className="flex items-center gap-3 mb-6">
        <MdBarChart className="text-blue-600 dark:text-blue-400" size={28} />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Reportes y estadísticas de horarios</h1>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 p-4 dark:border-white/10 lg:grid-cols-4">
        <select
          className="h-10 rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700"
          value={tipo}
          onChange={(event) => setTipo(event.target.value as "MIXTO" | "CURSO" | "LAB")}
        >
          <option value="MIXTO">Horario cursos y laboratorios</option>
          <option value="CURSO">Solo cursos</option>
          <option value="LAB">Solo laboratorios</option>
        </select>

        <input
          className="h-10 rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700"
          value={anio}
          onChange={(event) => setAnio(event.target.value)}
          placeholder="Año"
        />
        <input
          className="h-10 rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700"
          value={semestre}
          onChange={(event) => setSemestre(event.target.value)}
          placeholder="Semestre"
        />
        <input
          className="h-10 rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700"
          value={carrera}
          onChange={(event) => setCarrera(event.target.value)}
          placeholder="Carrera"
        />
      </div>

      <div className="flex justify-end gap-2 mb-4">
        <Button
          onClick={handleDescargarImagen}
          className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-3 rounded-md"
        >
          <MdImage size={16} /> Imagen
        </Button>
        <Button
          onClick={handleDescargarExcel}
          className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-sm py-1 px-3 rounded-md"
        >
          <MdTableChart size={16} /> Excel
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
        <StripedCard
          title="Total bloques"
          icon={TableIcon}
          tone="bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
          stripe="bg-brand-500"
          compact
        >
          <p className="text-2xl font-semibold text-gray-800 dark:text-white/90">{stats.total}</p>
        </StripedCard>
        <StripedCard
          title="Cursos"
          icon={FileIcon}
          tone="bg-blue-light-50 text-blue-light-700 dark:bg-blue-light-500/15 dark:text-blue-light-300"
          stripe="bg-blue-light-500"
          compact
        >
          <p className="text-2xl font-semibold text-gray-800 dark:text-white/90">{stats.cursos}</p>
        </StripedCard>
        <StripedCard
          title="Laboratorios"
          icon={TaskIcon}
          tone="bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-300"
          stripe="bg-warning-500"
          compact
        >
          <p className="text-2xl font-semibold text-gray-800 dark:text-white/90">{stats.labs}</p>
        </StripedCard>
        <StripedCard
          title="Sin salón"
          icon={CheckCircleIcon}
          tone="bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
          stripe="bg-indigo-500"
          compact
        >
          <p className="text-2xl font-semibold text-gray-800 dark:text-white/90">{stats.sinSalon}</p>
        </StripedCard>
      </div>

      <div ref={refReporte} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h2 className="text-base font-semibold mb-3 text-gray-800 dark:text-gray-200">
          Matriz de horarios por salón ({filters.tipo})
        </h2>
        {loading ? (
          <div>Cargando...</div>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b py-1 px-2 text-gray-700 dark:text-gray-300 font-medium">Horario</th>
                {salones.map((salon) => (
                  <th key={salon} className="border-b py-1 px-2 text-gray-700 dark:text-gray-300 font-medium">
                    {salon}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.map((item, idx) => (
                <tr key={`${item.horario}-${idx}`} className={idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-100 dark:bg-gray-700"}>
                  <td className="py-1 px-2 font-medium">{item.horario}</td>
                  {salones.map((salon) => (
                    <td key={`${item.horario}-${salon}`} className="py-1 px-2">
                      {item[salon]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
