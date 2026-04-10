"use client";
import React, { useState } from "react";

import { useModal } from "../../hooks/useModal";
import { useInstituciones } from "../../hooks/useInstituciones";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import TextCongreso from "../form/input/TextArea";
import ImageUploader from "../form/input/ImageUploader";
import { GenericTable, Column } from "../ui/table/GenericTable";
import toast from "react-hot-toast";

interface Institucion {
  id: number;
  nombre: string;
  descripcion?: string;
  direccion?: string;
  imgs?: string[];
  activo?: boolean;
}

const columns: Column<Institucion>[] = [
  {
    header: "Nombre",
    cell: (institucion) => (
      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
        {institucion.nombre}
      </span>
    ),
  },
  {
    header: "Descripción",
    accessorKey: "descripcion",
  },
  {
    header: "Dirección",
    accessorKey: "direccion",
  },
];

export default function InstitucionTable() {
  const { isOpen, openModal, closeModal } = useModal();
  const { instituciones, loading, error, createInstitucion, updateInstitucion, deleteInstitucion } = useInstituciones();
  const [selectedInstitucion, setSelectedInstitucion] = useState<Institucion | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    direccion: "",
    imgs: [] as string[],
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const totalPages = Math.ceil(instituciones.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentInstituciones = instituciones.slice(startIndex, startIndex + itemsPerPage);

  const handleAdd = () => {
    setSelectedInstitucion(null);
    setFormData({
      nombre: "",
      descripcion: "",
      direccion: "",
      imgs: [],
    });
    openModal();
  };

  const handleEdit = (institucion: Institucion) => {
    setSelectedInstitucion(institucion);
    setFormData({
      nombre: institucion.nombre,
      descripcion: institucion.descripcion || "",
      direccion: institucion.direccion || "",
      imgs: institucion.imgs || [],
    });
    openModal();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedInstitucion) {
      await updateInstitucion(selectedInstitucion.id, formData);
    } else {
      await createInstitucion(formData);
    }
    toast.success(`Institución ${selectedInstitucion ? "actualizada" : "creada"} con éxito`);
    closeModal();
  };

  if (loading && instituciones.length === 0) return <div>Cargando instituciones...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Instituciones
        </h3>
        <Button size="sm" onClick={handleAdd}>
          Agregar Institución
        </Button>
      </div>

      <GenericTable
        data={currentInstituciones}
        columns={columns}
        onEdit={handleEdit}
        onDelete={(institucion) => deleteInstitucion(institucion.id)}
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
              {selectedInstitucion ? "Editar institución" : "Agregar institución"}
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              {selectedInstitucion
                ? "Actualizar los detalles de la institución"
                : "Agregar una nueva institución"}
            </p>
          </div>
          <form className="flex flex-col" onSubmit={handleSave}>
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div className="mt-7">
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2">
                    <Label>Nombre de la institución</Label>
                    <Input
                      type="text"
                      placeholder="Ingrese el nombre de la institución"
                      value={formData.nombre}
                      onChange={(e) =>
                        setFormData({ ...formData, nombre: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Descripción</Label>
                    <TextCongreso
                      placeholder="Escribe una descripción de la institución..."
                      value={formData.descripcion}
                      onChange={(value) =>
                        setFormData({ ...formData, descripcion: value })
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Dirección</Label>
                    <Input
                      type="text"
                      placeholder="Ingrese la dirección"
                      value={formData.direccion}
                      onChange={(e) =>
                        setFormData({ ...formData, direccion: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Fotos</Label>
                    <ImageUploader
                      images={formData.imgs}
                      onChange={(images) => setFormData({ ...formData, imgs: images })}
                      multiple
                      buttonText="Seleccionar fotos"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal} type="button">
                Cancelar
              </Button>
              <Button size="sm" type="submit">
                {selectedInstitucion ? "Guardar Cambios" : "Agregar Institución"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
