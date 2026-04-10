"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useModal } from "../../hooks/useModal";
import { useCongreso } from "../../hooks/useCongreso";
import { useInstituciones } from "../../hooks/useInstituciones"; // Importa el hook de instituciones
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import TextCongreso from "../form/input/TextArea";
import ImageUploader from "../form/input/ImageUploader";
import { GenericTable, Column } from "../ui/table/GenericTable";
import { toast } from "react-hot-toast";

interface Congreso {
  id: number;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  ubicacion: string;
  precioInscripcion: number;
  comisionPorcentaje: number;
  fotoUrl: string;
  activo: boolean;
  institucionId: number;
  createdAt: string;
  updatedAt: string;
}

interface InstitucionOption {
  id: number;
  nombre: string;
}

const formatDateTime = (value: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const columns: Column<Congreso>[] = [
  {
    header: "Congreso",
    cell: (congreso) => (
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 overflow-hidden rounded-full">
          <Image
            width={40}
            height={40}
            src={congreso.fotoUrl || "/images/user/user-17.jpg"}
            alt={congreso.titulo}
          />
        </div>
        <div>
          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
            {congreso.titulo}
          </span>
        </div>
      </div>
    ),
  },
  {
    header: "Descripción",
    accessorKey: "descripcion",
  },
  {
    header: "Fecha inicio",
    cell: (congreso) => formatDateTime(congreso.fechaInicio),
  },
  {
    header: "Fecha final",
    cell: (congreso) => formatDateTime(congreso.fechaFin),
  },
  {
    header: "Ubicación",
    accessorKey: "ubicacion",
  },
  {
    header: "Precio Inscripción",
    accessorKey: "precioInscripcion",
  },
];

export default function CongresoTable() {
  const { isOpen, openModal, closeModal } = useModal();
  const { congresos, loading, error, createCongreso, updateCongreso, deleteCongreso } = useCongreso();
  const { instituciones } = useInstituciones();

  const [selectedCongreso, setSelectedCongreso] = useState<Congreso | null>(null);
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    fechaInicio: "",
    fechaFin: "",
    ubicacion: "",
    precioInscripcion: 0,
    comisionPorcentaje: 0,
    fotoUrl: "",
    institucionId: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const totalPages = Math.ceil(congresos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCongresos = congresos.slice(startIndex, startIndex + itemsPerPage);

  const handleAdd = () => {
    setSelectedCongreso(null);
    setFormData({
      titulo: "",
      descripcion: "",
      fechaInicio: "",
      fechaFin: "",
      ubicacion: "",
      precioInscripcion: 0,
      comisionPorcentaje: 0,
      fotoUrl: "",
      institucionId: 0,
    });
    openModal();
  };

  const handleEdit = (congreso: Congreso) => {
    setSelectedCongreso(congreso);
    setFormData({
      titulo: congreso.titulo,
      descripcion: congreso.descripcion,
      fechaInicio: congreso.fechaInicio,
      fechaFin: congreso.fechaFin,
      ubicacion: congreso.ubicacion,
      precioInscripcion: congreso.precioInscripcion,
      comisionPorcentaje: congreso.comisionPorcentaje,
      fotoUrl: congreso.fotoUrl,
      institucionId: congreso.institucionId,
    });
    openModal();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = Boolean(selectedCongreso);
    let success = false;
    if (isEditing && selectedCongreso) {
      success = await updateCongreso(selectedCongreso.id, formData);
    } else {
      success = await createCongreso(formData);
    }
    if (success) {
      if (!isEditing) {
        const newTotalPages = Math.ceil((congresos.length + 1) / itemsPerPage);
        setCurrentPage(newTotalPages);
      }
      closeModal();
    }
    toast.success(`Congreso ${selectedCongreso ? "actualizado" : "creado"} con éxito`);
  };

  if (loading && congresos.length === 0) return <div>Cargando congreso...</div>;
  if (error && congresos.length === 0) return <div>Error: {error}</div>;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Congresos
        </h3>
        <Button size="sm" onClick={handleAdd}>
          Agregar Congreso
        </Button>
      </div>

      <GenericTable
        data={currentCongresos}
        columns={columns}
        onEdit={handleEdit}
        onDelete={(congreso) => deleteCongreso(congreso.id)}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
      />
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {selectedCongreso ? "Editar congreso" : "Agregar congreso"}
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              {selectedCongreso
                ? "Actualizar los detalles del congreso"
                : "Agregar un nuevo congreso"}
            </p>
          </div>
          <form className="flex flex-col" onSubmit={handleSave}>
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              {error && (
                <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 rounded-lg dark:bg-red-900/10 dark:text-red-400">
                  {error}
                </div>
              )}
              <div className="mt-7">
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Título del congreso</Label>
                    <Input
                      type="text"
                      placeholder="Ingrese el título del congreso"
                      value={formData.titulo}
                      onChange={(e) =>
                        setFormData({ ...formData, titulo: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Descripción del congreso</Label>
                    <TextCongreso
                      placeholder="Escribe una descripción del congreso aquí..."
                      value={formData.descripcion}
                      onChange={(value) =>
                        setFormData({ ...formData, descripcion: value })
                      }
                    ></TextCongreso>
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Fecha inicio</Label>
                    <Input
                      type="datetime-local"
                      value={formData.fechaInicio}
                      onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Fecha fin</Label>
                    <Input
                      type="datetime-local"
                      value={formData.fechaFin}
                      onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Ubicación</Label>
                    <Input
                      type="text"
                      placeholder="Ingrese la ubicación"
                      value={formData.ubicacion}
                      onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Precio inscripción</Label>
                    <Input
                      type="number"
                      value={formData.precioInscripcion}
                      onChange={(e) =>
                        setFormData({ ...formData, precioInscripcion: Number(e.target.value || 0) })
                      }
                    />
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Comisión %</Label>
                    <Input
                      type="number"
                      value={formData.comisionPorcentaje}
                      onChange={(e) =>
                        setFormData({ ...formData, comisionPorcentaje: Number(e.target.value || 0) })
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Foto</Label>
                    <ImageUploader
                      images={formData.fotoUrl ? [formData.fotoUrl] : []}
                      onChange={(images) =>
                        setFormData({ ...formData, fotoUrl: images[0] || "" })
                      }
                      previewHeightClassName="h-36"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Seleccionar institución</Label>
                    <select
                      className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:text-white"
                      value={formData.institucionId}
                      onChange={e =>
                        setFormData({ ...formData, institucionId: Number(e.target.value) })
                      }
                      required
                    >
                      <option value={0}>Seleccione una institución</option>
                      {instituciones.map((institucion: InstitucionOption) => (
                        <option key={institucion.id} value={institucion.id}>
                          {institucion.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal} type="button">
                Cancelar
              </Button>
              <Button size="sm" type="submit">
                {selectedCongreso ? "Guardar Cambios" : "Agregar Congreso"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}