import type { Metadata } from "next";
import DocenteTable from "@/components/tables/DocenteTable";

export const metadata: Metadata = {
  title: "Docentes",
  description: "Gestión de docentes para horarios",
};

export default function DocentesPage() {
  return (
    <div className="space-y-6">
      <DocenteTable />
    </div>
  );
}
