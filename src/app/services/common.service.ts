import { AcademicalHistory, AcademicalInformation, Agreementtype, BondingLogin, ChangePassword, ConsultedStudent, DocumentTypee, ExternsRegister, ObjetiveType, ProgramType, Rol, StatusAgreement, VerificationFirst, Business, AgreementConvention, Code, ProjectCode, Survey, PersonType } from './../utils/interfaces/person.interfaces';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Router } from '@angular/router';
import {
	CalendarType,
	CustomCalendarEvent,
	CustomEvent,
	CustomEventSetting,
	GeneralResponse,
	Modality
} from '@utils/interfaces/calendar.interface';
import { Utils } from '../utils';
import { CalendarEvent } from 'angular-calendar';
import { Observable,catchError,map,of,tap, BehaviorSubject, Subject } from 'rxjs';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { Cedula } from '@utils/interfaces/cedula.interfaces';
import { LoginReg } from '@utils/interfaces/login.interfaces';
import { BloodType, Canton, CivilStatus, Country, Disability, Discapacidad, Etnia, Gender, Identity, InstitutionType, NationalTowns, Nationality, OperatorsCellular, Paginated, Parish, Province, Sector, Sex, SubjectsList, TypeDoc, UnacemBlackList } from '../utils/interfaces/others.interfaces';
import { ParticipationArea, SPGetPerson, SPGetPerson2, StudentSubjects, EnrolledStudent } from '@utils/interfaces/person.interfaces';
import { throwError } from 'rxjs';
import { Colaborator } from '@utils/interfaces/rrhh.interfaces';
import { formatDate } from '@angular/common';
import { Tables } from '@utils/interfaces/period.interfaces';
import { ApprovalBusinessType, ApprovalRequest, Project } from '@utils/interfaces/campus.interfaces';
import { ConceptOptionPayment, EnrollType } from '@utils/interfaces/enrollment.interface';

let url: string = environment.url;
let urlCedula: string = 'http://pichincha.gapsystem.net:10048';

type colors = '#f5637e' | '#86bc57' | '#2eb4d8' | '#d3996a';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
	public sendSubject: SubjectsList;
	public sendTask: StudentSubjects;

  constructor( private https:HttpClient,
                private router:Router ) { }

  /* *********************************** LISTAS GETTERS SETTERS ************************************** */

  public province:  Province[] =  [];
  public canton:    Canton[] =    [];
  public parish:    Parish[] =    [];
  public identityList: Identity[] = [];
  public sexList: Sex[] = [];
  public genderList: Gender[] = [];
  public etniaList: Etnia[] = [];
  public bloodList: BloodType[] = [];
  public civilList: CivilStatus[] = [];
  public nationalityList: Nationality[] = [];
  public countryList: Country[] = [];

  public disabilityList:  Disability[] = [];

  public identificationType: any[] = [];

  private valid = new BehaviorSubject<boolean>(true);

  existOpenSwal: boolean = false;

  public setFormStatus(valid: boolean): void {
    this.valid.next(valid);
  }

  public getFormStatus(): Observable<boolean> {
    return this.valid.asObservable();
  }

  /* *********************************** ---------------------- ************************************** */


  /* *********************************** FUNCIONES VARIAS ********************************************* */
  menu: any[]=[];

  cargarMenu(){
    return this.menu = JSON.parse(sessionStorage.getItem('menu')!) || [];
  }

  message( text:string, text2:string, icono: SweetAlertIcon | undefined, color:colors){
    let label: string = "";
    if(icono === 'error'){
      label = 'Error';
    }else if(icono === 'success'){
      label = 'Buen trabajo';
    }else if(icono === 'info'){
      label = 'Advertencia';
    }else if(icono === 'warning'){
      label = 'Cuidado';
    }
    Swal.fire({
      icon: icono,
      title: `<span style="color:${color};">${label}</span>`,
      text: `${text}`,
      // footer: `${text2}`
    });
  }

  /* *********************************** -------------------------- *********************************** */


  /* *************************************** SERVICIOS GET ******************************************* */

  registoCivil(cedula: string): Observable<Cedula>{
		//return this.https.get<Cedula>(`${url}/api/application/external/${cedula}`)
    return this.https.get<Cedula>(`${urlCedula}/api/services/cedulaV2/${cedula}`)
		/* .pipe(
			map((item: any) => {
				const dataArray= item.consulta[2];
				const response= dataArray[0];
				return {
					ok: item.ok,
					consulta: response
				};
			})
		); */
  }

  validarToken(): Observable<boolean>{

    return this.https.get<LoginReg>(`${url}/api/auth/renovate-token/1`)
		.pipe(
			tap( resp => {
				sessionStorage.setItem('token', resp.token);
				// sessionStorage.setItem('menu', JSON.stringify(resp.menu));
			}),
			map( resp => true),
			catchError( error => of(false))
		)
  }

  logout(){
    sessionStorage.clear();
		localStorage.clear();
    this.router.navigateByUrl('/autenticacion/iniciar-sesion');
  }

  validRouteEnrollment(parameter: string): Observable<boolean>{
    const studentId = sessionStorage.getItem('studentID');
    return this.https.get<number>(`${url}/api/enroll/detail-process/${parameter}/1/${studentId}`)
		.pipe(
			map( resp => resp ? true:false),
			catchError( error => of(false))
		)
  }

  getFailedSubject(): Observable<boolean>{
    const personId = sessionStorage.getItem('id');
    return this.https.get<boolean>(`${url}/api/enroll/failed_subject/${personId}/1`)
		.pipe(
			map( resp => resp ? true:false),
			catchError( error => of(false))
		);
  }

  charging(){
    this.https.get(`${url}/api/general-information/1`)
      .subscribe( (any: any) => {
        this.sexList = any;
    });
    this.https.get(`${url}/api/general-information/2`)
      .subscribe( (any: any) => {
        this.genderList = any;
    });
    this.https.get(`${url}/api/general-information/13`)
      .subscribe( (any: any) => {
        this.identityList = any;
    });
    this.https.get(`${url}/api/general-information/10`)
      .subscribe( (any: any) => {
        this.etniaList = any;
    });
    this.https.get(`${url}/api/general-information/4`)
      .subscribe( (any: any) => {
        this.bloodList = any;
    });
    this.https.get(`${url}/api/general-information/3`)
      .subscribe( (any: any) => {
        this.civilList = any;
    });
    this.https.get(`${url}/api/general-information/9`)
      .subscribe( (any: any) => {
        this.nationalityList = any;
    });
    this.https.get(`${url}/api/general-information/20`)
    .subscribe( (any: any) => {
      this.disabilityList = any;
    });

  }

  getNationalTowns():Observable<NationalTowns[]>{
    return this.https.get<NationalTowns[]>(`${url}/api/general-information/27`)
  }

  cargaCombo( id: number): Observable<Province[]>{
    return this.https.get<Province[]>(`${url}/api/general-information/${id}`)
  }

  getCountry(): Observable<Country[]>{
    return this.https.get<Country[]>(`${url}/api/general-information/5`)
  }

  getCantonByProvince( id: number, province: string):Observable<Canton[]> {

    if( !province ) return of([]);

    return this.https.get<Canton[]>(`${url}/api/general-information/${id}/${province}`);
  }

  getParishByCanton( id: number, canton: string): Observable<Parish[]>{
    if( !canton ) return of([]);
    return this.https.get<Parish[]>(`${url}/api/general-information/${id}/${canton}`);
  }

  // public getEvents(modality: number, startDate: string, endDate: string): Observable<any> {
  public getCustomCalendarEvents(modality: number, startDate: string, endDate: string): Observable<CalendarEvent[]> {
    return this.https.get<CustomCalendarEvent[]>(`${url}/api/calendar/${modality}?startDate=${startDate}&endDate=${endDate}`)
    .pipe(map((value, index) => value.map((event) => Utils.parseCalendarEvent(event))));
  }

  public getModalities(): Observable<Modality[]> {
    return this.https.get<GeneralResponse>(`${url}/api/modality`)
    .pipe(map((res: GeneralResponse) => res.data as Modality[]));
  }

	public getCalendarTypes(): Observable<CalendarType[]> {
    return this.https.get<CalendarType[]>(`${url}/api/calendar/type`);
  }

	public getCalendarEvents(calendarType: number): Observable<any[]> {
		return of([]);
		// return this.https.get<any[]>(`${url}/api/calendar/event`);
	}
  public getEvents(): Observable<CustomEvent[]> {
    return this.https.get<GeneralResponse>(`${url}/api/event`)
    .pipe(map((res: GeneralResponse) => res.data as CustomEvent[]));
  }

  public getEventSettings(): Observable<CustomEventSetting[]> {
    return this.https.get<GeneralResponse>(`${url}/api/event-setting`)
    .pipe(map((res: GeneralResponse) => res.data as CustomEventSetting[]));
  }

  getPerson(id: number): Observable<SPGetPerson2>{
    return this.https.get<SPGetPerson2>(`${url}/api/person/${id}`)
  }

  getPersonByDocumentNumber(documentNumber: string): Observable<SPGetPerson2> {
    return this.https.get<SPGetPerson2>(`${url}/api/person/doc-number/${documentNumber}`);
  }

  getStudentInformation(personId: number): Observable<ConsultedStudent>{
    return this.https.get<ConsultedStudent>(`${url}/api/person/student-info/${personId}`)
		.pipe(
			map((item: ConsultedStudent) => {
					return {
						...item,
						//birthday: formatDate(item.birthday, 'yyyy-MM-dd', 'es', '+2000'),
					 }
			})
		);
  }

	getParticipationArea(): Observable<ParticipationArea[]>{
    return this.https.get<ParticipationArea[]>(`${url}/api/area-participation`);
  }

	public getDocumentType(): Observable<DocumentTypee[]>{
    return this.https.get<DocumentTypee[]>(`${url}/api/document-type`);
  }

	public getPersonType(): Observable<PersonType[]>{
    return this.https.get<PersonType[]>(`${url}/api/person-type`);
  }

	postLoginBonding(body:any, id:number=3): Observable<BondingLogin>{
    return this.https.post<BondingLogin>(`${url}/api/login/vinc/${id}`,body).pipe(
			tap( resp => {
        sessionStorage.setItem('token', resp.token);
				sessionStorage.setItem('name', resp.user.userName);
        sessionStorage.setItem('img', resp.user.userImg);
        sessionStorage.setItem('rol', resp.user.rolName);
        sessionStorage.setItem('id', String(resp.user.PersonId));
        sessionStorage.setItem('userId', String(resp.user.userId));
				}
			)
		);
  }

	getVerificationFirst(id:number): Observable<VerificationFirst[]>{
    return this.https.get<VerificationFirst[]>(`${url}/api/session-user/${id}`);
  }

	getMenus(id:any, entidad:number=3, rol:any ){
    return this.https.get(`${url}/api/menu-rol-user/login/${id}/${entidad}/${rol}`);
  }

	getApprovalRequest(page: number, limit: number, filter: string, stateApproval: string, personID: number): Observable<Tables<ApprovalRequest>>{
    return this.https.get<Tables<ApprovalRequest>>(`${url}/api/approval-request-bus/approval/${stateApproval}/${personID}?page=${page}&limit=${limit}&filter=${filter}`);
  }

	getApprovalRequestBus(page: number, limit: number, filter: string, personID: number, flagRol: string, studentID: number): Observable<Tables<ApprovalRequest>>{
    return this.https.get<Tables<ApprovalRequest>>(`${url}/api/approval-request-bus/${personID}/${flagRol}/${studentID}?page=${page}&limit=${limit}&filter=${filter}`);
  }

	getApprovalRequestRucValidation(ruc: number): Observable<ApprovalRequest>{
    return this.https.get<ApprovalRequest>(`${url}/api/approval-request-bus/validation/${ruc}`);
  }

	getApprovalBusinessType(): Observable<ApprovalBusinessType[]>{
    return this.https.get<ApprovalBusinessType[]>(`${url}/api/business/type`);
  }

	getAgreementConventionsAll(): Observable<AgreementConvention[]>{
    return this.https.get<AgreementConvention[]>(`${url}/api/agreement-conventions`);
  }

	getApprovalRequestRuc(ruc: string): Observable<ApprovalRequest[]>{
    return this.https.get<ApprovalRequest[]>(`${url}/api/approval-request-bus/${ruc}`);
  }

	getApprovalRequestFileView(approvalRequestBusID: number, personID: number, fileName: string): Observable<HttpResponse<Blob>> {
		const headers = new HttpHeaders();
    return this.https.get(`${url}/api/approval-request-bus/file/view/${approvalRequestBusID}/${personID}/${fileName}`, { headers, observe: 'response', responseType: 'blob' })
  }

	getAgreementsType(): Observable<Agreementtype[]>{
    return this.https.get<Agreementtype[]>(`${url}/api/agreementsvinc-type`);
  }

	getStatusAgreements(): Observable<StatusAgreement[]>{
    return this.https.get<StatusAgreement[]>(`${url}/api/status-agreement/`);
  }

	getConventionsObjetives(agreementConventionsID: number): Observable<any[]>{
    return this.https.get<any[]>(`${url}/api/agreement-conventions-objetive/${agreementConventionsID}`);
  }

	getAgreementConventionsByID(agreementTypeID: number, agreementConventionsID: number): Observable<AgreementConvention[]>{
    return this.https.get<AgreementConvention[]>(`${url}/api/agreement-conventions/${agreementTypeID}/${agreementConventionsID}`);
  }

	getAgreementConventions(agreementTypeID: number, page: number, limit: number, filter: string, statusAgreement: string): Observable<Tables<AgreementConvention>>{
    return this.https.get<Tables<AgreementConvention>>(`${url}/api/agreement-conventions/list/${agreementTypeID}/${statusAgreement}?page=${page}&limit=${limit}&filter=${filter}`);
  }

	getAgreementConventionsByAgreementID(agreementID: number, page: number, limit: number, filter: string): Observable<Tables<AgreementConvention>>{
    return this.https.get<Tables<AgreementConvention>>(`${url}/api/agreement-conventions/${agreementID}?page=${page}&limit=${limit}&filter=${filter}`);
  }

	getProgram(agreementsID:number): Observable<ProgramType[]>{
    return this.https.get<ProgramType[]>(`${url}/api/programvinc-type/${agreementsID}`);
  }

	getBusiness(): Observable<Business[]>{
    return this.https.get<Business[]>(`${url}/api/business-career/business`);
  }

	getBusinessByID(agreementsID: number): Observable<Business[]>{
    return this.https.get<Business[]>(`${url}/api/business-career/business/${agreementsID}`);
  }

	getObjetive(agreementsID:number): Observable<ObjetiveType[]>{
    return this.https.get<ObjetiveType[]>(`${url}/api/objetivevinc-type/${agreementsID}`);
  }

	getValidateCode(codeNumber: string): Observable<Code>{
    return this.https.get<Code>(`${url}/api/agreement-conventions/validate-code/${codeNumber}`);
  }

	getValidatePracticesCode(codeNumber: string): Observable<ProjectCode>{
    return this.https.get<ProjectCode>(`${url}/api/project-practicas/validate/${codeNumber}`);
  }

	putChangePassword(id:number, body:any): Observable<ChangePassword[]>{
    return this.https.put<ChangePassword[]>(`${url}/api/user/${id}`, body);
  }

	public putUserState(body:any){
    return this.https.put(`${url}/api/user/disable`, body);
  }

	postExternsRegister(body:any){
    return this.https.post(`${url}/api/external-person-institution`,body);
	}

	postConventiosRegister(body:any){
    return this.https.post(`${url}/api/agreement-conventions/convention`,body);
	}

	postAgreementConventionsFile(body: FormData){
    return this.https.post(`${url}/api/agreement-conventions/file`, body);
	}

	putAgreementConventionsFile(body: FormData, agreementConventionsID :number){
    return this.https.put(`${url}/api/agreement-conventions/file/${agreementConventionsID}`, body);
	}

	postProjectCoursesFile(body: FormData){
    return this.https.post(`${url}/api/project-practicas-courses/file`, body);
	}

	putProjectCoursesFile(body: FormData, studentProcessFileID :number){
    return this.https.put(`${url}/api/project-practicas-courses/file/${studentProcessFileID}`, body);
	}

	putConventiosRegister(body:any){
    return this.https.put(`${url}/api/agreement-conventions/convention`,body);
	}

	postAgreementRegister(body: any){
    return this.https.post(`${url}/api/agreement-conventions/agreement`,body);
	}

	putAgreementRegister(body: any){
    return this.https.put(`${url}/api/agreement-conventions/agreement`,body);
	}

	postAgreementsConventionsObjetives(body: any){
    return this.https.post(`${url}/api/agreement-conventions-objetive`,body);
	}

	putAgreementsConventionsObjetives(body: any){
    return this.https.put(`${url}/api/agreement-conventions-objetive`,body);
	}

	postSesionRegister(body: any){
    return this.https.post(`${url}/api/session-user`,body);
	}

	postRequestRegister(body: any){
    return this.https.post(`${url}/api/approval-request-bus`,body);
	}

	getStudentAcademicalInformation(studentID: number): Observable<AcademicalInformation>{
    return this.https.get<AcademicalInformation>(`${url}/api/internal-recognition/info/${studentID}`);
  }

	getInternalInfoStudent(studentID: number): Observable<AcademicalInformation>{
    return this.https.get<AcademicalInformation>(`${url}/api/internal-recognition/info-student/${studentID}`);
  }

	getStudentAcademicalHistory(studentID:number): Observable<AcademicalHistory[]>{
    return this.https.get<AcademicalHistory[]>(`${url}/api/internal-recognition/history/${studentID}`);
  }

  getContacPhone(personId:number): Observable<any>{
    return this.https.get(`${url}/api/person/student-phone/${personId}`);
  }

  getAddressInformation(personId:number): Observable<any>{
    return this.https.get(`${url}/api/person/student-address/${personId}`);
  }

  getPsychologicalTest(identity: string){
		/* return this.https.get(`https://sig.itca.edu.ec/api/test-usuario/${identity}`).pipe(
			catchError((err) => {
				//console.log('Estudiante de segundo nivel en adelante', err);
				let response = {
					estado_general_test: 2
				};
				return of(response);
			})
		) */
		const cycle= +sessionStorage.getItem('cycle');
		const personID= +sessionStorage.getItem('id');
		if(cycle === 1){
			return this.https.get<Survey[]>(`${url}/api/completed-survey/solveds-by-person/${personID}`).pipe(
				map( res => {
					//console.log(res);
					if(res.length >= 4){
						let response = {
							estado_general_test: 1,
							completedTest: res
						};
						return response;
					}else{
						let response = {
							estado_general_test: 0,
							completedTest: res
						};
						return response;
					}
			 	})
			);
		}else{
			let response = {
				estado_general_test: 2
			};
			return of(response);
		}
  }

  getOperatorsCellular(): Observable<OperatorsCellular[]>{
    return this.https.get<OperatorsCellular[]>(`${url}/api/golden-enroll/operators`)
  }

	getPdf() {
    this.https.get(`${url}/api/financial/reports/fees`, { responseType: 'arraybuffer' })
		.subscribe((data: ArrayBuffer) => {
			const blob = new Blob([data], { type: 'application/pdf' });
			const url = window.URL.createObjectURL(blob);
			window.open(url);
		});
  }

  getPdfPayment(paymentId: number){
    this.https.get(`${url}/api/financial/reports/feesUnico/${paymentId}`, { responseType: 'arraybuffer' })
    .subscribe((data: ArrayBuffer) => {
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    });
  }

	getPdfDragPayment(studentID: number, periodID: number){
    this.https.get(`${url}/api/financial/report/enroll-drag-payment/${studentID}/${periodID}`, { responseType: 'arraybuffer' })
    .subscribe((data: ArrayBuffer) => {
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    });
  }

  getValidationVoucher( id: string ): Observable<boolean>{
    return this.https.get<boolean>(`${url}/api/golden-financial/validate-voucher/${id}`)
  }

  ///api/enroll/verified-student/{personID}
  checkEnrollStudent(personId: number):Observable<any>{
    return this.https.get(`${url}/api/enroll/verified-student/${personId}`);
  }

  getCountries():Observable<Country[]>{
    return this.https.get<Country[]>(`${url}/api/country`);
  }

	getInstitutionTypes():Observable<Paginated<InstitutionType>>{
    return this.https.get<Paginated<InstitutionType>>(`${url}/api/institution-type`);
  }

  //Schedule listar asignaturas de arrastre
  getSignatureArrastre(studentId: number, periodId: number):Observable<any>{
    return this.https.get(`${url}/api/student/failed-courses/${studentId}/${periodId}`);
  }

  //obtener horario itca
  getScheduleITCA(studentId: number, periodId: number):Observable<any>{
    return this.https.get(`${url}/api/student/schedule-student/${studentId}/${periodId}`);
  }

  //Get horario de arraste ITCA
  getScheduleArrastre(personId:number, periodId:number, courseId:number):Observable<any>{
    return this.https.get(`${url}/api/student/schedule-course-student/${personId}/${periodId}/${courseId}`);
  }

  getEmailStudent(personId:number):Observable<any>{
    return this.https.get(`${url}/api/person/student-email/${personId}`);
  }

  getEmergencyInfo(personId:number):Observable<any>{
    return this.https.get(`${url}/api/person/student-contact-emergency/${personId}`);
  }

  getStudentDisability(personId:number):Observable<any>{
    return this.https.get(`${url}/api/person/student-disability/${personId}`);
  }

  getSector():Observable<Sector[]>{
    return this.https.get<Sector[]>(`${url}/api/sector`);
  }

  ///api/training-type
  getTrainingType():Observable<any>{
    return this.https.get(`${url}/api/training-type`);
  }
  ///api/degree/E
  getDegree():Observable<any>{
    return this.https.get(`${url}/api/degree/E`);
  }
  /* *************************************** ------------- ******************************************* */


  /* *********************************** SERVICIOS POST *********************************************** */

  savePerson( person: any){
    return this.https.post(`${url}/api/person/teacher`, person);
  }

  savePerson2( person:any){
    return this.https.put(`${url}/api/person`, person);
  }

  savePersonJSON(body:any){
    return this.https.post(`${url}/api/person/json`, body);
  }

  savePersonInfJSON(body: any) {
    return this.https.post(`${url}/api/person-inf/json`, body);
  }

	postEnrollmentAddress(body: any) {
    return this.https.post(`${url}/api/enrollment/address`, body);
  }

  saveEmailJSON(body: any) {
    return this.https.post(`${url}/api/person/email/json`, body);
  }

  saveAddressJSON(body: any) {
    return this.https.post(`${url}/api/person/address/json`, body);
  }

  getContactByPersonID(personID: number) {
    return this.https.get(`${url}/api/contact/${personID}`);
  }

  saveContactJSON(body: any) {
    return this.https.post(`${url}/api/contact/json`, body);
  }

  updateContactJSON(body: any) {
    return this.https.put(`${url}/api/contact/json`, body);
  }

  updateEmailJSON(body: any) {
    return this.https.put(`${url}/api/person/email/json`, body);
  }

  updateAddressJSON(body: any) {
    return this.https.put(`${url}/api/person/address/json`, body);
  }

  getPhoneByPersonId(personId: number) {
    return this.https.get(`${url}/api/phone/${personId}`);
  }

  savePhoneJSON(body: any) {
    return this.https.post(`${url}/api/phone/json`, body);
  }

	public postPersonPhone(body: any) {
    return this.https.post(`${url}/api/phone`, body);
  }

  updatePhoneJSON(body: any) {
    return this.https.put(`${url}/api/phone/json`, body);
  }

  saveDisabilityPersonJSON(body: any) {
    return this.https.post(`${url}/api/person/disability/json`, body);
  }

  updateDisabilityPersonJSON(body: any) {
    return this.https.put(`${url}/api/person/disability/json`, body);
  }

  updatePersonInfJSON(body: any) {
    return this.https.put(`${url}/api/person-inf/json`, body);
  }

  getPersonInfByPersonID(personID: number) {
    return this.https.get(`${url}/api/person-inf/${personID}`);
  }

  getCellphoneOperators() {
    return this.https.get(`${url}/api/operator`);
  }

  getPhoneTypes() {
    return this.https.get(`${url}/api/phone-type`);
  }

  getRelationShips() {
    return this.https.get(`${url}/api/relationship`);
  }

  getDisabilities() {
    return this.https.get(`${url}/api/disability`);
  }

  public createCustomEvent(event: CustomEvent): Observable<CustomEvent> {
    return this.https.post<CustomEvent>(`${url}/api/event`, event);
  }

  public createCustomEventSetting(event: CustomEventSetting): Observable<CustomEventSetting> {
    return this.https.post<CustomEventSetting>(`${url}/api/event-setting`, event);
  }

  public createCustomEventCalendar(event: CustomCalendarEvent): Observable<CustomCalendarEvent> {
    return this.https.post<CustomCalendarEvent>(`${url}/api/calendar`, event);
  }

  createNewDocumentPerson(fileTypeId:number,processEnrollCode:string):Observable<any>{
    const personId = sessionStorage.getItem('id');
    const studentID = sessionStorage.getItem('studentID');
    return this.https.post(`${url}/api/file/person-documents/${personId}/${fileTypeId}/${processEnrollCode}/${studentID}`, null);
  }

  acceptAgree(body:any):Observable<any>{
    return this.https.post(`${url}/api/socioeconomic-sheet/accept-agreements`, body);
  }

  updateStudentDisability(body:any):Observable<any>{
    return this.https.post(`${url}/api/person/student-disability`, body);
  }

  updateInformation(body:any):Observable<any>{
    return this.https.put(`${url}/api/person/student-update`, body);
  }


  /* *********************************** -------------- *********************************************** */


  /* *********************************** SERVICIOS PUT ************************************************ */

  public validateStatus( body: any ){
    //console.log(body);
    if(body === undefined){
      body = {
				p_personID: +sessionStorage.getItem('id')! || 0,
        p_studentID: +sessionStorage.getItem('studentID')! || 0,
				p_companyID: 1,
				p_processEnrollCode:body.p_processEnrollCode,
				p_state: 1
			}
    }
    return this.https.put(`${url}/api/enroll/detail-process`, body)
  }
  public updateCustomEvent(id: number, event: CustomEvent): Observable<CustomEvent> {
    return this.https.put<CustomEvent>(`${url}/api/event/${id}`, event);
  }

  public deleteCustomEvent(id: number): Observable<CustomEvent> {
    return this.https.delete<CustomEvent>(`${url}/api/event/${id}`);
  }

  public updateCustomEventSetting(id: number, event: CustomEventSetting): Observable<CustomEventSetting> {
    return this.https.put<CustomEventSetting>(`${url}/api/event-setting/${id}`, event);
  }

  public deleteCustomEventSetting(id: number): Observable<CustomEventSetting> {
    return this.https.delete<CustomEventSetting>(`${url}/api/event-setting/${id}`);
  }

  public updateCustomEventCalendar(id: number, event: CustomCalendarEvent): Observable<CustomCalendarEvent> {
    return this.https.put<CustomCalendarEvent>(`${url}/api/calendar/${id}`, event);
  }

  updateAddressPerson(body:any):Observable<any>{
    return this.https.put(`${url}/api/person/student-address`, body);
  }

  updateContactPhone(body:any):Observable<any>{
    return this.https.put(`${url}/api/person/student-contact`, body);
  }

  updateEmailsStudent(body:any):Observable<any>{
    return this.https.put(`${url}/api/person/student-email`, body);
  }

  updateEmegencyInfo(body:any):Observable<any>{
    return this.https.put(`${url}/api/person/student-contact-emergency`, body);
  }

  updateDisability(body:any):Observable<any>{
    return this.https.put(`${url}/api/person/disability`, body);
  }

  updateForeingTitle(body: any): Observable<any> {
    return this.https.put<any>(`${url}/api/person/disability`, body);
  }
  /* *********************************** ------------- ************************************************ */

	//Peticion para guardar la imagen del perfil de docente
	///api/collaborator/image/:personId/:fileTypeId
	postGuardarImagen(file: FormData, personID: number, fileTypeId: number):Observable<any>{
    return this.https.post(`${url}/api/collaborator/image/${personID}/${fileTypeId}`, file);
  }

	postGuardarDiscapacidadDocente ( discapacidad: Discapacidad ) {
		return this.https.post(`${url}/api/person/disability`, [discapacidad])
			;
	}

  /* *********************************** SERVICIOS DELETE ********************************************* */

  /* *********************************** ---------------- ********************************************* */

  //behaivor subject
  nextStep = new Subject<boolean>();
  nextStep$ = new BehaviorSubject<boolean>(false);

  //api/student/last-state/{personID}
  getLastState(studentId: number):Observable<any>{
    return this.https.get(`${url}/api/student/last-state/${studentId}`);
  }


  getEnrollmentType():Observable<EnrollType[]>{
    return this.https.get<EnrollType[]>(`${url}/api/golden-enroll/type`)
  }

  saveParallel(data:any):Observable<any>{
    return this.https.post<any>(`${url}/api/golden-parallel`, data)
  }
  saveLevel( form: any){
    return this.https.post(`${url}/api/golden-level`, form)
  }
  getCurrentPeriodItca(): Observable<any> {
    return this.https.get<any>(`${url}/api/period/itca`);
  }

  saveOptionPayment(body:any):Observable<any>{
    return this.https.post(`${url}/api/golden-payment`, body)
  }

	public putOptionPaymentOptions(body: any){
    return this.https.put(`${url}/api/golden-payment/options`, body)
  }

	putOptionPayment(body:any){
    return this.https.put(`${url}/api/golden-payment`, body)
  }

	public getConceptsOptionPayment(paymentOptionID: number): Observable<ConceptOptionPayment[]>{
    return this.https.get<ConceptOptionPayment[]>(`${url}/api/golden-payment/concepts-by-payment/${paymentOptionID}`).pipe(
			map((concepts: ConceptOptionPayment[]) => {
				return concepts.map((item) => ({
					...item,
					amount: +item.amount,
				}));
			})
		);
  }

  saveConceptPayment(body: any):Observable<any>{
    return this.https.post(`${url}/api/golden-payment/concepts-period`, body)
  }

	public putConceptPayment(body: any):Observable<any>{
    return this.https.put(`${url}/api/golden-payment/concepts-period`, body)
  }

  ///api/time-availability/{periodID}/{personID}
  getTimeAvailability(periodId:number, personId:number):Observable<any>{
    return this.https.get(`${url}/api/time-availability/${periodId}/${personId}`);
  }

  getFileOfServer(body: any)  {
    return this.https.post(`${url}/api/file-of-server/xlsx`, body, {responseType: 'arraybuffer'})
  }

  getFileOfServerBlob(body: any): Observable<HttpResponse<Blob>> {
    const headers = new HttpHeaders();
    return this.https.post(`${url}/api/file-of-server/xlsx`, body, { headers, observe: 'response', responseType: 'blob' })
  }
  // : Observable<HttpResponse<Blob>> {
	// 	const headers = new HttpHeaders();
	// 	return this.http.get(`${this.apiURL}/api/publication/generated-sheet/${publicationId}`, { headers, observe: 'response', responseType: 'blob' });
	// }

  getNationalityTowns(): Observable<NationalTowns[]> {
    return this.https.get<NationalTowns[]>(`${url}/api/nationality/towns`);
  }

	getQRReport(body: any)  {
		return this.https.post(`${url}/api/unacem-report/all-qr-report`, body, {responseType: 'arraybuffer'})
	}

	public validateBlackList(documentNumber: number): Observable<UnacemBlackList[]> {
		return this.https.get<UnacemBlackList[]>(`${url}/api/black-list/validate/${documentNumber}`);
	}

}
