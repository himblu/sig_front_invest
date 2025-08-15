export interface CourseSchedule {
	teachers: Teacher[];
	typeCertificationDesc: string;
	classSessionDesc: string;
	durationHours: string;
	extensionCoursesID: number;
	courseName: string;
	startDateCourse: string; // formato: "YYYY-MM-DD"
	endDateCourse: string;   // formato: "YYYY-MM-DD"
	dataSource: CourseDaySchedule[];
}

export interface Teacher {
	teacher: string;
}

export interface CourseDaySchedule {
	startDate: string; // formato: "DD-MM-YYYY"
	endDate: string;   // formato: "DD-MM-YYYY"
	days: DaySchedule[];
}

export interface DaySchedule {
	lunes: boolean;
	martes: boolean;
	miercoles: boolean;
	jueves: boolean;
	viernes: boolean;
	sabado: boolean;
	domingo: boolean;
	horario: string; // Ejemplo: "07:30 - 08:30"
}
