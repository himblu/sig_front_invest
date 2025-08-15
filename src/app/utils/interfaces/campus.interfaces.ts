import { CalendarEvent } from "angular-calendar";

export interface School {
    schoolID:           number;
    schoolName:         string;
    schoolDesc:         string;
    schoolPeriodStart:  string;
    schoolPeriodEnd:    string;
    state:              string;
		statusID:		 				number;
		user:								string;
}


export interface SPGetCareer {
    careerID:           number;
    schoolName:         string;
    schoolID?:           number;
    careerName?:         string;
    careerDesc?:         string;
    careerAcronym?:      string;
    careerPeriodStart?:  string;
    careerPeriodEnd?:    string;
    state?:              string;
		statusID?:					 number;
}

export interface Agreement{
	approvalRequestBusID?: number;
	businessPhone: string;
	bussinesName: string;
	bussinessEmail: string;
	economicSector: string;
	fiscalYears: number;
	legalRepresentative: string;
	location: string;
	position: string;
	referenceBusiness: string;
	responsibleEmail: string;
	responsibleName: string;
	responsiblePhone: string;
	responsiblePosition: string;
	ruc: string;
	tradename: string;
	typeBusiness: string;
}

export interface AgreementCareers {
	agreementsID?: number;
	approvalRequestBusID?: number;
	businessPhone: string;
	bussinesName: string;
	bussinessEmail: string;
	economicSector: string;
	fiscalYears: number;
	legalRepresentative: string;
	location: string;
	position: string;
	referenceBusiness: string;
	responsibleEmail: string;
	responsibleName: string;
	responsiblePhone: string;
	responsiblePosition: string;
	ruc: string;
	tradename: string;
	typeBusiness: string;
	careerID: number;
	careerName: string;
	enddateAgreement: string;
	enddatePractice: string;
	initdateAgreement: string;
	initdatePractice: string;
	periodID: number;
	periodName: number;
}

export interface SPGetModality {
  modalityID:   number;
  modalityName: string;
  modalityDesc: string;
  modalityOrder:number;
  state:        string;
	workingORmodule: 'J' | 'M';
	statusID:			number;
}

export interface SPGetClassroom {
  classroomID:        number;
  classroomTypeID:    number;
  classroomTypeName:  string;
  buildingID:         number;
  buildingName:       string;
  classroomName:      string;
  classroomDesc:      string;
  seating:            number;
  chairs:             number;
  capacity:           number;
  capacityMax:        number;
  capacityMin:        number;
  state:              number;
}

export interface ClassRoom {
  classroomID: number;
  classroomName: string;
  classroomDesc: string;
}

export interface SPGetClassroomType {
  classroomTypeID:    number;
  classroomTypeName:  string;
  classroomTypeDesc:  string;
  state:              string;
}

export interface SPGetBuilding {
  buildingID:   number;
  campusID:     number;
  campusName:   string;
  buildingName: string;
  buildingDesc: string;
  floorNro:     number;
  seating:      number;
  status:       string;
}

export interface Course {
  courseID:                number;
  courseName:              string;
  courseAbbr:              string;
  courseCred:              string;
  courseHoursTeachContact: string;
  courseHoursPracExp:      string;
  courseHoursAutonomous:   string;
  statusID:                number;
  stateName:               string;
  courseSubject:           string;
  courseCode:              string;
  courseHoursLab:          number;
  courseHoursTheory:       number;
  courseHoursPractice:     number;
	starPeriod:							 string;
}


export interface Subject extends SubjectColor {
  credits: number;
  faceToFaceHours: number;
  experimentalHours: number;
  unsupervisedHours: number;
  depends?: SubjectDependency[] | number[];
  studyPlanId?: number;
  cycle?: number; // Periodo
	orgUnitID?: number;
  // Lo que viene de la base
  careerID: number;
  careerName?: string;
  courseID: number;
  courseName?: string;
  // indexWhereIsStored?: number;
}

export interface SubjectForSection {
  courseID: number;
  courseName: string;
  cycleID: number;
  cycleDesc: string;
}

export interface Cycle {
	cycleDesc: string;
	cycleID: number;
	stateName: string;
	statusID: number;
	cycleName: string;
}

export interface SubjectDependency extends SubjectColor {
  id: number;
  name: string;
}

export interface SubjectColor {
  background?: string;
  color?: string;
}

export interface StudyPlan {
  studyPlanID:    number;
  studyPlanDesc:  string;
  statusID?:       number;
  stateName:      string;
	careerID?: number;
  careerName?: string;
}

export interface TimeAvailability {
	hours: number;
	personID: number;
	scheduleTypeID: number;
	scheduleTypeName: string;
	startPeriod: number;
	state: string;
	teacherName: string;
	amount: number;
}

export interface ApprovalRequest {
	appointmentFile: string;
	approvalRequestBusID: number;
	bussinesName: string;
	cedulaBusinessFile: string;
	justification: string;
	ruc: string;
	rucBusinessFile: string;
	sheetBusineesFile: string;
	signedFile: string;
	stateApproval: string;
	typeBusiness: string;
	yesNot: string;
	index?: number;
	program: string;
	personId: number;
}

export interface ApprovalBusinessType{
	typeBusinessDesc: string;
	typeBusinessID: number;
}

export interface ProjectTypes {
	projectTypeImpactID: number;
	projectTypeName: string;
}

export interface ProjectTypesMeasurement {
	measurementID: number;
	measurementName: string;
}

export interface ProjectState {
	stateDesc: string;
	stateProjectID: number;
}

export interface MicroProject {
	projectPracInformativeDesc: string;
	projectPracInformativeID: number;
	projectPracticasID: number;
}

export interface Project {
	projectPracInformativeID: number;
	bussinesName: string;
	careerID: number;
	careerName: string;
	codeProject: string;
	courseID?: number;
	courseName: string;
	cycleDesc: string;
	cycleID: number;
	enddateEstimated: Date;
	hoursPracticeProject: number;
	initdateEstimated: Date;
	modalityID: number;
	modalityName: string;
	modalityPracticeID: number;
	nameProyect: string;
	numberBeneficiaries: string;
	numberCodeProject: string;
	numberDaysProject: number;
	objetivevincDesc: string;
	objetivevincID: number;
	periodID: number;
	periodName: string;
	programvincDesc: string;
	programvincID: number;
	projectPracticasID: number;
	ruc: string;
	schoolID: number;
	schoolName: string;
	stateDesc: string;
	statusID: number;
	statusProject: number;
	studyPlanDesc: string;
	studyPlanID: number;
}

export interface ProjectActivityByObjetive {
	activities: ProjectActivity[],
	nameProyect: string;
	projectObjectiveEspID: number;
	projectPracticasID: number;
	specificDescription: string;
}

export interface ProjectActivity {
	activityName: string;
	hours: number;
	itca: number;
	other: number;
	projectObjEspActivityID: number;
}

export interface ProjectObjetive {
	activities?: ProjectActivityOfObjetive[],
	nameProyect?: string;
	projectObjectiveEspID: number;
	projectPracticasID: number;
	specificDescription: string;
}

export interface ProjectValidation {
	budgeted: string;
	projectPracInformativeID: number;
	projectPracticasID: number;
	projectPracticeHours: number;
}

export interface ProjectActivityOfObjetive {
	activityName: string;
	compliance: string;
	endDateActivity: string | Date;
	hours?: string;
	indicator: string;
	initDateActivity: string | Date;
	itca?: string;
	observation: string;
	other?: string;
	projectObjEspActivityID: number;
	projectObjectiveEspID: number;
	userCreated: string;
	verificationMean: string;
}

export interface TeachingProcess {
	periodID: number;
	personID: number;
	classSectionNumber: number;
	parallelCode: string;
	courseName: string;
	a1: number;
	a2: number;
	a3: number;
	a4: number;
	a5: number;
	a6: number;
	a7: number;
	a8: number;
	a9: number;
	a10: number;
	total?: number;
}

export interface ModalityByCareer{
	modalityID:    number;
  modalityName:  string;
  workingORmodule: string;
}

export interface StudyPlanForSection {
  studyPlanID: number;
  studyPlanDesc: string;
}

export interface MajorSchool {
	schoolID: number;
	schoolName: string;
	careers: CareerForSection[];
}

export interface ParallelList {
	parallelCode: string;
	students: ListStudent[];
}

export interface CareerDetail {
  typeCourseID:         number;
  typeCourseDesc:       string;
  studyPlanID:          number;
  studyPlanDesc:        string;
  courseID:             number;
  courseName:           string;
  careerID:             number;
  careerName:           string;
  orgUnitID:            number;
  orgUnitDesc?:         string;
  modalityID:           number;
  modalityName:         string;
  companyID:            number;
  branchID:             number;
  branchName:           string;
  typeSubjectID:        number;
  typeSubjectDesc:      string;
  trainingCampsID:      number;
  trainingCampsDesc:    string;
  cycleID:              number;
  starPeriod:           string;
  hours:                string;
  hoursTeachContact:    string;
  hoursPracExp:         string;
  hoursAutonomous:      string;
  credits:              string;
  preRequisiteCourseID: number;
  preRequeriment:       string;
  teachers?: TeacherCourse[];
  selectedTeacher?: number | '';
}

export interface DistributiveSubject {
	courseID: number;
	courseName: string;
	hours: number;
	busyHours: number;
	maximumHours: number; // Esto no es para la asignatura. Es para que sirva como bandera y saber el máximo de
	// asignaturas que se pueden configurar en esa selección.
	selectedTeacher?: number | '';
	teachers?: DistributiveTeacher[];
}

export interface InstrumentSubject {
	courseID: number;
	courseName: string;
	cycleDesc: string;
	cycleID: number;
}

export interface DistributiveTeacher {
	personID: number;
	teacher: string;
	availableHours: number;
	busyHours: number;
}

export interface Curriculum {
  units: Unit[];
	name: string;
	practiceHours: PracticeUnit[];
}

export interface CurriculumBody {
	name: string;
	subjects: Subject[];
}

export interface PracticeUnit {
	name: number;
	rows: PracticeHour[][];
}

export interface PracticeHour {
	name: number;
	cycle: number;
	hours: number;
}

export interface Unit {
  name: number;
  rows: Subject[][];
}

export interface RomanNumeral {
  value: number;
  numeral: string;
}

export interface CurriculumPeriod {
  name: string;
  number: number;
}

export interface CycleDetail {
  cycleID:    number;
  cycleName:  string;
  careerID:   number;
  modalityID: number;
}

export interface CareerAgreement {
	courseNamePractice: string;
	coursePractice: number;
	hours: string;
}

export interface CourseOfPractice {
	courseID: number;
	courseName: string;
	courseNamePractice: string;
	coursePractice: number;
	hours: string;
}

export interface AgreementBusinessCareer {
	careerID: number;
	careerName: string;
	enddateAgreement: string;
	enddatePractice: string;
	initdateAgreement: string;
	initdatePractice: string;
	periodID: number;
	periodName: string;
}

export interface TotalStudents {
	busy: number;
}

export interface TotalTeachers {
	busyTeacher: number;
}

export interface ProjectPracticeModality {
	modalityPracticeDesc: string;
	modalityPracticeID: number;
}

export interface ListStudent {
	namesStudents: string;
	personID: number;
	studentID: number;
}

export interface ListTeacher {
	namesTeacher: string;
	personID: number;
	teacherID: number;
}

export interface CoursesDetail {
  courseID:   number;
  courseName: string;
	credits: number;
}

export interface TeacherCourse {
  personID:       number;
  teacherName:    string;
  teacherID?:      number;
  courseID:       number;
  courseName:     string;
  hours:          number;
  currentHours?:   number;
  state:          string;
  startPeriod:    number;
  scheduleTypeID: string;
}

export interface BriefTeacher {
	PersonFullName: string;
	personID: string;
}

export interface Filter {
	campus: number;
	period: number;
	school: number;
	section: string;
	modality: number;
	module: number;
	periodPart: number;
	career: number;
	studyPlan: number;
	workingDay: number;
	cycle: number;
	building: number;
	classroom: number;
	capacity: number;
}

export interface DayFormValue {
	startTime: string;
	endTime: string;
	temporalId: string;
	day: number;
	subjectId: number;
	building: number;
	classroom: number;
	personId: number;
	subjectHours: number;
}

export interface PartPeriod {
  partPeriodID: number;
  processID: number;
  processDesc: string;
  assormentDesc: string;
  levelID: number;
  levelDesc: string;
  branchID: number;
  branchDesc: string;
  modalityID: number;
  modalityDesc: string;
  statusID: number;
  stateName: string;
}

export interface CareerForSection {
  careerID: number;
  careerName: string;
	careerAcronym?: string;
}

export interface WorkingDay {
  workingDayID: number;
  workingDayDesc: string;
  startTime: string;
  endTime: string;
  statusID: number;
  stateName: string;
}

export interface WorkingDayHour {
	hoursID: number;
  startTime: string;
  endTime: string;
}

export interface NumberSection {
  numberSection: number;
}

export interface Parallel {
  parallelCode: string;
}

export interface TemporalPostSubjectSchedule {
	periodID: number;
	classModuleID: number; // Módulo
	modalityID: number;
	campusID: number;
	courseID: number;
	workingDayID: number; // Jornada
	careerID: number;
	parallelCode: string;
	studyPlanID: number;
	classRoomID: number;
	startTime: string;
	endTime: string;
	weekday: number;
	cycleID: number;
	personID: number;
	subjectHours: number;
	schoolID: number;
	capacity: number;
}

export interface TemporalUpdateSubjectSchedule {
	classRoomID: number;
}

export interface TemporalCode {
	codeGenerate: string;
}

export interface CourseDetailShort{
  courseID: number,
  courseName: string,
  courseAbbr: string,
  stateName: string
}

export interface ResultType{
  resultTypeID: number,
  contribution: string,
  resultTypeDesc: string
}

export interface Units{
	state: string;
	unitDesc: string;
	unitID: number;
	unitName: string;
}

export interface EvaluationTool{
	evaluationToolID: number;
	evaluationToolName: string;
}

export interface EvaluationType{
	evaluationTypeID: number;
	evaluationTypeName: string;
}

export interface ProductGenerated{
	settingUnitsID: number;
	settingUnitDesc: string;
}

export interface EvaluationCriteria{
	settingUnitsID: number;
	settingUnitDesc: string;
}

export interface SubjectPlan{
	subjectPlanID: number;
}

export interface CourseHours{
	hoursAutonomous: string;
	hoursPracExp: string;
	courseID: number;
	hoursTeachContact: string;
}

export interface CourseSchedule{
	unitName: string;
	unitID: number;
	details: settingUnit[];
}

export interface settingUnit{
	detailName: string;
	endDateUnit: string;
	hours: number;
	numberSetting: number;
	numberWeek: string;
	settingUnitDesc: string;
	settingUnitsID: number;
	startDateUnit: string;
	unitID: number
	teacherID: number;
}

export interface AttendanceTeacher extends CalendarEvent {
	backgroundColor?: string;
	fontColor?: string;
	careerName: string;
	classRoomID: number;
	classSectionNumber: number;
	classroomName: string;
	courseID: number;
	courseName: string;
	day?: string;
	endDate?: string;
	endTime: string;
	flag_active?: number;
	flag_date_active?: number;
	parallelCode: string;
	startDate?: string;
	startTime: string;
	flg_dia?: string;
	cycleDesc: string;
	calendarDate?: string;
}

export interface StudentActivities extends CalendarEvent {
	commentary?: string;
	grade?: number;
	attempts?: number;
	backgroundColor?: string;
	fontColor?: string;
	penddingTask?: string;
	submittedTask?: string;
	unsubmittedTask?: string;
	classSectionNumber: number;
	courseName: string;
	endDate: string;
	nameTeacher?: string;
	periodID: number;
	startDate: string;
	studentID?: number;
	taskName?: string;
	taskDesc?: string;
	taskID: number;
	submitted?: number;
	urlFile?: string;
	descriptionTask?: string;
	urlWeb?: string;
	fileTeache?:string;
}

export interface Student{
	documentIdentity: number;
	student: string;
	studentID: number;
	attendanceStatusID?: number;
}

export interface StudentGrades{
	eq?: string;
	avg1: string;
	avg2: string;
	avgTot: string;
	careerName: string;
	courseName: string;
	documentIdentity: string;
	levelDesc: string;
	modalityName: string;
	n1: string;
	n2: string;
	n3: string;
	n4: string;
	n5: string;
	n6: string;
	n7: string;
	n8: string;
	n9: string;
	n10: string;
	nro?: number;
	exL: string;
	sum: string;
	parallelCode: string;
	periodName: string;
	section: string;
	student: string;
	studentID: number;
	attendance?: string;
	percentageP1?: string;
	percentageP2?: string;
	flgGra?: number;
	flgSup?: number;
	newGradeGra?: string;
	newGradeSup?: string;
	flgPayment: number;
	backgroundColor: string;
	fontColor: string;
	gradeSustentSup: string;
	gradeSustentGra: string;
}

export interface TaskGrade{
	flgFile?: number;
	classSectionNumber: number;
	componentID: number;
	documentIdentity: string;
	grade: number;
	periodID: number;
	student: string;
	studentID: number;
	subComponentID: number;
	submissionStatusID: number;
	submissionStatusDesc: string;
	taskID: number;
	urlFile?: string;
	commentary?: string;
	backgroundColor?: string;
	flgPayment: number;
}

export interface CareerList{
	careerID: number;
	careerName: string;
	classModuleID: number;
	endDate: string;
	modalityID: number;
	modalityName: string;
	modulePeriod: string;
	numberWeek: string;
	periodID: number;
	schoolID: number;
	schoolName: string;
	startDate: string;
	state: string;
	statusID: number;
	studyPlanDesc: string;
	studyPlanID: number;
}

export interface Publication {
	title: string;
	titlePublicationID: string;
}

export interface PublicationAvailability {
	availabilityDesc: string;
	availabilityID: number;
}

export interface Bibliography {
	authors: Authors[];
	cityCountryDesc: string;
	cityCountryID: number;
	editorialDesc: string;
	publicationID: string;
	publicationYear: string;
	title: string;
}

export interface Authors {
	authorName: string;
}

export interface NewStudents {
	institutionOriginID: number;
	periodID: number;
	studentID: number;
	periodSource: string;
	courseSource: string;
	courseName: string;
	creditSource: number;
	hoursSource: number;
	gradeSource: number;
	courseID: number;
	creditFate: number;
	hoursFate: number;
	gradeFate: number;
	userCreated: string;
}

export interface InstrumentTeacher {
	courseID: number;
	courseName: string;
	parallelCode?: string;
	personID: number;
	teacher: string;
	teacherID: number;
	disabled: boolean;
	// teacherToEvaluate?: InstrumentTeacher[];
}

export interface InstrumentTeacherByPeriod {
	personID: number;
	teacherID: number;
	teacher: string;
	disabled: boolean;
}

export interface EvaluationInstrumentsReport {
	typeEvaluationDesc: string;
	typeEvaluationInstrumentID: number;
	flgActivity?: number;
	flgComponent?: number;
}

export interface EvaluationInstrumentsTeacherFollowup {
	teacherID: number;
	courseID: number;
	courseName: string;
	cycleDesc: string;
	evaluationInstrumentsID: number;
	parallelCode: string;
	settingEvaluationInstrumentID: number;
	teacher: string;
}

export interface CourseToInstrument {
	careerID: number;
	classSectionNumber: number;
	courseID: number;
	courseName: string;
	cycleID: number;
	modalityID: number;
	parallelCode: string;
	periodID: number;
	personID: number;
	schoolID: number;
	studyPlanID: number;
	teacher: string;
}

export interface CoursesLinkage {
	courses: string;
	files: CoursesLinkageFile[];
	modalityPracticeDesc: string;
	modalityPracticeID: number;
	nameProyect: string;
	projectPracInformativeID: number;
	projectPracticasID: number;
}

export interface CoursesLinkageFile {
	extensionType: string;
	file: string;
	fileSize: string;
	fileType: string;
	fileUrl: string;
	processTemplateID: number;
	statusFileDesc: string;
	statusFileID: number;
	studentProcessFileID: number;
	templateFileUrl: string;
	urlFile: string;
	observation?: string;
	orderNumber: number;
}

export interface LinkageProject {
	courses: string;
	cycleDesc: string;
	modalityPracticeDesc: string;
	projectPracInformativeDesc: string;
	projectPracInformativeID: number;
	projectPracticasID: number;
	projectPracticeHours: number;
	qtyStudents: number;
}

export interface StudentGradesLinkage {
	gradeLinkageID: number;
	projectPracInformativeID: number;
	personDocumentNumber: string;
	fullName: string;
	grade: string;
	state: string;
	urlFile?: string;
	observation?: string;
	studentID: number;
	personID: number;
}

export interface StudentProcessTemplate {
	processTemplateID: number;
	fileTypeID: number;
	fileTypeName: string;
	file: string;
	fileSize: string;
	fileType: string;
	fileUrl: string;
	periodID: number;
	periodName: string;
	statusID: number;
	orderNumber: number;
}

export interface FileType {
	companyID: number;
	fileTypeDesc: string;
	fileTypeID: number;
	fileTypeName: string;
	flgLinkage: number;
}

export interface BecaType {
	id: number;
	name: string;
}

export interface GradeLinkage {
	grade: number | string;
	modalityPracticeDesc: string;
	periodName: string;
	specificProject: string;
	state: string;
	studentID: number;
}

export interface StudentBondingFile {
	fileTypeName: string;
	observation: string;
	projectPracInformativeID: number;
	statusFileDesc: string;
	statusFileID: number;
	studentProcessFileID: number;
	urlFile: string;
}
