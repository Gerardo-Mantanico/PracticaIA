"use client";

import { useCallback, useState } from "react";
import scheduleGenerationApi from "@/service/schedule-generation.service";
import type {
  BaseClassroom,
  BaseCourse,
  BaseProfessor,
  ConfigClassroomItem,
  ConfigCourseItem,
  ConfigCourseProfessorItem,
  ConfigProfessorItem,
  GeneratedScheduleResponse,
  GeneratedScheduleListItem,
  GeneratedScheduleWarning,
  Id,
} from "@/interfaces/ScheduleGeneration";

const asArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];

  const response = value as {
    content?: unknown[];
    data?: unknown[];
    items?: unknown[];
    rows?: unknown[];
    results?: unknown[];
  };

  return response.content || response.data || response.items || response.rows || response.results || [];
};

const getField = (row: Record<string, unknown>, keys: string[], fallback = "") => {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value);
    }
  }
  return fallback;
};

const toBaseCourse = (row: unknown): BaseCourse => {
  const value = (row ?? {}) as Record<string, unknown>;
  return {
    courseCode: getField(value, ["courseCode", "codigo", "code"]),
    courseName: getField(value, ["courseName", "nombre", "name"]),
  };
};

const toBaseProfessor = (row: unknown): BaseProfessor => {
  const value = (row ?? {}) as Record<string, unknown>;
  return {
    professorCode: getField(value, ["professorCode", "registroPersonal", "code"]),
    professorName: `${getField(value, ["firstName", "nombre", "name"])} ${getField(value, ["lastName", "nombre", "name"])}`,
  };
};

const toBaseClassroom = (row: unknown): BaseClassroom => {
  const value = (row ?? {}) as Record<string, unknown>;
  return {
    classroomId: parseInt(getField(value, ["classroomId", "id"])),
    classroomName: getField(value, ["classroomName", "nombre", "name"]),
  };
};

const filterByConfig = <T extends { scheduleConfigId: Id }>(
  list: T[],
  scheduleConfigId: Id
): T[] => {
  return list.filter((item) => String(item.scheduleConfigId) === String(scheduleConfigId));
};

const normalizeGenerated = (payload: unknown): GeneratedScheduleResponse | null => {
  if (!payload || typeof payload !== "object") return null;

  const value = payload as Record<string, unknown>;
  const generatedScheduleId = parseInt(String(value.generatedScheduleId ?? "0"));
  const scheduleConfigId = parseInt(String(value.scheduleConfigId ?? "0"));
  if (!generatedScheduleId || !scheduleConfigId) return null;

  return {
    generatedScheduleId,
    scheduleConfigId,
    slots: asArray(value.slots) as GeneratedScheduleResponse["slots"],
    items: asArray(value.items) as GeneratedScheduleResponse["items"],
    warnings: asArray(value.warnings)
      .map(normalizeWarning)
      .filter((item): item is GeneratedScheduleWarning => item != null),
    fitness: Number(value.fitness ?? 0),
    hardPenalty: Number(value.hardPenalty ?? 0),
    softPenalty: Number(value.softPenalty ?? 0),
    feasibilityPenalty: Number(value.feasibilityPenalty ?? 0),
    assignedGeneCount: Number(value.assignedGeneCount ?? 0),
    requiredGeneCount: Number(value.requiredGeneCount ?? 0),
    unassignedClassroomCount: Number(value.unassignedClassroomCount ?? 0),
    unassignedProfessorCount: Number(value.unassignedProfessorCount ?? 0),
  };
};

const toGeneratedListItem = (payload: unknown): GeneratedScheduleListItem | null => {
  if (!payload || typeof payload !== "object") return null;
  const value = payload as Record<string, unknown>;
  const generatedScheduleId = parseInt(String(value.generatedScheduleId ?? "0"));
  const scheduleConfigId = parseInt(String(value.scheduleConfigId ?? "0"));

  if (!generatedScheduleId || !scheduleConfigId) return null;

  return {
    generatedScheduleId,
    scheduleConfigId,
    fitness: Number(value.fitness ?? 0),
    hardPenalty: Number(value.hardPenalty ?? 0),
    softPenalty: Number(value.softPenalty ?? 0),
  };
};

const normalizeWarning = (payload: unknown): GeneratedScheduleWarning | null => {
  if (!payload || typeof payload !== "object") return null;

  const value = payload as Record<string, unknown>;
  const code = String(value.code ?? "");
  const message = String(value.message ?? "");
  if (!code && !message) return null;

  const toStringArray = (input: unknown): string[] => {
    if (!Array.isArray(input)) return [];
    return input.map((item) => String(item));
  };

  const toNumberArray = (input: unknown): number[] => {
    if (!Array.isArray(input)) return [];
    return input
      .map((item) => Number(item))
      .filter((item) => Number.isFinite(item));
  };

  const warning: GeneratedScheduleWarning = {
    code,
    severity: value.severity ? String(value.severity) : undefined,
    message,
    dayIndex: value.dayIndex == null ? undefined : Number(value.dayIndex),
    geneIds: toStringArray(value.geneIds),
    courseCodes: Array.isArray(value.courseCodes)
      ? value.courseCodes.map((item) => (typeof item === "number" ? item : String(item)))
      : [],
    sectionIndexes: toNumberArray(value.sectionIndexes),
    configProfessorIds: toStringArray(value.configProfessorIds),
    configClassroomIds: toStringArray(value.configClassroomIds),
    items: Array.isArray(value.items)
      ? value.items
          .filter((item) => item && typeof item === "object")
          .map((item) => {
            const row = item as Record<string, unknown>;
            return {
              geneId: row.geneId == null ? undefined : String(row.geneId),
              courseName: row.courseName == null ? undefined : String(row.courseName),
              professorName: row.professorName == null ? undefined : String(row.professorName),
              classroomName: row.classroomName == null ? undefined : String(row.classroomName),
            };
          })
      : [],
  };

  return warning;
};

export const useScheduleGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [courses, setCourses] = useState<BaseCourse[]>([]);
  const [professors, setProfessors] = useState<BaseProfessor[]>([]);
  const [classrooms, setClassrooms] = useState<BaseClassroom[]>([]);

  const [configProfessors, setConfigProfessors] = useState<ConfigProfessorItem[]>([]);
  const [configClassrooms, setConfigClassrooms] = useState<ConfigClassroomItem[]>([]);
  const [configCourses, setConfigCourses] = useState<ConfigCourseItem[]>([]);
  const [configCourseProfessors, setConfigCourseProfessors] = useState<ConfigCourseProfessorItem[]>([]);

  const [generatedSchedule, setGeneratedSchedule] = useState<GeneratedScheduleResponse | null>(null);
  const [generatedSchedules, setGeneratedSchedules] = useState<GeneratedScheduleListItem[]>([]);

  const loadMasterData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [coursesResp, professorsResp, classroomsResp] = await Promise.all([
        scheduleGenerationApi.getCourses(),
        scheduleGenerationApi.getProfessors(),
        scheduleGenerationApi.getClassrooms(),
      ]);

      setCourses(asArray(coursesResp).map(toBaseCourse).filter((item) => item.courseCode));
      setProfessors(asArray(professorsResp).map(toBaseProfessor).filter((item) => item.professorCode));
      setClassrooms(asArray(classroomsResp).map(toBaseClassroom).filter((item) => item.classroomId));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Error al cargar catálogo base");
      } else {
        setError("Error al cargar catálogo base");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadConfigData = useCallback(async (scheduleConfigId: Id) => {
    setLoading(true);
    setError(null);
    try {
      const [cpResp, ccResp, cResp, ccpResp] = await Promise.all([
        scheduleGenerationApi.getConfigProfessors(),
        scheduleGenerationApi.getConfigClassrooms(),
        scheduleGenerationApi.getConfigCourses(),
        scheduleGenerationApi.getConfigCourseProfessors(),
      ]);

      const cpRows = asArray(cpResp) as ConfigProfessorItem[];
      const ccRows = asArray(ccResp) as ConfigClassroomItem[];
      const cRows = asArray(cResp) as ConfigCourseItem[];
      const ccpRows = asArray(ccpResp) as ConfigCourseProfessorItem[];

      const currentConfigProfessors = filterByConfig(cpRows, scheduleConfigId);
      const currentConfigClassrooms = filterByConfig(ccRows, scheduleConfigId);
      const currentConfigCourses = filterByConfig(cRows, scheduleConfigId);
      const courseIds = new Set(currentConfigCourses.map((row) => String(row.configCourseId)));
      const professorIds = new Set(currentConfigProfessors.map((row) => String(row.configProfessorId)));

      setConfigProfessors(currentConfigProfessors);
      setConfigClassrooms(currentConfigClassrooms);
      setConfigCourses(currentConfigCourses);
      setConfigCourseProfessors(
        ccpRows.filter(
          (row) =>
            courseIds.has(String(row.configCourseId)) &&
            professorIds.has(String(row.configProfessorId))
        )
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Error al cargar entidades de configuración");
      } else {
        setError("Error al cargar entidades de configuración");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const createConfigProfessor = async (payload: {
    scheduleConfigId: Id;
    professorCode: number;
  }) => {
    setSaving(true);
    setError(null);
    try {
      await scheduleGenerationApi.createConfigProfessor(payload);
      await loadConfigData(payload.scheduleConfigId);
      return true;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Error al agregar docente a configuración");
      } else {
        setError("Error al agregar docente a configuración");
      }
      return false;
    } finally {
      setSaving(false);
    }
  };

  const createConfigClassroom = async (payload: {
    scheduleConfigId: Id;
    classroomId: Id;
    typeOfSchedule: "MORNING" | "AFTERNOON" | "BOTH";
    classroomType: "CLASS" | "LAB" | "BOTH";
  }) => {
    setSaving(true);
    setError(null);
    try {
      await scheduleGenerationApi.createConfigClassroom(payload);
      await loadConfigData(payload.scheduleConfigId);
      return true;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Error al agregar salón a configuración");
      } else {
        setError("Error al agregar salón a configuración");
      }
      return false;
    } finally {
      setSaving(false);
    }
  };

  const createConfigCourse = async (payload: {
    scheduleConfigId: Id;
    courseCode: number;
    sectionQty: number;
    scheduleTime: string;
    requireClassroom: boolean;
    typeOfSchedule: "MORNING" | "AFTERNOON" | "BOTH";
    isFixed?: boolean;
    fixedDayIndex?: number;
    fixedStartSlot?: number;
    configClassroomId?: Id;
  }) => {
    setSaving(true);
    setError(null);
    try {
      await scheduleGenerationApi.createConfigCourse(payload);
      await loadConfigData(payload.scheduleConfigId);
      return true;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Error al agregar curso a configuración");
      } else {
        setError("Error al agregar curso a configuración");
      }
      return false;
    } finally {
      setSaving(false);
    }
  };

  const createConfigCourseProfessor = async (payload: {
    configCourseId: Id;
    configProfessorId: Id;
    scheduleConfigId: Id;
  }) => {
    setSaving(true);
    setError(null);
    try {
      await scheduleGenerationApi.createConfigCourseProfessor({
        configCourseId: payload.configCourseId,
        configProfessorId: payload.configProfessorId,
      });
      await loadConfigData(payload.scheduleConfigId);
      return true;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Error al agregar preferencia curso-docente");
      } else {
        setError("Error al agregar preferencia curso-docente");
      }
      return false;
    } finally {
      setSaving(false);
    }
  };

  const fetchGeneratedSchedule = useCallback(async (generatedScheduleId: Id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await scheduleGenerationApi.getGeneratedSchedule(generatedScheduleId);
      const normalized = normalizeGenerated(response);
      if (!normalized) {
        setError("No se pudo interpretar el horario generado");
        setGeneratedSchedule(null);
        return null;
      }
      setGeneratedSchedule(normalized);
      return normalized;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Error al obtener horario generado");
      } else {
        setError("Error al obtener horario generado");
      }
      setGeneratedSchedule(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const runGenerate = async (scheduleConfigId: Id) => {
    setSaving(true);
    setError(null);

    try {
      const response = await scheduleGenerationApi.generate(scheduleConfigId);
      const payload = response as Record<string, unknown>;
      const generatedScheduleId = parseInt(String(
        payload.generatedScheduleId ||
          (payload.data as Record<string, unknown> | undefined)?.generatedScheduleId ||
          "0"
      ));

      if (!generatedScheduleId) {
        throw new Error("La generación no devolvió generatedScheduleId");
      }

      await fetchGeneratedSchedule(generatedScheduleId);
      return generatedScheduleId;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Error al ejecutar algoritmo genético");
      } else {
        setError("Error al ejecutar algoritmo genético");
      }
      return null;
    } finally {
      setSaving(false);
    }
  };

  const fetchGeneratedSchedules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await scheduleGenerationApi.getGeneratedSchedules();
      const items = asArray(response)
        .map(toGeneratedListItem)
        .filter((item): item is GeneratedScheduleListItem => item != null);

      setGeneratedSchedules(items);
      return items;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Error al listar horarios generados");
      } else {
        setError("Error al listar horarios generados");
      }
      setGeneratedSchedules([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const updateGeneratedItem = async (
    generatedScheduleId: Id,
    generatedScheduleItemId: Id,
    payload: { dayIndex: number; startSlot: number; configClassroomId?: Id | undefined }
  ) => {
    setSaving(true);
    setError(null);
    try {
      const response = await scheduleGenerationApi.patchGeneratedItem(
        generatedScheduleId,
        generatedScheduleItemId,
        payload
      );
      const warnings = asArray((response as Record<string, unknown>).warnings)
        .map(normalizeWarning)
        .filter((item): item is GeneratedScheduleWarning => item != null);
      await fetchGeneratedSchedule(generatedScheduleId);
      return warnings;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Error al editar bloque en horario generado");
      } else {
        setError("Error al editar bloque en horario generado");
      }
      return [];
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    error,
    courses,
    professors,
    classrooms,
    configProfessors,
    configClassrooms,
    configCourses,
    configCourseProfessors,
    generatedSchedule,
    generatedSchedules,
    loadMasterData,
    loadConfigData,
    createConfigProfessor,
    createConfigClassroom,
    createConfigCourse,
    createConfigCourseProfessor,
    runGenerate,
    fetchGeneratedSchedules,
    fetchGeneratedSchedule,
    updateGeneratedItem,
  };
};
