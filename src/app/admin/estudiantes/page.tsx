import type { Metadata } from "next";
import StudentTable from "@/components/tables/StudentTable";

export const metadata: Metadata = {
  title: "Estudiantes",
  description: "Gestión de estudiantes",
};

export default function EstudiantesPage() {
  return (
    <div className="space-y-6">
      <StudentTable />
    </div>
  );
}