"use client";

import React, { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useModal } from "@/hooks/useModal";
import { useActividad, type Actividad } from "@/hooks/useActividad";
import { useCongreso } from "@/hooks/useCongreso";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextCongreso from "@/components/form/input/TextArea";
import { GenericTable, type Column } from "@/components/ui/table/GenericTable";

const formatDateTime = (value: string) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("es-GT", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

const toDateTimeLocalValue = (value: string) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const offset = date.getTimezoneOffset();
  const adjusted = new Date(date.getTime() - offset * 60000);
  return adjusted.toISOString().slice(0, 16);
};

const columns: Column<Actividad>[] = [
  {
    header: "Actividad",
    cell: (actividad) => (
      <div>
        <p className="font-medium text-gray-800 dark:text-white/90">{actividad.nombre}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{actividad.tipo}</p>
      </div>
    ),
  },
  {
    header: "Congreso ID",
    accessorKey: "congresoId",
  },
  {
    header: "Salón ID",
    accessorKey: "salonId",
  },
  {
    header: "Horario",
    cell: (actividad) => (
      <div className="text-xs text-gray-600 dark:text-gray-300">
        <p>Inicio: {formatDateTime(actividad.horaInicio)}</p>
        <p>Fin: {formatDateTime(actividad.horaFin)}</p>
      </div>
    ),
  },
  {
    header: "Capacidad",
    accessorKey: "capacidadMaxima",
  },
];

export default function ActividadTable() {
  const { isOpen, openModal, closeModal } = useModal();
  const { congresos } = useCongreso();
  const {
    actividades,
    loading,
    error,
    createActividad,
    updateActividad,
    deleteActividad,
  } = useActividad();

  const [selectedActividad, setSelectedActividad] = useState<Actividad | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    tipo: "",
    horaInicio: "",
    horaFin: "",
    capacidadMaxima: 0,
    salonId: 0,
    congresoId: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const totalPages = Math.max(1, Math.ceil(actividades.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentActividades = useMemo(
    () => actividades.slice(startIndex, startIndex + itemsPerPage),
    [actividades, startIndex]
  );

  const handleAdd = () => {
    setSelectedActividad(null);
    setFormData({
      nombre: "",
      descripcion: "",
      tipo: "",
      horaInicio: "",
      horaFin: "",
      capacidadMaxima: 0,
      salonId: 0,
      congresoId: 0,
    });
    openModal();
  };

  const handleEdit = (actividad: Actividad) => {
    setSelectedActividad(actividad);
    setFormData({
      nombre: actividad.nombre,
      descripcion: actividad.descripcion,
      tipo: actividad.tipo,
      horaInicio: toDateTimeLocalValue(actividad.horaInicio),
      horaFin: toDateTimeLocalValue(actividad.horaFin),
      capacidadMaxima: actividad.capacidadMaxima,
      salonId: actividad.salonId ?? 0,
      congresoId: actividad.congresoId,
    });
    openModal();
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.nombre.trim() || !formData.tipo.trim()) {
      toast.error("Completa nombre y tipo de actividad.");
      return;
    }

    if (!formData.horaInicio || !formData.horaFin) {
      toast.error("Completa hora de inicio y hora de fin.");
      return;
    }

    if (!formData.congresoId || formData.congresoId <= 0) {
      toast.error("Debes seleccionar un congreso.");
      return;
    }

    let success = false;

    if (selectedActividad) {
      success = await updateActividad(selectedActividad.id, formData);
    } else {
      success = await createActividad(formData);
    }

    if (success) {
      toast.success(`Actividad ${selectedActividad ? "actualizada" : "creada"} con éxito`);
      closeModal();
      return;
    }

    toast.error("No fue posible guardar la actividad.");
  };

  if (loading && actividades.length === 0) {
    return <div>Cargando actividades...</div>;
  }

  if (error && actividades.length === 0) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-white/5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Actividades de congresos</h3>
        <Button size="sm" onClick={handleAdd}>
          Agregar actividad
        </Button>
      </div>

      {actividades.length === 0 ? (
        <div className="p-5">
          <article className="rounded-2xl border border-dashed border-gray-300 bg-white p-5 dark:border-white/10 dark:bg-white/3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">Actividad de ejemplo</h4>
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                Ejemplo
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Nombre:</span> Conferencia de Innovación Clínica
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Tipo:</span> Conferencia
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Horario:</span> 08/03/2026, 09:00 - 08/03/2026, 10:30
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Capacidad máxima:</span> 150
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Salón ID:</span> 1 &nbsp;|&nbsp; <span className="font-medium">Congreso ID:</span> 1
            </p>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              No hay actividades registradas. Usa <span className="font-medium">Agregar actividad</span> para crear la primera.
            </p>
          </article>
        </div>
      ) : (
        <GenericTable
          data={currentActividades}
          columns={columns}
          onEdit={handleEdit}
          onDelete={(actividad) => deleteActividad(actividad.id)}
          pagination={{
            currentPage,
            totalPages,
            onPageChange: setCurrentPage,
          }}
        />
      )}

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-190 m-4">
        <div className="no-scrollbar relative w-full max-w-190 overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {selectedActividad ? "Editar actividad" : "Agregar actividad"}
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Administra las actividades vinculadas a un congreso.
            </p>
          </div>

          <form className="flex flex-col" onSubmit={handleSave}>
            <div className="custom-scrollbar h-130 overflow-y-auto px-2 pb-3">
              {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/10 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="col-span-2 lg:col-span-1">
                  <Label>Nombre</Label>
                  <Input
                    type="text"
                    placeholder="Nombre de la actividad"
                    value={formData.nombre}
                    onChange={(event) => setFormData({ ...formData, nombre: event.target.value })}
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Tipo</Label>
                  <Input
                    type="text"
                    placeholder="Conferencia, Taller, Panel..."
                    value={formData.tipo}
                    onChange={(event) => setFormData({ ...formData, tipo: event.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <Label>Descripción</Label>
                  <TextCongreso
                    placeholder="Descripción de la actividad"
                    value={formData.descripcion}
                    onChange={(value) => setFormData({ ...formData, descripcion: value })}
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Hora de inicio</Label>
                  <Input
                    type="datetime-local"
                    value={formData.horaInicio}
                    onChange={(event) => setFormData({ ...formData, horaInicio: event.target.value })}
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Hora de fin</Label>
                  <Input
                    type="datetime-local"
                    value={formData.horaFin}
                    onChange={(event) => setFormData({ ...formData, horaFin: event.target.value })}
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Capacidad máxima</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.capacidadMaxima}
                    onChange={(event) =>
                      setFormData({ ...formData, capacidadMaxima: Number(event.target.value || 0) })
                    }
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Salón ID</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.salonId}
                    onChange={(event) => setFormData({ ...formData, salonId: Number(event.target.value || 0) })}
                  />
                </div>

                <div className="col-span-2">
                  <Label>Congreso</Label>
                  <select
                    className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                    value={formData.congresoId}
                    onChange={(event) => setFormData({ ...formData, congresoId: Number(event.target.value || 0) })}
                  >
                    <option value={0}>Selecciona un congreso</option>
                    {congresos.map((congreso) => (
                      <option key={congreso.id} value={congreso.id}>
                        {congreso.titulo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal} type="button">
                Cancelar
              </Button>
              <Button size="sm" type="submit">
                {selectedActividad ? "Guardar cambios" : "Agregar actividad"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
