import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, SecurityContext, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { MaterialComponentModule } from 'app/material-component/material-component.module';
import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { Validators } from 'ngx-editor';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { CreateInstitutionComponent } from '../components/create-institution/create-institution.component';
import { Subscription } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { ApiService } from '@services/api.service';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MaterialComponentModule,
    ModalModule,
    TabsModule,
		MatDialogModule
  ]
})
export class SurveyComponent extends OnDestroyMixin implements OnInit, OnDestroy {

  private getPdfContentSubscription!: Subscription;
  private api: ApiService = inject(ApiService);
  private sanitizer: DomSanitizer = inject(DomSanitizer);
	private dialog: MatDialog = inject(MatDialog);

  constructor(
    private FormBuilder: FormBuilder,
    private Administrative: AdministrativeService,
    private Common: CommonService
  ) {
		super();
  }

  @ViewChild('surveyModal', {static: false}) surveyModal: ModalDirective;
  @ViewChild('questionModal', {static: false}) questionModal: ModalDirective;
  @ViewChild('institutionAssignSurveyModal', {static: false}) institutionAssignSurveyModal: ModalDirective;

  surveys: any[] = [];
  surveyTypes: any[] = [];
  questions: any[] = [];
  questionTypes: any[] = [];
  alternatives: any[] = [];
  filters: any = {};
  newSurvey: any;
  newQuestion: any;
  newAlternative: any;
  surveySelected: any;
  records: any[] = [];
  surveyConfigsiIndividuals: any[] = [];
  surveyConfigsInBatch: any[] = [];
  surveyConfigsInProcess: any[] = [];
  procesing: boolean = false;

  searchSurveyForm: FormGroup = this.FormBuilder.group({
    text: []
  });

  filter: any = {};

  surveyForm: FormGroup = this.FormBuilder.group({
    title: [],
    description: [],
    surveyTypeID: [],
    reference: [],
    orderSurvey: [],
    statusID: [1],
    userCreated: ['MIGRA']
  });

  questionForm: FormGroup = this.FormBuilder.group({
    surveyID: [],
    question: [null, Validators.required],
    questionType: [null, Validators.required],
    statusID: [1],
    userCreated: ['MIGRA']
  });

  alternativeForm: FormGroup = this.FormBuilder.group({
    questionID: [],
    alternativeID: [],
    alternativeIDTemp: [],
    notation: [null, Validators.required],
    value: [],
    valueType: [],
    statusID: [1],
    userCreated: ['MIGRA']
  });

  currentAdmissionPeriod: any;
  modalities: any[] = [];
  schools: any[] = [];
  careers: any[] = [];
  newAssignment: any = {};
  newInstitution: any;
  collegeTypes: any[] = [];

  collegesFiltereds: any[] = [];
  filteredOptions: string[];
  institutions: any[] = [];
  surveySelectedToInstituion: any = {};
  currentDate: any;
  otherProcesses: any[] = [];

  ngOnInit() {
    this.currentDate = moment().format('YYYY-MM-DD');
    this.getInitialData();
    this.getSurveys();
    this.getSurveyTypes();
    this.getQuestionTypes();
    this.getSurveyConfigs();
    this.getCollegeTypes();
    this.getInstitutionByCountry();

  }

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

  async getInstitutionByCountry() {
    this.collegesFiltereds = [];
    let result: any = await this.Administrative.getInstitutionByCountry(59).toPromise();
    this.collegesFiltereds = result;
    this.collegesFiltereds.map((c: any) => {
      c.collegeName = c.institutionName;
    });
    this.filteredOptions = this.collegesFiltereds.map((c: any) => c.collegeName);
  }

  async getCollegeTypes() {
    let result: any = await this.Administrative.getCollegeType(1,10).toPromise();
    this.collegeTypes = result.data.filter((r: any) => r.collegeTypeID !== 7);
  }

  async getInitialData() {
    let result: any = await this.Administrative.getCurrentAdmissionPeriod().toPromise();
    //console.log(result);
    this.currentAdmissionPeriod = result;

    let resultModality1: any = await this.Administrative.getModalityAll().toPromise();
    //console.log(resultModality1);
    let resultModality: any = await this.Administrative.getModalities().toPromise();
    this.modalities = resultModality.data;

    let resultSchool: any = await this.Administrative.getCareerAll().toPromise();
    //console.log(resultSchool);
    this.schools = resultSchool;
  }

  async getSurveyConfigs() {
    let result: any = await this.Administrative.getSurveyConfig().toPromise();
    this.surveyConfigsiIndividuals = result.filter((r: any) => r.personID && r.statusID !== 0);
    this.surveyConfigsInBatch = result.filter((r: any) => (!r.personID && !r.otherProcessID) && r.statusID !== 0);
    this.surveyConfigsInProcess = result.filter((r: any) => r.otherProcessID && r.statusID !== 0);
    //console.log(this.surveyConfigsInProcess);
    this.getOtherProcesses();
  }

  async getOtherProcesses() {
    let result: any = await this.Administrative.getOtherProcess().toPromise();
    this.otherProcesses = result;
    //console.log(this.otherProcesses);
    if (this.surveySelected) {
      this.getSurveyAdditionalFields();
    }
  }

  async getSurveyTypes() {
    let result: any = await this.Administrative.getSurveyType().toPromise();
    this.surveyTypes = result;
  }

  async getQuestionTypes() {
    let result: any = await this.Administrative.getQuestionTypes().toPromise();
    this.questionTypes = result;
  }

  async getSurveys() {
    let result: any = await this.Administrative.getSurveys().toPromise();
    this.surveys = result.filter((s: any) => s.statusID !== 0);
    this.surveys.sort((a: any, b: any) => a.orderSurvey - b.orderSurvey);
  }

  toggleSurvey(item?: any) {
    if (this.surveyModal.isShown) {
      this.surveyModal.hide();
    } else {
      this.surveyModal.config.keyboard = false;
      this.surveyModal.config.ignoreBackdropClick = true;
      this.surveyModal.show();
      this.newSurvey = {};
      if (item) {
        this.newSurvey = JSON.parse(JSON.stringify(item));
        this.newSurvey.editing = true;
        this.surveyForm.controls['title'].patchValue(this.newSurvey.title);
        this.surveyForm.controls['description'].patchValue(this.newSurvey.description);
        this.surveyForm.controls['surveyTypeID'].patchValue(this.newSurvey.surveyTypeID);
        this.surveyForm.updateValueAndValidity();
      }
    }
  }

  async saveSurvey() {
    this.procesing = true;
    //console.log(this.surveyForm.value);
    let data: any = this.surveyForm.value;
    //console.log(data);
    let body: any = {};
    let resultSurvey: any;
    if (!this.newSurvey.surveyID) {
      body.news = [data];
      resultSurvey = await this.Administrative.saveSurveys(body).toPromise();
    } else {
      data.surveyID = this.newSurvey.surveyID;
      data.userUpdated = data.userCreated;
      body.updates = [data];
      resultSurvey = await this.Administrative.updateSurveys(body).toPromise();
    }
    this.procesing = false;
    if (!resultSurvey) {
      Swal.fire({
        text: `Hubo un error al ${this.newSurvey.editing ? 'actualizar' : 'crear'} la encuesta`,
        icon: 'error'
      });
      return;
    }
    Swal.fire({
      text: `Se ${this.newSurvey.editing ? 'actualizo' : 'creo'} la encuesta`,
      icon: 'success'
    });
    this.getSurveys();
    this.toggleSurvey();
  }

  toggleSurveyDetail(item?: any) {
    if (this.surveySelected) {
      this.surveySelected = undefined;
    } else {
      this.surveySelected = JSON.parse(JSON.stringify(item));
      this.getSurveyAdditionalFields();
      this.getQuestions();
    }
  }

  getSurveyAdditionalFields() {
    this.surveySelected.configs = this.surveyConfigsInProcess.filter((s: any) => s.surveyID = this.surveySelected.surveyID && s.surveyTypeID === this.surveySelected.surveyTypeID);
    this.surveySelected.otherProcesses = this.otherProcesses.filter((r: any) => !this.surveySelected.configs.map((s: any) => s.otherProcessID).includes(r.otherProcessID))
  }

  async getQuestions() {
    let result: any = await this.Administrative.getQuestions().toPromise();
    this.questions = result.filter((q: any) => q.surveyTypeID === this.surveySelected.surveyTypeID && q.statusID === 1);
    // for (let x = 0; x < this.questions.length; x++) {
    //   const question = this.questions[x];
    //   this.getAlternativesOfQuestion(question);
    // }
  }

  deleteSurvey(survey: any) {
    Swal.fire({
      text: `¿Estas seguro de eliminar la Encuesta?`,
      icon: 'question',
      showCancelButton: true,
      showConfirmButton: true,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        survey.statusID = 0;
        let body: any = {
          updates: [survey]
        };
        let result: any = await this.Administrative.updateSurveys(body).toPromise();
        if (result) {
          Swal.fire({
            text: `Se elimino la encuesta`,
            icon: 'success'
          });
          this.getSurveys();
        } else {
          Swal.fire({
            text: `Se elimino la encuesta`,
            icon: 'success'
          });
          return;
        }
      }
    });
  }

  toggleQuestion(item?: any) {
    if (this.questionModal.isShown) {
      this.questionModal.hide();
    } else {
      this.questionModal.config.keyboard = false;
      this.questionModal.config.ignoreBackdropClick = true;
      this.questionModal.show();
      this.newQuestion = {};
      this.questionForm.controls['surveyID'].patchValue(this.surveySelected.surveyID);
      if (item) {
        this.newQuestion = JSON.parse(JSON.stringify(item));
        this.getAlternativesOfQuestion();
        this.newQuestion.editing = true;
        this.questionForm.controls['question'].patchValue(this.newQuestion.question);
        this.questionForm.controls['questionType'].patchValue(this.newQuestion.questionType);
      }
      this.questionForm.updateValueAndValidity();
    }
  }

  async getAlternativesOfQuestion(item?: any) {
    //console.log('traer alternativas');
    let result: any = await this.Administrative.getAlternatives().toPromise();
    if (item) {
      item.alternatives = result.filter((a: any) => a.questionID === item.questionID && a.statusID === 1);
    } else {
      this.alternatives = result.filter((a: any) => a.questionID === this.newQuestion.questionID && a.statusID === 1);
    }
  }

  async saveQuestion() {
    this.procesing = true;
    //console.log(this.questionForm.value);
    let data: any = this.questionForm.value;
    //console.log(data);
    let body: any = {};
    let resultSurvey: any;
    if (!this.newQuestion.questionID) {
      body.news = [data];
      resultSurvey = await this.Administrative.saveQuestions(body).toPromise();
      this.alternatives.map((a: any) => {
        a.questionID = resultSurvey[0].questionID;
      });

    } else {
      data.questionID = this.newQuestion.questionID;
      data.userUpdated = data.userCreated;
      body.updates = [data];
      resultSurvey = await this.Administrative.updateQuestions(body).toPromise();
    }
    //console.log(resultSurvey);
    //console.log(this.alternatives);
    let newAlternatives: any[] = this.alternatives.filter((a: any) => a.alternativeIDTemp);
    // Nuevas alternativas
    if (newAlternatives.length) {
      let bodyNewAlternatives: any = {
        news: newAlternatives
      };
      let resultAlternatives: any = await this.Administrative.saveAlternatives(bodyNewAlternatives).toPromise();
    }

    let updateAlternatives: any[] = this.alternatives.filter((a: any) => a.alternativeID);
    // Actualizar alternativas
    if (updateAlternatives.length) {
      let bodyUpdateAlternatives: any = {
        updates: updateAlternatives
      };
      let resultAlternatives: any = await this.Administrative.updateAlternatives(bodyUpdateAlternatives).toPromise();
    }

    this.procesing = false;
    if (!resultSurvey) {
      Swal.fire({
        text: `Hubo un error al ${this.newQuestion.editing ? 'actualizar' : 'crear'} la encuesta`,
        icon: 'error'
      });
      return;
    }
    Swal.fire({
      text: `Se ${this.newQuestion.editing ? 'actualizo' : 'creo'} la encuesta`,
      icon: 'success'
    });
    this.toggleQuestion();
    this.getQuestions();
  }

  deleteQuestion(question: any) {
    Swal.fire({
      text: `¿Estas seguro de eliminar la Encuesta?`,
      icon: 'question',
      showCancelButton: true,
      showConfirmButton: true,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        question.statusID = 0;
        let body: any = {
          updates: [question]
        };
        let result: any = await this.Administrative.updateQuestions(body).toPromise();
        if (result) {
          Swal.fire({
            text: `Se elimino la pregunta`,
            icon: 'success'
          });
          this.getQuestions();
        } else {
          Swal.fire({
            text: `Se elimino la pregunta`,
            icon: 'success'
          });
          return;
        }
      }
    });
  }

  addAlternative(alternative?: any) {
    this.newAlternative = {};
    if (alternative) {
      this.newAlternative = JSON.parse(JSON.stringify(alternative));
      this.alternativeForm.controls['alternativeID'].patchValue(this.newAlternative.alternativeID);
      this.alternativeForm.controls['questionID'].patchValue(this.newAlternative.questionID);
      this.alternativeForm.controls['alternativeIDTemp'].patchValue(this.newAlternative.alternativeIDTemp);
      this.alternativeForm.controls['notation'].patchValue(this.newAlternative.notation);
      this.alternativeForm.controls['value'].patchValue(this.newAlternative.value);
      this.alternativeForm.controls['valueType'].patchValue(this.newAlternative.valueType);
      this.alternativeForm.updateValueAndValidity();
    } else {
      this.alternativeForm = this.FormBuilder.group({
        alternativeIDTemp: [],
        questionID: [this.newQuestion.questionID],
        notation: [null, Validators.required],
        value: [],
        valueType: [],
        statusID: [1],
        userCreated: ['MIGRA']
      });
    }
  }

  cancelAlternative() {
    this.newAlternative = undefined;
  }

  saveAlternative() {
    let data: any = this.alternativeForm.value;
    if (data.alternativeID) {
      let alternativeSelected = this.alternatives.find((a: any) => a.alternativeIDTemp === data.alternativeIDTemp);
      if (alternativeSelected) {
        alternativeSelected.notation = data.notation;
        alternativeSelected.value = data.value;
        alternativeSelected.valueType = data.valueType;
      }
    } else {
      data.alternativeIDTemp = `a${this.alternatives.length + 1}`;
      this.alternatives.push(data);
    }
    this.newAlternative = undefined;
  }

  deleteAlternative(alternatve: any) {
    if (alternatve.alternativeIDTemp) {
      this.alternatives.splice(this.alternatives.indexOf(alternatve), 1);
    } else {
      //console.log('MODIFICAR BD');
    }
  }

  toggleSelectedSurvey(survey: any) {
    survey.selected = !survey.selected;
    this.countSelecteds();
  }

  countSelecteds() {
    this.filters.selecteds = this.surveys.filter((s: any) => s.selected).length;
    this.filters.allSelecteds = this.filters.selecteds === this.surveys.length;
  }

  async searchPerson() {
    this.filter.searched = false;
    let result: any = await this.Common.getPersonByDocumentNumber(this.filter.text).toPromise();
    //console.log(result);
    this.filter.searched = true;
    this.records = [result];
  }

  createAssignSurvey(person: any) {
    Swal.fire({
      text: '¿Estas seguro de asignar la encuesta a esta persona?',
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then(async (choice: any) => {
      if (choice.isConfirmed) {
        let body: any = {
          news: [
            {
              personID: person.personID,
              attempsNumbers: 1,
              surveyID: this.surveySelected.surveyID,
              periodID: this.currentAdmissionPeriod.admissionPeriodID,
              statusID: 1
            }
          ]
        };
        let result: any = await this.Administrative.saveSurveyConfig(body).toPromise();
        if (!result) {
          Swal.fire({
            text: 'Hubo un problema',
            icon: 'error'
          });
          return;
        }
        Swal.fire({
          text: 'Se asigno correctamente la Encuesta',
          icon: 'success'
        });
        this.getSurveyConfigs();
      }
    })
  }

  deleteConfig(config: any) {
    Swal.fire({
      text: `¿Estas seguro de eliminar la Configuracion?`,
      icon: 'question',
      showCancelButton: true,
      showConfirmButton: true,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        config.statusID = 0;
        let body: any = {
          updates: [config]
        };
        let result: any = await this.Administrative.updateSurveyConfig(body).toPromise();
        if (result) {
          Swal.fire({
            text: `Se elimino la encuesta`,
            icon: 'success'
          });
          this.getSurveys();
        } else {
          Swal.fire({
            text: `Se elimino la encuesta`,
            icon: 'success'
          });
          return;
        }
        this.newAssignment = {};
        this.getSurveyConfigs();
      }
    });
  }

  selectSchool() {
    this.newAssignment.careerID = undefined;
    if (this.newAssignment.schoolID) {
      let schoolFound: any = this.schools.find((s: any) => s.schoolID === this.newAssignment.schoolID);
      this.careers = schoolFound.careers;
    }
  }

  createAssignSurveyInBatch() {
    Swal.fire({
      text: '¿Estas seguro de asignar la encuesta para esta población?',
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then(async (choice: any) => {
      if (choice.isConfirmed) {
        this.newAssignment.attempsNumbers = 1;
        this.newAssignment.statusID = 1;
        this.newAssignment.periodID = this.currentAdmissionPeriod.admissionPeriodID;
        this.newAssignment.surveyID = this.surveySelected.surveyID;
        let body: any = {
          news: [this.newAssignment]
        };
        let result: any = await this.Administrative.saveSurveyConfig(body).toPromise();
        if (!result) {
          Swal.fire({
            text: 'Hubo un problema',
            icon: 'error'
          });
          return;
        }
        Swal.fire({
          text: 'Se asigno correctamente la Encuesta',
          icon: 'success'
        });
        this.newAssignment = {};
        this.getSurveyConfigs();
      }
    })
  }

  toggleIsCollege() {
    this.newInstitution.collegeName = undefined;
    this.newInstitution.isCollege = !this.newInstitution.isCollege;
    this.newInstitution.collegeTypeID = undefined;
    if (!this.newInstitution.isCollege) {
      this.getInstitutionByCountry();
    }
  }

  toggleInstitutions(survey?: any) {
    if (this.institutionAssignSurveyModal.isShown) {
      this.institutionAssignSurveyModal.hide();
      this.newInstitution = undefined;
    } else {
      this.institutionAssignSurveyModal.config.ignoreBackdropClick = true;
      this.institutionAssignSurveyModal.config.keyboard = false;
      this.institutionAssignSurveyModal.show();
      this.surveySelectedToInstituion = survey;
      this.getInstitutions();
    }
  }

  async getInstitutions() {
    this.institutions = [];
    let result: any = await this.Administrative.getInstitutionAssignmentSurvey().toPromise();
    this.institutions = result.filter((i: any) => i.surveyID === this.surveySelectedToInstituion.surveyID && i.statusID === 1);
  }

  addInstitution() {
    this.newInstitution.isCollege = !this.newInstitution.isCollege ? 0 : this.newInstitution.isCollege;
    let collegeSelected = this.collegesFiltereds.find((c: any) => c.collegeName.toLowerCase() === this.newInstitution.collegeName.toLowerCase());
    if (collegeSelected) {
      this.newInstitution.collegeID = collegeSelected.collegeID;
      this.newInstitution.institutionID = collegeSelected.institutionID;

      if (this.newInstitution.isCollege) {
        this.newInstitution.institutionID = collegeSelected.collegeID;
      }
    }
    //console.log(this.institutions.map((i: any) => `${i.isCollege}-${i.institutionID}`));
    //console.log(`${this.newInstitution.isCollege}-${this.newInstitution.institutionID}`);
    if (this.institutions.map((i: any) => `${i.isCollege}-${i.institutionID}`).includes(`${this.newInstitution.isCollege}-${this.newInstitution.institutionID}`) && !this.newInstitution.editing) {
      Swal.fire({
        text: 'Ya esta asignada la Institución',
        icon: 'error'
      });
      return;
    }
    Swal.fire({
      text: '¿Estas seguro de guardar los cambios de la Asignación?',
      icon: 'success',
      showConfirmButton: true,
      showCancelButton: true,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then(async (choice) => {
      if (choice.isConfirmed) {


        let body: any = {};
        let result: any;
        if (!this.newInstitution.editing) {
          body.news = [this.newInstitution]
          result = await this.Administrative.saveInstitutionAssignmentSurvey(body).toPromise();
        } else {
          body.updates = [this.newInstitution]
          result = await this.Administrative.updateInstitutionAssignmentSurvey(body).toPromise();
        }

        if (!result) {
          Swal.fire({
            text: 'Hubo un error al asignar la Institución',
            icon: 'error'
          });
          return;
        }
        Swal.fire({
          text: `Se ${this.newInstitution.editing ? 'actualizó' : 'creó'} correctamente`,
          icon: 'success'
        });
        //console.log(this.newInstitution);
        this.toggleAssignmentSurvey();
        this.getInstitutions();
        this.getSurveys();
      }
    });
  }

  async filterCollegeType() {
    this.newInstitution.collegeName = undefined;
    if (this.newInstitution.collegeTypeID) {
      let result = await this.Administrative.getCollegeTypeByCountryIDAndCollegeType(59, this.newInstitution.collegeTypeID).toPromise();
      //console.log(result);
      this.collegesFiltereds = result;
      //console.log(this.collegesFiltereds);
      if (this.newInstitution.editing) {
        if (this.newInstitution.isCollege) {
          let collegeSelected: any = await this.collegesFiltereds.find((c: any) => c.collegeID === this.newInstitution.institutionID);
          if (collegeSelected) {
            this.newInstitution.collegeName = collegeSelected.collegeName;
          }
        }
      }
      this.filteredOptions = this.collegesFiltereds.map((c: any) => c.collegeName);
    } else {
      let institutionSelected: any = await this.institutions.find((i: any) => i.institutionID === this.newInstitution.institutionID);
      this.newInstitution.collegeName = institutionSelected.institutionName;
    }
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.collegesFiltereds.map((o: any) => o.collegeName).filter(option => option.toLowerCase().includes(filterValue));
  }

  filterCollege() {
    this.newInstitution.error = true;
    if (this.newInstitution.collegeName) this.filteredOptions = this._filter(this.newInstitution.collegeName);
  }

  selectInstitution(item: any) {
    this.newInstitution.error = false;
  }


  toggleAssignmentSurvey(item?: any) {
    if (this.newInstitution) {
      this.newInstitution = undefined;
			this.getInstitutionByCountry();
    } else {

      this.newInstitution = {
        surveyID: this.surveySelectedToInstituion.surveyID,
        statusID: 1,
        error: true
      };
      if (item) {
        this.newInstitution = JSON.parse(JSON.stringify(item));
        this.newInstitution.editing = true;
        this.filterCollegeType();
      }
    }
  }

  deleteAssignmentSurvey(item: any) {
    Swal.fire({
      text: '¿Estas seguro de eliminar la asignación?',
      icon: 'question',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      showCancelButton: true,
      showConfirmButton: true
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        item.statusID = 0;
        let body: any = {
          updates: [item]
        };
        let result: any = await this.Administrative.updateInstitutionAssignmentSurvey(body).toPromise();
        if (!result) {
          Swal.fire({
            text: 'Hubo un error al eliminar la Asignación',
            icon: 'error'
          });
          return;
        }

        Swal.fire({
          text: 'Eliminación exitosa.',
          icon: 'success'
        });
        if (!item.otherProcessID) {
          this.getInstitutions();
        } else {
          this.getSurveyConfigs();
        }
        this.getSurveys();
      }
    })
  }

  cleanEndDate() {
    this.newInstitution.endDate = undefined;
  }

  createAssignByProcess() {
    console.log(this.newAssignment);
    Swal.fire({
      text: '¿Estas seguro de asignar la encuesta a los Estudiantes y/o Postulantes en el proceso seleccionado?',
      icon: 'question',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      showConfirmButton: true,
      showCancelButton: true
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        //console.log('inserto la asignación');
        this.newAssignment.surveyID = this.surveySelected.surveyID;
        this.newAssignment.attempsNumbers = 1;
        this.newAssignment.statusID = 1;
        this.newAssignment.userCreated = 1;
        let body: any = {
          news: [this.newAssignment]
        };

        let result: any = await this.Administrative.saveSurveyConfig(body).toPromise();
        if (!result) {
          Swal.fire({
            text: 'Hubo un error al momento de asignar la encuesta al Proceso',
            icon: 'error'
          });
          return;
        }

        Swal.fire({
          text: 'Se asignó la encuesta al Proceso Seleccionado',
          icon: 'success'
        });
        this.getSurveyConfigs();
      }
    })
  }

	public openDialog(): void {
		//this.institutionAssignSurveyModal.hide();
		const type= this.newInstitution.isCollege;
		const config: MatDialogConfig = new MatDialogConfig();
		config.id = 'CreateInstitutionComponent';
		config.autoFocus = false;
		config.minWidth = '45vw';
		config.maxWidth = '45vw';
		config.panelClass = 'transparent-panel';
		config.data = { type };
		config.disableClose = true;
		const dialog = this.dialog.open(CreateInstitutionComponent, config);
		dialog.afterClosed()
		.pipe(untilComponentDestroyed(this))
		.subscribe((res) => {
			this.getInstitutionByCountry();
			this.newInstitution.collegeTypeID= undefined;
		});
	}

  public buildReport(relativeRoute: string, surveyID: number): void {
    const route: string = `${environment.url}/api/${relativeRoute}/${surveyID}`;
    if (this.getPdfContentSubscription) this.getPdfContentSubscription.unsubscribe();
    this.getPdfContentSubscription = this.api.getPdfContent(route).subscribe((res: HttpResponse<Blob>) => {
      if (res.body) {
        let contentType: string | null | undefined = res.headers.get('content-type');
        // Porque el tipo de variable que recibe el type es string o undefined. No recibe null.
        if (!contentType) {
          contentType = undefined;
        }
        const blob: Blob = new Blob([res.body], { type: contentType });
        const url = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob)));
        if (url) {
          window.open(url, '_blank');
        }
      }
    });
  }
}
