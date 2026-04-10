"use client";

import React, { useState } from 'react';
import Alert from '../ui/alert/Alert';
import Form from '../form/Form';

interface GenericFormProps<T> {
  initial?: Partial<T>;
  onSubmit: (data: T) => Promise<boolean>; // 👈 retorna éxito
  onSaved?: () => void;                    // 👈 cierra el modal
  onCancel?: () => void;
  title?: string;
  description?: string;
  renderFields: (args: {
    values: Partial<T>;
    setField: <K extends keyof T>(key: K, value: T[K]) => void;
    error: string | null;
    isSaving: boolean;
    onCancel?: () => void;
  }) => React.ReactNode;
}

export default function GenericForm<T extends Record<string, any>>({
  initial,
  onSubmit,
  onSaved,
  onCancel,
  title = 'Nuevo registro',
  description = 'Complete el formulario',
  renderFields,
}: GenericFormProps<T>) {

  const [values, setValues] = useState<Partial<T>>(initial ?? {});
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const setField = <K extends keyof T>(key: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const success = await onSubmit(values as T);

      if (success) {
        onSaved?.(); // 🔥 cierra el modal
      }
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative w-full rounded-3xl bg-white p-6 dark:bg-gray-900">
      <h4 className="mb-1 text-2xl font-semibold">{title}</h4>
      <p className="mb-4 text-sm text-gray-500">{description}</p>

      {error && (
        <Alert
          variant="error"
          title="Error"
          message={error}
          dismissible
        />
      )}

      <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {renderFields({ values, setField, error, isSaving, onCancel })}
      </Form>
    </div>
  );
}
