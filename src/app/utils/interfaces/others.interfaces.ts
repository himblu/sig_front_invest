import { Person } from "./person.interfaces";
import { Area } from "./rrhh.interfaces";

export interface Tables<T> {
	data: T[];
}

export interface Province {
	provinceID: number;
	provinceName: string;
}

export interface Canton {
	cantonID: number;
	cantonName: string;
}

export interface Parish {
	parishID: number;
	parishName: string;
}

export interface IToolbarCss {
	backgroundColor: string;
	color: string;
}

export interface Identity {
	typeDocId: number;
	typeDocCode: string;
	typeDocName: string;
	typeDocDesc: string;
	typeDocLong: number;
}

export interface Sex {
	sexID: number;
	sexDesc: string;
	sexAbbr: string;
}

export interface Gender {
	genderID: number;
	genderDesc: string;
	genderAbbr: string;
}

export interface Etnia {
	ethnicityID: number;
	ethnicityDesc: string;
	ethnicityCode: string;
}

export interface BloodType {
	bloodTypeID: number;
	bloodType: string;
	bloodTypeName: string;
	bloodTypeDesc: string;
}

export interface CivilStatus {
	civilStatusID: number;
	civilStatusDesc: string;
	civilStatusAbbr: string;
}

export interface Nationality {
	countryID: number;
	nationality_1: string;
}

export interface Country {
	countryID: number;
	countryName: string;
}

export interface InstitutionType {
	institutionTypeID: number;
	institutionTypeName: string;
}

export interface CollegeType {
	collegeTypeID: number;
	collegeTypeName: string;
	collegeTypeDesc: string;
	state: string;
}

export interface Sector {
	sectorID: number;
	sectorName: string;
}

export interface PhoneType {
	phoneTypeID: number;
	phoneTypeDesc: string;
}

export interface TypeDoc {
	typeDocId: number;
	typeDocCode: string;
	typeDocName: string;
	typeDocDesc: string;
	typeDocLong: number;
}

export interface NationalTowns {
	nationalTownID: number;
	nationalTownDesc: string;
}

export interface Disability {
	disabilityID: number;
	disabilityName: string;
	disabilityDesc: string;
}

export interface Discapacidad {
	personID: number;
	disabilityID: number;
	percentageDisability: string;
	commentary: string;
	user: string;
}

export interface IncomeExpense {
	incomeEgressID: number;
	incomeEgressName: string;
	incomeEgressTypeID: number;
	incomeEgressTypeName: string;
	state: string;
}

export interface AcademicDegree {
	titleTypeID: number;
	titleTypeName: string;
	titleTypeDesc: string;
	isRequired: Boolean
}

export interface HousingType {
	housingTypeID: number;
	housingTypeName: string;
	housingTypeDesc: string;
}

export interface Relationship {
	relationShipID: number;
	relationName: string;
}

export interface BasicService {
	basicServiceID: number;
	basicServiceName: string;
	basicServiceDesc: string;
}

export interface HealthType {
	healthTypeID: number;
	healthTypeName: string;
	healthTypeDesc: string;
}

export interface SocioeconomicInformation {
	socioeconomicSheetID: number;
	quintileID: number;
	quintileName: string;
	studentID: number;
	healthTypeID: number;
	healthTypeName: string;
	periodID: number;
}

export interface Zone {
	zoneID: number;
	zoneDesc: string;
}

export interface StudentDocument {
	fileID: number;
	fileTypeID: number;
	fileTypeName: string;
	statusFileID: number;
	statusFileDesc: FILE_STATE;
	personID: number;
	studentID: number;
	periodID: number;
	urlFile: string;
	fileName: string;
	pathFile: string;
	commentary: string;
	backgroundColor?: string;
	fontColor?: string;
	payDay?: Date;
	voucherNumber?: string;
	amount?: number;
	fileExtension: string;
}

export interface PersonDocument {
	backgroundColor: string;
	docEmpleadoID: number;
	documentNumber: string;
	fileName: string;
	fileTypeID: number;
	fileTypeName: string;
	fontColor: string;
	fullName: string;
	observation: string;
	pathFile: string;
	personId: number;
	sendMail: number;
	sequenceNro: number;
	statusFileDesc: string;
	statusFileID: number;
	urlFile: string;
}

export interface SPGetFileState {
	statusFileID: number;
	statusFileDesc: FILE_STATE;
	backgroundColor: string;
	fontColor: string;
}

export interface StatusStudents {
	periodID: string;
	modalityID: number;
	modalityName: string;
	careerID: number;
	careerName: string;
	workingDayID: number;
	workingDayDesc: string;
	v_level: number;
	PersonMiddleName: string;
	PersonLastName: string;
	PersonFirstName: string;
}

export interface EnrollmentPost {
	personID: number;
	p_paymentOptionID: number;
	p_psychologicalTest: string;
	p_studentID: number;
}

export interface Root {
	"1": SocioeconomicForm1
	"2": SocioeconomicForm2
	"3": SocioeconomicForm3
	"4": SocioeconomicForm4
	"5": SocioeconomicForm5
	"6": SocioeconomicForm6
	"7": SocioeconomicForm7
}

export interface SocioeconomicForm1 {
	socioeconomicSheet: any;
	numberOfChildren: number;
	numberOfMen: number;
	numberOfWomen: number;
	familyInformation: FamilyInformation[];
}

export interface FamilyInformation {
	socioeconomicSheet: number;
	familyMemberNames: string;
	relationship: number;
	profession: number;
	academicLevel: number;
}

export interface SocioeconomicForm2 {
	relativesWhoDependOnTheSameIncome: RelativesWhoDependOnTheSameIncome[];
}

export interface RelativesWhoDependOnTheSameIncome {
	socioeconomicSheet: number;
	relationship: string;
	age: number;
	civilStatus: number;
	profession: number;
	income: number;
	expense: number;
}

export interface SocioeconomicForm3 {
	socioeconomicSheet: number;
	isEmployed: boolean;
	companyName: string;
	companyAddress: string;
	jobTitle: string;
	phone: string;
	workingHours: string;
	serviceTime: string;
}

export interface SocioeconomicForm4 {
	incomes: IncomeOrExpense[];
	expenses: IncomeOrExpense[];
}

export interface IncomeOrExpense {
	socioeconomicSheet: number;
	name: string;
	incomeOrExpenseId: number;
	quantity: number;
}

export interface SocioeconomicForm5 {
	socioeconomicSheet: number;
	type: number;
	address: string;
	zone: number;
	services: number[];
	numberOfMenLivingThere: number;
	numberOfWomenLivingThere: number;
}

export interface SocioeconomicForm6 {
	socioeconomicSheetID: number;
	healthTypeID: number;
}

export interface SocioeconomicForm7 {
	academicDegree: AcademicDegree[];
}

export interface Pagination {
	currentPage: number;
	totalItems: number;
	totalPages: number;
}

export interface Paginated<T> {
	data: T[];
	count: number;
}

export interface Body {
	p_personID: number;
	p_fileTypeID: number;
	p_processEnrollCode: string;
}
export interface PaymentProof {
	voucher: string;
	image: string;
	paymentDate: Date | string;
	file: File;
	fileId?: number;
}
export interface OperatorsCellular {
	operatorID: number;
	operatorName: string;
}

export interface ValidateStatus {
	p_personID: number;
	p_studentID: number;
	p_processEnrollCode: string;
	p_state: number;
	p_companyID: number;
}

export interface SeccionModulo {
	workingOrModuleID: number;
	workingOrModuleDesc: string;
	stateWM: number;
}

export interface SignatureRepeat {
	courseID: number;
	courseName: string;
}

export interface ScheduleSignatureRepeat {
	periodID: number;
	classSectionNumber: number;
	modalityID: number;
	modalityDesc: string;
	courseID: number;
	courseName: string;
	schedules: string;
}

export interface SignatureReport {
	p_periodID: number;
	p_classSectionNumber: number;
	p_studentID: number;
	p_user: string;
}

// Para body en el put
export interface ValidationStudentDocument {
	sendEmail?: boolean;
	documents: ValidationDocument[] | StudentDocument[];
}

export interface ValidationDocument extends StudentDocument {
	documentNumber: string;
	fullName: string;
	career: string;
	numberPhone: string;
	beca: string;
	transactionTypeID?: number;
	financialEntityID?: number;
	typeDocName?: string;
	paymentOptionDesc: string;
}

export enum CIVIL_STATUS {
	SOLTERO = 1,
	CASADO = 2,
	DIVORCIADO = 3,
	VIUDO = 4
}

export enum GENDER {
	MUJER = 1,
	HOMBRE = 2,
	OTRO = 3
}

export enum FILE_STATE {
	NO_FILE = 1,
	PENDING = 2,
	APPROVED = 3,
	REJECTED = 4,
	LEGALIZED = 5
}

export enum DOCUMENT_CODES {
	ITCA_UPDATE_INFORMATION = '01',
	ITCA_SOCIOECONOMIC_SHEET = '02',
	ITCA_ENROLLMENT = '04',
	ITCA_DOCUMENT = '03',
	ITCA_PROOF_PAYMENT = '05',
}

export enum COMPANY_CODES {
	ITCA = 1,
	GOLDEN = 2
}

export enum CLASS_MODULE {
	modulo_1 = 1,
	modulo_2 = 2,
	modulo_0 = 4
}

export enum SCHEDULE_TYPES {
	horas_clases = 1,
	horas_planificacion = 2,
	horas_investigacion = 3,
	horas_vinculacion = 4,
	gestion_administrativa = 5,
	tutorias = 6,
	gestion_academica = 7,
	horas_adicionales = 8
}

export enum MODALITIES {
	PRESENCIAL = 18,
	SEMIPRESENCIAL = 8
}

export interface CurrentPeriod {
	periodID: number;
	periodName: string;
}

export interface TransactionType {
	transactionTypeID: number;
	transactionTypeDesc: string;
}

export interface FinancialEntity {
	financialEntityID: number;
	financialEntityDesc: string;
}

export interface Welfare {
	periodID: number;
	period: string;
	issueDate: string;
	enrollDate: Date;
	career?: string;
	modality?: string;
	parallel: string;
	section?: string;
	levelID?: number;
	levelDesc?: string;
	personID: number;
	studentID: number;
	Names?: string;
	firstName?: string;
	lastName?: string;
	student: string;
	documentNumber: string;
	nationality?: string;
	placeOfBirth?: string;
	birthday?: string;
	age?: number;
	civilStatus?: string;
	cellPhone?: string;
	phone?: string;
	address?: string;
	email?: string;
	companyWorks?: string;
	addressCompanyWorks?: string;
	positionWork?: string;
	phoneWorks?: string;
	ageWorks?: number;
	Beca?: string;
	statusFileID?: number;
	statusFileDesc?: string;
	backgroundColor?: string;
	fontColor?: string;
	personUrlImg?: string;
	flag_SocioEconomic?: number;
}

export interface TimeAvailabilityTeacher {
	teacher: string;
	scheduleTypeName: string;
	timePrograma: number;
	timeAvailable: number;
	timeBusy: number
}

export interface TeacherFollowUp {
	amount: string;
	documentNumber: string;
	personID: number;
	teacher: string;
}

export interface OrganizationUnit {
	orgUnitID: number;
	orgUnitDesc: string;
	statusID: number;
	state: string;
	isForPracticeHours: boolean | number;
}

export interface SubjectsList {
	careerID: number;
	careerName: string;
	codeCourse: string;
	courseID: number;
	courseName: string;
	credits: string;
	cycleDesc: string;
	cycleID: number;
	degree: string;
	flgAcademic?: number;
	flgGrade?: number;
	hours: string;
	hoursTeachContact: string;
	modalityID: number;
	modalityName: string;
	parallelCode: string;
	periodID: number;
	periodName: string;
	personID: number;
	schoolID: number;
	schoolName: string;
	studyPlanDesc: string;
	studyPlanID: number;
	teacher: string;
	teacherID: number;
	classSectionNumber: number;
	classModuleDesc: string;
}

export interface confModules {
	moduleDesc: string;
	moduleID: number;
	moduleName: string;
}

export interface confMenu {
	menuExternalLink?: string;
	menuID: number;
	menuIcon?: string;
	menuModuleID: number;
	menuName: string;
	menuOrder: number;
	menuParentID?: number;
	menuUrl: string;
	moduleName: string
}

export interface usersRoles {
	PersonDocumentNumber: string;
	PersonFullName: string;
	PersonId: number;
	emailDesc: string;
	groupID: number;
	groupName: string;
	rolId: number;
	rolName: string;
	state: string;
	userId: number;
	userName: string
}

export interface Roles {
	RolName: string;
	rolDesc: string;
	rolId: number;
	stateName: number
}

export interface TypeRol {
	typeRolID: number;
	typeRolDesc: string;
	statusID: number;
	stateName: number
}

export interface Groups {
	groupDesc: string;
	groupID: number;
	groupName: string;
	state?: string;
	moduleDesc?: string;
	moduleID?: number;
}

export interface Menus {
	menuName: string;
	menuID: number;
	statusID: number;
}

export interface MenuSettings {
	PersonDocumentNumber: string;
	PersonFullName: string;
	PersonId: number;
	appName: string;
	menus: Menus;
	moduleID: number;
	moduleName: string;
	state: string;
	userId: number;
	userName: string;
}

export interface Coordinator {
	Cargo: string;
	Carrera: string;
	Coordinador: string;
	NroDocumento: string;
	careerID: number;
	dateCreated: string;
	personID: number;
	positionID: number;
	teacherID: number;
}

export interface CoordinatorList {
	PersonDocumentNumber: string;
	coordinator: string;
	careerName: string;
	careerID: number;
	dateCreated: string;
	personID: number;
	schoolID: number;
	schoolName: string;
	statusID: number;
	studyPlanDesc: string;
	studyPlanID: number;
	teacherID?: number;
	disabled?: boolean;
}

export interface Director {
	PersonDocumentNumber?: string;
	NroDocumento?: string;
	director?: string;
	Director?: string;
	numberPhone: string;
	schoolID: number;
	schoolName: string;
	personID: number;
	statusID: number;
	teacherID: number;
	Cargo?: string;
	positionID?: number;
	periodID?: number;
}

export interface User {
	PersonDocumentNumber: string;
	PersonFullName: string;
	personID: number;
	stateName: string;
	userId: number;
	userName: string;
	birthday?: string;
	numberPhone?: string;
	recoveryEmail?: string;
	statusID?: number;
	rolID: number;
	rolName: string;
}

export interface ExternalUser {
	PersonDocumentNumber: string;
	PersonFirstName: string;
	PersonFullName: string;
	PersonId: number;
	PersonLastName: string;
	PersonPhone: string;
	institutions: string;
	recoveryEmail: string;
	stateName: string;
	typeDocId: number;
	userId: number;
	userStatusId: number;
}

export interface ExternalUserInstitute {
	PersonId: number;
	admInstitutionID: number;
	collegeName: string;
	institutionID: number;
}

export interface UserByTypeRol {
	personFullName: string;
	rolName: string;
	userID: number;
	selected: boolean;
}

export interface SyllabusSubject {
	courseName: string;
	courseID?: number;
	dateCreated: string;
	periodName: string;
	periodID?: string;
	studyPlanDesc: string;
	studyPlanID?: number;
	careerID?: number;
	careerName?: string;
	cycleDesc?: string;
}

export interface Gap {
	advancePreparation: string;
	duration: number;
	fundaments: string;
	generatedProduct: string;
	numberPractice: number;
	objective: string;
	parallelCode: string;
	partialID: number;
	proceduresDevelopmentPractice: string;
	safetyRules: string;
	stateName: string;
	statusID: number;
	teacher: string;
	titleGap: string;
	tools: string;
	unitID: number;
}

export interface ResultLearning {
	periodID?:number;
	nroSequence: number;
	numberSetting: number;
	planDetailSettingDesc: string;
	subjectPlanID: number;
}

export interface Plan1Detail {
	nroSequence: number;
	numberSetting?: number;
	planDetailID: number;
	planDetailSettingDesc: string;
	resultTypeID: number;
	subjectPlanID: number;
}

export interface Plan2Detail {
	endDateUnit: string;
	hours: string;
	nroSequence: number;
	numberWeek: string;
	predecessor: number;
	settingUnitDesc: string;
	settingUnitsID: number;
	startDateUnit: string;
}

export interface Plan3Detail {
	evaluationCriteria: string;
	evaluationID: number;
	evaluationName: string;
	evaluationToolID: number;
	evaluationToolName: string;
	evaluationTypeID: number;
	evaluationTypeName: string;
	learningResultID: number;
	numberWeek: string;
	planDetailSettingDesc: string;
	productGenerated: string;
}

export interface Plan5Detail {
	bibliographyID?: number;
	titlePublicationID?: string;
	author: string;
	availabilityID: number;
	available: string;
	bibliographicTypeID: number;
	city: string;
	editorial: string;
	teacherID: number;
	title: string;
	year: string;
}

export interface Plan5Support {
	bibliographicTypeID: number;
	supportDesc: string;
	teacherID: number;
}

export interface SubjectData {
	careerID: number;
	modalityID: number;
	modalityName: string;
	numberWeek: number;
	periodID: number;
	studyPlanID: number;
	startDate?: string;
	endDate?: string;
}

export interface Schedules {
	classModuleID: number;
	classModuleDesc: string;
	endTime: string;
	fri: string;
	mon: string;
	periodID: number;
	sat: string;
	startTime: string;
	sun: string;
	thu: string;
	tue: string;
	wed: string;
}

export interface DestinySchedule {
	careerName: string;
	classroomName: string;
	courseName: string;
	cycleDesc: string;
	endTime: string;
	modalityName: string;
	parallelCode: string;
	startTime: string;
	studyPlanDesc: string;
	teacher: string;
	weekdayDesc?: string;
	classModuleID?: number;
}

export interface ScheduleModule {
	classModuleDesc: string;
	classModuleID: number;
	periodID: number;
}

export interface TermsAndConditions {
	conditionsMessageDesc: string;
	stateName: string;
	statusID: number;
	termsAndConditionsID: number;
}

export interface ItcaPayment {
	companyID: number;
	endDate: string;
	enrollTypeDesc: string;
	enrollTypeID: number;
	paymentOptionDesc: string;
	paymentOptionID: number;
	periodID: number;
	quotaNumber: number;
	startDate: string;
	state: string;
	statusID: number;
	amountEnroll: string | number;
	dues: string | number;
	discount: string | number;
	tariff: string | number;
	totalAmount: string | number;
	careerID: number;
	studyPlanID: number;
	cycleID: number;
	flgEdit?: number;
}

export interface TypeOptions {
	typeOptionsDesc: string;
	typeOptionsID: string;
}

export interface EvaluationInstrument {
	activityID: number;
	componentID: number;
	evaluationInstrumentsID: number;
	evaluationName: string;
	indications: string;
	periodID: number;
	periodName: string;
	typeEvaluationInstrumentID?: number;
	typeEvaluationDesc?: string;
	activityDesc?: string;
	componentDesc?: string;
	totalRequest?: number;
}

export interface ScaleEquivalence {
	equivalence: number;
	equivalenceDesc: string;
	evaluationInstrumentsID: number;
	evaluationName: string;
	periodID: number;
	periodName: string;
	ratingName: string;
	ratingScaleID: number;
	scaleEquivalenceID: number;
}

export interface InstrumentContent {
	contentDesc: string;
	contentInstrumentID: number;
	evaluationInstrumentsID: number;
	evaluationName: string;
	periodID: number;
	periodName: string;
	settingContentInstrumentsID: number;
}

export interface AssessmentContent {
	assessmentDesc: string;
	assessmentID: number;
	contentDesc: string;
	settingContentInstrumentsID: number;
	typeOptionsID: number;
	evaluationInstrumentsID?: number;
	contentInstrumentID?: number
}

export interface InstrumentQuestion {
	contentDesc: string;
	evaluationName: string;
	orderNumber: number;
	periodID: number;
	periodName: string;
	questionsDesc: string;
	questionsID: number;
	settingContentInstrumentsID: number;
	settingQuestionsID: number;
}

export interface UserMenu {
	userID: number;
	moduleID: number;
	menuID: number;
	rolID: number;
}

export interface InstrumentEvaluationType {
	flgActivity: number;
	flgComponent: number;
	stateName: string;
	statusID: number;
	typeEvaluationDesc: string;
	typeEvaluationInstrumentID: number;
}

export interface InstrumentEvaluationActivity {
	activityDesc: string;
	activityID: number;
	stateName: string;
	statusID: number;
}

export interface InstrumentEvaluationComponent {
	componentDesc: string;
	componentID: number;
	stateName: string;
	statusID: number;
}

export enum EVALUATION_COMPONENT {
	STUDENT_EVALUATION = 1, // Heteroevaluación para estudiantes
	SELF_EVALUATION = 2, // Autoevaluación
	COEVALUATION_BETWEEN_TEACHERS = 3,
	COEVALUATION_ADMIN = 4,
	COEVALUATION_COORDINATOR = 4,
	HETEROEVALUATION_TO_MANAGEMENT_BOSS = 5, // Heteroevaluación
	COEVALUATION_TWO_MANAGEMENT = 7, // Heteroevaluación
	// RESEARCHER_EVALUATION = 4, // Docentes investigadores
	// ENGAGEMENT_STUDENT = 5, // Estudiantes de vinculación
	// ENGAGEMENT_BENEFICIARY = 6,
}

export enum ACTIVITY_CODES {
	TEACHING = 1,
	ACADEMIC_DIRECTION_OR_MANAGEMENT = 3,
	INVESTIGATION = 4,
	ENGAGEMENT = 5
}

export interface AdministrativeStaff {
	personID: number;
	PersonFullName: string;
	PersonDocumentNumber: string;
	statusID: number;
	schoolID: number;
	careerID: number;
	positionID: number;
	positionName: string;
	disabled?: boolean;
}

export interface EvaluationInstrumentList {
	PersonId: number,
	careerName: string,
	courseName: string,
	cycleDesc: string,
	evaluationName: string,
	modalityName: string,
	parallelCode: string,
	projectPracInformativeDesc: string;
	schoolName: string,
	settingEvaluationInstrumentID: number,
	status: string,
	studentID: number,
	studyPlanDesc: string,
	teacher: string,
	teacherID: number,
}

export interface InstrumentResolve {
	careerID: number;
	careerName: string;
	contents: InstrumentContent[];
	courseID: number;
	courseName: string;
	cycleDesc: string;
	cycleID: number;
	evaluationInstrumentsID: number;
	evaluationName: string;
	indications: string;
	periodID: number;
	personID: number;
	scaleEquivalences: InstrumentScaleEquivalence[];
	settingEvaluationInstrumentID: number;
	studentID: number;
	teacher: string;
	teacherID: number;
	typePerson: number;
}

export interface InstrumentAssessment {
	assessmentDesc: string;
	assessmentID: number;
	settingAssessmentID: number
}

export interface InstrumentContent {
	assessments: InstrumentAssessment[];
	contentDesc: string;
	contentInstrumentID: number;
	questions: InstrumentContentQuestion[];
	settingContentInstrumentsID: number;
}

export interface InstrumentContentQuestion {
	questionsDesc: string;
	questionsID: number;
	settingQuestionsID: number;
}

export interface InstrumentScaleEquivalence {
	equivalence: number;
	equivalenceDesc: string;
	ratingName: string;
	scaleEquivalenceID: number;
}

export interface TypeManagement {
	stateName: string;
	statusID: number;
	typeManagementDesc: string;
	typeManagementID: number;
}

export interface DocumentManagement {
	settingDocumentManagementID: number;
	statusID: number;
	subject: string;
	typeManagementDesc: number;
	rolDesc: string;
	canEdit: number;
	documentManagementID: number;
	documentManagementDesc: string;
	documentManagementEsp: string;
	typeRolDesc: string;
}

export interface ManagementInboxSent {
	date: string;
	messages: InboxSentMessage[]
}

export interface InboxSentMessage {
	messageDetail: string;
	personName: string;
	subject: string;
	messageID: number;
	toView: number;
	reply: string;
	onlyHour: string;
}

export interface MessageManagementContent {
	addresseeName: string;
	attachments: Attachment[];
	dateSend: string;
	documentManagementDesc: string;
	documentManagementEsp: string;
	documentManagementSubject: string;
	messageID: number;
	messageManagementDetail: string;
	messageSubject: string;
	senderName: string;
	detailArea: Area[];
	addresseeNameTO?: string;
	toChain?: string;
	allPersonsTO?: PersonReceiver[];
	allAreasTO?: AreaReceiver[];
	addresseeNameCC?: string;
	ccChain?: string;
	allPersonsCC?: PersonReceiver[];
	allAreasCC?: AreaReceiver[];
	addresseeNameFWD?: string;
	fwdChain?: string;
	allPersonsFWD?: PersonReceiver[];
	allAreasFWD?: AreaReceiver[];
}

export interface PersonReceiver {
	personFullName: string;
}

export interface AreaReceiver {
	areaName: string;
}

export interface MessageReply {
	attachments: Attachment[];
	dateCreated: string;
	messageID: number;
	parentReplyID: null
	personFullName: string;
	reply: string;
	replyID: number;
	statusID: number;
	subject: string;
	userID: number;
	onlyHour: string;
}

export interface Attachment {
	file?: string;
	filePath?: string;
	fileSize?: string;
	fileType?: string;
	fileUrl: string;
	replyID?: number;
}

export interface HolidayCount {
	totalHolidays: number;
}

export interface WorkWeek {
	workDays: number;
	workWeeks: number;
}


export interface Instrument {
	FormInstrumentId: number;
	FormName: string;
	FormDescription: string;
	FormImageUrl: string;
	FormData: FormRow[];
	isDisabledSelects: number;
	selectAllSelects: number;
	evaluationTeachers: number;
	endPointGetInstrument: string;
	endPointPostResult: string;
	statusID: number;
	statusName: string;
	dateCreated: string;
	dateUpdated: string;
	userCreated: string;
	userOrigin: string;
	userUpdated: string;
	version: number;
	endPointPostReport:string;
}

export interface FormRow {
	row: number;
	fields: Field[];
}

export interface Field {
	key: string;
	type: string;
	label: string;
	required: boolean;
	dependsOn?: string;
	pathParams?: string[];
	validators?: (string | ValidatorRule)[];
	defaultValue?: number;
	optionsEndpoint?: OptionsEndpoint;
	sendForm?: boolean;
}

export interface ValidatorRule {
	rule: string;
}

export interface OptionsEndpoint {
	path: string;
	label: string;
	value: string;
}

export interface Label {
	projectDesc?: string;
	fullName?: string;
	courseName?: string;
	cycleDesc?: string;
	parallelCode?: string;
	codeProject?: string;
	position?: string;
}

export interface Contractor {
	billingAddress: string;
	billingDocumentNumber: string;
	billingDocumentType: number;
	billingEmail: string;
	billingName: string;
	billingPhone: string;
	businessAddress: string;
	businessName: string;
	businessPhone: string;
	contractorID: number;
	createBy: number;
	dateCreated: string;
	dateUpdated: string;
	isASolePropietor: number;
	quantityCollaborators: number;
	quantityResponsibles: number;
	statusID: number;
	updateBy: string;
	version: string;
	contractorName?: string;
}

export interface Collaborator {
	collaboratorID: number;
	contractorID: number;
	createBy: string;
	dateCreated: string;
	dateUpdated: string;
	emailDesc: string;
	isASolePropietor: number;
	numberPhone: string;
	personDocumentNumber: string;
	personFullName: string;
	personID: number;
	professionID: number;
	quantityCollaborators: number;
	quantityResponsibles: number;
	statusID: number;
	updateBy: string;
	userID: number;
	userName: string;
	users: [];
	version: string;
}

export interface UnacemStudentReport {
	bestGradePractice: string;
	bestGradeTheory: string;
	classSectionNumber: number;
	contractorID: number;
	contractorName: string;
	courseName: string;
	endDate: string;
	fullNameStudent: string;
	gradeInPerson: string;
	gradeInPersonRecovery: string;
	gradeTheory: string;
	gradeTheoryRecovery: string;
	inscriptionDate: string;
	lastDateInPerson: string;
	lastDateTheory: string;
	modalityName: string;
	periodID: number;
	personDocumentNumber: string;
	personID: number;
	startDate: string;
	statusGrade: string;
	students: number;
	totalApproved: string;
	totalExpired: string;
	totalFailed: string;
	totalInProgress: string;
	total: string;
	typeCategory: number;
	typeDocName: string;
	validity: number;
	validityDate: string;
	verificationDate: string;
}

export interface UnacemCourse {
	classSectionNumber: number;
	courseName: string;
	endDate: string;
	startDate: string;
	courseID: number;
}
export interface ChartJS {
  id: string;
  type: string;
  data: ChartData;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string
  backgroundColor: string;
  data: number[];
}

export interface CourseSale {
	classSectionNumber: number;
	costSection: string;
	courseID: number;
	courseName: string;
	sale: string;
	status: string;
	studentCount: number;
}

export interface CoursePercentage {
	classSectionNumber: number;
	courseID: number;
	courseName: string;
	maxVacancies: number;
	percentage: string | number;
	studentCount: number;
}

export interface InterestedPercentage {
	courseName: string;
	fullNameStudent: string;
	percentage: string | number;
}

export interface CourseStatus {
	averageApproved: string;
	courseName: string;
	overallAverage: string;
	status: string;
}

export interface CourseSaleRange {
	dayId?: number;
	dayName?: string;
	monthId?: number;
	monthName?: string;
	year?: string;
	totalSales: string;
}

export interface UnacemBlackList {
	blackListID: number;
	personDocumentNumber: string;
	personFullName: string;
	reason: string;
	state: string;
	statusID: number;
	typeDocId: number;
	typePersonCode: string;
}

export interface QRCode {
	qrCode: string;
}

export interface CourseReport {
	approved: string;
	classSectionNumber: number;
	contractors: Contractor[];
	courseName: string;
	hPresencial?: string;
	hVirtual?: string;
	expired?: string;
	failed: string;
	inProgress: string;
	periodID: number;
	totalApproved: string;
	totalExpired: string;
	totalFailed: string;
	totalInProgress: string;
	totalStudents: string;
}

export interface DesertionByPhase {
	classSectionNumber: number;
	contractors: Contractor[],
	courseName: string;
	pctWithoutInPersonExam: string;
	pctWithoutTheoryExam: string;
	periodID: number;
	studentsWithoutInPersonExam: string;
	studentsWithoutTheoryExam: string;
	totalStudents: string;
}

export interface UnacemResponsable {
	flgPersonResponsible: number;
}

export interface RetrieveAvailableSchedules {
	alert?: RetrieveAvailableAlert;
	schedules: RetrieveAvailable[];
}

export interface RetrieveAvailableAlert {
	error: number;
	message: string;
}

export interface RetrieveAvailable {
	available: number;
	busy: number;
	classSectionNumber: number;
	classModuleID: number;
	courseID: number;
	courseName: string;
	cycleID: number;
	flgCheck: number;
	flgDisabled: number;
	parallelCode: string;
	schedule: RetrieveSchedule[];
	studyPlanID: number;
	studyPlanDesc: string;
	vacancies: number;
	level: string;
	generic: number;
	failed: number;
	sectionModule: string;
	obligatory: number;
	periodID: number;
	studentID: number;
}

export interface RetrieveSchedule {
	day: string;
	startTime: string;
	endTime: string;
}
