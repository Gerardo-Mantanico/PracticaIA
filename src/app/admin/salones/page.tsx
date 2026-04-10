import type { Metadata } from "next";
import SalonCards from "@/components/tables/SalonCards";

export const metadata: Metadata = {
  title: "Salones",
  description: "Gestión de salones para congresos",
};

export default function SalonesPage() {
  return (
    <div className="space-y-6">
      <SalonCards />
    </div>
  );
}
