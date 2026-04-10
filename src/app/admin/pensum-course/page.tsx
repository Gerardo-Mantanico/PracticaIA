import type { Metadata } from "next";
import PensumCourseTable from "@/components/tables/PensumCourseTable";

export const metadata: Metadata = {
  title: "Pensum-Course",
  description: "Gestión de relaciones pensum-course",
};

export default function PensumCoursePage() {
  return (
    <div className="space-y-6">
      <PensumCourseTable />
    </div>
  );
}
