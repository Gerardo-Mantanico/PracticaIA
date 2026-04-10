"use client";

import React, { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useModal } from "@/hooks/useModal";
import { useCareer, type Career } from "@/hooks/useCareer";
import { GenericTable, type Column } from "@/components/ui/table/GenericTable";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

const columns: Column<Career>[] = [
  {
    header: "Código",
    cell: (item) => <span className="font-medium text-gray-800 dark:text-white/90">{item.careerCode}</span>,
  },
  {
    header: "Nombre",
    accessorKey: "name",
  },
  {
    header: "Estado",
    cell: (item) => (
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
          item.active
            ? "bg-success-50 text-success-700 dark:bg-success-500/20 dark:text-success-300"
            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
        }`}
      >
        {item.active ? "Activo" : "Inactivo"}
      </span>
    ),
  },
];

type FormData = {
  name: string;
};

const initialForm: FormData = {
  name: "",
};

export default function CareerTable() {
  const { isOpen, openModal, closeModal } = useModal();
  const { careers, loading, error, createCareer, updateCareer, deleteCareer } = useCareer();

  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [formData, setFormData] = useState<FormData>(initialForm);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const totalPages = Math.max(1, Math.ceil(careers.length / itemsPerPage));
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return careers.slice(start, start + itemsPerPage);
  }, [careers, currentPage]);

  const handleAdd = () => {
    setSelectedCareer(null);
    setFormData(initialForm);
    openModal();
  };

  const handleEdit = (career: Career) => {
    setSelectedCareer(career);
    setFormData({
      name: career.name,
    });
    openModal();
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    const payload = {
      name: formData.name.trim(),
    };

    const success = selectedCareer
      ? await updateCareer(selectedCareer.id, payload)
      : await createCareer(payload);

    if (success) {
      toast.success(`Career ${selectedCareer ? "actualizada" : "creada"} con éxito`);
      closeModal();
      return;
    }

    toast.error("No fue posible guardar la career");
  };

  if (loading && careers.length === 0) return <div>Cargando careers...</div>;
  if (error && careers.length === 0) return <div>Error: {error}</div>;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-white/5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Careers</h3>
        <Button size="sm" onClick={handleAdd}>
          Agregar career
        </Button>
      </div>

      <GenericTable
        data={currentData}
        columns={columns}
        onEdit={handleEdit}
        onDelete={(item) => deleteCareer(item.id)}
        pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }}
      />

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-160 m-4">
        <div className="no-scrollbar relative w-full max-w-160 overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {selectedCareer ? "Editar career" : "Crear career"}
          </h4>
          <form className="grid grid-cols-1 gap-4" onSubmit={handleSave}>
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/10 dark:text-red-400">
                {error}
              </div>
            )}

            <div>
              <Label>Nombre</Label>
              <Input
                value={formData.name}
                onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button size="sm" type="button" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button size="sm" type="submit">
                {selectedCareer ? "Guardar cambios" : "Crear career"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
