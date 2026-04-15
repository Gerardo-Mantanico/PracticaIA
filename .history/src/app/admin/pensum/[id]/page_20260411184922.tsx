import type { Metadata } from "next";
import PensumDetailView from "@/components/pensum/PensumDetailView";

export const metadata: Metadata = {
  title: "Detalle del Pensum",
  description: "Detalle y gestión de pensum",
};

interface PageProps {
  params: {
    id: string;
  };
}

export default function PensumDetailPage({ params }: PageProps) {
  const pensumId = Number(params.id);

  if (!pensumId || isNaN(pensumId)) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-white/3">
        <p className="text-gray-500 dark:text-gray-400">ID de pensum inválido</p>
      </div>
    );
  }

  return <PensumDetailView pensumId={pensumId} />;
}
