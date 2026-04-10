"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { GenericTable, type Column } from "@/components/ui/table/GenericTable";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { Modal } from "@/components/ui/modal";
import { useScheduleGeneration } from "@/hooks/useScheduleGeneration";
import type {
  GeneratedScheduleItem,
  GeneratedScheduleListItem,
  GeneratedScheduleWarning,
} from "@/interfaces/ScheduleGeneration";

const dayLabels = ["CLASS", "LAB1 (Martes)", "LAB2 (Jueves)"];

const sessionBucket = (value?: string) => {
  const normalized = String(value || "").toUpperCase();
  if (normalized.includes("LAB2")) return "LAB2";
  if (normalized.includes("LAB")) return "LAB1";
  return "CLASS";
};

const expectedDayByBucket: Record<string, number> = {
  CLASS: 0,
  LAB1: 1,
  LAB2: 2,
};

const columns: Column<GeneratedScheduleListItem>[] = [
  { header: "ID generado", accessorKey: "generatedScheduleId" },
  { header: "Config ID", accessorKey: "scheduleConfigId" },
  { header: "Fitness", accessorKey: "fitness" },
  { header: "Hard penalty", accessorKey: "hardPenalty" },
  { header: "Soft penalty", accessorKey: "softPenalty" },
];

export default function HorarioTable() {
  const {
    loading,
    saving,
    error,
    generatedSchedules,
    generatedSchedule,
    fetchGeneratedSchedules,
    fetchGeneratedSchedule,
    updateGeneratedItem,
  } = useScheduleGeneration();

  const [generatedScheduleIdInput, setGeneratedScheduleIdInput] = useState("");
  const [lastWarnings, setLastWarnings] = useState<GeneratedScheduleWarning[]>([]);
  const [editItem, setEditItem] = useState<GeneratedScheduleItem | null>(null);
  const [editDayIndex, setEditDayIndex] = useState(0);
  const [editStartSlot, setEditStartSlot] = useState(0);
  const [editConfigClassroomId, setEditConfigClassroomId] = useState<string>("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const effectiveWarnings = useMemo(() => {
    const fetchedWarnings = generatedSchedule?.warnings || [];
    return fetchedWarnings.length > 0 ? fetchedWarnings : lastWarnings;
  }, [generatedSchedule?.warnings, lastWarnings]);

  useEffect(() => {
    fetchGeneratedSchedules();
  }, [fetchGeneratedSchedules]);

  const scheduleGridColumns = useMemo(() => {
    if (!generatedSchedule) {
      return [] as { key: string; label: string; bucket: string; classroomId: string }[];
    }

    const classroomSet = new Map<string, string>();
    generatedSchedule.items.forEach((item) => {
      if (item.configClassroomId) {
        classroomSet.set(String(item.configClassroomId), item.classroomName || String(item.configClassroomId));
      }
    });

    const columnsToRender: { key: string; label: string; bucket: string; classroomId: string }[] = [];
    classroomSet.forEach((classroomName, configClassroomId) => {
      ["CLASS", "LAB1", "LAB2"].forEach((bucket, index) => {
        columnsToRender.push({
          key: `${bucket}:${configClassroomId}`,
          label: `${dayLabels[index]} - ${classroomName}`,
          bucket,
          classroomId: configClassroomId,
        });
      });
    });

    return columnsToRender;
  }, [generatedSchedule]);

  const findItemsInCell = (slotIndex: number, column: { bucket: string; classroomId: string }) => {
    if (!generatedSchedule) return [] as GeneratedScheduleItem[];

    return generatedSchedule.items.filter((item) => {
      if (String(item.configClassroomId || "") !== column.classroomId) return false;
      if (sessionBucket(item.sessionType) !== column.bucket) return false;
      if (Number(item.dayIndex) !== expectedDayByBucket[column.bucket]) return false;

      const start = Number(item.startSlot);
      const end = start + Number(item.periodCount || 1) - 1;
      return slotIndex >= start && slotIndex <= end;
    });
  };

  const classroomOptions = useMemo(() => {
    if (!generatedSchedule) return [] as { id: string; label: string }[];

    const map = new Map<string, string>();
    generatedSchedule.items.forEach((item) => {
      if (item.configClassroomId == null) return;
      const id = String(item.configClassroomId);
      const label = item.classroomName || id;
      if (!map.has(id)) {
        map.set(id, label);
      }
    });

    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [generatedSchedule]);

  const getWarningsForItem = (item: GeneratedScheduleItem) => {
    return effectiveWarnings.filter((warning) => {
      const itemId = String(item.generatedScheduleItemId);
      const warningGeneIds = warning.geneIds || [];
      const warningItems = warning.items || [];

      if (warningGeneIds.includes(itemId)) {
        return true;
      }

      if (warningItems.some((warningItem) => String(warningItem.geneId || "") === itemId)) {
        return true;
      }

      const warningDayMatch = warning.dayIndex == null || Number(warning.dayIndex) === Number(item.dayIndex);
      const warningClassroomMatch =
        !warning.configClassroomIds ||
        warning.configClassroomIds.length === 0 ||
        warning.configClassroomIds.includes(String(item.configClassroomId || ""));
      const warningProfessorMatch =
        !warning.configProfessorIds ||
        warning.configProfessorIds.length === 0 ||
        warning.configProfessorIds.includes(String(item.configProfessorId || ""));

      if (!(warningDayMatch && warningClassroomMatch && warningProfessorMatch)) {
        return false;
      }

      if (!warning.courseCodes || warning.courseCodes.length === 0) {
        return true;
      }

        return warning.courseCodes.map((courseCode) => String(courseCode)).includes(String(item.courseCode));
    });
  };

  const handleLoadGenerated = async (id?: number) => {
    const source = id ?? Number(generatedScheduleIdInput.trim());
    if (!Number.isFinite(source) || source <= 0) {
      toast.error("Ingresa un generatedScheduleId");
      return;
    }

    const schedule = await fetchGeneratedSchedule(source);
    if (schedule) {
      setGeneratedScheduleIdInput(String(source));
    }
  };

  const handleOpenEdit = (item: GeneratedScheduleItem) => {
    setEditItem(item);
    setEditDayIndex(Number(item.dayIndex));
    setEditStartSlot(Number(item.startSlot));
    setEditConfigClassroomId(String(item.configClassroomId ?? ""));
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditItem(null);
    setIsEditModalOpen(false);
  };

  const handleSaveEdit = async () => {
    if (!generatedSchedule || !editItem) return;

    const warnings = await updateGeneratedItem(generatedSchedule.generatedScheduleId, editItem.generatedScheduleItemId, {
      dayIndex: editDayIndex,
      startSlot: editStartSlot,
      configClassroomId: editConfigClassroomId ? Number(editConfigClassroomId) : undefined,
    });

    setLastWarnings(warnings);
    if (warnings.length > 0) {
      toast("Cambio guardado con advertencias", { icon: "⚠️" });
    } else {
      toast.success("Bloque movido correctamente");
    }
    handleCloseEditModal();
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-white/5">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Horarios generados</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Selecciona un registro para ver y editar su asignación por slots.</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => fetchGeneratedSchedules()}>
            Refrescar lista
          </Button>
        </div>

        <GenericTable
          data={generatedSchedules.map((item) => ({ ...item, id: item.generatedScheduleId }))}
          columns={columns}
          actions={(item) => (
            <Button size="sm" variant="outline" type="button" onClick={() => handleLoadGenerated(item.generatedScheduleId)}>
              Ver
            </Button>
          )}
        />
      </div>

      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-white/5 dark:bg-white/3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Detalle de horario generado</h3>
          <div className="flex items-center gap-2">
            <Input
              placeholder="generatedScheduleId"
              value={generatedScheduleIdInput}
              onChange={(event) => setGeneratedScheduleIdInput(event.target.value)}
              className="max-w-56"
            />
            <Button size="sm" variant="outline" onClick={() => handleLoadGenerated()}>
              Cargar
            </Button>
          </div>
        </div>

        {generatedSchedule && (
          <div className="grid grid-cols-1 gap-2 text-xs md:grid-cols-4">
            <div className="rounded-lg bg-gray-50 p-2 dark:bg-white/5">Fitness: {generatedSchedule.fitness ?? 0}</div>
            <div className="rounded-lg bg-gray-50 p-2 dark:bg-white/5">Hard penalty: {generatedSchedule.hardPenalty ?? 0}</div>
            <div className="rounded-lg bg-gray-50 p-2 dark:bg-white/5">Soft penalty: {generatedSchedule.softPenalty ?? 0}</div>
            <div className="rounded-lg bg-gray-50 p-2 dark:bg-white/5">No asignados: P {generatedSchedule.unassignedProfessorCount ?? 0} / S {generatedSchedule.unassignedClassroomCount ?? 0}</div>
          </div>
        )}

        {effectiveWarnings.length > 0 && (
          <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            <p className="mb-1 font-semibold">Advertencias:</p>
            <ul className="list-disc pl-5">
              {effectiveWarnings.map((warning) => (
                <li key={`${warning.code}-${warning.message}`}>{warning.code ? `[${warning.code}] ` : ""}{warning.message}</li>
              ))}
            </ul>
          </div>
        )}

        {!generatedSchedule && <p className="text-sm text-gray-500">No hay horario cargado.</p>}

        {generatedSchedule && (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-white/5">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-50 dark:bg-white/5">
                <tr>
                  <th className="border-b border-r border-gray-200 p-2 text-left dark:border-white/5">Slot</th>
                  {scheduleGridColumns.map((column) => (
                    <th key={column.key} className="border-b border-r border-gray-200 p-2 text-left dark:border-white/5">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {generatedSchedule.slots
                  .slice()
                  .sort((a, b) => Number(a.slotIndex) - Number(b.slotIndex))
                  .map((slot) => (
                    <tr key={slot.slotIndex}>
                      <td className="border-r border-b border-gray-200 p-2 align-top dark:border-white/5">
                        <p className="font-medium">{slot.label || `Slot ${slot.slotIndex}`}</p>
                        <p className="text-gray-500">{slot.startTime} - {slot.endTime}</p>
                      </td>
                      {scheduleGridColumns.map((column) => {
                        const items = findItemsInCell(slot.slotIndex, column);
                        const hasCollision = items.length > 1;

                        return (
                          <td
                            key={`${slot.slotIndex}:${column.key}`}
                            className={`border-r border-b p-2 align-top dark:border-white/5 ${
                              hasCollision
                                ? "border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10"
                                : "border-gray-200"
                            }`}
                          >
                            {items.length === 0 ? (
                              <span className="text-gray-400">-</span>
                            ) : (
                              <div className="space-y-2">
                                {hasCollision && (
                                  <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                                    Conflicto ({items.length})
                                  </p>
                                )}

                                {items.map((item) => {
                                  const itemWarnings = getWarningsForItem(item);
                                  const hasItemWarnings = itemWarnings.length > 0;
                                  const warningTooltip = itemWarnings
                                    .map((warning) => `${warning.code ? `[${warning.code}] ` : ""}${warning.message}`)
                                    .join("\n");

                                  return (
                                    <div
                                      key={item.generatedScheduleItemId}
                                      title={hasItemWarnings ? warningTooltip : undefined}
                                      className={`rounded-md border p-2 ${
                                        hasItemWarnings
                                          ? "border-amber-300 bg-amber-100/80 dark:border-amber-500/40 dark:bg-amber-500/20"
                                          : "border-gray-200 bg-white/70 dark:border-white/10 dark:bg-white/5"
                                      }`}
                                    >
                                      <p className="font-medium text-gray-700 dark:text-gray-200">
                                        {item.sessionType != "CLASS" ? item.sessionType : ""} {item.courseCode} {item.courseName || ""} {item.sectionLabel || ""}
                                      </p>
                                      <p className="text-gray-500">
                                        P: {item.professorName || item.configProfessorId || "UNASSIGNED"}
                                      </p>
                                      {hasItemWarnings && (
                                        <p className="text-[11px] font-medium text-amber-800 dark:text-amber-300">
                                          Advertencia
                                        </p>
                                      )}
                                      <button
                                        type="button"
                                        className="text-brand-600 underline"
                                        onClick={() => handleOpenEdit(item)}
                                      >
                                        Mover bloque
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      <Modal isOpen={isEditModalOpen && Boolean(editItem)} onClose={handleCloseEditModal} className="max-w-xl m-4">
        {editItem && generatedSchedule && (
          <div className="w-full rounded-3xl bg-white p-6 dark:bg-gray-900">
            <h4 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
              Editar bloque {editItem.courseCode} ({editItem.generatedScheduleItemId})
            </h4>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <Label>Día</Label>
                <select
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700"
                  value={editDayIndex}
                  onChange={(event) => setEditDayIndex(Number(event.target.value || 0))}
                >
                  <option value={0}>CLASS (día base)</option>
                  <option value={1}>LAB1 (martes)</option>
                  <option value={2}>LAB2 (jueves)</option>
                </select>
              </div>

              <div>
                <Label>Slot</Label>
                <select
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700"
                  value={editStartSlot}
                  onChange={(event) => setEditStartSlot(Number(event.target.value || 0))}
                >
                  {generatedSchedule.slots
                    .slice()
                    .sort((a, b) => Number(a.slotIndex) - Number(b.slotIndex))
                    .map((slot) => (
                      <option key={slot.slotIndex} value={slot.slotIndex}>
                        {slot.label || `Slot ${slot.slotIndex}`} ({slot.startTime} - {slot.endTime})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <Label>Classroom</Label>
                <select
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700"
                  value={editConfigClassroomId}
                  onChange={(event) => setEditConfigClassroomId(event.target.value)}
                >
                  <option value="">Sin salón</option>
                  {classroomOptions.map((classroom) => (
                    <option key={classroom.id} value={classroom.id}>
                      {classroom.id} - {classroom.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <Button size="sm" variant="outline" onClick={handleCloseEditModal}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSaveEdit} disabled={saving}>
                Guardar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {(loading || saving) && <p className="text-sm text-gray-500">Procesando...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
