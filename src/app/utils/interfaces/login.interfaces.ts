export interface Login {
	p_userName: string,
	p_userPassword: string,
	remember: boolean
}

export interface LoginReg {
	token: string;
	user: User;
	menu: string;
}

export interface User {
	userId: number;
	userName: string;
	PersonId: number;
	rolName: string;
	rolid: number;
	userEmail: string;
	userImg: string;
}

export enum ROL {
	ADMIN = 'ADMINISTRADOR',
	TEACHER = 'DOCENTE',
	STUDENT = 'ESTUDIANTE',
	POSTULANT = 'POSTULANTE',
	LIBRARIAN = 'BIBLIOTECA',
	RECTOR = 'RECTORADO',
	REGISTRY = 'SECRETARÍA GENERAL',
	CAREERCOORDINATOR = 'COORDINADOR DE CARRERA',
	BONDINGDIRECTOR = 'DIRECTOR DE VINCULACIÓN',
	QUALITY = 'ASEGURAMIENTO DE LA CALIDAD',
	UNACEM_SUPERVISOR = 'UNACEM SUPERVISOR',
	WELFARE = 'BIENESTAR'
}
