"use client";

import React, { useState } from "react";
import { MdMeetingRoom, MdTag, MdPeopleAlt, MdSchedule, MdUpdate } from "react-icons/md";
import { toast } from "react-hot-toast";
import { useModal } from "@/hooks/useModal";
import { useSalon, type Salon } from "@/hooks/useSalon";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { PencilIcon, TrashBinIcon } from "@/icons";

const formatSchedule = (value?: string) => {
  if (value === "AFTERNOON") return "Tarde";
  if (value === "NIGHT") return "Noche";
  return "Mañana";
};
const formatDateTime = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("es-GT");
};

const fieldCardClass = "flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 dark:bg-white/5";

const emptyForm = {
  name: "",
  classTypeId: 1,
  capacity: 1,
  typeOfSchedule: "MORNING" as "MORNING" | "AFTERNOON" | "NIGHT",
};

export default function SalonCards() {
  const { isOpen, openModal, closeModal } = useModal();
  const { salones, loading, error, createSalon, updateSalon, deleteSalon } = useSalon();

  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const handleAdd = () => {
    setSelectedSalon(null);
    setFormData(emptyForm);
    openModal();
  };

  const handleEdit = (salon: Salon) => {
    setSelectedSalon(salon);
    setFormData({
      name: salon.name || "",
      classTypeId: Number(salon.classTypeId ?? 1),
      capacity: Number(salon.capacity ?? 1),
      typeOfSchedule: salon.typeOfSchedule === "AFTERNOON" || salon.typeOfSchedule === "NIGHT" ? salon.typeOfSchedule : "MORNING",
    });
    openModal();
  };

  const handleDelete = async (salon: Salon) => {
    const idToUse = Number(salon.id ?? salon.classroomId ?? 0);
    const success = await deleteSalon(idToUse);
    if (success) {
      toast.success("Registro eliminado con éxito");
      return;
    }

    toast.error("No fue posible eliminar el registro");
  };

  const handleSave = async (event: React.BaseSyntheticEvent) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Completa el nombre.");
      return;
    }

    if (formData.classTypeId <= 0) {
      toast.error("Completa un tipo de salón válido.");
      return;
    }

    if (formData.capacity <= 0) {
      toast.error("La capacidad debe ser mayor a cero.");
      return;
    }

    const payload = { ...formData };

    const success = selectedSalon
      ? await updateSalon(Number(selectedSalon.id ?? selectedSalon.classroomId), payload)
      : await createSalon(payload);

    if (success) {
      toast.success(`Registro ${selectedSalon ? "actualizado" : "creado"} con éxito`);
      closeModal();
      return;
    }

    toast.error("No fue posible guardar el registro");
  };

  if (loading && salones.length === 0) {
    return <div>Cargando registros...</div>;
  }

  if (error && salones.length === 0) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 dark:border-white/5 dark:bg-white/3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Salón</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Payload enviado: name, classTypeId, capacity, typeOfSchedule.</p>
        </div>
        <Button size="sm" onClick={handleAdd}>Agregar</Button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {salones.map((salon) => (
          <article key={salon.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-white/5 dark:bg-white/3">
            <div className="mb-4 flex items-start justify-between gap-3 border-b border-gray-100 pb-4 dark:border-white/10">
              <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300">
                <MdMeetingRoom className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-base font-semibold text-gray-800 dark:text-white/90">{salon.name}</h4>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Código #{salon.id ?? salon.classroomId}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(salon)}
                  aria-label={`Editar ${salon.name}`}
                  className="rounded-lg bg-brand-50 p-2 text-brand-600 transition-colors hover:bg-brand-100"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(salon)}
                  aria-label={`Eliminar ${salon.name}`}
                  className="rounded-lg bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"
                >
                  <TrashBinIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${salon.active ? "bg-success-50 text-success-700 dark:bg-success-500/20 dark:text-success-300" : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"}`}>
                {salon.active ? "Activo" : "Inactivo"}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Información</p>
                <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 dark:text-gray-300 sm:grid-cols-2">
                  <p className={fieldCardClass}><MdTag className="h-4 w-4 text-brand-500" />Código: {salon.id ?? salon.classroomId}</p>
                  <p className={fieldCardClass}><MdTag className="h-4 w-4 text-brand-500" />Tipo: {salon.classTypeId}</p>
                  <p className={fieldCardClass}><MdPeopleAlt className="h-4 w-4 text-brand-500" />Capacidad: {salon.capacity}</p>
                  <p className={fieldCardClass}><MdSchedule className="h-4 w-4 text-brand-500" />Horario: {salon.typeOfSchedule} ({formatSchedule(salon.typeOfSchedule)})</p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Auditoría</p>
                <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <p className={fieldCardClass}><MdUpdate className="h-4 w-4 text-brand-500" />Creado: {formatDateTime(salon.createdAt)}</p>
                  <p className={fieldCardClass}><MdUpdate className="h-4 w-4 text-brand-500" />Actualizado: {formatDateTime(salon.updatedAt)}</p>
                </div>
              </div>
            </div>
          </article>
        ))}

        {salones.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600 dark:border-white/5 dark:bg-white/3 dark:text-gray-300 sm:col-span-2 xl:col-span-3">
            No hay registros todavía. Usa <span className="font-medium">Agregar</span> para crear el primero.
          </div>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-175 m-4">
        <div className="no-scrollbar relative w-full max-w-175 overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">{selectedSalon ? "Editar" : "Crear"} salón</h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">Completa los datos requeridos por el backend.</p>
          </div>

          <form className="flex flex-col" onSubmit={handleSave}>
            <div className="custom-scrollbar h-120 overflow-y-auto px-2 pb-3">
              {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/10 dark:text-red-400">{error}</div>}

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="col-span-2 lg:col-span-1">
                  <Label>Nombre</Label>
                  <Input type="text" placeholder="Ej. A-101" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Tipo de salón (classTypeId)</Label>
                  <select
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700"
                    value={formData.classTypeId}
                    onChange={(event) => setFormData({ ...formData, classTypeId: Number(event.target.value || 1) })}
                  >
                    <option value={1}>Laboratorio</option>
                    <option value={2}>Clases</option>
                  </select>
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Capacidad</Label>
                  <Input type="number" min="1" value={formData.capacity} onChange={(event) => setFormData({ ...formData, capacity: Number(event.target.value || 1) })} />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Tipo de horario</Label>
                  <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700" value={formData.typeOfSchedule} onChange={(event) => setFormData({ ...formData, typeOfSchedule: event.target.value as "MORNING" | "AFTERNOON" | "NIGHT" })}>
                    <option value="MORNING">Mañana</option>
                    <option value="AFTERNOON">Tarde</option>
                    <option value="NIGHT">Noche</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal} type="button">Cancelar</Button>
              <Button size="sm" type="submit">{selectedSalon ? "Guardar cambios" : "Crear"}</Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
