"use client";

import React, { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { MdBook, MdCheckCircle, MdNumbers, MdSchool } from "react-icons/md";
import { useModal } from "@/hooks/useModal";
import { usePensumCourse, type PensumCourse } from "@/hooks/usePensumCourse";
import { usePensum } from "@/hooks/usePensum";
import { useCurso } from "@/hooks/useCurso";
import { useEspecialidad } from "@/hooks/useEspecialidad";
import { GenericTable, type Column } from "@/components/ui/table/GenericTable";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

type FormData = {
  pensumId: number;
  courseCode: number;
  studyAreaId: number;
  credits: number;
  requiredCreds: number;
  isMandatory: boolean;
  semester: number;
};

const initialForm: FormData = {
  pensumId: 0,
  courseCode: 0,
  studyAreaId: 0,
  credits: 0,
  requiredCreds: 0,
  isMandatory: true,
  semester: 0,
};

const toOptionValue = (value: number) => String(Number(value ?? 0));

type PensumLike = { id?: number; pensumId?: number; pensumCode?: number; name?: string };

const resolvePensumId = (pensum: PensumLike) =>
  Number(pensum.id ?? pensum.pensumId ?? pensum.pensumCode ?? 0);

const resolveCourseCode = (course: { id?: number; courseCode?: number }) => Number(course.courseCode ?? course.id ?? 0);

const resolveStudyAreaId = (studyArea: { id?: number; studyAreaId?: number }) =>
  Number(studyArea.id ?? studyArea.studyAreaId ?? 0);

const SEMESTER_OPTIONS = [
  { value: 1, label: "Primer semestre" },
  { value: 2, label: "Segundo semestre" },
] as const;

export default function PensumCourseTable() {
  const { isOpen, openModal, closeModal } = useModal();
  const { pensumCourses, loading, error, createPensumCourse, updatePensumCourse, deletePensumCourse } = usePensumCourse();
  const { pensums } = usePensum();
  const { cursos } = useCurso();
  const { especialidades } = useEspecialidad();

  const [selectedRow, setSelectedRow] = useState<PensumCourse | null>(null);
  const [formData, setFormData] = useState<FormData>(initialForm);

  const validPensums = useMemo(() => pensums.filter((pensum) => resolvePensumId(pensum as PensumLike) > 0), [pensums]);

  const pensumMap = useMemo(() => {
    const map = new Map<number, string>();
    pensums.forEach((pensum) => map.set(resolvePensumId(pensum as PensumLike), pensum.name));
    return map;
  }, [pensums]);

  const courseMap = useMemo(() => {
    const map = new Map<number, string>();
    cursos.forEach((course) => map.set(resolveCourseCode(course), course.name));
    return map;
  }, [cursos]);

  const studyAreaMap = useMemo(() => {
    const map = new Map<number, string>();
    especialidades.forEach((studyArea) => map.set(resolveStudyAreaId(studyArea), studyArea.name));
    return map;
  }, [especialidades]);

  const columns: Column<PensumCourse>[] = useMemo(
    () => [
      {
        header: (
          <span className="inline-flex items-center gap-1.5">
            <MdBook className="h-4 w-4" />
            Pensum
          </span>
        ),
        cell: (item) => item.pensumName || pensumMap.get(Number(item.pensumId)) || `ID ${item.pensumId}`,
      },
      {
        header: (
          <span className="inline-flex items-center gap-1.5">
            <MdSchool className="h-4 w-4" />
            Curso
          </span>
        ),
        cell: (item) => item.courseName || courseMap.get(Number(item.courseCode)) || `Código ${item.courseCode}`,
      },
      {
        header: "Área de estudio",
        cell: (item) => item.studyAreaName || studyAreaMap.get(Number(item.studyAreaId)) || `ID ${item.studyAreaId}`,
      },
      { header: "Créditos", cell: (item) => Number(item.credits ?? 0) },
      { header: "Créditos requeridos", cell: (item) => Number(item.requiredCreds ?? 0) },
      {
        header: (
          <span className="inline-flex items-center gap-1.5">
            <MdCheckCircle className="h-4 w-4" />
            Obligatorio
          </span>
        ),
        cell: (item) => (item.isMandatory ? "Sí" : "No"),
      },
      {
        header: (
          <span className="inline-flex items-center gap-1.5">
            <MdNumbers className="h-4 w-4" />
            Semestre
          </span>
        ),
        cell: (item) => Number(item.semester ?? 0),
      },
    ],
    [pensumMap, courseMap, studyAreaMap],
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const totalPages = Math.max(1, Math.ceil(pensumCourses.length / itemsPerPage));
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return pensumCourses.slice(start, start + itemsPerPage);
  }, [pensumCourses, currentPage]);

  const handleAdd = () => {
    setSelectedRow(null);
    setFormData(initialForm);
    openModal();
  };

  const handleEdit = (row: PensumCourse) => {
    setSelectedRow(row);
    setFormData({
      pensumId: Number(row.pensumId ?? 0),
      courseCode: Number(row.courseCode ?? 0),
      studyAreaId: Number(row.studyAreaId ?? 0),
      credits: Number(row.credits ?? 0),
      requiredCreds: Number(row.requiredCreds ?? 0),
      isMandatory: Boolean(row.isMandatory ?? false),
      semester: Number(row.semester ?? 0),
    });
    openModal();
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (formData.pensumId <= 0) {
      toast.error("Debes seleccionar un pensum");
      return;
    }

    if (formData.courseCode <= 0) {
      toast.error("Debes seleccionar un curso");
      return;
    }

    if (formData.studyAreaId <= 0) {
      toast.error("Debes seleccionar un área de estudio");
      return;
    }

    if (formData.credits < 0 || formData.requiredCreds < 0) {
      toast.error("Los créditos no pueden ser negativos");
      return;
    }

    if (!SEMESTER_OPTIONS.some((option) => option.value === formData.semester)) {
      toast.error("Debes seleccionar un semestre válido");
      return;
    }

    const payload = {
      pensumId: Number(formData.pensumId),
      courseCode: Number(formData.courseCode),
      studyAreaId: Number(formData.studyAreaId),
      credits: Number(formData.credits),
      requiredCreds: Number(formData.requiredCreds),
      isMandatory: Boolean(formData.isMandatory),
      semester: Number(formData.semester),
    };

    const success = selectedRow
      ? await updatePensumCourse(selectedRow.id, payload)
      : await createPensumCourse(payload);

    if (success) {
      toast.success(`Relación ${selectedRow ? "actualizada" : "creada"} con éxito`);
      closeModal();
      return;
    }

    toast.error("No fue posible guardar la relación pensum-course");
  };

  if (loading && pensumCourses.length === 0) return <div>Cargando pensum-course...</div>;
  if (error && pensumCourses.length === 0) return <div>Error: {error}</div>;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-white/5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Pensum-Course</h3>
        <Button size="sm" onClick={handleAdd}>
          Agregar relación
        </Button>
      </div>

      <GenericTable
        data={currentData}
        columns={columns}
        onEdit={handleEdit}
        onDelete={(item) => deletePensumCourse(item.id)}
        pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }}
      />

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-190 m-4">
        <div className="no-scrollbar relative w-full max-w-190 overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {selectedRow ? "Editar relación" : "Crear relación"}
          </h4>

          <form className="grid grid-cols-1 gap-4" onSubmit={handleSave}>
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/10 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <Label>Pensum</Label>
                <select
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                  value={formData.pensumId > 0 ? String(formData.pensumId) : ""}
                  onChange={(event) => setFormData((prev) => ({ ...prev, pensumId: Number(event.target.value || 0) }))}
                >
                  <option value="">Seleccione un pensum</option>
                  {validPensums.map((pensum) => (
                    <option
                      key={resolvePensumId(pensum as PensumLike)}
                      value={toOptionValue(resolvePensumId(pensum as PensumLike))}
                    >
                      {pensum.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Curso</Label>
                <select
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                  value={formData.courseCode > 0 ? String(formData.courseCode) : ""}
                  onChange={(event) => setFormData((prev) => ({ ...prev, courseCode: Number(event.target.value || 0) }))}
                >
                  <option value="">Seleccione un curso</option>
                  {cursos.map((course) => (
                    <option key={resolveCourseCode(course)} value={toOptionValue(resolveCourseCode(course))}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Área de estudio</Label>
                <select
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                  value={formData.studyAreaId > 0 ? String(formData.studyAreaId) : ""}
                  onChange={(event) => setFormData((prev) => ({ ...prev, studyAreaId: Number(event.target.value || 0) }))}
                >
                  <option value="">Seleccione un área</option>
                  {especialidades.map((studyArea) => (
                    <option key={resolveStudyAreaId(studyArea)} value={toOptionValue(resolveStudyAreaId(studyArea))}>
                      {studyArea.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Créditos</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.credits}
                  onChange={(event) => setFormData((prev) => ({ ...prev, credits: Number(event.target.value || 0) }))}
                />
              </div>

              <div>
                <Label>Créditos requeridos</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.requiredCreds}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, requiredCreds: Number(event.target.value || 0) }))
                  }
                />
              </div>

              <div>
                <Label>Semestre</Label>
                <select
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                  value={formData.semester > 0 ? String(formData.semester) : ""}
                  onChange={(event) => setFormData((prev) => ({ ...prev, semester: Number(event.target.value || 0) }))}
                >
                  <option value="">Seleccione un semestre</option>
                  {SEMESTER_OPTIONS.map((semesterOption) => (
                    <option key={semesterOption.value} value={semesterOption.value}>
                      {semesterOption.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  id="isMandatory"
                  type="checkbox"
                  checked={formData.isMandatory}
                  onChange={(event) => setFormData((prev) => ({ ...prev, isMandatory: event.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <Label htmlFor="isMandatory" className="mb-0">
                  Es obligatorio
                </Label>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button size="sm" type="button" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button size="sm" type="submit">
                {selectedRow ? "Guardar cambios" : "Crear relación"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
