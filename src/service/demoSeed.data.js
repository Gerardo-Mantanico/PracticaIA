export const cursosSeed = [
  {
    id: 1,
    nombre: "Administración de Empresas",
    codigo: "ADM-401",
    carrerasSemestres: [
      { carrera: "Ing. Industrial", semestre: 8, seccion: "A", tipo: "OBLIGATORIO" },
      { carrera: "Ing. Sistemas", semestre: 6, seccion: "B", tipo: "OPTATIVO" },
    ],
    tipoHorario: "MANANA",
    tieneLab: false,
    esAreaComun: false,
    periodos: 1,
    usadoEnHorario: true,
  },
  {
    id: 2,
    nombre: "Matemática Básica 1",
    codigo: "MAT-101",
    carrerasSemestres: [{ carrera: "Área común", semestre: 1, tipo: "OBLIGATORIO" }],
    tipoHorario: "AMBOS",
    tieneLab: false,
    esAreaComun: true,
    semestreAreaComun: 1,
    obligatorioAreaComun: true,
    periodos: 2,
    usadoEnHorario: false,
  },
];

export const salonesSeed = [
  {
    id: 1,
    nombre: "Laboratorio 101",
    codigoInterno: "LAB-101",
    tipo: "LAB",
    capacidad: 35,
    tipoHorario: "MANANA",
    usadoEnHorario: true,
    ubicacion: "Edificio B",
    recursos: "Computadoras y proyector",
    estado: "ACTIVO",
  },
  {
    id: 2,
    nombre: "Aula Magna",
    codigoInterno: "AULA-01",
    tipo: "AMBOS",
    capacidad: 120,
    tipoHorario: "AMBOS",
    usadoEnHorario: false,
    ubicacion: "Edificio Central",
    recursos: "Audio y aire acondicionado",
    estado: "ACTIVO",
  },
];

export const docentesSeed = [
  {
    id: 1,
    nombre: "Ana Sofía Pérez",
    registroPersonal: "DOC-0001",
    horaEntrada: "07:00",
    horaSalida: "13:00",
    cursosPreferidos: ["ADM-401"],
  },
  {
    id: 2,
    nombre: "Luis Fernando Gómez",
    registroPersonal: "DOC-0002",
    horaEntrada: "13:00",
    horaSalida: "18:00",
    cursosPreferidos: ["MAT-101"],
  },
];

export const configuracionesSeed = [
  {
    id: 1,
    nombre: "Escenario Base",
    minutosPorPeriodo: 50,
    jornadaMananaInicio: "07:00",
    jornadaMananaFin: "12:00",
    jornadaTardeInicio: "13:00",
    jornadaTardeFin: "18:00",
    maxGeneraciones: 250,
    poblacionInicial: 120,
    criterioFinalizacion: "max_generaciones",
    metodoSeleccion: "torneo",
    metodoCruce: "uniforme",
    metodoMutacion: "swap",
    activa: true,
  },
];

export const horariosSeed = [
  {
    id: 1,
    configuracionId: 1,
    cursoCodigo: "ADM-401",
    cursoNombre: "Administración de Empresas",
    salonNombre: "Aula Magna",
    docenteRegistro: "DOC-0001",
    dia: "Lunes",
    inicio: "08:00",
    fin: "08:50",
    tipo: "CURSO",
    sinSalon: false,
  },
  {
    id: 2,
    configuracionId: 1,
    cursoCodigo: "MAT-101",
    cursoNombre: "Matemática Básica 1",
    salonNombre: "Laboratorio 101",
    docenteRegistro: "DOC-0002",
    dia: "Lunes",
    inicio: "09:00",
    fin: "09:50",
    tipo: "LAB",
    sinSalon: false,
  },
];
