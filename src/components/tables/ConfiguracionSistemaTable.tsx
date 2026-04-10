"use client";

import React, { useEffect, useMemo, useState } from "react";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useConfiguracionSistema } from "../../hooks/useConfiguracionSistema";
import { toast } from "react-hot-toast";
import {
  BoltIcon,
  DollarLineIcon,
  CalenderIcon,
  TimeIcon,
  CheckCircleIcon,
  PencilIcon,
} from "../../icons";

const formatDate = (value?: string) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

export default function ConfiguracionSistemaTable() {
  const { configuracion, loading, saving, error, updateComision } = useConfiguracionSistema();

  const [isEditing, setIsEditing] = useState(false);
  const [comisionInput, setComisionInput] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (configuracion) {
      setComisionInput(configuracion.comision);
    }
  }, [configuracion]);

  const hasChanges = useMemo(() => {
    if (!configuracion) return false;
    return Number(comisionInput) !== Number(configuracion.comision);
  }, [comisionInput, configuracion]);

  const handleStartEdit = () => {
    if (!configuracion) return;
    setComisionInput(configuracion.comision);
    setValidationError(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (configuracion) {
      setComisionInput(configuracion.comision);
    }
    setValidationError(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!configuracion) return;

    if (!Number.isFinite(comisionInput)) {
      setValidationError("La comisión debe ser un número válido.");
      return;
    }

    if (comisionInput < 0) {
      setValidationError("La comisión no puede ser negativa.");
      return;
    }

    const ok = await updateComision(configuracion.id, Number(comisionInput));
    if (ok) {
      toast.success("Comisión actualizada correctamente");
      setValidationError(null);
      setIsEditing(false);
    }
  };

  if (loading && !configuracion) {
    return <div>Cargando configuración del sistema...</div>;
  }

  if (!configuracion) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-5 dark:border-white/5 dark:bg-white/3">
        <p className="text-sm text-red-500 dark:text-red-400">
          {error || "No se encontró la configuración del sistema."}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-white/5">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
            <BoltIcon className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Configuración del sistema
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Parámetros globales del sistema
            </p>
          </div>
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleCancel} disabled={saving}>
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || !hasChanges}
              startIcon={<CheckCircleIcon />}
            >
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        ) : (
          <Button size="sm" onClick={handleStartEdit} startIcon={<PencilIcon />}>
            Editar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
        <div>
          <Label>Comisión</Label>
          {isEditing ? (
            <div className="mt-2 rounded-lg border border-success-200 bg-success-50 p-2 dark:border-success-800/70 dark:bg-success-500/10">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-success-600 dark:text-success-500">
                  <DollarLineIcon className="h-4 w-4" />
                </span>
                <Input
                  type="number"
                  min="0"
                  step={0.01}
                  value={comisionInput}
                  onChange={(e) => {
                    setValidationError(null);
                    const value = Number(e.target.value);
                    setComisionInput(Number.isNaN(value) ? 0 : value);
                  }}
                  disabled={saving}
                  error={Boolean(validationError)}
                  className="pl-10"
                />
              </div>
            </div>
          ) : (
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-success-200 bg-success-50 px-4 py-2.5 text-sm font-semibold text-success-700 dark:border-success-800/70 dark:bg-success-500/10 dark:text-success-400">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white text-success-600 dark:bg-gray-900 dark:text-success-500">
                <DollarLineIcon className="h-4 w-4" />
              </span>
              <span>{configuracion.comision}</span>
            </div>
          )}
        </div>

        <div>
          <Label>Creado en</Label>
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-200">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white text-gray-600 dark:bg-gray-900 dark:text-gray-300">
              <CalenderIcon className="h-4 w-4" />
            </span>
            <span>{formatDate(configuracion.createdAt)}</span>
          </div>
        </div>

        <div>
          <Label>Actualizado en</Label>
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-200">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white text-gray-600 dark:bg-gray-900 dark:text-gray-300">
              <TimeIcon className="h-4 w-4" />
            </span>
            <span>{formatDate(configuracion.updatedAt)}</span>
          </div>
        </div>
      </div>

      {(validationError || error) && (
        <div className="px-4 pb-4">
          <p className="text-sm text-red-500 dark:text-red-400">{validationError || error}</p>
        </div>
      )}
    </div>
  );
}
