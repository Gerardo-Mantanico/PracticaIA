import type { Metadata } from "next";
import ConfiguracionHorariosTable from "@/components/tables/ConfiguracionHorariosTable";

export const metadata: Metadata = {
  title: "Configuración de horarios",
  description: "Escenarios de configuración para generación de horarios",
};

export default function ConfiguracionHorariosPage() {
  return (
    <div className="space-y-6">
      <ConfiguracionHorariosTable />
    </div>
  );
}
