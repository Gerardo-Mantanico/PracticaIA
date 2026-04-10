import { useMemo } from "react";
import { useHorario } from "@/hooks/useHorario";

type ReportFilter = {
  tipo: "MIXTO" | "CURSO" | "LAB";
  carrera: string;
  semestre: string;
  anio: string;
};

const franjaHoraria = [
  "07:00",
  "07:50",
  "08:40",
  "09:30",
  "10:20",
  "11:10",
  "12:00",
  "13:00",
  "13:50",
  "14:40",
  "15:30",
  "16:20",
];

export const useReporteHorarios = (filter: ReportFilter) => {
  const { horarios, loading, error } = useHorario();

  const filtered = useMemo(() => {
    return horarios.filter((item) => {
      if (filter.tipo !== "MIXTO" && item.tipo !== filter.tipo) {
        return false;
      }
      return true;
    });
  }, [horarios, filter.tipo]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const cursos = filtered.filter((item) => item.tipo === "CURSO").length;
    const labs = filtered.filter((item) => item.tipo === "LAB").length;
    const sinSalon = filtered.filter((item) => item.sinSalon).length;
    return { total, cursos, labs, sinSalon };
  }, [filtered]);

  const salones = useMemo(() => {
    const names = Array.from(new Set(filtered.map((item) => item.salonNombre).filter(Boolean)));
    return names as string[];
  }, [filtered]);

  const grid = useMemo(() => {
    const findCell = (salon: string, slot: string) => {
      const found = filtered.find((item) => item.salonNombre === salon && item.inicio === slot);
      return found ? `${found.cursoCodigo} (${found.dia})` : "-";
    };

    return franjaHoraria.map((slot) => {
      const row = { horario: slot } as Record<string, string>;
      salones.forEach((salon) => {
        row[salon] = findCell(salon, slot);
      });
      return row;
    });
  }, [filtered, salones]);

  return {
    loading,
    error,
    filtered,
    stats,
    salones,
    grid,
  };
};
