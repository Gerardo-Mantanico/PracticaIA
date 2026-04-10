import type { Metadata } from "next";
import CargaCsvPanel from "@/components/administrativo/CargaCsvPanel";

export const metadata: Metadata = {
  title: "Carga CSV",
  description: "Carga masiva de cursos, salones y docentes",
};

export default function CargaCsvPage() {
  return (
    <div className="space-y-6">
      <CargaCsvPanel />
    </div>
  );
}
