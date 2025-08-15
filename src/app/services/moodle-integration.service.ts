import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MoodleIntegrationService {

  url: string = `${environment.url}/api/moodle-integration`;
  constructor(
    private https: HttpClient
  ) { }

  getCategories():Observable<any>{
    return this.https.get(`${this.url}/categories`);
  }

  createCategories(body: any):Observable<any> {
    return this.https.post(`${this.url}/categories`, body);
  }

  updateCategories(body: any):Observable<any> {
    return this.https.put(`${this.url}/categories`, body);
  }

  getCohorts():Observable<any>{
    return this.https.get(`${this.url}/cohorts`);
  }

  createCohorts(body: any):Observable<any> {
    return this.https.post(`${this.url}/cohorts`, body);
  }

  getCourses():Observable<any>{
    return this.https.get(`${this.url}/courses`);
  }

	public getCoursesByID(cohortID: number){
    return this.https.get(`${this.url}/courses/${cohortID}`);
  }

  // LEVELING

  getLevelingCycleCourse():Observable<any>{
    return this.https.get(`${this.url}/leveling/cycle-course`);
  }

  createLevelingCycleCourse(body: any):Observable<any> {
    return this.https.post(`${this.url}/leveling/cycle-course`, body);
  }

  updateLevelingCycleCourse(body: any):Observable<any> {
    return this.https.put(`${this.url}/leveling/cycle-course`, body);
  }

  getLevelingClassSection():Observable<any>{
    return this.https.get(`${this.url}/leveling/class-section`);
  }

  createLevelingClassSection(body: any):Observable<any> {
    return this.https.post(`${this.url}/leveling/class-section`, body);
  }

  updateLevelingClassSection(body: any):Observable<any> {
    return this.https.put(`${this.url}/leveling/class-section`, body);
  }

  getLevelingEnroll(admissionPeriodID: number):Observable<any>{
    return this.https.get(`${this.url}/leveling/enroll/${admissionPeriodID}`);
  }

  createLevelingEnroll(body: any):Observable<any> {
    return this.https.post(`${this.url}/leveling/enroll`, body);
  }

  updateLevelingEnroll(body: any):Observable<any> {
    return this.https.put(`${this.url}/leveling/enroll`, body);
  }

  getLevelingLegalizeds(admissionPeriodID: number, careerID: number):Observable<any>{
    return this.https.get(`${this.url}/leveling/legalized/${admissionPeriodID}/${careerID}`);
  }

	getLevelingLegalizedStudents(admissionPeriodID: number, careerID: number, cohortID: number, courseID: number):Observable<any>{
    return this.https.get(`${this.url}/leveling/legalized-students/${admissionPeriodID}/${careerID}/${cohortID}/${courseID}`);
  }

  getEnrollInCourse(admissionPeriodID: number, courseID: number, careerID: number = 0):Observable<any>{
    return this.https.get(`${this.url}/leveling/enroll-in-course/${admissionPeriodID}/${courseID}/${careerID}`);
  }

  createUserMoodleIntegration(body: any):Observable<any> {
    return this.https.post(`${this.url}/user/moodle-integration`, body);
  }

  createUserMoodle(body: any):Observable<any> {
    return this.https.post(`${this.url}/user/moodle`, body);
  }

  getUserMoodleByField(body: any):Observable<any> {
    return this.https.post(`${this.url}/user/moodle/by-field`, body);
  }

  getUserMoodleByCriteria(body: any):Observable<any> {
    return this.https.post(`${this.url}/user/moodle/by-criteria`, body);
  }

  getQuizesOfListCourses(body: any):Observable<any> {
    return this.https.post(`${this.url}/quizes/moodle/by-list-courses`, body);
  }

  getBestGradeOfQuiz(body: any):Observable<any> {
    return this.https.post(`${this.url}/quizes/moodle/best-grade`, body);
  }

  getCourseById(courseIDMoodle: any, cohortID?: any):Observable<any> {
    return this.https.get(`${this.url}/courses/${courseIDMoodle}/${cohortID}`);
  }

  getCourseOfMemberByAdmissionPeriodIDAndPostulantID(admissionPeriodID: number, postulantID: number):Observable<any> {
    return this.https.get(`${this.url}/member/moodle/course/${admissionPeriodID}/${postulantID}`);
  }

  getMemberInfoByAdmissionPeriodIDAndPostulantID(admissionPeriodID: number, postulantID: number):Observable<any> {
    return this.https.get(`${this.url}/member/moodle/info/${admissionPeriodID}/${postulantID}`);
  }

  deleteUserMoodle(body: any):Observable<any> {
    return this.https.post(`${this.url}/user/moodle/delete`, body);
  }

  deleteMemberOfCourse(body: any):Observable<any> {
    return this.https.post(`${this.url}/member/moodle/delete`, body);
  }

}
