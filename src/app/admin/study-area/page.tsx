import type { Metadata } from "next";
import StudyAreaTable from "@/components/tables/EspecialidadTable";

export const metadata: Metadata = {
  title: "Study Area",
  description: "Gestión de áreas de estudio",
};

export default function StudyAreaPage() {
  return (
    <div className="space-y-6">
      <StudyAreaTable />
    </div>
  );
}
