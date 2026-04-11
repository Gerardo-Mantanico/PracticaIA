"use client";

import React, { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { MdMenuBook, MdNumbers, MdSchool } from "react-icons/md";
import { useModal } from "@/hooks/useModal";
import { usePensum, type Pensum } from "@/hooks/usePensum";
import { useCareer } from "@/hooks/useCareer";
import { GenericTable, type Column } from "@/components/ui/table/GenericTable";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

type FormData = {
  name: string;
  creditsNeeded: number;
  careerId: string;
};

type CareerLike = {
  careerId?: number;
  id?: number;
  careerCode?: number;
  name?: string;
};

const resolveCareerId = (value: {
  careerId?: number;
  career?: CareerLike;
}) => Number(value.careerId ?? value.career?.careerId ?? value.career?.id ?? value.career?.careerCode ?? 0);

const initialForm: FormData = {
  name: "",
  creditsNeeded: 0,
  careerId: "",
};

const getCareerValue = (career: CareerLike) =>
  String(Number(career.careerId ?? career.id ?? career.careerCode ?? 0));

export default function PensumTable() {
  const { isOpen, openModal, closeModal } = useModal();
  const { pensums, loading, error, createPensum, updatePensum, deletePensum } = usePensum();
  const { careers } = useCareer();

  const [selectedPensum, setSelectedPensum] = useState<Pensum | null>(null);
  const [formData, setFormData] = useState<FormData>(initialForm);

  const careerMap = useMemo(() => {
    const map = new Map<string, string>();
    careers.forEach((career) => {
      map.set(getCareerValue(career), career.name);
    });
    return map;
  }, [careers]);

  const selectedCareerName = useMemo(() => {
    if (!formData.careerId) {
      return "";
    }

    return careerMap.get(formData.careerId) || "";
  }, [careerMap, formData.careerId]);

  const columns: Column<Pensum>[] = useMemo(
    () => [
      {
        header: (
          <span className="inline-flex items-center gap-1.5">
            <MdMenuBook className="h-4 w-4" />
            Nombre
          </span>
        ),
        accessorKey: "name",
      },
      {
        header: (
          <span className="inline-flex items-center gap-1.5">
            <MdNumbers className="h-4 w-4" />
            Creditos requeridos
          </span>
        ),
        cell: (item) => Number(item.creditsNeeded ?? 0),
      },
      {
        header: (
          <span className="inline-flex items-center gap-1.5">
            <MdSchool className="h-4 w-4" />
            Carrera
          </span>
        ),
        cell: (item) => item.careerName || careerMap.get(String(resolveCareerId(item))) || "Sin carrera",
      },
    ],
    [careerMap],
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const totalPages = Math.max(1, Math.ceil(pensums.length / itemsPerPage));
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return pensums.slice(start, start + itemsPerPage);
  }, [pensums, currentPage]);

  const handleAdd = () => {
    setSelectedPensum(null);
    setFormData(initialForm);
    openModal();
  };

  const handleEdit = (pensum: Pensum) => {
    setSelectedPensum(pensum);
    setFormData({
      name: pensum.name,
      creditsNeeded: Number(pensum.creditsNeeded ?? 0),
      careerId: String(resolveCareerId(pensum) || ""),
    });
    openModal();
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    if (formData.creditsNeeded < 0) {
      toast.error("Los creditos requeridos no pueden ser negativos");
      return;
    }

    const payload: {
      name: string;
      creditsNeeded: number;
      careerId?: number;
    } = {
      name: formData.name.trim(),
      creditsNeeded: Number(formData.creditsNeeded),
    };

    if (!selectedPensum) {
      const resolvedCareerId = Number(formData.careerId);

      if (!Number.isFinite(resolvedCareerId) || resolvedCareerId <= 0) {
        toast.error("Debes seleccionar una carrera");
        return;
      }

      payload.careerId = resolvedCareerId;
    }

    const success = selectedPensum
      ? await updatePensum(selectedPensum.id, payload)
      : await createPensum(payload);

    if (success) {
      toast.success(`Pensum ${selectedPensum ? "actualizado" : "creado"} con exito`);
      closeModal();
      return;
    }

    toast.error("No fue posible guardar el pensum");
  };

  if (loading && pensums.length === 0) return <div>Cargando pensums...</div>;
  if (error && pensums.length === 0) return <div>Error: {error}</div>;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-white/5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Pensums</h3>
        <Button size="sm" onClick={handleAdd}>
          Agregar pensum
        </Button>
      </div>

      <GenericTable
        data={currentData}
        columns={columns}
        onEdit={handleEdit}
        onDelete={(item) => deletePensum(item.id)}
        pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }}
      />

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-170 m-4">
        <div className="no-scrollbar relative w-full max-w-170 overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {selectedPensum ? "Editar pensum" : "Crear pensum"}
          </h4>

          <form className="grid grid-cols-1 gap-4" onSubmit={handleSave}>
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/10 dark:text-red-400">
                {error}
              </div>
            )}

            <div>
              <Label>
                <span className="inline-flex items-center gap-1.5">
                  <MdMenuBook className="h-4 w-4" />
                  Nombre
                </span>
              </Label>
              <Input
                value={formData.name}
                onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Ingrese el nombre del pensum"
              />
            </div>

            <div>
              <Label>
                <span className="inline-flex items-center gap-1.5">
                  <MdNumbers className="h-4 w-4" />
                  Creditos requeridos
                </span>
              </Label>
              <Input
                type="number"
                min="0"
                value={formData.creditsNeeded}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, creditsNeeded: Number(event.target.value || 0) }))
                }
              />
            </div>

            {!selectedPensum && (
              <div>
                <Label>
                  <span className="inline-flex items-center gap-1.5">
                    <MdSchool className="h-4 w-4" />
                    Carrera
                  </span>
                </Label>
                <select
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                  value={formData.careerId}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      careerId: event.target.value,
                    }))
                  }
                >
                  <option value="">Seleccione una carrera</option>
                  {careers.map((career) => (
                    <option key={getCareerValue(career)} value={getCareerValue(career)}>
                      {career.name}
                    </option>
                  ))}
                </select>
                {selectedCareerName && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Carrera seleccionada: {selectedCareerName}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button size="sm" type="button" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button size="sm" type="submit">
                {selectedPensum ? "Guardar cambios" : "Crear pensum"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
