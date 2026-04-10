export type TipoHorario = "MANANA" | "TARDE" | "AMBOS";

export type TipoCurso = "OBLIGATORIO" | "OPTATIVO";

export interface CursoCarreraSemestre {
  carrera: string;
  semestre: number;
  seccion?: string;
  tipo: TipoCurso;
}

export interface Curso {
  id: number;
  nombre: string;
  codigo: string;
  carrerasSemestres: CursoCarreraSemestre[];
  tipoHorario: TipoHorario;
  tieneLab: boolean;
  esAreaComun: boolean;
  semestreAreaComun?: number;
  obligatorioAreaComun?: boolean;
  periodos: number;
  usadoEnHorario?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type TipoSalon = "LAB" | "CURSO" | "AMBOS";

export interface SalonHorario {
  id: number;
  nombre: string;
  codigoInterno: string;
  tipo: TipoSalon;
  capacidad: number;
  tipoHorario: TipoHorario;
  usadoEnHorario?: boolean;
}

export interface Docente {
  id: number;
  nombre: string;
  registroPersonal: string;
  horaEntrada: string;
  horaSalida: string;
  cursosPreferidos: string[];
}

export interface ConfiguracionHorario {
  id: number;
  nombre: string;
  minutosPorPeriodo: number;
  jornadaMananaInicio: string;
  jornadaMananaFin: string;
  jornadaTardeInicio: string;
  jornadaTardeFin: string;
  maxGeneraciones: number;
  poblacionInicial: number;
  criterioFinalizacion: string;
  metodoSeleccion: string;
  metodoCruce: string;
  metodoMutacion: string;
  activa: boolean;
}

export interface HorarioGenerado {
  id: number;
  configuracionId: number;
  cursoCodigo: string;
  cursoNombre: string;
  salonNombre?: string;
  docenteRegistro?: string;
  dia: string;
  inicio: string;
  fin: string;
  tipo: "CURSO" | "LAB";
  sinSalon: boolean;
}

export interface ReporteFiltro {
  anio?: number;
  semestre?: number;
  carrera?: string;
  tipo?: "CURSO" | "LAB" | "MIXTO";
}
