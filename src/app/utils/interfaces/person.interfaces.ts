import { Pagination } from "./others.interfaces";

export interface Person {
	userId: number;
	userName: string;
	personId: number;
	personName: string;
	img: string;
}

export interface Charge {
	positionID: number;
	positionName: string;
}

export interface ColaboratorPosition {
	careerName: string;
	personID: number;
	positionID: number;
	positionName: string;
}

export interface SPGetPerson {
	personID: number;
	typeDocId: number;
	sex: number;
	gender: number;
	nationality: number;
	etnia: number;
	civilStatus: number;
	bloodType: number;
	birthDate: string;
	identity: string;
	email: string;
	firstName: string;
	middleName: string;
	lastName: string;
	placeResidence: string;
	birthPlace: string;
	celularPhone: string;
	housePhone: string;
	emergencyPhone: string;
	disabilityID: string;
	percentageDisability: number;
	avatar: string;
	cometaryDisability: string;
}

export interface TeacherAux {
	avatar: string;
	PersonFullName: string;
	campusID: string;
	campusName: string;
	careerID: string;
	careerName: string;
	levelID: string;
	levelName: string;
	modalityID: string;
	modalityName: string;
	personID: string;
	positionID: string;
	positionName: string;
	state: string;
	teacherID: number;
}

export interface SPGetPerson2 {
	EthnicityDesc?: string;
	personID: number;
	typeDocId: number;
	avatar: string;
	identity: string;
	firstName: string;
	middleName: string;
	lastName: string;
	userName: string;
	civilStatus: number;
	nationalityID: number;
	countryID: number;
	parishID: number;
	cantonID: number;
	provinceID: number;
	sex: number;
	gender: number;
	etnia: number;
	bloodType: number;
	birthDate: string;
	placeResidence: string;
	birthPlace: string;
	celularPhone: string;
	housePhone: string;
	emergencyPhone: string;
	email: string;
	emailRecovery: string;
	disabilityID: number;
	percentageDisability: string;
	cometaryDisability: string;
	contactName: string;
	contactAddress: string;
	nationalTownID: number;
	cellularOperator: number;
	operatorName: string;
	foreignTitle: string;
	userImg?: string;
}

export interface FileStatus {
	statusFileID: number;
	statusFileDesc: string;
	backgroundColor?: string;
	fontColor?: string;
	statusID?: number;
}

export interface EnrolledStudent {
	periodID: number;
	period: string;
	issueDate: string;
	enrollDate: Date;
	career?: string;
	modality?: string;
	parallel?: string;
	section?: string;
	levelDesc: string;
	levelID: number;
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
	personUrlImg: string;
	openOverlay?: boolean; // Para mostrar un loading en la tabla
}

export interface ConsultedStudent {
	avatar?: string;
	birthday: string;
	bloodTypeID: number;
	bloodTypeName: string;
	cantonID: number;
	cantonName: string;
	civilStatusDesc: string;
	civilStatusID: number;
	countryID: number;
	countryName: string;
	disabilityID: number;
	documentNumber: string;
	ethnicityDesc: string;
	ethnicityID: number;
	firstName: string;
	genderDesc: string;
	genderID: number;
	nationalTownDesc: string;
	nationalTownID: number;
	nationalityDesc: string;
	nationalityID: number;
	parishID: number;
	parishName: string;
	personID: number;
	provinceID: number;
	provinceName: string;
	secondSurname: string;
	sexDesc: string;
	sexID: number;
	surname: string;
	typeDocument: number;
	emailDesc: string;
	placeOfBirth: string;
	phone: string;
	phoneEmergency: string;
}

export interface AcademicalInformation {
	PersonDocumentNumber: string;
	PersonFullName: string;
	PersonId: number;
	careerID: number;
	careerName: string;
	cycle: number;
	cycleDesc: string;
	modalityID: number;
	modalityName: string;
	parallelCode: string;
	schoolID: number;
	schoolName: string;
	studentID: number;
	studyPlanDesc: string;
	studyPlanID: number;
	workingDayID: number;
	workingDayDesc: string;
}

export interface PaymentEnrolledITCAStudent {
	periodID: number;
	period: string;
	career?: string;
	modality?: string;
	personID: number;
	studentID: number;
	student: string;
	documentNumber: string;
	level: number;
	Beca?: string;
	enrollDate: Date;
}

export interface PaymentForEnrolledStudent extends FileStatus {
	periodID: number;
	period: string;
	personID: number;
	studentID: number;
	documentNumber: string;
	student: string;
	levelDesc?: string;
	levelID?: number;
	enrollDate: Date;
	career: string;
	personUrlImg: string;
	cellPhone?: string;
	phone?: string;
	modality?: string;
	Beca?: any;
	paymentOptionDesc: String;
	commentary: string;
}

export interface PaginatedStudentDetail extends Pagination {
	data: EnrolledStudent[];
}

export type PaginatedResource<T> = {
	totalItems: number;
	items: T[];
	page: number;
	size: number;
};

export interface FileStateByDepartment {
	periodID: number;
	period: string;
	career?: string;
	modality?: string;
	personID: number;
	studentID: number;
	student: string;
	documentNumber: string;
	level?: string;
	Beca?: string;
	enrollDate: Date;
	areaID: number;
	areaName: string;
	statusFileID: number;
	statusFileDesc: string;
	backgroundColor?: string;
	fontColor?: string;
}

export interface StudentSubjects {
	careerName: string;
	courseCode: string;
	courseID: number;
	courseName: string;
	levelDesc: string;
	modalityName: string;
	parallelCode: string;
	periodID: number;
	periodName: string;
	studentID: number;
	studyPlanID: number;
	teacher: string;
	teacherID: number;
}

export interface StudentTask {
	activities: StudentActivity[];
	classSectionNumber: number;
	componentID: number;
	evaluationName: string;
	periodID: number;
}

export interface StudentActivity {
	subComponentID: number;
	subComponentTypeName: string;
	taskDesc: string;
	taskName: string;
	taskID?: number;
}

export interface SearchedStudent {
	studentID: number;
	PersonId: number;
	documentNumber: string;
	PersonFirstName: string;
	PersonMiddleName: string;
	PersonLastName: string;
	fullName: string;
	email: string;
	flg_student: string;
	careerID: number;
	careerName: string;
	modalityID: number;
	modalityName: string;
	schoolID: number;
	schoolName: string;
	studyPlanDesc: string;
	studyPlanID: number;
}

export interface AcademicalHistory {
	courseCode: string;
	courseID: number;
	courseName: string;
	credits: string;
	cycleID: number;
	eq: string;
	grade: string;
	periodDesc: string;
	student: string;
	studentID: number;
}

export interface ParticipationArea {
	areaParticipationDesc: string;
	areaParticipationID: number;
}

export interface DocumentTypee {
	typeDocCode: string;
	typeDocDesc: string;
	typeDocId: number;
	typeDocLong: number;
	typeDocName: string;
}

export interface PersonType {
	typePersonCode: string;
	typePersonDesc: string;
	typePersonName: string;
}

export interface BondingLogin {
	token: string;
	user: User;
	rol: Rol;
}

export interface Rol {
	rolId: string;
	rolName: string;
}

export interface TypeRol {
	typeRolDesc: string;
	typeRolID: number;
}

export interface Department {
	areaID: number;
	areaName: string;
}

export interface DocumentManagement {
	areaID: number;
	areaName: string;
	documentManagementDesc: string;
	documentManagementEsp: string;
	documentManagementID: number;
	settingDocumentManagementID: number;
	search: boolean;
	documentManagementSubject: string;
	userSearchRolID: number;
}

export interface User {
	userId: number;
	userName: string;
	PersonId: number;
	rolName: string;
	userEmail: string;
	userImg: string;
}

export interface VerificationFirst {
	numbersessions: number;
}

export interface ChangePassword {
	p_userId: string;
	p_userPasswor: string;
	p_recoveryEmai: string;
	p_userCreate: string;
}

export interface ExternsRegister {
	p_areaParticipationID: number;
	p_typeDocId: number;
	p_personDocumentNumber: string;
	p_personFirstName: string;
	p_personMiddleName: string;
	p_personLastName: string;
	p_emailDesc: string;
	p_numberPhone: string;
	p_nameInstitucion: string;
	p_user: string;
}

export interface Agreementtype {
	agreementsDesc: string;
	agreementsID: number;
}

export interface ProgramType {
	agreementsID: number;
	programvincDesc: string;
	programvincID: number;
}

export interface ObjetiveType {
	agreementsID: number;
	objetivevincDesc: string;
	objetivevincID: number;
}

export interface Code {
	existCodeNumber: number;
}

export interface ProjectCode {
	existCodeProject: number;
}

export interface StatusAgreement {
	descStatus: string;
	orderStatus: number;
	statusagreementID: number;
}

export interface AgreementConvention {
	agreementConventionsID: number;
	agreementsDesc: string;
	agreementsID: number;
	businessPhone: string;
	bussinesName: string;
	bussinessEmail: string;
	careerID: number;
	careerName: string;
	codeNumber: string;
	enddateAgreement: string;
	initdateAgreement: string;
	legalRepresentative: string;
	position: string;
	programvincDesc: string;
	programvincID: number;
	ruc: string;
	objetivevincDesc: string;
	objetivevincID: number;
	other: string;
	responsibleName: string;
	statusAgreement: string;
	typeBusiness: string;
	urlFile: string;
}

export interface Business {
	businessPhone: string;
	bussinesName: string;
	bussinessEmail: string;
	careerDesc: string;
	careerID: number;
	enddateAgreement: string;
	enddatePractice: string;
	initdateAgreement: string;
	initdatePractice: string;
	legalRepresentative: string;
	location: string;
	periodID: number;
	periodName: string;
	position: string;
	responsibleEmail: string;
	responsibleName: string;
	responsiblePhone: string;
	responsiblePosition: string;
	ruc: string;
	tradename: string;
	typeBusiness: string;
}

export interface StudentQuotaControl {
	PersonDocumentNumber: string;
	PersonFullName: string;
	modalityName: string;
	careerName: string;
	cycleDesc: string;
	schoolName: string;
	numberPhone: string;
	studentID: number;
	totalAmount: string;
	paymentOptionID: string;
	paymentOptionDesc: string;
	maxQuotas: number;
	paidQuotas: number;
	paidQuotasInfo: Array<{
		amount: number;
		payDay: Date;
		urlFile: string;
		payDateLoad: Date;
		validateDateLoad: Date;
	}>;
}

export interface AvailableQuota {
	quota: number;
	name: string;
}

export interface Survey {
	personID: number;
	questionSolveds: number;
	surveyConfigID: number;
	surveyID: number;
}

export interface DatesHoliday {
	dateHolidays: string[];
}

export interface ProjectPracticasByModalityPractice {
	studentID: number;
	studentName: string;
	documentNumber: string;
	nameProject: string;
	modalityPracticeDesc: string;
	grade: null | number | string;
	careerName: string;
	levelName: string;
	cycleDesc: string;
	modalityName: string;
	gradeState: string;
	parallelCode: null;
	tutorTeacherID: number;
	tutorName: string;
	files: Array<{
		fileTypeName: string;
		urlFile: string;
		processTemplateID: number;
	}>;
}

export interface LibrarySpaceDetail {
	librarySpaceID: string;
	librarySpaceName: string;
	capacity: string;
}

export interface LibraryStudentDetail {
	PersonId?: number;
	careerID?: number;
	careerName?: string;
	currentCareer?: string;
	cycle?: number;
	documentNumber: number;
	stateAttendance?: number;
	studentID?: number;
	names: string;
	teacherID?: number;
}

export interface PaymentOption {
	paymentOptionDesc: string;
	paymentOptionID: number;
}

