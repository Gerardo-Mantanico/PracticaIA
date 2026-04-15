"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  EyeIcon,
  PencilIcon,
  TrashBinIcon,
} from "@/icons";
import { useModal } from "@/hooks/useModal";
import { usePensum, type Pensum } from "@/hooks/usePensum";
import { useCareer } from "@/hooks/useCareer";
import { pensumCourseApi } from "@/service/pensumCourse.service";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

type PensumFormData = {
  name: string;
  creditsNeeded: number;
  careerId: string;
};

const resolveCareerId = (value: { careerId?: number; career?: { careerId?: number; id?: number; careerCode?: number } }) =>
  Number(value.careerId ?? value.career?.careerId ?? value.career?.id ?? value.career?.careerCode ?? 0);

const getCareerValue = (career: { careerId?: number; id?: number; careerCode?: number }) =>
  String(Number(career.careerId ?? career.id ?? career.careerCode ?? 0));

const initialPensumForm: PensumFormData = {
  name: "",
  creditsNeeded: 0,
  careerId: "",
};

const COURSE_LIST_SECTIONS = [
  {
    title: "Vigente para estudiantes con pensum CLAR a partir del año 2022",
    text: "Esta vista reproduce una referencia institucional para que el usuario reconozca de inmediato la estructura académica.",
  },
  {
    title: "Ingeniería en Ciencias y Sistemas",
    text: "Centro orientado al análisis, diseño, construcción y puesta en marcha de soluciones con enfoque en tecnologías de la información.",
  },
  {
    title: "Créditos CLAR",
    text: "La carrera se organiza por áreas académicas y por semestres, con una estructura que facilita revisar la carga de cursos.",
  },
];

const normalizePensumCourseList = (response: unknown): PensumCourseLike[] => {
  if (Array.isArray(response)) return response as PensumCourseLike[];
  if (!response || typeof response !== "object") return [];

  const typedResponse = response as { content?: unknown[]; data?: unknown[]; items?: unknown[]; rows?: unknown[]; results?: unknown[] };
  const candidate = typedResponse.content ?? typedResponse.data ?? typedResponse.items ?? typedResponse.rows ?? typedResponse.results;

  return Array.isArray(candidate) ? (candidate as PensumCourseLike[]) : [];
};

export default function PensumTable() {
  const router = useRouter();
  const { isOpen, openModal, closeModal } = useModal();

  const { pensums, loading, error, createPensum, updatePensum, deletePensum } = usePensum();
  const { careers } = useCareer();

  const [searchTerm, setSearchTerm] = useState("");
  const [pensumFormData, setPensumFormData] = useState<PensumFormData>(initialPensumForm);

  const careerMap = useMemo(() => {
    const map = new Map<string, string>();
    careers.forEach((career) => {
      map.set(getCareerValue(career), career.name);
    });
    return map;
  }, [careers]);

  const filteredPensums = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return pensums;

    return pensums.filter((pensum) => {
      const haystack = [pensum.name, pensum.careerName, careerMap.get(String(resolveCareerId(pensum))) ?? ""]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [pensums, searchTerm, careerMap]);

  const selectedCareerName = useMemo(() => {
    if (!pensumFormData.careerId) return "";
    return careerMap.get(pensumFormData.careerId) || "";
  }, [careerMap, pensumFormData.careerId]);

  const handleAddPensum = () => {
    setPensumFormData(initialPensumForm);
    openModal();
  };

  const handleEditPensum = (pensum: Pensum) => {
    setPensumFormData({
      name: pensum.name,
      creditsNeeded: Number(pensum.creditsNeeded ?? 0),
      careerId: String(resolveCareerId(pensum) || ""),
    });
    openModal();
  };

  const handleOpenDetail = (pensum: Pensum) => {
    router.push(`/admin/pensum/${pensum.id}`);
  };

  const handleSavePensum = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!pensumFormData.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    if (pensumFormData.creditsNeeded < 0) {
      toast.error("Los creditos requeridos no pueden ser negativos");
      return;
    }

    const payload: { name: string; creditsNeeded: number; careerId?: number } = {
      name: pensumFormData.name.trim(),
      creditsNeeded: Number(pensumFormData.creditsNeeded),
    };

    if (!selectedPensum) {
      const resolvedCareerId = Number(pensumFormData.careerId);
      if (!Number.isFinite(resolvedCareerId) || resolvedCareerId <= 0) {
        toast.error("Debes seleccionar una carrera");
        return;
      }
      payload.careerId = resolvedCareerId;
    }

    const success = selectedPensum ? await updatePensum(selectedPensum.id, payload) : await createPensum(payload);

    if (success) {
      toast.success(`Pensum ${selectedPensum ? "actualizado" : "creado"} con exito`);
      closeModal();
      return;
    }

    toast.error("No fue posible guardar el pensum");
  };

  const handleDeletePensum = async (pensumId: number) => {
    const confirmed = globalThis.confirm("¿Eliminar este pensum?");
    if (!confirmed) return;

    await deletePensum(pensumId);
  };

  if (loading && pensums.length === 0) return <div>Cargando pensums...</div>;
  if (error && pensums.length === 0) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-white/5 dark:bg-white/3">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Pensum</p>
            <h3 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">Explorador de pensums</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Busca por nombre, abre el detalle con el icono de ojo y gestiona cursos desde la vista del pensum.
            </p>
          </div>

          <Button size="sm" onClick={handleAddPensum}>
            Agregar pensum
          </Button>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.5fr_0.5fr]">
          <div className="relative">
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar pensum por nombre"
            />
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-300">
            <span className="font-semibold text-gray-900 dark:text-white">{filteredPensums.length}</span> resultados encontrados
          </div>
        </div>
      </div>

      {filteredPensums.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-white/3 dark:text-gray-400">
          No se encontraron pensums con ese nombre.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredPensums.map((pensum) => {
            const careerName = pensum.careerName || careerMap.get(String(resolveCareerId(pensum))) || "Sin carrera";

            return (
              <article
                key={pensum.id}
                className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-theme-sm transition hover:-translate-y-1 hover:shadow-theme-md dark:border-gray-800 dark:bg-white/3"
              >
                <div className="border-b border-gray-100 bg-linear-to-br from-brand-50 to-white p-5 dark:border-gray-800 dark:from-brand-500/15 dark:to-gray-900">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                       <h4 className="mt-3 text-xl font-semibold text-gray-900 dark:text-white">{pensum.name}</h4>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{careerName}</p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        pensum.active
                          ? "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-300"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {pensum.active ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-gray-50 p-3 dark:bg-gray-900/60">
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Créditos requeridos</p>
                      <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{pensum.creditsNeeded}</p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-3 dark:bg-gray-900/60">
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Carrera</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{careerName}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(pensum)}
                      title="Ver pensum"
                      className="p-2 text-gray-500 transition-colors rounded-lg hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/20 dark:hover:text-brand-400"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditPensum(pensum)}
                      title="Editar pensum"
                      className="p-2 text-gray-500 transition-colors rounded-lg hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/20 dark:hover:text-brand-400"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePensum(pensum.id)}
                      title="Eliminar pensum"
                      className="p-2 text-gray-500 transition-colors rounded-lg hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                    >
                      <TrashBinIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-170 m-4">
        <div className="no-scrollbar relative w-full max-w-170 overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {selectedPensum ? "Editar pensum" : "Crear pensum"}
          </h4>

          <form className="grid grid-cols-1 gap-4" onSubmit={handleSavePensum}>
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/10 dark:text-red-400">
                {error}
              </div>
            )}

            <div>
              <Label>Nombre</Label>
              <Input
                value={pensumFormData.name}
                onChange={(event) => setPensumFormData((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Ingrese el nombre del pensum"
              />
            </div>

            <div>
              <Label>Créditos requeridos</Label>
              <Input
                type="number"
                min="0"
                value={pensumFormData.creditsNeeded}
                onChange={(event) => setPensumFormData((prev) => ({ ...prev, creditsNeeded: Number(event.target.value || 0) }))}
              />
            </div>

            {!selectedPensum && (
              <div>
                <Label>Carrera</Label>
                <select
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                  value={pensumFormData.careerId}
                  onChange={(event) => setPensumFormData((prev) => ({ ...prev, careerId: event.target.value }))}
                >
                  <option value="">Seleccione una carrera</option>
                  {careers.map((career) => (
                    <option key={getCareerValue(career)} value={getCareerValue(career)}>
                      {career.name}
                    </option>
                  ))}
                </select>
                {selectedCareerName && <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Carrera seleccionada: {selectedCareerName}</p>}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button size="sm" type="button" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button size="sm" type="submit">
                {selectedPensum ? "Guardar cambios" : "Crear pensum"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
