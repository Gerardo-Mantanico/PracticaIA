import type { Metadata } from "next";
import ReporteHorariosClient from "@/components/reporte/ReporteHorariosClient";

export const metadata: Metadata = {
  title: "Reportes",
  description: "Reportes y estadísticas de horarios",
};

export default function ReporteHorariosPage() {
  return <ReporteHorariosClient />;
}