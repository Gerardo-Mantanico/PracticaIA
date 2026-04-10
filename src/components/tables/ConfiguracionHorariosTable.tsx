"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useModal } from "@/hooks/useModal";
import { useConfiguracionHorarios } from "@/hooks/useConfiguracionHorarios";
import { useScheduleGeneration } from "@/hooks/useScheduleGeneration";
import { GenericTable, type Column } from "@/components/ui/table/GenericTable";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import type { ConfiguracionHorario } from "@/interfaces/ScheduleConfig";

const formatTimeOnly = (value: string) => {
  if (!value) return "";
  const normalized = String(value).trim().replace("Z", "");
  if (/^\d{2}:\d{2}/.test(normalized)) {
    return normalized.slice(0, 5);
  }
  const date = new Date(normalized);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  }

  const hit = normalized.match(/(\d{2}:\d{2})/);
  return hit?.[1] || normalized;
};

const columns: Column<ConfiguracionHorario>[] = [
  {
    header: "Configuración",
    cell: (item) => (
      <div>
        <p className="font-medium text-gray-800 dark:text-white/90">{item.nombre}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{item.activa ? "Activa" : "Inactiva"}</p>
      </div>
    ),
  },
  {
    header: "Periodo (min)",
    accessorKey: "minutosPorPeriodo",
  },
  {
    header: "Jornada mañana",
    cell: (item) => `${formatTimeOnly(item.jornadaMananaInicio)} - ${formatTimeOnly(item.jornadaMananaFin)}`,
  },
  {
    header: "Jornada tarde",
    cell: (item) => `${formatTimeOnly(item.jornadaTardeInicio)} - ${formatTimeOnly(item.jornadaTardeFin)}`,
  },
  {
    header: "Generaciones",
    accessorKey: "maxGeneraciones",
  },
  {
    header: "Población inicial",
    accessorKey: "poblacionInicial",
  },
];

const initialForm: Omit<ConfiguracionHorario, "id"> = {
  nombre: "",
  minutosPorPeriodo: 50,
  jornadaMananaInicio: "07:00",
  jornadaMananaFin: "12:00",
  jornadaTardeInicio: "13:00",
  jornadaTardeFin: "18:00",
  maxGeneraciones: 200,
  poblacionInicial: 100,
  criterioFinalizacion: "max_generaciones",
  metodoSeleccion: 1,
  metodoCruce: 1,
  metodoMutacion: 1,
  activa: true,
};

const wizardTabs = ["General", "Docentes", "Salones", "Cursos", "Preferencias"] as const;

export default function ConfiguracionHorariosTable() {
  const { isOpen, openModal, closeModal } = useModal();
  const {
    configuraciones,
    loading,
    error,
    createConfiguracion,
    updateConfiguracion,
    deleteConfiguracion,
  } = useConfiguracionHorarios();
  const {
    loading: generationLoading,
    saving: generationSaving,
    courses,
    professors,
    classrooms,
    configProfessors,
    configClassrooms,
    configCourses,
    configCourseProfessors,
    loadMasterData,
    loadConfigData,
    createConfigProfessor,
    createConfigClassroom,
    createConfigCourse,
    createConfigCourseProfessor,
    runGenerate,
  } = useScheduleGeneration();

  const [selected, setSelected] = useState<ConfiguracionHorario | null>(null);
  const [createdConfig, setCreatedConfig] = useState<ConfiguracionHorario | null>(null);
  const [formData, setFormData] = useState(initialForm);
  const [currentPage, setCurrentPage] = useState(1);
  const [wizardStep, setWizardStep] = useState(0);

  const [professorCode, setProfessorCode] = useState("");
  const [classroomId, setClassroomId] = useState("");
  const [typeOfSchedule, setTypeOfSchedule] = useState<"MORNING" | "AFTERNOON" | "BOTH">("BOTH");
  const [classroomType, setClassroomType] = useState<"CLASS" | "LAB" | "BOTH">("BOTH");

  const [courseCode, setCourseCode] = useState("");
  const [sectionQty, setSectionQty] = useState(1);
  const [requireClassroom, setRequireClassroom] = useState(true);
  const [courseTypeOfSchedule, setCourseTypeOfSchedule] = useState<"MORNING" | "AFTERNOON" | "BOTH">("BOTH");

  const [prefCourseId, setPrefCourseId] = useState("");
  const [prefProfessorId, setPrefProfessorId] = useState("");

  const currentConfigId = selected?.id || createdConfig?.id || null;

  useEffect(() => {
    loadMasterData();
  }, [loadMasterData]);

  useEffect(() => {
    if (!isOpen || !currentConfigId) return;
    loadConfigData(parseInt(currentConfigId));
  }, [isOpen, currentConfigId, loadConfigData]);

  const itemsPerPage = 7;
  const totalPages = Math.max(1, Math.ceil(configuraciones.length / itemsPerPage));
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return configuraciones.slice(start, start + itemsPerPage);
  }, [configuraciones, currentPage]);

  const handleAdd = () => {
    setSelected(null);
    setCreatedConfig(null);
    setFormData(initialForm);
    setWizardStep(0);
    openModal();
  };

  const handleEdit = (row: ConfiguracionHorario) => {
    setSelected(row);
    setFormData({
      nombre: row.nombre,
      minutosPorPeriodo: row.minutosPorPeriodo,
      jornadaMananaInicio: row.jornadaMananaInicio,
      jornadaMananaFin: row.jornadaMananaFin,
      jornadaTardeInicio: row.jornadaTardeInicio,
      jornadaTardeFin: row.jornadaTardeFin,
      maxGeneraciones: row.maxGeneraciones,
      poblacionInicial: row.poblacionInicial,
      criterioFinalizacion: row.criterioFinalizacion,
      metodoSeleccion: row.metodoSeleccion,
      metodoCruce: row.metodoCruce,
      metodoMutacion: row.metodoMutacion,
      activa: row.activa,
    });
    setCreatedConfig(null);
    setWizardStep(0);
    openModal();
  };

  const handleSaveGeneral = async () => {
    if (!formData.nombre.trim()) {
      toast.error("Nombre de configuración obligatorio");
      return false;
    }

    const createdOrNull = selected
      ? await updateConfiguracion(selected.id, formData)
      : await createConfiguracion(formData);

    if (!createdOrNull) {
      toast.error("No fue posible guardar configuración");
      return false;
    }

    if (!selected && createdOrNull && typeof createdOrNull === "object") {
      setCreatedConfig(createdOrNull);
    }

    toast.success(`Configuración ${selected ? "actualizada" : "creada"} con éxito`);
    return true;
  };

  const handlePrimaryAction = async (event: React.FormEvent) => {
    event.preventDefault();

    if (wizardStep === 0) {
      const ok = await handleSaveGeneral();
      if (!ok) return;
    }

    if (wizardStep < wizardTabs.length - 1) {
      setWizardStep((prev) => prev + 1);
      return;
    }

    closeModal();
  };

  const handleRunGenerate = async (configId: string) => {
    const generatedId = await runGenerate(parseInt(configId));
    if (!generatedId) {
      toast.error("No fue posible ejecutar el algoritmo genético");
      return;
    }
    toast.success(`Horario generado #${generatedId}`);
  };

  const handleAddProfessor = async () => {
    if (!currentConfigId || !professorCode) return;
    const ok = await createConfigProfessor({ scheduleConfigId: parseInt(currentConfigId), professorCode: parseInt(professorCode) });
    if (ok) {
      setProfessorCode("");
      toast.success("Docente agregado");
    }
  };

  const handleAddClassroom = async () => {
    if (!currentConfigId || !classroomId) return;
    const ok = await createConfigClassroom({
      scheduleConfigId: parseInt(currentConfigId),
      classroomId: parseInt(classroomId),
      typeOfSchedule,
      classroomType,
    });
    if (ok) {
      setClassroomId("");
      toast.success("Salón agregado");
    }
  };

  const handleAddCourse = async () => {
    if (!currentConfigId || !courseCode) return;
    const ok = await createConfigCourse({
      scheduleConfigId: parseInt(currentConfigId),
      courseCode: Number(courseCode),
      sectionQty,
      scheduleTime: new Date().toISOString(),
      requireClassroom,
      typeOfSchedule: courseTypeOfSchedule,
    });
    if (ok) {
      setCourseCode("");
      toast.success("Curso agregado");
    }
  };

  const handleAddPreference = async () => {
    if (!currentConfigId || !prefCourseId || !prefProfessorId) return;
    const ok = await createConfigCourseProfessor({
      configCourseId: parseInt(prefCourseId),
      configProfessorId: parseInt(prefProfessorId),
      scheduleConfigId: parseInt(currentConfigId),
    });
    if (ok) {
      setPrefCourseId("");
      setPrefProfessorId("");
      toast.success("Preferencia agregada");
    }
  };

  if (loading && configuraciones.length === 0) return <div>Cargando configuraciones...</div>;
  if (error && configuraciones.length === 0) return <div>Error: {error}</div>;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-white/5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Configuración de generación</h3>
        <Button size="sm" onClick={handleAdd}>
          Nueva configuración
        </Button>
      </div>

      <GenericTable
        data={currentData}
        columns={columns}
        onEdit={handleEdit}
        onDelete={(item) => deleteConfiguracion(item.id)}
        actions={(item) => (
          <Button size="sm" variant="outline" type="button" onClick={() => handleRunGenerate(item.id)}>
            Ejecutar GA
          </Button>
        )}
        pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }}
      />

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-190 m-4">
        <div className="no-scrollbar relative w-full max-w-190 overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {selected ? "Editar configuración" : "Crear configuración"}
          </h4>
          <div className="mb-4 flex flex-wrap gap-2">
            {wizardTabs.map((tab, index) => (
              <button
                key={tab}
                type="button"
                disabled={!currentConfigId && index > 0}
                onClick={() => setWizardStep(index)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                  wizardStep === index
                    ? "bg-brand-500 text-white"
                    : "bg-gray-100 text-gray-700 disabled:opacity-40 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {!currentConfigId && wizardStep > 0 && (
            <p className="mb-3 text-sm text-amber-600">Guarda primero la configuración general para habilitar este paso.</p>
          )}

          <form onSubmit={handlePrimaryAction} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {error && (
              <div className="col-span-3 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/10 dark:text-red-400">{error}</div>
            )}

            {wizardStep === 0 && (
              <>
                <div className="col-span-3 lg:col-span-2">
                  <Label>Nombre</Label>
                  <Input value={formData.nombre} onChange={(event) => setFormData((prev) => ({ ...prev, nombre: event.target.value }))} />
                </div>
                <div>
                  <Label>Minutos por periodo</Label>
                  <Input type="number" min="40" max="60" value={formData.minutosPorPeriodo} onChange={(event) => setFormData((prev) => ({ ...prev, minutosPorPeriodo: Number(event.target.value || 50) }))} />
                </div>
                <div>
                  <Label>Mañana inicio</Label>
                  <Input type="time" value={formData.jornadaMananaInicio} onChange={(event) => setFormData((prev) => ({ ...prev, jornadaMananaInicio: event.target.value }))} />
                </div>
                <div>
                  <Label>Mañana fin</Label>
                  <Input type="time" value={formData.jornadaMananaFin} onChange={(event) => setFormData((prev) => ({ ...prev, jornadaMananaFin: event.target.value }))} />
                </div>
                <div>
                  <Label>Tarde inicio</Label>
                  <Input type="time" value={formData.jornadaTardeInicio} onChange={(event) => setFormData((prev) => ({ ...prev, jornadaTardeInicio: event.target.value }))} />
                </div>
                <div>
                  <Label>Tarde fin</Label>
                  <Input type="time" value={formData.jornadaTardeFin} onChange={(event) => setFormData((prev) => ({ ...prev, jornadaTardeFin: event.target.value }))} />
                </div>
                <div>
                  <Label>Máx. generaciones</Label>
                  <Input type="number" min="1" value={formData.maxGeneraciones} onChange={(event) => setFormData((prev) => ({ ...prev, maxGeneraciones: Number(event.target.value || 1) }))} />
                </div>
                <div>
                  <Label>Población inicial</Label>
                  <Input type="number" min="1" value={formData.poblacionInicial} onChange={(event) => setFormData((prev) => ({ ...prev, poblacionInicial: Number(event.target.value || 1) }))} />
                </div>
                <div>
                  <Label>Método selección</Label>
                  <select
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700"
                    value={formData.metodoSeleccion}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        metodoSeleccion: Number(event.target.value) === 2 ? 2 : 1,
                      }))
                    }
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                  </select>
                </div>
                <div>
                  <Label>Método cruce</Label>
                  <select
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700"
                    value={formData.metodoCruce}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        metodoCruce: Number(event.target.value) === 2 ? 2 : 1,
                      }))
                    }
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                  </select>
                </div>
                <div>
                  <Label>Método mutación</Label>
                  <select
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700"
                    value={formData.metodoMutacion}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        metodoMutacion: Number(event.target.value) === 2 ? 2 : 1,
                      }))
                    }
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                  </select>
                </div>
              </>
            )}

            {wizardStep === 1 && currentConfigId && (
              <>
                <div className="col-span-2">
                  <Label>Docente</Label>
                  <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700" value={professorCode} onChange={(event) => setProfessorCode(event.target.value)}>
                    <option value="">Selecciona docente</option>
                    {professors.map((item) => <option key={item.professorCode} value={item.professorCode}>{item.professorCode} - {item.professorName || "Sin nombre"}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <Button size="sm" type="button" onClick={handleAddProfessor}>Agregar</Button>
                </div>
                <div className="col-span-3 space-y-2 text-sm">
                  {configProfessors.map((item) => <div key={item.configProfessorId} className="rounded-lg bg-gray-50 p-2 dark:bg-white/5">#{item.configProfessorId} - {item.professorCode}</div>)}
                </div>
              </>
            )}

            {wizardStep === 2 && currentConfigId && (
              <>
                <div>
                  <Label>Salón</Label>
                  <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700" value={classroomId} onChange={(event) => setClassroomId(event.target.value)}>
                    <option value="">Selecciona salón</option>
                    {classrooms.map((item) => <option key={item.classroomId} value={item.classroomId}>{item.classroomId} - {item.classroomName || "Sin nombre"}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Jornada</Label>
                  <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700" value={typeOfSchedule} onChange={(event) => setTypeOfSchedule(event.target.value as "MORNING" | "AFTERNOON" | "BOTH")}>
                    <option value="MORNING">Mañana</option><option value="AFTERNOON">Tarde</option><option value="BOTH">Ambos</option>
                  </select>
                </div>
                <div>
                  <Label>Tipo salón</Label>
                  <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700" value={classroomType} onChange={(event) => setClassroomType(event.target.value as "CLASS" | "LAB" | "BOTH")}>
                    <option value="CLASS">Clase</option><option value="LAB">Lab</option><option value="BOTH">Ambos</option>
                  </select>
                </div>
                <div className="col-span-3 flex justify-end"><Button size="sm" type="button" onClick={handleAddClassroom}>Agregar salón</Button></div>
                <div className="col-span-3 space-y-2 text-sm">
                  {configClassrooms.map((item) => <div key={item.configClassroomId} className="rounded-lg bg-gray-50 p-2 dark:bg-white/5">#{item.configClassroomId} - {item.classroomId} | {item.typeOfSchedule} | {item.classroomType}</div>)}
                </div>
              </>
            )}

            {wizardStep === 3 && currentConfigId && (
              <>
                <div>
                  <Label>Curso</Label>
                  <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700" value={courseCode} onChange={(event) => setCourseCode(event.target.value)}>
                    <option value="">Selecciona curso</option>
                    {courses.map((item) => <option key={item.courseCode} value={item.courseCode}>{item.courseCode} - {item.courseName || "Sin nombre"}</option>)}
                  </select>
                </div>
                <div><Label>Secciones (1-2)</Label><Input type="number" min="1" max="2" value={sectionQty} onChange={(event) => setSectionQty(Math.max(1, Math.min(2, Number(event.target.value || 1))))} /></div>
                <div><Label>Jornada</Label><select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700" value={courseTypeOfSchedule} onChange={(event) => setCourseTypeOfSchedule(event.target.value as "MORNING" | "AFTERNOON" | "BOTH")}><option value="MORNING">Mañana</option><option value="AFTERNOON">Tarde</option><option value="BOTH">Ambos</option></select></div>
                <div className="flex items-center gap-2"><input id="requireClassroom" type="checkbox" checked={requireClassroom} onChange={(event) => setRequireClassroom(event.target.checked)} /><Label htmlFor="requireClassroom">Requiere salón</Label></div>
                <div className="col-span-3 flex justify-end"><Button size="sm" type="button" onClick={handleAddCourse}>Agregar curso</Button></div>
                <div className="col-span-3 space-y-2 text-sm">
                  {configCourses.map((item) => <div key={item.configCourseId} className="rounded-lg bg-gray-50 p-2 dark:bg-white/5">#{item.configCourseId} - {item.courseCode} | secciones: {item.sectionQty}</div>)}
                </div>
              </>
            )}

            {wizardStep === 4 && currentConfigId && (
              <>
                <div>
                  <Label>Curso configurado</Label>
                  <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700" value={prefCourseId} onChange={(event) => setPrefCourseId(event.target.value)}>
                    <option value="">Selecciona curso</option>
                    {configCourses.map((item) => <option key={item.configCourseId} value={item.configCourseId}>#{item.configCourseId} - {item.courseCode}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Docente configurado</Label>
                  <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700" value={prefProfessorId} onChange={(event) => setPrefProfessorId(event.target.value)}>
                    <option value="">Selecciona docente</option>
                    {configProfessors.map((item) => <option key={item.configProfessorId} value={item.configProfessorId}>#{item.configProfessorId} - {item.professorCode}</option>)}
                  </select>
                </div>
                <div className="flex items-end"><Button size="sm" type="button" onClick={handleAddPreference}>Agregar</Button></div>
                <div className="col-span-3 space-y-2 text-sm">
                  {configCourseProfessors.map((item) => <div key={item.configCourseProfessorId} className="rounded-lg bg-gray-50 p-2 dark:bg-white/5">#{item.configCourseProfessorId} - Curso #{item.configCourseId} | Docente #{item.configProfessorId}</div>)}
                </div>
              </>
            )}

            <div className="col-span-3 flex items-center justify-end gap-3">
              <Button size="sm" variant="outline" type="button" onClick={() => setWizardStep((prev) => Math.max(0, prev - 1))} disabled={wizardStep === 0}>
                Anterior
              </Button>
              <Button size="sm" variant="outline" type="button" onClick={closeModal}>
                Cancelar
              </Button>
              <Button size="sm" type="submit">
                {wizardStep === wizardTabs.length - 1 ? "Finalizar" : "Siguiente"}
              </Button>
            </div>
          </form>

          {(generationLoading || generationSaving) && <p className="mt-3 text-xs text-gray-500">Sincronizando datos de configuración...</p>}
        </div>
      </Modal>
    </div>
  );
}
