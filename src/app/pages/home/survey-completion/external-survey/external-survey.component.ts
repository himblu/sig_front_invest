import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ROL } from '@utils/interfaces/login.interfaces';
import { MaterialComponentModule } from 'app/material-component/material-component.module';
import * as moment from 'moment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-external-survey',
  templateUrl: './external-survey.component.html',
  styleUrls: ['./external-survey.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MaterialComponentModule,
    FormsModule,
    MatSnackBarModule
  ]
})
export class ExternalSurveyComponent implements OnInit {
  private snackBar: MatSnackBar = inject(MatSnackBar);
  constructor(
    private Administrative: AdministrativeService,
    private Router: Router,
    private Common: CommonService,
    private ActivatedRoute: ActivatedRoute
  ) {

  }

  personID: any;
  surveys: any[] = [];
  allSurveys: any[] = [];
  institutionsAssignmentSurveys: any[] = [];
  surveySolveds: any[] = [];
  currentDate: any;
  userID: any;
  isStudent: boolean = false;
  ngOnInit(): void {
    this.userID = sessionStorage.getItem('mail');
    this.isStudent = this.userID.includes('I');
    Swal.fire({
      html: `<i class="fa fa-cog fa-spin fa-3x"></i> <br> <h2 class="text-center">Buscando Formularios ${this.isStudent ? 'del Estudiante' : 'de la Persona'}.</h2>`,
      showConfirmButton: false,
      showCancelButton: false,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    });
    this.currentDate = moment();
    let personID = sessionStorage.getItem('personID');
    this.personID = parseInt(personID);
    this.getInstitutionAssignmentSurveys();
  }

  async getInstitutionAssignmentSurveys() {
    let result: any = await this.Administrative.getInstitutionAssignmentSurvey().toPromise();
    this.institutionsAssignmentSurveys = result.filter((i: any) => i.statusID === 1);
    this.getSurveySolvedsByPerson();
  }

  async getSurveySolvedsByPerson() {
    let result: any = await this.Administrative.getSurveySolvedsByPerson(this.personID).toPromise();
    this.surveySolveds = result;
    this.getSurveysOfPerson();
  }

  async getSurveysOfPerson() {
    let result: any = await this.Administrative.getSurveyConfig().toPromise()
    this.allSurveys = result;
    this.surveys = result.filter((s: any) => s.personID === this.personID);
    this.getStudentInfo();
  }

  async getStudentInfo() {
    // console.log('Aqui buscar información del estudiante');
    // let resultPerson: any = await this.Common.getPersonByDocumentNumber(this.personID.substr(1)).toPromise();
    let result: any = await this.Administrative.getStudentByFilter(this.userID.substr(1)).toPromise();
    let careerIDs: any[] = [];
    let schoolIDs: any[] = [];
    const rol = sessionStorage.getItem('rol') ?? ''
    if (rol === ROL.STUDENT) {
      result.map((r: any) => {
        this.surveys = this.surveys.concat(...this.surveys, this.allSurveys.filter((a: any) => a.careerID === r.careerID && a.schoolID === r.schoolID));
      });
    }
    // CONFIGURACION PARA FORMULARIOS POR PROCESO
    let postulantSituation: any = await this.Administrative.getPostulantIsLegalized(this.personID).toPromise();
    if (postulantSituation.isLegalized === 1) {
      let filteredSurveys = [];
      if (rol === ROL.POSTULANT) {
        filteredSurveys = this.allSurveys.filter((a: any) =>
          a.otherProcessID === 1 &&
          a.statusID === 1
          && !this.surveys.some(s => s.surveyConfigID === a.surveyConfigID)
        )
      } else {
        filteredSurveys = this.allSurveys.filter((a: any) =>
          a.otherProcessID === 1 &&
          a.statusID === 1
          && !this.surveys.some(s => s.surveyConfigID === a.surveyConfigID)
          && careerIDs.includes(a.careerID)
          && schoolIDs.includes(a.schoolID))
      }
      this.surveys = this.surveys.concat(...filteredSurveys);
    }
    this.getPostulantCollegeByPerson();
  }

  async getPostulantCollegeByPerson() {
    let result: any = await this.Administrative.getPostulantCollegeByPersonID(this.personID).toPromise();
    this.surveys.map((s: any) => {
      let assignmentSelected: any;
      if (result.length) {
        if (result[0].collegeTypeID) {
          assignmentSelected = this.institutionsAssignmentSurveys.find((i: any) => i.surveyID === s.surveyID && i.institutionID === result[0].collegeID && i.collegeTypeID === result[0].collegeTypeID);
        } else {
          assignmentSelected = this.institutionsAssignmentSurveys.find((i: any) => i.surveyID === s.surveyID && i.institutionID === result[0].collegeID && !i.collegeTypeID);
        }
      } else {
        assignmentSelected = this.institutionsAssignmentSurveys.find((i: any) => i.surveyID === s.surveyID && i.institutionID);
        this.snackBar.open(
          `No tiene institución asignada.`,
          null,
          {
            horizontalPosition: 'center',
            verticalPosition: 'top',
            duration: 3000,
            panelClass: ['red-snackbar']
          }
        );
      }
      if (assignmentSelected) {
        s.initDate = assignmentSelected.initDate;
        s.endDate = assignmentSelected.endDate;
      }
    });
    // console.log({ surveySolveds: this.surveySolveds });
    // console.log({ surveys: this.surveys });
    this.surveys = this.surveys.filter((s: any) => moment().isBetween(moment(s.initDate), moment(s.endDate), 'date', "[]"));
    // console.log({ surveys1: this.surveys });
    // this.surveys = this.surveys.filter((s: any) => !this.surveySolveds.map((x: any) => x.surveyConfigID).includes(s.surveyConfigID));
    // console.log(this.surveys); 

    this.surveys = this.surveys.map((s: any) => {
      const isSolved = this.surveySolveds.some(
        (x: any) => x.surveyConfigID === s.surveyConfigID
      );
      if (isSolved) {
        return { ...s, statusID: 2 };
      }
      return s;
    });
    // console.log('survey2',this.surveys);
    Swal.close();
  }




  continueFillingSurvey(survey: any) {
    this.Router.navigate([`rellenado-de-encuesta/externa/${survey.surveyID}/${survey.surveyConfigID}`]);
  }

  async seeResults(survey: any) {
    console.log(survey);
    Swal.fire({
      html: '<i class="fa fa-cog fa-spin fa-3x"></i> <br> <h2 class="text-center">Buscando Datos del Reporte.</h2>',
      showConfirmButton: false,
      showCancelButton: false,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    });
    let resultFilePath: any;
    let file: any;
    if (survey.surveyID !== 1) {
      file = await this.Administrative.getReportResultEncuestaIndividual(this.personID, survey.surveyConfigID).toPromise();
    } else {
      file = await this.Administrative.getReportResultIndividual(this.personID, survey.surveyConfigID).toPromise();
    }
    console.log(file);
    const blob = new Blob([file]);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `archivo.pdf`;
    document.body.appendChild(a);
    a.click();
    Swal.close();
  }
}
