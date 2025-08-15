import { FormArray, FormControl } from '@angular/forms';
import { CareerForSection } from '@utils/interfaces/campus.interfaces';

export interface DeweyCategory {
	deweyCategoryID: string;
	name: string;
}

export interface DeweySubcategory {
	deweySubCategoryID: string;
	deweyDesc: string;
	// deweyCategory?: string;
}

export interface KnowledgeArea {
	knowledgeAreaID: string;
	knowledgeAreaDesc: string;
}

export interface KnowledgeSubarea {
	subAreaKnowledgeID: string;
	subAreaKnowledgeDesc: string;
	knowledgeArea?: string;
}

export interface KnowledgeSpecificSubarea {
	specificSubareaKnowledgeID: string;
	specificSubAreaKnowledgeDesc: string;
	// knowledgeArea?: string;
	// knowledgeSubarea?: string;
}

export interface Publication {
	publicationType: number;
	title: string;
	keywords: string[] | string;
	deweyCategory: number;
	deweySubcategory: number;
	knowledgeArea: number;
	knowledgeSubarea: number;
	knowledgeSpecificSubarea: number;
	// publicationCode: string;
	language: string;
	// inlineHasDigitalEdition: boolean;
	// inlineFile?: File;
	// inlineAuthors?: Author[];
	// inlineAuthor?: string;
	// inlinePublicationDate?: Date;
	// inlinePublicationYear?: string;
	// inlinePublicationDateIsAYear?: boolean;
	// inlineContent?: string;
	// inlineIncomeType?: number;
	// inlineEncodingName?: number;
	// inlinePublicationCode?: string;
	// inlineDescription?: string;
	// inlineSummary?: string;
	majors: number[];
	inlineStock?: PublicationStock[];
	observation?: string;
	editions?: PublicationEditionFormValue[];
	publicationSupportID?: number;
	editorials?: number[];
	availability?: number[];
	price?: number;
	urlFile?: string;
}

export interface PublicationType {
	publicationTypeID: number;
	publicationTypeDesc: string;
}

export interface SupportType {
	publicationSupportID: number;
	publicationSupportDesc: string;
	statusID: number;
}

export interface PublicationLanguage {
	languageID: number;
	languageDesc: string;
}

export interface PublicationAvailability {
	availabilityID: number;
	availabilityDesc: string;
}

export interface PublicationEditionFormValue {
	edition: string; // from a select
	hasDigitalEdition: boolean;
	file?: File; // Only when Publication has a digital edition;
	// author: string; // To search by string
	authors: number[];
	publicationDate?: Date;
	publicationYear?: string;
	publicationDateIsAYear: boolean;
	content: string;
	encodingName: string;
	publicationCode: string;
	summary?: string;
	price: number;
	observation?: string;
	createdAt?: Date;
	// editorial: string; // To search by string
	editorials: number[];
	campuses?: number[]; // To manage campusStock
	campusesStock: CampusStock[];
	availability: number[];
	majors?: number[];
	publicationSupportID?: number[];
	urlFile: string;

}

export interface PublicationIncomeType {
	incomeTypeID: number;
	incomeTypeDesc: string;
	statusID: number;
	stateName: string;
}

export interface Author {
	authorID?: number;
	authorName: string;
	nationality?: string;
	nationalityID: number;
	publications?: number;
	year?: number; // Esto no tiene sentido.
}

export interface AuthorFormValue {
	name: string;
	nationality: number;
	year?: number; // Esto no tiene sentido.
	authorId: number;
}

export interface Editorial {
	editorialID?: number;
	editorialDesc: string;
	cityCountryDesc: string;
	cityCountryID: number; // Esto no tiene sentido.
	website?: string;
	yearPublication: string; // Corregir esto en backend. No es Año del Documento.
	description?: string;
}

export interface EditorialFormValue {
	name: string;
	cityCountry: string;
	cityCountryId: number; // Esto no tiene sentido
	website?: string;
	description?: string;
	foundationYear?: string;
	editorialId?: number;
}


export type PublicationTypes = 'book' | 'magazine' | 'chapterBook' | 'doc';

export interface PublicationCondition {
	physicalQualityID: number;
	physicalQualityDesc: string;
	canBeRequested: boolean;
}

export interface CampusStock {
	campusId: number;
	campusName: string;
	stock: PublicationStock[];
}

export interface PublicationStock {
	id?: number;
	quantity: number;
	condition: number;
	incomeType: number;
}

export interface PublicationField {
	required: boolean;
	field: (keyof Publication);
}

export interface PublicationForm {
	// publicationType: FormControl<number | null>;
	title: FormControl<string | null>;
	keywords: FormControl<string[] | null>;
	deweyCategory: FormControl<number | null>;
	deweySubcategory: FormControl<number | null>;
	knowledgeArea: FormControl<number | null>;
	knowledgeSubarea: FormControl<number | null>;
	knowledgeSpecificSubarea: FormControl<number | null>;
	majors: FormControl<number[] | null>;
	inlineHasDigitalEdition?: FormControl<boolean | null>;
	publicationType: FormControl<number | null>;
	language: FormControl<string | null>;
	// inlineFile?: FormControl<File | null>;
	// inlineAuthors?: FormControl<number | null>;
	// inlineAuthor?: FormControl<string | null>;
	// inlinePublicationYear?: FormControl<string | null>;
	// inlinePublicationDate?: FormControl<Date | null>;
	// inlinePublicationDateIsAYear?: FormControl<boolean | null>;
	// inlineContent?: FormControl<string | null>;
	// inlineIncomeType?: FormControl<number | null>;
	// inlineEncodingName?: FormControl<number | null>;
	// inlinePublicationCode?: FormControl<string | null>;
	// inlineDescription?: FormControl<string | null>;
	// inlineSummary?: FormControl<string | null>;
	// inlineStock?: FormArray;
	observation?: FormControl<string | null>;
	editions?: FormArray;
	publicationSupportID: FormControl<number | null>;
	price?: FormControl<number | null>;
	authors?: FormControl<number[] | null>; // Agregar autores
	editorials?: FormControl<number[] | null>; // Agregar editoriales
	urlFile: FormControl<string | null>;
}

export interface PublicationListForm {
	search: FormControl<string | null>;
	deweyCategory?: FormControl<number | string | null>;
	deweySubcategory?: FormControl<number | string | null>;
	knowledgeArea?: FormControl<number | string | null>;
	knowledgeSubarea?: FormControl<number | string | null>;
	knowledgeSpecificSubarea?: FormControl<number | string | null>;
	majors?: FormControl<number[] | string | null>;
	publicationType?: FormControl<string | number | null>;
	status?: FormControl<string | number | null>;
	language?: FormControl<string | null>;
}

export interface PublicationListFormValue {
	search: string;
	deweyCategory: number;
	deweySubcategory: number;
	knowledgeArea: number;
	knowledgeSubarea: number;
	knowledgeSpecificSubarea: number;
	majors: number[];
	publicationType: string;
	status?: string;
}

export interface ManageEditionForm {
	editions?: FormArray;
}

export interface PublicationEditionForm {
	edition: FormControl<string | null>;
	hasDigitalEdition: FormControl<boolean | null>;
	file: FormControl<File | null>;
	author: FormControl<string | null>;
	authors: FormControl<number[] | null>;
	availability: FormControl<number[] | null>;
	publicationDate: FormControl<Date | null>;
	publicationYear: FormControl<string | null>;
	publicationDateIsAYear?: FormControl<string | null>;
	content: FormControl<string | null>;
	encodingName?: FormControl<string | null>;
	publicationCode: FormControl<string | null>;
	description?: FormControl<string | null>;
	summary: FormControl<string | null>;
	price: FormControl<number | null>;
	observation: FormControl<string | null>;
	editorial: FormControl<string | null>;
	editorials: FormControl<number[] | null>;
	campuses?: FormControl<number[] | null>;
	campusesStock?: FormArray;
}

export interface CampusStockForm {
	campusId: FormControl<number | null>;
	campusName: FormControl<string | null>;
	stock: FormArray;
}

// export interface PublicationStockDetail {
// 	incomePublicationID: number;
// 	publicationID: string;
// 	titleDesc: string;
// 	stock: number;
// 	branchID: number;
// 	branchName: string;
// 	quantity: number;
// 	incomeTypeID: number;
// 	incomeTypeDesc: string;
// 	physicalQualityID: number;
// 	physicalQualityDesc: string;
// 	loan: number;
// }
export interface PublicationStockDetail {
	incomePublicationID: number;
	incomeTypeID: number;
	physicalQualityID: number;
	quantity: number;
	branchID: number;
	realQuantity: number;
	amount: null;
	observation: null;
	requestStatusID: number;
	quantityLoan: number;
}


export interface PublicationStockForm {
	quantity: FormControl<number | null>;
	condition: FormControl<number | null>;
	incomeType: FormControl<number | null>;
	isForUpdate: FormControl<boolean | null>;
	// isForUpdate Se utiliza para no mostrar el botón de eliminar.
	// Si se está creando una publicación, estaba debe estar en false.
	// Cuando se actualiza una publicación, debe estar en true. Y el botón de eliminar debe tener un ngif
	// Con la condición isForUpdate.value
	borrowedItems?: FormControl<number | null>;
}

export interface AuthorListForm {
	search: FormControl<string | null>;
	country: FormControl<number | null>;
}

export interface EditorialForm {
	name: FormControl<string | null>;
	cityCountry: FormControl<string | null>;
	country?: FormControl<number | null>;
	website: FormControl<string | null>;
	foundationYear: FormControl<string | null>;
	description: FormControl<string | null>;
}

export interface EditorialListForm {
	search: FormControl<string | null>; // By name, foundationYear
	country: FormControl<number | null>;
}

export interface AuthorForm {
	name: FormControl<string | null>;
	nationality?: FormControl<number | null>;
}

export interface PublicationBody {
	deweySubCategoryID: number;
	specificSubAreaKnowledgeID: number;
	languageDesc: string;
	title: string;
	titleDesc: string;
	estimatedCost: number;
	authorID: number[];
	publicationTypeID: number;
	edition: string;
	publicationYear: string;
	codeISBN: string;
	keywords: string;
	content: string;
	summary: string;
	observation: string;
	editorials: number[];
	majors: number[];
	availability: number[];
	income: StockPublicationBody[];
	publicationSupportID: number;
	urlFile: string;
}

export interface StockPublicationBody {
	title?: string;
	codeUUID?: string;
	branchID: number;
	incomeTypeID: number;
	physicalQualityID: number;
	quantity: number;
}

export interface PublicationBodyToUpdate {
	title?: string;
	publicationID: string;
	specificSubareaKnowledgeID: number;
	languageDesc: string;
	keywords: string;
	content: string;
	summary: string;
	edition: string;
	codeISBN: string;
	publicationYear: string;
	commentary: string;
	income?: StockPublicationBody[];
	majors?: number[];
	publicationSupportID?: number;
	editorials?: number[];
	availability?: number[];
	price?: number;
	urlFile?: string;
}

export interface PublicationView extends PublicationType {
	titlePublicationID: string;
	publicationID: string;
	deweySubCategoryID: number;
	specificSubareaKnowledgeID: number;
	title: string;
	estimatedCost: number;
	codeDeweySubCategory: string;
	deweySubcategory: string;
	deweyCategoryID: number;
	nameDewey: string;
	deweyCodeInternal: string;
	edition: string;
	publicationYear: number;
	codeISBN: string;
	keywords: string;
	content: string;
	summary: string;
	stock: number;
	observation: string;
	dateCreated: Date;
	dateUpdated: Date;
	specificSubAreaKnowledgeDesc: string;
	subAreaKnowledgeID: number;
	subAreaKnowledgeDesc: string;
	knowledgeAreaID: number;
	knowledgeAreaDesc: string;
	authors: Author[];
	author: string;
	editorials: Editorial[];
	editorial: string;
	careers: CareerForSection[];
	availability: PublicationAvailability[];
	languageID: number;
	languageDesc: string;
	statusID: number;
	publicationSupportID?: number;
	careersIds?: string;
	incomePublication?: any;
	urlFile?: string;
}

export interface PublicationRequestForm {
	applicantType: FormControl<number | null>;
	applicantId: FormControl<number | null>; // personID
	searchApplicantIdentification: FormControl<string>;
	depositType: FormControl<number | null>;
	observation?: FormControl<string>;
	requestStatusID: FormControl<number>;
	requestedPublications: FormArray;
}

export interface PublicationRequest {
	applicantType: number;
	applicantId: number;
	searchApplicantIdentification: string;
	depositType: string;
	observation?: string;
	requestedPublications: PublicationRequestDetail[];
	requestStatusID: number;
	personID?:number;
	studentID?:number;
}

export interface PublicationRequestDetail {
	publication: Publication;
	publicationId: number;
	condition: number;
	dueDate: string;
	dueDateString: string;
	dueHour: string;
	requestStatus: number;
}

export interface RequestedPublicationForm {
	publication: FormControl<PublicationView>;
	publicationId: FormControl<string>;
	condition: FormControl<number | null>;
	dueDate: FormControl<Date | string | null>;
	dueDateString: FormControl<string | null>;
	dueHour: FormControl<string | null>;
	requestStatus: FormControl<number | null>;
}

export enum FILE_STATE {
	STUDENT = 1,
	TEACHER = 2,
	ADMINISTRATIVE = 3,
	SERVICE = 4,
	EXTERN = 5
}

export interface ApplicantType {
	applicantTypeID: number;
	applicantTypeDesc: string;
}

export interface DepositType {
	warrantyID: number;
	warrantyDesc: string;
}

export interface Applicant {
	personID: number;
	documentNumber: string;
	careerDesc: string
	modalityName: string;
	names: string;
	lastName: string;
	parellel: string;
	officeLocation: string;
	teacherCategory: string;
	positionName: string;
	dedicationsDesc: string;
	numberPhone: string;
	emailDesc: string;
	studentID?:number;
}

export interface RequestPublicationBody {
	typeRequestID: number;
	institutionAgreementID?: number;
	personID: number;
	applicantTypeID: number;
	commentary: string;
	agreement: string;
	requestStatusID?: number;
	warrantyID: string;
	loanPublication: {
		publicationID: number;
		physicalQualityID: number;
		quantity: number;
		dateDelivery: string;
		requestStatusID: number;
	}[];
	studentID?:number;
}

export interface RequestedPublicationDetail extends PublicationStatus {
	requestID: number;
	titlePublicationID: string;
	title: string;
	edition: string;
	quantity: number;
	dateDelivery: Date;
	dateReturn: Date;
	deweyCodeInternal: string;
	careerName: string;
	codeISBN?: string;
	publicationYear?: string;
	publicationID: string;
	amount?: number;
	observation?: string;
	dateLoan?: Date;
	loanPublicationID: number;
	openOverlay?: boolean;
	openOverlayReturnForm?: boolean;
	showObservationOverlay?: boolean;
}

export interface RequestedPublicationByApplicant extends RequestedPublicationDetail {
	requestedPublication?: RequestedPublication;
}

export interface RequestedPublication {
	requestID: number;
	documentNumber: string;
	names: string;
	surname: string;
	secondSurname: string;
	numberPhone: string;
	email: string;
	modalityName: string;
	careerName: string;
	officeLocation: string;
	teacherCategory: boolean;
	positionName: string;
	requestStatusID: number;
	dedicationsDesc: string;
	dateRequest: Date;
	openOverlay?: boolean; // Para mostrar un loading
	publications?: RequestedPublicationDetail[];
	backgroundColor?: string;
	requestStatusName?: string;
}

export interface PublicationStatus {
	requestStatusName: string;
	requestStatusID: number;
	backgroundColor: string;
	fontColor: string;
}

export enum REQUESTED_PUBLICATION_STATUS {
	PENDING = 1,
	APPROVED = 2,
	CANCELED_BY_SYSTEM = 3,
	REJECTED = 4,
	ENDED = 5,
	CANCELED_BY_APPLICANT = 6
}

export enum APPLICANT_TYPE {
	STUDENT = 'ESTUDIANTE',
	TEACHER = 'DOCENTE',
	ADMINISTRATIVE = 'ADMINISTRATIVO',
	SERVICES = 'SERVICIOS',
	EXTERNAL = 'EXTERNOS'
}

export interface UpdateRequestPublicationBody {
	requestID: number;
	statusRequestID: number;
	commentary?: string;
}

export interface UpdateRequestPublicationDetailBody {
	loanPublicationID: number;
	statusRequestID: number;
	commentary?: string;
}

export interface ReturnRequestPublicationDetailBody {
	loanPublicationID: number;
	returnPhysicalQualityID: number;
	dateReturn: string;
	commentary?: string;
}
