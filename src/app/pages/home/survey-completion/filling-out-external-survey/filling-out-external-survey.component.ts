import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministrativeService } from '@services/administrative.service';
import { MaterialComponentModule } from 'app/material-component/material-component.module';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { CommonService } from '@services/common.service';

@Component({
  selector: 'app-filling-out-external-survey',
  templateUrl: './filling-out-external-survey.component.html',
  styleUrls: ['./filling-out-external-survey.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialComponentModule
  ]
})
export class FillingOutExternalSurveyComponent implements OnInit {

  constructor(
    private Administrative: AdministrativeService,
    private ActivatedRoute: ActivatedRoute,
    private Router: Router,
    private Common: CommonService
  ) {

  }

  pagination: any = {
    currentPage: 1,
  }

  surveySelected: any = {
    title: 'Encuesta de Prueba',
  };

  pages: number[] = [1,2,3,4];

  questions: any[] = [];
  alternatives: any[] = [];
  lorem = 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Recusandae explicabo molestiae assumenda, soluta laudantium nostrum asperiores animi? Quia sint alias veritatis, corrupti totam, blanditiis nemo, neque et autem suscipit rerum!';

  surveyID: any;
  surveyConfigID: any;
  personID: any;
  surveyConfigSelected: any;
  surveysOfPerson: any[] = [];
  allSurveysOfPerson: any[] = [];
  fullName: any;
  emailInfo: any;
  institutionsAssignmentSurveys: any[] = [];
  surveySolveds: any[] = [];
  allSurveys: any[] = [];
  surveys: any[] = [];
  ngOnInit(): void {
    let params: any = this.ActivatedRoute.snapshot.params;
    this.surveyID = parseInt(params.surveyID);
    this.surveyConfigID = parseInt(params.surveyConfigID);
    let personID = sessionStorage.getItem('personID');
    this.fullName = sessionStorage.getItem('name');
    this.personID = parseInt(personID);
    Swal.fire({
      text: 'Cargando Información para la Encuesta',
      showConfirmButton: false,
      showCancelButton: false,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    });
    this.getInitialData();
  }
  
  async getInitialData() {

    let resultEmail: any = await this.Common.getEmailStudent(this.personID).toPromise();
    // console.log(resultEmail);
    if (resultEmail) {
      this.emailInfo = resultEmail[0];
    }
    let resultConfig: any = await this.Administrative.getSurveyConfig().toPromise();
    this.surveysOfPerson = resultConfig.filter((r: any) => r.personID === this.personID && r.statusID !== 2);
    this.allSurveysOfPerson = resultConfig;
    // console.log(this.surveysOfPerson);

    this.surveyConfigSelected = resultConfig.find((r: any) => r.surveyConfigID === this.surveyConfigID && r.surveyID === this.surveyID);
    // console.log(this.surveyConfigSelected);
    let resultSurvey: any = await this.Administrative.getSurveys().toPromise();


    // CONFIGURACION PARA FORMULARIOS POR PROCESO
    let postulantSituation: any = await this.Administrative.getPostulantIsLegalized(this.personID).toPromise();
    // console.log(postulantSituation);
    if (postulantSituation.isLegalized === 1) {
      resultSurvey = resultSurvey.concat(resultSurvey.filter((a: any) => a.otherProcessID === 1 && a.statusID === 1));
      // console.log(resultSurvey);
    }
    
    let resultInstitution: any = await this.Administrative.getInstitutionAssignmentSurvey().toPromise();
    // console.log(resultInstitution);
    resultInstitution = resultInstitution.filter((i: any) => i.statusID === 1);

    let result: any = await this.Administrative.getPostulantCollegeByPersonID(this.personID).toPromise();
    // console.log(result);
    resultSurvey.map((s: any) => {
      let assignmentSelected: any;
      if (result.length) {
        if (result[0].collegeTypeID !== 0) {
          assignmentSelected = resultInstitution.find((i: any) => i.surveyID === s.surveyID && i.institutionID === result[0].collegeID && i.collegeTypeID === result[0].collegeTypeID);
        } else {
          // console.log('llego aqui');
          assignmentSelected = resultInstitution.find((i: any) => i.surveyID === s.surveyID && i.institutionID === result[0].collegeID);
        }
      } else {
        assignmentSelected = resultInstitution.find((i: any) => i.surveyID === s.surveyID && i.institutionID == s.collegeID);
      }
      if (assignmentSelected) {
        s.initDate = assignmentSelected.initDate;
        s.endDate = assignmentSelected.endDate;
        // console.log(assignmentSelected);
      }
    });

    // resultSurvey = resultSurvey.filter((s: any) => moment().isBetween(moment(s.initDate), moment(s.endDate),'date', "[]"));
    this.surveysOfPerson = this.surveysOfPerson.filter((s: any) => resultSurvey.map((r: any) => r.surveyID).includes(s.surveyID));
    // console.log(this.surveysOfPerson);
    this.surveySelected = resultSurvey.find((r: any) => r.surveyID === this.surveyID);

    let resultQuestion: any = await this.Administrative.getQuestions().toPromise();
    this.questions = resultQuestion.filter((q: any) => q.surveyTypeID === this.surveySelected.surveyTypeID);
    let resultAlternative: any = await this.Administrative.getAlternatives().toPromise();

    this.questions.map((q: any) => {
      q.alternatives = JSON.parse(JSON.stringify(resultAlternative.filter((a: any) => a.questionTypeID === q.questionType)));
      q.quantityAlternatives = q.alternatives.length;
    });
    this.surveySelected.inTable = !this.questions.some((q: any) => q.quantityAlternatives > 4);
    // console.log("<<<<<<<<<<<<<<<<<<<<<<<<< PARA PRUEBAS >>>>>>>>>>>>>>>>>>>>>>>");
    // console.log("<<<<<<<<<<<<<<<<<<<<<<<<<this.surveySelected>>>>>>>>>>>>>>>>>>>>>>>");
    // console.log(this.surveySelected);
    // console.log(this.questions);
    // this.questions.map((q: any) => {
    //   if (q.alternatives.length) {
    //     q.alternatives[0].selected = true;
    //   }
    //   q.solved = true;
    // })
    Swal.close();
    
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
    this.validateSurvey();
    this.getPostulantCollegeByPerson();
  }

  async getPostulantCollegeByPerson() {
    let result: any = await this.Administrative.getPostulantCollegeByPersonID(this.personID).toPromise();
    this.allSurveysOfPerson.map((s: any) => {
      let assignmentSelected: any;
      if (result.length) {
        if (result[0].collegeTypeID) {
          assignmentSelected = this.institutionsAssignmentSurveys.find((i: any) => i.surveyID === s.surveyID && i.institutionID === result[0].collegeID && i.collegeTypeID === result[0].collegeTypeID);
        } else {
          assignmentSelected = this.institutionsAssignmentSurveys.find((i: any) => i.surveyID === s.surveyID && i.institutionID === result[0].collegeID && !i.collegeTypeID);
        }
      } else {
        assignmentSelected = this.institutionsAssignmentSurveys.find((i: any) => i.surveyID === s.surveyID && i.institutionID);
      }
      if (assignmentSelected) {
        s.initDate = assignmentSelected.initDate;
        s.endDate = assignmentSelected.endDate;
      }
    });
    // console.log({ surveySolveds: this.surveySolveds });
    // console.log({ surveys: this.allSurveysOfPerson });
    let surveys: any = this.allSurveysOfPerson.filter((s: any) => moment().isBetween(moment(s.initDate), moment(s.endDate), 'date', "[]"));
    // console.log({ surveys1: surveys });
    surveys = surveys.filter((s: any) => !this.surveySolveds.map((x: any) => x.surveyConfigID).includes(s.surveyConfigID));
    // console.log(this.surveys); Swal.close();
  }

  back() {
    this.Router.navigate(['rellenado-de-encuesta/externa']);
  }

  toggleSelectedAlternative(question: any, alternative: any) {
    question.alternatives.map((a: any) => {
      a.selected = false;
    });
    alternative.selected = !alternative.selected;
    question.solved = true;
    this.validateSurvey();
  }

  toggleCheckedAlternative(question: any, alternative: any) {
    alternative.selected = !alternative.selected;
  }

  validateSurvey() {
    this.surveySelected.valid = this.questions.filter((q: any) => q.solved).length === this.questions.length;
  }

  saveChanges() {
    Swal.fire({
      text: '¿Estas seguro de guardar las respuestas?',
      icon: 'question',
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonColor: '#014898',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        // console.log(this.surveys.map((s: any) => s.surveyConfigID));
        // return;
        Swal.fire({
          text: 'Guardando las respuestas del formulario',
          showConfirmButton: false,
          showCancelButton: false,
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false
        });

        let questions = this.questions.map((q: any) => {
          let alternativeSelected: any = q.alternatives.find((a: any) => a.selected) || {alternativeID: 1};
          return {
            surveyID: this.surveyConfigSelected.surveyID,
            questionID: q.questionID, 
            alternativeID: alternativeSelected.alternativeID, 
            personID: this.personID, 
            surveyConfigID: this.surveyConfigSelected.surveyConfigID,
            statusID: 1,
            userCreated: this.personID,
            anotherResponse: q.anotherResponse
          };
        });
  
        // console.log(questions);
        let body: any = {
          news: questions
        };
        let result: any = await this.Administrative.saveCompletedSurveys(body).toPromise();
        if (!result) {
          Swal.fire({
            text: 'Hubo un error',
            icon: 'error'
          });
          return;
        }
  
        // this.surveySelected.statusID = 2;
        if (this.surveyConfigSelected.personID) {
          this.surveyConfigSelected.statusID = 2;
        }
        this.surveyConfigSelected.sendMail = this.surveys.length === 1;
        this.surveyConfigSelected.personFullName = this.fullName; 
        this.surveyConfigSelected.personEmail = `${this.emailInfo.emailDesc}`.toLowerCase(); 
        this.surveyConfigSelected.surveysToPDF = this.surveys.map((s: any) => s.surveyConfigID);
        let bodySurveyConfig = {
          updates: [this.surveyConfigSelected]
        };
        // console.log(bodySurveyConfig);
        let resultSurvey: any = await this.Administrative.updateSurveyConfig(bodySurveyConfig).toPromise();
        if (!resultSurvey) {
          Swal.close();
          Swal.fire({
            text: 'Hubo un error',
            icon: 'error'
          });
          return;
        }
        Swal.close();
        Swal.fire({
          text: 'Se culminó el rellenado del Formulario',
          icon: 'success',
          showConfirmButton: true,
          showCancelButton: false,
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false
        }).then(async (choice) => {
          if (choice.isConfirmed) {
            this.surveysOfPerson = this.surveysOfPerson.filter((s: any) => s.surveyID !== this.surveySelected.surveyID);
            if (this.surveysOfPerson.length) {
              this.Router.navigate([`rellenado-de-encuesta/externa/${this.surveysOfPerson[0].surveyID}/${this.surveysOfPerson[0].surveyConfigID}`]);
              this.surveyID = this.surveysOfPerson[0].surveyID;
              this.getInitialData();
            } else {
  
              this.Router.navigate(['rellenado-de-encuesta/externa']);
            }
          }
        });
      }

    });
  }

}
