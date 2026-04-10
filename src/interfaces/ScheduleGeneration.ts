export type Id = number;

export interface BaseCourse {
  courseCode: string;
  courseName?: string;
}

export interface BaseProfessor {
  professorCode: string;
  professorName?: string;
}

export interface BaseClassroom {
  classroomId: Id;
  classroomName?: string;
}

export interface ConfigProfessorItem {
  configProfessorId: Id;
  scheduleConfigId: Id;
  professorCode: string;
  firstName: string;
  lastName: string;
}

export interface ConfigClassroomItem {
  configClassroomId: Id;
  scheduleConfigId: Id;
  classroomId: Id;
  typeOfSchedule: "MORNING" | "AFTERNOON" | "BOTH";
  classroomType: "CLASS" | "LAB" | "BOTH";
}

export interface ConfigCourseItem {
  configCourseId: Id;
  scheduleConfigId: Id;
  courseCode: string;
  sectionQty: number;
  scheduleTime: number;
  requireClassroom: boolean;
  typeOfSchedule: "MORNING" | "AFTERNOON" | "BOTH";
  isFixed?: boolean;
  fixedDayIndex?: number;
  fixedStartSlot?: number;
  configClassroomId?: Id;
}

export interface ConfigCourseProfessorItem {
  configCourseProfessorId: Id;
  configProfessorId: Id;
  configCourseId: Id;
}

export interface GeneratedScheduleSlot {
  slotIndex: number;
  startMinuteOfDay: number;
  endMinuteOfDay: number;
  startTime: string;
  endTime: string;
  label: string;
}

export interface GeneratedScheduleItem {
  generatedScheduleItemId: Id;
  configCourseId: Id;
  courseCode: string;
  courseName?: string;
  sectionIndex: number;
  sectionLabel?: string;
  sessionType: string;
  dayIndex: number;
  startSlot: number;
  periodCount: number;
  configClassroomId?: Id | null;
  classroomName?: string;
  configProfessorId?: Id | null;
  professorName?: string;
  assignmentStatus?: string;
  isFixed?: boolean;
}

export interface GeneratedScheduleResponse {
  generatedScheduleId: Id;
  scheduleConfigId: Id;
  slots: GeneratedScheduleSlot[];
  items: GeneratedScheduleItem[];
  warnings?: GeneratedScheduleWarning[];
  fitness?: number;
  hardPenalty?: number;
  softPenalty?: number;
  feasibilityPenalty?: number;
  assignedGeneCount?: number;
  requiredGeneCount?: number;
  unassignedClassroomCount?: number;
  unassignedProfessorCount?: number;
}

export interface GeneratedScheduleListItem {
  generatedScheduleId: Id;
  scheduleConfigId: Id;
  fitness?: number;
  hardPenalty?: number;
  softPenalty?: number;
}

export interface GeneratedScheduleWarningItem {
  geneId?: string;
  courseName?: string;
  professorName?: string;
  classroomName?: string;
}

export interface GeneratedScheduleWarning {
  code: string;
  severity?: string;
  message: string;
  dayIndex?: number;
  geneIds?: string[];
  courseCodes?: Array<string | number>;
  sectionIndexes?: number[];
  configProfessorIds?: string[];
  configClassroomIds?: string[];
  items?: GeneratedScheduleWarningItem[];
}
