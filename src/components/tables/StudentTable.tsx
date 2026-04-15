"use client";

import React, { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useModal } from "@/hooks/useModal";
import { useStudent, type Student } from "@/hooks/useStudent";
import { GenericTable, type Column } from "@/components/ui/table/GenericTable";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

type FormData = {
  studentId: number;
  entryDate: string;
  firstname: string;
  lastname: string;
};

const initialForm: FormData = {
  studentId: 0,
  entryDate: "",
  firstname: "",
  lastname: "",
};

const columns: Column<Student>[] = [
  {
    header: "ID",
    cell: (item) => <span className="font-medium text-gray-800 dark:text-white/90">{item.studentId ?? item.id}</span>,
  },
  {
    header: "Nombre",
    cell: (item) => `${item.firstname} ${item.lastname}`.trim(),
  },
  {
    header: "Fecha de ingreso",
    accessorKey: "entryDate",
  },
];

export default function StudentTable() {
  const { isOpen, openModal, closeModal } = useModal();
  const { students, loading, error, createStudent, updateStudent, deleteStudent } = useStudent();

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<FormData>(initialForm);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const totalPages = Math.max(1, Math.ceil(students.length / itemsPerPage));
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return students.slice(start, start + itemsPerPage);
  }, [students, currentPage]);

  const handleAdd = () => {
    setSelectedStudent(null);
    setFormData(initialForm);
    openModal();
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      studentId: Number(student.studentId ?? student.id ?? 0),
      entryDate: String(student.entryDate ?? "").slice(0, 10),
      firstname: student.firstname || "",
      lastname: student.lastname || "",
    });
    openModal();
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (formData.studentId < 0) {
      toast.error("El ID del estudiante debe ser mayor o igual a 0");
      return;
    }

    if (!formData.entryDate) {
      toast.error("La fecha de ingreso es obligatoria");
      return;
    }

    if (!formData.firstname.trim() || !formData.lastname.trim()) {
      toast.error("Nombre y apellido son obligatorios");
      return;
    }

    const payload = {
      studentId: Number(formData.studentId),
      entryDate: formData.entryDate,
      firstname: formData.firstname.trim(),
      lastname: formData.lastname.trim(),
    };

    const success = selectedStudent
      ? await updateStudent(Number(selectedStudent.studentId ?? selectedStudent.id), payload)
      : await createStudent(payload);

    if (success) {
      toast.success(`Estudiante ${selectedStudent ? "actualizado" : "creado"} con éxito`);
      closeModal();
      return;
    }

    toast.error("No fue posible guardar el estudiante");
  };

  if (loading && students.length === 0) return <div>Cargando estudiantes...</div>;
  if (error && students.length === 0) return <div>Error: {error}</div>;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-white/5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Gestión de estudiantes</h3>
        <Button size="sm" onClick={handleAdd}>Agregar estudiante</Button>
      </div>

      <GenericTable
        data={currentData}
        columns={columns}
        onEdit={handleEdit}
        onDelete={(item) => deleteStudent(Number(item.studentId ?? item.id))}
        pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }}
      />

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-160 m-4">
        <div className="no-scrollbar relative w-full max-w-160 overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {selectedStudent ? "Editar estudiante" : "Crear estudiante"}
          </h4>

          <form className="grid grid-cols-1 gap-4 lg:grid-cols-2" onSubmit={handleSave}>
            {error && (
              <div className="col-span-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/10 dark:text-red-400">
                {error}
              </div>
            )}

            <div>
              <Label>ID de estudiante</Label>
              <Input
                type="number"
                min="0"
                value={formData.studentId}
                onChange={(event) => setFormData((prev) => ({ ...prev, studentId: Number(event.target.value || 0) }))}
              />
            </div>

            <div>
              <Label>Fecha de ingreso</Label>
              <Input
                type="date"
                value={formData.entryDate}
                onChange={(event) => setFormData((prev) => ({ ...prev, entryDate: event.target.value }))}
              />
            </div>

            <div>
              <Label>Nombre</Label>
              <Input
                value={formData.firstname}
                onChange={(event) => setFormData((prev) => ({ ...prev, firstname: event.target.value }))}
              />
            </div>

            <div>
              <Label>Apellido</Label>
              <Input
                value={formData.lastname}
                onChange={(event) => setFormData((prev) => ({ ...prev, lastname: event.target.value }))}
              />
            </div>

            <div className="col-span-2 flex justify-end gap-3">
              <Button size="sm" type="button" variant="outline" onClick={closeModal}>Cancelar</Button>
              <Button size="sm" type="submit">{selectedStudent ? "Guardar cambios" : "Crear estudiante"}</Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}