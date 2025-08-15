import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { InstrumentTeacher } from '@utils/interfaces/campus.interfaces';

export interface Period {
    periodName:         string;
    periodDetail:       string;
    periodDateStart?:    string | Date;
    periodDateEnd?:      string | Date;
    periodID:           number;
    state:              string;
		user?:               string;
}

export interface AdmissionPeriod {
	admissionPeriodID: number;
	admissionPeriodName: string;
	admissionPeriodDesc: string;
}

export interface Campus {
    campusID:           number;
    campusName:         string;
    campusDetail:       string;
    campusAddress:      string;
    campusPeriodStart:  string;
    campusPeriodEnd:    string;
    parishID:           number;
    parishName:         string;
    cantonID:           number;
    cantonName:         string;
    provinceID:         number;
    provinceName:       string;
    state:              string;
    user:               string;
		statusID?: 					number;
}

export interface Institution {
	institutionID: number;
	institutionName?: string;
	collegeName?: string;
	initDate: string;
	endDate: string;
	collegeTypeID?: number;
}

export interface Partial {
	componentID:number,
	evaluationID?:number,
	evaluationName:string,
	percentage:string,
	periodID:number,
	periodName:string,
	stateName:string,
	statusID:number,
	subComponentID?: number,
	subComponentTypeID?: number,
	subComponentTypeName?: string,
}

export interface SubComponent {
	componentID:number,
	subComponentID:number,
	subComponentTypeID:number,
	subComponentTypeName:string,
	periodID:number,
}

export interface SettingTasks {
	flgFile?: number;
	componentID:number,
	subComponentID:number,
	periodID:number,
	endDate:string,
	startDate:string,
	taskDesc:string,
	taskID:number,
	taskName:string,
	urlFile:string,
	urlWeb:string,
	percentage:string,
	subComponentTypeName:string,
	evaluationName:string,
	parallelCode: string;
	gradable?: number;
}

export interface Module {
	classModuleID: number;
	classModuleDesc: string;
}

export interface Tables<T> {
    data:  T[];
    count: number;
}

export interface Count {
	count: number;
}

export interface CampusData {
    periodID:        number;
    periodName:      string;
    periodDetail:    string;
    periodDateStart: Date;
    periodDateEnd:   Date;
    state:           string;
}

export interface ClassSession {
  classSessionID: number;
  classSessionDesc: string;
}

// export interface Cycle {
//   id: number;
//   name: string;
// }
export interface CurrentPeriodItca {
    periodID: number;
    periodName: string;
}

export interface Task{
	periodID: number;
	taskDesc: string;
	taskID: number;
	taskName: string;
}

export interface ComponentPeriod{
	activities: Activities[];
	componentID: number;
	evaluationName: string;
	periodID: number;
	periodName: string;
}

export interface Activities{
	abbr? :string;
	percentage: string;
	stateName: string;
	statusID: number;
	subComponentID: number;
	subComponentTypeID: number;
	subComponentTypeName: string;
}

export interface SettingTaskPractice {
	objective: string;
	settingUnitsID: number;
	stateName: string;
	statusID: number;
	titleGap: string;
}

export interface SettingTaskPracticeFlag {
	flgTaskPractice: number;
}

export interface SubComponentType {
	stateName: string;
	statusID: number;
	subComponentTypeDesc: string;
	subComponentTypeID: number;
	subComponentTypeName: string;
}

export interface SetInstrumentForm {
	attempts: FormControl<number | string>;
	campus: FormControl<number | string>;
	// classroom: FormControl<number | string>;
	evaluationInstrument: FormControl<number | string>;
	school: FormControl<number | string>;
	period: FormControl<number | string>;
	studyPlan: FormControl<number | string>;
	career: FormControl<number | string>;
	modality: FormControl<number | string>;
	module: FormControl<number | string>;
	workingDay: FormControl<number | string>;
	cycle: FormControl<number | string>;
	parallel: FormControl<string>;
	subject: FormControl<number | string>;
	coordinators: FormControl<number[]>;
	component: FormControl<number | string>;
	teachersBySubject: FormControl<InstrumentTeacher[]>; // Para autoevaluación y heteroevaluación
	evaluators: FormControl<number[]>; // Cualquiera que intente evaluar a otro.
	evaluatorTeachers: FormArray<FormGroup<EvaluatorTeacherForm>>;
	evaluatorCoordinators: FormArray<FormGroup<EvaluatorCoordinatorForm>>;
	evaluatorAdministrators: FormArray<FormGroup<EvaluatorAdministratorForm>>;
	// teachers: FormArray<FormGroup<LinkTeacherForm>>; // Listado de docentes (evaluadores y evaluados)
	// students: FormControl<number[]>;
	// personType: FormControl<number | string>;
	evaluationOrFollowup: FormControl<number | string>;
	typeEvaluationInstrumentID: FormControl<number>;
	activityID: FormControl<number>;
}

export interface LinkTeacherForm {
	evaluatorTeacher: FormArray<FormGroup<TeacherForm>>;
}

export interface EvaluatorTeacherForm {
	id: FormControl<number>;
	personId: FormControl<number>;
	name: FormControl<string>;
	teachersToBeEvaluated: FormArray<FormGroup<TeacherForm>>;
}

export interface EvaluatorCoordinatorForm {
	id: FormControl<number>;
	personId: FormControl<number>;
	name: FormControl<string>;
	teachersToBeEvaluated: FormArray<FormGroup<TeacherForm>>;
}

export interface EvaluatorAdministratorForm {
	personId: FormControl<number>;
	name: FormControl<string>;
	coordinatorsToBeEvaluated: FormArray<FormGroup<TeacherForm>>;
}

export interface EvaluatorAdministratorFormValue {
	personId: number;
	name: string;
	coordinatorsToBeEvaluated: EvaluatorCoordinatorFormValue[];
}

export interface TeacherForm {
	id: FormControl<number>;
	personId: FormControl<number>;
	name: FormControl<string>;
}

export interface TeacherFormValue {
	id: number;
	personId: number;
	name: string;
}

export interface EvaluatorTeacherFormValue {
	id: number;
	personId: number;
	name: string;
	teachersToBeEvaluated: TeacherFormValue[];
}

export interface EvaluatorCoordinatorFormValue {
	id: number;
	personId: number;
	name: string;
	teachersToBeEvaluated?: TeacherFormValue[];
}

export enum PERSON_TYPE {
	STUDENT = 1,
	TEACHER = 2,
	COORDINATOR = 3,
}

export interface SetInstrumentFormValue {
	campus: number;
	school: number;
	period: number;
	studyPlan: number;
	career: number;
	modality: number;
	module: number;
	workingDay: number;
	cycle: number;
	component: number;
	section: number;
	subject: number;
	evaluationInstrument: number;
	attempts: number;
	parallelCode: string;
	teachersBySubject: InstrumentTeacher[];
	evaluatorTeachers: EvaluatorTeacherFormValue[];
	evaluatorCoordinators: EvaluatorCoordinatorFormValue[];
	evaluatorAdministrators: EvaluatorAdministratorFormValue[];
}

export interface BodyToSetInstrument {
	periodID: number;
	evaluationInstrumentsID: number;
	teacherID: number;
	modalityID: number;
	schoolID: number;
	careerID: number;
	studyPlanID: number;
	courseID: number;
	cycleID: number;
	parallelCode?: string;
	personID?: number;
	typePerson: number;
	numberAttemps: number;
}

export interface ProcedureUserInfo {
	careerName: string;
	cycle: string;
	documentNumber: string;
	fullName: string;
	modalityName: string;
	parallelCode: string;
	schoolName: string;
}

export interface LibrarySpace {
	capacityMax: number;
	librarySpaceDesc: string;
	librarySpaceID: number;
	librarySpaceName: string;
	state: string;
	statusID: number;
}

export interface LibrarySpaceAttendance {
	applicantTypeID: number;
	PersonDocumentNumber: string;
	PersonFullName: string;
	dateAttendanceDeparture: string;
	dateAttendanceEntry: string;
	externalPersonID: number;
	flgAttendance: number;
	librarySpaceID: number;
	librarySpaceName: string;
	personID: number;
	studentID: number;
	teacherID: number;
	userDesc: string;
}

export interface RetrieveType {
	recognitionTypeID: number;
	recognitionTypeName: string;
}
