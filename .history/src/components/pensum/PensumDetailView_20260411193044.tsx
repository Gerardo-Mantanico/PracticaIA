"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { PlusIcon } from "@/icons";
import { usePensum } from "@/hooks/usePensum";
import { useCareer } from "@/hooks/useCareer";
import { useCurso } from "@/hooks/useCurso";
import { useEspecialidad } from "@/hooks/useEspecialidad";
import type { PensumCourse } from "@/hooks/usePensumCourse";
import { pensumCourseApi } from "@/service/pensumCourse.service";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

type PensumCourseFormData = {
  courseCode: number;
  studyAreaId: number;
  credits: number;
  requiredCreds: number;
  isMandatory: boolean;
  semester: number;
};

type PensumCourseLike = PensumCourse & {
  course?: { name?: string };
  studyArea?: { name?: string };
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

const normalizePensumCourseList = (response: unknown): PensumCourseLike[] => {
  if (Array.isArray(response)) return response as PensumCourseLike[];
  if (!response || typeof response !== "object") return [];

  const typedResponse = response as { content?: unknown[]; data?: unknown[]; items?: unknown[]; rows?: unknown[]; results?: unknown[] };
  const candidate = typedResponse.content ?? typedResponse.data ?? typedResponse.items ?? typedResponse.rows ?? typedResponse.results;

  return Array.isArray(candidate) ? (candidate as PensumCourseLike[]) : [];
};

const resolveCareerId = (value: { careerId?: number; career?: any }) =>
  Number(value.careerId ?? value.career?.careerId ?? value.career?.id ?? value.career?.careerCode ?? 0);

export default function PensumDetailView({ pensumId }: Readonly<{ pensumId: number }>) {
  const router = useRouter();
  const { pensums } = usePensum();
  const { careers } = useCareer();
  const { cursos } = useCurso();
  const { especialidades } = useEspecialidad();

  const [pensumCourses, setPensumCourses] = useState<PensumCourseLike[]>([]);
  const [loadingPensumCourses, setLoadingPensumCourses] = useState(false);
  const [pensumCourseError, setPensumCourseError] = useState<string | null>(null);
  const [showAddCourseForm, setShowAddCourseForm] = useState(false);
  const [courseFormData, setCourseFormData] = useState<PensumCourseFormData>(initialCourseForm);

  const selectedPensum = useMemo(() => pensums.find((p) => p.id === pensumId) || null, [pensums, pensumId]);

  const careerMap = useMemo(() => {
    const map = new Map<string, string>();
    careers.forEach((career) => {
      map.set(String(Number(career.careerId ?? career.id ?? career.careerCode ?? 0)), career.name);
    });
    return map;
  }, [careers]);

  const courseMap = useMemo(() => {
    const map = new Map<number, string>();
    cursos.forEach((course) => {
      map.set(Number(course.courseCode ?? course.id ?? 0), course.name);
    });
    return map;
  }, [cursos]);

  const studyAreaMap = useMemo(() => {
    const map = new Map<number, string>();
    especialidades.forEach((studyArea) => {
      map.set(Number(studyArea.id ?? 0), studyArea.name);
    });
    return map;
  }, [especialidades]);

  const selectedCareerName = selectedPensum
    ? selectedPensum.careerName || careerMap.get(String(resolveCareerId(selectedPensum))) || "Sin carrera"
    : "Sin carrera";
  const displayPensumName = selectedPensum?.name ?? `Pensum #${pensumId}`;

  useEffect(() => {
    let isMounted = true;

    const loadPensumCourses = async () => {
      setLoadingPensumCourses(true);
      setPensumCourseError(null);

      try {
        const response = await pensumCourseApi.get(pensumId);
        const items = normalizePensumCourseList(response);

        if (isMounted) {
          setPensumCourses(items);
        }
      } catch (err) {
        if (isMounted) {
          setPensumCourses([]);
          setPensumCourseError(err instanceof Error ? err.message : "No se pudo cargar el detalle del pensum");
        }
      } finally {
        if (isMounted) {
          setLoadingPensumCourses(false);
        }
      }
    };

    loadPensumCourses();

    return () => {
      isMounted = false;
    };
  }, [pensumId]);

  const handleSaveCourseToPensum = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (courseFormData.courseCode <= 0) {
      toast.error("Debes seleccionar un curso");
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
      pensumId,
      courseCode: Number(courseFormData.courseCode),
      studyAreaId: Number(courseFormData.studyAreaId),
      credits: Number(courseFormData.credits),
      requiredCreds: Number(courseFormData.requiredCreds),
      isMandatory: Boolean(courseFormData.isMandatory),
      semester: Number(courseFormData.semester),
    };

    let success = false;

    try {
      await pensumCourseApi.create(payload);
      success = true;
    } catch (err) {
      success = false;
      toast.error(err instanceof Error ? err.message : "No fue posible agregar el curso al pensum");
    }

    if (success) {
      toast.success("Curso agregado al pensum con éxito");
      setCourseFormData(initialCourseForm);
      setShowAddCourseForm(false);

      try {
        const response = await pensumCourseApi.get(pensumId);
        setPensumCourses(normalizePensumCourseList(response));
      } catch {
        // Mantener la vista abierta aunque la recarga falle
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-500 transition-colors rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900"
        >
          ←
        </button>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Detalle del Pensum</h1>
      </div>

      <div className="w-full rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
        <div className="flex flex-col gap-3 border-b border-gray-100 pb-5 dark:border-gray-800 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Detalle del pensum</p>
            <h4 className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">{displayPensumName}</h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Vista institucional con información estática y cursos dinámicos cargados desde <span className="font-medium">/pensum-course/{pensumId}</span>.
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => {
              setShowAddCourseForm(true);
              setCourseFormData(initialCourseForm);
            }}
          >
            <PlusIcon className="h-4 w-4" />
            Agregar curso
          </Button>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-5">
        

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

            <Modal isOpen={showAddCourseForm} onClose={() => setShowAddCourseForm(false)} className="max-w-2xl m-4">
              <div className="no-scrollbar relative w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
                <h5 className="text-xl font-semibold text-gray-900 dark:text-white">Agregar curso al pensum</h5>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Completa los campos y se enviará al endpoint de pensum-course.</p>

                <form className="mt-5 grid grid-cols-1 gap-4" onSubmit={handleSaveCourseToPensum}>
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
                    <Label htmlFor="isMandatory" className="mb-0">
                      Es obligatorio
                    </Label>
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
            </Modal>
          </aside>
        </div>
      </div>
    </div>
  );
}
