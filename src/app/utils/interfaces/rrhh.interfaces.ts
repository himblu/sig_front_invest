export interface SPGetTeacher {
    teacherID:              number;
    personID:               number;
    PersonDocumentNumber:   string;
    PersonFullName:         string;
    numberPhone:            string;
    positionID:             number;
    positionName:           string;
    careerID:               number;
    careerName:             string;
    campusID:               number;
    campusName:             string;
    modalityID:             number;
    modalityName:           string;
    levelID:                number;
    levelName:              string;
    state:                  string;
}

export interface t {
    personID:               number;
    typeDocId:              number;
    typeDocName:            string;
    documentNumber:         string;
    lastName:               string;
    names:                  string;
    sexAbbr:                string;
    genderAbbr:             string;
    nationalityDesc:        string;
    ethnicityDesc:          string;
    civilStatusDesc:        string;
    addressDesc:            string;
    bloodTypeName:          string;
    celularPhone:           string;
    phone:                  string;
    userName:               string;
    placeDateBirth:         string;
    emergencyContact:       string;
    emergencyContactPhone:  string;
    disability:             string;
    disabilityPercentage:   string;
}

export interface Record {
    personID:           number;
    thirdLevelDegree:   string;
    recordDate:         string;
    university:         string;
    country:            number;
    recordSenescyt:     string;
    subAreaKnowledge:   string;
    type:               number;
}

export interface WorkExperience {
    personID:       number;
    institution:    string;
    workAddress:    string;
    responsibility: string;
    dateAdmission:  string;
    departureDate:  string;
    workPhone:      string;
		workName:				string;
		urlDocument:    string;
		contryID:       number;
		currentWork:    number;
    user:           string;
		type:  					string;
		sequenceNro?:   number;
}

export interface SocietyLinkage {
    societyLinkageID:           number;
    personID:                   number;
    projectName:                string;
    societyLinkageHours:        number;
    societyLinkageStartDate:    Date;
    societyLinkageEndDate:      Date;
}

export interface References {
    personID:           number;
    referenceFullName:  string;
    referencePosition:  string;
    referenceCompany:   string;
    referencePhone:     string;
}

export interface Investigation {
    investigationID:                number;
    personID:                       number;
    projectName:                    string;
    investigationInstitution:       string;
    investigationParticipantsNro:   number;
    investigationProjectPosition:   string;
}

export interface BookPublishing {
    bookPublishingID:               number;
    personID:                       number;
    bookName:                       string;
    bookPublishingDate:             Date;
    bookPublishingEditorial:        string;
    bookPublishingISBNNro:          string;
    bookPublishingParticipation:    string;
}

export interface ExperienceMatter {
    personID:       number;
    teacherName:    string;
    courseID:       number;
    courseName:     string;
    state:          string;
		statusID?: number;
}

export interface TimeAvailability {
    personID:           number;
    teacherName:        string;
    scheduleTypeID:     number;
    scheduleTypeName:   string;
    hours:              number;
    state:              string;
}

export interface Colaborator {
	PersonDocumentNumber: string;
	PersonId: number;
	dateContract: string;
	dateInit: string;
	expMatt: number;
	fullName: string;
	status: string;
	statusFileID: number;
	timeAv: number;
	typeStaffID: number;
}

export interface SustantiveFunctions {
	scheduleTypeID: number;
	scheduleTypeName: string;
	stateName: string;
	statusID: number;
}

export interface AcademicTraining {
	academicTrainingID: number;
	country: number;
	countryName: string;
	degreeName: string;
	personID: number;
	recordDate: string;
	recordSenescyt: string;
	sectorID: number;
	sectorName: string;
	subAreaKnowledge: string;
	thirdLevelDegree: string;
	type: number;
	university: string;
	urlDocument: string;
	urlSenescyt: string;
}

export interface JobExperience {
	countryID: number;
	countryName: string;
	currentWork: number;
	dateAdmission: string;
	departureDate: string;
	institution: string;
	personID: number;
	referenceName: string;
	responsibility: string;
	type: number;
	typeName: string;
	workAddress: string;
	workPhone: string;
	urlDocument: string;
}

export interface Training {
	academicTrainingID?: number;
	countryID: number;
	countryName: string;
	endDate: string;
	initDate: string;
	personID: number;
	trainingHours: number;
	trainingID?: number;
	trainingInstitution: string;
	trainingName: string;
	trainingPosition: string;
	trainingTypeID: number;
	trainingTypeName: string;
	urlDocument: string;
}

export interface ArticlePublishing {
	articleName: string;
	articlePublishingDatabaseName: string;
	articlePublishingDate: string;
	articlePublishingID: number;
	articlePublishingIndexedMagazine: number;
	magazineName: string;
	participationArticleDesc: string;
	personID: number;
	statusArticleDesc: string;
	urlWeb: string;
	urlDocument: string;
}

export interface EmployeeContract {
	areaID: number;
	areaName: string;
	branchID: number;
	branchName: string;
	costhour: string;
	dedicationsDesc: string;
	dedicationsID: number;
	employeeContrTypeID: number;
	employeeContractID: number;
	employeeContractTypeDesc: string;
	employeeTypeDesc: string;
	employeeTypeID: number;
	endDate: string;
	hoursDedications: number;
	initDate: string;
	nroContract: string;
	personID: number;
	positionID: number;
	positionName: string;
	salary: string;
	salaryCategoryDesc: string;
	salaryCategoryID: number;
	salaryScaleDesc: string;
	salaryScaleID: number;
	totalHours: number;
	typeStaffID: number;
	typeStaffName: string;
	urlDocument: string;
}

export interface CollaboratorPrev2 {
	PersonDocumentNumber: string;
	PersonFirstName: string;
	PersonId: number;
	PersonLastName: string;
	PersonMiddleName: string;
	contractDate: string;
	email: string;
	initDate: string;
	sendMail: number;
	typeDocId: number;
}

export interface Staff {
	typeStaffID: number;
	typeStaffName: string;
}

export interface Area {
	areaID: number;
	areaName: string;
	areaDesc: string;
}
