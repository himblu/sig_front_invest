import { DatePipe } from "@angular/common";
import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { SortDirection } from "@angular/material/sort";
import { environment } from "@environments/environment";
import { Utils } from "@utils/index";
import {
	EventForm,
	IEvent,
	PostUpdateEvent,
} from "@utils/interfaces/calendar.interface";
import {
	AttendanceTeacher,
	MajorSchool,
	Parallel,
	School,
	StudentActivities,
	StudentGrades,
} from "@utils/interfaces/campus.interfaces";
import {
	Applicant,
	ApplicantType,
	Author,
	AuthorFormValue,
	DeweyCategory,
	DeweySubcategory,
	Editorial,
	EditorialFormValue,
	KnowledgeArea,
	KnowledgeSpecificSubarea,
	KnowledgeSubarea,
	Publication,
	PublicationAvailability,
	PublicationBody,
	PublicationBodyToUpdate,
	PublicationCondition,
	PublicationIncomeType,
	PublicationLanguage,
	PublicationRequest,
	PublicationStatus,
	PublicationStockDetail,
	PublicationType,
	PublicationView,
	RequestedPublication,
	RequestedPublicationByApplicant,
	RequestedPublicationDetail,
	RequestPublicationBody,
	ReturnRequestPublicationDetailBody, SupportType,
	UpdateRequestPublicationBody,
	UpdateRequestPublicationDetailBody,
} from "@utils/interfaces/library.interface";
import {
	AssessmentContent,
	COMPANY_CODES,
	Coordinator,
	CoordinatorList,
	CoursePercentage,
	CourseReport,
	CourseSale,
	CourseSaleRange,
	CourseStatus,
	CurrentPeriod,
	DesertionByPhase,
	DestinySchedule,
	Director,
	DOCUMENT_CODES,
	EvaluationInstrument,
	EvaluationInstrumentList,
	FinancialEntity,
	Instrument,
	InstrumentContent,
	InstrumentQuestion,
	InstrumentResolve,
	InterestedPercentage,
	ItcaPayment,
	OrganizationUnit,
	Paginated,
	ScaleEquivalence,
	ScheduleModule,
	Schedules,
	SPGetFileState,
	StudentDocument,
	SubjectsList,
	TransactionType,
	TypeOptions,
	ValidationDocument,
	ValidationStudentDocument,
	Welfare,
} from "@utils/interfaces/others.interfaces";
import {
	ComponentPeriod,
	LibrarySpace,
	LibrarySpaceAttendance,
	Partial,
	Period,
	SettingTaskPractice,
	SettingTaskPracticeFlag,
	SettingTasks,
	SubComponent,
	SubComponentType,
	Tables,
	Task,
} from "@utils/interfaces/period.interfaces";
import {
	AvailableQuota,
	DatesHoliday,
	Department,
	DocumentManagement,
	EnrolledStudent,
	FileStateByDepartment,
	FileStatus,
	LibrarySpaceDetail,
	LibraryStudentDetail,
	PaginatedResource,
	PaymentEnrolledITCAStudent,
	PaymentOption,
	ProjectPracticasByModalityPractice,
	StudentQuotaControl,
	StudentSubjects,
	StudentTask,
	TypeRol,
} from "@utils/interfaces/person.interfaces";
import { map, Observable } from "rxjs";

@Injectable({
	providedIn: "root",
})
export class ApiService {
	// private apiURL: string = `http://localhost:3000`;
	private apiURL: string = `${environment.url}`;
	private http: HttpClient = inject(HttpClient);
	private datePipe: DatePipe = inject(DatePipe);
	public event: StudentActivities;
	constructor() { }

	public getStudentsForPaymentReport(
		pageIndex: number,
		pageSize: number = 10,
		filter: string = "",
		sortBy?: string,
		sortType: SortDirection = "desc"
	): Observable<PaginatedResource<PaymentEnrolledITCAStudent>> {
		const relativeUrl: string = `/api/report/payment-enrolled-itca-student?page=${pageIndex}&${pageSize ? `size=${pageSize}` : ""
			}
      ${filter ? `&filter=${filter}` : ""}${sortType && sortBy ? `&sort=${sortBy}:${sortType}` : ""
			}`;
		return this.http.get<PaginatedResource<PaymentEnrolledITCAStudent>>(
			`${this.apiURL}${relativeUrl}`
		);
	}

	public getEnrolledStudents(
		pageIndex: number,
		pageSize: number = 10,
		filter: string = "",
		sortBy?: string,
		sortType: SortDirection = "desc"
	): Observable<PaginatedResource<EnrolledStudent>> {
		const relativeUrl: string = `/api/report/enrolled-itca-student?page=${pageIndex}&${pageSize ? `size=${pageSize}` : ""
			}
      ${filter ? `&filter=${filter}` : ""}${sortType && sortBy ? `&sort=${sortBy}:${sortType}` : ""
			}`;
		return this.http.get<PaginatedResource<EnrolledStudent>>(
			`${this.apiURL}${relativeUrl}`
		);
	}

	public getEnrolledStudentsSP(
		pageIndex: number,
		pageSize: number = 10,
		periodID: number,
		careerID: number,
		statusFileID: number,
		filter: string = "",
		sortBy?: string,
		sortType: SortDirection = "desc"
	): Observable<PaginatedResource<EnrolledStudent>> {
		const relativeUrl: string = `/api/report/enrolled-itca-student-sp?page=${pageIndex}&${pageSize ? `size=${pageSize}` : ""
			}${sortType && sortBy ? `&sort=${sortBy}:${sortType}` : ""
			}${`&periodID=${periodID}`}${`&careerID=${careerID}`}
			${`&statusFileID=${statusFileID}`}${`&filter=${filter}`}`;
		return this.http.get<PaginatedResource<EnrolledStudent>>(
			`${this.apiURL}${relativeUrl}`
		);
	}

	public getWelfares(
		pageIndex: number,
		pageSize: number = 10,
		filter: string = "",
		sortBy?: string,
		sortType: SortDirection = "desc"
	): Observable<PaginatedResource<Welfare>> {
		const relativeUrl: string = `/api/report/welfare?page=${pageIndex}&${pageSize ? `size=${pageSize}` : ""
			}
      ${filter ? `&filter=${filter}` : ""}${sortType && sortBy ? `&sort=${sortBy}:${sortType}` : ""
			}`;
		return this.http.get<PaginatedResource<Welfare>>(
			`${this.apiURL}${relativeUrl}`
		);
	}

	public getWelfaresSp(
		pageIndex: number,
		pageSize: number = 10,
		periodID: number,
		careerID: number,
		statusFileID: number,
		filter: string = "",
		sortBy?: string,
		sortType: SortDirection = "desc"
	): Observable<PaginatedResource<Welfare>> {
		const relativeUrl: string = `/api/report/welfare-sp?page=${pageIndex}&${pageSize ? `size=${pageSize}` : ""
			}${sortType && sortBy ? `&sort=${sortBy}:${sortType}` : ""
			}${`&periodID=${periodID}`}${`&careerID=${careerID}`}
			${`&statusFileID=${statusFileID}`}${`&filter=${filter}`}`;
		return this.http.get<PaginatedResource<Welfare>>(
			`${this.apiURL}${relativeUrl}`
		);
	}

	public getFileStatesByDepartment(
		filter: string = ""
	): Observable<FileStateByDepartment[]> {
		const relativeUrl: string = `/api/report/file-state-by-department?${filter ? `&filter=${filter}` : ""
			}`;
		return this.http.get<FileStateByDepartment[]>(
			`${this.apiURL}${relativeUrl}`
		);
	}

	public getWelfareFilesStates(
		filter: string = ""
	): Observable<FileStateByDepartment[]> {
		const relativeUrl: string = `/api/report/welfare-state?${filter ? `&filter=${filter}` : ""
			}`;
		return this.http.get<FileStateByDepartment[]>(
			`${this.apiURL}${relativeUrl}`
		);
	}

	public getPartialsByPeriod(periodID: number): Observable<Partial[]> {
		return this.http.get<Partial[]>(
			`${this.apiURL}/api/component/period/${periodID}`
		);
	}

	public getActivities(): Observable<SubComponentType[]> {
		return this.http.get<SubComponentType[]>(
			`${this.apiURL}/api/type-sub-component`
		);
	}

	public getPeriods(): Observable<Paginated<Period>> {
		return this.http.get<Paginated<Period>>(`${this.apiURL}/api/period`);
	}

	public getItcaPeriods(): Observable<Period[]> {
		return this.http.get<Period[]>(`${this.apiURL}/api/period`);
	}

	public getFileStatuses(): Observable<FileStatus[]> {
		return this.http.get<FileStatus[]>(`${this.apiURL}/api/file/state`);
	}

	public postStudentDocument(fileType: number, file: File): Observable<any> {
		const formData: FormData = new FormData();
		formData.append("file", file);
		return this.http.post(
			`${this.apiURL}/api/file/docs/2/${fileType}`,
			formData
		);
	}

	public getStudentDocuments(student: number): Observable<StudentDocument[]> {
		return this.http
			.get<StudentDocument[]>(`${this.apiURL}/api/file/person/${student}/1`)
			.pipe(
				map((studentDocuments: StudentDocument[]) => {
					return studentDocuments.map((item) => ({
						...item,
						urlFile: `${this.apiURL}/${item.urlFile}`,
					}));
				})
			);
	}

	public getStudentDocumentsITCA(): Observable<StudentDocument[]> {
		const personId = sessionStorage.getItem('id');
		const studentId = sessionStorage.getItem('studentID');
		return this.http.get<StudentDocument[]>(`${this.apiURL}/api/file/person/process/${personId}/1/03/${studentId}`).pipe(
			map((studentDocuments: StudentDocument[]) => {
				return studentDocuments.map((item) => ({
					...item,
					urlFile: `${this.apiURL}/${item.urlFile}`
				}));
			})
		);
	}

	public getPersonImage(personID: number, rute: string): Observable<Blob> {
		return this.http.get(`${this.apiURL}/api/file/view/${personID}/${rute}`, {
			responseType: "blob",
		});
	}

	public getEmployeeImage(rute: string): Observable<Blob> {
		return this.http.get(`${this.apiURL}/api/file/view-employee/${rute}`, {
			responseType: "blob",
		});
	}

	public getTeacherImage(url: string): Observable<Blob> {
		return this.http.get(`${this.apiURL}/${url}`, {
			responseType: "blob",
		});
	}

	public getPdfContent(url: string): Observable<HttpResponse<Blob>> {
		const headers = new HttpHeaders();
		return this.http.get(url, {
			headers,
			observe: "response",
			responseType: "blob",
		});
	}

	public postPdfContent(url: string, body: any): Observable<HttpResponse<Blob>> {
		const headers = new HttpHeaders();
		return this.http.post(url, body, {
			headers,
			observe: "response",
			responseType: "blob",
		});
	}

	public getCollaboratorPdfContent(
		personId: number
	): Observable<HttpResponse<Blob>> {
		const headers = new HttpHeaders();
		return this.http.get(
			`${this.apiURL}/api/collaborator/person-profile/${personId}`,
			{ headers, observe: "response", responseType: "blob" }
		);
	}

	public getEnrollReport(
		periodID: number,
		careerID: number,
		studyPlanID: number,
		cycleID: number,
		parallelCode: string
	): Observable<HttpResponse<Blob>> {
		const headers = new HttpHeaders();
		return this.http.get(
			`${this.apiURL}/api/enroll/reports/list/${periodID}/${careerID}/${studyPlanID}/${cycleID}/${parallelCode}`,
			{ headers, observe: "response", responseType: "blob" }
		);
	}

	public getEnrollExcel(
		periodID: number,
		careerID: number,
		studyPlanID: number,
		cycleID: number,
		parallelCode: string
	): Observable<HttpResponse<Blob>> {
		const headers = new HttpHeaders();
		return this.http.get(
			`${this.apiURL}/api/academic-reports/students-all-grade-excel/${periodID}/${careerID}/${studyPlanID}/${cycleID}/${parallelCode}`,
			{ headers, observe: "response", responseType: "blob" }
		);
	}

	public getNotesReport(
		periodID: number,
		careerID: number,
		studyPlanID: number,
		cycleID: number,
		parallelCode: string
	): Observable<HttpResponse<Blob>> {
		const headers = new HttpHeaders();
		return this.http.get(
			`${this.apiURL}/api/academic-reports/students-all-grade/${periodID}/${careerID}/${studyPlanID}/${cycleID}/${parallelCode}`,
			{ headers, observe: "response", responseType: "blob" }
		);
	}

	public getAcademicReportReport(
		studentID: number
	): Observable<HttpResponse<Blob>> {
		const headers = new HttpHeaders();
		return this.http.get(
			`${this.apiURL}/api/student/record-academic/${studentID}`,
			{ headers, observe: "response", responseType: "blob" }
		);
	}

	public excelStudentReport(
		periodID: number,
		statusFileID: number
	): Observable<HttpResponse<Blob>> {
		const headers = new HttpHeaders();
		return this.http.get(
			`${this.apiURL}/api/enroll/reports/students-enroll/${periodID}/${statusFileID}`,
			{ headers, observe: "response", responseType: "blob" }
		);
	}

	// Reporte para imprimir los pagos.
	public getPdfProofPayments(
		period: number,
		startDate: string,
		endDate: string,
		typeBecaID: number,
		company = COMPANY_CODES.ITCA
	): Observable<HttpResponse<Blob>> {
		const headers = new HttpHeaders();
		return this.http.get(
			`${this.apiURL}/api/enroll/reports/payments/${period}/${startDate}/${endDate}/${company}/${typeBecaID}`,
			{ headers, observe: "response", responseType: "blob" }
		);
	}

	public putValidateStudentDocuments(
		body: ValidationStudentDocument
	): Observable<any> {
		return this.http.put<any>(`${this.apiURL}/api/file/documents`, body);
	}

	public getValidationDocuments(person: number, period: number, company: COMPANY_CODES, process: DOCUMENT_CODES, studentId: number): Observable<ValidationDocument[]> {
		return this.http.get<ValidationDocument[]>(`${this.apiURL}/api/file/student/${person}/${period}/${company}/${process}/${studentId}`)
			.pipe(
				map((studentDocuments: ValidationDocument[]) => {
					return studentDocuments.map((item) => ({
						...item,
						urlFile: `${this.apiURL}/${item.urlFile}`
					}));
				})
			);
	}

	putFileDocs(body: any): Observable<any> {
		return this.http.put<any>(`${this.apiURL}/api/collaborator/files`, body);
	}

	public getEvaluations(): Observable<any> {
		return this.http.get(`${this.apiURL}/api/component/evaluation`);
	}

	public postInstrumentConfiguration(configuration: any): Observable<any> {
		// const body: BodyToSetInstrument[] = Utils.bodyToCreateInstrumentConfiguration(configuration);
		// console.log(body);
		// return of([]);
		return this.http.post<EvaluationInstrument[]>(
			`${this.apiURL}/api/setting-evaluation`,
			{ news: configuration }
		);
	}
	// public postInstrumentConfiguration(body: any[]) {
	// 	return this.http.post<EvaluationInstrument[]>(`${this.apiURL}/api/setting-evaluation`, { news: body });
	// }

	public getEvaluationInstruments(
		periodID: number,
		evaluationOrFollowup: number
	): Observable<EvaluationInstrument[]> {
		return this.http.get<EvaluationInstrument[]>(
			`${this.apiURL}/api/evaluation-instr/list/${periodID}/${evaluationOrFollowup}`
		);
	}

	public getEvaluationInstrumentsByPeriodAndComponent(
		period: number,
		component: number,
		activity: number
	) {
		return this.http.get<EvaluationInstrument[]>(
			`${this.apiURL}/api/evaluation-instr/byComponent/${period}/${component}/${activity}`
		);
	}

	public getEvaluationInstrumentsByPeriod(
		period: number
	): Observable<EvaluationInstrument[]> {
		return this.http.get<EvaluationInstrument[]>(
			`${this.apiURL}/api/evaluation-instr/byPeriod/${period}`
		);
	}

	public getScalesEquivalence(
		periodID: number,
		evaluationInstrumentsID: number
	): Observable<ScaleEquivalence[]> {
		return this.http.get<ScaleEquivalence[]>(
			`${this.apiURL}/api/scale-equivalence/${periodID}/${evaluationInstrumentsID}`
		);
	}

	public getEvaluationInstrumentsByID(
		periodID: number,
		evaluationInstrumentsID: number
	): Observable<EvaluationInstrument[]> {
		return this.http.get<EvaluationInstrument[]>(
			`${this.apiURL}/api/evaluation-instr/${periodID}/${evaluationInstrumentsID}`
		);
	}

	public getInstrumentContents(
		periodID: number,
		evaluationInstrumentsID: number
	): Observable<InstrumentContent[]> {
		return this.http.get<InstrumentContent[]>(
			`${this.apiURL}/api/content-instruments/setting/${evaluationInstrumentsID}/${periodID}`
		);
	}

	public getAssessmentContents(
		contentInstrumentID: number
	): Observable<AssessmentContent[]> {
		return this.http.get<AssessmentContent[]>(
			`${this.apiURL}/api/assessment/by-contents/${contentInstrumentID}`
		);
	}

	public getInstrumentsQuestions(
		evaluationInstrumentsID: number,
		contentInstrumentID: number
	): Observable<InstrumentQuestion[]> {
		return this.http.get<InstrumentQuestion[]>(
			`${this.apiURL}/api/question-instruments/setting-by-instruments/${evaluationInstrumentsID}/${contentInstrumentID}`
		);
	}

	public getConfiguredInstruments(
		period?: number
	): Observable<InstrumentQuestion[]> {
		return this.http.get<InstrumentQuestion[]>(
			`${this.apiURL}/api/question-instruments?${period ? `period=${period}` : ""
			}`
		);
	}

	public postEvaluationInstrument(body: any) {
		return this.http.post(`${this.apiURL}/api/evaluation-instr`, body);
	}

	public putEvaluationInstrument(body: any) {
		return this.http.put(`${this.apiURL}/api/evaluation-instr`, body);
	}

	public postRatingScales(body: any) {
		return this.http.post(`${this.apiURL}/api/rating-scales`, body);
	}

	public postEquivalenceScales(body: any) {
		return this.http.post(`${this.apiURL}/api/scale-equivalence`, body);
	}

	public putEquivalenceScales(body: any) {
		return this.http.put(`${this.apiURL}/api/scale-equivalence`, body);
	}

	public postInstrumentsContent(body: any) {
		return this.http.post(`${this.apiURL}/api/content-instruments`, body);
	}

	public putInstrumentsContent(body: any) {
		return this.http.put(`${this.apiURL}/api/content-instruments`, body);
	}

	public postInstrumentsContentSettings(body: any) {
		return this.http.post(
			`${this.apiURL}/api/content-instruments/setting`,
			body
		);
	}

	public postAssessment(body: any) {
		return this.http.post(`${this.apiURL}/api/assessment`, body);
	}

	public putAssessment(body: any) {
		return this.http.put(`${this.apiURL}/api/assessment`, body);
	}

	public postAssessmentSettings(body: any) {
		return this.http.post(`${this.apiURL}/api/assessment/setting`, body);
	}

	public postInstrumentsQuestions(body: any) {
		return this.http.post(`${this.apiURL}/api/question-instruments`, body);
	}

	public putInstrumentsQuestions(body: any) {
		return this.http.put(`${this.apiURL}/api/question-instruments`, body);
	}

	public putAcademicEvent(body: any) {
		return this.http.put(`${this.apiURL}/api/calendar/event-academic`, body);
	}

	public putAdminEvent(body: any) {
		return this.http.put(`${this.apiURL}/api/calendar/event-admin`, body);
	}

	public postInstrumentsQuestionsSettings(body: any) {
		return this.http.post(
			`${this.apiURL}/api/question-instruments/setting`,
			body
		);
	}

	public postParallelChange(body: any) {
		return this.http.post(
			`${this.apiURL}/api/internal-recognition/change-parallel`,
			body
		);
	}

	public postStudentExternal(body: any) {
		return this.http.post(`${this.apiURL}/api/student/external`, body);
	}

	public postStudentInfo(body: any) {
		return this.http.post(`${this.apiURL}/api/person-inf`, body);
	}

	public postStudentDetailInfo(body: any) {
		return this.http.post(`${this.apiURL}/api/student`, body);
	}

	public sendExternalEmail(personId: number) {
		return this.http.get(`${this.apiURL}/api/administrative-external/email/${personId}`);
	}

	public postUser(body: any) {
		return this.http.post(`${this.apiURL}/api/user`, body);
	}

	public postUserRol(body: any) {
		return this.http.post(`${this.apiURL}/api/user-rol`, body);
	}

	public postUserGroup(body: any) {
		return this.http.post(`${this.apiURL}/api/group-user`, body);
	}

	public postPartials(body: any) {
		return this.http.post(`${this.apiURL}/api/component`, body);
	}

	public postGrades(body: any) {
		return this.http.post(`${this.apiURL}/api/sub-component`, body);
	}

	public postSettingTasks(body: any) {
		return this.http.post(`${this.apiURL}/api/settings-tasks`, body);
	}

	public postSettingTasksGrade(body: any) {
		return this.http.post(`${this.apiURL}/api/settings-tasks/grade`, body);
	}

	public putSettingTasksGrade(body: any) {
		return this.http.put(`${this.apiURL}/api/settings-tasks/grade`, body);
	}

	public postCoordinator(body: any) {
		return this.http.post(`${this.apiURL}/api/coordinator/career`, body);
	}

	public postDirector(body: any) {
		return this.http.post(`${this.apiURL}/api/school-director`, body);
	}

	public getLibrarySpace(filter: string,	page: number,	limit: number = 10): Observable<Paginated<LibrarySpace>> {
		return this.http.get<Paginated<LibrarySpace>>(
			`${this.apiURL}/api/library-spaces?page=${page}&limit=${limit}&filter=${filter}`
		);
	}

	public getLibrarySpaceAttendance(userID: number, librarySpaceID: number, initDate: string, endDate: string, filter: string,	page: number,	limit: number = 10): Observable<Paginated<LibrarySpaceAttendance>> {
		return this.http.get<Paginated<LibrarySpaceAttendance>>(
			`${this.apiURL}/api/library-spaces-attendance/${userID}/${librarySpaceID}/${initDate}/${endDate}?page=${page}&limit=${limit}&filter=${filter}`
		);
	}

	public putLibrarySpacesPassword(body: any) {
		return this.http.put(`${this.apiURL}/api/library-spaces/change-password`, body);
	}

	public postLibrarySpaces(body: any) {
		return this.http.post(`${this.apiURL}/api/library-spaces`, body);
	}

	public putLibrarySpaces(body: any) {
		return this.http.put(`${this.apiURL}/api/library-spaces`, body);
	}

	public putLibrarySpaceState(body: any) {
		return this.http.put(`${this.apiURL}/api/library-spaces/disable-enable`, body);
	}

	public putSettingTasks(body: any) {
		return this.http.put(`${this.apiURL}/api/settings-tasks`, body);
	}

	public getSettingTasks(
		periodID: number,
		personID: number,
		courseID: number,
		careerID: number,
		parallelCode: string,
		limit: number = 10,
		page: number = 1,
		componentID?: number
	): Observable<Paginated<SettingTasks>> {
		return this.http.get<Paginated<SettingTasks>>(
			`${this.apiURL}/api/settings-tasks/${periodID}/${personID}/${courseID}/${careerID}/${parallelCode}?limit=${limit}&page=${page}&component=${componentID}`
		);
	}

	public putGrades(body: any) {
		return this.http.put(`${this.apiURL}/api/sub-component`, body);
	}

	public putPartials(body: any) {
		return this.http.put(`${this.apiURL}/api/component`, body);
	}

	public putGradable(body: any) {
		return this.http.put(`${this.apiURL}/api/settings-tasks/gradable`, body);
	}

	public getPartials(
		periodID: number,
		limit: number = 10,
		page: number = 1
	): Observable<Paginated<Partial>> {
		return this.http.get<Paginated<Partial>>(
			`${this.apiURL}/api/component/${periodID}?limit=${limit}&page=${page}`
		);
	}

	public getComponentGrades(periodID: number): Observable<ComponentPeriod[]> {
		return this.http.get<ComponentPeriod[]>(
			`${this.apiURL}/api/component/grade/${periodID}`
		);
	}

	public getSubComponent(
		periodID: number,
		componentID: number
	): Observable<SubComponent[]> {
		return this.http.get<SubComponent[]>(
			`${this.apiURL}/api/sub-component/${periodID}/${componentID}`
		);
	}

	public getSettingsTasksPractice(
		componentID: number,
		periodID: number,
		schoolID: number,
		careerID: number,
		studyPlanID: number,
		courseID: number
	): Observable<SettingTaskPractice[]> {
		return this.http.get<SettingTaskPractice[]>(
			`${this.apiURL}/api/settings-tasks/practice/${componentID}/${periodID}/${schoolID}/${careerID}/${studyPlanID}/${courseID}`
		);
	}

	public getSettingsTasksPracticeFlag(
		careerID: number,
		studyPlanID: number,
		courseID: number
	): Observable<SettingTaskPracticeFlag> {
		return this.http.get<SettingTaskPracticeFlag>(
			`${this.apiURL}/api/settings-tasks/practice-flag/${careerID}/${studyPlanID}/${courseID}`
		);
	}

	public getSettingsTasksByActivitie(
		periodID: number,
		personID: number,
		componentID: number,
		subComponentID: number,
		careerID: number,
		studyPlanID: number,
		courseID: number,
		parallelCode: string
	): Observable<Task[]> {
		return this.http.get<Task[]>(
			`${this.apiURL}/api/settings-tasks/by-activity/${periodID}/${personID}/${componentID}/${subComponentID}/${careerID}/${studyPlanID}/${courseID}/${parallelCode}`
		);
	}

	public getGrades(
		periodID: number,
		limit: number = 10,
		page: number = 1
	): Observable<Tables<Partial>> {
		return this.http.get<Tables<Partial>>(
			`${this.apiURL}/api/sub-component/${periodID}?limit=${limit}&page=${page}`
		);
	}

	public getStudentTasksByPerson(periodID: number, studentID: number): Observable<StudentSubjects[]> {
		return this.http.get<StudentSubjects[]>(`${this.apiURL}/api/student-tasks/courses/${periodID}/${studentID}`);
	}

	public getStudentTasksActivities(
		periodID: number,
		courseID: number,
		studyPlanID: number,
		parallelCode: string
	): Observable<StudentTask[]> {
		return this.http.get<StudentTask[]>(
			`${this.apiURL}/api/student-tasks/activities/${periodID}/${courseID}/${studyPlanID}/${parallelCode}`
		);
	}

	public getTypeOptions(): Observable<TypeOptions[]> {
		return this.http.get<TypeOptions[]>(`${this.apiURL}/api/type-options`);
	}

	public getCurrentPeriod(): Observable<CurrentPeriod> {
		return this.http.get<CurrentPeriod>(`${this.apiURL}/api/period/itca`);
		// .pipe(map((periods: CurrentPeriod[]) => periods.find((p) => true)));
	}

	public getPeriodById(periodID: number): Observable<Period> {
		return this.http.get<Period>(`${this.apiURL}/api/period/${periodID}`);
		// .pipe(map((periods: CurrentPeriod[]) => periods.find((p) => true)));
	}

	public getCoordinatorByFilter(filter: string): Observable<Coordinator[]> {
		return this.http.get<Coordinator[]>(
			`${this.apiURL}/api/coordinator/${filter}`
		);
	}

	public getCoordinatorBySearch(search: string): Observable<Coordinator[]> {
		return this.http.get<Coordinator[]>(
			`${this.apiURL}/api/coordinator/by-search/${search}`
		);
	}

	public getDirectorBySearch(search: string): Observable<Director[]> {
		return this.http.get<Director[]>(
			`${this.apiURL}/api/school-director/by-search/${search}`
		);
	}

	public getCoordinatorList(
		filter: string,
		page: number,
		limit: number = 10
	): Observable<Paginated<CoordinatorList>> {
		return this.http.get<Paginated<CoordinatorList>>(
			`${this.apiURL}/api/coordinator/list?page=${page}&limit=${limit}&filter=${filter}`
		);
	}

	public getDirectorList(
		periodID: number,
		filter: string,
		page: number,
		limit: number = 10
	): Observable<Paginated<Director>> {
		return this.http.get<Paginated<Director>>(
			`${this.apiURL}/api/school-director/${periodID}?page=${page}&limit=${limit}&filter=${filter}`
		);
	}

	public getScheduleModules(
		periodID: number,
		studentID: number
	): Observable<ScheduleModule[]> {
		return this.http.get<ScheduleModule[]>(
			`${this.apiURL}/api/student/schedule-modules/${studentID}/${periodID}`
		);
	}

	public getSchedule(periodID: number, studentID: number): Observable<Schedules[]> {
		return this.http.get<Schedules[]>(`${this.apiURL}/api/student/schedule-enrollment/${studentID}/${periodID}`);
	}

	public getSchoolsByDirector(personID: number): Observable<School[]> {
		return this.http.get<School[]>(
			`${this.apiURL}/api/evaluation-instruments-report/schools-by-person/${personID}`
		);
	}

	public getDestinySchedule(
		periodID: number,
		schoolID: number,
		planStudyID: number,
		careerID: number,
		modalityID: number,
		moduleID: number,
		sectionID: number,
		cycleID: number,
		parallelCode: string
	): Observable<DestinySchedule[]> {
		return this.http.get<DestinySchedule[]>(
			`${this.apiURL}/api/class-section/schedule/${periodID}/${schoolID}/${planStudyID}/${careerID}/${modalityID}/${moduleID}/${sectionID}/${cycleID}/${parallelCode}`
		);
	}

	public getParallelAvailable(
		periodID: number,
		studyPlanID: number,
		cycleID: number,
		modalityID: number,
		careerID: number,
		parallelCode: string
	): Observable<Parallel[]> {
		return this.http.get<Parallel[]>(
			`${this.apiURL}/api/internal-recognition/parallel-available/${periodID}/${studyPlanID}/${cycleID}/${modalityID}/${careerID}/${parallelCode}`
		);
	}

	public getStudentGradesReport(periodID: number, studentID: number): Observable<StudentGrades[]> {
		return this.http.get<StudentGrades[]>(`${this.apiURL}/api/student/grade-report/${periodID}/${studentID}`);
	}

	public getDocumentsStates(): Observable<SPGetFileState[]> {
		return this.http.get<SPGetFileState[]>(`${this.apiURL}/api/file/state`);
	}

	public getPaymentOptionsDesc(periodID: number, studentID: number): Observable<PaymentOption[]> {
		return this.http.get<PaymentOption[]>(`${this.apiURL}/api/enroll/paymentOptionsDesc/${periodID}/${studentID}`);
	}

	public getTransactionTypes(): Observable<TransactionType[]> {
		return this.http.get<TransactionType[]>(
			`${this.apiURL}/api/financial/transactional-type`
		);
	}

	public getFinancialEntities(): Observable<FinancialEntity[]> {
		return this.http.get<FinancialEntity[]>(`${this.apiURL}/api/financial`);
	}

	public getEvaluationInstrumentsByPerson(periodID: number, personID: number, studentID: number): Observable<EvaluationInstrumentList[]> {
		return this.http.get<EvaluationInstrumentList[]>(`${this.apiURL}/api/evaluation-instr/byPerson/${periodID}/${personID}/${studentID}`);
	}

	public getInstrumentResolve(
		periodID: number,
		personID: number,
		settingEvaluationInstrumentsID: number
	): Observable<InstrumentResolve> {
		return this.http.get<InstrumentResolve>(
			`${this.apiURL}/api/setting-evaluation/resolve/${periodID}/${personID}/${settingEvaluationInstrumentsID}`
		);
	}

	public putValidateStudentPayments(
		body: ValidationStudentDocument
	): Observable<any> {
		return this.http.put<any>(`${this.apiURL}/api/file`, body);
	}

	private formattedDate(date: Date): string {
		return <string>this.datePipe.transform(date, "yyyy-MM-dd");
	}

	public postAcademicEvent(event: EventForm): Observable<any> {
		const body: PostUpdateEvent = Utils.bodyToCreateOrUpdateEvent(event);
		body.startDate = this.formattedDate(event.startDate);
		body.endDate = this.formattedDate(event.endDate);
		if (!body.classModuleID) delete body.classModuleID;
		return this.http.post<any>(
			`${this.apiURL}/api/calendar/event-academic`,
			body
		);
	}

	public updateAcademicEvent(id: number, event: any): Observable<any> {
		return this.http.put<any>(
			`${this.apiURL}/api/calendar/event-academic`,
			event
		);
	}

	public postAdministrativeEvent(event: any): Observable<any> {
		const body: PostUpdateEvent = Utils.bodyToCreateOrUpdateEvent(event);
		body.startDate = this.formattedDate(event.startDate);
		body.endDate = this.formattedDate(event.endDate);
		if (!body.classModuleID) delete body.classModuleID;
		if (!body.modalityID) delete body.modalityID;
		return this.http.post<any>(`${this.apiURL}/api/calendar/event-admin`, body);
	}

	public updateAdministrativeEvent(id: number, event: any): Observable<any> {
		return this.http.put<any>(`${this.apiURL}/api/calendar/event-admin`, event);
	}

	public getCalendarActivities(
		periodID: number,
		personID: number
	): Observable<AttendanceTeacher[]> {
		return this.http
		.get<AttendanceTeacher[]>(
			`${this.apiURL}/api/attendance/activities/${periodID}/${personID}`
		)
		.pipe(
			map((value, index) =>
				value.map((event) => {
					return {
						...event,
						start: new Date(`${event.startDate}`),
						end: new Date(`${event.endDate}`),
						title: event.courseName,
					};
				})
			)
		);
	}

	public getCalendarStudentActivities(
		periodID: number,
		studentID: number
	): Observable<StudentActivities[]> {
		return this.http
			.get<StudentActivities[]>(
				`${this.apiURL}/api/student-tasks/calendar/${periodID}/${studentID}`
			)
			.pipe(
				map((value, index) =>
					value.map((event) => {
						return {
							...event,
							start: new Date(`${event.startDate}`),
							end: new Date(`${event.endDate}`),
							title: event.courseName,
						};
					})
				)
			);
	}

	public getStudentTasks(
		periodID: number,
		studentID: number,
		classSectionNumber: number,
		taskID: number
	): Observable<StudentActivities[]> {
		return this.http.get<StudentActivities[]>(
			`${this.apiURL}/api/student-tasks/${periodID}/${studentID}/${classSectionNumber}/${taskID}`
		);
	}

	public getEvents(
		calendarType: number,
		startDate: string,
		endDate: string
	): Observable<IEvent[]> {
		return this.http
			.get<IEvent[]>(
				`${this.apiURL}/api/calendar/events?calendarTypeID=${calendarType}&startDate=${startDate}&endDate=${endDate}`
			)
			.pipe(
				map((value, index) =>
					value.map((event) => {
						return {
							...event,
							start: new Date(`${event.startDate} GMT-0500`),
							end: new Date(`${event.endDate} GMT-0500`),
							title: event.eventDesc,
						};
					})
				)
			);
	}
	//api/golden-payment/options
	public getPaymentOptions(
		pageIndex: number,
		pageSize: number = 10,
		filter: string = "",
		sortBy?: string,
		sortType: SortDirection = "desc"
	): Observable<PaginatedResource<ItcaPayment>> {
		return this.http.get<PaginatedResource<ItcaPayment>>(
			`${this.apiURL}/api/report/option-payment-itca?page=${pageIndex}&${pageSize ? `size=${pageSize}` : ""
			}${filter ? `&filter=${filter}` : ""}${sortType && sortBy ? `&sort=${sortBy}:${sortType}` : ""}`).pipe(
				map((res) => {
					return {
						items: res.items.map((item) => {
							return {
								...item,
								amountEnroll: +item.amountEnroll,
								dues: +item.dues,
								discount: +item.discount,
								tariff: +item.tariff,
								totalAmount: +item.totalAmount,
							};
						}),
						totalItems: res.totalItems,
						page: res.page,
						size: res.size,
					};
				})
			);
	}

	public getOrganizationalUnits(): Observable<OrganizationUnit[]> {
		return this.http
			.get<OrganizationUnit[]>(`${this.apiURL}/api/organizational-units`)
			.pipe(
				map((items: OrganizationUnit[]) => {
					return items.map((item) => ({
						...item,
						isForPracticeHours: item.isForPracticeHours === 1,
					}));
				})
			);
	}

	public postAuthor(author: AuthorFormValue): Observable<Author> {
		const body: Author = Utils.bodyToCreateOrUpdateAuthor(author);
		return this.http.post<any>(`${this.apiURL}/api/author`, body);
	}

	public updateAuthor(author: AuthorFormValue): Observable<Author> {
		const body: Author = Utils.bodyToCreateOrUpdateAuthor(author);
		return this.http.put<any>(`${this.apiURL}/api/author`, body);
	}

	public postEditorial(editorial: EditorialFormValue): Observable<Editorial> {
		const body: Editorial = Utils.bodyToCreateOrUpdateEditorial(editorial);
		return this.http.post<Editorial>(`${this.apiURL}/api/editorial`, body);
	}

	public updateEditorial(editorial: EditorialFormValue): Observable<Editorial> {
		const body: Editorial = Utils.bodyToCreateOrUpdateEditorial(editorial);
		return this.http.put<Editorial>(`${this.apiURL}/api/editorial`, body);
	}

	public getEditorials(
		pageIndex: number,
		pageSize: number = 10,
		filter: string = "",
		sortBy: string = "editorialDesc",
		sortType: SortDirection = "desc"
	): Observable<PaginatedResource<Editorial>> {
		const relativeUrl: string = `/api/editorial?page=${pageIndex}${pageSize ? `&size=${pageSize}` : ""
			}${filter ? `&filter=${filter}` : ""}${sortType && sortBy ? `&sort=${sortBy}:${sortType}` : ""
			}`;
		return this.http.get<PaginatedResource<Editorial>>(
			`${this.apiURL}${relativeUrl}`
		);
	}

	// FIXME: Any por mientras se obtiene la interfaz de esta respuesta
	public deleteEditorial(id: number): Observable<any> {
		return this.http.delete(`${this.apiURL}/api/editorial/${id}`);
	}

	public updatePublicationStatus(
		publicationId: string,
		status: number
	): Observable<any> {
		return this.http.put(`${this.apiURL}/api/publication/update-status`, {
			publicationID: publicationId,
			statusID: status,
		});
	}

	public updatePublication(publication: Publication,publicationId: string): Observable<any> {
		const body: PublicationBodyToUpdate = Utils.bodyToUpdatePublication(
			publication,
			publicationId
		);
		return this.http.put(`${this.apiURL}/api/publication/update-publication`,	body);
	}

	public getAuthors(
		pageIndex: number,
		pageSize: number = 10,
		filter: string = "",
		sortBy: string = "authorName",
		sortType: SortDirection = "desc"
	): Observable<PaginatedResource<Author>> {
		const relativeUrl: string = `/api/author?page=${pageIndex}${pageSize ? `&size=${pageSize}` : ""
			}${filter ? `&filter=${filter}` : ""}${sortType && sortBy ? `&sort=${sortBy}:${sortType}` : ""
			}`;
		return this.http.get<PaginatedResource<Author>>(
			`${this.apiURL}${relativeUrl}`
		);
	}

	public getPublications(
		pageIndex: number,
		pageSize: number = 10,
		filter: string = "",
		sortBy?: string,
		sortType: SortDirection = "desc"
	): Observable<PaginatedResource<PublicationView>> {
		const relativeUrl: string = `/api/publication?page=${pageIndex}&${pageSize ? `size=${pageSize}` : ""
			}${filter ? `&filter=${filter}` : ""}${sortType && sortBy ? `&sort=${sortBy}:${sortType}` : ""
			}`;
		return this.http.get<PaginatedResource<PublicationView>>(
			`${this.apiURL}${relativeUrl}`
		);
	}

	public getPublication(id: string): Observable<PublicationView> {
		const relativeUrl: string = `/api/publication/${id}`;
		return this.http.get<PublicationView>(
			`${this.apiURL}/api/publication/${id}`
		);
	}

	// FIXME: Any por mientras se obtiene la interfaz de esta respuesta
	public deleteAuthor(id: number): Observable<any> {
		return this.http.delete(`${this.apiURL}/api/author/${id}`);
	}

	public getDeweyCategories(): Observable<DeweyCategory[]> {
		return this.http.get<DeweyCategory[]>(
			`${this.apiURL}/api/publication/dewey-category`
		);
	}

	public getDeweySubcategories(
		category: number
	): Observable<DeweySubcategory[]> {
		return this.http.get<DeweySubcategory[]>(
			`${this.apiURL}/api/publication/dewey-subcategory/${category}`
		);
	}

	public getKnowledgeAreas(): Observable<KnowledgeArea[]> {
		return this.http.get<KnowledgeArea[]>(
			`${this.apiURL}/api/publication/knowledge-area`
		);
	}

	public getKnowledgeSubareas(area: number): Observable<KnowledgeSubarea[]> {
		return this.http.get<KnowledgeSubarea[]>(
			`${this.apiURL}/api/areaknowledge/sub-area/${area}`
		);
	}

	public getKnowledgeSpecificSubareas(
		subarea: number
	): Observable<KnowledgeSpecificSubarea[]> {
		return this.http.get<KnowledgeSpecificSubarea[]>(
			`${this.apiURL}/api/areaknowledge/specific-sub-area/${subarea}`
		);
	}

	public getPublicationConditions(): Observable<PublicationCondition[]> {
		return this.http.get<PublicationCondition[]>(
			`${this.apiURL}/api/publication/physical-quality`
		);
	}

	public getPublicationIncomeTypes(): Observable<PublicationIncomeType[]> {
		return this.http.get<PublicationIncomeType[]>(
			`${this.apiURL}/api/publication/income-type`
		);
	}

	public getAvailabilityPublications(): Observable<PublicationAvailability[]> {
		return this.http.get<PublicationAvailability[]>(
			`${this.apiURL}/api/publication/availability`
		);
	}

	public getPublicationLanguages(): Observable<PublicationLanguage[]> {
		return this.http.get<PublicationLanguage[]>(
			`${this.apiURL}/api/publication/language`
		);
	}

	public getMajorSchools(): Observable<MajorSchool[]> {
		return this.http.get<MajorSchool[]>(`${this.apiURL}/api/career/school`);
	}

	public getPublicationTypes(): Observable<PublicationType[]> {
		return this.http.get<PublicationType[]>(
			`${this.apiURL}/api/publication/type`
		);
	}
	public getSupportTypes(): Observable<SupportType[]> {
		return this.http.get<SupportType[]>(
			`${this.apiURL}/api/publication/supportType`
		);
	}

	public postPublication(publication: Publication): Observable<any> {
		const body: PublicationBody = Utils.bodyToCreatePublication(publication);
		return this.http.post<Editorial>(
			`${this.apiURL}/api/publication/form`,
			body
		);
	}

	public postSettingEvaluation(body: any) {
		return this.http.post(
			`${this.apiURL}/api/setting-evaluation/teacher`,
			body
		);
	}

	public postEvent(body: any) {
		return this.http.post(`${this.apiURL}/api/event`, body);
	}

	public getPublicationStock(
		publicationId: string
	): Observable<PublicationStockDetail[]> {
		return this.http.get<PublicationStockDetail[]>(
			`${this.apiURL}/api/publication/stock/${publicationId}`
		);
	}

	public getSubjectsList(
		pageIndex: number,
		pageSize: number = 10,
		filter: string = "",
		sortBy: string = "",
		sortType: SortDirection = "desc"
	): Observable<PaginatedResource<SubjectsList>> {
		return this.http.get<PaginatedResource<SubjectsList>>(`${this.apiURL
			}/api/report/academic-teacher?page=${pageIndex}&${pageSize ? `size=${pageSize}` : ""
			}
    ${filter ? `&filter=${filter}` : ""}${sortType && sortBy ? `&sort=${sortBy}:${sortType}` : ""
			}`);
	}

	public getApplicantTypes(): Observable<PublicationIncomeType[]> {
		return this.http.get<PublicationIncomeType[]>(
			`${this.apiURL}/api/request/applicant-type`
		);
	}

	public getDepositTypes(): Observable<PublicationIncomeType[]> {
		return this.http.get<PublicationIncomeType[]>(
			`${this.apiURL}/api/request/warranty`
		);
	}

	public postRequestedPublication(
		requestedPublication: PublicationRequest
	): Observable<any> {
		const body: RequestPublicationBody =
			Utils.bodyToPostRequestedPublication(requestedPublication);
		return this.http.post<Editorial>(`${this.apiURL}/api/request`, body);
	}

	public searchApplicantByIdentificationNumber(
		applicantType: number,
		applicantIdentificationNumber: string
	): Observable<Applicant[]> {
		return this.http.get<Applicant[]>(
			`${this.apiURL}/api/request/applicant-type/${applicantIdentificationNumber}/${applicantType}`
		);
	}

	public getBorrowedPublications(
		pageIndex: number,
		pageSize: number = 10,
		filter: string = "",
		sortBy: string = "",
		sortType: SortDirection = "desc"
	): Observable<PaginatedResource<RequestedPublication>> {
		return this.http.get<PaginatedResource<RequestedPublication>>(
			`${this.apiURL}/api/publication/borrowed?page=${pageIndex}&${pageSize ? `size=${pageSize}` : ""
			}${filter ? `&filter=${filter}` : ""}${sortType && sortBy ? `&sort=${sortBy}:${sortType}` : ""
			}`
		);
	}

	public getRequestedPublications(
		pageIndex: number,
		pageSize: number = 10,
		filter: string = "",
		sortBy: string = "requestID",
		sortType: SortDirection = "desc"
	): Observable<PaginatedResource<RequestedPublicationByApplicant>> {
		return this.http.get<PaginatedResource<RequestedPublicationByApplicant>>(
			`${this.apiURL}/api/publication/requested?page=${pageIndex}&${pageSize ? `size=${pageSize}` : ""
			}${filter ? `&filter=${filter}` : ""}${sortType && sortBy ? `&sort=${sortBy}:${sortType}` : ""
			}`
		);
	}

	public getRequestedPublication(id: number): Observable<RequestedPublication> {
		return this.http.get<RequestedPublication>(
			`${this.apiURL}/api/publication/borrowed/${id}`
		);
	}

	public getPublicationStatuses(): Observable<PublicationStatus[]> {
		return this.http.get<PublicationStatus[]>(
			`${this.apiURL}/api/request/status`
		);
	}

	public getApplicantTypeFromRol(rol: number): Observable<ApplicantType> {
		return this.http
			.get<ApplicantType[]>(`${this.apiURL}/api/request/applicant-type/${rol}`)
			.pipe(
				map((value: ApplicantType[]) => {
					return value.find(() => true);
				})
			);
	}

	public getApplicantTypeFromRolByRol(rol: number): Observable<PublicationIncomeType[]> {
		return this.http
			.get<PublicationIncomeType[]>(`${this.apiURL}/api/request/applicant-type/${rol}`
			);
	}

	public getAllApplicantTypeFromRol(rol: number): Observable<ApplicantType[]> {
		return this.http.get<ApplicantType[]>(`${this.apiURL}/api/request/applicant-type/${rol}`);
	}

	//FIXME: En el backend esto no debería ser así. La estructura debe seguir un patrón request/:id
	public updateRequestedPublication(
		requestId: number,
		status: number,
		observation: string = ""
	): Observable<any> {
		const body: UpdateRequestPublicationBody =
			Utils.bodyToUpdateRequestPublication(requestId, status, observation);
		return this.http.put<any>(`${this.apiURL}/api/request/state`, body);
	}

	//FIXME: En el backend esto no debería ser así. La estructura debe seguir un patrón request/publication/:id
	public updateRequestedPublicationDetail(
		requestDetailId: number,
		status: number,
		observation: string = ""
	): Observable<any> {
		const body: UpdateRequestPublicationDetailBody =
			Utils.bodyToUpdateRequestPublicationDetail(
				requestDetailId,
				status,
				observation
			);
		return this.http.put<any>(`${this.apiURL}/api/request/state-loan`, body);
	}

	public returnRequestedPublicationDetail(
		requestDetailId: number,
		condition: number,
		returnDate: string,
		observation: string = ""
	): Observable<RequestedPublicationDetail> {
		const body: ReturnRequestPublicationDetailBody =
			Utils.bodyToReturnRequestPublicationDetail(
				requestDetailId,
				condition,
				returnDate,
				observation
			);
		return this.http.put<RequestedPublicationDetail>(
			`${this.apiURL}/api/publication/return`,
			body
		);
	}

	public getPublicationPdf(
		publicationId: string
	): Observable<HttpResponse<Blob>> {
		const headers = new HttpHeaders();
		return this.http.get(
			`${this.apiURL}/api/publication/generated-sheet/${publicationId}`,
			{ headers, observe: "response", responseType: "blob" }
		);
	}

	public getParallelsByPeriodStudyPlanCycleModalityAndCareer(
		period: number,
		studyPlan: number,
		cycle: number,
		modality: number,
		career: number
	): Observable<string[]> {
		return this.http.get<string[]>(
			`${this.apiURL}/api/parallel/by-cycle/${period}/${studyPlan}/${cycle}/${modality}/${career}`
		);
	}

	public getParallelsByFilters(
		period: number,
		studyPlan: number,
		cycle: number,
		modality: number,
		career: number
	): Observable<Parallel[]> {
		return this.http.get<Parallel[]>(
			`${this.apiURL}/api/parallel/by-cycle/${period}/${studyPlan}/${cycle}/${modality}/${career}`
		);
	}

	public downloadLibraryDocument(
		type: "income" | "request" | "borrow",
		filterBy:
			| "career"
			| "modality"
			| "school"
			| "period"
			| "report"
			| "bookTitle"
			| "deweyCategory",
		entity: number,
		period: number,
		publicationStatus?: number
	): Observable<HttpResponse<Blob>> {
		const reportAddresses = {
			income: {
				career: "/api/library-reports/report-entry-by-career",
				modality: "/api/library-reports/report-entry-by-modality",
				school: "/api/library-reports/report-entry-by-school",
				period: "/api/library-reports/report-entry-by-academic-period",
				bookTitle: "", // No aplica
				deweyCategory: "", // No aplica
				report: "", // No aplica
			},
			request: {
				career: "/api/library-reports/report-request-by-career",
				modality: "/api/library-reports/report-request-by-modality",
				school: "/api/library-reports/report-request-by-school",
				period: "/api/library-reports/report-request-by-academic-period",
				bookTitle: "", // No aplica
				deweyCategory: "", // No aplica
				report: "", // No aplica
			},
			borrow: {
				career: "/api/library-reports/report-loan-by-career",
				modality: "/api/library-reports/report-loan-by-modality",
				school: "/api/library-reports/report-loan-by-school",
				period: "/api/library-reports/report-loan-by-academic-period",
				bookTitle: "/api/library-reports/report-loan-physical-books",
				deweyCategory: "/api/library-reports/loan-data-category-dewey",
				report: "/api/library-reports/report-publication-loan-by-academic-period",
			},
		};
		let body: {};
		if (type === "income") {
			body = {
				periodID: period,
				typeEntityID: entity,
			};
		} else {
			body = {
				periodID: period,
				typeEntityID: entity,
				requestStatusID: publicationStatus,
			};
		}
		const urlApi: string = reportAddresses[type][filterBy];
		const headers: HttpHeaders = new HttpHeaders();
		return this.http.post(`${this.apiURL}${urlApi}`, body, {
			headers,
			observe: "response",
			responseType: "blob",
		});
	}

	public getRequestPublicationByStudentPersonID(flg: number,studentpersonID :number, page: number, limit: number): Observable<Paginated<RequestedPublicationByApplicant>> {
		return this.http.get<Paginated<RequestedPublicationByApplicant>>(
			`${this.apiURL}/api/publication/request-publication/${flg}/${studentpersonID}?page=${page}&limit=${limit}`
		);
	}
	public getTypeRolByRolID(rolID: number): Observable<TypeRol[]> {
		return this.http.get<TypeRol[]>(
			`${this.apiURL}/api/type-rol/role/${rolID}`
		);
	}

	public getDocumentManagementByRolID(rolID: number): Observable<DocumentManagement[]> {
		return this.http.get<DocumentManagement[]>(`${this.apiURL}/api/document-management/rol/${rolID}`);
	}

	public getDocumentManagementByTypeRolID(typeRolID: number): Observable<DocumentManagement[]> {
		return this.http.get<DocumentManagement[]>(`${this.apiURL}/api/document-management/document-by-typerol/${typeRolID}`);
	}

	public getTypeRolByDocumentManagementID(
		documentManagementID: number
	): Observable<TypeRol[]> {
		return this.http.get<TypeRol[]>(
			`${this.apiURL}/api/type-rol/document-management/${documentManagementID}`
		);
	}

	public getAllIntrumentsConfiguration(
		periodID: number,
		schoolID: number,
		careerID: number,
		studyPlanID: number,
		modalityID: number,
		cycleID: number,
		courseID: number = 0
	) {
		return this.http.get(
			`${this.apiURL}/api/teacher/${periodID}/${schoolID}/${careerID}/${studyPlanID}/${modalityID}/${cycleID}/${courseID}`
		);
	}

	public getDepartmentsByRol(rolID: number): Observable<Department[]> {
		return this.http.get<Department[]>(
			`${this.apiURL}/api/message-management/department-document-management/${rolID}`
		);
	}

	public getAvailableQuotas(periodID: number = 0) {
		return this.http.get<AvailableQuota[]>(
			`${this.apiURL}/api/financial/available-quotas/${periodID}`
		);
	}

	public getQuotaControl(quotaControlBody: {
		periodID: number;
		quotaNumber: number;
		filter: string;
		page: number;
		size: number;
	}) {
		return this.http.post<Paginated<StudentQuotaControl>>(
			`${this.apiURL}/api/financial/quota-control`,
			quotaControlBody
		);
	}

	public getQuotaControlReport(
		periodID: number,
		careerID: number,
		studyPlanID: number,
		cycleID: number,
		paralellCode: string
	) {
		const headers = new HttpHeaders();
		return this.http.get(
			`${this.apiURL}/api/financial/reports/quota-payment/${periodID}/${careerID}/${studyPlanID}/${cycleID}/${paralellCode}`,
			{ headers, observe: "response", responseType: "blob" }
		);
	}

	public getDatesHolidayByPeriod(periodID: number): Observable<DatesHoliday> {
		return this.http.get<DatesHoliday>(`${this.apiURL}/api/academic-schedule/dates-holiday/${periodID}`);
	}

	public getProjectPracticasByModalityPractice(
		periodID: number,
		careerID: number,
		studyPlanID: number,
		modalityID: number,
		stateID: number,
		modalityPracticeID: number,
		filter: string,
		page: number,
		size: number
	) {
		return this.http.get<Paginated<ProjectPracticasByModalityPractice>>(
			`${this.apiURL}/api/project-practicas/project-practicas-by-modality-practice/${periodID}/${careerID}/${studyPlanID}/${modalityID}/${stateID}/${modalityPracticeID}
			?filter=${filter}&page=${page}&size=${size}`,
		);
	}

	public getLibrarySpaceDetail(librarySpaceID: number): Observable<LibrarySpaceDetail[]> {
		return this.http.get<LibrarySpaceDetail[]>(`${this.apiURL}/api/library-spaces/${librarySpaceID}`);
	}

	public getLibrarySpacesAttendance(personDocumentNumber: number, librarySpaceID: number, applicantTypeID: number): Observable<LibraryStudentDetail[]> {
		return this.http.get<LibraryStudentDetail[]>(`${this.apiURL}/api/library-spaces-attendance/${personDocumentNumber}/${librarySpaceID}/${applicantTypeID}`);
	}

	public postLibrarySpacesAttendance(body: any) {
		return this.http.post(`${this.apiURL}/api/library-spaces-attendance`, body);
	}

	public putLibrarySpacesAttendance(body: any) {
		return this.http.put(`${this.apiURL}/api/library-spaces-attendance`, body);
	}

	public postExternalUser(body: any) {
		return this.http.post(`${this.apiURL}/api/library-spaces-attendance/external-person`, body);
	}

	public postLibraryLogout(body: any) {
		return this.http.post(`${this.apiURL}/api/library-spaces/logout`, body);
	}


	public deletePublication(publicationId: string): Observable<any> {
		const body = {
			deletedAt: new Date(), // Fecha actual para el borrado lógico
		};
		return this.http.put(`${this.apiURL}/api/publication/delete/${publicationId}`, body);
	}

	public postPublicationFile(body: FormData){
		return this.http.post(`${this.apiURL}/api/publication/file`, body);
	}

	public getAllInstruments(): Observable<Instrument[]> {
		return this.http.get<Instrument[]>(`${this.apiURL}/api/evaluation-instr/allInstruments`);
	}

	public getPdfBodyContent(url: string, body: any): Observable<HttpResponse<Blob>> {
		const headers = new HttpHeaders({
			'Content-Type': 'application/json'
		});

		return this.http.post(url, body, {
			headers,
			observe: "response",
			responseType: "blob", // Para recibir el PDF en Blob
		});
	}

	public postNaturalPerson(body: any) {
		return this.http.post(`${this.apiURL}/api/person/natural`, body);
	}

	public postForwardMessage(body: any) {
		return this.http.post(`${this.apiURL}/api/message-management/forward-to-message`, body);
	}

	public getCourseSale(startDate: string, endDate: string): Observable<CourseSale[]> {
		return this.http.get<CourseSale[]>(`${this.apiURL}/api/unacem-report/course-sale-unacem?startDate=${startDate}&endDate=${endDate}`);
	}

	public getCoursePercentage(): Observable<CoursePercentage[]> {
		return this.http.get<CoursePercentage[]>(`${this.apiURL}/api/unacem-report/course-percentage-unacem`);
	}

	public getInterestedPercentage(search: string): Observable<InterestedPercentage[]> {
		return this.http.get<InterestedPercentage[]>(`${this.apiURL}/api/unacem-report/interested-percentage-unacem?filter=${search}`);
	}

	public getCourseStatus(): Observable<CourseStatus[]> {
		return this.http.get<CourseStatus[]>(`${this.apiURL}/api/unacem-report/course-average-status-unacem`);
	}

	public getCourseSaleRange(startDate: string, endDate: string): Observable<CourseSaleRange[]> {
		return this.http.get<CourseSaleRange[]>(`${this.apiURL}/api/unacem-report/sale-range-unacem?startDate=${startDate}&endDate=${endDate}`);
	}

	public getCourseStateUnacem(contractorID: number, periodSection: number): Observable<CourseReport[]> {
		return this.http.get<CourseReport[]>(`${this.apiURL}/api/unacem-report/state-course-unacem?contractorID=${contractorID}&periodSection=${periodSection}`);
	}

	public getCourseHoursUnacem(contractorID: number, periodSection: number): Observable<CourseReport[]> {
		return this.http.get<CourseReport[]>(`${this.apiURL}/api/unacem-report/hours-course-unacem?contractorID=${contractorID}&periodSection=${periodSection}`);
	}

	public getCourseDesertersUnacem(contractorID: number, periodSection: number): Observable<CourseReport[]> {
		return this.http.get<CourseReport[]>(`${this.apiURL}/api/unacem-report/desertion-course-unacem?contractorID=${contractorID}&periodSection=${periodSection}`);
	}

	public getCourseDesertionByPhaseUnacem(contractorID: number, periodSection: number): Observable<DesertionByPhase[]> {
		return this.http.get<DesertionByPhase[]>(`${this.apiURL}/api/unacem-report/desertion-by-phase?contractorID=${contractorID}&periodSection=${periodSection}`);
	}
}
