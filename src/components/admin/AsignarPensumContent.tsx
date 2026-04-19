"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useStudent } from "@/hooks/useStudent";
import { usePensum } from "@/hooks/usePensum";
import { useStudentPensum, type StudentPensum } from "@/hooks/useStudentPensum";
import { usePensumCourse, type PensumCourse } from "@/hooks/usePensumCourse";
import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";
import Select from "@/components/form/Select";
import Label from "@/components/form/Label";

// ── helpers ──────────────────────────────────────────────────────────────────

function Badge({ label, color }: { label: string; color: "green" | "blue" | "gray" }) {
  const cls = {
    green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    gray: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  }[color];
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>
  );
}

// ── sub-components ────────────────────────────────────────────────────────────

function CourseRow({ course }: { course: PensumCourse }) {
  return (
    <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-2 last:border-0 dark:border-gray-700/50">
      <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
        {course.courseName || `Curso ${course.courseCode}`}
      </span>
      <Badge label={`${course.credits} cr`} color="blue" />
      {course.isMandatory && <Badge label="Obligatorio" color="green" />}
      <span className="text-xs text-gray-400">Sem {course.semester}</span>
    </div>
  );
}

function PensumCard({
  sp,
  onDelete,
}: {
  sp: StudentPensum;
  onDelete: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { pensumCourses, loading: coursesLoading, fetchByPensumId } = usePensumCourse();

  const handleExpand = async () => {
    if (!expanded && sp.pensumId) {
      await fetchByPensumId(sp.pensumId);
    }
    setExpanded((v) => !v);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center gap-3 bg-white px-4 py-3 dark:bg-gray-900">
        <div className="flex-1">
          <p className="font-medium text-gray-800 dark:text-white">
            {sp.pensum?.name || `Pensum ${sp.pensumId}`}
          </p>
          <p className="text-xs text-gray-400">
            {sp.pensum?.creditsNeeded ? `${sp.pensum.creditsNeeded} créditos requeridos` : ""}
            {sp.createdAt ? ` · Asignado el ${sp.createdAt.slice(0, 10)}` : ""}
          </p>
        </div>

        <button
          onClick={handleExpand}
          className="rounded-lg px-2 py-1 text-xs text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20"
          type="button"
        >
          {expanded ? "Ocultar cursos" : "Ver cursos"}
        </button>

        <button
          onClick={() => onDelete(sp.studentPensumId)}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
          title="Eliminar asignación"
          type="button"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Courses */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 dark:border-gray-700/50 dark:bg-gray-800/30">
          {coursesLoading ? (
            <p className="px-4 py-3 text-sm text-gray-400">Cargando cursos...</p>
          ) : pensumCourses.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-400">No hay cursos registrados para este pensum.</p>
          ) : (
            pensumCourses.map((c) => <CourseRow key={c.id} course={c} />)
          )}
        </div>
      )}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function AsignarPensumContent() {
  const { students, fetchStudents } = useStudent();
  const { pensums, fetchPensums } = usePensum();
  const {
    studentPensums,
    loading,
    error,
    fetchAll: fetchStudentPensums,
    createStudentPensum,
    deleteStudentPensum,
  } = useStudentPensum();

  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [newPensumId, setNewPensumId] = useState(0);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchPensums();
  }, [fetchStudents, fetchPensums]);

  // Load pensums for selected student
  useEffect(() => {
    if (selectedStudentId) {
      fetchStudentPensums({ studentId: selectedStudentId });
    }
  }, [selectedStudentId, fetchStudentPensums]);

  const filteredStudents = useMemo(() => {
    const term = studentSearch.trim().toLowerCase();
    if (!term) return students ?? [];
    return (students ?? []).filter(
      (s) =>
        s.firstname.toLowerCase().includes(term) ||
        s.lastname.toLowerCase().includes(term) ||
        String(s.studentId).includes(term)
    );
  }, [students, studentSearch]);

  const selectedStudent = useMemo(
    () => (students ?? []).find((s) => s.studentId === selectedStudentId) ?? null,
    [students, selectedStudentId]
  );

  const assignedPensumIds = useMemo(
    () => new Set(studentPensums.map((sp) => sp.pensumId)),
    [studentPensums]
  );

  const availablePensumOptions = useMemo(
    () =>
      (pensums ?? [])
        .filter((p) => !assignedPensumIds.has(p.id))
        .map((p) => ({ value: String(p.id), label: p.name })),
    [pensums, assignedPensumIds]
  );

  const handleSelectStudent = (studentId: number) => {
    setSelectedStudentId(studentId);
    setNewPensumId(0);
  };

  const handleAddPensum = async () => {
    if (!selectedStudentId || !newPensumId) return;
    setAdding(true);
    try {
      await createStudentPensum({ studentId: selectedStudentId, pensumId: newPensumId });
      setNewPensumId(0);
      toast.success("Pensum asignado correctamente");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al asignar pensum");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = useCallback(
    async (studentPensumId: number) => {
      if (!confirm("¿Eliminar esta asignación de pensum?")) return;
      try {
        await deleteStudentPensum(studentPensumId);
        toast.success("Asignación eliminada");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error al eliminar");
      }
    },
    [deleteStudentPensum]
  );

  return (
    <div className="flex h-[calc(100vh-120px)] gap-0 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
      {/* ── LEFT: student list ───────────────────────────────────────────── */}
      <div className="flex w-72 flex-shrink-0 flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="border-b border-gray-100 p-4 dark:border-gray-700">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Estudiantes
          </h2>
          <input
            type="text"
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            placeholder="Buscar por nombre o carné..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredStudents.length === 0 ? (
            <p className="p-4 text-sm text-gray-400">Sin resultados</p>
          ) : (
            filteredStudents.map((s) => (
              <button
                key={s.studentId}
                onClick={() => handleSelectStudent(s.studentId)}
                type="button"
                className={`w-full px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  selectedStudentId === s.studentId
                    ? "border-l-2 border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                    : "border-l-2 border-transparent"
                }`}
              >
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {s.firstname} {s.lastname}
                </p>
                <p className="text-xs text-gray-400">Carné: {s.studentId}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── RIGHT: pensums detail ────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden bg-gray-50 dark:bg-gray-800/30">
        {!selectedStudent ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-3 text-4xl text-gray-300">👤</div>
              <p className="text-sm text-gray-400">Selecciona un estudiante para ver sus pensums</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedStudent.firstname} {selectedStudent.lastname}
                  </h2>
                  <p className="text-sm text-gray-400">Carné: {selectedStudent.studentId}</p>
                </div>
                <Badge label={`${studentPensums.length} pensum(s)`} color="gray" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {error && (
                <Alert variant="error" title="Error" message={error} dismissible onClose={() => {}} />
              )}

              {/* Assign new pensum */}
              {availablePensumOptions.length > 0 && (
                <div className="mb-6 rounded-xl border border-dashed border-brand-300 bg-white p-4 dark:border-brand-700 dark:bg-gray-900">
                  <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Asignar nuevo pensum
                  </p>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Select
                        options={availablePensumOptions}
                        placeholder="Selecciona un pensum..."
                        onChange={(v) => setNewPensumId(Number(v))}
                        value={String(newPensumId)}
                      />
                    </div>
                    <Button
                      variant="primary"
                      onClick={handleAddPensum}
                      disabled={!newPensumId || adding || loading}
                    >
                      {adding ? "Asignando..." : "Asignar"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Pensums list */}
              {loading ? (
                <p className="text-sm text-gray-400">Cargando pensums...</p>
              ) : studentPensums.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-900">
                  <p className="text-sm text-gray-400">
                    Este estudiante no tiene pensums asignados.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {studentPensums.map((sp) => (
                    <PensumCard key={sp.studentPensumId} sp={sp} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
