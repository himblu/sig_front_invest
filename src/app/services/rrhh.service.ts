import { Sequence } from './../utils/interfaces/sequence.interface';
import { Observable, catchError, filter, map, of, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Campus, Tables } from '@utils/interfaces/period.interfaces';
import { Charge, SPGetPerson, TeacherAux } from '@utils/interfaces/person.interfaces';
import { AcademicTraining, Area, ArticlePublishing, Colaborator, CollaboratorPrev2, EmployeeContract, ExperienceMatter, JobExperience, References, SocietyLinkage, Staff, SustantiveFunctions, TimeAvailability, Training, WorkExperience } from '../utils/interfaces/rrhh.interfaces';
import { PersonDocument } from '@utils/interfaces/others.interfaces';

let url:string = environment.url;
@Injectable({
  providedIn: 'root'
})
export class RrhhService {

  constructor( private https: HttpClient ) { }

  /* *********************************** LISTAS GETTERS SETTERS ************************************** */

  /* *********************************** ---------------------- ************************************** */


  /* *********************************** FUNCIONES VARIAS ********************************************* */

  /* *********************************** -------------------------- *********************************** */


  /* *************************************** SERVICIOS GET ******************************************* */

  getTeacher( page: number = 1, filter: string = '', limit: number = 1000): Observable<Tables<TeacherAux>>{
    return this.https.get<Tables<TeacherAux>>(`${url}/api/teacher?page=${page}&filter=${filter}&limit=${limit}`);
  }

	getTeacherUnacem( page: number = 1, filter: string = '', limit: number = 1000): Observable<Tables<TeacherAux>>{
		return this.https.get<Tables<TeacherAux>>(`${url}/api/unacem-teacher`);
	}

  getTimeAvailability(): Observable<TimeAvailability[]>{
    return this.https.get<TimeAvailability[]>(`${url}/api/general-information/24`);
  }
  getPosition(): Observable<any[]>{
    return this.https.get<any[]>(`${url}/api/project-position`);
  }
  ///api/article-publishing/participation
  getArticlePublishingParticipation(): Observable<any[]>{
    return this.https.get<any[]>(`${url}/api/article-publishing/participation`);
  }
  //api/article-publishing/state
  getArticlePublishingState(): Observable<any[]>{
    return this.https.get<any[]>(`${url}/api/article-publishing/state`);
  }
  /* *************************************** ------------- ******************************************* */


  /* *********************************** SERVICIOS POST *********************************************** */

  ///api/collaborator/files-docs/:personID/:fileTypeID/:sequenceNro
  postFileDocs(file:File, personID: number, fileTypeID: number, sequenceNro: number){
    const formData: FormData = new FormData();
    formData.append('file', file);
    return this.https.post(`${url}/api/collaborator/files-docs/${personID}/${fileTypeID}/${sequenceNro}`, formData)
  }

  postProfileImage(file: File, personID: number, fileTypeId: number):Observable<any>{
    const formData: FormData = new FormData();
    formData.append('file', file);
    return this.https.post(`${url}/api/collaborator/image/${personID}/${fileTypeId}`, formData);
  }

	postFileApprovalRequestBus(file: File, approvalRequestBusID: number, personID: number, campoarchivo: string, user: string, studentId: number):Observable<any>{
    const formData: FormData = new FormData();
    formData.append('file', file);
    return this.https.post(`${url}/api/approval-request-bus/docs/${approvalRequestBusID}/${personID}/${studentId}/${campoarchivo}/${user}`, formData);
	}

	postCollaboratorDocs(file: File, personID: number, fileTypeId: number, sequenceNro: number){
    const formData: FormData = new FormData();
    formData.append('file', file);
    return this.https.post(`${url}/api/collaborator/files-docs/${personID}/${fileTypeId}/${sequenceNro}`, formData);
  }

	putCollaboratorDocs(file: File, docEmpleadoID: number, fileTypeID: number, sequenceNro: number, personID: number){
    const formData: FormData = new FormData();
    formData.append('file', file);
    return this.https.put(`${url}/api/collaborator/files/${docEmpleadoID}/${fileTypeID}/${sequenceNro}/${personID}`, formData);
  }

  postTraining(from: Training){
    return this.https.post(`${url}/api/academic-training`, from)
				/*.pipe(
					map (res =>Object.entries(res)),
					catchError ( () => of ())
				)*/
  }

  postWorkExperience(from: WorkExperience){
    return this.https.post(`${url}/api/job-experience`, from);
  }

	putWorkExperience(from: WorkExperience){
    return this.https.put(`${url}/api/job-experience`, from);
  }

  postExperienceMatter(from: any){
    return this.https.post(`${url}/api/experience-matter`, from);
  }

  postTimeAvailability(from: any){
    return this.https.post(`${url}/api/time-availability`, from);
  }

  postTraining2(from: Training){
    return this.https.post(`${url}/api/training`, from);
  }

	putTraining(from: Training){
    return this.https.put(`${url}/api/training`, from);
  }

  postSocietyLinkage(from: SocietyLinkage){
    return this.https.post(`${url}/api/society-linkage`, from);
  }

	putSocietyLinkage(from: SocietyLinkage){
    return this.https.put(`${url}/api/society-linkage`, from);
  }

  postReferences(from: References){
    return this.https.post(`${url}/api/references`, from);
  }

	putReferences(from: References){
    return this.https.put(`${url}/api/references`, from);
  }

  postCollaborator(data:any):Observable<any>{
    return this.https.post(`${url}/api/collaborator/prev`, data);
  }

  //postInvestigation
  postInvestigation(data: any){
    return this.https.post(`${url}/api/investigation`, data);
  }

	putInvestigation(data: any){
    return this.https.put(`${url}/api/investigation`, data);
  }

  ///api/book-publishing
  postBookPublishing(data: any){
    return this.https.post(`${url}/api/book-publishing`, data);
  }

	putBookPublishing(data: any){
    return this.https.put(`${url}/api/book-publishing`, data);
  }

  //api/article-publishing
  postArticlePublishing(data: any){
    return this.https.post(`${url}/api/article-publishing`, data);
  }

	putArticlePublishing(data: any){
    return this.https.put(`${url}/api/article-publishing`, data);
  }

	public getFilesByPerson(personID: number): Observable<PersonDocument[]>{
    return this.https.get<PersonDocument[]>(`${url}/api/collaborator/files-by-person/${personID}`);
  }

  ///api/employee/type
  getEmployeeType(): Observable<any[]>{
    return this.https.get<any[]>(`${url}/api/employee/type`);
  }

	getEmployeeTypeByContract(contractTypeID: number): Observable<any[]>{
    return this.https.get<any[]>(`${url}/api/employee/type/${contractTypeID}`);
  }

  ///api/employee/contract-type
  getContractType(): Observable<any[]>{
    return this.https.get<any[]>(`${url}/api/employee/contract-type`);
  }

  ///api/employee/dedications
  getDedications(): Observable<any[]>{
    return this.https.get<any[]>(`${url}/api/employee/dedications`);
  }

  //funciones sutantivas
  //api/schedule-type
  getSustantiveFunctions(): Observable<SustantiveFunctions[]>{
    return this.https.get<SustantiveFunctions[]>(`${url}/api/schedule-type`);
  }

  ///api/course/all
  getCourse(): Observable<any[]>{
    return this.https.get<any[]>(`${url}/api/course/all`);
  }

  ///api/employee/category-salary/{employeeTypeID}
  getCategorySalary(employeeTypeID: number): Observable<any[]>{
    return this.https.get<any[]>(`${url}/api/employee/category-salary/${employeeTypeID}`);
  }
  ///api/employee/scale-salary/:p_salaryCategoryID
  getScaleSalary(p_salaryCategoryID: number): Observable<any[]>{
    return this.https.get<any[]>(`${url}/api/employee/scale-salary/${p_salaryCategoryID}`);
  }
  ///api/position
  getCharge(): Observable<any[]>{
    return this.https.get<any[]>(`${url}/api/position`);
  }
	getChargeByStaff(staffID: number): Observable<Charge[]>{
    return this.https.get<Charge[]>(`${url}/api/position/contract/${staffID}`);
  }
  ///api/prev
  getCollaborators(limit:number, page:number, filter:any, statusID:number): Observable<any[]>{
    return this.https.get<any[]>(`${url}/api/collaborator/prev?limit=${limit}&page=${page}&filter=${filter}&statusID=${statusID}`);
  }
  //api/person/{personId}
  getPerson(personId: number): Observable<SPGetPerson>{
    return this.https.get<SPGetPerson>(`${url}/api/person/${personId}`);
  }

  //api/training/{personID}
  public getTraining(personID: number): Observable<Training[]>{
    return this.https.get<Training[]>(`${url}/api/training/${personID}`);
  }

	public getAcademicTraining(personID: number): Observable<AcademicTraining[]>{
    return this.https.get<AcademicTraining[]>(`${url}/api/academic-training/${personID}`);
  }

	public putAcademicTraining(body: any){
    return this.https.put(`${url}/api/academic-training`, body);
  }

	public getJobExperience(personID: number): Observable<JobExperience[]>{
    return this.https.get<JobExperience[]>(`${url}/api/job-experience/${personID}`);
  }

  //api/investigation/{personID}
  public getInvestigation(personID: number): Observable<any[]>{
    return this.https.get<any[]>(`${url}/api/investigation/${personID}`);
  }

  //api/article-publishing/{personID}
  public getArticlePublishing(personID: number): Observable<ArticlePublishing[]>{
    return this.https.get<ArticlePublishing[]>(`${url}/api/article-publishing/${personID}`);
  }

	public getSocietyLinkage(personID: number): Observable<any[]>{
    return this.https.get<any[]>(`${url}/api/society-linkage/${personID}`);
  }

	public getReferences(personID: number): Observable<any[]>{
    return this.https.get<any[]>(`${url}/api/references/${personID}`);
  }

  //api/book-publishing/{personID}
  public getBookPublishing(personID: number): Observable<any[]>{
    return this.https.get<any[]>(`${url}/api/book-publishing/${personID}`);
  }

  //POST
  //api/employee
  postEmployee(data: any){
    return this.https.post(`${url}/api/employee`, data);
  }

	getEmployeeContract(personID: number): Observable<EmployeeContract[]>{
    return this.https.get<EmployeeContract[]>(`${url}/api/employee/contract/${personID}`);
  }

  ///api/position/contract get
  getPositionContract(): Observable<any[]>{
    return this.https.get<any[]>(`${url}/api/position/contract`);
  }

	getStaff(): Observable<Staff[]>{
    return this.https.get<Staff[]>(`${url}/api/employee/staff`);
  }

	getArea(): Observable<Area[]>{
    return this.https.get<Area[]>(`${url}/api/area`);
  }

  //api/campus/all
  getCampus(): Observable<Campus[]>{
    return this.https.get<Campus[]>(`${url}/api/campus/all`);
  }

  getFileDocs(personID: number){
    return this.https.get(`${url}/api/collaborator/files/${personID}`)
  }

  //api/collaborator/prev/{personID}
  getCollaboratorPrev(personID: number): Observable<any>{
    return this.https.get<any>(`${url}/api/collaborator/prev/${personID}`);
  }

  //api/collaborator/prev/1494/2023-11-25
  getCollaboratorPrev2(personID: number, date: string): Observable<CollaboratorPrev2>{
    return this.https.get<CollaboratorPrev2>(`${url}/api/collaborator/prev/${personID}/${date}`);
  }
}

