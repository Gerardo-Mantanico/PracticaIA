"use client";

import React, { useEffect, useState } from "react";
import { useStudentGrade, StudentGrade, StudentGradeUpdatePayload } from "@/hooks/useStudentGrade";
import { useModal } from "@/hooks/useModal";
import GenericTable from "@/components/ui/table/GenericTable";
import GenericModal from "@/components/ui/modal/GenericModal";
import Button from "@/components/ui/button/Button";
import { MdEdit, MdDelete, MdCheckCircle } from "react-icons/md";
import Alert from "@/components/ui/alert/Alert";
import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { useAuth } from "@/context/AuthContext";

interface StudentGradesTableProps {
  studentPensumId?: number;
}

export default function StudentGradesTable({ studentPensumId }: StudentGradesTableProps) {
  const { currentUser } = useAuth();
  const {
    studentGrades,
    gradeTypes,
    loading,
    error,
    fetchStudentGrades,
    updateStudentGrade,
    deleteStudentGrade,
    fetchGradeTypes,
    fetchByStudentAndPensum,
  } = useStudentGrade();

  const { isOpen: isEditModalOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();
  const { isOpen: isDeleteModalOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();

  const [selectedGrade, setSelectedGrade] = useState<StudentGrade | null>(null);
  const [editValues, setEditValues] = useState<StudentGradeUpdatePayload>({
    isApproved: false,
    gradeType: "",
    grade: 0,
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    fetchGradeTypes();
    if (studentPensumId) {
      fetchByStudentAndPensum(currentUser?.id || 0, studentPensumId);
    } else {
      fetchStudentGrades();
    }
  }, [studentPensumId, currentUser?.id]);

  // Abrir modal de editar
  const handleEdit = (grade: StudentGrade) => {
    setSelectedGrade(grade);
    setEditValues({
      isApproved: grade.isApproved,
      gradeType: grade.gradeType,
      grade: grade.grade,
    });
    setEditError(null);
    openEditModal();
  };

  // Guardar cambios
  const handleSaveEdit = async () => {
    if (!selectedGrade) return;

    // Validar que la calificación esté entre 0 y 100
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
      closeEditModal();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Abrir modal de eliminar
  const handleDeleteClick = (grade: StudentGrade) => {
    setSelectedGrade(grade);
    openDeleteModal();
  };

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!selectedGrade) return;

    setIsSubmitting(true);
    try {
      await deleteStudentGrade(selectedGrade.studentGradeId || selectedGrade.id);
      setSuccessMessage("Calificación eliminada exitosamente");
      closeDeleteModal();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Configuración de columnas
  const columns = [
    {
      header: "Curso",
      accessorKey: "pensumCourse.name",
      cell: (row: StudentGrade) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {row.pensumCourse?.name || "N/A"}
        </span>
      ),
    },
    {
      header: "Créditos",
      accessorKey: "pensumCourse.credits",
      cell: (row: StudentGrade) => (
        <span className="text-gray-600 dark:text-gray-400">
          {row.pensumCourse?.credits || 0}
        </span>
      ),
    },
    {
      header: "Tipo de Calificación",
      accessorKey: "gradeType",
      cell: (row: StudentGrade) => (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          {row.gradeType || "N/A"}
        </span>
      ),
    },
    {
      header: "Calificación",
      accessorKey: "grade",
      cell: (row: StudentGrade) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          {row.grade}/100
        </span>
      ),
    },
    {
      header: "Estado",
      accessorKey: "isApproved",
      cell: (row: StudentGrade) => (
        <div className="flex items-center gap-2">
          {row.isApproved ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
              <MdCheckCircle className="h-4 w-4" />
              Aprobado
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
              No aprobado
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {error && <Alert variant="error" dismissible>{error}</Alert>}
      {successMessage && <Alert variant="success" dismissible>{successMessage}</Alert>}

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-brand-500"></div>
          </div>
        ) : studentGrades.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No hay calificaciones asignadas aún
            </p>
          </div>
        ) : (
          <GenericTable<StudentGrade>
            data={studentGrades}
            columns={columns}
            actions={(row) => (
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(row)}
                  className="inline-flex items-center gap-1 rounded px-2 py-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:text-blue-400"
                  title="Editar"
                >
                  <MdEdit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteClick(row)}
                  className="inline-flex items-center gap-1 rounded px-2 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-red-400"
                  title="Eliminar"
                >
                  <MdDelete className="h-4 w-4" />
                </button>
              </div>
            )}
          />
        )}
      </div>

      {/* Modal de Editar */}
      <GenericModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        title="Editar Calificación"
        className="max-w-md"
      >
        <div className="space-y-4 p-6">
          {editError && <Alert variant="error" dismissible>{editError}</Alert>}

          {selectedGrade && (
            <>
              <div>
                <Label htmlFor="course-display">Curso</Label>
                <InputField
                  id="course-display"
                  type="text"
                  value={selectedGrade.pensumCourse?.name || ""}
                  disabled
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="grade-input">Calificación (0-100)</Label>
                <InputField
                  id="grade-input"
                  type="number"
                  value={editValues.grade}
                  onChange={(e) => setEditValues({ ...editValues, grade: Number(e.target.value) })}
                  min="0"
                  max="100"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="grade-type-select">Tipo de Calificación</Label>
                <Select
                  id="grade-type-select"
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
                  id="is-approved"
                  checked={editValues.isApproved}
                  onChange={(e) => setEditValues({ ...editValues, isApproved: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="is-approved" className="m-0">
                  Marcar como aprobado
                </Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSaveEdit}
                  disabled={isSubmitting}
                  className="flex-1"
                  variant="primary"
                >
                  {isSubmitting ? "Guardando..." : "Guardar"}
                </Button>
                <Button
                  onClick={closeEditModal}
                  disabled={isSubmitting}
                  className="flex-1"
                  variant="outline"
                >
                  Cancelar
                </Button>
              </div>
            </>
          )}
        </div>
      </GenericModal>

      {/* Modal de Confirmación de Eliminación */}
      <GenericModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        title="Eliminar Calificación"
        className="max-w-md"
      >
        <div className="space-y-4 p-6">
          <p className="text-gray-600 dark:text-gray-400">
            ¿Estás seguro de que deseas eliminar la calificación de{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {selectedGrade?.pensumCourse?.name}
            </span>
            ? Esta acción no se puede deshacer.
          </p>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
              className="flex-1"
              variant="primary"
            >
              {isSubmitting ? "Eliminando..." : "Eliminar"}
            </Button>
            <Button
              onClick={closeDeleteModal}
              disabled={isSubmitting}
              className="flex-1"
              variant="outline"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </GenericModal>
    </div>
  );
}
