"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { PlusIcon } from "@/icons";
import { usePensum } from "@/hooks/usePensum";
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
  prerequisites?: unknown[];
  postrequisites?: unknown[];
};

const formatRelatedCourse = (item: unknown): string => {
  if (typeof item === "number" || typeof item === "string") return String(item);
  if (!item || typeof item !== "object") return "N/A";

  const value = item as { courseCode?: number; name?: string; course?: { courseCode?: number; name?: string } };
  const code = Number(value.courseCode ?? value.course?.courseCode ?? 0);
  const name = value.name ?? value.course?.name ?? "";

  if (code > 0 && name) return `${String(code).padStart(4, "0")} - ${name}`;
  if (code > 0) return String(code).padStart(4, "0");
  if (name) return name;
  return "N/A";
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
  onCourseClick: (course: PensumCourseLike) => void,
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

  return pensumCourses.map((course) => {
    const courseCode = Number(course.courseCode ?? 0);
    const name = course.courseName || course.course?.name || courseMap.get(courseCode) || `Curso ${courseCode}`;
    const credits = Number(course.credits ?? 0);
    const prereqs = Array.isArray(course.prerequisites) ? course.prerequisites : [];
    const postreqs = Array.isArray(course.postrequisites) ? course.postrequisites : [];

    return (
      <button
        key={course.id || `${courseCode}-${course.semester}`}
        type="button"
        onClick={() => onCourseClick(course)}
        className="w-full rounded-sm border border-blue-300 bg-blue-100/70 text-left transition-colors hover:bg-blue-200/70"
      >
        <div className="grid grid-cols-[58px_1fr_58px] overflow-hidden">
          <div className="grid grid-rows-2 bg-blue-600 text-white">
            <div className="flex items-center justify-center text-sm font-semibold">{String(courseCode).padStart(4, "0")}</div>
            <div className="flex items-center justify-center border-t border-blue-300 text-sm font-semibold">{credits}</div>
          </div>

          <div className="flex items-center justify-center px-3 py-3 text-center text-sm font-medium text-gray-800">
            <div>
              <p>{name}</p>
              <p className="mt-0.5 text-[11px] text-gray-600">
                {course.studyAreaName || course.studyArea?.name || studyAreaMap.get(Number(course.studyAreaId)) || "Área no definida"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center bg-blue-600 text-white">
            <span className="text-xl leading-none">•</span>
          </div>
        </div>

        {(prereqs.length > 0 || postreqs.length > 0) && (
          <div className="grid gap-1 border-t border-blue-300 bg-white/70 px-3 py-2 text-[11px] text-gray-700">
            {prereqs.length > 0 && (
              <p>
                <span className="font-semibold">Prerequisitos:</span> {prereqs.map(formatRelatedCourse).join(", ")}
              </p>
            )}
            {postreqs.length > 0 && (
              <p>
                <span className="font-semibold">Postrequisitos:</span> {postreqs.map(formatRelatedCourse).join(", ")}
              </p>
            )}
          </div>
        )}
      </button>
    );
  });
};

const normalizePensumCourseItem = (item: unknown): PensumCourseLike | null => {
  if (!item || typeof item !== "object") return null;

  const value = item as {
    id?: number;
    pensumCourseId?: number;
    pensumId?: number;
    courseCode?: number;
    studyAreaId?: number;
    credits?: number;
    requiredCreds?: number;
    isMandatory?: boolean;
    semester?: number;
    courseName?: string;
    studyAreaName?: string;
    course?: { name?: string; courseCode?: number };
    studyArea?: { name?: string; id?: number };
    prerequisites?: unknown[];
    postrequisites?: unknown[];
  };

  const courseCode = Number(value.courseCode ?? value.course?.courseCode ?? 0);
  const studyAreaId = Number(value.studyAreaId ?? value.studyArea?.id ?? 0);

  return {
    ...(item as PensumCourseLike),
    id: Number(value.id ?? value.pensumCourseId ?? 0),
    pensumId: Number(value.pensumId ?? 0),
    courseCode,
    studyAreaId,
    credits: Number(value.credits ?? 0),
    requiredCreds: Number(value.requiredCreds ?? 0),
    isMandatory: Boolean(value.isMandatory ?? false),
    semester: Number(value.semester ?? 0),
    courseName: value.courseName ?? value.course?.name,
    studyAreaName: value.studyAreaName ?? value.studyArea?.name,
    prerequisites: Array.isArray(value.prerequisites) ? value.prerequisites : [],
    postrequisites: Array.isArray(value.postrequisites) ? value.postrequisites : [],
  };
};

const normalizePensumCourseList = (response: unknown): PensumCourseLike[] => {
  if (Array.isArray(response)) {
    return response.map(normalizePensumCourseItem).filter((item): item is PensumCourseLike => item !== null);
  }
  if (!response || typeof response !== "object") return [];

  const typedResponse = response as { content?: unknown[]; data?: unknown[]; items?: unknown[]; rows?: unknown[]; results?: unknown[] };
  const candidate = typedResponse.content ?? typedResponse.data ?? typedResponse.items ?? typedResponse.rows ?? typedResponse.results;

  if (Array.isArray(candidate)) {
    return candidate.map(normalizePensumCourseItem).filter((item): item is PensumCourseLike => item !== null);
  }

  const single = normalizePensumCourseItem(response);
  return single ? [single] : [];
};

const resolvePensumId = (value: { id?: number; pensumId?: number; pensumCode?: number }) =>
  Number(value.id ?? value.pensumId ?? value.pensumCode ?? 0);

export default function PensumDetailView({ pensumId }: Readonly<{ pensumId: number }>) {
  const router = useRouter();
  const params = useParams<{ id?: string | string[] }>();
  const { pensums } = usePensum();
  const { cursos } = useCurso();
  const { especialidades } = useEspecialidad();

  const [pensumCourses, setPensumCourses] = useState<PensumCourseLike[]>([]);
  const [loadingPensumCourses, setLoadingPensumCourses] = useState(false);
  const [pensumCourseError, setPensumCourseError] = useState<string | null>(null);
  const [showAddCourseForm, setShowAddCourseForm] = useState(false);
  const [showEditCourseForm, setShowEditCourseForm] = useState(false);
  const [selectedCourseAssignment, setSelectedCourseAssignment] = useState<PensumCourseLike | null>(null);
  const [courseFormData, setCourseFormData] = useState<PensumCourseFormData>(initialCourseForm);
  const [editCourseFormData, setEditCourseFormData] = useState<PensumCourseFormData>(initialCourseForm);

  const resolvedPensumId = useMemo(() => {
    const fromProp = Number(pensumId);
    if (Number.isFinite(fromProp) && fromProp > 0) return fromProp;

    const rawParam = params?.id;
    const paramValue = Array.isArray(rawParam) ? rawParam[0] : rawParam;
    const fromParams = Number(paramValue ?? 0);
    return Number.isFinite(fromParams) && fromParams > 0 ? fromParams : 0;
  }, [pensumId, params]);

  const selectedPensum = useMemo(() => pensums.find((p) => resolvePensumId(p) === resolvedPensumId) || null, [pensums, resolvedPensumId]);

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

  const displayPensumName = selectedPensum?.name ?? `Pensum #${resolvedPensumId}`;

  const openEditCourseModal = (course: PensumCourseLike) => {
    setSelectedCourseAssignment(course);
    setEditCourseFormData({
      courseCode: Number(course.courseCode ?? 0),
      studyAreaId: Number(course.studyAreaId ?? 0),
      credits: Number(course.credits ?? 0),
      requiredCreds: Number(course.requiredCreds ?? 0),
      isMandatory: Boolean(course.isMandatory ?? false),
      semester: Number(course.semester ?? 1),
    });
    setShowEditCourseForm(true);
  };

  const refreshPensumCourses = useCallback(async () => {
    const response = await pensumCourseApi.get(resolvedPensumId);
    return normalizePensumCourseList(response);
  }, [resolvedPensumId]);

  useEffect(() => {
    console.info("[PensumDetailView] useEffect loadPensumCourses", {
      resolvedPensumId,
    });

    if (!Number.isFinite(resolvedPensumId) || resolvedPensumId <= 0) {
      setPensumCourses([]);
      setLoadingPensumCourses(false);
      setPensumCourseError("ID de pensum inválido");
      return;
    }

    let isMounted = true;

    const loadPensumCourses = async () => {
      setLoadingPensumCourses(true);
      setPensumCourseError(null);

      try {
        const items = await refreshPensumCourses();
        if (isMounted) setPensumCourses(items);
      } catch (err) {
        if (isMounted) {
          setPensumCourses([]);
          setPensumCourseError(err instanceof Error ? err.message : "No se pudo cargar el detalle del pensum");
        }
      } finally {
        if (isMounted) setLoadingPensumCourses(false);
      }
    };

    loadPensumCourses();

    return () => {
      isMounted = false;
    };
  }, [resolvedPensumId, refreshPensumCourses]);

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
      pensumId: resolvedPensumId,
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
        const items = await refreshPensumCourses();
        setPensumCourses(items);
      } catch {
        // Mantener la vista abierta aunque la recarga falle
      }
    }
  };

  const handleUpdateCourseAssignment = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedCourseAssignment?.id) {
      toast.error("No se encontró la asignación seleccionada");
      return;
    }

    const payload = {
      pensumId: resolvedPensumId,
      courseCode: Number(editCourseFormData.courseCode),
      studyAreaId: Number(editCourseFormData.studyAreaId),
      credits: Number(editCourseFormData.credits),
      requiredCreds: Number(editCourseFormData.requiredCreds),
      isMandatory: Boolean(editCourseFormData.isMandatory),
      semester: Number(editCourseFormData.semester),
    };

    try {
      await pensumCourseApi.update(selectedCourseAssignment.id, payload);
      const items = await refreshPensumCourses();
      setPensumCourses(items);
      toast.success("Curso actualizado con éxito");
      setShowEditCourseForm(false);
      setSelectedCourseAssignment(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No fue posible actualizar el curso");
    }
  };

  const handleDeleteCourseAssignment = async () => {
    if (!selectedCourseAssignment?.id) {
      toast.error("No se encontró la asignación seleccionada");
      return;
    }

    const confirmed = globalThis.confirm("¿Eliminar esta asignación de curso?");
    if (!confirmed) return;

    try {
      await pensumCourseApi.delete(selectedCourseAssignment.id);
      const items = await refreshPensumCourses();
      setPensumCourses(items);
      toast.success("Curso eliminado con éxito");
      setShowEditCourseForm(false);
      setSelectedCourseAssignment(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No fue posible eliminar el curso");
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
              Vista institucional con información estática y cursos dinámicos cargados desde <span className="font-medium">/pensum-course/{resolvedPensumId}</span>.
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

         <section className="space-y-5">
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
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
 
          <aside className="space-y-5">
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900/60">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Detalle dinámico</p>
              <h5 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">Cursos asignados al pensum</h5>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Los datos se cargan desde el endpoint del pensum seleccionado.</p>

              <div className="mt-4 space-y-3">
                {renderPensumCourseState(loadingPensumCourses, pensumCourseError, pensumCourses, courseMap, studyAreaMap, openEditCourseModal)}
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

            <Modal
              isOpen={showEditCourseForm}
              onClose={() => {
                setShowEditCourseForm(false);
                setSelectedCourseAssignment(null);
              }}
              className="max-w-2xl m-4"
            >
              <div className="no-scrollbar relative w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
                <h5 className="text-xl font-semibold text-gray-900 dark:text-white">Editar asignación de curso</h5>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Actualiza los datos del curso asignado o elimínalo.</p>

                <form className="mt-5 grid grid-cols-1 gap-4" onSubmit={handleUpdateCourseAssignment}>
                  <div>
                    <Label>Curso</Label>
                    <select
                      className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      value={editCourseFormData.courseCode > 0 ? String(editCourseFormData.courseCode) : ""}
                      onChange={(event) => setEditCourseFormData((prev) => ({ ...prev, courseCode: Number(event.target.value || 0) }))}
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
                      value={editCourseFormData.studyAreaId > 0 ? String(editCourseFormData.studyAreaId) : ""}
                      onChange={(event) => setEditCourseFormData((prev) => ({ ...prev, studyAreaId: Number(event.target.value || 0) }))}
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
                      <Input type="number" min="0" value={editCourseFormData.credits} onChange={(event) => setEditCourseFormData((prev) => ({ ...prev, credits: Number(event.target.value || 0) }))} />
                    </div>
                    <div>
                      <Label>Créditos requeridos</Label>
                      <Input type="number" min="0" value={editCourseFormData.requiredCreds} onChange={(event) => setEditCourseFormData((prev) => ({ ...prev, requiredCreds: Number(event.target.value || 0) }))} />
                    </div>
                  </div>

                  <div>
                    <Label>Semestre</Label>
                    <select
                      className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      value={editCourseFormData.semester > 0 ? String(editCourseFormData.semester) : ""}
                      onChange={(event) => setEditCourseFormData((prev) => ({ ...prev, semester: Number(event.target.value || 0) }))}
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
                      id="isMandatoryEdit"
                      type="checkbox"
                      checked={editCourseFormData.isMandatory}
                      onChange={(event) => setEditCourseFormData((prev) => ({ ...prev, isMandatory: event.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <Label htmlFor="isMandatoryEdit" className="mb-0">
                      Es obligatorio
                    </Label>
                  </div>

                  <div className="flex justify-between gap-3">
                    <Button type="button" size="sm" variant="outline" onClick={handleDeleteCourseAssignment}>
                      Eliminar
                    </Button>
                    <div className="flex gap-3">
                      <Button type="button" size="sm" variant="outline" onClick={() => setShowEditCourseForm(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" size="sm">
                        Guardar cambios
                      </Button>
                    </div>
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
