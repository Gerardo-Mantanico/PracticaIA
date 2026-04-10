"use client";
import React, { useState } from "react";

import { useModal } from "../../hooks/useModal";
import { useEspecialidad } from "../../hooks/useEspecialidad";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import TextCongreso from "../form/input/TextArea";
import { GenericTable, Column } from "../ui/table/GenericTable";
import { toast } from "react-hot-toast";
import { MdDescription, MdOutlineCategory } from "react-icons/md";

interface StudyArea {
  id: number;
  name: string;
  description?: string;
}

const columns: Column<StudyArea>[] = [
  {
    header: (
      <span className="inline-flex items-center gap-1.5">
        <MdOutlineCategory className="h-4 w-4" />
        Area de estudio
      </span>
    ),
    cell: (studyArea) => (
      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
        {studyArea.name}
      </span>
    ),
  },
  {
    header: (
      <span className="inline-flex items-center gap-1.5">
        <MdDescription className="h-4 w-4" />
        Descripción
      </span>
    ),
    accessorKey: "description",
  },
];

export default function StudyAreaTable() {
  const { isOpen, openModal, closeModal } = useModal();
  const {
    especialidades: studyAreas,
    loading,
    error,
    createEspecialidad,
    updateEspecialidad,
    deleteEspecialidad,
  } = useEspecialidad();

  const [selectedStudyArea, setSelectedStudyArea] = useState<StudyArea | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const totalPages = Math.ceil(studyAreas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentStudyAreas = studyAreas.slice(startIndex, startIndex + itemsPerPage);

  const handleAdd = () => {
    setSelectedStudyArea(null);
    setFormData({
      name: "",
      description: "",
    });
    openModal();
  };

  const handleEdit = (studyArea: StudyArea) => {
    setSelectedStudyArea(studyArea);
    setFormData({
      name: studyArea.name,
      description: studyArea.description || "",
    });
    openModal();
  };

  const handleSave = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
    };

    let success = false;
    if (selectedStudyArea) {
      success = await updateEspecialidad(selectedStudyArea.id, payload);
    } else {
      success = await createEspecialidad(payload);
    }
    
    if (success) {
      closeModal();
    }
    toast.success(`Area de estudio ${selectedStudyArea ? "actualizada" : "creada"} con exito`);
  };

  if (loading && studyAreas.length === 0) return <div>Cargando areas de estudio...</div>;
  // Solo mostrar error a pantalla completa si no hay datos
  if (error && studyAreas.length === 0) return <div>Error: {error}</div>;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
      {/* Header con botón a la derecha */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Study Areas
        </h3>
        <Button size="sm" onClick={handleAdd}>
          Agregar Area de estudio
        </Button>
      </div>

      <GenericTable
        data={currentStudyAreas}
        columns={columns}
        onEdit={handleEdit}
        onDelete={(studyArea) => deleteEspecialidad(studyArea.id)}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
      />
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-175 m-4">
        <div className="no-scrollbar relative w-full max-w-175 overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {selectedStudyArea ? "Editar area de estudio" : "Agregar area de estudio"}
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              {selectedStudyArea
                ? "Actualiza los datos del area de estudio"
                : "Completa los datos para crear el area de estudio"}
            </p>
          </div>
          <form className="flex flex-col" onSubmit={handleSave}>
            <div className="custom-scrollbar h-112.5 overflow-y-auto px-2 pb-3">
              {error && (
                <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 rounded-lg dark:bg-red-900/10 dark:text-red-400">
                  {error}
                </div>
              )}
              <div className="mt-7">
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2">
                    <Label>
                      <span className="inline-flex items-center gap-1.5">
                        <MdOutlineCategory className="h-4 w-4" />
                        Nombre del area de estudio
                      </span>
                    </Label>
                    <Input
                      type="text"
                      placeholder="Ingrese el nombre del area de estudio"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>
                      <span className="inline-flex items-center gap-1.5">
                        <MdDescription className="h-4 w-4" />
                        Descripcion
                      </span>
                    </Label>
                    <TextCongreso
                      placeholder="Escribe una descripcion del area de estudio aqui..."
                      value={formData.description}
                      onChange={(value) =>
                        setFormData({ ...formData, description: value })
                      }
                    ></TextCongreso>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal} type="button">
                Cancelar
              </Button>
              <Button size="sm" type="submit">
                {selectedStudyArea ? "Guardar cambios" : "Agregar area"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}