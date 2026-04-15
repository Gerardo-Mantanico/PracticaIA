import type { Metadata } from "next";
import React from "react";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Dashboard administrativo",
  description: "Panel académico con gráficos, métricas y accesos rápidos.",
};

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
