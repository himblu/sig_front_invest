import { CommonModule } from '@angular/common';
import {Component, OnInit, ViewChild} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import Swal from 'sweetalert2';
import {ModalDirective} from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-management-score-of-course',
  templateUrl: './management-score-of-course.component.html',
  styleUrls: ['./management-score-of-course.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BsDropdownModule
  ]
})
export class ManagementScoreOfCourseComponent implements OnInit {

  constructor(
    private Administrative: AdministrativeService,
    private Router: Router,
    private Common: CommonService
  ) {}

  filter: any = {};
  sectionStatuses: any[] = [];
  periods: any[] = [];
  results: any[] = [];
  searched: boolean = false;
  personID: number;
  teacher: any;
  teacherTypes: any [] = [];
  ngOnInit(): void {
    this.personID = +sessionStorage.getItem('personID');
    this.getTeacherInfo();

  }

  async getTeacherInfo() {
    let result: any = await this.Administrative.getTeacherInfoByPersonID(this.personID).toPromise();
    //console.log(result);
    result = result.filter((r: any) => r.positionID === 1);
    if (!result.length) {
      Swal.fire({
        text: 'No tienes el ROL de docente. No puedes usar esta opción',
        icon: 'error'
      });
      this.Router.navigate([`/`]);
      return;
    } else {
      if (result.length > 1) {
        this.teacherTypes = result;
        //console.log(this.teacherTypes);
      } else {
        this.teacher = result[0];
        this.filter.teacherID = this.teacher.teacherID;
        if (!this.teacher) {
          this.teacher = {};
        }
      }
    }
    this.getSectionStatuses();
    this.getPeriods();
  }

  async getPeriods() {
    let result: any = await this.Administrative.getUnacemPeriodExtension().toPromise();
    //console.log(result);
    this.periods = result;
  }

  async getSectionStatuses() {
    let result: any = await this.Administrative.getSectionStatus().toPromise();
    this.sectionStatuses = result;
  }

  async searchCoursesOfTeacher() {
    this.searched = false;
    let body: any = {
      periodID: this.filter.periodID,
      teacherID: this.filter.teacherID,
      text: this.filter.text,
      sectionStatusID: this.filter.sectionStatusID || 0
    }
    let result: any = await this.Administrative.getScheduleUnacemByPeriodIDAndTeacherIDAndText(body).toPromise();
    //console.log(result);
    this.results = result;
    this.searched = true;
  }

  // Opción para ver detalle de curso
  viewDetailCourse(course: any) {
    Swal.fire({
      text: '¿Estás seguro de ver el detalle del Curso?',
      icon: 'question',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: '#014898',
      showConfirmButton: true,
      cancelButtonText: 'Cancelar'
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        this.Router.navigate([`/unacem/administracion-de-notas-del-curso-a-detalle/${this.filter.teacherID}/${course.periodID}/${course.classSectionNumber}`]);
      }
    })
  }

  async downloadResults() {
    let body: any = {
      periodID: this.filter.periodID,
      teacherID: this.filter.teacherID,
      text: this.filter.text,
      sectionStatusID: this.filter.sectionStatusID || 0
    }
    let report: any = await this.Administrative.getCourseInfoReport(body).toPromise();
    console.log(report);
    let file: any = await this.Common.getFileOfServer({filePath: report.filePath}).toPromise();
    const blob = new Blob([file]);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `informacion-de-curso-${this.filter.teacherID}.pdf`;
    document.body.appendChild(a);
    a.click();
    Swal.close();
  }

  async getScheduleCourseReport(courseSection: any) {
    let body: any = {
      periodID: this.filter.periodID,
      classSectionNumber: courseSection.classSectionNumber
    }
    let report: any = await this.Administrative.getScheduleCourseReport(body).toPromise();
    console.log(report);
    let file: any = await this.Common.getFileOfServer({filePath: report.filePath}).toPromise();
    const blob = new Blob([file]);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `horario-de-curso-${courseSection.classSectionNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    Swal.close();
  }

  async getEnrollmentReport(course: any) {
    console.log(course);
    let body: any = {
      periodID: this.filter.periodID,
      classSectionNumber: course.classSectionNumber
    }
    let report: any = await this.Administrative.getEnrollmentReport(body).toPromise();
    console.log(report);
    if (!report.filePath) {
      Swal.fire({
        text: 'No existe datos que exportar',
        icon: 'warning'
      });
      return;
    }
    let file: any = await this.Common.getFileOfServer({filePath: report.filePath}).toPromise();
    // let file: any = await this.Common.getFileOfServerBlob({filePath: report.filePath}).toPromise();
    // console.log(file);
    // let contentType: string | null | undefined = file.headers.get('content-type');
    // // Porque el tipo de variable que recibe el type es string o undefined. No recibe null.
    // if (!contentType) {
    //   contentType = undefined;
    // }
    // const blob: Blob = new Blob([file.body], { type: contentType });
    const blob = new Blob([file], {type: 'application/octet-stream'});
    console.log(blob);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `matriculados-en-el-curso-${course.classSectionNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    Swal.close();
  }

}
