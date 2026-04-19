"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { GenericModal } from "@/components/ui/modal/GenericModal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Alert from "@/components/ui/alert/Alert";
import { useStudentPensum } from "@/hooks/useStudentPensum";

export interface StudentGradeFormData {
  studentPensumId: number;
  pensumCourseId: number;
  gradeType: string;
  grade: number;
  isApproved: boolean;
}

interface AddStudentGradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StudentGradeFormData) => Promise<void>;
  gradeTypes: Array<{ id: string; description: string }>;
  students: Array<{ studentId: number; firstname: string; lastname: string }>;
  initialStudentId?: number;
  loading?: boolean;
}

const initialFormData: StudentGradeFormData = {
  studentPensumId: 0,
  pensumCourseId: 0,
  gradeType: "",
  grade: 0,
  isApproved: false,
};

export function AddStudentGradeModal({
  isOpen,
  onClose,
  onSubmit,
  gradeTypes,
  students,
  initialStudentId,
  loading = false,
}: Readonly<AddStudentGradeModalProps>) {
  const [formData, setFormData] = useState<StudentGradeFormData>(initialFormData);
  const [selectedStudentId, setSelectedStudentId] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    studentPensums,
    assignableCourses,
    loading: studentPensumLoading,
    fetchByStudentId,
    fetchAssignableCourses,
    clearAssignableCourses,
    clearStudentPensums,
  } = useStudentPensum();

  const handleChange = (field: keyof StudentGradeFormData, value: unknown) => {
    setFormError(null);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setSelectedStudentId(0);
    setFormError(null);
    clearStudentPensums();
    onClose();
  };

  const handleSelectStudent = async (value: string) => {
    const studentId = Number(value);
    setFormError(null);
    setSelectedStudentId(studentId);
    setFormData((prev) => ({ ...prev, studentPensumId: 0, pensumCourseId: 0 }));

    if (!studentId) {
      clearStudentPensums();
      return;
    }

    clearAssignableCourses();
    await fetchByStudentId(studentId);
  };

  const handleSelectStudentPensum = async (value: string) => {
    const studentPensumId = Number(value);
    setFormError(null);
    setFormData((prev) => ({ ...prev, studentPensumId, pensumCourseId: 0 }));

    if (!studentPensumId) {
      clearAssignableCourses();
      return;
    }

    const selected = studentPensums.find((item) => Number(item.studentPensumId) === studentPensumId);
    const pensumId = selected?.pensumId ?? 0;

    if (pensumId > 0 && selectedStudentId > 0) {
      await fetchAssignableCourses({ pensumId, studentId: selectedStudentId });
    }
  };

  // Definir opciones para los selects
  const gradeTypeOptions = gradeTypes.map((type) => ({
    value: type.id,
    label: type.description,
  }));

  const studentOptions = students.map((student) => ({
    value: String(student.studentId),
    label: `${student.firstname} ${student.lastname} - ${student.studentId}`,
  }));

  const studentPensumOptions = studentPensums.map((item) => ({
    value: String(item.studentPensumId),
    label: `${item.pensum?.name || "Pensum"} (ID ${item.studentPensumId})`,
  }));

  const courseOptions = assignableCourses.map((course) => {
    const courseId = Number(course.pensumCourseId ?? course.id ?? 0);
    const label =
      String(course.name ?? "").trim() ||
      String(course.courseName ?? "").trim() ||
      String(course.course?.name ?? "").trim() ||
      `Curso ${courseId}`;

    return {
      value: String(courseId),
      label,
    };
  });

  useEffect(() => {
    if (!isOpen) return;
    if (!Number.isFinite(Number(initialStudentId)) || Number(initialStudentId) <= 0) return;

    void handleSelectStudent(String(initialStudentId));
  }, [isOpen, initialStudentId]);

  // Auto-seleccionar pensum si solo hay uno
  useEffect(() => {
    if (studentPensums.length === 1 && formData.studentPensumId === 0) {
      const onlyPensum = studentPensums[0];
      void handleSelectStudentPensum(String(onlyPensum.studentPensumId));
    }
  }, [studentPensums]);

  // Auto-seleccionar curso si solo hay uno
  useEffect(() => {
    if (courseOptions.length === 1 && formData.pensumCourseId === 0) {
      const onlyCourse = courseOptions[0];
      handleChange("pensumCourseId", Number(onlyCourse.value));
    }
  }, [courseOptions, formData.pensumCourseId]);

  // Auto-seleccionar tipo de calificación si solo hay uno
  useEffect(() => {
    if (gradeTypeOptions.length === 1 && !formData.gradeType) {
      const onlyGradeType = gradeTypeOptions[0];
      handleChange("gradeType", onlyGradeType.value);
    }
  }, [gradeTypeOptions, formData.gradeType]);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    setFormError(null);

    if (!selectedStudentId) {
      const message = "El estudiante es obligatorio";
      setFormError(message);
      toast.error(message);
      return;
    }
    if (!formData.studentPensumId) {
      const message = "El registro estudiante-pensum es obligatorio";
      setFormError(message);
      toast.error(message);
      return;
    }
    if (!formData.pensumCourseId) {
      const message = "El curso es obligatorio";
      setFormError(message);
      toast.error(message);
      return;
    }
    if (!formData.gradeType) {
      const message = "El tipo de calificación es obligatorio";
      setFormError(message);
      toast.error(message);
      return;
    }
    if (formData.grade < 0 || formData.grade > 100) {
      const message = "La calificación es obligatoria y debe estar entre 0 y 100";
      setFormError(message);
      toast.error(message);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      toast.success("Calificación agregada exitosamente");
      handleClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al agregar calificación";
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const coursePlaceholder = (() => {
    if (studentPensumLoading) return "Cargando cursos...";
    if (formData.studentPensumId === 0) return "Primero selecciona un pensum";
    if (courseOptions.length === 0) return "No hay cursos para este pensum";
    return "Selecciona un curso";
  })();

  const isBusy = isSubmitting || loading || studentPensumLoading;

  return (
    <GenericModal isOpen={isOpen} onClose={handleClose} title="Agregar Calificación" size="md" showCloseButton>
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <Alert
            variant="error"
            title="No se pudo guardar"
            message={formError}
            dismissible
            onClose={() => setFormError(null)}
          />
        )}

        {/* Estudiante */}
        <div>
          <Label htmlFor="studentId">Estudiante *</Label>
          <Select
            id="studentId"
            name="studentId"
            required
            options={studentOptions}
            placeholder="Selecciona un estudiante"
            onChange={handleSelectStudent}
            value={String(selectedStudentId)}
          />
        </div>

        {/* Estudiante Pensum */}
        <div>
          <Label htmlFor="studentPensumId">Registro Estudiante-Pensum *</Label>
          <Select
            id="studentPensumId"
            name="studentPensumId"
            required
            options={studentPensumOptions}
            placeholder={studentPensumLoading ? "Cargando registros..." : "Selecciona un registro"}
            onChange={handleSelectStudentPensum}
            value={String(formData.studentPensumId)}
          />
        </div>

        {/* Curso */}
        <div>
          <Label htmlFor="pensumCourseId">Curso *</Label>
          <Select
            id="pensumCourseId"
            name="pensumCourseId"
            required
            options={courseOptions}
            placeholder={coursePlaceholder}
            onChange={(value) => handleChange("pensumCourseId", Number(value))}
            value={String(formData.pensumCourseId)}
          />
        </div>

        {/* Tipo de Calificación */}
        <div>
          <Label htmlFor="gradeType">Tipo de Calificación *</Label>
          <Select
            id="gradeType"
            name="gradeType"
            required
            options={gradeTypeOptions}
            placeholder="Selecciona un tipo"
            onChange={(value) => handleChange("gradeType", value)}
            value={formData.gradeType}
          />
        </div>

        {/* Calificación */}
        <div>
          <Label htmlFor="grade">Calificación (0-100) *</Label>
          <Input
            id="grade"
            name="grade"
            type="number"
            min="0"
            max="100"
            step={0.5}
            placeholder="Ingresa la calificación"
            value={String(formData.grade)}
            onChange={(e) => handleChange("grade", Number(e.target.value))}
            required
          />
        </div>

        {/* Aprobado */}
        <div className="flex items-center gap-3 rounded-md bg-gray-50 p-3 dark:bg-gray-800/50">
          <input
            type="checkbox"
            id="isApproved"
            checked={formData.isApproved}
            onChange={(e) => handleChange("isApproved", e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="isApproved" className="mb-0! cursor-pointer">
            Aprobado
          </Label>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <Button type="submit" variant="primary" disabled={isBusy}>
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isBusy}>
            Cancelar
          </Button>
        </div>
      </form>
    </GenericModal>
  );
}
