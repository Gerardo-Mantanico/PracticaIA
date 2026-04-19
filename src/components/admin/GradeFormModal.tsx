"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import GenericModal from "@/components/ui/modal/GenericModal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import type { GradeType, StudentGradeUpdatePayload } from "@/hooks/useStudentGrade";

export interface GradeFormValues {
  gradeType: string;
  grade: number;
  isApproved: boolean;
}

interface GradeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GradeFormValues) => Promise<void>;
  gradeTypes: GradeType[];
  courseName: string;
  initialData?: GradeFormValues;
  loading?: boolean;
}

const emptyForm: GradeFormValues = { gradeType: "", grade: 0, isApproved: false };

export function GradeFormModal({
  isOpen,
  onClose,
  onSubmit,
  gradeTypes,
  courseName,
  initialData,
  loading = false,
}: Readonly<GradeFormModalProps>) {
  const [form, setForm] = useState<GradeFormValues>(initialData ?? emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) setForm(initialData ?? emptyForm);
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.gradeType) { toast.error("Selecciona el tipo de calificación"); return; }
    if (form.grade < 0 || form.grade > 100) { toast.error("La nota debe estar entre 0 y 100"); return; }
    try {
      setIsSubmitting(true);
      await onSubmit(form);
      toast.success(initialData ? "Nota actualizada" : "Nota registrada");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar nota");
    } finally {
      setIsSubmitting(false);
    }
  };

  const gradeTypeOptions = gradeTypes.map((t) => ({ value: t.id, label: t.description }));
  const isBusy = isSubmitting || loading;

  return (
    <GenericModal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton>
      <div className="px-1">
        <h2 className="mb-1 text-base font-semibold text-gray-900 dark:text-white">
          {initialData ? "Editar nota" : "Agregar nota"}
        </h2>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400 truncate">{courseName}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="gradeType">Tipo de evaluación</Label>
            <Select
              options={gradeTypeOptions}
              placeholder="Selecciona tipo"
              onChange={(v) => setForm((p) => ({ ...p, gradeType: v }))}
              value={form.gradeType}
            />
          </div>

          <div>
            <Label htmlFor="grade">Nota (0 – 100)</Label>
            <Input
              id="grade"
              type="number"
              min="0"
              max="100"
              step={0.5}
              placeholder="Ej: 75"
              value={String(form.grade)}
              onChange={(e) => setForm((p) => ({ ...p, grade: Number(e.target.value) }))}
            />
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2.5 dark:bg-gray-800/50">
            <input
              id="isApproved"
              type="checkbox"
              checked={form.isApproved}
              onChange={(e) => setForm((p) => ({ ...p, isApproved: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 accent-brand-500"
            />
            <Label htmlFor="isApproved" className="mb-0! cursor-pointer select-none">
              Aprobado
            </Label>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" variant="primary" disabled={isBusy} className="flex-1">
              {isSubmitting ? "Guardando..." : initialData ? "Actualizar" : "Guardar"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={isBusy}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </GenericModal>
  );
}
