import type { Metadata } from "next";
import CareerTable from "@/components/tables/CareerTable";

export const metadata: Metadata = {
  title: "Careers",
  description: "Gestión de carreras",
};

export default function CareersPage() {
  return (
    <div className="space-y-6">
      <CareerTable />
    </div>
  );
}
