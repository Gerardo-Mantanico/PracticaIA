import type { Metadata } from "next";
import React from "react";
import RoleGate from "@/components/auth/RoleGate";
import StripedCard from "@/components/common/StripedCard";
import { FileIcon, TableIcon, TimeIcon, UserCircleIcon } from "@/icons";

export const metadata: Metadata = {
  title: "Panel de estudiante",
  description: "Vista principal para estudiantes autenticados.",
};

const studentCards = [
  {
    title: "Mi horario",
    description: "Consulta tus bloques asignados, franjas horarias y salón cuando estén disponibles.",
    icon: TimeIcon,
    tone: "bg-blue-light-50 text-blue-light-700 dark:bg-blue-light-500/15 dark:text-blue-light-300",
    stripe: "bg-blue-light-500",
  },
  {
    title: "Cursos inscritos",
    description: "Revisa los cursos asociados a tu carrera y semestre en la plataforma.",
    icon: TableIcon,
    tone: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300",
    stripe: "bg-brand-500",
  },
  {
    title: "Documentos",
    description: "Accede a archivos, avisos y recursos vinculados a tu proceso académico.",
    icon: FileIcon,
    tone: "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-300",
    stripe: "bg-warning-500",
  },
  {
    title: "Perfil",
    description: "Consulta y actualiza tu información personal y académica básica.",
    icon: UserCircleIcon,
    tone: "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-300",
    stripe: "bg-success-500",
  },
];

export default function StudentDashboardPage() {
  return (
    <RoleGate allowedRoles={["STUDENT", "ESTUDIANTE", "ROLE_STUDENT"]}>
      <div className="space-y-7">
        <section className="rounded-2xl border border-gray-200 bg-linear-to-r from-white to-blue-50 p-6 shadow-theme-sm dark:border-gray-800 dark:from-white/3 dark:to-blue-500/5">
          <p className="text-sm font-medium text-blue-600">Student Dashboard</p>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            Panel de estudiante
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-gray-600 dark:text-gray-400">
            Esta vista agrupa la información operativa para estudiantes. Desde aquí puedes acceder a
            tu horario, cursos y datos académicos cuando el backend los exponga.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
          {studentCards.map((card) => (
            <StripedCard
              key={card.title}
              title={card.title}
              icon={card.icon}
              tone={card.tone}
              stripe={card.stripe}
            >
              <p>{card.description}</p>
            </StripedCard>
          ))}
        </section>
      </div>
    </RoleGate>
  );
}