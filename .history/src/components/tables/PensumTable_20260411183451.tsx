"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  ArrowRightIcon,
  EyeIcon,
  FileIcon,
  PencilIcon,
  PlusIcon,
  TrashBinIcon,
} from "@/icons";
import { useModal } from "@/hooks/useModal";
import { usePensum, type Pensum } from "@/hooks/usePensum";
import { useCareer } from "@/hooks/useCareer";
import { useCurso } from "@/hooks/useCurso";
import { useEspecialidad } from "@/hooks/useEspecialidad";
import { usePensumCourse, type PensumCourse } from "@/hooks/usePensumCourse";
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

type PensumCourseFormData = {
  courseCode: number;
  studyAreaId: number;
  credits: number;
  requiredCreds: number;
  isMandatory: boolean;
  semester: number;
};

type CareerLike = {
  careerId?: number;
  id?: number;
  careerCode?: number;
  name?: string;
};

type PensumCourseLike = PensumCourse & {
  course?: { name?: string };
  studyArea?: { name?: string };
};

const resolveCareerId = (value: { careerId?: number; career?: CareerLike }) =>
  Number(value.careerId ?? value.career?.careerId ?? value.career?.id ?? value.career?.careerCode ?? 0);

const getCareerValue = (career: CareerLike) => String(Number(career.careerId ?? career.id ?? career.careerCode ?? 0));

const initialPensumForm: PensumFormData = {
  name: "",
  creditsNeeded: 0,
  careerId: "",
};

const initialCourseForm: PensumCourseFormData = {
  courseCode: 0,
  studyAreaId: 0,
  credits: 0,
  requiredCreds: 0,
  isMandatory: true,
  semester: 1,
};

const SEMESTER_OPTIONS = [
  { value: 1, label: "Primer semestre" },
  { value: 2, label: "Segundo semestre" },
] as const;

const renderPensumCourseState = (
  loadingPensumCourses: boolean,
  pensumCourseError: string | null,
  pensumCourses: PensumCourseLike[],
  courseMap: Map<number, string>,
  studyAreaMap: Map<number, string>,
) => {
  if (loadingPensumCourses) {
    return <div className="rounded-2xl bg-white p-4 text-sm text-gray-500 shadow-theme-xs dark:bg-gray-900">Cargando cursos...</div>;
  }

  if (pensumCourseError) {
    return <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/10 dark:text-red-400">{pensumCourseError}</div>;
  }

  if (pensumCourses.length === 0) {
    return <div className="rounded-2xl bg-white p-4 text-sm text-gray-500 shadow-theme-xs dark:bg-gray-900">Este pensum aún no tiene cursos asociados.</div>;
  }

  return pensumCourses.map((course) => (
    <div key={course.id} className="rounded-2xl bg-white p-4 shadow-theme-xs dark:bg-gray-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {course.courseName || courseMap.get(Number(course.courseCode)) || `Curso ${course.courseCode}`}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {course.studyAreaName || studyAreaMap.get(Number(course.studyAreaId)) || `Área ${course.studyAreaId}`}
          </p>
        </div>
        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
          Sem {course.semester}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300">
        <div className="rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-800/80">Créditos: {course.credits}</div>
        <div className="rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-800/80">Req.: {course.requiredCreds}</div>
        <div className="rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-800/80">{course.isMandatory ? "Obligatorio" : "Opcional"}</div>
        <div className="rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-800/80">ID: {course.id}</div>
      </div>
    </div>
  ));
};

type PensumDetailModalContentProps = {
  selectedPensum: Pensum | null;
  careerMap: Map<string, string>;
  courseMap: Map<number, string>;
  studyAreaMap: Map<number, string>;
  pensumCourses: PensumCourseLike[];
  loadingPensumCourses: boolean;
  pensumCourseError: string | null;
  showAddCourseForm: boolean;
  setShowAddCourseForm: React.Dispatch<React.SetStateAction<boolean>>;
  setCourseFormData: React.Dispatch<React.SetStateAction<PensumCourseFormData>>;
  courseFormData: PensumCourseFormData;
  cursos: Array<{ id: number; courseCode?: number; name: string }>;
  especialidades: Array<{ id: number; name: string }>;
  onSaveCourseToPensum: (event: React.SyntheticEvent<HTMLFormElement>) => Promise<void>;
};

const PensumDetailModalContent = ({
  selectedPensum,
  careerMap,
  courseMap,
  studyAreaMap,
  pensumCourses,
  loadingPensumCourses,
  pensumCourseError,
  showAddCourseForm,
  setShowAddCourseForm,
  setCourseFormData,
  courseFormData,
  cursos,
  especialidades,
  onSaveCourseToPensum,
}: PensumDetailModalContentProps) => {
  const selectedCareerName = selectedPensum
    ? selectedPensum.careerName || careerMap.get(String(resolveCareerId(selectedPensum))) || "Sin carrera"
    : "Sin carrera";

  return (
    <div className="no-scrollbar relative w-full max-w-6xl overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
      <div className="flex flex-col gap-3 border-b border-gray-100 pb-5 dark:border-gray-800 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Detalle del pensum</p>
          <h4 className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">{selectedPensum?.name}</h4>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Vista institucional con información estática y cursos dinámicos cargados desde <span className="font-medium">/pensum-course/{selectedPensum?.id}</span>.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setShowAddCourseForm((prev) => !prev);
            if (!selectedPensum) return;
            setCourseFormData((prev) => ({ ...prev }));
          }}
        >
          <PlusIcon className="h-4 w-4" />
          Agregar curso al pensum
        </Button>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-5">
          <div className="rounded-3xl border border-orange-200 bg-orange-50 p-5 dark:border-orange-900/30 dark:bg-orange-500/10">
            <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">Vigente para estudiantes con pensum CLAR a partir del año 2022</p>
            <div className="mt-5 grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
              <div>
                <h5 className="text-xl font-semibold text-gray-900 dark:text-white">Ingeniería en Ciencias y Sistemas</h5>
                <p className="mt-3 text-sm leading-6 text-gray-700 dark:text-gray-300">
                  Centra sus objetivos en proporcionar los conocimientos adecuados y actualizados que garanticen una formación profesional orientada a una participación propositiva en el análisis, diseño, construcción y puesta en marcha de soluciones.
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-theme-xs dark:bg-gray-900/70">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Resumen rápido</p>
                <div className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <p><span className="font-medium text-gray-900 dark:text-white">Carrera:</span> {selectedCareerName}</p>
                  <p><span className="font-medium text-gray-900 dark:text-white">Créditos:</span> {selectedPensum?.creditsNeeded ?? 0}</p>
                  <p><span className="font-medium text-gray-900 dark:text-white">Estado:</span> {selectedPensum?.active ? "Activo" : "Inactivo"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {COURSE_LIST_SECTIONS.map((section) => (
              <div key={section.title} className="rounded-3xl border border-gray-200 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-white/3">
                <p className="text-sm font-semibold text-brand-600">{section.title}</p>
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{section.text}</p>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-white/3">
            <h5 className="text-lg font-semibold text-gray-900 dark:text-white">Áreas académicas</h5>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: "Metodología de sistemas", color: "bg-cyan-500" },
                { label: "Ciencias de la computación", color: "bg-emerald-500" },
                { label: "Desarrollo de software", color: "bg-amber-500" },
              ].map((area) => (
                <div key={area.label} className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 dark:bg-gray-900/60">
                  <span className={`h-3 w-3 rounded-full ${area.color}`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{area.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900/60">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Detalle dinámico</p>
            <h5 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">Cursos asignados al pensum</h5>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Los datos se cargan desde el endpoint del pensum seleccionado.</p>

            <div className="mt-4 space-y-3">
              {renderPensumCourseState(loadingPensumCourses, pensumCourseError, pensumCourses, courseMap, studyAreaMap)}
            </div>
          </div>

          {showAddCourseForm && (
            <div className="rounded-3xl border border-brand-200 bg-brand-50 p-5 dark:border-brand-500/20 dark:bg-brand-500/10">
              <div className="flex items-center gap-2">
                <ArrowRightIcon className="h-4 w-4 text-brand-700 dark:text-brand-300" />
                <h5 className="text-lg font-semibold text-gray-900 dark:text-white">Agregar curso al pensum</h5>
              </div>

              <form className="mt-4 grid grid-cols-1 gap-4" onSubmit={onSaveCourseToPensum}>
                <div>
                  <Label>Curso</Label>
                  <select
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    value={courseFormData.courseCode > 0 ? String(courseFormData.courseCode) : ""}
                    onChange={(event) => setCourseFormData((prev) => ({ ...prev, courseCode: Number(event.target.value || 0) }))}
                  >
                    <option value="">Seleccione un curso</option>
                    {cursos.map((course) => {
                      const value = Number(course.courseCode ?? course.id ?? 0);
                      return (
                        <option key={value} value={String(value)}>
                          {course.name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <Label>Área de estudio</Label>
                  <select
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    value={courseFormData.studyAreaId > 0 ? String(courseFormData.studyAreaId) : ""}
                    onChange={(event) => setCourseFormData((prev) => ({ ...prev, studyAreaId: Number(event.target.value || 0) }))}
                  >
                    <option value="">Seleccione un área</option>
                    {especialidades.map((studyArea) => (
                      <option key={studyArea.id} value={String(studyArea.id)}>
                        {studyArea.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Créditos</Label>
                    <Input type="number" min="0" value={courseFormData.credits} onChange={(event) => setCourseFormData((prev) => ({ ...prev, credits: Number(event.target.value || 0) }))} />
                  </div>
                  <div>
                    <Label>Créditos requeridos</Label>
                    <Input type="number" min="0" value={courseFormData.requiredCreds} onChange={(event) => setCourseFormData((prev) => ({ ...prev, requiredCreds: Number(event.target.value || 0) }))} />
                  </div>
                </div>

                <div>
                  <Label>Semestre</Label>
                  <select
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    value={courseFormData.semester > 0 ? String(courseFormData.semester) : ""}
                    onChange={(event) => setCourseFormData((prev) => ({ ...prev, semester: Number(event.target.value || 0) }))}
                  >
                    <option value="">Seleccione un semestre</option>
                    {SEMESTER_OPTIONS.map((option) => (
                      <option key={option.value} value={String(option.value)}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    id="isMandatory"
                    type="checkbox"
                    checked={courseFormData.isMandatory}
                    onChange={(event) => setCourseFormData((prev) => ({ ...prev, isMandatory: event.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <Label htmlFor="isMandatory" className="mb-0">Es obligatorio</Label>
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" size="sm" variant="outline" onClick={() => setShowAddCourseForm(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm">
                    Guardar curso
                  </Button>
                </div>
              </form>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
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
  const { isOpen, openModal, closeModal } = useModal();
  const {
    isOpen: isDetailOpen,
    openModal: openDetailModal,
      <Modal isOpen={isDetailOpen} onClose={closeDetailModal} className="max-w-6xl m-4">
        <PensumDetailModalContent
          selectedPensum={selectedPensum}
          careerMap={careerMap}
          courseMap={courseMap}
          studyAreaMap={studyAreaMap}
          pensumCourses={pensumCourses}
          loadingPensumCourses={loadingPensumCourses}
          pensumCourseError={pensumCourseError}
          showAddCourseForm={showAddCourseForm}
          setShowAddCourseForm={setShowAddCourseForm}
          setCourseFormData={setCourseFormData}
          courseFormData={courseFormData}
          cursos={cursos}
          especialidades={especialidades}
          onSaveCourseToPensum={handleSaveCourseToPensum}
        />
      return;
    }

    if (courseFormData.studyAreaId <= 0) {
      toast.error("Debes seleccionar un área de estudio");
      return;
    }

    if (courseFormData.credits < 0 || courseFormData.requiredCreds < 0) {
      toast.error("Los créditos no pueden ser negativos");
      return;
    }

    if (!SEMESTER_OPTIONS.some((option) => option.value === courseFormData.semester)) {
      toast.error("Debes seleccionar un semestre válido");
      return;
    }

    const payload = {
      pensumId: selectedPensum.id,
      courseCode: Number(courseFormData.courseCode),
      studyAreaId: Number(courseFormData.studyAreaId),
      credits: Number(courseFormData.credits),
      requiredCreds: Number(courseFormData.requiredCreds),
      isMandatory: Boolean(courseFormData.isMandatory),
      semester: Number(courseFormData.semester),
    };

    const success = await createPensumCourse(payload);

    if (success) {
      toast.success("Curso agregado al pensum con éxito");
      setCourseFormData(initialCourseForm);
      setShowAddCourseForm(false);

      try {
        const response = await pensumCourseApi.get(selectedPensum.id);
        setPensumCourses(normalizePensumCourseList(response));
      } catch {
        // Mantener la vista abierta aunque la recarga falle
      }

      return;
    }

    toast.error("No fue posible agregar el curso al pensum");
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
                      <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-brand-700 shadow-theme-xs dark:bg-gray-900 dark:text-brand-300">
                        <FileIcon className="h-4 w-4" />
                        Pensum #{pensum.pensumCode ?? pensum.id}
                      </div>
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

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(pensum)}
                      className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
                    >
                      <EyeIcon className="h-4 w-4" />
                      Ver pensum
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditPensum(pensum)}
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      <PencilIcon className="h-4 w-4" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePensum(pensum.id)}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3.5 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900/40 dark:text-red-300 dark:hover:bg-red-900/20"
                    >
                      <TrashBinIcon className="h-4 w-4" />
                      Eliminar
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

      <Modal isOpen={isDetailOpen} onClose={closeDetailModal} className="max-w-6xl m-4">
        <div className="no-scrollbar relative w-full max-w-6xl overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
          <div className="flex flex-col gap-3 border-b border-gray-100 pb-5 dark:border-gray-800 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Detalle del pensum</p>
              <h4 className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">{selectedPensum?.name}</h4>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Vista institucional con información estática y cursos dinámicos cargados desde <span className="font-medium">/pensum-course/{selectedPensum?.id}</span>.
              </p>
            </div>

            <Button
              size="sm"
              onClick={() => {
                setShowAddCourseForm((prev) => !prev);
                if (!selectedPensum) return;
                setCourseFormData((prev) => ({ ...prev }));
              }}
            >
              <PlusIcon className="h-4 w-4" />
              Agregar curso al pensum
            </Button>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="space-y-5">
              <div className="rounded-3xl border border-orange-200 bg-orange-50 p-5 dark:border-orange-900/30 dark:bg-orange-500/10">
                <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">Vigente para estudiantes con pensum CLAR a partir del año 2022</p>
                <div className="mt-5 grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                  <div>
                    <h5 className="text-xl font-semibold text-gray-900 dark:text-white">Ingeniería en Ciencias y Sistemas</h5>
                    <p className="mt-3 text-sm leading-6 text-gray-700 dark:text-gray-300">
                      Centra sus objetivos en proporcionar los conocimientos adecuados y actualizados que garanticen una formación profesional orientada a una participación propositiva en el análisis, diseño, construcción y puesta en marcha de soluciones.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-theme-xs dark:bg-gray-900/70">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Resumen rápido</p>
                    <div className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <p><span className="font-medium text-gray-900 dark:text-white">Carrera:</span> {selectedPensum?.careerName || careerMap.get(String(resolveCareerId(selectedPensum || {}))) || "Sin carrera"}</p>
                      <p><span className="font-medium text-gray-900 dark:text-white">Créditos:</span> {selectedPensum?.creditsNeeded ?? 0}</p>
                      <p><span className="font-medium text-gray-900 dark:text-white">Estado:</span> {selectedPensum?.active ? "Activo" : "Inactivo"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {COURSE_LIST_SECTIONS.map((section) => (
                  <div key={section.title} className="rounded-3xl border border-gray-200 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-white/3">
                    <p className="text-sm font-semibold text-brand-600">{section.title}</p>
                    <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{section.text}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-white/3">
                <h5 className="text-lg font-semibold text-gray-900 dark:text-white">Áreas académicas</h5>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { label: "Metodología de sistemas", color: "bg-cyan-500" },
                    { label: "Ciencias de la computación", color: "bg-emerald-500" },
                    { label: "Desarrollo de software", color: "bg-amber-500" },
                  ].map((area) => (
                    <div key={area.label} className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 dark:bg-gray-900/60">
                      <span className={`h-3 w-3 rounded-full ${area.color}`} />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{area.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <aside className="space-y-5">
              <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900/60">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Detalle dinámico</p>
                <h5 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">Cursos asignados al pensum</h5>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Los datos se cargan desde el endpoint del pensum seleccionado.</p>

                <div className="mt-4 space-y-3">
                  {loadingPensumCourses ? (
                    <div className="rounded-2xl bg-white p-4 text-sm text-gray-500 shadow-theme-xs dark:bg-gray-900">Cargando cursos...</div>
                  ) : pensumCourseError ? (
                    <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/10 dark:text-red-400">
                      {pensumCourseError}
                    </div>
                  ) : pensumCourses.length === 0 ? (
                    <div className="rounded-2xl bg-white p-4 text-sm text-gray-500 shadow-theme-xs dark:bg-gray-900">
                      Este pensum aún no tiene cursos asociados.
                    </div>
                  ) : (
                    pensumCourses.map((course) => (
                      <div key={course.id} className="rounded-2xl bg-white p-4 shadow-theme-xs dark:bg-gray-900">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {course.courseName || courseMap.get(Number(course.courseCode)) || `Curso ${course.courseCode}`}
                            </p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {course.studyAreaName || studyAreaMap.get(Number(course.studyAreaId)) || `Área ${course.studyAreaId}`}
                            </p>
                          </div>
                          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                            Sem {course.semester}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300">
                          <div className="rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-800/80">Créditos: {course.credits}</div>
                          <div className="rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-800/80">Req.: {course.requiredCreds}</div>
                          <div className="rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-800/80">
                            {course.isMandatory ? "Obligatorio" : "Opcional"}
                          </div>
                          <div className="rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-800/80">
                            ID: {course.id}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {showAddCourseForm && (
                <div className="rounded-3xl border border-brand-200 bg-brand-50 p-5 dark:border-brand-500/20 dark:bg-brand-500/10">
                  <div className="flex items-center gap-2">
                    <ArrowRightIcon className="h-4 w-4 text-brand-700 dark:text-brand-300" />
                    <h5 className="text-lg font-semibold text-gray-900 dark:text-white">Agregar curso al pensum</h5>
                  </div>

                  <form className="mt-4 grid grid-cols-1 gap-4" onSubmit={handleSaveCourseToPensum}>
                    <div>
                      <Label>Curso</Label>
                      <select
                        className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        value={courseFormData.courseCode > 0 ? String(courseFormData.courseCode) : ""}
                        onChange={(event) => setCourseFormData((prev) => ({ ...prev, courseCode: Number(event.target.value || 0) }))}
                      >
                        <option value="">Seleccione un curso</option>
                        {cursos.map((course) => {
                          const value = Number(course.courseCode ?? course.id ?? 0);
                          return (
                            <option key={value} value={String(value)}>
                              {course.name}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <Label>Área de estudio</Label>
                      <select
                        className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        value={courseFormData.studyAreaId > 0 ? String(courseFormData.studyAreaId) : ""}
                        onChange={(event) => setCourseFormData((prev) => ({ ...prev, studyAreaId: Number(event.target.value || 0) }))}
                      >
                        <option value="">Seleccione un área</option>
                        {especialidades.map((studyArea) => (
                          <option key={studyArea.id} value={String(studyArea.id)}>
                            {studyArea.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Créditos</Label>
                        <Input type="number" min="0" value={courseFormData.credits} onChange={(event) => setCourseFormData((prev) => ({ ...prev, credits: Number(event.target.value || 0) }))} />
                      </div>
                      <div>
                        <Label>Créditos requeridos</Label>
                        <Input type="number" min="0" value={courseFormData.requiredCreds} onChange={(event) => setCourseFormData((prev) => ({ ...prev, requiredCreds: Number(event.target.value || 0) }))} />
                      </div>
                    </div>

                    <div>
                      <Label>Semestre</Label>
                      <select
                        className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        value={courseFormData.semester > 0 ? String(courseFormData.semester) : ""}
                        onChange={(event) => setCourseFormData((prev) => ({ ...prev, semester: Number(event.target.value || 0) }))}
                      >
                        <option value="">Seleccione un semestre</option>
                        {SEMESTER_OPTIONS.map((option) => (
                          <option key={option.value} value={String(option.value)}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        id="isMandatory"
                        type="checkbox"
                        checked={courseFormData.isMandatory}
                        onChange={(event) => setCourseFormData((prev) => ({ ...prev, isMandatory: event.target.checked }))}
                        className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      />
                      <Label htmlFor="isMandatory" className="mb-0">Es obligatorio</Label>
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button type="button" size="sm" variant="outline" onClick={() => setShowAddCourseForm(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" size="sm">
                        Guardar curso
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </aside>
          </div>
        </div>
      </Modal>
    </div>
  );
}
