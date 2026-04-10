export type ScheduleConfigId = string;

export interface ScheduleConfigDto {
  scheduleConfigId: ScheduleConfigId;
  periodDurationM: number;
  morningStartTime: string;
  morningEndTime: string;
  afternoonStartTime: string;
  afternoonEndTime: string;
  maxGeneration?: number;
  startPopulationSize?: number;
  selectionMethod: number;
  crossMethod: number;
  mutationMethod: number;
}

export interface ConfiguracionHorario {
  id: ScheduleConfigId;
  nombre: string;
  minutosPorPeriodo: number;
  jornadaMananaInicio: string;
  jornadaMananaFin: string;
  jornadaTardeInicio: string;
  jornadaTardeFin: string;
  maxGeneraciones: number;
  poblacionInicial: number;
  criterioFinalizacion: string;
  metodoSeleccion: 1 | 2;
  metodoCruce: 1 | 2;
  metodoMutacion: 1 | 2;
  activa: boolean;
}

export type ConfiguracionHorarioPayload = Omit<ConfiguracionHorario, "id">;
