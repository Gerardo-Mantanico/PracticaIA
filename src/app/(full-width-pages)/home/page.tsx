import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import StripedCard from "@/components/common/StripedCard";
import { FileIcon, TableIcon, UserCircleIcon, TaskIcon } from "@/icons";

export const metadata: Metadata = {
  title: "PsiFirm - Gestión de Horarios Académicos",
  description:
    "Plataforma para gestionar cursos, docentes, salones y la planificación académica de horarios en un solo lugar.",
};

const THEME_CARD_TONE = "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300";
const THEME_CARD_STRIPE = "bg-brand-500";

const moduleCards = [
  {
    title: "Cursos y salones",
    description: "Organiza la oferta académica, capacidad de espacios y restricciones de uso por jornada.",
    icon: TableIcon,
    tone: THEME_CARD_TONE,
    stripe: THEME_CARD_STRIPE,
  },
  {
    title: "Docentes",
    description: "Gestiona registros del personal docente, horarios base y preferencias por curso.",
    icon: UserCircleIcon,
    tone: THEME_CARD_TONE,
    stripe: THEME_CARD_STRIPE,
  },
  {
    title: "Carga masiva CSV",
    description: "Puebla rápidamente la demo con datos de cursos, salones y docentes sin depender del backend.",
    icon: FileIcon,
    tone: THEME_CARD_TONE,
    stripe: THEME_CARD_STRIPE,
  },
  {
    title: "Configuración y horarios",
    description: "Define escenarios de generación, edita resultados manualmente y revisa colisiones operativas.",
    icon: TaskIcon,
    tone: THEME_CARD_TONE,
    stripe: THEME_CARD_STRIPE,
  },
];

const workflowCards = [
  {
    title: "Preparación",
    description: "Registra cursos, salones y docentes o impórtalos por CSV para poblar rápidamente la demo.",
    icon: TableIcon,
    tone: THEME_CARD_TONE,
    stripe: THEME_CARD_STRIPE,
  },
  {
    title: "Configuración",
    description: "Define tiempos por periodo, jornadas y parámetros base para la generación de horarios.",
    icon: TaskIcon,
    tone: THEME_CARD_TONE,
    stripe: THEME_CARD_STRIPE,
  },
  {
    title: "Control y reporte",
    description: "Ajusta manualmente conflictos, valida colisiones y exporta reportes en varios formatos.",
    icon: FileIcon,
    tone: THEME_CARD_TONE,
    stripe: THEME_CARD_STRIPE,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="fixed top-6 right-6 z-50">
        <ThemeTogglerTwo />
      </div>

      <section className="relative flex min-h-150 items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/carousel/carousel-05.png"
            alt="Hero Background"
            fill
            priority
            className="object-cover blur-[3px] scale-105"
          />
        </div>

        <div className="absolute inset-0 bg-slate-950/55" />

        <div>
          <div className="absolute inset-0 bg-[url('/images/shape/grid.svg')] bg-center opacity-30"></div>
        </div>
        <div className="relative z-10 px-4 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="mb-6 text-4xl font-bold text-white sm:text-5xl lg:text-6xl drop-shadow-lg">
              Plataforma de gestión para <br className="hidden sm:block" />
              <span className="text-brand-200">horarios académicos</span>
            </h1>
            <p className="max-w-3xl mx-auto mb-8 text-lg text-white sm:text-xl lg:text-2xl drop-shadow-md font-medium">
              Centraliza la planificación operativa de cursos, docentes, salones y horarios desde
              una sola experiencia.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/signin"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-brand-600 transition-all duration-200 bg-white rounded-lg shadow-theme-lg hover:bg-brand-50 hover:shadow-theme-xl"
              >
                Iniciar sesión
              </Link>
              <Link
                href="#modulos"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white transition-all duration-200 border-2 border-white rounded-lg hover:bg-white/10"
              >
                Explorar módulos
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-16 text-center sm:grid-cols-4">
              <div>
                <div className="text-3xl font-bold text-white sm:text-4xl">4</div>
                <div className="mt-1 text-sm text-brand-100">Dominios clave</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white sm:text-4xl">CSV</div>
                <div className="mt-1 text-sm text-brand-100">Carga masiva</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white sm:text-4xl">Demo</div>
                <div className="mt-1 text-sm text-brand-100">Sin backend</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white sm:text-4xl">Reportes</div>
                <div className="mt-1 text-sm text-brand-100">Exportables</div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10 text-black">
          <svg
            className="w-full h-auto text-gray-50 dark:text-gray-950"
            viewBox="0 0 1440 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 48h1440V0c-240 48-480 48-720 0S240 -48 0 0v48z"
              fill="currentColor"
            />
          </svg>
        </div>
      </section>

      <section id="modulos" className="px-4 py-16 bg-white dark:bg-gray-900 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <span className="inline-block px-4 py-1 mb-4 text-sm font-semibold tracking-wider text-brand-600 uppercase bg-brand-50 rounded-full dark:bg-brand-900/20 dark:text-brand-400">
              Módulos principales
            </span>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">
              Lo que puedes gestionar en la plataforma
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 dark:text-gray-400">
              La demo está enfocada en el flujo académico-operativo: carga de datos, planeación,
              edición manual y análisis de horarios.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {moduleCards.map((card) => (
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
          </div>
        </div>
      </section>

      <section id="plataforma" className="px-4 py-16 bg-white dark:bg-gray-900 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">
              Flujo de trabajo del sistema
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
              Desde la preparación de catálogos hasta la revisión final del horario generado.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workflowCards.map((card) => (
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
          </div>
        </div>
      </section>

      <section id="acceso" className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 lg:py-24">
        <div className="overflow-hidden bg-white border border-gray-200 shadow-theme-lg rounded-3xl dark:bg-white/3 dark:border-gray-800">
          <div className="grid gap-0 lg:grid-cols-2">
            <div className="p-8 lg:p-12">
              <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
                Accede a la demo del sistema
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <p>
                  Inicia sesión para entrar al panel administrativo y recorrer el flujo completo de horarios,
                  carga masiva y reportes.
                </p>
                <p>
                  Desde esta página principal puedes conocer el alcance funcional de la demo y el
                  flujo general del sistema.
                </p>
                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <Link
                    href="/signin"
                    className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white transition-all duration-200 rounded-lg bg-brand-600 hover:bg-brand-700"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium transition-all duration-200 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Crear cuenta
                  </Link>
                </div>
              </div>
            </div>
            <div className="bg-linear-to-br from-brand-500 to-brand-700 dark:from-brand-800 dark:to-brand-950 p-8 lg:p-12 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-white rounded-full bg-opacity-20">
                    <span className="text-4xl">📅</span>
                  </div>
                </div>
                <h3 className="mb-4 text-2xl font-bold">Planifica mejor, administra más rápido</h3>
                <p className="mb-6 text-brand-100">
                  Una experiencia pensada para centralizar la operación académica y la planificación de horarios.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="px-4 py-14 bg-gray-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-4">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-brand-300">
                Sistema institucional
              </p>
              <h3 className="mb-3 text-xl font-bold text-white">
                Sistema de Gestión de Horarios Académicos
              </h3>
              <p className="text-sm leading-6 text-gray-300">
                Centro Universitario de Occidente - CUNOC<br />
                Universidad de San Carlos de Guatemala - USAC
              </p>
              <p className="mt-4 text-sm leading-6 text-gray-400">
                Plataforma orientada a la administración académica, planificación de horarios y
                operación institucional.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">
                Contacto
              </h4>
              <ul className="space-y-3 text-sm leading-6 text-gray-400">
                <li>
                  <span className="font-medium text-gray-200">Dirección:</span> Zona 3,
                  Quetzaltenango, Guatemala
                </li>
                <li>
                  <span className="font-medium text-gray-200">Correo:</span>{" "}
                  <a href="mailto:soporte.horarios@cunoc.edu.gt" className="transition hover:text-white">
                    soporte.horarios@cunoc.edu.gt
                  </a>
                </li>
                <li>
                  <span className="font-medium text-gray-200">Departamento:</span> Departamento de
                  Informática
                </li>
                <li>
                  <span className="font-medium text-gray-200">Soporte:</span> Mesa de ayuda
                  institucional
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">
                Enlaces útiles
              </h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="https://www.usac.edu.gt" target="_blank" rel="noreferrer" className="transition hover:text-white">
                    Portal USAC
                  </a>
                </li>
                <li>
                  <a href="https://cunoc.edu.gt" target="_blank" rel="noreferrer" className="transition hover:text-white">
                    Portal CUNOC
                  </a>
                </li>
                <li><Link href="#modulos" className="transition hover:text-white">Módulos del sistema</Link></li>
                <li><Link href="#plataforma" className="transition hover:text-white">Flujo del sistema</Link></li>
                <li><Link href="#acceso" className="transition hover:text-white">Acceso a la demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">
                Información del sistema
              </h4>
              <ul className="space-y-3 text-sm leading-6 text-gray-400">
                <li>
                  <span className="font-medium text-gray-200">Versión:</span> 1.0
                </li>
                <li>
                  <span className="font-medium text-gray-200">Última actualización:</span> Marzo 2026
                </li>
                <li>
                  <span className="font-medium text-gray-200">Desarrollado por:</span> Equipo de
                  Desarrollo de Sistemas CUNOC
                </li>
                <li>
                  <span className="font-medium text-gray-200">Políticas:</span> Uso institucional y
                  protección de datos académicos.
                </li>
                <li className="pt-1">
                  <Link href="/signin" className="transition hover:text-white">Iniciar sesión</Link>
                  <span className="mx-2 text-gray-600">|</span>
                  <Link href="/signup" className="transition hover:text-white">Crear cuenta</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 mt-10 border-t border-white/10">
            <div className="flex flex-col gap-3 text-sm text-gray-400 md:flex-row md:items-center md:justify-between">
              <p>
                &copy; 2026 Universidad de San Carlos de Guatemala - CUNOC. Todos los derechos reservados.
              </p>
              <p>
                Soporte técnico: <a href="mailto:soporte.horarios@cunoc.edu.gt" className="transition hover:text-white">soporte.horarios@cunoc.edu.gt</a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
