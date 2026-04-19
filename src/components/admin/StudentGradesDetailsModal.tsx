"use client";

import React, { useState, useEffect } from "react";
import { MdEdit, MdDelete, MdCheckCircle } from "react-icons/md";
import GenericModal from "@/components/ui/modal/GenericModal";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { useStudentGrade, type StudentGrade } from "@/hooks/useStudentGrade";
import { useStudent } from "@/hooks/useStudent";

interface StudentGradesDetailsModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly studentId: number | null;
}

export default function StudentGradesDetailsModal({
  isOpen,
  onClose,
  studentId,
}: StudentGradesDetailsModalProps) {
  const { studentGrades, gradeTypes, loading, error, fetchByStudentAndPensum, updateStudentGrade, deleteStudentGrade } = useStudentGrade();
  const { students } = useStudent();

  const [selectedGrade, setSelectedGrade] = useState<StudentGrade | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editValues, setEditValues] = useState({
    isApproved: false,
    gradeType: "",
    grade: 0,
  });
  const [editError, setEditError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const student = students?.find((s) => s.studentId === studentId);

  useEffect(() => {
    if (isOpen && studentId) {
      setSuccessMessage(null);
      setEditError(null);
      setIsEditing(false);
      setIsDeleting(false);
      setSelectedGrade(null);
      // Cargar notas para todos los pensums del estudiante
      fetchByStudentAndPensum(studentId, 0);
    }
  }, [isOpen, studentId]);

  const handleEditClick = (grade: StudentGrade) => {
    setSelectedGrade(grade);
    setEditValues({
      isApproved: grade.isApproved,
      gradeType: grade.gradeType,
      grade: grade.grade,
    });
    setEditError(null);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedGrade) return;

    if (editValues.grade < 0 || editValues.grade > 100) {
      setEditError("La calificación debe estar entre 0 y 100");
      return;
    }

    if (!editValues.gradeType) {
      setEditError("Debe seleccionar un tipo de calificación");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateStudentGrade(selectedGrade.studentGradeId || selectedGrade.id, editValues);
      setSuccessMessage("Calificación actualizada exitosamente");
      setIsEditing(false);
      setSelectedGrade(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (grade: StudentGrade) => {
    setSelectedGrade(grade);
    setIsDeleting(true);
    setEditError(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedGrade) return;

    setIsSubmitting(true);
    try {
      await deleteStudentGrade(selectedGrade.studentGradeId || selectedGrade.id);
      setSuccessMessage("Calificación eliminada exitosamente");
      setIsDeleting(false);
      setSelectedGrade(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedGrade(null);
    setEditError(null);
  };

  const handleCancelDelete = () => {
    setIsDeleting(false);
    setSelectedGrade(null);
  };

  return (
    <GenericModal isOpen={isOpen} onClose={onClose} title="Calificaciones del Estudiante" className="max-w-3xl">
      <div className="space-y-4 p-6">
        {/* Información del estudiante */}
        {student && (
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">
                {student.firstname} {student.lastname}
              </span>{" "}
              (Código: {student.studentId})
            </p>
          </div>
        )}

        {error && <Alert variant="error" dismissible>{error}</Alert>}
        {successMessage && <Alert variant="success" dismissible>{successMessage}</Alert>}

        {/* Vista de Edición */}
        {isEditing && selectedGrade && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Editar Calificación</h3>
            {editError && <Alert variant="error" dismissible>{editError}</Alert>}

            <div className="space-y-4">
              <div>
                <Label htmlFor="course-edit">Curso</Label>
                <InputField
                  id="course-edit"
                  type="text"
                  value={selectedGrade.pensumCourse?.name || ""}
                  disabled
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="grade-edit">Calificación (0-100)</Label>
                <InputField
                  id="grade-edit"
                  type="number"
                  value={editValues.grade}
                  onChange={(e) => setEditValues({ ...editValues, grade: Number(e.target.value) })}
                  min="0"
                  max="100"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="grade-type-edit">Tipo de Calificación</Label>
                <Select
                  id="grade-type-edit"
                  options={gradeTypes.map((gt) => ({
                    value: gt.id || gt.description,
                    label: gt.description || gt.id,
                  }))}
                  value={editValues.gradeType}
                  onChange={(value) => setEditValues({ ...editValues, gradeType: value })}
                  placeholder="Seleccionar tipo"
                  className="mt-1"
                />
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                <input
                  type="checkbox"
                  id="is-approved-edit"
                  checked={editValues.isApproved}
                  onChange={(e) => setEditValues({ ...editValues, isApproved: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="is-approved-edit" className="m-0">
                  Marcar como aprobado
                </Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveEdit} disabled={isSubmitting} className="flex-1" variant="primary">
                  {isSubmitting ? "Guardando..." : "Guardar"}
                </Button>
                <Button onClick={handleCancelEdit} disabled={isSubmitting} className="flex-1" variant="outline">
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Vista de Confirmación de Eliminación */}
        {isDeleting && selectedGrade && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Eliminar Calificación</h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              ¿Estás seguro de que deseas eliminar la calificación de{" "}
              <span className="font-semibold">{selectedGrade.pensumCourse?.name}</span>? Esta acción no se puede
              deshacer.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleConfirmDelete} disabled={isSubmitting} className="flex-1" variant="primary">
                {isSubmitting ? "Eliminando..." : "Eliminar"}
              </Button>
              <Button onClick={handleCancelDelete} disabled={isSubmitting} className="flex-1" variant="outline">
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Lista de Calificaciones */}
        {!isEditing && !isDeleting && (
          <>
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-brand-500"></div>
              </div>
            )}
            {!loading && studentGrades.length === 0 && (
              <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 py-8 dark:border-gray-700 dark:bg-gray-800/50">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No hay calificaciones asignadas para este estudiante
                </p>
              </div>
            )}
            {!loading && studentGrades.length > 0 && (
              <div className="space-y-2">
                {studentGrades.map((grade) => (
                  <div
                    key={grade.studentGradeId || grade.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700 dark:bg-gray-800/50"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{grade.pensumCourse?.name}</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          {grade.gradeType}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                          Nota: {grade.grade}/100
                        </span>
                        {grade.isApproved ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                            <MdCheckCircle className="h-3 w-3" />
                            Aprobado
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
                            No aprobado
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditClick(grade)}
                        className="rounded p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:text-blue-400"
                        title="Editar"
                        type="button"
                      >
                        <MdEdit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(grade)}
                        className="rounded p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-red-400"
                        title="Eliminar"
                        type="button"
                      >
                        <MdDelete className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Footer */}
        {!isEditing && !isDeleting && (
          <div className="flex justify-end pt-4">
            <Button onClick={onClose} variant="outline">
              Cerrar
            </Button>
          </div>
        )}
      </div>
    </GenericModal>
  );
}
