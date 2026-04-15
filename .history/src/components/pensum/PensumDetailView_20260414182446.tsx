"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { PencilIcon, PlusIcon, TrashBinIcon } from "@/icons";
import { useCurso } from "@/hooks/useCurso";
import { useEspecialidad } from "@/hooks/useEspecialidad";
import type { PensumCourse } from "@/hooks/usePensumCourse";
import { pensumCourseApi } from "@/service/pensumCourse.service";
import api from "@/service/api.service";
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

const formatRelatedCourseCode = (item: unknown): string => {
  if (typeof item === "number") return String(item).padStart(4, "0");
  if (typeof item === "string") {
    const parsed = Number(item);
    return Number.isFinite(parsed) && parsed > 0 ? String(parsed).padStart(4, "0") : item;
  }
  if (!item || typeof item !== "object") return "N/A";

  const value = item as { courseCode?: number; course?: { courseCode?: number } };
  const code = Number(value.courseCode ?? value.course?.courseCode ?? 0);
  return code > 0 ? String(code).padStart(4, "0") : "N/A";
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

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {pensumCourses.map((course) => {
    const courseCode = Number(course.courseCode ?? 0);
    const name = course.courseName || course.course?.name || courseMap.get(courseCode) || `Curso ${courseCode}`;
    const credits = Number(course.credits ?? 0);
    const prereqs = Array.isArray(course.prerequisites) ? course.prerequisites : [];
    const prereqCodes = prereqs.map(formatRelatedCourseCode).filter((code) => code !== "N/A");

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

          <div className="flex items-center justify-center bg-blue-600 px-1 text-white">
            {prereqCodes.length > 0 ? (
              <div className="flex max-h-full flex-col items-center justify-center gap-0.5 overflow-hidden text-center text-[10px] font-semibold leading-tight">
                {prereqCodes.map((code, index) => (
                  <span key={`${code}-${index}`} className="block w-full truncate">
                    {code}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xl leading-none">•</span>
            )}
          </div>
        </div>

      </button>
    );
      })}
    </div>
  );
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

export default function PensumDetailView({ pensumId }: Readonly<{ pensumId: number }>) {
  const router = useRouter();
  const params = useParams<{ id?: string | string[] }>();
  const { cursos } = useCurso();
  const { especialidades } = useEspecialidad();

  const [pensumCourses, setPensumCourses] = useState<PensumCourseLike[]>([]);
  const [loadingPensumCourses, setLoadingPensumCourses] = useState(false);
  const [pensumCourseError, setPensumCourseError] = useState<string | null>(null);
  const [showAddCourseForm, setShowAddCourseForm] = useState(false);
  const [showEditCourseForm, setShowEditCourseForm] = useState(false);
  const [isEditingCourseInModal, setIsEditingCourseInModal] = useState(false);
  const [courseDetailModalError, setCourseDetailModalError] = useState<string | null>(null);
  const [showAddPrerequisiteForm, setShowAddPrerequisiteForm] = useState(false);
  const [newPrerequisiteId, setNewPrerequisiteId] = useState(0);
  const [savingPrerequisite, setSavingPrerequisite] = useState(false);
  const [selectedCourseAssignment, setSelectedCourseAssignment] = useState<PensumCourseLike | null>(null);
  const [courseFormData, setCourseFormData] = useState<PensumCourseFormData>(initialCourseForm);
  const [editCourseFormData, setEditCourseFormData] = useState<PensumCourseFormData>(initialCourseForm);
  const [courseSearchTerm, setCourseSearchTerm] = useState("");

  const resolvedPensumId = useMemo(() => {
    const fromProp = Number(pensumId);
    if (Number.isFinite(fromProp) && fromProp > 0) return fromProp;

    const rawParam = params?.id;
    const paramValue = Array.isArray(rawParam) ? rawParam[0] : rawParam;
    const fromParams = Number(paramValue ?? 0);
    return Number.isFinite(fromParams) && fromParams > 0 ? fromParams : 0;
  }, [pensumId, params]);

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

  const filteredPensumCourses = useMemo(() => {
    const normalized = courseSearchTerm.trim().toLowerCase();
    if (!normalized) return pensumCourses;

    return pensumCourses.filter((course) => {
      const courseCode = Number(course.courseCode ?? 0);
      const courseName = course.courseName || course.course?.name || courseMap.get(courseCode) || "";
      return courseName.toLowerCase().includes(normalized);
    });
  }, [pensumCourses, courseSearchTerm, courseMap]);

  const prerequisiteCandidates = useMemo(() => {
    const selectedId = Number(selectedCourseAssignment?.id ?? 0);
    if (selectedId <= 0) return [];

    return pensumCourses.filter((course) => Number(course.id ?? 0) > 0 && Number(course.id ?? 0) !== selectedId);
  }, [pensumCourses, selectedCourseAssignment]);

  const openCourseDetailModal = (course: PensumCourseLike) => {
    setSelectedCourseAssignment(course);
    setCourseDetailModalError(null);
    setEditCourseFormData({
      courseCode: Number(course.courseCode ?? 0),
      studyAreaId: Number(course.studyAreaId ?? 0),
      credits: Number(course.credits ?? 0),
      requiredCreds: Number(course.requiredCreds ?? 0),
      isMandatory: Boolean(course.isMandatory ?? false),
      semester: Number(course.semester ?? 1),
    });
    setIsEditingCourseInModal(false);
    setShowAddPrerequisiteForm(false);
    setNewPrerequisiteId(0);
    setShowEditCourseForm(true);
  };

  const closeCourseDetailModal = useCallback(() => {
    setShowEditCourseForm(false);
    setSelectedCourseAssignment(null);
    setIsEditingCourseInModal(false);
    setShowAddPrerequisiteForm(false);
    setNewPrerequisiteId(0);
    setCourseDetailModalError(null);
  }, []);

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
      setCourseDetailModalError(null);
      const updatedAssignment = items.find((item) => item.id === selectedCourseAssignment.id) ?? null;
      setSelectedCourseAssignment(updatedAssignment);
      setIsEditingCourseInModal(false);
      setShowEditCourseForm(false);
      setShowEditCourseForm(true);
    } catch (err) {
      setCourseDetailModalError(err instanceof Error ? err.message : "No fue posible actualizar el curso");
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
      closeCourseDetailModal();
    } catch (err) {
      setCourseDetailModalError(err instanceof Error ? err.message : "No fue posible eliminar el curso");
    }
  };

  const handleCreateCoursePrerequisite = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    const pensumCourseId = Number(selectedCourseAssignment?.id ?? 0);
    const prerequisiteId = Number(newPrerequisiteId ?? 0);

    if (pensumCourseId <= 0) {
      toast.error("No se encontró la asignación de curso seleccionada");
      return;
    }

    if (prerequisiteId <= 0) {
      toast.error("Debes seleccionar un prerequisite válido");
      return;
    }

    if (prerequisiteId === pensumCourseId) {
      toast.error("El curso no puede ser prerequisito de sí mismo");
      return;
    }

    setSavingPrerequisite(true);

    try {
      await api.post("/pensum-course-prerequisite", {
        pensumCourseId,
        prerequisiteId,
      });

      toast.success("Prerequisito agregado con éxito");
      setShowAddPrerequisiteForm(false);
      setNewPrerequisiteId(0);

      const items = await refreshPensumCourses();
      setPensumCourses(items);
      const updatedAssignment = items.find((item) => item.id === pensumCourseId) ?? null;
      setSelectedCourseAssignment(updatedAssignment);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No fue posible agregar el prerequisite");
    } finally {
      setSavingPrerequisite(false);
    }
  };

  return (
    <div className="space-y-6">


      <div className="w-full rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
            <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-500 transition-colors rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900"
        >
          ←
        </button>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Detalle del Pensum</h1>
      </div>
        <div className="mt-6 space-y-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Detalle dinámico</p>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h5 className="text-lg font-semibold text-gray-900 dark:text-white">Cursos asignados al pensum</h5>
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
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Los datos se cargan desde el endpoint del pensum seleccionado.</p>

              <div className="mt-4">
                <Input
                  value={courseSearchTerm}
                  onChange={(event) => setCourseSearchTerm(event.target.value)}
                  placeholder="Buscar curso por nombre"
                />
              </div>

              <div className="mt-4 space-y-3">
                {courseSearchTerm.trim() && filteredPensumCourses.length === 0 && pensumCourses.length > 0 ? (
                  <div className="rounded-2xl bg-white p-4 text-sm text-gray-500 shadow-theme-xs dark:bg-gray-900">
                    No se encontraron cursos con ese nombre.
                  </div>
                ) : (
                  renderPensumCourseState(loadingPensumCourses, pensumCourseError, filteredPensumCourses, courseMap, studyAreaMap, openCourseDetailModal)
                )}
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
              onClose={closeCourseDetailModal}
              className="max-w-2xl m-4"
            >
              <div className="no-scrollbar relative w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
                {courseDetailModalError && (
                  <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-300">
                    {courseDetailModalError}
                  </div>
                )}

                <div>
                  <h5 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {isEditingCourseInModal ? "Editar asignación de curso" : "Detalle de asignación de curso"}
                  </h5>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {isEditingCourseInModal
                      ? "Actualiza los datos del curso en este mismo modal."
                      : "Consulta la información del curso y usa los íconos para editar o eliminar."}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2">
                  {!isEditingCourseInModal && (
                    <button
                      type="button"
                      title="Editar curso"
                      aria-label="Editar curso"
                      onClick={() => {
                        setCourseDetailModalError(null);
                        setShowAddPrerequisiteForm(false);
                        setIsEditingCourseInModal(true);
                      }}
                      className="p-2 text-gray-500 transition-colors rounded-lg hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/20 dark:hover:text-brand-400"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    type="button"
                    title="Eliminar curso"
                    aria-label="Eliminar curso"
                    onClick={handleDeleteCourseAssignment}
                    className="p-2 text-gray-500 transition-colors rounded-lg hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                  >
                    <TrashBinIcon className="w-5 h-5" />
                  </button>
                </div>

                {!isEditingCourseInModal && selectedCourseAssignment && (
                  <div className="mt-5 space-y-4 rounded-2xl border border-gray-200 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-800/30">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Código</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{String(Number(selectedCourseAssignment.courseCode ?? 0)).padStart(4, "0")}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Curso</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedCourseAssignment.courseName || selectedCourseAssignment.course?.name || courseMap.get(Number(selectedCourseAssignment.courseCode ?? 0)) || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Área de estudio</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedCourseAssignment.studyAreaName ||
                            selectedCourseAssignment.studyArea?.name ||
                            studyAreaMap.get(Number(selectedCourseAssignment.studyAreaId ?? 0)) ||
                            "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Semestre</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{Number(selectedCourseAssignment.semester ?? 0)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Créditos</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{Number(selectedCourseAssignment.credits ?? 0)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Créditos requeridos</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{Number(selectedCourseAssignment.requiredCreds ?? 0)}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Tipo</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedCourseAssignment.isMandatory ? "Obligatorio" : "Optativo"}
                      </p>
                    </div>

                    {Array.isArray(selectedCourseAssignment.prerequisites) && selectedCourseAssignment.prerequisites.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Prerequisitos</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{selectedCourseAssignment.prerequisites.map(formatRelatedCourse).join(", ")}</p>
                      </div>
                    )}

                    {Array.isArray(selectedCourseAssignment.postrequisites) && selectedCourseAssignment.postrequisites.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Postrequisitos</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{selectedCourseAssignment.postrequisites.map(formatRelatedCourse).join(", ")}</p>
                      </div>
                    )}

                    <div className="pt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowAddPrerequisiteForm((prev) => !prev);
                          if (showAddPrerequisiteForm) {
                            setNewPrerequisiteId(0);
                          }
                        }}
                      >
                        {showAddPrerequisiteForm ? "Ocultar" : "Agregar course-prerequisite"}
                      </Button>
                    </div>

                    {showAddPrerequisiteForm && (
                      <form className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900/60" onSubmit={handleCreateCoursePrerequisite}>
                        <div>
                          <Label>Prerequisite (asignación de curso del pensum)</Label>
                          <select
                            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                            value={newPrerequisiteId > 0 ? String(newPrerequisiteId) : ""}
                            onChange={(event) => setNewPrerequisiteId(Number(event.target.value || 0))}
                          >
                            <option value="">Seleccione una asignación</option>
                            {prerequisiteCandidates.map((candidate) => {
                              const candidateId = Number(candidate.id ?? 0);
                              const courseCode = Number(candidate.courseCode ?? 0);
                              const label = candidate.courseName || candidate.course?.name || courseMap.get(courseCode) || "Curso sin nombre";

                              return (
                                <option key={candidateId} value={String(candidateId)}>
                                  #{candidateId} - {String(courseCode).padStart(4, "0")} - {label}
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        <div className="flex justify-end gap-3">
                          <Button type="button" size="sm" variant="outline" onClick={() => setShowAddPrerequisiteForm(false)}>
                            Cancelar
                          </Button>
                          <Button type="submit" size="sm" disabled={savingPrerequisite}>
                            {savingPrerequisite ? "Guardando..." : "Guardar prerequisite"}
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {isEditingCourseInModal && (
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
                    <div className="flex gap-3">
                      <Button type="button" size="sm" variant="outline" onClick={() => setIsEditingCourseInModal(false)}>
                        Volver al detalle
                      </Button>
                      <Button type="submit" size="sm">
                        Guardar cambios
                      </Button>
                    </div>
                  </div>
                  </form>
                )}
              </div>
            </Modal>
        </div>
      </div>
    </div>
  );
}
