"use client";

import React, { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useModal } from "@/hooks/useModal";
import { useDocente, type Docente } from "@/hooks/useDocente";
import { GenericTable, type Column } from "@/components/ui/table/GenericTable";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

type FormData = {
  professorCode: number;
  firstName: string;
  secondName: string;
  lastName: string;
  secondLastName: string;
  entryTime: string;
  exitTime: string;
};

const initialForm: FormData = {
  professorCode: 0,
  firstName: "",
  secondName: "",
  lastName: "",
  secondLastName: "",
  entryTime: "07:00",
  exitTime: "15:00",
};

const fullName = (item: Docente) =>
  [item.firstName, item.secondName, item.lastName, item.secondLastName]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(" ");

const formatTime = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit", hour12: false });
};

const columns: Column<Docente>[] = [
  {
    header: "Docente",
    cell: (item) => (
      <div>
        <p className="font-medium text-gray-800 dark:text-white/90">{fullName(item)}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Código: {item.professorCode ?? item.id}</p>
      </div>
    ),
  },
  {
    header: "Horario",
    cell: (item) => `${formatTime(item.entryTime)} - ${formatTime(item.exitTime)}`,
  },
];

export default function DocenteTable() {
  const { isOpen, openModal, closeModal } = useModal();
  const { docentes, loading, error, createDocente, updateDocente, deleteDocente } = useDocente();

  const [selectedDocente, setSelectedDocente] = useState<Docente | null>(null);
  const [formData, setFormData] = useState<FormData>(initialForm);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const totalPages = Math.max(1, Math.ceil(docentes.length / itemsPerPage));
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return docentes.slice(start, start + itemsPerPage);
  }, [docentes, currentPage]);

  const handleAdd = () => {
    setSelectedDocente(null);
    setFormData(initialForm);
    openModal();
  };

  const extractHHMM = (value?: string, fallback = "07:00") => {
    if (!value) return fallback;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value).slice(0, 5) || fallback;
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const handleEdit = (docente: Docente) => {
    setSelectedDocente(docente);
    setFormData({
      professorCode: Number(docente.professorCode ?? docente.id ?? 0),
      firstName: docente.firstName || "",
      secondName: docente.secondName || "",
      lastName: docente.lastName || "",
      secondLastName: docente.secondLastName || "",
      entryTime: extractHHMM(docente.entryTime, "07:00"),
      exitTime: extractHHMM(docente.exitTime, "15:00"),
    });
    openModal();
  };

  const handleSave = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    if (formData.professorCode <= 0) {
      toast.error("El código del docente es obligatorio");
      return;
    }

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error("Primer nombre y primer apellido son obligatorios");
      return;
    }

    const payload = {
      professorCode: Number(formData.professorCode),
      firstName: formData.firstName.trim(),
      secondName: formData.secondName.trim(),
      lastName: formData.lastName.trim(),
      secondLastName: formData.secondLastName.trim(),
      entryTime: formData.entryTime,
      exitTime: formData.exitTime,
    };

    const success = selectedDocente
      ? await updateDocente(Number(selectedDocente.professorCode ?? selectedDocente.id), payload)
      : await createDocente(payload);

    if (success) {
      toast.success(`Docente ${selectedDocente ? "actualizado" : "creado"} con éxito`);
      closeModal();
    } else {
      toast.error("No fue posible guardar el docente");
    }
  };

  if (loading && docentes.length === 0) return <div>Cargando docentes...</div>;
  if (error && docentes.length === 0) return <div>Error: {error}</div>;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-white/5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Gestión de docentes</h3>
        <Button size="sm" onClick={handleAdd}>Agregar docente</Button>
      </div>

      <GenericTable
        data={currentData}
        columns={columns}
        onEdit={handleEdit}
        onDelete={(item) => deleteDocente(Number(item.professorCode ?? item.id))}
        pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }}
      />

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-180 m-4">
        <div className="no-scrollbar relative w-full max-w-180 overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {selectedDocente ? "Editar docente" : "Crear docente"}
          </h4>

          <form
            className="grid grid-cols-1 gap-4 lg:grid-cols-2"
            onSubmit={(event) => {
              void handleSave(event);
            }}
          >
            {error && (
              <div className="col-span-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/10 dark:text-red-400">
                {error}
              </div>
            )}

            <div>
              <Label>Código de docente</Label>
              <Input
                type="number"
                min="1"
                value={formData.professorCode}
                onChange={(event) => setFormData((prev) => ({ ...prev, professorCode: Number(event.target.value || 0) }))}
              />
            </div>
            <div>
              <Label>Primer nombre</Label>
              <Input value={formData.firstName} onChange={(event) => setFormData((prev) => ({ ...prev, firstName: event.target.value }))} />
            </div>

            <div>
              <Label>Segundo nombre</Label>
              <Input value={formData.secondName} onChange={(event) => setFormData((prev) => ({ ...prev, secondName: event.target.value }))} />
            </div>
            <div>
              <Label>Primer apellido</Label>
              <Input value={formData.lastName} onChange={(event) => setFormData((prev) => ({ ...prev, lastName: event.target.value }))} />
            </div>

            <div>
              <Label>Segundo apellido</Label>
              <Input value={formData.secondLastName} onChange={(event) => setFormData((prev) => ({ ...prev, secondLastName: event.target.value }))} />
            </div>
            <div>
              <Label>Hora de entrada</Label>
              <Input type="time" value={formData.entryTime} onChange={(event) => setFormData((prev) => ({ ...prev, entryTime: event.target.value }))} />
            </div>

            <div>
              <Label>Hora de salida</Label>
              <Input type="time" value={formData.exitTime} onChange={(event) => setFormData((prev) => ({ ...prev, exitTime: event.target.value }))} />
            </div>

            <div className="col-span-2 flex justify-end gap-3">
              <Button size="sm" type="button" variant="outline" onClick={closeModal}>Cancelar</Button>
              <Button size="sm" type="submit">{selectedDocente ? "Guardar cambios" : "Crear docente"}</Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
