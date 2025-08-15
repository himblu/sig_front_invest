import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministrativeService } from '@services/administrative.service';
import { MaterialComponentModule } from 'app/material-component/material-component.module';
import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { SortableModule } from 'ngx-bootstrap/sortable';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-survey-type-detail',
  templateUrl: './survey-type-detail.component.html',
  styleUrls: ['./survey-type-detail.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialComponentModule,
    TabsModule,
    ModalModule,
    SortableModule
  ]
})
export class SurveyTypeDetailComponent implements OnInit {
  constructor(
    private ActivatedRoute: ActivatedRoute,
    private Router: Router,
    private Administrative: AdministrativeService
  ) {

  }

  @ViewChild('configGroupQuestionModal', {static: false}) configGroupQuestionModal: ModalDirective;
  @ViewChild('questionModal', {static: false}) questionModal: ModalDirective;
  

  surveyTypeSelected: any;
  isNew: boolean = true;
  groupRepresentations: any[] = [];
  groupRepresentationOriginals: any[] = [];
  configGroupQuestions: any[] = [];
  questionTypes: any[] = [];
  others: any[] = [1,2,3,4,5];
  questions: any[] = [];
  questionOriginals: any[] = [];
  allAlternatives: any[] = [];
  alternatives: any[] = [];
  // [{"questionID":1,"alternativeQuantity":2,"surveyID":1,"surveyTypeID":0,"question":"PREGUNTA 1","questionType":2,"questionOrder":0,"questionTypeName":"Opcion Simple","statusID":1,"userCreated":null,"dateCreated":"2024-04-19T04:26:08.000Z","userUpdated":null,"dateUpdated":null},{"questionID":2,"alternativeQuantity":2,"surveyID":2,"surveyTypeID":0,"question":"PREGUNTA 1","questionType":2,"questionOrder":0,"questionTypeName":"Opcion Simple","statusID":1,"userCreated":null,"dateCreated":"2024-04-19T05:38:15.000Z","userUpdated":null,"dateUpdated":null},{"questionID":3,"alternativeQuantity":3,"surveyID":2,"surveyTypeID":0,"question":"PREGUNTA 2","questionType":3,"questionOrder":0,"questionTypeName":"Opcion Multiple","statusID":1,"userCreated":null,"dateCreated":"2024-04-19T05:39:12.000Z","userUpdated":null,"dateUpdated":null},{"questionID":4,"alternativeQuantity":3,"surveyID":1,"surveyTypeID":0,"question":"prueba","questionType":3,"questionOrder":0,"questionTypeName":"Opcion Multiple","statusID":1,"userCreated":null,"dateCreated":"2024-05-08T22:54:21.000Z","userUpdated":null,"dateUpdated":null}];
  newQuestion: any = {};
  newConfigGroupQuestion: any = {};

  ngOnInit() {
    let params: any = this.ActivatedRoute.snapshot.params;
    let surveyTypeID = parseInt(params.surveyTypeID);
    console.log(surveyTypeID);
    console.log(typeof surveyTypeID);
    console.log(this.questions);
    
    this.getSurveyTypes(surveyTypeID);
  }

  back() {
    // Swal.fire({
    //   text: '¿Estas seguro que deseas salir?, No se guardaran los cambios',
    //   icon: 'question',
    //   showConfirmButton: true,
    //   showCancelButton: true,
    //   allowEnterKey: false,
    //   allowEscapeKey: false,
    //   allowOutsideClick: false
    // }).then(async (choice) => {
    //   if (choice.isConfirmed) {
    //   }
    // })
    this.Router.navigate(['/administracion/tipo-de-formulario']);
  }

  

  async getSurveyTypes(surveyTypeID: any) {
    let result: any = await this.Administrative.getSurveyType().toPromise();
    if (surveyTypeID !== 0) {
      this.surveyTypeSelected = result.find((x: any) => x.surveyTypeID === surveyTypeID);
      console.log(this.surveyTypeSelected);
      if (!this.surveyTypeSelected) {
        Swal.fire({
          text: 'No puedes estar aqui',
          icon: 'error',
          showConfirmButton: true,
          showCancelButton: false,
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false
        }).then(async (choice) => {
          if (choice.isConfirmed) {
            this.Router.navigate(['/administracion/tipo-de-encuesta']);
            return;
          }
        });
      }
      this.isNew = false;
    } else {
      this.surveyTypeSelected = {}
      this.isNew = true;
    }
    this.getQuestionsBySurveyType();
  }

  async getQuestionsBySurveyType() {
    let result: any = await this.Administrative.getQuestions().toPromise();
    console.log(result);
    this.questions = result.filter((q: any) => q.surveyTypeID === this.surveyTypeSelected.surveyTypeID && q.statusID == 1);
    console.log(this.questions);
    this.questionOriginals = JSON.parse(JSON.stringify(this.questions));
    this.getQuestionTypes();
  }

  async getQuestionTypes() {
    let result: any = await this.Administrative.getQuestionTypes().toPromise();
    this.questionTypes = result;
    console.log(this.questionTypes);
    this.getConfigGroupQuestions();
    this.getAlternatives();
  }

  async getConfigGroupQuestions() {
    let result: any = await this.Administrative.getConfigGroupQuestion().toPromise();
    this.configGroupQuestions = result;
    this.getGroupRepresentations();
  }

  async getAlternatives() {
    let result: any = await this.Administrative.getAlternatives().toPromise();
    this.allAlternatives = result;
  }

  

  async getGroupRepresentations() {
    let result: any = await this.Administrative.getGroupRepresentation().toPromise();
    this.groupRepresentations = result.filter((r: any) => r.surveyTypeID === this.surveyTypeSelected.surveyTypeID);
    this.groupRepresentations.map((g: any) => {
      g.questions = this.configGroupQuestions.filter((x: any) => x.analysisCategoryID === g.analysisCategoryID && x.vocationalInterestsID === g.vocationalInterestsID);
      g.questions.map((x: any) => {
        x.inChild = true;
      });
    });
    let questionInGroups = this.groupRepresentations.map((x: any) => x.questions.flat()).flat().map((x: any) => x.questionID);
    // let questionMultiples = this.questions.filter((x: any) => x.multipleAssign);
    // console.log(questionMultiples);
    this.questions = this.questions.filter((x: any) => !questionInGroups.includes(x.questionID) || x.multipleAssign);
    // this.questions = this.questions.concat(questionMultiples);


    this.groupRepresentationOriginals = JSON.parse(JSON.stringify(this.groupRepresentations));
    console.log(this.groupRepresentations);
  }

  saveChanges() {
    
  }

  saveQuestion() {
    let questionExists = this.questions.filter((q: any) => q.questionOrder === this.newQuestion.questionOrder && !q.questionID);
    if (questionExists.length) {
      Swal.fire({
        text: 'Existe ya una pregunta con ese numero de Orden',
        icon: 'error'
      });
      return;
    }
    Swal.fire({
      text: '¿Estas seguro que quieres crear la Pregunta?',
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        let body: any = {};
        let result: any;
        if (!this.newQuestion.editing) {
          this.newQuestion.statusID = 1;
          body.news = [this.newQuestion];
          result = await this.Administrative.saveQuestions(body).toPromise();
        } else {
          body.updates = [this.newQuestion];
          result = await this.Administrative.updateQuestions(body).toPromise();
        }
        if (!result) {
          Swal.fire({
            text: 'Hubo un error al crear la pregunta',
            icon: 'error'
          });
          return;
        }
        Swal.fire({
          text: `Se ${this.newQuestion.editing ? 'actualizo' : 'creo'} correctamente la pregunta`,
          icon: 'success'
        });
        this.getQuestionsBySurveyType();
        this.toggleQuestion();
        console.log(this.questions);
      }
    })
  }


  toggleConfigGroupQuestion(question?: any, group?: any) {
    if (this.configGroupQuestionModal.isShown) {
      this.getQuestionsBySurveyType();
      this.configGroupQuestionModal.hide();
    } else {
      this.configGroupQuestionModal.config.keyboard = false;
      this.configGroupQuestionModal.config.ignoreBackdropClick = true;
      this.newConfigGroupQuestion = {
        surveyTypeID: question.surveyTypeID,
        analysisCategoryID: group.analysisCategoryID,
        vocationalInterestsID: group.vocationalInterestsID,
        questionID: question.questionID,
      };
      console.log(question);
      this.alternatives = this.allAlternatives.filter((a: any) => a.questionTypeID === question.questionType);
      this.configGroupQuestionModal.show();
      console.log(this.newConfigGroupQuestion);
    }
  }

  toggleSelectAlternative(alternative: any) {
    this.alternatives.map((a: any) => {
      a.selected = false;
    });
    alternative.selected = !alternative.selected;
    if (alternative.selected) {
      this.newConfigGroupQuestion.alternativeToConsider = alternative.alternativeID;
    }
  }

  saveConfigGroupQuestion() {
    Swal.fire({
      text: '¿Estas seguro de guardar los cambios?',
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        this.newConfigGroupQuestion.statusID = 1;
        let body: any = {
          news: [this.newConfigGroupQuestion]
        };
        console.log(body);
        let result: any = await this.Administrative.saveConfigGroupQuestion(body).toPromise();
        console.log(result);
        if (!result) {
          Swal.fire({
            text: 'Hubo un error al crear la pregunta',
            icon: 'error'
          });
          return;
        }
        Swal.fire({
          text: 'Se creo correctamente la pregunta',
          icon: 'success'
        });
        this.getQuestionsBySurveyType();
        this.toggleConfigGroupQuestion();
        console.log(this.questions);
      }
    })
  }

  deleteOfChild(question: any, index: number) {
    Swal.fire({
      text: '¿Estas seguro de eliminar la pregunta del Grupo?',
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        let body = {
          deletes: [question]
        }
        let result: any = await this.Administrative.deleteConfigGroupQuestion(body).toPromise();
        if (!result) {
          Swal.fire({
            text: 'Hubo un error',
            icon: 'error'
          });
          return;
        }
        question.inChild = false;
        console.log(question);
        let groupFound = this.groupRepresentations.find((g: any) => g.analysisCategoryID === question.analysisCategoryID && g.vocationalInterestsID === question.vocationalInterestsID);
        console.log(groupFound);
        if (groupFound) {
          groupFound.questions.splice(index, 1);
          // this.getGroupRepresentations();
          this.getQuestionsBySurveyType();
        }

      }
    })
  }

  dropInChild(e: any, group: any) {
    
    let groupFound: any = this.groupRepresentationOriginals.find((g: any) => g.groupRepresentationID === group.groupRepresentationID);
    if (!groupFound) {
      return;
    }
    let questionIDS = groupFound.questions.map((q: any) => q.questionID);
    group.questions.map((q: any) => {
      q.groupID = group.groupRepresentationID;
      q.inChild = true;
    });
    let questionRest = group.questions.filter((x: any) => !questionIDS.includes(x.questionID));
    if (!questionRest.length) {
      return;
    }
    console.log(questionRest);
    let questionSelected = group.questions.find((q: any) => questionRest[0].questionID);
    console.log(group);
    this.toggleConfigGroupQuestion(questionSelected, group);
  }

  toggleQuestion(question?: any) {
    if (this.questionModal.isShown) {
      this.questionModal.hide();
    } else {
      this.questionModal.config.keyboard = false;
      this.questionModal.config.ignoreBackdropClick = true;
      this.newQuestion = {};
      if (question) {
        this.newQuestion = JSON.parse(JSON.stringify(question));
        this.newQuestion.editing = true;
      } else {
        this.newQuestion.questionOrder = this.questionOriginals.length + 1;
        this.newQuestion.questionOrderMin = this.questionOriginals.length + 1;
        this.newQuestion.surveyID = 0;
      }
      this.newQuestion.surveyTypeID = this.surveyTypeSelected.surveyTypeID;
      this.questionModal.show();
    }
  }

  deleteQuestion(question: any) {
    Swal.fire({
      text: '¿Estas seguro de eliminar la pregunta?',
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        question.statusID = 0;
        let body = {
          updates: [question]
        }
        let result: any = await this.Administrative.updateQuestions(body).toPromise();
        if (!result) {
          Swal.fire({
            text: 'Hubo un error',
            icon: 'error'
          });
          return;
        }
        this.getQuestionsBySurveyType();
        Swal.fire({
          text: 'Se elimino correctamente',
          icon: 'success'
        });
      }
    })
  }

  toggleMultipleAssign() {
    this.newQuestion.multipleAssign = !this.newQuestion.multipleAssign;
  }
}
