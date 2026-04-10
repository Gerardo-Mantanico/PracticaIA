import type { Metadata } from "next";
import CursoTable from "@/components/tables/CursoTable";

export const metadata: Metadata = {
  title: "Cursos",
  description: "Gestión de cursos para generación de horarios",
};

export default function CursosPage() {
  return (
    <div className="space-y-6">
      <CursoTable />
    </div>
  );
}
