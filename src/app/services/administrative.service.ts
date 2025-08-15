import { Observable, map, of, filter, Subscription } from 'rxjs';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AdmissionPeriod, Campus, CampusData, ClassSession, Count, CurrentPeriodItca, Institution, Module, Period, ProcedureUserInfo, RetrieveType, Tables } from '@utils/interfaces/period.interfaces';
import { environment } from '@environments/environment';
import { CommonService } from './common.service';
import { CALENDAR_TYPE, EventType, GeneralResponse } from '@utils/interfaces/calendar.interface';
import { Utils } from '../utils';
import {
	CareerDetail,
	Course,
	School,
	SPGetBuilding,
	SPGetCareer,
	SPGetClassroom,
	SPGetClassroomType,
	SPGetModality,
	StudyPlan,
	Subject,
	Curriculum,
	SubjectColor,
	CurriculumPeriod,
	CycleDetail,
	CoursesDetail,
	TeacherCourse,
	PartPeriod,
	CareerForSection,
	StudyPlanForSection,
	SubjectForSection,
	WorkingDay,
	WorkingDayHour,
	ClassRoom,
	NumberSection,
	Parallel,
	BriefTeacher,
	Filter,
	DayFormValue,
	TemporalCode,
	CourseDetailShort,
	DistributiveSubject, TemporalPostSubjectSchedule,
	ResultType,
	Units,
	EvaluationTool,
	EvaluationType,
	ProductGenerated,
	EvaluationCriteria,
	SubjectPlan,
	CourseHours,
	CourseSchedule,
	settingUnit,
	ModalityByCareer,
	AttendanceTeacher,
	Student,
	CareerList,
	StudentGrades,
	TaskGrade,
	Publication,
	PublicationAvailability,
	Bibliography,
	TeachingProcess,
	ApprovalRequest,
	AgreementCareers,
	Agreement,
	TimeAvailability,
	Cycle,
	CareerAgreement,
	CourseOfPractice,
	AgreementBusinessCareer,
	TotalStudents,
	TotalTeachers,
	ListStudent,
	ListTeacher,
	Project,
	ParallelList,
	ProjectTypes,
	ProjectTypesMeasurement,
	ProjectObjetive,
	ProjectActivityOfObjetive,
	ProjectActivityByObjetive,
	ProjectPracticeModality,
	ProjectState,
	MicroProject, InstrumentSubject, InstrumentTeacher,
	EvaluationInstrumentsReport,
	EvaluationInstrumentsTeacherFollowup,
	CourseToInstrument,
	CoursesLinkage,
	LinkageProject,
	StudentGradesLinkage,
	StudentProcessTemplate,
	FileType,
	GradeLinkage,
	BecaType,
	StudentBondingFile,
	ProjectValidation
} from '@utils/interfaces/campus.interfaces';
import { differenceInCalendarMonths } from 'date-fns';
import {
  ClassSchedule,
  Instruction,
  PaymentInfo,
  PayMentOptions,
  PaymentOption,
  Profession,
	EnrolledSubjects
} from '@utils/interfaces/enrollment.interface';
import {
	AcademicDegree, AdministrativeStaff,
	BasicService,
	CivilStatus,
	Collaborator,
	CollegeType,
	confMenu,
	confModules, Contractor, CoordinatorList,
	DocumentManagement,
	EvaluationInstrument,
	ExternalUser,
	ExternalUserInstitute,
	Gap,
	Groups,
	HealthType,
	HolidayCount,
	HousingType,
	IncomeExpense,
	InstrumentEvaluationActivity,
	InstrumentEvaluationComponent,
	InstrumentEvaluationType,
	ManagementInboxSent,
	MenuSettings,
	MessageManagementContent,
	MessageReply,
	Paginated,
	PaymentProof,
	Plan1Detail,
	Plan2Detail,
	Plan3Detail,
	Plan5Detail,
	Plan5Support,
	QRCode,
	Relationship,
	ResultLearning,
	RetrieveAvailable,
	RetrieveAvailableSchedules,
	Roles,
	ScheduleSignatureRepeat,
	SeccionModulo,
	SignatureRepeat,
	SignatureReport,
	SocioeconomicForm1,
	SocioeconomicForm2,
	SocioeconomicForm3,
	SocioeconomicForm4,
	SocioeconomicForm5,
	SocioeconomicForm6,
	SocioeconomicForm7,
	SocioeconomicInformation,
	SPGetFileState,
	StudentDocument,
	SubjectData,
	SyllabusSubject,
	TeacherFollowUp,
	TermsAndConditions,
	TimeAvailabilityTeacher,
	TypeManagement,
	TypeRol,
	UnacemBlackList,
	UnacemCourse,
	UnacemResponsable,
	UnacemStudentReport,
	User,
	UserByTypeRol,
	usersRoles,
	WorkWeek,
	Zone
} from '@utils/interfaces/others.interfaces';
import { EnrollmentPost, StatusStudents } from '@utils/interfaces/others.interfaces';
import {
	AgreementConvention,
  Charge,
  ColaboratorPosition,
  EnrolledStudent, FileStatus,
  PaginatedResource,
  PaymentEnrolledITCAStudent, PaymentForEnrolledStudent,
  SearchedStudent,
  SPGetPerson,
  SPGetPerson2
} from '@utils/interfaces/person.interfaces';
import { SortDirection } from '@angular/material/sort';
import { DatePipe, formatDate } from '@angular/common';
import { ExperienceMatter } from '@utils/interfaces/rrhh.interfaces';

let url = environment.url;
// let url = 'http://localhost:3000';

@Injectable({
  providedIn: 'root'
})
export class AdministrativeService {

  private assignmentData: any = null;
  private curriculum: Curriculum = {
    units: [
      {
        rows: [

        ],
        name: null
      },
      {
        name: null,
        rows: [
          [{ background: '', color: '', courseID: 2, courseName: 'Matemática 2', careerName: '', careerID: 2, cycle: 2, credits: 2, depends: [], experimentalHours: 32, unsupervisedHours: 33, faceToFaceHours: 32, studyPlanId: 32 }],
          [{ background: '', color: '', courseID: 2, courseName: 'Trigonomería', careerName: '', careerID: 2, cycle: 3, credits: 2, depends: [], experimentalHours: 32, unsupervisedHours: 33, faceToFaceHours: 32, studyPlanId: 32 }],
          [{ background: '', color: '', courseID: 2, courseName: 'Inglés II', careerName: '', careerID: 2, cycle: 1, credits: 2, depends: [], experimentalHours: 32, unsupervisedHours: 33, faceToFaceHours: 32, studyPlanId: 32 }],
          [{ background: '', color: '', courseID: 2, courseName: 'Filosofía', careerName: '', careerID: 2, cycle: 1, credits: 2, depends: [], experimentalHours: 32, unsupervisedHours: 33, faceToFaceHours: 32, studyPlanId: 32 }],
          [{ background: '', color: '', courseID: 2, courseName: 'Arte y Deporte', careerName: '', careerID: 2, cycle: 1, credits: 2, depends: [], experimentalHours: 32, unsupervisedHours: 33, faceToFaceHours: 32, studyPlanId: 32 }],
        ],
      }
    ],
    name: '',
    practiceHours: []
  }
  constructor( private https:HttpClient,
               private common: CommonService,
							 private datePipe: DatePipe
                 ) { }

  getCompanies() {
    return this.https.get(`${url}/api/company`);
  }

  getCampus(page: number = 1, filter:string=''):Observable<Tables<Campus>>{
    return this.https.get<Tables<Campus>>(`${url}/api/campus?page=${page}&filter=${filter}`);
  }

  public getModulesByModality(modality: number): Observable<Module[]> {
    return this.https.get<Module[]>(`${url}/api/class-module/modality/${modality}`);
  }

  // Para este proyecto, al ser de pregrado, el nivel siempre será 1.
  // Por favor, no omitir esto.
  public getPartPeriods(campus: number, modality: number, level = 1): Observable<PartPeriod[]> {
    return this.https.get<PartPeriod[]>(`${url}/api/part-period/${level}/${campus}/${modality}`);
  }

  public getWorkingDaysByModality(modality: number): Observable<WorkingDay[]> {
    return this.https.get<WorkingDay[]>(`${url}/api/working-day/${modality}`);

  }

	public getWorkingDaysByModality2(modality: number): Observable<SeccionModulo[]> {
    return this.https.get<SeccionModulo[]>(`${url}/api/working-day/working-day-or-module/${modality}`);

  }

  // Sucursales
  public getAllCampuses():Observable<Campus[]> {
    return this.https.get<GeneralResponse>(`${url}/api/campus`).pipe(map((res: GeneralResponse) => res.data as Campus[]));
  }

  getPeriod( page: number = 1, filter: string='', limit = 10):Observable<Tables<CampusData>>{
    return this.https.get<Tables<CampusData>>(`${url}/api/period?page=${page}&filter=${filter}&limit=${limit}`);
  }

  public getPeriodsByCampus(campus: number):Observable<Period[]> {
    return this.https.get<Period[]>(`${url}/api/period/campus/${campus}`)
			/* .pipe(map((res: Period[]) => res.map((p: Period) => Utils.parsePeriod(p)))); */
  }

	public getAllPeriods():Observable<Period[]> {
    return this.https.get<Period[]>(`${url}/api/period/all`);
  }

	public getInstitutionByCountry(countryID: number):Observable<Institution[]> {
    return this.https.get<Institution[]>(`${url}/api/institution/${countryID}`);
  }

	public getRetrieveTypes():Observable<RetrieveType[]> {
    return this.https.get<RetrieveType[]>(`${url}/api/recognition/retrieve-types`);
  }

  public getInstitutionToSurvey():Observable<Institution[]> {
    return this.https.get<Institution[]>(`${url}/api/institution/para/encuesta`);
  }

  public getInstitutionToSurveyCurrent():Observable<Institution[]> {
    return this.https.get<Institution[]>(`${url}/api/institution/para/encuesta/current`);
  }

  public getEventTypes(calendarType: CALENDAR_TYPE):Observable<EventType[]> {
    return this.https.get<EventType[]>(`${url}/api/calendar/event/${calendarType}`);
  }

	public getSchoolsByPeriod(period: number): Observable<School[]> {
		return this.https.get<School[]>(`${url}/api/school/period/${period}`);
	}

	public getTeachersByPeriod(period: number): Observable<any[]> {
		return this.https.get<any[]>(`${url}/api/teacher/by-period/${period}`);
	}

	public getAllSchools(): Observable<School[]> {
		return this.https.get<School[]>(`${url}/api/school/all`);
	}

	public getSchoolsByPerson(personID: number): Observable<School[]> {
		return this.https.get<School[]>(`${url}/api/coordinator/school-career/${personID}`);
	}

  public getClassSessions(): Observable<ClassSession[]> {
    return this.https.get<ClassSession[]>(`${url}/api/class-session`);
  }

  public getPeriods():Observable<Period[]> {
    return this.https.get<GeneralResponse>(`${url}/api/period`)
      .pipe(map((res: GeneralResponse) => res.data.map((p: Period) => Utils.parsePeriod(p))));
  }

  public getFileStatuses(): Observable<FileStatus[]> {
    return this.https.get<FileStatus[]>(`${url}/api/file/state`);
  }

  getCurrentPeriod():Observable<Tables<CampusData>>{
    return this.https.get<Tables<CampusData>>(`${url}/api/period?limit=2`)
  }

	getSettingModulePeriod(page: number = 1, filter: string ='', limit = 10, periodID: number): Observable<Tables<CareerList>>{
    return this.https.get<Tables<CareerList>>(`${url}/api/setting-module-period/${periodID}?limit=${limit}&page=${page}&filter=${filter}`);
  }

  getSchool(page: number = 1, filter: string ='', limit = 10): Observable<Tables<School>>{
    return this.https.get<Tables<School>>(`${url}/api/school?page=${page}&limit=${limit}&filter=${filter}`);
  }

  getSchools(): Observable<Tables<School>>{
    return this.https.get<Tables<School>>(`${url}/api/school`);
  }

	public getSchoolsByModality(periodID: number, modalityID: number): Observable<School[]> {
		return this.https.get<School[]>(`${url}/api/school/modality/${periodID}/${modalityID}`);
	}

	public getAgreementCareers(): Observable<SPGetCareer[]>{
    return this.https.get<SPGetCareer[]>(`${url}/api/career-agreement`);
  }

	public getCareersByPeriod(periodID: number): Observable<SPGetCareer[]>{
    return this.https.get<SPGetCareer[]>(`${url}/api/career/by-period/${periodID}`);
  }

	public getBusiness(approvalRequestBusID: number ,ruc: string): Observable<Agreement[]>{
    return this.https.get<Agreement[]>(`${url}/api/business/${approvalRequestBusID}/${ruc}`);
  }

	public getBusinessByRuc(ruc: string): Observable<Agreement[]>{
    return this.https.get<Agreement[]>(`${url}/api/business/${ruc}`);
  }

	public getBusinessCareer(ruc: string): Observable<AgreementCareers[]>{
    return this.https.get<AgreementCareers[]>(`${url}/api/business-career/${ruc}`);
  }

	public getAllBusiness(page: number, limit:number, filter: string): Observable<Tables<Agreement>>{
    return this.https.get<Tables<Agreement>>(`${url}/api/business?page=${page}&limit=${limit}&filter=${filter}`);
  }

  public getCareers(page: number = 1, filter: string ='', limit: number = 10): Observable<Tables<SPGetCareer>>{
    return this.https.get<Tables<SPGetCareer>>(`${url}/api/career?page=${page}&filter=${filter}&limit=${limit}`);
  }

	public getCareerByActivePeriod(): Observable<SPGetCareer>{
    return this.https.get<SPGetCareer>(`${url}/api/career-period/by-active-period`);
  }

	public getCareer(career: number): Observable<SPGetCareer>{
    return this.https.get<SPGetCareer>(`${url}/api/career/${career}`);
  }

	public getCareerByPeriod(periodID: number): Observable<SPGetCareer[]>{
    return this.https.get<SPGetCareer[]>(`${url}/api/career/by-period/${periodID}`);
  }

  public getCareerAll(): Observable<SPGetCareer>{
    return this.https.get<SPGetCareer>(`${url}/api/career/school`);
  }

  public getCareerAllWithAdmissionCurrentNoGrouped(){
    return this.https.get(`${url}/api/career/school-with-admission-current?grouped=false`);
  }

  public getCareerAllWithAdmissionCurrent(): Observable<SPGetCareer>{
    return this.https.get<SPGetCareer>(`${url}/api/career/school-with-admission-current`);
  }

  public getCareersByStudyPlanAndSchoolAndPeriod(studyPlan: number, school: number, period: number): Observable<SPGetCareer[]> {
    return this.https.get<SPGetCareer[]>(`${url}/api/school/career/${period}/${school}/${studyPlan}`);
  }

	public getCareersBySchool(periodID: number, schoolID: number): Observable<SPGetCareer[]> {
		return this.https.get<SPGetCareer[]>(`${url}/api/school/career/${periodID}/${schoolID}`);
	}

	public getCareersBySchoolID(schoolID: number): Observable<SPGetCareer[]> {
		return this.https.get<SPGetCareer[]>(`${url}/api/career/by-school/${schoolID}`);
	}

	public getCareersByPerson(personID: number, schoolID: number): Observable<SPGetCareer[]> {
		return this.https.get<SPGetCareer[]>(`${url}/api/coordinator/career/${personID}/${schoolID}`);
	}

  public getCyclesByCareerAndStudyPlan(studyPlan: number, career: number): Observable<CycleDetail[]> {
    return this.https.get<CycleDetail[]>(`${url}/api/cycle/career-studyPlan/${studyPlan}/${career}`);
  }

	public getEvaluationInstrumentsReport(evaluationOrFollowup: number): Observable<EvaluationInstrumentsReport[]> {
    return this.https.get<EvaluationInstrumentsReport[]>(`${url}/api/evaluation-instruments-report/instruments-by-evaluation-or-followup/${evaluationOrFollowup}`);
  }

	public getEvaluationInstrumentsTeacherFollowup(body: any): Observable<Tables<EvaluationInstrumentsTeacherFollowup>> {
    return this.https.post<Tables<EvaluationInstrumentsTeacherFollowup>>(`${url}/api/evaluation-instruments-report/teacher-followup`, body);
  }

	public getCoursesToInstrumentsReports(body: any): Observable<Tables<CourseToInstrument>> {
    return this.https.post<Tables<CourseToInstrument>>(`${url}/api/evaluation-instruments-report/courses-to-instruments-reports`, body);
  }

	public getCareerAgreement(studyPlanID: number, careerID: number, cycleID: number): Observable<CareerAgreement[]> {
    return this.https.get<CareerAgreement[]>(`${url}/api/career-agreement/practice-studyPlan/${studyPlanID}/${careerID}/${cycleID}`);
  }

	public getCourseOfPractice(studyPlanID: number, careerID: number, cycleID: number, courseIDPractice: number): Observable<CourseOfPractice[]> {
    return this.https.get<CourseOfPractice[]>(`${url}/api/career-agreement/course-of-practice/${studyPlanID}/${careerID}/${cycleID}/${courseIDPractice}`);
  }

	public getTotalStudents(periodID: number, modalityID: number, studyPlanID: number, careerID: number, cycleID: number, courseIDPractice: number): Observable<TotalStudents[]> {
    return this.https.get<TotalStudents[]>(`${url}/api/links/total-students/${periodID}/${modalityID}/${studyPlanID}/${careerID}/${cycleID}/${courseIDPractice}`);
  }

	public getTotalTeacher(periodID: number, modalityID: number, studyPlanID: number, careerID: number, cycleID: number, courseIDPractice: number): Observable<TotalTeachers[]> {
    return this.https.get<TotalTeachers[]>(`${url}/api/links/total-teacher/${periodID}/${modalityID}/${studyPlanID}/${careerID}/${cycleID}/${courseIDPractice}`);
  }

	public getProjectPracticeModalities(): Observable<ProjectPracticeModality[]> {
    return this.https.get<ProjectPracticeModality[]>(`${url}/api/project-practicas/modality`);
  }

	public getProjectObjetives(periodID: number, projectPracticasID: number): Observable<ProjectObjetive[]> {
    return this.https.get<ProjectObjetive[]>(`${url}/api/project-objective-esp/${periodID}/${projectPracticasID}`);
  }

	public getProjectObjetivesActivities(periodID: number, projectPracticasID: number): Observable<ProjectObjetive[]> {
    return this.https.get<ProjectObjetive[]>(`${url}/api/project-obj-esp-activity/${periodID}/${projectPracticasID}`);
  }

	public getListStudent(periodID: number, modalityID: number, studyPlanID: number, careerID: number, cycleID: number, filter: string): Observable<ParallelList[]> {
    return this.https.get<ParallelList[]>(`${url}/api/links/list-student/${periodID}/${modalityID}/${studyPlanID}/${careerID}/${cycleID}?filter=${filter}`);
  }

	public getListTeacher(periodID: number, schoolID: number): Observable<ListTeacher[]> {
    return this.https.get<ListTeacher[]>(`${url}/api/links/list-teacher/${periodID}/${schoolID}`);
  }

	public getProjectType(): Observable<ProjectTypes[]> {
    return this.https.get<ProjectTypes[]>(`${url}/api/project-type`);
  }

	public getProjectTypeMeasurement(): Observable<ProjectTypesMeasurement[]> {
    return this.https.get<ProjectTypesMeasurement[]>(`${url}/api/project-type/measurement`);
  }

	public getProjectByID(projectPracticasID: number): Observable<Project[]> {
    return this.https.get<Project[]>(`${url}/api/project-practicas/${projectPracticasID}`);
  }

	public getAgreementBusinessCareer(periodID: number, careerID: number): Observable<AgreementBusinessCareer[]> {
    return this.https.get<AgreementBusinessCareer[]>(`${url}/api/business-career/${careerID}/${periodID}`);
  }

  public getFileTypes(): Observable<FileType[]> {
    return this.https.get<FileType[]>(`${url}/api/file-type`);
  }

	public getFileBecaTypes(periodID: number, companyID: number= 1): Observable<BecaType[]> {
    return this.https.get<BecaType[]>(`${url}/api/file/beca-type/${periodID}/${companyID}`);
  }

  public getParallelsByCycle(cycle: number): Observable<Parallel[]> {
    // return this.https.get<Parallel[]>(`${url}/api/parallel/${cycle}`);
    return of([{parallelCode: 'A'}, {parallelCode: 'B'}]);
  }

	public getParallelsByStudyPlanAndCycle(periodID: number, careerID: number, studyPlanID: number, cycleID: number): Observable<Parallel[]> {
    return this.https.get<Parallel[]>(`${url}/api/academic-reports/parallel-available/${periodID}/${careerID}/${studyPlanID}/${cycleID}`);
  }
	public getCycleByStudyPlan( studyPlanID: number): Observable<Cycle[]> {
    return this.https.get<Cycle[]>(`${url}/api/cycle/study-plan/${studyPlanID}`);
  }

	public getParallels(): Observable<Parallel[]> {
    return this.https.get<Parallel[]>(`${url}/api/parallel`);
  }

  public getAllCareers(): Observable<SPGetCareer[]> {
    return this.https.get<SPGetCareer[]>(`${url}/api/career`);
  }

	public getCareersTables(): Observable<Tables<SPGetCareer>> {
    return this.https.get<Tables<SPGetCareer>>(`${url}/api/career`);
  }

  public getCareerForSection(period: number, modality: number, campus: number): Observable<CareerForSection[]> {
    return this.https.get<CareerForSection[]>(`${url}/api/career/for-section/${period}/${campus}/${modality}`);
  }

  public getModalities(page: number = 1, filter: string ='', limit = 10): Observable<Tables<SPGetModality>>{
    return this.https.get<Tables<SPGetModality>>(`${url}/api/modality?page=${page}&filter=${filter}&limit=${limit}`);
  }

	public getModalityAll(): Observable<SPGetModality[]>{
    return this.https.get<SPGetModality[]>(`${url}/api/modality/all`);
  }

	public getInstrumentEvaluationType(): Observable<InstrumentEvaluationType[]>{
    return this.https.get<InstrumentEvaluationType[]>(`${url}/api/evaluation-instr/type`);
  }

	public getInstrumentEvaluationActivity(): Observable<InstrumentEvaluationActivity[]>{
    return this.https.get<InstrumentEvaluationActivity[]>(`${url}/api/evaluation-instr/activity`);
  }

	public getInstrumentEvaluationComponent(): Observable<InstrumentEvaluationComponent[]>{
    return this.https.get<InstrumentEvaluationComponent[]>(`${url}/api/evaluation-instr/component`);
  }

  public getIncomesAndExpenses(): Observable<IncomeExpense[]> {
    return this.https.get<IncomeExpense[]>(`${url}/api/income-egress`);
  }

  public getModalitiesByCareer(career: number): Observable<SPGetModality[]> {
    return this.https.get<SPGetModality[]>(`${url}/api/modality/career/${career}`);
  }

	public getCoordinatorsByCareer(career: number): Observable<CoordinatorList[]> {
    return this.https.get<any[]>(`${url}/api/coordinator/${career}`);
  }

	public getEvaluationInstrumentsByPeriod(period: number): Observable<EvaluationInstrument[]> {
    return this.https.get<EvaluationInstrument[]>(`${url}/api/evaluation-instr/${period}`);
  }

  getAdministrativeStaffByActivityAndCareer(activityID: number, careerID: number) {
    return this.https.get(`${url}/api/teacher/administrative/${activityID}/${careerID}`);
  }
	// public getAdministrativeStaff(period?: number): Observable<EvaluationInstrument[]> {
  //   return this.https.get<EvaluationInstrument[]>(`${url}/api/teacher/administrative${period ? `/${period}` : ''}`);
  // }

	public getModalitiesByCampus(campus: number): Observable<SPGetModality[]> {
    return this.https.get<SPGetModality[]>(`${url}/api/modality/campus/${campus}`);
  }

  public getStudyPlansBySchoolAndPeriod(school: number, period: number): Observable<StudyPlan[]> {
    return this.https.get<StudyPlan[]>(`${url}/api/study-plan/for-period/${period}/${school}`);
  }

	public getStudyPlansByCareerAndPeriod(career: number, period: number): Observable<StudyPlan[]> {
    return this.https.get<StudyPlan[]>(`${url}/api/study-plan/byCareer/${period}/${career}`);
  }

	public getTeachingProcess(periodID: number, schoolID: number, careerID: number, studyPlanID: number, personID: number,): Observable<TeachingProcess[]> {
    return this.https.get<TeachingProcess[]>(`${url}/api/teaching-process/subject/${periodID}/${schoolID}/${careerID}/${studyPlanID}/${personID}`)
		.pipe(
			map((teachingProcess: TeachingProcess[]) => {
				return teachingProcess.map((item) => {
					return {
						periodID: item.periodID,
						personID: item.personID,
						classSectionNumber: item.classSectionNumber,
						parallelCode: item.parallelCode,
						courseName: item.courseName,
						a1: item.a1,
						a2: item.a2,
						a3: item.a3,
						a4: item.a4,
						a5: item.a5,
						a6: item.a6,
						a7: item.a7,
						a8: item.a8,
						a9: item.a9,
						a10: item.a10,
						total: 10,
					 }
				});
			})
		);
  }

	public getStudyPlansByCareer(careerID: number): Observable<StudyPlan[]> {
    return this.https.get<StudyPlan[]>(`${url}/api/study-plan/for-section/${careerID}`);
  }

	public getModalityByCareer(studyPlanID:number, careerID: number, courseID:number): Observable<ModalityByCareer[]> {
    return this.https.get<ModalityByCareer[]>(`${url}/api/plan-1-subject-data/header/${studyPlanID}/${careerID}/${courseID}`);
  }

  public getPaymentsByCareer(): Observable<PayMentOptions[]> {
    return this.https.get<PayMentOptions[]>(`${url}/api/payment/options`);
  }

  public getStudyPlanForSection(career: number): Observable<StudyPlanForSection[]> {
    return this.https.get<StudyPlanForSection[]>(`${url}/api/study-plan/for-section/${career}`);
  }

  public getBuildings(page: number = 1, filter: string = '', limit: number = 10 ): Observable<Tables<SPGetBuilding>>{
    return this.https.get<Tables<SPGetBuilding>>(`${url}/api/building?page=${page}&filter=${filter}&limit=${limit}`);
  }

	public getBuildingsByCampus(campus: number): Observable<SPGetBuilding[]> {
		return this.https.get<SPGetBuilding[]>(`${url}/api/building/campus/${campus}`);
	}

  public getClassroomsByBuilding(building: number, onlyClassrooms = false, onlySpecials = false): Observable<ClassRoom[]> {
    return this.https.get<ClassRoom[]>(`${url}/api/classroom/building/${building}`);
    // return this.https.get<ClassRoom[]>(`${url}/api/classroom/building/${building}?classroom=${onlyClassrooms}&special=${onlySpecials}`);
  }

  public getNumberSectionByPeriod(period: number): Observable<NumberSection> {
    return this.https.get<NumberSection>(`${url}/api/class-section/number-section/${period}`);
  }

  getClassroomType( page: number = 1, filter: string = '', limit:number = 3 ): Observable<Tables<SPGetClassroomType>>{
    return this.https.get<Tables<SPGetClassroomType>>(`${url}/api/classroom-type?page=${page}&filter=${filter}&limit=${limit}`);
  }

  getClassroom( page: number = 1, filter: string = '', limit:number = 5 ): Observable<Tables<SPGetClassroom>>{
    return this.https.get<Tables<SPGetClassroom>>(`${url}/api/classroom?page=${page}&filter=${filter}&limit=${limit}`);
  }

  getSubject( page: number = 1, filter: string = '', limit:number = 10 ): Observable<Tables<Course>>{
    return this.https.get<Tables<Course>>(`${url}/api/course?page=${page}&filter=${filter}&limit=${limit}`);
  }

  public getSubjectsFromCareer(idCareer: number): Observable<Subject[]> {
    return this.https.get<Subject[]>(`${url}/api/career-course/${idCareer}`)
      .pipe(map((subjects: Subject[]) => {
        return subjects.map((subject) => {
          const subjectColor: SubjectColor = Utils.getRandomColorPair();
          return {
            careerID: subject.careerID,
            careerName: subject.careerName,
            credits: 0,
            courseID: subject.courseID,
            cycle: null,
            depends: [],
            experimentalHours: 0,
            courseName: subject.courseName,
            faceToFaceHours: 0,
            studyPlanId: null,
            unsupervisedHours: 0,
            color: subjectColor.color,
            background: subjectColor.background
          }
        })
      }))
  }

	public getSettingstasks(periodID:number, classSectionNumber:number, componentID:number, subComponentID:number, personID:number, taskID:number, page:number, limit:number): Observable<Tables<TaskGrade>> {
    return this.https.get<Tables<TaskGrade>>(`${url}/api/settings-tasks/by-activity-grade/${periodID}/${classSectionNumber}/${componentID}/${subComponentID}/${personID}/${taskID}?page=${page}&limit=${limit}`)
  }

	public getClassSection(periodID:number, classSectionNumber:number, page:number=0, limit:number=100): Observable<Tables<Student>> {
    return this.https.get<Tables<Student>>(`${url}/api/class-section/grade/${periodID}/${classSectionNumber}?page=${page}&limit=${limit}`)
		.pipe(map((res) => {
			return {
				data: res.data.map((student) => {
					return {
					documentIdentity: student.documentIdentity,
					student: student.student,
					studentID: student.studentID,
					attendanceStatusID: 1
					}
				}),
				count: res.count
			}
		}));
  }

	public getAttendanceStudents(periodID:number, classSectionNumber:number, page:number=0, limit:number=100): Observable<Tables<Student>> {
    return this.https.get<Tables<Student>>(`${url}/api/attendance/students-attendance/${periodID}/${classSectionNumber}?page=${page}&limit=${limit}`)
  }

	public putExtraNote(body:any) {
    return this.https.put(`${url}/api/component/exams-remedial`, body)
  }

	public getAcademicReport(periodID:number, classSectionNumber:number, page:number=0, limit:number=100): Observable<Tables<StudentGrades>> {
    return this.https.get<Tables<StudentGrades>>(`${url}/api/academic-reports/grade/${periodID}/${classSectionNumber}?page=${page}&limit=${limit}`)
  }

	public getAttendanceTeacher(periodID:number, personID:number, date:string): Observable<AttendanceTeacher[]> {
    return this.https.get<AttendanceTeacher[]>(`${url}/api/attendance/teacher/${periodID}/${personID}/${date}`)
  }

	public getAttendanceTeacherCourse(periodID:number, personID:number, date:string, classSectionNumber:number): Observable<AttendanceTeacher> {
    return this.https.get<AttendanceTeacher>(`${url}/api/attendance/teacher-course/${periodID}/${personID}/${date}/${classSectionNumber}`)
  }

  public getSubjectsByCurriculum(studyPlan: number, career: number): Observable<SubjectForSection[]> {
    return this.https.get<SubjectForSection[]>(`${url}/api/career-detail-catalog/for-section/${studyPlan}/${career}`)
  }

	public getResultType(): Observable<ResultType[]> {
    return this.https.get<ResultType[]>(`${url}/api/plan-1-subject-data/result-type`)
  }

	public getUnits(): Observable<Units[]> {
    return this.https.get<Units[]>(`${url}/api/plan-2-course-schedule/units`)
  }

	public getCareerDetailCatalog(careerID: number): Observable<StudyPlan[]> {
    return this.https.get<StudyPlan[]>(`${url}/api/career-detail-catalog/studyPlan/listBy/${careerID}`)
  }

	public getCourseHours(studyPlanID:number, careerID:number, courseID:number): Observable<CourseHours[]> {
    return this.https.get<CourseHours[]>(`${url}/api/plan-2-course-schedule/hours/${studyPlanID}/${careerID}/${courseID}`)
  }

	public getEvaluationTools(): Observable<EvaluationTool[]> {
    return this.https.get<EvaluationTool[]>(`${url}/api/plan-3-learning-results/evaluation-tool`)
  }

	public getEvaluationTypes(): Observable<EvaluationType[]> {
    return this.https.get<EvaluationType[]>(`${url}/api/plan-3-learning-results/evaluation-type`)
  }

	public getProductGenerated(periodID:number, courseID:number, studyPlanID:number, careerID:number, unitID:number): Observable<ProductGenerated[]> {
    return this.https.get<ProductGenerated[]>(`${url}/api/plan-3-learning-results/product-generated/${periodID}/${courseID}/${studyPlanID}/${careerID}/${unitID}`)
  }

	public getSubjectPlan(periodID:number, courseID:number, studyPlanID:number, careerID:number): Observable<SubjectPlan[]> {
    return this.https.get<SubjectPlan[]>(`${url}/api/plan-3-learning-results/subject-plan/${periodID}/${courseID}/${studyPlanID}/${careerID}`)
  }

	public getValidateSubjectPlan(periodID:number, courseID:number, studyPlanID:number, careerID:number): Observable<any> {
    return this.https.get<any>(`${url}/api/plan-3-learning-results/validate/${periodID}/${courseID}/${studyPlanID}/${careerID}`)
  }

	public getPlan1Detail(subjectPlanID:number, planDetailID:number, positionID:number, personID:number): Observable<Plan1Detail[]> {
    return this.https.get<Plan1Detail[]>(`${url}/api/plan-1-subject-data/detail/${subjectPlanID}/${planDetailID}/${positionID}/${personID}`)
  }

	public getPlan2Detail(periodID:number, subjectPlanID:number, unitID:number, planSubDetailID:number): Observable<Plan2Detail[]> {
    return this.https.get<Plan2Detail[]>(`${url}/api/plan-2-course-schedule/detail-by-unit/${periodID}/${subjectPlanID}/${unitID}/${planSubDetailID}`)
		.pipe(
			map((plan2Detail: Plan2Detail[]) => {
				return plan2Detail.map((item) => {
					return {
						endDateUnit: item.endDateUnit,
						startDateUnit: item.startDateUnit,
						hours: item.hours,
						nroSequence: item.nroSequence,
						numberWeek: item.numberWeek,
						predecessor: item.predecessor,
						settingUnitDesc: item.settingUnitDesc,
						settingUnitsID: item.settingUnitsID
					 }
				});
			})
		);
  }

	public getPlan3Detail(periodID:number, subjectPlanID:number, unitID:number, personID:number, flag:string): Observable<Plan3Detail[]> {
    return this.https.get<Plan3Detail[]>(`${url}/api/plan-3-learning-results/${periodID}/${subjectPlanID}/${unitID}/${personID}/${flag}`)
  }

	public getPlan5Detail(periodID:number, studyPlanID:number, careerID:number, courseID:number, personID:number, flag:string): Observable<Plan5Detail[]> {
    return this.https.get<Plan5Detail[]>(`${url}/api/syllabus-subject/bibliography/${periodID}/${studyPlanID}/${careerID}/${courseID}/${personID}/${flag}`)
  }

	public getPlan5Support(periodID:number, studyPlanID:number, careerID:number, courseID:number, personID:number, flag:string): Observable<Plan5Support[]> {
    return this.https.get<Plan5Support[]>(`${url}/api/syllabus-subject/suppot-bibliography/${periodID}/${studyPlanID}/${careerID}/${courseID}/${personID}/${flag}`)
  }

	public getEvaluationCriteria(periodID:number, courseID:number, studyPlanID:number, careerID:number, unitID:number): Observable<EvaluationCriteria[]> {
    return this.https.get<EvaluationCriteria[]>(`${url}/api/plan-3-learning-results/evaluation-criteria/${periodID}/${courseID}/${studyPlanID}/${careerID}/${unitID}`)
  }

	public getGapHeader(settingUnitID:number, unitID:number, periodID:number, personID:number, subjectPlanID:number): Observable<any[]> {
    return this.https.get<any[]>(`${url}/api/gap/header/${settingUnitID}/${unitID}/${periodID}/${personID}/${subjectPlanID}`)
  }

	public getPublication(title:String): Observable<Publication[]> {
    return this.https.get<Publication[]>(`${url}/api/plan-5-bibliographic/title-publication/${title}`)
  }

	public getPublicationAvailability(): Observable<PublicationAvailability[]> {
    return this.https.get<PublicationAvailability[]>(`${url}/api/plan-5-bibliographic/availability`)
  }

	public getBibliography(titleID:number, availabilityID:number): Observable<Bibliography[]> {
    return this.https.get<Bibliography[]>(`${url}/api/plan-5-bibliographic/bibliography/${titleID}/${availabilityID}`)
  }

	public getCourseSchedule(personID:number, periodID:number, subjectPlanID:number): Observable<CourseSchedule[]> {
    return this.https.get<CourseSchedule[]>(`${url}/api/plan-2-course-schedule/${personID}/${periodID}/${subjectPlanID}`)
  }

	public getCourseScheduleContents(personID:number, periodID:number, subjectPlanID:number): Observable<settingUnit[]> {
    return this.https.get<settingUnit[]>(`${url}/api/plan-2-course-schedule/contents/${personID}/${periodID}/${subjectPlanID}`)
  }

	public getCourseScheduleTeacher(personID:number, periodID:number, subjectPlanID:number): Observable<settingUnit[]> {
    return this.https.get<settingUnit[]>(`${url}/api/plan-2-course-schedule/contact-learning/${personID}/${periodID}/${subjectPlanID}`)
  }

	public getCourseSchedulePractice(personID:number, periodID:number, subjectPlanID:number): Observable<settingUnit[]> {
    return this.https.get<settingUnit[]>(`${url}/api/plan-2-course-schedule/pract-learning/${personID}/${periodID}/${subjectPlanID}`)
  }

	public getCourseScheduleWeeks(personID:number, periodID:number, subjectPlanID:number): Observable<settingUnit[]> {
    return this.https.get<settingUnit[]>(`${url}/api/plan-2-course-schedule/week/${personID}/${periodID}/${subjectPlanID}`)
  }

	public getCourseScheduleAutonomus(personID:number, periodID:number, subjectPlanID:number): Observable<settingUnit[]> {
    return this.https.get<settingUnit[]>(`${url}/api/plan-2-course-schedule/autonomus-learning/${personID}/${periodID}/${subjectPlanID}`)
  }

	public postAttendance(body: any) {
    return this.https.post(`${url}/api/attendance`, body)
  }

	public postInstitutionOrigin(body: any) {
    return this.https.post(`${url}/api/recognition/institution-origin`, body)
  }

	public postNewSubjects(body: any) {
    return this.https.post(`${url}/api/recognition`, body)
  }

	public postBusiness(body: any) {
    return this.https.post(`${url}/api/business`, body)
  }

	public putBusiness(body: any) {
    return this.https.put(`${url}/api/business`, body)
  }

	public postBusinessCareer(body: any) {
    return this.https.post(`${url}/api/business-career`, body)
  }

	public putBusinessCareer(body: any) {
    return this.https.put(`${url}/api/business-career`, body)
  }

	public postPlan1(body: any) {
    return this.https.post(`${url}/api/plan-1-subject-data`, body)
  }

	public putPlan2(body: any) {
    return this.https.put(`${url}/api/plan-2-course-schedule`, body)
  }

	public postPlan2(body: any) {
    return this.https.post(`${url}/api/plan-2-course-schedule`, body)
  }

	public postPlan3(body: any) {
    return this.https.post(`${url}/api/plan-3-learning-results`, body)
  }

	public postGap(body: any) {
    return this.https.post(`${url}/api/gap`, body)
  }

	public putGap(body: any) {
    return this.https.put(`${url}/api/gap`, body)
  }

	public postPublication(body: any) {
    return this.https.post(`${url}/api/plan-5-bibliographic/publication`, body)
  }

	public postSupport(body: any) {
    return this.https.post(`${url}/api/plan-5-bibliographic`, body)
  }

	public postTermsConditions(body: any) {
    return this.https.post(`${url}/api/syllabus-subject/agreement`, body)
  }

	public postTeacherSubjects(body: any) {
    return this.https.post(`${url}/api/experience-matter`, body);
  }

	public postTimeAvailability(body: any) {
    return this.https.post(`${url}/api/time-availability`, body);
  }

	public updateApproval(body: any) {
    return this.https.put(`${url}/api/approval-request-bus/approval`, body);
  }

	public postProjectPractices(body: any) {
		return this.https.post(`${url}/api/project-practicas`, body);
	}

	public putProjectPractices(body: any) {
		return this.https.put(`${url}/api/project-practicas`, body);
	}

	public postProjectPracticesSubjects(body: any) {
		return this.https.post(`${url}/api/project-practicas-courses`, body);
	}

	public postProjectPracticesCareers(body: any) {
		return this.https.post(`${url}/api/project-practicas/career`, body);
	}

	public postProjectPracticesInformative(body: any) {
		return this.https.post(`${url}/api/project-prac-informative`, body);
	}

	public postProjectPracticesStudents(body: any) {
		return this.https.post(`${url}/api/project-prac-informative-students`, body);
	}

	public postProjectPracticesParticipants(body: any) {
		return this.https.post(`${url}/api/project-prac-informative/project-prac-inf-participants`, body);
	}

	public postProjectPracticesTeachers(body: any) {
		return this.https.post(`${url}/api/project-prac-informative-teacher`, body);
	}

	public postProjectPracticesImpacts(body: any) {
		return this.https.post(`${url}/api/project-impact`, body);
	}

	public postProjectPracticesObjetives(body: any) {
		return this.https.post(`${url}/api/project-objective-esp`, body);
	}

	public postProjectType(body: any) {
		return this.https.post(`${url}/api/project-type`, body);
	}

	public postProjectActivities(arr: ProjectActivityOfObjetive[]) {
		let body= {'news': arr};
		return this.https.post(`${url}/api/project-obj-esp-activity`, body);
	}

	public putProjectActivities(arr: any) {
		let body= {'updates': arr};
		return this.https.put(`${url}/api/project-obj-esp-activity`, body);
	}

	public getProjectPracticesByPeriod(periodID: number, projectPracInformativeID: number): Observable<ProjectObjetive[]> {
		return this.https.get<ProjectObjetive[]>(`${url}/api/project-prac-informative/activitiesObjective/${periodID}/${projectPracInformativeID}`);
	}

	public getProjectPracticesByPeriodValidation(periodID: number, projectPracInformativeID: number): Observable<ProjectValidation[]> {
		return this.https.get<ProjectValidation[]>(`${url}/api/project-prac-informative/validation/${periodID}/${projectPracInformativeID}`);
	}

	public getProjectPracticesAll(page: number, limit: number, filter: string, stateProject: number, periodID: number): Observable<Tables<Project>> {
		return this.https.get<Tables<Project>>(`${url}/api/project-practicas/list/${stateProject}/${periodID}?page=${page}&limit=${limit}&filter=${filter}`);
	}

	public getProjectPracticesStates(): Observable<ProjectState[]> {
		return this.https.get<ProjectState[]>(`${url}/api/project-practicas/state`);
	}

	public getProjectPracticesMicro(projectPracticasID: number, studyPlanID: number): Observable<MicroProject[]> {
		return this.https.get<MicroProject[]>(`${url}/api/project-prac-informative/${projectPracticasID}/${studyPlanID}`);
	}

	public getProjectPractices(page: number, limit: number, filter: string, periodID: number, schoolID: number,
		careerID: number, studyPlanID: number, modalityID: number, state: number): Observable<Tables<Project>> {
		return this.https.get<Tables<Project>>(`${url}/api/project-practicas/${periodID}/${schoolID}/${careerID}/${studyPlanID}/${modalityID}/${state}?init=${page}&range=${limit}&filter=${filter}`);
	}

	public getTeacherProjectPractices(page: number, limit: number, filter: string, personID: number, state: number, periodID: number): Observable<Tables<Project>> {
		return this.https.get<Tables<Project>>(`${url}/api/project-prac-informative-teacher/${personID}/${periodID}?init=${page}&limit=${limit}&filter=${filter}`);
	}

	public getProjectsByTutor(periodID: number, personID: number): Observable<MicroProject[]> {
		return this.https.get<MicroProject[]>(`${url}/api/project-practicas-courses/linkage-projects-by-tutor-by-period/${periodID}/${personID}`);
	}

	public getStudentProcessTemplate(page: number, limit: number, periodID: number): Observable<Tables<StudentProcessTemplate>> {
		return this.https.get<Tables<StudentProcessTemplate>>(`${url}/api/project-practicas-courses/student-process-template/${periodID}?page=${page}&limit=${limit}`);
	}

	public getLinkageProjectsByTutor(body: any): Observable<Tables<LinkageProject>> {
		return this.https.post<Tables<LinkageProject>>(`${url}/api/project-practicas-courses/linkage-projects-by-tutor`, body);
	}

	public getStudentsGradesLinkageList(body: any): Observable<Tables<StudentGradesLinkage>> {
		return this.https.post<Tables<StudentGradesLinkage>>(`${url}/api/project-practicas-courses/students-grade-linkage-list`, body);
	}

	public postStudentsProcessTemplate(body: any) {
		return this.https.post(`${url}/api/project-practicas-courses/student-process-template`, body);
	}

	public postFileType(body: any) {
		return this.https.post(`${url}/api/file-type`, body);
	}

	public putFileType(body: any) {
		return this.https.put(`${url}/api/file-type`, body);
	}

	public putStudentsProcessTemplate(body: any) {
		return this.https.put(`${url}/api/project-practicas-courses/student-process-template`, body);
	}

	public putStudentsGradesLinkageList(body: any) {
		return this.https.put(`${url}/api/project-practicas-courses/students-grade-linkage`, body);
	}

	public putFilesByStudent(body: any) {
		return this.https.put(`${url}/api/project-practicas-courses/files-student-linkage`, body);
	}

	public getFilesByStudent(projectPracInformativeID: number, p_personID: number): Observable<StudentBondingFile[]> {
		return this.https.get<StudentBondingFile[]>(`${url}/api/project-practicas-courses/linkage-files-by-student/${projectPracInformativeID}/${p_personID}`);
	}

	public getStudentsProjectPractices(page: number, limit: number, filter: string, studentID: number, state: number): Observable<Tables<Project>> {
		return this.https.get<Tables<Project>>(`${url}/api/project-prac-informative-students/${studentID}?init=${page}&limit=${limit}&filter=${filter}`);
	}

	public getProjectPracticesByID(periodID: number, projectPracticasID: number, careerID: number, studyPlanID: number): Observable<Project[]> {
		return this.https.get<Project[]>(`${url}/api/project-practicas/byId/${periodID}/${projectPracticasID}/${careerID}/${studyPlanID}`);
	}

  public getStudyPlan (): Observable<StudyPlan[]>{
    return this.https.get<StudyPlan[]>(`${url}/api/study-plan`);
  }

	public getTimeAvailability(periodID: number, personID: number): Observable<TimeAvailability[]>{
    return this.https.get<TimeAvailability[]>(`${url}/api/time-availability/by-person/${periodID}/${personID}`);
  }

	public getPositionContract(staffID: number): Observable<Charge[]>{
    return this.https.get<Charge[]>(`${url}/api/position/contract/${staffID}`);
  }

	public getCollaboratorPosition(personID: number): Observable<ColaboratorPosition[]>{
    return this.https.get<ColaboratorPosition[]>(`${url}/api/collaborator/position/${personID}`);
  }

  public getMatterPlan (studyPlanId: number, careerId: number, page: number = 1, filter: string = '', limit:number = 5): Observable<Tables<CareerDetail>>{
    return this.https.get<Tables<CareerDetail>>(`${url}/api/career-detail-catalog/${studyPlanId}/${careerId}?page=${page}&filter=${filter}&limit=${limit}`)
  }

  public getSubjectsByCycleAndStudyPlanAndCareerAndSection(studyPlan: number, career: number, cycle: number, period: number, modality: number, section: string): Observable<DistributiveSubject[]> {
    return this.https.get<DistributiveSubject[]>(`${url}/api/course/career-studyPlan/${studyPlan}/${career}/${cycle}/${period}/${modality}/${section}`);
			// .pipe(
			// 	map((subjects: DistributiveSubject[]) => subjects.map((subject: DistributiveSubject) => {
			// 		return {
			// 			...subject,
			// 			busyHours: 0
			// 		}
			// 	}))
			// );
  }

	public getSubjectsByPeriodCareerStudyPlanAndSection(period: number, career: number, studyPlan: number, cycle: number): Observable<InstrumentSubject[]> {
    return this.https.get<InstrumentSubject[]>(`${url}/api/career-course/byCycle/${period}/${career}/${studyPlan}/${cycle}`);
  }

	public getTeachersByPeriodSchoolCareerStudyPlanSectionAndSubject(period: number, school: number, career: number, studyPlan: number, modality: number, cycle: number, subject: number): Observable<InstrumentTeacher[]> {
    return this.https.get<InstrumentTeacher[]>(`${url}/api/teacher/${period}/${school}/${career}/${studyPlan}/${modality}/${cycle}/${subject}`);
  }

	public getTeachersByPeriodSchoolAndCareer(period: number, school: number, career: number): Observable<InstrumentTeacher[]> {
    return this.https.get<InstrumentTeacher[]>(`${url}/api/teacher/${period}/${school}/${career}`);
  }

  public getTeachersExperienceMatterBySubject(courseId: number ): Observable<Tables<TeacherCourse>>{
    // return this.https.get<Tables<TeacherCourse>>(`${url}/api/experience-matter/course/${courseId}`)
    //   .pipe(map((res) => {
    //     return {
    //       data: res.data.map((teacher) => {
    //         return {
    //           teacherID: teacher.teacherID,
    //           currentHours: 0,
    //           hours: teacher.hours,
    //           personID: teacher.personID,
    //           courseID: teacher.courseID,
    //           courseName: teacher.courseName,
    //           scheduleTypeID: teacher.scheduleTypeID,
    //           teacherName: teacher.teacherName,
    //           startPeriod: teacher.startPeriod,
    //           state: teacher.state,
    //         }
    //       }),
    //       count: res.count
    //     }
    //   }));

    const teachers: TeacherCourse[] = [
      {
        teacherID: 1,
        currentHours: 0,
        hours: 24,
        personID: 1,
        courseID: 1,
        courseName: '',
        scheduleTypeID: '',
        teacherName: 'Lic. Lisandro Sosa',
        startPeriod: 1,
        state: '',
      },
      {
        teacherID: 1,
        currentHours: 0,
        hours: 24,
        personID: 1,
        courseID: 1,
        courseName: '',
        scheduleTypeID: '',
        teacherName: 'Msc. Gabriel Ortiz',
        startPeriod: 1,
        state: '',
      },
    ];
    return of ({ data: teachers, count: 1 });
  }

	public getTeachersBySubject(subject: number): Observable<BriefTeacher[]> {
		return this.https.get<BriefTeacher[]>(`${url}/api/teacher/course/${subject}`);
	}

  public getHours(){
    return this.https.get(`${url}/api/hour`)
  }
  public getDay(){
    return this.https.get(`${url}/api/days`)
  }

  public getHoursByWorkingDayOrModuleAndModality(workingDayOrModule: number, modality: number): Observable<WorkingDayHour[]> {
    return this.https.get<WorkingDayHour[]>(`${url}/api/working-day/working-day-or-module-hour/${modality}/${workingDayOrModule}`);
  }

  public getCurriculum(studyPlanId: number, careerId: number): Observable<{ periods: CurriculumPeriod[], curriculum: Curriculum }> {
    return of(Utils.getCurriculumMatrix(this.curriculum));
    // return this.https.get<Curriculum>(`${url}/api/career-detail-catalog/${studyPlanId}/${careerId}`)
    //   .pipe(map((curriculum: Curriculum) => Utils.getCurriculumMatrix(curriculum)));
  }

  public getCycleDetail(studyPlan: number, career: number, modality: number): Observable<CycleDetail[]>{
    return  this.https.get<CycleDetail[]>(`${url}/api/cycle/career?studyPlanID=${studyPlan}&careerID=${career}&modalidadID=${modality}`);
  }

  public getCoursesDetail(studyPlan: number, career: number, modality: number, cycle: number): Observable<CoursesDetail[]>{
    return this.https.get<CoursesDetail[]>(`${url}/api/career-detail-catalog/course-detail?studyPlanID=${studyPlan}&careerID=${career}&modalidadID=${modality}&cycleID=${cycle}`)
  }

  public getAcademicLevels(): Observable<Instruction[]> {
    return this.https.get<Instruction[]>(`${url}/api/academic-instruction`);
  }

  public getProfessions(): Observable<Profession[]> {
    return this.https.get<Profession[]>(`${url}/api/profession`);
  }

  public getCivilStatuses(): Observable<CivilStatus[]> {
    return this.https.get<CivilStatus[]>(`${url}/api/general-information/3`);
  }

  public getHousingTypes(): Observable<HousingType[]> {
    return this.https.get<HousingType[]>(`${url}/api/housing-type`);
  }

  public getAcademicDegrees(): Observable<AcademicDegree[]> {
    return this.https.get<AcademicDegree[]>(`${url}/api/title-type`);
  }

  public getRelationships(): Observable<Relationship[]> {
    return this.https.get<Relationship[]>(`${url}/api/relationship`);
  }

  public getBasicServices(): Observable<BasicService[]> {
    return this.https.get<BasicService[]>(`${url}/api/basic-service`);
  }

  public getHealthTypes(): Observable<HealthType[]> {
    return this.https.get<HealthType[]>(`${url}/api/health-type`);
  }

  public getZones(): Observable<Zone[]> {
    return this.https.get<Zone[]>(`${url}/api/zone`);
  }

  public getStudentDocuments(student: number): Observable<StudentDocument[]> {
    return this.https.get<StudentDocument[]>(`${url}/api/file/person/${student}/1`).pipe(
			map((studentDocuments: StudentDocument[]) => {
				return studentDocuments.map((item) => ({
					...item,
					urlFile: `${url}/${item.urlFile}`
				}));
			})
    );
  }

  public getSchoolboyByTextQuantity(body: any): Observable<any> {
    return this.https.post(`${url}/api/person/schoolboy-by-text-quantity`, body);
  }

  public getSchoolboyByTextAndPagination(body: any): Observable<any> {
    return this.https.post(`${url}/api/person/schoolboy-by-text-and-pagination`, body);
  }

	public getStudentByFilter(filter: string): Observable<SearchedStudent[]> {
    return this.https.get<SearchedStudent[]>(`${url}/api/student/by-filter/${filter}`);
  }

  public getDocumentsStates(): Observable<SPGetFileState[]> {
    return this.https.get<SPGetFileState[]>(`${url}/api/file/state`);
  }

  public getSocioeconomicInformation(student: number): Observable<SocioeconomicInformation> {
    return this.https.get<SocioeconomicInformation>(`${url}/api/socioeconomic-sheet/student-period/${student}`);
  }

  public getStatusStudents(studentId: number): Observable<StatusStudents>{
    return this.https.get<StatusStudents>(`${url}/api/student/status-current/${studentId}`);
  }

  getPerson(id: number): Observable<SPGetPerson2>{
    return this.https.get<SPGetPerson2>(`${url}/api/person/${id}`)
  }

  getAllPersons(rolID: number = 0, init: number = 1, range: number = 0, filter: string = '%') {
    return this.https.get(`${url}/api/person/${rolID}/range/text?init=${init}&range=${range}&filter=${filter}`);
  }

  public getStudentsForFinancialReport(
    pageIndex: number,
    pageSize: number = 10,
    filter: string = '',
    sortBy?: string,
    sortType: SortDirection = 'desc',
  ): Observable<PaginatedResource<PaymentForEnrolledStudent>> {
    const relativeUrl: string = `/api/report/payment-enrolled-itca-student?page=${pageIndex}&${pageSize ? `size=${pageSize}` : ''}
      ${filter ? `&filter=${filter}` : ''}${sortType && sortBy ? `&sort=${sortBy}:${sortType}` : ''}`;
    return this.https.get<PaginatedResource<PaymentForEnrolledStudent>>(`${url}${relativeUrl}`);
  }

	public getStudentsForFinancialReportSP(
    pageIndex: number,
    pageSize: number = 10,
		periodID: number,
		careerID: number,
		statusFileID: number,
    filter: string = '',
    sortBy?: string,
    sortType: SortDirection = 'desc',
  ): Observable<PaginatedResource<PaymentForEnrolledStudent>> {
    const relativeUrl: string = `/api/report/payment-enrolled-itca-student-sp?page=${pageIndex}&${pageSize ? `size=${pageSize}` : ''}
      ${sortType && sortBy ? `&sort=${sortBy}:${sortType}` : ''}${`&periodID=${periodID}`}${`&careerID=${careerID}`}
			${`&statusFileID=${statusFileID}`}${`&filter=${filter}`}`;
    return this.https.get<PaginatedResource<PaymentForEnrolledStudent>>(`${url}${relativeUrl}`);
  }

  public getEnrolledITCAStudents(
    pageIndex: number,
    pageSize: number = 10,
    filter: string = '',
    sortBy?: string,
    sortType: SortDirection = 'desc',
  ): Observable<PaginatedResource<EnrolledStudent>> {
    const relativeUrl: string = `/api/report/enrolled-itca-student?page=${pageIndex}&${pageSize ? `size=${pageSize}` : ''}
      ${filter ? `&filter=${filter}` : ''}${sortType && sortBy ? `&sort=${sortBy}:${sortType}` : ''}`;
    return this.https.get<PaginatedResource<EnrolledStudent>>(`${url}${relativeUrl}`);
  }

	getSignatureRepeat(): Observable<SignatureRepeat[]>{
		return this.https.get<SignatureRepeat[]>(`${url}/api/student/failed-courses`)
	}

	getScheduleSignatureRepeat( courseID: number): Observable<ScheduleSignatureRepeat[]>{
		return this.https.get<ScheduleSignatureRepeat[]>(`${url}/api/student/schedule-course/${courseID}`)
	}

  //TODO: mapping result
  getSocioEconomicSheet( personID: number, studentID: number): Observable<any>{
    return this.https.get(`${url}/api/enroll/reports/ficha_socieconomica/${personID}/${studentID}`)
  }


  getAllCourses(): Observable<CourseDetailShort[]> {
    return this.https.get<CourseDetailShort[]>(`${url}/api/course/all`);
  }

	getTeacherSubjects(personID: number): Observable<ExperienceMatter[]> {
    return this.https.get<ExperienceMatter[]>(`${url}/api/experience-matter/${personID}`);
  }

  getTimeAvailableTeacher(periodId:number, courseId:number, limit:number=10, page:number=1): Observable<Tables<TimeAvailabilityTeacher>> {
    return this.https.get<Tables<TimeAvailabilityTeacher>>(`${url}/api/time-availability/teacher/${periodId}/${courseId}?limit=${limit}&page=${page}`);
  }

	getTeacherFollowUp(periodId:number, schoolID:number, careerID:number, studyPlanID:number, page:number, limit:number): Observable<Tables<TeacherFollowUp>> {
    return this.https.get<Tables<TeacherFollowUp>>(`${url}/api/teaching-process/${periodId}/${schoolID}/${careerID}/${studyPlanID}?page=${page}&limit=${limit}`);
  }

  getCurrentPeriodItca(): Observable<CurrentPeriodItca> {
    return this.https.get<CurrentPeriodItca>(`${url}/api/period/itca`);
  }

  getAllDistributiveSchedule(periodID:number,buildingID:number,classroomID:number): Observable<any> {
    return this.https.get<any>(`${url}/api/classroom/byBusy/${periodID}/${buildingID}/${classroomID}`);
  }

  getAllBuilds(): Observable<any> {
    return this.https.get<any>(`${url}/api/building/all`);
  }

  getDistributiveByStudyPlan(periodId:number,studyPlanId:number,schoolId:number,careerId:number): Observable<any> {
    return this.https.get<any>(`${url}/api/course/career-schedule/${periodId}/${studyPlanId}/${schoolId}/${careerId}`);
  }


  ///api/class-section/report-course/:periodId/:schoolId/:planStudyId/:careerId
  getReportExcel(
    periodId:number,
    schoolId:number,
    planStudyId:number,
    careerId:number
  ): Observable<any> {
    return this.https.get<any>(`${url}/api/class-section/report-course/${periodId}/${schoolId}/${planStudyId}/${careerId}`);
  }
  /* *************************************** ------------- ******************************************* */


  /* *********************************** SERVICIOS POST *********************************************** */

  postPeriod( period: Period):Observable<Period>{
    return this.https.post<Period>(`${url}/api/period`, period);
  }

	putPeriod( period: Period):Observable<Period>{
    return this.https.put<Period>(`${url}/api/period`, period);
  }

  postCampus( campus: Campus):Observable<Campus>{
    return this.https.post<Campus>(`${url}/api/campus`, campus);
  }

	putCampus( campus: Campus):Observable<Campus>{
    return this.https.put<Campus>(`${url}/api/campus`, campus);
  }

  postSchool ( school: School): Observable<School>{
    return this.https.post<School>(`${url}/api/school`, school);
  }

	putSchool ( school: School): Observable<School>{
    return this.https.put<School>(`${url}/api/school`, school);
  }

	getUsersRoles( page: number = 1, filter: string='', limit: number = 10):Observable<Tables<usersRoles>>{
    return this.https.get<Tables<usersRoles>>(`${url}/api/user-rol?page=${page}&filter=${filter}&limit=${limit}`);
  }

	getMenus( page: number, filter: string, limit: number):Observable<Tables<MenuSettings>>{
    return this.https.get<Tables<MenuSettings>>(`${url}/api/setting-menu-user?page=${page}&filter=${filter}&limit=${limit}`);
  }

	postUsersRoles(body:any){
    return this.https.post(`${url}/api/user`, body);
  }

	postRoles(body:any){
    return this.https.post(`${url}/api/user-rol`, body);
  }

	postGroups(body:any){
    return this.https.post(`${url}/api/group-user`, body);
  }

	postDocumentManagement(body: any){
    return this.https.post(`${url}/api/document-management`, body);
  }

	putDocumentManagement(body: any){
    return this.https.put(`${url}/api/document-management/update-document-management`, body);
  }

	postDocumentManagementSettings(body: any){
    return this.https.post(`${url}/api/document-management/management-setting`, body);
  }

	getRoles():Observable<Roles[]>{
    return this.https.get<Roles[]>(`${url}/api/rol`);
  }

	getTypeRoles():Observable<TypeRol[]>{
    return this.https.get<TypeRol[]>(`${url}/api/document-management/type-rol`);
  }

	getRolByTypeRolID(typeRolID: number):Observable<Roles[]>{
    return this.https.get<Roles[]>(`${url}/api/rol/type-role/${typeRolID}`);
  }

	getTypeManagement():Observable<TypeManagement[]>{
    return this.https.get<TypeManagement[]>(`${url}/api/document-management/type-management`);
  }

	getDocumentManagementByFilterAndPagination(body: any):Observable<Tables<DocumentManagement>>{
    return this.https.post<Tables<DocumentManagement>>(`${url}/api/document-management/document-management-by-filter-and-pagination`, body);
  }

	getGroupModule():Observable<Tables<Groups>>{
    return this.https.get<Tables<Groups>>(`${url}/api/group-module`);
  }

	getGroups():Observable<Tables<Groups>>{
    return this.https.get<Tables<Groups>>(`${url}/api/group?page=0&limit=50`);
  }

	getAllGroups():Observable<Tables<Groups>>{
    return this.https.get<Tables<Groups>>(`${url}/api/group`);
  }

	getPaginatedUsers(rolID: number ,page: number, limit: number ,filter: string):Observable<Tables<User>>{
    return this.https.get<Tables<User>>(`${url}/api/user/by-rol/${rolID}?page=${page}&limit=${limit}&filter=${filter}`);
  }

	getUsers(filter:string):Observable<User[]>{
    return this.https.get<User[]>(`${url}/api/user/${filter}`);
  }

	getUsersByTypeRol(typeRolID: number, filter: string):Observable<UserByTypeRol[]>{
    return this.https.get<UserByTypeRol[]>(`${url}/api/user/type-rol/${typeRolID}?filter=${filter}`).pipe(
			map((users: UserByTypeRol[]) => {
				return users.map((item) => ({
					...item,
					selected: false
				}));
			})
    );
  }

	getUsersByRolID(rolID: number, filter: string):Observable<UserByTypeRol[]>{
    return this.https.get<UserByTypeRol[]>(`${url}/api/user/name-or-document-number/${rolID}?filter=${filter}`).pipe(
			map((users: UserByTypeRol[]) => {
				return users.map((item) => ({
					...item,
					selected: false
				}));
			})
    );
  }

	getUsersByTypeRolID(typeRoleID: number, periodID: number, areaID: number, filter: string):Observable<UserByTypeRol[]>{
    return this.https.get<UserByTypeRol[]>(`${url}/api/user/name-or-document-number/${periodID}/${typeRoleID}/${areaID}?filter=${filter}`).pipe(
			map((users: UserByTypeRol[]) => {
				return users.map((item) => ({
					...item,
					selected: false
				}));
			})
    );
  }

	getUsersByAreaID(areaID: number, filter: string):Observable<UserByTypeRol[]>{
    return this.https.get<UserByTypeRol[]>(`${url}/api/user/name-or-document-number-by-area/${areaID}?filter=${filter}`).pipe(
			map((users: UserByTypeRol[]) => {
				return users.map((item) => ({
					...item,
					selected: false
				}));
			})
    );
  }

	postMessageManagement(body: FormData){
    return this.https.post(`${url}/api/message-management`, body);
  }

	postMessageManagementReply(body: FormData){
    return this.https.post(`${url}/api/message-management/reply`, body);
  }

	getManagementInboxSent(body: any): Observable<Tables<ManagementInboxSent>>{
    return this.https.post<Tables<ManagementInboxSent>>(`${url}/api/document-management/inbox-or-outbox`, body);
  }

	getPersonsToMessage(body: any):Observable<Count>{
    return this.https.post<Count>(`${url}/api/message-management/count-persons-to-message`, body);
  }

	getMessageInfo(personID: number, studentID: number): Observable<ProcedureUserInfo>{
    return this.https.get<ProcedureUserInfo>(`${url}/api/message-management/info-student/${personID}/${studentID}`);
  }

	getMessageManagementContent(messageID: number): Observable<MessageManagementContent>{
    return this.https.get<MessageManagementContent>(`${url}/api/message-management/message-management-content/${messageID}`);
  }

	putMessageManagementContent(messageID: number) {
    return this.https.put(`${url}/api/message-management/to-view/${messageID}`, {});
  }

	getMessageReplyByMessage(messageID: number): Observable<MessageReply[]>{
    return this.https.get<MessageReply[]>(`${url}/api/message-management/reply/by-message/${messageID}`);
  }

	getMessageReplyByReply(replyID: number): Observable<MessageReply[]>{
    return this.https.get<MessageReply[]>(`${url}/api/message-management/reply/by-reply/${replyID}`);
  }

	getModule():Observable<confModules[]>{
    return this.https.get<confModules[]>(`${url}/api/module`);
  }

	getParentMenu(moduleID:number):Observable<confMenu[]>{
    return this.https.get<confMenu[]>(`${url}/api/menu/parent/${moduleID}`);
  }

	getChildMenu(menuID:number):Observable<confMenu[]>{
    return this.https.get<confMenu[]>(`${url}/api/menu/child/${menuID}`);
  }

	getResultsLearning(periodID:number, schoolID:number, careerID:number, studyPlanID:number, courseID:number, flag:string):Observable<ResultLearning[]>{
    return this.https.get<ResultLearning[]>(`${url}/api/plan-2-course-schedule/results-learning/${periodID}/${schoolID}/${careerID}/${studyPlanID}/${courseID}/${flag}`);
  }

	getPlan1SubjectData(periodID:number, schoolID:number, careerID:number, studyPlanID:number, modalityID:number):Observable<SubjectData[]>{
    return this.https.get<SubjectData[]>(`${url}/api/plan-1-subject-data/week/${periodID}/${schoolID}/${careerID}/${studyPlanID}/${modalityID}`);
  }

	getPlan1Holidays(startDate: string | Date, endDate: string | Date):Observable<HolidayCount>{
    return this.https.get<HolidayCount>(`${url}/api/plan-1-subject-data/Holidays/${startDate}/${endDate}`);
  }

	getPlan1WorkWeeks(startDate: string | Date, endDate: string | Date):Observable<WorkWeek[]>{
    return this.https.get<WorkWeek[]>(`${url}/api/plan-1-subject-data/work-weeks/${startDate}/${endDate}`);
  }

	getTermsConditions():Observable<TermsAndConditions[]>{
    return this.https.get<TermsAndConditions[]>(`${url}/api/syllabus-subject/terms-and-conditions`);
  }

	getValidateGap(periodID:number, schoolID:number, careerID:number, studyPlanID:number, courseID:number, personID:number, unitID:number):Observable<string>{
    return this.https.get<string>(`${url}/api/gap/validate/${periodID}/${schoolID}/${careerID}/${studyPlanID}/${courseID}/${personID}/${unitID}`);
  }

	validatePracticeGap(periodID:number, schoolID:number, careerID:number, studyPlanID:number, courseID:number):Observable<string>{
    return this.https.get<string>(`${url}/api/gap/validate-practice/${periodID}/${schoolID}/${careerID}/${studyPlanID}/${courseID}`);
  }

	getGapByUnit(periodID:number, schoolID:number, careerID:number, studyPlanID:number, courseID:number, personID:number, unitID:number, parallel: string):Observable<Gap[]>{
    return this.https.get<Gap[]>(`${url}/api/gap/byUnit/${periodID}/${schoolID}/${careerID}/${studyPlanID}/${courseID}/${personID}/${unitID}/${parallel}`);
  }

	getSyllabusSubject(periodID:number, studyPlanID:number, careerID:number, courseID:number, page:number, limit:number):Observable<Tables<SyllabusSubject>>{
    return this.https.get<Tables<SyllabusSubject>>(`${url}/api/syllabus-subject/coordinator/${periodID}/${studyPlanID}/${careerID}/${courseID}?page=${page}&limit=${limit}`);
  }

	public getSyllabusSubjectPrincipal(periodID:number, schoolID:number, careerID:number, studyPlanID:number, page:number, limit:number): Observable<Tables<SyllabusSubject>> {
    return this.https.get<Tables<SyllabusSubject>>(`${url}/api/syllabus-subject/principal-coordinator/${periodID}/${schoolID}/${careerID}/${studyPlanID}?page=${page}&limit=${limit}`);
  }

	public getUserProfileReport(personID:number,rolID:number): Observable<HttpResponse<Blob>> {
		const headers = new HttpHeaders();
    return this.https.get(`${url}/api/user/user-profile/${personID}/${rolID}`, { headers, observe: 'response', responseType: 'blob' })
  }

  getUserProfiles(personID:number) {
    return this.https.get(`${url}/api/user/profiles/${personID}`)
  }

	public getSyllabusSubjecPdfContent(periodID:number, studyPlanID:number, careerID:number, courseID:number, personID:number, user:string): Observable<HttpResponse<Blob>> {
		const headers = new HttpHeaders();
    return this.https.get(`${url}/api/syllabus-subject/${periodID}/${studyPlanID}/${careerID}/${courseID}/${personID}/${user}`, { headers, observe: 'response', responseType: 'blob' })
  }

	public getAcademicReportsPdfContent(periodID:number, classSectionNumber:number): Observable<HttpResponse<Blob>> {
		const headers = new HttpHeaders();
    return this.https.get(`${url}/api/academic-reports/students/${periodID}/${classSectionNumber}`, { headers, observe: 'response', responseType: 'blob' })
  }

	public getProjectPracticesPdfContent(periodID: number, projectPracticasID: number, careerID: number, studyPlanID: number): Observable<HttpResponse<Blob>> {
		const headers = new HttpHeaders();
    return this.https.get(`${url}/api/project-practicas/project-sheet/${periodID}/${projectPracticasID}/${careerID}/${studyPlanID}`, { headers, observe: 'response', responseType: 'blob' })
  }

	public getPdfBaseEvaluationInstrument(body: any): Observable<HttpResponse<Blob>> {
		const headers = new HttpHeaders();
    return this.https.post(`${url}/api/evaluation-instruments-report/pdf-base-evaluation-instrument`, body, { headers, observe: 'response', responseType: 'blob' })
  }

	public getProjectPracticesExcelContent(projectPracInformativeID: number): Observable<HttpResponse<Blob>> {
		const headers = new HttpHeaders();
    return this.https.get(`${url}/api/project-prac-informative/general-project-practices/${projectPracInformativeID}`, { headers, observe: 'response', responseType: 'blob' })
  }

	public getProfileBusinessPdfContent(ruc: string): Observable<HttpResponse<Blob>> {
		const headers = new HttpHeaders();
    return this.https.get(`${url}/api/business/profile-business/${ruc}`, { headers, observe: 'response', responseType: 'blob' })
  }

	public getProjectPracticesInformativePdfContent(projectPracticasID: number): Observable<HttpResponse<Blob>> {
		const headers = new HttpHeaders();
    return this.https.get(`${url}/api/project-prac-informative/project-informativa/${projectPracticasID}`, { headers, observe: 'response', responseType: 'blob' })
  }

	public getAcademicReportsExcelContent(periodID:number, classSectionNumber:number): Observable<HttpResponse<Blob>> {
		const headers = new HttpHeaders();
    return this.https.get(`${url}/api/academic-reports/students-excel/${periodID}/${classSectionNumber}`, { headers, observe: 'response', responseType: 'blob' })
  }

	public getAgreementConventionLetterFormat(agreementConventionsID: number): Observable<HttpResponse<Blob>> {
		const headers = new HttpHeaders();
    return this.https.get(`${url}/api/agreement-conventions/letter-format/${agreementConventionsID}`, { headers, observe: 'response', responseType: 'blob' })
  }

	public getAcademicReportsGradesPdfContent(periodID:number, classSectionNumber:number): Observable<HttpResponse<Blob>> {
		const headers = new HttpHeaders();
    return this.https.get(`${url}/api/academic-reports/students-grade/${periodID}/${classSectionNumber}`, { headers, observe: 'response', responseType: 'blob' })
  }

	public getAcademicReportsGradesExcelContent(periodID:number, classSectionNumber:number): Observable<HttpResponse<Blob>> {
		const headers = new HttpHeaders();
    return this.https.get(`${url}/api/academic-reports/students-grade-excel/${periodID}/${classSectionNumber}`, { headers, observe: 'response', responseType: 'blob' })
  }

	public getAcademicReportsGeneralPdfContent(periodID:number, personID:number): Observable<HttpResponse<Blob>> {
		const headers = new HttpHeaders();
    return this.https.get(`${url}/api/academic-reports/general/${periodID}/${personID}`, { headers, observe: 'response', responseType: 'blob' })
  }

	public getReportInstruments(rute: string, body: any): Observable<HttpResponse<Blob>> {
		const headers = new HttpHeaders();
    return this.https.post(`${url}/api/${rute}`, body, { headers, observe: 'response', responseType: 'blob' })
  }

	public getReportPendingStudents(settingEvaluationInstrumentID: number, periodID: number): Observable<HttpResponse<Blob>> {
		const headers = new HttpHeaders();
    return this.https.get(`${url}/api/evaluation-instruments-report/students-not-resolve-instrument/${settingEvaluationInstrumentID}/${periodID}`, { headers, observe: 'response', responseType: 'blob' })
  }

	public getGapReportPdf(periodID:number, schoolID:number, careerID:number, studyPlanID:number, courseID:number, personID:number, unitID:number, parallelCode:string): Observable<HttpResponse<Blob>> {
		const headers = new HttpHeaders();
    return this.https.get(`${url}/api/gap/${periodID}/${schoolID}/${careerID}/${studyPlanID}/${courseID}/${personID}/${unitID}/${parallelCode}`, { headers, observe: 'response', responseType: 'blob' })
  }

	public getCareerDetailCatalogReportPdf(careerID:number, studyPlanID:number): Observable<HttpResponse<Blob>> {
		const headers = new HttpHeaders();
    return this.https.get(`${url}/api/career-detail-catalog/studyPlan/${careerID}/${studyPlanID}`, { headers, observe: 'response', responseType: 'blob' })
  }

	public getAcademicReportsGeneralExcelContent(periodID:number, personID:number): Observable<HttpResponse<Blob>> {
		const headers = new HttpHeaders();
    return this.https.get(`${url}/api/academic-reports/general-excel/${periodID}/${personID}`, { headers, observe: 'response', responseType: 'blob' })
  }

	postUserPermissions(body:any){
    return this.https.post(`${url}/api/setting-menu-user/assign-permissions`, body);
  }

	postSettingModulePeriod(body:any){
    return this.https.post(`${url}/api/setting-module-period`, body);
  }

	postModule(body:any){
    return this.https.post(`${url}/api/module`, body);
  }

	postMenu(body:any){
    return this.https.post(`${url}/api/menu`, body);
  }

	postUserMenu(body:any){
    return this.https.post(`${url}/api/setting-menu-user`, body);
  }

	schoolStatus( body:any ){
		return this.https.put(`${url}/api/school/status`, body);
	}

	postCarrerCourse ( body: any){
    return this.https.post(`${url}/api/career-course`, body);
  }

  postCarrer ( career: SPGetCareer): Observable<SPGetCareer>{
    return this.https.post<SPGetCareer>(`${url}/api/career`, career);
  }

	putCarrer ( career: SPGetCareer): Observable<SPGetCareer>{
    return this.https.put<SPGetCareer>(`${url}/api/career`, career);
  }

  postModality( modality: SPGetModality ): Observable<SPGetModality>{
    return this.https.post<SPGetModality>(`${url}/api/modality`, modality);
  }

	putModality( modality: SPGetModality ): Observable<SPGetModality>{
    return this.https.put<SPGetModality>(`${url}/api/modality`, modality);
  }

	putStatusModality( body:any ): Observable<any>{
    return this.https.put(`${url}/api/modality/status`, body);
  }

	putStatusSchool( body:any ): Observable<any>{
    return this.https.put(`${url}/api/school/status`, body);
  }

	putStatusCampus( body:any ): Observable<any>{
    return this.https.put(`${url}/api/campus/status`, body);
  }

	putStatusCareer( body:any ): Observable<any>{
    return this.https.put(`${url}/api/career/status`, body);
  }

	putStatusCoordinator( body:any ): Observable<any>{
    return this.https.put(`${url}/api/coordinator`, body);
  }

	putStatusDirector( body:any ): Observable<any>{
    return this.https.put(`${url}/api/school-director/update-status`, body);
  }

  postBuilding( building: SPGetBuilding ): Observable<SPGetBuilding>{
    return this.https.post<SPGetBuilding>(`${url}/api/building`, building);
  }

	putBuilding( building: SPGetBuilding ): Observable<SPGetBuilding>{
    return this.https.put<SPGetBuilding>(`${url}/api/building`, building);
  }

  postClassroomType( classroomType: SPGetClassroomType ): Observable<SPGetClassroomType>{
    return this.https.post<SPGetClassroomType>(`${url}/api/classroom-type`, classroomType);
  }

  postClassroom( classroom: SPGetClassroom ): Observable<SPGetClassroom>{
    return this.https.post<SPGetClassroom>(`${url}/api/classroom`, classroom);
  }

	postTeacherPosition(body: any){
    return this.https.post(`${url}/api/teacher/position`, body);
  }

  postSubject( form: Course ):Observable<Course>{
    return this.https.post<Course>(`${url}/api/course`, form);
  }

	putSubject( form: Course ): Observable<Course> {
    return this.https.put<Course>(`${url}/api/course`, form);
  }

	subjectStatus( body:any ){
		return this.https.put(`${url}/api/course/status`, body);
	}

	subjectExperienceStatus( body:any ){
		return this.https.put(`${url}/api/experience-matter/status`, body);
	}

  public postCurriculum(curriculum: Curriculum, major: number): Observable<Curriculum> {
    const filteredAndFlattenedCurriculum = Utils.filterAndFlatCurriculum(curriculum, major);
		console.log(Utils.filterAndFlatCurriculum(curriculum, major));
    return this.https.post<Curriculum>(`${url}/api/career-detail-catalog/setting-mesh`, filteredAndFlattenedCurriculum);
  }

  public postModeler(modeler: any): Observable<any> {
    return this.https.post<Curriculum>(`${url}/api/academic-schedule/schedule-setting`, modeler);
  }

  public postStudentDocument(fileType: number, file: File, fielId:number): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    return this.https.post(`${url}/api/file/docs/1/${fielId}/${fileType}`, formData);
  }

	public postTaskDocs(file: File, taskID:number, periodID:number, nroSequence:number, parallelCode:string){
    const formData: FormData = new FormData();
    formData.append('file', file);
    return this.https.post(`${url}/api/settings-tasks/docs/${taskID}/${periodID}/${nroSequence}/${parallelCode}`, formData);
  }

	public postStudentTask(formData:FormData){
    return this.https.post(`${url}/api/student-tasks`, formData);
  }

	public putStudentTask(formData:FormData){
    return this.https.put(`${url}/api/student-tasks`, formData);
  }

  public postProofPayment(fileType: number, paymentProof: PaymentProof): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('paymentDate', paymentProof.paymentDate as string);
    formData.append('file', paymentProof.file as File);
    formData.append('voucher', paymentProof.voucher);
    return this.https.post(`${url}/api/file/images/1/${fileType}/01`, formData);
  }

  //api/file/payment/:entity/:voucherNumber/:payDay/:fileID
  public postFilePayment(paymentProof: PaymentProof): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', paymentProof.file as File);
    //console.log('paymentProof',paymentProof);

    paymentProof.paymentDate = new Date(paymentProof.paymentDate).toISOString().split('T')[0];
    return this.https.put(`${url}/api/file/payment/1/${paymentProof.voucher}/${paymentProof.paymentDate}/${paymentProof.fileId}`, formData);
  }

  getFilesToUpload(personId:number, companyId:number, processId:string, studentId: number): Observable<any> {
    return this.https.get<any>(`${url}/api/file/person/process/${personId}/${companyId}/${processId}/${studentId}`);
  }

  public postEnrollment(form: EnrollmentPost){
    return this.https.post(`${url}/api/enroll`, form);
  }

  public postSocioeconomicForm1(body: SocioeconomicForm1): Observable<any> {
    return this.https.post(`${url}/api/family-personal-info`, body);
  }

  public postSocioeconomicForm2(body: SocioeconomicForm2): Observable<any> {
    return this.https.post(`${url}/api/person-info-family-group`, body);
  }

  public postSocioeconomicForm3(body: SocioeconomicForm3): Observable<any> {
    return this.https.post(`${url}/api/job-experience/socio-economic-sheet`, body);
  }

  public postSocioeconomicForm4(body: SocioeconomicForm4): Observable<any> {
    // body.incomes.forEach(incomes => {
    //   delete incomes.name;
    // });
    // body.expenses.forEach(expense => {
    //   delete expense.name;
    // });
    return this.https.post(`${url}/api/family-economic-data`, body);
  }

  public postSocioeconomicForm5(body: SocioeconomicForm5): Observable<any> {
    return this.https.post(`${url}/api/housing-information`, body);
  }

  public postSocioeconomicForm6(body: SocioeconomicForm6): Observable<any> {
    return this.https.put(`${url}/api/socioeconomic-sheet/health`, body);
  }

  public postSocioeconomicForm7(body: SocioeconomicForm7): Observable<any> {
    const { academicDegree } = body;
    const data = academicDegree.map((item:any) => {
      return {
        socioeconomicSheetID: item.socioeconomicSheetID,
        titleTypeID: item.titleTypeID,
        educationSkillName: item.educationSkillName,
      }
    })
    console.log(data);

    return this.https.post(`${url}/api/education-skill`, data);
  }

	postSignatureRepeat( form: any){
		return this.https.post(`${url}/api/enroll/student`, form);
	}

	postStudentEnrollment( form: any){
		return this.https.post(`${url}/api/enroll/student-all`, form);
	}

	public postFailedSubjects(form: RetrieveAvailable[]): Observable<EnrolledSubjects>{
		return this.https.post<EnrolledSubjects>(`${url}/api/enroll/payment-concepts-by-failed-subjects`, {'schedules': form});
	}

	public deleteUserWorkOnTemporalSubjectSchedule(): Observable<any> {
		return this.https.delete(`${url}/api/temp-class-section/changes`);
	}

  public postTemporalSubject(filters: Filter, day: DayFormValue): Observable<TemporalCode> {
		const body: TemporalPostSubjectSchedule = Utils.bodyToCreateTemporalSubjectSchedule(filters, day);
    return this.https.post<TemporalCode>(`${url}/api/temp-class-section`, body);
  }

	public postSchedule(periodId: number): Observable<any> {
		const body = { periodID: periodId };
		return this.https.post<TemporalCode>(`${url}/api/class-section`, body);
	}

  public updateTemporalSubject(id: string, classRoom: number): Observable<any> {
		const body = { classRoomID: classRoom };
    return this.https.put(`${url}/api/temp-class-section/course/${id}`, body);
  }

	public deleteTemporalSubject(ids: string[]): Observable<any> {
		const body = {
			classSectionCode: ids
		};
		return this.https.delete(`${url}/api/temp-class-section/classSectionCode`, { body });
	}

  getDistibutive(periodId:number,careerId:number,cycleId:number): Observable<any> {
    return this.https.get(`${url}/api/class-section/distributive/${periodId}/${careerId}/${cycleId}`);
  }

  getCareesCurrentPerod(): Observable<any> {
    return this.https.get(`${url}/api/career/active-period`);
  }

  getCycles(): Observable<Cycle[]> {
    return this.https.get<Cycle[]>(`${url}/api/cycle`);
  }

	public getCyclesByPerson(personID: number): Observable<Cycle[]> {
    return this.https.get<Cycle[]>(`${url}/api/cycle/person/${personID}`);
  }

	public getGradeLinkageByPerson(personID: number, modalityPracticeID: number): Observable<GradeLinkage[]> {
    return this.https.get<GradeLinkage[]>(`${url}/api/project-practicas-courses/grade-linkage-by-person/${personID}/${modalityPracticeID}`);
  }

	public getModalityPractices(): Observable<ProjectPracticeModality[]> {
    return this.https.get<ProjectPracticeModality[]>(`${url}/api/project-practicas-courses/modality-practice`);
  }

	public getCoursesLinkage(body: any): Observable<CoursesLinkage[]> {
    return this.https.post<CoursesLinkage[]>(`${url}/api/project-practicas-courses/courses-linkage`, body);
  }

	public getStudentProcessFIles(body: any) {
    return this.https.post(`${url}/api/project-practicas-courses/student-process-file`, body);
  }

  getScheduleDistibutive(obj:any): Observable<any> {
    const {
      periodId,
      schoolId,
      planStudyId,
      careerId,
      modalityId,
      moduleId,
      sectionId,
      cycleId,
      parallelCode
    } = obj
    return this.https.get(`${url}/api/class-section/schedule/${periodId}/${schoolId}/${planStudyId}/${careerId}/${modalityId}/${moduleId}/${sectionId}/${cycleId}/${parallelCode}`);
  }


  getPaymentsArrastres(studentID: number): Observable<any> {
    return this.https.get(`${url}/api/payment/conceptsArrastres/${studentID}`);
  }

  public getPdfContent(url: string): Observable<HttpResponse<Blob>> {
    const headers = new HttpHeaders();
    return this.https.get(url, { headers, observe: 'response', responseType: 'blob' });
  }

	public getCalendarEventReport(periodID: number, calendarTypeID: number, statusID: number): Observable<HttpResponse<Blob>> {
    const headers = new HttpHeaders();
    return this.https.get(`${url}/api/calendar/events-excel/${periodID}/${calendarTypeID}/${statusID}`, { headers, observe: 'response', responseType: 'blob' });
  }

	public getStudentsGradeLinkageReport(projectPracInformativeID: number, tutorPersonID: number): Observable<HttpResponse<Blob>> {
    const headers = new HttpHeaders();
    return this.https.get(`${url}/api/project-practicas-courses/students-grade-linkage-report/${projectPracInformativeID}/${tutorPersonID}`, { headers, observe: 'response', responseType: 'blob' });
  }

	public getProjectStatusReport(statusProject: number, periodID: number): Observable<HttpResponse<Blob>> {
    const headers = new HttpHeaders();
    return this.https.get(`${url}/api/project-practicas/project-status/${statusProject}/${periodID}`, { headers, observe: 'response', responseType: 'blob' });
  }

	getJobExperience(): Observable<any> {
    return this.https.get(`${url}/api/job-experience-type`);
  }

  getScholarships(): Observable<any> {
    return this.https.get(`${url}/api/scholarship`);
  }

  getScholarshipByID(scholarshipID: number): Observable<any> {
    return this.https.get(`${url}/api/scholarship/by-id/${scholarshipID}`);
  }

  saveScholarship(body: any): Observable<any> {
    return this.https.post(`${url}/api/scholarship`, body);
  }

  deleteScholarship(body: any): Observable<any> {
    return this.https.post(`${url}/api/scholarship/delete`, body);
  }

  updateScholarship(body: any): Observable<any> {
    return this.https.put(`${url}/api/scholarship`, body);
  }

  getScholarshipConfigs(): Observable<any> {
    return this.https.get(`${url}/api/scholarship/config`);
  }

  saveScholarshipConfig(body: any): Observable<any> {
    return this.https.post(`${url}/api/scholarship/config`, body);
  }

  updateScholarshipConfig(body: any): Observable<any> {
    return this.https.put(`${url}/api/scholarship/config`, body);
  }

  deleteScholarshipConfig(body: any): Observable<any> {
    return this.https.put(`${url}/api/scholarship/config/delete`, body);
  }

  getScholarshipConfigFiles(): Observable<any> {
    return this.https.get(`${url}/api/scholarship/file`);
  }

  saveScholarshipConfigFile(body: any): Observable<any> {
    return this.https.post(`${url}/api/scholarship/file`, body);
  }

  updateScholarshipConfigFile(body: any): Observable<any> {
    return this.https.put(`${url}/api/scholarship/file`, body);
  }

  deleteScholarshipConfigFile(body: any): Observable<any> {
    return this.https.put(`${url}/api/scholarship/file/delete`, body);
  }

  getSurveys(): Observable<any> {
    return this.https.get(`${url}/api/survey`);
  }

  saveSurveys(body: any): Observable<any> {
    return this.https.post(`${url}/api/survey`, body);
  }

  updateSurveys(body: any): Observable<any> {
    return this.https.put(`${url}/api/survey`, body);
  }

  getQuestions(): Observable<any> {
    return this.https.get(`${url}/api/question`);
  }

  saveQuestions(body: any): Observable<any> {
    return this.https.post(`${url}/api/question`, body);
  }

  updateQuestions(body: any): Observable<any> {
    return this.https.put(`${url}/api/question`, body);
  }

  getAlternatives(): Observable<any> {
    return this.https.get(`${url}/api/alternative`);
  }

  saveAlternatives(body: any): Observable<any> {
    return this.https.post(`${url}/api/alternative`, body);
  }

  updateAlternatives(body: any): Observable<any> {
    return this.https.put(`${url}/api/alternative`, body);
  }

  getQuestionTypes(): Observable<any> {
    return this.https.get(`${url}/api/question-type`);
  }

  saveQuestionTypes(body: any): Observable<any> {
    return this.https.post(`${url}/api/question-type`, body);
  }

  updateQuestionTypes(body: any): Observable<any> {
    return this.https.put(`${url}/api/question-type`, body);
  }

  getCompletedSurveys(): Observable<any> {
    return this.https.get(`${url}/api/completed-survey`);
  }

  saveCompletedSurveys(body: any): Observable<any> {
    return this.https.post(`${url}/api/completed-survey`, body);
  }

  updateCompletedSurveys(body: any): Observable<any> {
    return this.https.put(`${url}/api/completed-survey`, body);
  }

  getOtherProcess(): Observable<any> {
    return this.https.get(`${url}/api/other-process`);
  }

  saveOtherProcess(body: any): Observable<any> {
    return this.https.post(`${url}/api/other-process`, body);
  }

  updateOtherProcess(body: any): Observable<any> {
    return this.https.put(`${url}/api/other-process`, body);
  }

  getFileProcessConfig(): Observable<any> {
    return this.https.get(`${url}/api/file-process-config`);
  }

  saveFileProcessConfig(body: any): Observable<any> {
    return this.https.post(`${url}/api/file-process-config`, body);
  }

  updateFileProcessConfig(body: any): Observable<any> {
    return this.https.put(`${url}/api/file-process-config`, body);
  }

  deleteFileProcessConfig(body: any): Observable<any> {
    return this.https.post(`${url}/api/file-process-config/delete`, body);
  }

  getCollegeType(n_init: number, n_rang: number, filter: string = '%'): Observable<Paginated<CollegeType>> {
    return this.https.get<Paginated<CollegeType>>(`${url}/api/college-type?n_init=${n_init}&n_rang=${n_rang}&filter=${filter}`);
  }

  getCollegeTypeByCountryIDAndCollegeType(countryID: number, collegeTypeID: number): Observable<any> {
    return this.https.get(`${url}/api/college/${countryID}/${collegeTypeID}`);
  }

  getCollegeByID(collegeID: number) {
    return this.https.get(`${url}/api/college/${collegeID}`);
  }

  saveCollege(body: any) {
    return this.https.post(`${url}/api/college/json`, body);
  }
  // Survey Types
  getSurveyType(): Observable<any> {
    return this.https.get(`${url}/api/survey-type`);
  }

  saveSurveyType(body: any): Observable<any> {
    return this.https.post(`${url}/api/survey-type`, body);
  }

  updateSurveyType(body: any): Observable<any> {
    return this.https.put(`${url}/api/survey-type`, body);
  }

  deleteSurveyType(body: any): Observable<any> {
    return this.https.post(`${url}/api/survey-type/delete`, body);
  }
  // Analysis Categories
  getAnalysisCategory(): Observable<any> {
    return this.https.get(`${url}/api/analysis-category`);
  }

  saveAnalysisCategory(body: any): Observable<any> {
    return this.https.post(`${url}/api/analysis-category`, body);
  }

  updateAnalysisCategory(body: any): Observable<any> {
    return this.https.put(`${url}/api/analysis-category`, body);
  }

  deleteAnalysisCategory(body: any): Observable<any> {
    return this.https.post(`${url}/api/analysis-category/delete`, body);
  }
  // Vocational Interests
  getVocationalInterest(): Observable<any> {
    return this.https.get(`${url}/api/vocational-interest`);
  }

  saveVocationalInterest(body: any): Observable<any> {
    return this.https.post(`${url}/api/vocational-interest`, body);
  }

  updateVocationalInterest(body: any): Observable<any> {
    return this.https.put(`${url}/api/vocational-interest`, body);
  }

  deleteVocationalInterest(body: any): Observable<any> {
    return this.https.post(`${url}/api/vocational-interest/delete`, body);
  }
  // Group Representation
  getGroupRepresentation(): Observable<any> {
    return this.https.get(`${url}/api/group-representation`);
  }

  savePostulant(body: any): Observable<any> {
    return this.https.post(`${url}/api/postulant`, body);
  }

  getPostulantByText(body: any): Observable<any> {
    return this.https.post(`${url}/api/postulant/by-text`, body);
  }

  getPostulantReport(body: any) {
    return this.https.post(`${url}/api/postulant/report`, body);
  }

  getPostulantByTextQuantity(body: any): Observable<any> {
    return this.https.post(`${url}/api/postulant/by-text-quantity`, body);
  }

  updatePostulant(body: any): Observable<any> {
    return this.https.put(`${url}/api/postulant`, body);
  }

  getPostulantByPersonIDAndLevelID(personID: number, levelID: number): Observable<any> {
    return this.https.get(`${url}/api/postulant/by-person-and-level/${personID}/${levelID}`);
  }

  savePostulantCollege(body: any): Observable<any> {
    return this.https.post(`${url}/api/postulant-college`, body);
  }

  updatePostulantCollege(body: any): Observable<any> {
    return this.https.put(`${url}/api/postulant-college`, body);
  }

  getPostulantCollegeByPersonID(personID: number): Observable<any> {
    return this.https.get(`${url}/api/postulant-college/by-person-id/${personID}`);
  }

  updateGroupRepresentation(body: any): Observable<any> {
    return this.https.put(`${url}/api/group-representation`, body);
  }

  deleteGroupRepresentation(body: any): Observable<any> {
    return this.https.post(`${url}/api/group-representation/delete`, body);
  }

  updateFilePostulant(body: any) {
    return this.https.put(`${url}/api/file-postulant`, body);
  }

  // SUBIR ARCHIVOS PARA POSTULANTE

  getFilePostulantByPersonIDAndAdmissionPeriodID(personID: number, admissionPeriodID: number): Observable<any> {
    return this.https.get(`${url}/api/file-postulant/by-person-and-admission-period/${personID}/${admissionPeriodID}`);
  }

  getFilePostulantByFinancialInfo(financialEntity: number, transactionType: number, voucherNumber: string): Observable<any> {
    return this.https.get(`${url}/api/file-postulant/by-voucher-number/${financialEntity}/${transactionType}/${voucherNumber}`);
  }

  uploadPostulantImages(fileType: number, file: File, fielId:number, postulantID: number, financialEntity: number = 0, transactionType: number = 0, voucherNumber: string = '-', payDay: string = '-', conceptsId: number = 0, amount: number = 0, isRegularizing: boolean = false, filePostulandID: number = 0): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    return this.https.post(`${url}/api/file-postulant/images/1/${fielId}/${fileType}/${postulantID}/${financialEntity}/${transactionType}/${voucherNumber}/${payDay}/${conceptsId}/${amount}/${isRegularizing}/${filePostulandID}`, formData);
  }

  uploadPostulantDocuments(fileType: number, file: File, fielId:number, postulantID: number, financialEntity: number = 0, transactionType: number = 0, voucherNumber: string = '-', payDay: string = '-', conceptsId: number = 0, amount: number = 0, isRegularizing: boolean = false, filePostulandID: number = 0): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    return this.https.post(`${url}/api/file-postulant/docs/1/${fielId}/${fileType}/${postulantID}/${financialEntity}/${transactionType}/${voucherNumber}/${payDay}/${conceptsId}/${amount}/${isRegularizing}/${filePostulandID}`, formData);
  }

  // Admission Period
  getCurrentAdmissionPeriod(): Observable<AdmissionPeriod> {
    return this.https.get<AdmissionPeriod>(`${url}/api/admission-period/current`);
  }

  getAdmissionPeriodByIDTextLevelID(body: any) {
    return this.https.post(`${url}/api/admission-period/all`, body);
  }

  saveGroupRepresentation(body: any): Observable<any> {
    return this.https.post(`${url}/api/group-representation`, body);
  }

  getAdmissionModeByIDNameLevel(): Observable<any> {
    return this.https.get(`${url}/api/admission-mode/by-id-name-level`);
  }

  getFinancialEntities(): Observable<any> {
    return this.https.get(`${url}/api/financial-entity`);
  }

  getTransactionTypes(): Observable<any> {
    return this.https.get(`${url}/api/transaction-type`);
  }

  getConceptCostOfLeveling(): Observable<any> {
    return this.https.get(`${url}/api/concept-cost/of-leveling`);
  }

  getConfigGroupQuestion(): Observable<any> {
    return this.https.get(`${url}/api/config-group-question`);
  }

  saveConfigGroupQuestion(body: any): Observable<any> {
    return this.https.post(`${url}/api/config-group-question`, body);
  }

  updateConfigGroupQuestion(body: any): Observable<any> {
    return this.https.put(`${url}/api/config-group-question`, body);
  }

  deleteConfigGroupQuestion(body: any): Observable<any> {
    return this.https.post(`${url}/api/config-group-question/delete`, body);
  }

  getSurveyConfig(): Observable<any> {
    return this.https.get(`${url}/api/survey-config`);
  }

  saveSurveyConfig(body: any): Observable<any> {
    return this.https.post(`${url}/api/survey-config`, body);
  }

  updateSurveyConfig(body: any): Observable<any> {
    return this.https.put(`${url}/api/survey-config`, body);
  }

  deleteSurveyConfig(body: any): Observable<any> {
    return this.https.post(`${url}/api/survey-config/delete`, body);
  }

  getReportResultChaside(collegeID: number, initDate: Date, endDate: Date, recordType: string): Observable<any> {
    return this.https.get(`${url}/api/external-absorption/report-result-chaside/${collegeID}/${initDate}/${endDate}/${recordType}`, {responseType: 'arraybuffer'});
  }

  getReportResultGardner(collegeID: number, initDate: Date, endDate: Date, recordType: string): Observable<any> {
    return this.https.get(`${url}/api/external-absorption/report-result-gardner/${collegeID}/${initDate}/${endDate}/${recordType}`, {responseType: 'arraybuffer'});
  }

  getReportResultMauricioGex(collegeID: number, initDate: Date, endDate: Date, recordType: string): Observable<any> {
    return this.https.get(`${url}/api/external-absorption/report-result-mauricio-gex/${collegeID}/${initDate}/${endDate}/${recordType}`, {responseType: 'arraybuffer'});
  }

  getReportResultGeneral(collegeID: number, initDate: Date, endDate: Date, recordType: string): Observable<any> {
    return this.https.get(`${url}/api/external-absorption/report-result-general/${collegeID}/${initDate}/${endDate}/${recordType}`, {responseType: 'arraybuffer'});
  }

  getReportResultGeneralMauricio(collegeID: number, initDate: Date, endDate: Date, recordType: string): Observable<any> {
    return this.https.get(`${url}/api/external-absorption/report-mauricio-gex-general/${collegeID}/${initDate}/${endDate}/${recordType}`, {responseType: 'arraybuffer'});
  }

  getReportResultGeneralGardner(collegeID: number, initDate: Date, endDate: Date, recordType: string): Observable<any> {
    return this.https.get(`${url}/api/external-absorption/report-gardner-general/${collegeID}/${initDate}/${endDate}/${recordType}`, {responseType: 'arraybuffer'});
  }

  getReportResultGeneralEncuesta(collegeID: number, initDate: Date, endDate: Date, recordType: string): Observable<any> {
    return this.https.get(`${url}/api/external-absorption/report-result-encuesta/${collegeID}/${initDate}/${endDate}/${recordType}`, {responseType: 'arraybuffer'});
  }

  getReportResultGeneralIntersert(collegeID: number, initDate: Date, endDate: Date, recordType: string): Observable<any> {
    return this.https.get(`${url}/api/external-absorption/report-result-interested/${collegeID}/${initDate}/${endDate}/${recordType}`, {responseType: 'arraybuffer'});
  }

  getCollegeByPerson(personID: number) {
    return this.https.get(`${url}/api/administrative-external/${personID}`);
  }

  getReportResultIndividual(personID: number, surveyID: number) {
    return this.https.get(`${url}/api/external-absorption/report-result-person/${personID}/${surveyID}`, {responseType: 'arraybuffer'});
  }

  getReportResultEncuestaIndividual(personID: number, surveyID: number): Observable<any> {
    return this.https.get(`${url}/api/external-absorption/report-result-encuesta-person/${personID}/${surveyID}`, {responseType: 'arraybuffer'});
  }

  getInstitutionAssignmentSurvey(): Observable<any> {
    return this.https.get(`${url}/api/institution-assignment-survey`);
  }

  saveInstitutionAssignmentSurvey(body: any): Observable<any> {
    return this.https.post(`${url}/api/institution-assignment-survey`, body);
  }

  updateInstitutionAssignmentSurvey(body: any): Observable<any> {
    return this.https.put(`${url}/api/institution-assignment-survey`, body);
  }

  deleteInstitutionAssignmentSurvey(body: any): Observable<any> {
    return this.https.post(`${url}/api/institution-assignment-survey/delete`, body);
  }
  // Category Leveling
  getCategoryleveling(): Observable<any> {
    return this.https.get(`${url}/api/category-leveling`);
  }

  saveCategoryleveling(body: any): Observable<any> {
    return this.https.post(`${url}/api/category-leveling`, body);
  }

  updateCategoryleveling(body: any): Observable<any> {
    return this.https.put(`${url}/api/category-leveling`, body);
  }

  sendEmailValidateDocumentsOfPostulant(body: any) {
    return this.https.post(`${url}/api/collaborator/email/validate-document-of-postulant`, body);
  }
	sendEmailInterested(body: any) {
    return this.https.post(`${url}/api/collaborator/email/validate-state-of-interested`, body);
  }

	sendPurchaseEmail(body: any){
		return this.https.post(`${url}/api/collaborator/email/validate-data-fast`, body);
	}

  getCareerSetting() {
    return this.https.get(`${url}/api/career/setting/enrollment`);
  }

  postCareerAdmissionPeriod(body: any) {
    return this.https.post(`${url}/api/career/setting/enrollment`, body);
  }

  updateCareerAdmissionPeriod(body: any) {
    return this.https.put(`${url}/api/career/setting/enrollment`, body);
  }

  getCareerPeriodAdmissionPeriod(branchID: number, periodID: number, admissionPeriodID: number) {
    return this.https.get(`${url}/api/career/admission/period/${branchID}/${periodID}/${admissionPeriodID}`);
  }

  getCareerAdmissionPeriod(branchID: number, admissionPeriodID: number) {
    return this.https.get(`${url}/api/career/admission/admission-period/${branchID}/${admissionPeriodID}`);
  }

  getPostulantIsLegalized(personID: number) {
    return this.https.get(`${url}/api/postulant/is-legalized/${personID}`);
  }

  getPersonEmailLikeText(text: string) {
    return this.https.get(`${url}/api/person/student-email-like-text/${text}`);
  }

  getSurveySolvedsByPerson(personID: number) {
    return this.https.get(`${url}/api/completed-survey/solveds-by-person/${personID}`);
  }

  postExtensionCourse(body: any) {
    return this.https.post(`${url}/api/extension-course`, body);
  }

  updateExtensionCourse(body: any) {
    return this.https.put(`${url}/api/extension-course`, body);
  }

  getExtensionCourseQuantityByFilter(body: any) {
    return this.https.post(`${url}/api/extension-course/quantity-by-filter`, body);
  }

  getExtensionCourseByFilterAndPagination(body: any) {
    return this.https.post(`${url}/api/extension-course/by-filter-and-pagination`, body);
  }

	getExtensionCourse() {
		return this.https.get(`${url}/api/extension-course`);
	}

  getUnacemClassSectionQuantityByFilter(body: any) {
    return this.https.post(`${url}/api/unacem-class-section/quantity-by-filter`, body);
  }

  getUnacemClassSectionByFilterAndPagination(page: number, limit: number, filter: string, startDate: string, endDate: string, statusID: number) {
    return this.https.get(`${url}/api/unacem-class-section/${startDate}/${endDate}/${statusID}?page=${page}&limit=${limit}&filter=${filter}`);
  }

  getUnacemClassSectionByPerson(personID: any) {
    return this.https.get(`${url}/api/unacem-class-section/course-list-by-person/${personID}`);
  }

  getUnacemClassSectionByResponsible(responsibleID: any) {
    return this.https.get(`${url}/api/unacem-class-section/course-list-by-responsible/${responsibleID}`);
  }

  getUnacemClassSectionToValidate(body: any) {
    return this.https.post(`${url}/api/unacem-class-section/to-validate`, body);
  }

  getExtensionCourseReport(body: any) {
    return this.https.post(`${url}/api/extension-course/report`, body);
  }

  postTypeCertification(body: any) {
    return this.https.post(`${url}/api/type-certification`, body);
  }

  updateTypeCertification(body: any) {
    return this.https.put(`${url}/api/type-certification`, body);
  }

  getTypeCertification() {
    return this.https.get(`${url}/api/type-certification`);
  }

  getTypeTeacher() {
    return this.https.get(`${url}/api/type-teacher`);
  }

  postUnacemClassSection(body: any) {
    return this.https.post(`${url}/api/unacem-class-section`, body);
  }

  getScheduleUnacemByPeriodIDAndClassSectionNumber(periodID: number, classSectionNumber: number) {
    return this.https.get(`${url}/api/schedule-unacem/${periodID}/${classSectionNumber}`);
  }

  postScheduleUnacem(body: any) {
    return this.https.post(`${url}/api/schedule-unacem`, body);
  }

  updateUnacemClassSection(body: any) {
    return this.https.put(`${url}/api/unacem-class-section`, body);
  }

  updateScheduleUnacem(body: any) {
    return this.https.put(`${url}/api/schedule-unacem`, body);
  }

  generateUserQRCode(body: any) {
    return this.https.post(`${url}/api/auth/generate-user-qr-code`, body);
  }

  uploadFileByEntityAndFileType(entity: number, fileType: string, file: FormData, personID: number) {
    return this.https.post(`${url}/api/interested-course/upload/${entity}/${fileType}/${personID}`, file);
  }

  updateInterestedCourse(body: any) {
    return this.https.put(`${url}/api/interested-course`, body);
  }

  updateInterestedCoursePayment(body: any) {
    return this.https.put(`${url}/api/interested-course/update-payment`, body);
  }

  newEnrollOfInterestedCourse(body: any) {
    return this.https.post(`${url}/api/interested-course/new-enroll`, body);
  }

  newEnrollInBulkOfInterestedCourse(body: any) {
    return this.https.post(`${url}/api/interested-course/new-enroll-in-bulk`, body);
  }

  getMenuOfUserIDAndRolIDAndCompanyID(userID: number, rolID: number, companyID: number) {
    return this.https.get(`${url}/api/menu/user-rol-company/${userID}/${rolID}/${companyID}`);
  }

  getCourseListByPerson(personID: number) {
    return this.https.get(`${url}/api/unacem-class-section/course-list-by-person/${personID}`);
  }

  getSectionStatus() {
    return this.https.get(`${url}/api/section-status`);
  }

  getCourseListQuantityByFilter(body: any) {
    return this.https.post(`${url}/api/unacem-class-section/course-list-quantity-by-filter`, body);
  }

  getCourseListByFilterAndPagination(body: any) {
    return this.https.post(`${url}/api/unacem-class-section/course-list-by-filter-and-pagination`, body);
  }

  getHistoryByPerson(personID: number) {
    return this.https.get(`${url}/api/unacem-course/by-person/${personID}`);
  }

	getSchedule(periodID: number,classSectionNumber:number) {
		return this.https.get(`${url}/api/unacem-class-section/schedule-course/${periodID}/${classSectionNumber}`);
	}

  getContractor(body: any): Observable<Contractor[]> {
    return this.https.post<Contractor[]>(`${url}/api/contractor/by-filter`, body);
  }

  getContractorByID(contractorID: any) {
    return this.https.get(`${url}/api/contractor/${contractorID}`);
  }

  postContractor(body: any) {
    return this.https.post(`${url}/api/contractor`, body);
  }

  updateContractor(body: any) {
    return this.https.put(`${url}/api/contractor`, body);
  }

  getContractorCollaborator(body: any) {
    return this.https.post(`${url}/api/contractor-collaborator`, body);
  }

  public getContractorCollaboratorByContractorID(contractorID: number): Observable<Collaborator[]> {
    return this.https.get<Collaborator[]>(`${url}/api/contractor-collaborator/${contractorID}`);
  }

	public getUnacemCourseByContractor(contractorID: number, personID: number): Observable<UnacemCourse[]> {
    return this.https.get<UnacemCourse[]>(`${url}/api/unacem-report/unacem-course/${contractorID}/${personID}`);
  }

	public getUnacemStudentsReport(body: any): Observable<Tables<UnacemStudentReport>> {
		return this.https.post<Tables<UnacemStudentReport>>(`${url}/api/unacem-report/unacem-students-report`, body);
	}

	public getUnacemBlackList(page: number, limit: number, filter: string): Observable<Tables<UnacemBlackList>> {
		return this.https.get<Tables<UnacemBlackList>>(`${url}/api/black-list?page=${page}&limit=${limit}&filter=${filter}`);
	}

	public postUnacemBlackList(body: any) {
    return this.https.post(`${url}/api/black-list`, body);
  }

	public putUnacemBlackList(body: any) {
    return this.https.put(`${url}/api/black-list/person-blacklist`, body);
  }

	public putUnacemBlackListStatus(body: any) {
    return this.https.put(`${url}/api/black-list/status-blacklist`, body);
  }

	public putSettingDocumentManagement(body: any) {
    return this.https.put(`${url}/api/document-management/update-setting-document-management`, body);
  }

	public getDataStudent(personID: string): Observable<any> {
		return this.https.get<any>(`${url}/api/unacem-report/view-qrcode/${personID}`);
	}

  postContractorCollaborator(body: any) {
    return this.https.post(`${url}/api/contractor-collaborator`, body);
  }

  updateContractorCollaborator(body: any) {
    return this.https.put(`${url}/api/contractor-collaborator`, body);
  }

  getContractorResponsible(body: any) {
    return this.https.post(`${url}/api/contractor-responsible/by-filter`, body);
  }

  getContractorResponsibleByContractorID(contractorID: any) {
    return this.https.get(`${url}/api/contractor-responsible/${contractorID}`);
  }

  postContractorResponsible(body: any) {
    return this.https.post(`${url}/api/contractor-responsible`, body);
  }

  updateContractorResponsible(body: any) {
    return this.https.put(`${url}/api/contractor-responsible`, body);
  }

  uploadInBuilk(file: FormData) {
    return this.https.post(`${url}/api/contractor/upload-in-bulk`, file);
  }

  getContractorResponsibleMainByUserID(userID: number) {
    return this.https.get(`${url}/api/contractor-responsible/main-by-user/${userID}`);
  }

  getContractorInfoByUserID(userID: number) {
    return this.https.get(`${url}/api/contractor/info-by-user/${userID}`);
  }

  getScheduleUnacemByPeriodIDAndTeacherIDAndText(body: any) {
    return this.https.post(`${url}/api/schedule-unacem/by-period-teacher-text`, body);
  }

  getUnacemStudentByPeriodIDAndClassSectionNumber(body: any) {
    return this.https.post(`${url}/api/unacem-student/by-period-and-class-section-number`, body);
  }

  getTeacherInfoByPersonID(personID: any) {
    return this.https.get(`${url}/api/teacher/info-by-person/${personID}`);
  }

  getUnacemComponentClassSectionNumberByPeriodIDAndClassSectionNumber(body: any) {
    return this.https.post(`${url}/api/unacem-component-class-section-number/by-period-and-class-section-number`, body);
  }

  updateGradeDetailByComponentInBulk(body: any) {
    return this.https.put(`${url}/api/unacem-component-class-section-number/save-detail-in-bulk`, body);
  }

  getUnacemSettingSignature(periodID: number, classSectionNumber: number) {
    return this.https.get(`${url}/api/unacem-setting-signature/${periodID}/${classSectionNumber}`);
  }

  postUnacemSettingSignature(body: any) {
    return this.https.post(`${url}/api/unacem-setting-signature`, body);
  }

  updateUnacemSettingSignature(body: any) {
    return this.https.put(`${url}/api/unacem-setting-signature`, body);
  }

	postAssignTeacherCourse(body: any) {
		return this.https.post(`${url}/api/teacher-unacem`, body);
	}

  uploadSignature(formData: FormData, personID?: number) {
    return this.https.post(`${url}/api/unacem-setting-signature/upload-signature/${personID || 1}`, formData);
  }

  getUnacemPeriodExtension() {
    return this.https.get(`${url}/api/unacem-period-extension`);
  }

  getUnacemCourseByPeriodID(periodID: number) {
    return this.https.get(`${url}/api/unacem-course/by-period/${periodID}`);
  }

  getUnacemTeacherSectionByPeriodCourseIDAndDates(body: any) {
    return this.https.post(`${url}/api/unacem-teacher/by-period-course-and-dates`, body);
  }

  getUnacemCourseDates(periodID: number, courseID: number) {
    return this.https.get(`${url}/api/unacem-course/dates-by-period-and-course/${periodID}/${courseID}`);
  }

  getUnacemCourseDatesAndId(body: any) {
    return this.https.post(`${url}/api/unacem-teacher/by-period-course-and-dates-and-teacher`, body);
  }

  getUnacemStudentByPeriodAndClassSectionNumber(body: any) {
    return this.https.post(`${url}/api/unacem-student/by-period-and-class-section-number`, body);
  }

  generateUnacemCertificate(body: any) {
    return this.https.post(`${url}/api/unacem-certificate/with-template`, body);
  }

  getAllTypesDocuments() {
    return this.https.get(`${url}/api/document-type/all-types`);
  }

  getUnacemReport(body: any) {
    return this.https.post(`${url}/api/unacem-report/generate`, body);
  }

  getContractorGradesReport(body: any) {
    return this.https.post(`${url}/api/unacem-report/contract-collaborator-grade`, body);
  }

  getValidateVoucher(body: any) {
    return this.https.post(`${url}/api/interested-course/validate-voucher`, body)
  }

  getCourseInfoReport(body: any) {
    return this.https.post(`${url}/api/schedule-unacem/info-courses`, body)
  }

  getScheduleCourseReport(body: any) {
    return this.https.post(`${url}/api/schedule-unacem/schedule-course`, body)
  }

  getGradeCourseReport(body: any) {
    return this.https.post(`${url}/api/schedule-unacem/grade-course`, body)
  }

  getContractorReport(body: any) {
    return this.https.post(`${url}/api/contractor/report`, body)
  }

  getUnacemClassSectionReport(body: any) {
    return this.https.post(`${url}/api/unacem-class-section/report-unacem-class-section`, body)
  }

  getApprovedPaymentUnacemReport(body: any) {
    return this.https.post(`${url}/api/unacem-class-section/report-pdf/approved-payment-unacem`, body, {responseType: 'arraybuffer'})
  }

  getMainPaymentUnacemReport(body: any) {
    return this.https.post(`${url}/api/unacem-class-section/report-excel/approved-payment-unacem`, body)
  }

  getReportValidate(body: any) {
    return this.https.post(`${url}/api/unacem-class-section/report-validate`, body)
  }

  getEnrollmentReport(body: any) {
    return this.https.post(`${url}/api/schedule-unacem/students-enroll-course`, body)
  }

  getFieldsByReportTypeID(reportTypeID: number) {
    return this.https.get(`${url}/api/unacem-report/fields-by-report-type/${reportTypeID}`);
  }

  saveShoppingCart(body: any) {
    return this.https.post(`${url}/api/shopping-cart`, body);
  }

  getShoppingCart() {
    return this.https.get(`${url}/api/shopping-cart`);
  }

  getShoppingCartByID(cartID: number) {
    return this.https.get(`${url}/api/shopping-cart/${cartID}`);
  }

  getShoppingCartByPerson(personID: number) {
    return this.https.get(`${url}/api/shopping-cart/by-person/${personID}`);
  }

  getShoppingCartItemByCartID(cartID: number) {
    return this.https.get(`${url}/api/shopping-cart-item/by-cart/${cartID}`);
  }

  getSaleInfoByCartID(cartID: number, statusID: number = 0) {
    return this.https.get(`${url}/api/shopping-cart/sale-info/${cartID}/${statusID}`);
  }

  saveShoppingCartItem(body: any) {
    return this.https.post(`${url}/api/shopping-cart-item`, body);
  }

  updateShoppingCartItem(body: any) {
    return this.https.put(`${url}/api/shopping-cart-item`, body);
  }

  getSaleByID(saleID: number) {
    return this.https.get(`${url}/api/sale/${saleID}`);
  }

  getSaleDetailBySaleID(saleID: number) {
    return this.https.get(`${url}/api/sale/detail/${saleID}`);
  }

  saveSale(body: any) {
    return this.https.post(`${url}/api/sale`, body);
  }

  saveSaleDetail(body: any) {
    return this.https.post(`${url}/api/sale/detail`, body);
  }

  updateSale(body: any) {
    return this.https.put(`${url}/api/sale`, body);
  }


  updateUserPassword(body: any) {
    return this.https.put(`${url}/api/user/change-password`, body);
  }

  reportScheduleUnacemCredentials(body: any) {
    return this.https.post(`${url}/api/schedule-unacem/credentials`, body);
  }

  getPersonToSyncWithMoodle(body: any) {
    return this.https.post(`${url}/api/person/to-sync-with-moodle`, body);
  }

  getSystemVariableByIdentifier(identifier: string, showMoreFields: string = 'dont') {
    return this.https.get(`${url}/api/system-variables/by-identifier/${identifier}?showMoreFields=${showMoreFields}`);
  }

  getReportTypesOfPostulant() {
    return this.https.get(`${url}/api/postulant/report-type`);
  }

  getFileTypeByReportTypeOfPostulant() {
    return this.https.get(`${url}/api/postulant/file-type-by-report-type`);
  }

  getReportsExcluidsOfFilters() {
    return this.https.get(`${url}/api/postulant/report-excluids-of-filter`);
  }

  getCategoryEvaluationInstruments() {
    return this.https.get(`${url}/api/evaluation-instr/category`);
  }

  getSettingEvaluationLinkageProjects(periodID: number, schoolID: number, careerID: number, studyPlanID: number) {
    return this.https.get(`${url}/api/setting-evaluation/linkage-projects/${periodID}/${schoolID}/${careerID}/${studyPlanID}`);
  }

  getSettingEvaluationConfigurateds(periodID: number, schoolID: number, careerID: number, studyPlanID: number, modalityID: number, cycleID: number) {
    return this.https.get(`${url}/api/setting-evaluation/validation/${periodID}/${schoolID}/${careerID}/${studyPlanID}/${modalityID}/${cycleID}`);
  }

  getTeacherWithManagementByPeriodSchoolAndCareer(periodID: number, schoolID: number, careerID: number) {
    return this.https.get(`${url}/api/teacher/management/${periodID}/${schoolID}/${careerID}`);
  }

  getComponentByActivity(activityID: number) {
    return this.https.get(`${url}/api/evaluation-instr/componentByActivity/${activityID}`);
  }

  getManagementBoss() {
    return this.https.get(`${url}/api/teacher/managers`);
  }

  getLevels(init: number = 1, range: number = 10, filter: string = '%') {
    return this.https.get(`${url}/api/level?init=${init}&range=${range}&filter=${filter}`);
  }

  saveAdmissionPeriod(body: any) {
    return this.https.post(`${url}/api/admission-period`, body);
  }

  updateAdmissionPeriod(body: any) {
    return this.https.put(`${url}/api/admission-period`, body);
	}

  getCareerByPerson(personID: number) {
    return this.https.get(`${url}/api/career/by-person/${personID}`);
  }

  getScholarship(periodID: number, page: number, limit: number): Observable<Tables<any>> {
    return this.https.get<Tables<any>>(`${url}/api/scholarship/all/${periodID}?page=${page}&limit=${limit}`);
  }

	getScholarshipTypes(page: number, limit: number): Observable<Tables<any>> {
    return this.https.get<Tables<any>>(`${url}/api/scholarship/types?page=${page}&limit=${limit}`);
  }

  saveScholarships(body: any) {
    return this.https.post(`${url}/api/scholarship/news`, body);
  }

  updateScholarships(body: any) {
    return this.https.put(`${url}/api/scholarship/updates`, body);
  }

  saveScholarshipTypes(body: any) {
    return this.https.post(`${url}/api/scholarship/types`, body);
  }

  updateScholarshipTypes(body: any) {
    return this.https.put(`${url}/api/scholarship/types`, body);
  }


  getScholarshipRequirementsByScholarshipID(scholarshipID: number) {
    return this.https.get(`${url}/api/scholarship/requirements/${scholarshipID}`);
  }

  saveScholarshipRequirements(body: any) {
    return this.https.post(`${url}/api/scholarship/requirements`, body);
  }

  updateScholarshipRequirements(body: any) {
    return this.https.put(`${url}/api/scholarship/requirements`, body);
  }

  getStudentInfoToScholarshipAssign(studentID: number) {
    return this.https.get(`${url}/api/scholarship/info-to-assign/${studentID}`);
  }

  getStudentCandidatesToRequest() {
    return this.https.get(`${url}/api/request/student-candidates`);
  }

  getRecordQualificationByAssignStudentID(assignStudentID: number) {
    return this.https.get(`${url}/api/socioeconomic-record-qualification/by-assign-student-id/${assignStudentID}`);
  }

  saveScholarshipAssignStudents(body: any) {
    return this.https.post(`${url}/api/scholarship/assign-student`, body);
  }

  saveSocioeconomicRecordQualification(body: any) {
    return this.https.post(`${url}/api/socioeconomic-record-qualification`, body);
  }

  updateSocioeconomicRecordQualification(body: any) {
    return this.https.put(`${url}/api/socioeconomic-record-qualification`, body);
  }

  getScholarshipAssignStudentsByPeriodID(periodID: number) {
    return this.https.get(`${url}/api/scholarship/assign-student-by-period/${periodID}`);
  }
  getScholarshipAssignStudentsByPeriodIDPagination(periodID: number,filter: string, page: number, limit: number) {
    return this.https.get(`${url}/api/scholarship/students-Assign/${periodID}?filter=${filter}&page=${page}&limit=${limit}`);
  }

  getScholarshipStudentCandidateByFilter(body: any) {
    return this.https.post(`${url}/api/scholarship/student-candidate`, body)
  }

  getScholarshipAssignStudentByAssignStudentID(assignStudentID: number) {
    return this.https.get(`${url}/api/scholarship/assign-student-by-assign-student/${assignStudentID}`);
  }

  getSocioEconomicInfoToScholarship(periodID: number, studentID: number) {
    return this.https.get(`${url}/api/enroll/socioeconomic-sheet/${periodID}/0/${studentID}`);
  }

  getScholarshipPaymentInfoByStudentIDAndPeriodID(studentID: number, periodID: number) {
    return this.https.get(`${url}/api/scholarship/assign-student/payment-info/${studentID}/${periodID}`);
  }

  getScholarshipPaymentOptionByID(paymentOptionID: number) {
    return this.https.get(`${url}/api/scholarship/payment-option-by-id/${paymentOptionID}`);
  }

  getScholarshipQuotasByPaymentOption(paymentOptionID: number) {
    return this.https.get(`${url}/api/scholarship/quotas-by-payment-option/${paymentOptionID}`);
  }

  getAssignScholarshipStudentDetailByAssignStudentID(assignStudentID: number, periodID: number) {
    return this.https.get(`${url}/api/scholarship/assign-student-detail/${assignStudentID}/${periodID}`);
  }

  saveAssignScholarshipStudentDetail(body: any) {
    return this.https.post(`${url}/api/scholarship/assign-student-detail`, body);
  }

  updateAssignScholarshipStudent(body: any) {
    return this.https.put(`${url}/api/scholarship/assign-student`, body);
  }

  getTableTypeByType(type: string) {
    return this.https.get(`${url}/api/table-type/${type}`);
  }

  getScholarshipSheetPDF(periodID: number, personID: number, studentID: number) {
    return this.https.get(`${url}/api/scholarship/reports/beca/${periodID}/${personID}/${studentID}`, {responseType: 'arraybuffer'});
  }

  postPassPostulant(admissionPeriodID: number) {
    return this.https.get(`${url}/api/postulant/pass-postulant-student/${admissionPeriodID}`);
  }

  public getFileByPersonAndStatusFileID(personID: number, companyID: number, statusFileID: number) {
    return this.https.get(`${url}/api/file/person-and-status-file-id/${personID}/${companyID}/${statusFileID}`);
  }

  public getFileByStudentIDAndStatusFileID(studentID: number, companyID: number, statusFileID: number, periodID: number) {
    return this.https.get(`${url}/api/file/student-and-status-file-id/${studentID}/${companyID}/${statusFileID}/${periodID}`);
  }

  getPaymentConcepts() {
    return this.https.get(`${url}/api/payment/concepts`);
  }

	public postInstitution(body: any) {
    return this.https.post(`${url}/api/institution`, body);
  }

	public getAdministrativeExternalInstitutions(personID: number): Observable<ExternalUserInstitute[]> {
    return this.https.get<ExternalUserInstitute[]>(`${url}/api/administrative-external/${personID}`);
  }

	public getAdministrativeExternal(page: number, limit: number, filter: string): Observable<Paginated<ExternalUser>> {
    return this.https.get<Paginated<ExternalUser>>(`${url}/api/administrative-external?page=${page}&limit=${limit}&filter=${filter}`);
  }

	public postAdministrativeExternal(body: any) {
    return this.https.post(`${url}/api/administrative-external`, body);
  }

	public putAdministrativeExternal(body: any) {
    return this.https.put(`${url}/api/administrative-external`, body);
  }

	public postAdministrativeExternalInstitution(body: any) {
    return this.https.post(`${url}/api/administrative-external/institution-json`, body);
  }

	public postAdministrativeExternalAbsortion(body: any) {
    return this.https.post(`${url}/api/administrative-external/user/absorcion`, body);
  }

  public setAssignmentData(data: any) {
    this.assignmentData = data;
  }

  public getAssignmentData() {
    return this.assignmentData;
  }

	public postQRByPersonID(personId: number): Observable<QRCode> {
		const parseURL = `${url}/${personId}`
		return this.https.post<QRCode>(`${url}/api/qr-code/generate-link`, { url : parseURL});
	}

	public postTeacherExternal(body: any) {
		return this.https.post(`${url}/api/teacher-unacem/teacher-external`, body);
	}

  public getCheckoutIDDatafast(body: any) {
    return this.https.post(`${url}/api/datafast-payment/create-checkout`,body);
  }

	public verifyDatafastTransaction(checkoutId: string) {
    return this.https.get(`${url}/api/datafast-payment/verify-transaction/${checkoutId}`);
  }

  public verifyByResource(resourcePath:string) {
    return this.https.get(`${url}/api/datafast-payment/verify-by-resource-path?resourcePath=${resourcePath}`);
  }

  updateInterestedCourseDatafast(body: any) {
    return this.https.put(`${url}/api/interested-course/datafast`, body);
  }

	public getUnacemResponsable(personID: number): Observable<UnacemResponsable> {
    return this.https.get<UnacemResponsable>(`${url}/api/unacem-class-section/person-unacem/${personID}`);
  }

	saveVacanciesDistributive(body: any) {
		return this.https.put(`${url}/api/class-section/update-class-section-vacancies`, body);
	}

	public getRetrieveAvailable(periodID: number, studentID: number): Observable<RetrieveAvailableSchedules> {
    return this.https.get<RetrieveAvailableSchedules>(`${url}/api/student/retrieve-available-student-schedules/${periodID}/${studentID}`);
  }

	public verifySchedulesConflicts(body: RetrieveAvailable[]): Observable<RetrieveAvailable[]> {
		return this.https.post<RetrieveAvailable[]>(`${url}/api/enroll/verify-schedules-conflicts`, {'schedules': body});
	}

	public saveDragPayment(body: RetrieveAvailable[]) {
		return this.https.post(`${url}/api/enroll/save-drag-payment`, {'schedules': body});
	}

	public saveStudentEnrollment(body: any){
		return this.https.post(`${url}/api/enroll/save-student-enrollments`, body);
	}
}
