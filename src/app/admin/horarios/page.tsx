import type { Metadata } from "next";
import HorarioTable from "@/components/tables/HorarioTable";

export const metadata: Metadata = {
  title: "Horarios",
  description: "Modificación manual de horarios generados",
};

export default function HorariosPage() {
  return (
    <div className="space-y-6">
      <HorarioTable />
    </div>
  );
}
