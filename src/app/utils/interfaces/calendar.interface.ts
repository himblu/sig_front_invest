import { CalendarEvent } from 'angular-calendar';

export interface Day {
  id: number;
  name: string;
  abbreviation: string;
}

export interface CalendarDay {
  badgeTotal: number;
  date: Date;
  day: number;
  // events: CalendarEvent[];
  inMonth: boolean;
  isFuture: boolean;
  isPast: boolean;
  isToday: boolean;
  isWeekend: boolean;
}


// Para los calendarios ()
export interface CustomEvent {
  eventName: string;
  eventDesc: string
  background: string;
  color: string;
  eventID?: number;
  state?: string;
  isLoading?: boolean;
  isChecked?: boolean;
}

export interface AdministrativeEvent extends CalendarEvent {
	assignedTo: any[];
	eventType: string;
	eventTypeId: number;
}

export interface AcademicEvent extends CalendarEvent {
	campusID: number;
	campusName: string;

	periodName: string;
	periodDetail: string;
	periodDateStart: Date;
	periodDateEnd: Date;
	periodID: number;

	modalityID: number;
	modalityName: string;
	modalityDesc: string;

	classModuleID?: number;
	classModuleDesc?: string;

	academicEventType: string;
	academicEventTypeId: number;

	observation?: string;
}


export interface CustomEventSetting {
  settingEventID: number;
  eventID: number;
  eventName: string;
  modalityID: number;
  modalityName: string;
  hoursClass: number;
  state: string;
}

export interface Modality {
  modalityID: number;
  modalityName: string;
  modalityDesc: string;
  state: string;
}

export interface CustomCalendarEvent {
  settingEventID: number;
  periodID: number;
  hoursClass: number;
  modalityName: string;
  periodName: string;
  eventID: number;
  eventName: string;
  eventDesc: string;
  background: string;
  color: string;
  calendarStartDate: string | Date;
  calendarEndDate: string | Date;
  modalityID?: string;
  user?: string; // FIXME: Eliminar luego. El backend debe hacer esto.
}

export interface GeneralResponse {
  data: any[];
  count: number;
}

export interface EventType {
	eventID: number;
	calendarTypeID: number;
	eventName: string;
	eventDesc: string;
	background: string;
	color: string;
}

export interface PostUpdateEvent {
	branchID: number; // Campus o Sede
	eventID: number; // En realidad es el tipo de evento
	modalityID?: number; // Modalidad
	classModuleID?: number; // Módulo
	periodID: number; // Periodo Académico
	startDate: string;
	endDate: string;
	commentary?: string; // Observación
}

export interface EventForm {
	eventType: number;
	campus: number;
	period: number;
	modality?: number;
	module?: number;
	observation?: string;
	startDate: Date;
	endDate: Date;
}

// FIXME: Cambiar nombre luego de depurar las demás interfaces
export interface IEvent extends CalendarEvent {
	calendarID: number;
	calendarTypeID: number;
	calendarTypeDesc: string;
	eventID: number;
	eventDesc: string;
	branchID: number;
	branchName: string;
	modalityID?: number;
	modalityName?: string;
	classModuleID?: number;
	classModuleDesc?: string;
	periodID: number;
	periodName: string;
	startDate: string | Date;
	endDate: string | Date;
	commentary?: string;
	background?: string;
	statusID?: number;
}

export enum CALENDAR_TYPE {
	ACADEMIC = 1,
	ADMINISTRATIVE = 2
}

export interface CalendarType {
	calendarTypeID: number;
	calendarTypeDesc: string;
	state: string;
}
