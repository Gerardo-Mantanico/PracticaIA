"use client";

import React, { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useModal } from "@/hooks/useModal";
import { useCurso, type Curso } from "@/hooks/useCurso";
import { GenericTable, type Column } from "@/components/ui/table/GenericTable";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { MdAbc, MdCheckCircle, MdNumbers, MdSchool } from "react-icons/md";

type FormData = {
  courseCode: number;
  name: string;
  defaultCredits: number;
};

const initialForm: FormData = {
  courseCode: 0,
  name: "",
  defaultCredits: 1,
};

const columns: Column<Curso>[] = [
  {
    header: (
      <span className="inline-flex items-center gap-1.5">
        <MdAbc className="h-4 w-4" />
        Curso
      </span>
    ),
    cell: (item) => (
      <div>
        <p className="font-medium text-gray-800 dark:text-white/90">{item.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Código: {item.courseCode ?? item.id}</p>
      </div>
    ),
  },
  {
    header: (
      <span className="inline-flex items-center gap-1.5">
        <MdSchool className="h-4 w-4" />
        Créditos
      </span>
    ),
    cell: (item) => Number(item.defaultCredits ?? item.numberOfPeriods ?? 1),
  },
  {
    header: (
      <span className="inline-flex items-center gap-1.5">
        <MdCheckCircle className="h-4 w-4" />
        Estado
      </span>
    ),
    cell: (item) => (
      <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
        {item.active ? "Activo" : "Inactivo"}
      </span>
    ),
  },
];

export default function CursoTable() {
  const { isOpen, openModal, closeModal } = useModal();
  const { cursos, loading, error, createCurso, updateCurso, deleteCurso } = useCurso();

  const [selectedCurso, setSelectedCurso] = useState<Curso | null>(null);
  const [formData, setFormData] = useState<FormData>(initialForm);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const totalPages = Math.max(1, Math.ceil(cursos.length / itemsPerPage));
  const currentCursos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return cursos.slice(start, start + itemsPerPage);
  }, [cursos, currentPage]);

  const handleAdd = () => {
    setSelectedCurso(null);
    setFormData(initialForm);
    openModal();
  };

  const handleEdit = (curso: Curso) => {
    setSelectedCurso(curso);
    setFormData({
      courseCode: Number(curso.courseCode ?? curso.id ?? 0),
      name: curso.name,
      defaultCredits: Number(curso.defaultCredits ?? curso.numberOfPeriods ?? 1),
    });
    openModal();
  };

  const handleSave = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    if (formData.courseCode <= 0) {
      toast.error("El código del curso debe ser mayor a cero");
      return;
    }

    if (formData.defaultCredits <= 0) {
      toast.error("Los créditos por defecto deben ser mayores a cero");
      return;
    }

    const payload = {
      courseCode: Number(formData.courseCode),
      name: formData.name.trim(),
      defaultCredits: Number(formData.defaultCredits),
    };

    const success = selectedCurso
      ? await updateCurso(Number(selectedCurso.courseCode ?? selectedCurso.id), payload)
      : await createCurso(payload);

    if (success) {
      toast.success(`Curso ${selectedCurso ? "actualizado" : "creado"} con éxito`);
      closeModal();
    } else {
      toast.error("No fue posible guardar el curso");
    }
  };

  if (loading && cursos.length === 0) return <div>Cargando cursos...</div>;
  if (error && cursos.length === 0) return <div>Error: {error}</div>;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-white/5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Gestión de cursos</h3>
        <Button size="sm" onClick={handleAdd}>
          Agregar curso
        </Button>
      </div>

      <GenericTable
        data={currentCursos}
        columns={columns}
        onEdit={handleEdit}
        onDelete={(item) => deleteCurso(Number(item.courseCode ?? item.id))}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
      />

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-190 m-4">
        <div className="no-scrollbar relative w-full max-w-190 overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {selectedCurso ? "Editar curso" : "Crear curso"}
          </h4>

          <form onSubmit={handleSave} className="flex flex-col gap-5">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/10 dark:text-red-400">{error}</div>
            )}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <Label>
                  <span className="inline-flex items-center gap-1.5">
                    <MdAbc className="h-4 w-4" />
                    Nombre
                  </span>
                </Label>
                <Input value={formData.name} onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))} />
              </div>
              <div>
                <Label>
                  <span className="inline-flex items-center gap-1.5">
                    <MdNumbers className="h-4 w-4" />
                    Código del curso
                  </span>
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.courseCode}
                  onChange={(event) => setFormData((prev) => ({ ...prev, courseCode: Number(event.target.value || 0) }))}
                />
              </div>

              <div>
                <Label>
                  <span className="inline-flex items-center gap-1.5">
                    <MdSchool className="h-4 w-4" />
                    Créditos por defecto
                  </span>
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.defaultCredits}
                  onChange={(event) => setFormData((prev) => ({ ...prev, defaultCredits: Number(event.target.value || 1) }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button size="sm" variant="outline" type="button" onClick={closeModal}>
                Cancelar
              </Button>
              <Button size="sm" type="submit">
                {selectedCurso ? "Guardar cambios" : "Crear curso"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
