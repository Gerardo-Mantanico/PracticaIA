"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { GenericModal } from "@/components/ui/modal/GenericModal";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";

export interface StudentPensumFormData {
  studentId: number;
  pensumId: number;
}

interface AddStudentPensumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StudentPensumFormData) => Promise<void>;
  students: Array<{ studentId: number; firstname: string; lastname: string }>;
  pensums: Array<{ id: number; name: string }>;
  loading?: boolean;
}

const initialForm: StudentPensumFormData = { studentId: 0, pensumId: 0 };

export function AddStudentPensumModal({
  isOpen,
  onClose,
  onSubmit,
  students,
  pensums,
  loading = false,
}: Readonly<AddStudentPensumModalProps>) {
  const [formData, setFormData] = useState<StudentPensumFormData>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setFormData(initialForm);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.studentId) {
      toast.error("Selecciona un estudiante");
      return;
    }
    if (!formData.pensumId) {
      toast.error("Selecciona un pensum");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      toast.success("Registro creado exitosamente");
      handleClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al guardar registro";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const studentOptions = students.map((s) => ({
    value: String(s.studentId),
    label: `${s.firstname} ${s.lastname} (${s.studentId})`,
  }));

  const pensumOptions = pensums.map((p) => ({
    value: String(p.id),
    label: p.name || `Pensum ${p.id}`,
  }));

  return (
    <GenericModal isOpen={isOpen} onClose={handleClose} title="Nuevo Registro Estudiante-Pensum" size="md" showCloseButton>
      <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
        Nuevo Registro Estudiante-Pensum
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="studentId">Estudiante</Label>
          <Select
            options={studentOptions}
            placeholder="Selecciona un estudiante"
            onChange={(value) => setFormData((prev) => ({ ...prev, studentId: Number(value) }))}
            value={String(formData.studentId)}
          />
        </div>

        <div>
          <Label htmlFor="pensumId">Pensum</Label>
          <Select
            options={pensumOptions}
            placeholder="Selecciona un pensum"
            onChange={(value) => setFormData((prev) => ({ ...prev, pensumId: Number(value) }))}
            value={String(formData.pensumId)}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" variant="primary" disabled={isSubmitting || loading}>
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting || loading}>
            Cancelar
          </Button>
        </div>
      </form>
    </GenericModal>
  );
}
