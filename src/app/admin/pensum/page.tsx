import type { Metadata } from "next";
import PensumTable from "@/components/tables/PensumTable";

export const metadata: Metadata = {
  title: "Pensum",
  description: "Gestion de pensums",
};

export default function PensumPage() {
  return (
    <div className="space-y-6">
      <PensumTable />
    </div>
  );
}
