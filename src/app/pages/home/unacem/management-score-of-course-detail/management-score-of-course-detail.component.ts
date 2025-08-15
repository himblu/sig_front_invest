import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-management-score-of-course-detail',
  templateUrl: './management-score-of-course-detail.component.html',
  styleUrls: ['./management-score-of-course-detail.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class ManagementScoreOfCourseDetailComponent implements OnInit {

  constructor(
    private ActivatedRoute: ActivatedRoute,
    private Router: Router,
    private Administrative: AdministrativeService,
    private Common: CommonService
  ) {

  }


  students: any[] = [];
  evaluationConfig: any[] = [];
  filter: any = {};
  periodID: number;
  classSectionNumber: number;
  personID: number;
  teacher: any;
  course: any;
  componentsOfCourse: any = [];
  URL_MANAGEMENT_COURSE: string = '/unacem/administracion-de-notas-del-curso';
  DASHBOARD: string = '/';
  newSaveScore: any = {};
  teacherID: number;
  ngOnInit(): void {
    Swal.fire({
      html: '<i class="fa fa-cog fa-spin fa-3x"></i> <br> <h2 class="text-center">Buscando Información de la Persona.</h2>',
      showConfirmButton: false,
      showCancelButton: false,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    });
    this.personID = +sessionStorage.getItem('personID');
    let params: any = this.ActivatedRoute.snapshot.params;
    let periodID = +params.periodID;
    this.teacherID = +params.teacherID;
    let classSectionNumber = +params.classSectionNumber;
    if (isNaN(periodID) || isNaN(classSectionNumber)) {
      Swal.fire({
        text: '¡No debes estar aqui!',
        icon: 'error'
      });
      this.Router.navigate(['/unacem/administracion-de-notas-del-curso']);
      return;
    }
    this.periodID = periodID;
    this.classSectionNumber = classSectionNumber;
    this.getTeacherInfo();
  }

  async getTeacherInfo() {
    let result: any = await this.Administrative.getTeacherInfoByPersonID(this.personID).toPromise();
    //console.log('getTeacherInfoByPersonID', result);
    this.teacher = result.find((r: any) => r.positionID === 1);
    // // VALIDACION DOCENTE
    // if (!this.teacher) {
    //   Swal.fire({
    //     text: 'No tienes cargo de DOCENTE, no puedes estar en esta sección',
    //     icon: 'error'
    //   });
    //   this.Router.navigate([this.DASHBOARD]);
    //   return;
    // }
    if (!this.teacher) this.teacher = {};
    this.getCourseInfo();
  }

  async getCourseInfo() {
    let body: any = {
      periodID: this.periodID,
      teacherID: this.teacher.teacherID || 16,
      text: this.filter.text || '',
      sectionStatusID: 0
    }
    let result: any = await this.Administrative.getScheduleUnacemByPeriodIDAndTeacherIDAndText(body).toPromise();
    //console.log(result);
    this.course = result.find((r: any) => r.classSectionNumber === this.classSectionNumber);
    //console.log(this.course);
    this.getComponentOfCourse();

  }

  async getComponentOfCourse() {
    let body: any = {
      periodID: this.periodID,
      classSectionNumber: this.classSectionNumber
    };
    let result: any = await this.Administrative.getUnacemComponentClassSectionNumberByPeriodIDAndClassSectionNumber(body).toPromise();
    this.componentsOfCourse = result.filter((r: any) => r.classSectionNumber === this.classSectionNumber);
    //console.log(this.componentsOfCourse);
    this.getStudents();
  }

  async getStudents() {
    let body: any = {
      periodID: this.periodID,
      classSectionNumber: this.classSectionNumber
    };
    let result: any = await this.Administrative.getUnacemStudentByPeriodIDAndClassSectionNumber(body).toPromise();
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

    data.map((s: any) => {
      this.componentsOfCourse.map((c: any) => {
        let scoreFound: any = s.scores.find((g: any) => g.typeEvaluationID === c.typeEvaluationID && g.nroSequence === c.nroSequence);
        //console.log(scoreFound);
        if (scoreFound) {
          scoreFound.orden = c.orden;
          scoreFound.inBD = true;
          scoreFound.originalGrade = scoreFound.grade || 0;
          // scoreFound.blocked = scoreFound.grade !== null;
        } else {
          s.scores.push({
            classSectionNumber: this.classSectionNumber,
            documentNumber: s.scores[0].documentNumber,
            fullName: s.scores[0].documentNumber,
            grade: null,
            originalGrade: 0,
            nroSequence: c.nroSequence,
            orden: c.orden,
            periodID: this.periodID,
            personID: s.scores[0].personID,
            stateGrade: null,
            typeEvaluacionDesc: c.typeEvaluacionDesc,
            typeEvaluationID: c.typeEvaluationID
          });
        }

      })
      s.scores.sort((a: any, b: any) => a.orden - b.orden);
    })
    //console.log(data);
    this.students = data;
    Swal.close();
  }

  validateScore() {
    this.students.map((s: any) => {
      s.scores.map((g: any) => {
        // g.grade = g.grade || 0;
        g.isInvalid = g.grade < 0 || g.grade > 20;
        g.isModified = (g.grade || 0) !== g.originalGrade;
      });
    });
    this.newSaveScore.existsInvalids = this.students.map((s: any) => s.scores.some((g: any) => g.isInvalid)).filter((s: any) => s).length > 0;
    this.newSaveScore.existsModifies = this.students.map((s: any) => s.scores.some((g: any) => g.isModified)).filter((s: any) => s).length > 0;
  }

  saveScores() {
    Swal.fire({
      text: '¿Estas seguro de guardar las notas?',
      icon: 'question',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      showConfirmButton: true,
      confirmButtonColor: '#014898',
      showCancelButton: true,
      cancelButtonText: 'Cancelar'
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        let data: any = [];

        this.students.map((s: any) => {
          data = data.concat(s.scores.filter((g: any) => g.isModified && !g.existsInvalids).map((g: any) => {
            return {
              periodID: s.periodID,
              classSectionNumber: s.classSectionNumber,
              personID: s.personID,
              typeEvaluationID: g.typeEvaluationID,
              grade: g.grade,
              nroSequence: g.nroSequence,
              userCreated: this.personID,
							teacherID: this.teacher.teacherID
            }
          }))
        })


        let body: any = {
          updates: data
        };

        let result: any = await this.Administrative.updateGradeDetailByComponentInBulk(body).toPromise();
        if (!result) {
          Swal.fire({
            text: 'Hubo un error al momento de actualizar las notas de los estudiantes',
            icon: 'error'
          });
          return;
        }
        Swal.fire({
          text: 'Se modificaron las notas correctamente',
          icon: 'success'
        });
        setTimeout(() => {
          this.ngOnInit();
        }, 2000);
        // this.Router.navigate(['/unacem/administracion-de-notas-del-curso']);
      }
    })
  }

  async getGradesReport(fileType: string) {

    switch (fileType) {
      case 'pdf':
        let body: any = {
          periodID: this.periodID,
          classSectionNumber: this.classSectionNumber
        }
        let report: any = await this.Administrative.getGradeCourseReport(body).toPromise();
        //console.log(report);
        let file: any = await this.Common.getFileOfServer({filePath: report.filePath}).toPromise();
        const blob = new Blob([file], {type: 'application/octet-stream'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `calificaciones-de-curso-${this.classSectionNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        Swal.close();
        break;

      default:
        //console.log('otra cosa');
        break;
    }

  }

}
