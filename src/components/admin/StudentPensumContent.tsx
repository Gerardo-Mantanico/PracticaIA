"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useModal } from "@/hooks/useModal";
import { useStudentPensum, type StudentPensum } from "@/hooks/useStudentPensum";
import { useStudent } from "@/hooks/useStudent";
import { usePensum } from "@/hooks/usePensum";
import { AddStudentPensumModal, type StudentPensumFormData } from "@/components/admin/AddStudentPensumModal";
import { GenericTable, type Column } from "@/components/ui/table/GenericTable";
import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";

const ITEMS_PER_PAGE = 10;

const columns: Column<StudentPensum>[] = [
  {
    header: "ID",
    cell: (item) => (
      <span className="font-medium text-gray-800 dark:text-white/90">{item.studentPensumId}</span>
    ),
  },
  {
    header: "Estudiante",
    cell: (item) => (
      <span className="text-gray-700 dark:text-gray-300">
        {item.student?.firstname || item.studentId
          ? `${item.student?.firstname ?? ""} ${item.student?.lastname ?? ""}`.trim() || String(item.studentId)
          : String(item.studentId)}
      </span>
    ),
  },
  {
    header: "ID Estudiante",
    cell: (item) => <span>{item.studentId}</span>,
  },
  {
    header: "Pensum",
    cell: (item) => (
      <span>{item.pensum?.name || `Pensum ${item.pensumId}`}</span>
    ),
  },
  {
    header: "Créditos requeridos",
    cell: (item) => <span>{item.pensum?.creditsNeeded ?? "-"}</span>,
  },
  {
    header: "Fecha de registro",
    cell: (item) => <span>{item.createdAt ? item.createdAt.slice(0, 10) : "-"}</span>,
  },
];

export default function StudentPensumContent() {
  const { isOpen, openModal, closeModal } = useModal();
  const {
    studentPensums,
    loading,
    error,
    fetchAll,
    fetchById,
    createStudentPensum,
    deleteStudentPensum,
  } = useStudentPensum();
  const { students, fetchStudents } = useStudent();
  const { pensums, fetchPensums } = usePensum();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchId, setSearchId] = useState("");
  const [foundById, setFoundById] = useState<StudentPensum | null>(null);
  const [idSearchLoading, setIdSearchLoading] = useState(false);
  const [idSearchError, setIdSearchError] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
    fetchStudents();
    fetchPensums();
  }, [fetchAll, fetchStudents, fetchPensums]);

  const filtered = useMemo<StudentPensum[]>(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return studentPensums;

    return studentPensums.filter((item) => {
      const studentName = `${item.student?.firstname ?? ""} ${item.student?.lastname ?? ""}`.toLowerCase();
      const pensumName = (item.pensum?.name ?? "").toLowerCase();
      const studentId = String(item.studentId);
      const spId = String(item.studentPensumId);

      return (
        studentName.includes(term) ||
        pensumName.includes(term) ||
        studentId.includes(term) ||
        spId.includes(term)
      );
    });
  }, [studentPensums, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = useMemo<StudentPensum[]>(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const handleDelete = useCallback(
    async (item: StudentPensum) => {
      if (!confirm(`¿Eliminar el registro #${item.studentPensumId}?`)) return;
      try {
        await deleteStudentPensum(item.studentPensumId);
        toast.success("Registro eliminado");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error al eliminar";
        toast.error(msg);
      }
    },
    [deleteStudentPensum]
  );

  const handleSearchById = useCallback(async () => {
    const id = Number(searchId);
    if (!id) {
      toast.error("Ingresa un ID válido");
      return;
    }
    setIdSearchLoading(true);
    setIdSearchError(null);
    setFoundById(null);
    try {
      const result = await fetchById(id);
      if (result) {
        setFoundById(result);
      } else {
        setIdSearchError("No se encontró ningún registro con ese ID");
      }
    } catch {
      setIdSearchError("No se encontró ningún registro con ese ID");
    } finally {
      setIdSearchLoading(false);
    }
  }, [searchId, fetchById]);

  const handleSubmit = async (formData: StudentPensumFormData) => {
    await createStudentPensum(formData);
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="error" title="Error" message={error} dismissible onClose={() => {}} />
      )}

      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Estudiante-Pensum</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {filtered.length} registros encontrados
          </p>
        </div>
        <Button variant="primary" onClick={openModal}>
          + Nuevo registro
        </Button>
      </div>

      {/* Buscar por ID */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Buscar por ID</p>
        <div className="flex gap-2">
          <input
            type="number"
            value={searchId}
            onChange={(e) => {
              setSearchId(e.target.value);
              setFoundById(null);
              setIdSearchError(null);
            }}
            placeholder="Ingresa el ID del registro"
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
          />
          <Button variant="outline" onClick={handleSearchById} disabled={idSearchLoading}>
            {idSearchLoading ? "Buscando..." : "Buscar"}
          </Button>
        </div>

        {idSearchError && (
          <p className="mt-2 text-sm text-red-500">{idSearchError}</p>
        )}

        {foundById && (
          <div className="mt-3 rounded-md border border-green-200 bg-green-50 p-3 text-sm dark:border-green-800 dark:bg-green-900/20">
            <p className="font-medium text-green-800 dark:text-green-300">Registro encontrado</p>
            <p className="text-gray-700 dark:text-gray-300">
              ID: <strong>{foundById.studentPensumId}</strong> — Estudiante:{" "}
              <strong>{`${foundById.student?.firstname ?? ""} ${foundById.student?.lastname ?? ""}`.trim() || foundById.studentId}</strong> —
              Pensum: <strong>{foundById.pensum?.name || `ID ${foundById.pensumId}`}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Buscador general */}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
        placeholder="Buscar por nombre, pensum o ID..."
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
      />

      {/* Tabla */}
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        {paginated.length > 0 ? (
          <GenericTable
            data={paginated}
            columns={columns}
            onDelete={handleDelete}
            pagination={{
              currentPage,
              totalPages,
              onPageChange: setCurrentPage,
            }}
          />
        ) : (
          <div className="flex h-40 items-center justify-center bg-gray-50 dark:bg-gray-800/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {loading ? "Cargando registros..." : "No hay registros encontrados"}
            </p>
          </div>
        )}
      </div>

      <AddStudentPensumModal
        isOpen={isOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        students={students ?? []}
        pensums={(pensums ?? []).map((p) => ({ id: p.id, name: p.name }))}
        loading={loading}
      />
    </div>
  );
}
