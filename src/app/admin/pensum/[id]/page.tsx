import type { Metadata } from "next";
import PensumDetailView from "@/components/pensum/PensumDetailView";

export const metadata: Metadata = {
  title: "Detalle del Pensum",
  description: "Detalle y gestión de pensum",
};

interface PageProps {
  params: Promise<{
    id: string;
  }> | {
    id: string;
  };
}

export default async function PensumDetailPage({ params }: Readonly<PageProps>) {
  const resolvedParams = "then" in params ? await params : params;
  const pensumId = Number(resolvedParams.id);

  if (!pensumId || Number.isNaN(pensumId)) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-white/3">
        <p className="text-gray-500 dark:text-gray-400">ID de pensum inválido</p>
      </div>
    );
  }

  return <PensumDetailView pensumId={pensumId} />;
}
