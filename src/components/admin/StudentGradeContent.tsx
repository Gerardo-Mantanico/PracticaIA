"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { MdVisibility } from "react-icons/md";
import { useModal } from "@/hooks/useModal";
import { useStudentGrade } from "@/hooks/useStudentGrade";
import { useStudent, type Student } from "@/hooks/useStudent";
import { AddStudentGradeModal, type StudentGradeFormData } from "@/components/admin/AddStudentGradeModal";
import StudentGradesDetailsModal from "@/components/admin/StudentGradesDetailsModal";
import { GenericTable, type Column } from "@/components/ui/table/GenericTable";
import Alert from "@/components/ui/alert/Alert";

const columns: Column<Student>[] = [
  {
    header: "Código",
    cell: (item) => <span className="font-medium text-gray-800 dark:text-white/90">{item.studentId}</span>,
  },
  {
    header: "Nombre",
    cell: (item) => (
      <div>
        <p className="font-medium text-gray-800 dark:text-white/90">{item.firstname}</p>
      </div>
    ),
  },
  {
    header: "Apellido",
    cell: (item) => (
      <div>
        <p className="font-medium text-gray-800 dark:text-white/90">{item.lastname}</p>
      </div>
    ),
  },
  {
    header: "Fecha de ingreso",
    cell: (item) => <span>{item.entryDate || "-"}</span>,
  },
];

export default function StudentGradePageContent() {
  const { isOpen, openModal, closeModal } = useModal();
  const { isOpen: isDetailsOpen, openModal: openDetailsModal, closeModal: closeDetailsModal } = useModal();
  const {
    gradeTypes,
    loading: gradeLoading,
    error: gradeError,
    createStudentGrade,
  } = useStudentGrade();
  const { students, loading: studentsLoading, error: studentError, fetchStudents } = useStudent();

  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [detailsStudentId, setDetailsStudentId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const itemsPerPage = 10;

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filteredStudents = useMemo<Student[]>(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return students || [];

    return (students || []).filter((student) => {
      const code = String(student.studentId ?? "");
      const firstname = String(student.firstname ?? "").toLowerCase();
      const lastname = String(student.lastname ?? "").toLowerCase();

      return code.includes(normalizedSearch) || firstname.includes(normalizedSearch) || lastname.includes(normalizedSearch);
    });
  }, [students, searchTerm]);

  const totalPages = Math.max(1, Math.ceil((filteredStudents.length || 0) / itemsPerPage));
  const paginatedStudents = useMemo<Student[]>(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, currentPage]);

  const handleAddForStudent = useCallback((student: Student) => {
    setSelectedStudentId(student.studentId);
    openModal();
  }, [openModal]);

  const handleViewDetails = useCallback((student: Student) => {
    setDetailsStudentId(student.studentId);
    openDetailsModal();
  }, [openDetailsModal]);

  const renderActions = useCallback((item: Student) => (
    <div className="flex gap-2">
      <button
        onClick={() => handleViewDetails(item)}
        className="rounded-md bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600 flex items-center gap-1"
        title="Ver detalles de notas"
        type="button"
      >
        <MdVisibility className="h-4 w-4" />
        Ver
      </button>
      <button
        onClick={() => handleAddForStudent(item)}
        className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600"
        title="Agregar nota"
        type="button"
      >
        Agregar nota
      </button>
    </div>
  ), [handleAddForStudent, handleViewDetails]);

  const handleSubmit = async (formData: StudentGradeFormData) => {
    try {
      await createStudentGrade(formData);
      closeModal();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al guardar calificación";
      toast.error(errorMessage);
    }
  };

  const mergedError = gradeError || studentError;
  const isLoadingData = gradeLoading || studentsLoading;

  return (
    <div className="space-y-6">
      {mergedError && (
        <Alert
          variant="error"
          title="Error"
          message={mergedError}
          dismissible
          onClose={() => {}}
        />
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Estudiantes</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {filteredStudents.length} estudiantes encontrados
          </p>
        </div>
      </div>

      <div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Buscar por código, nombre o apellido"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        {paginatedStudents.length > 0 ? (
          <GenericTable
            data={paginatedStudents}
            columns={columns}
            actions={renderActions}
            pagination={{
              currentPage,
              totalPages,
              onPageChange: setCurrentPage,
            }}
          />
        ) : (
          <div className="flex h-40 items-center justify-center bg-gray-50 dark:bg-gray-800/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isLoadingData ? "Cargando estudiantes..." : "No hay estudiantes registrados"}
            </p>
          </div>
        )}
      </div>

      <AddStudentGradeModal
        isOpen={isOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        gradeTypes={gradeTypes}
        students={students || []}
        loading={isLoadingData}
        initialStudentId={selectedStudentId ?? undefined}
      />

      <StudentGradesDetailsModal
        isOpen={isDetailsOpen}
        onClose={closeDetailsModal}
        studentId={detailsStudentId}
      />
    </div>
  );
}
