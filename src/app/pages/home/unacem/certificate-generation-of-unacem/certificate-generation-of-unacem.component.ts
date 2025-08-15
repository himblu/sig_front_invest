import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import * as moment from 'moment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-certificate-generation-of-unacem',
  templateUrl: './certificate-generation-of-unacem.component.html',
  styleUrls: ['./certificate-generation-of-unacem.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class CertificateGenerationOfUnacemComponent implements OnInit {

  constructor(
    private Administrative: AdministrativeService,
    private Common: CommonService
  ) { }

  filter: any = {};
  periods: any[] = [];
  courses: any[] = [];
  dates: any[] = [];
  instructors: any[] = [];
  schedules: any[] = [];

  students: any[] = [];
  searched: boolean = false;
  searching: boolean = false;


  ngOnInit(): void {
    this.getPeriodsUnacem();
  }

  async getPeriodsUnacem() {
    let result: any = await this.Administrative.getUnacemPeriodExtension().toPromise();
    this.periods = result;
  }

  async resetSearch() {
    this.searched = false;
    this.students = [];
  }

  async selectPeriod() {
    this.courses = [];
    this.filter.courseID = undefined;
    this.dates = [];
    this.filter.dates = undefined;
    this.instructors = [];
    this.filter.teacherID = undefined
    this.schedules = [];
    this.filter.classSectionNumber = undefined
    this.resetSearch();
    if (this.filter.periodID) {
      let result: any = await this.Administrative.getUnacemCourseByPeriodID(this.filter.periodID).toPromise();
      //console.log(result);
      this.courses = result;
    }
  }

  async selectCourse() {
    this.dates = [];
    this.filter.dates = undefined;
    this.instructors = [];
    this.filter.teacherID = undefined;
    this.schedules = [];
    this.filter.classSectionNumber = undefined;
    this.resetSearch();
    if (this.filter.courseID) {
      let result: any = await this.Administrative.getUnacemCourseDates(this.filter.periodID, this.filter.courseID).toPromise();
      //console.log(result);
      this.dates = result;
    }
  }

  async changeDate() {
    this.instructors = [];
    this.filter.teacherID = undefined;
    this.schedules = [];
    this.filter.classSectionNumber = undefined;
    this.resetSearch();
    if (this.filter.dates) {
      this.filter.startDate = this.filter.dates.startDate;
      this.filter.endDate = this.filter.dates.endDate;
      let body: any = {
        periodID: this.filter.periodID,
        courseID: this.filter.courseID,
        startDate: this.filter.startDate,
        endDate: this.filter.endDate
      };
      let result: any = await this.Administrative.getUnacemTeacherSectionByPeriodCourseIDAndDates(body).toPromise();
      //console.log(result);
      this.instructors = result;
    }
  }

  async selectTeacher() {
    this.schedules = [];
    this.filter.classSectionNumber = undefined;
    this.resetSearch();
    if (this.filter.teacherID) {
      let body: any = {
        periodID: this.filter.periodID,
        courseID: this.filter.courseID,
        startDate: this.filter.startDate,
        endDate: this.filter.endDate,
        teacherID: this.filter.teacherID
      };
      let result: any = await this.Administrative.getUnacemCourseDatesAndId(body).toPromise();
      //console.log('schedules', result);
      this.schedules = result;
    }
  }

  async listStudents() {
    this.searched = false;
    this.searching = true;
    let body: any = {
      periodID: this.filter.periodID,
      classSectionNumber: this.filter.classSectionNumber
    }
    let result: any = await this.Administrative.getUnacemStudentByPeriodAndClassSectionNumber(body).toPromise();
    //console.log(result);
    result.map((r: any) => {
      r.blocked = r.grade !== null;
      r.grade = r.grade ? parseFloat(r.grade) : 0;
    })
    let data: any = [];
    for (let x = 0; x < result.length; x++) {
      let r: any = result[x];
      let studentSelected = data.find((d: any) => d.documentNumber === r.documentNumber)
      if (!studentSelected) {
        let newItem: any = JSON.parse(JSON.stringify(r));
        newItem.orden = 1;
        r.scores = [newItem];
        data.push(r);
      } else {
        r.orden = studentSelected.scores.length + 1;
        studentSelected.scores.push(r);
      }
    }

    // data.map((s: any) => {
    //   let scoreFound: any = s.scores.find((g: any) => g.typeEvaluationID === c.typeEvaluationID && g.nroSequence === c.nroSequence);
    //   console.log(scoreFound);
    //   if (scoreFound) {
    //     // scoreFound.orden = c.orden;
    //     scoreFound.inBD = true;
    //     scoreFound.originalGrade = scoreFound.grade || 0;
    //     // scoreFound.blocked = scoreFound.grade !== null;
    //   } else {
    //     s.scores.push({
    //       classSectionNumber: s.scores[0].classSectionNumber,
    //       documentNumber: s.scores[0].documentNumber,
    //       fullName: s.scores[0].documentNumber,
    //       grade: null,
    //       originalGrade: 0,
    //       nroSequence: s.scores[0].nroSequence,
    //       orden: s.scores[0].orden,
    //       periodID: s.scores[0].periodID,
    //       personID: s.scores[0].personID,
    //       stateGrade: null,
    //       typeEvaluacionDesc: s.scores[0].typeEvaluacionDesc,
    //       typeEvaluationID: s.scores[0].typeEvaluationID
    //     });
    //   }
    //   s.scores.sort((a: any, b: any) => a.orden - b.orden);
    // })
    //console.log(data);
    this.students = data;
    this.searched = true;
    this.searching = false;
  }



  async generateCertificate(student: any) {
    let resultFile: any = await this.Administrative.generateUnacemCertificate(student).toPromise();
    //console.log(resultFile);
    if (!resultFile) {
      Swal.fire({
        text: 'Hubo un error al generar el certificado',
        icon: 'error'
      });
      return;
    }

    if (resultFile.error) {
      Swal.fire({
        text: 'Hubo un error al generar el certificado',
        icon: 'error'
      });
      return;
    }
    if (!resultFile.existsFile) {
      Swal.fire({
        text: resultFile.message,
        icon: 'error'
      });
      return;
    }

    let file: any = await this.Common.getFileOfServer(resultFile).toPromise();
    //console.log(file);
    const blob = new Blob([file], {type: 'application/octet-stream'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `certificado-${moment().unix()}.pdf`;
    document.body.appendChild(a);
    a.click();
    // setTimeout(() => {
    // }, 4000);
    // // Swal.close();
  }

}
