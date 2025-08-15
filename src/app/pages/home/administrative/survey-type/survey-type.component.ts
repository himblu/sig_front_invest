import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdministrativeService } from '@services/administrative.service';
import { MaterialComponentModule } from 'app/material-component/material-component.module';
import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-survey-type',
  templateUrl: './survey-type.component.html',
  styleUrls: ['./survey-type.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MaterialComponentModule,
    FormsModule,
    ModalModule,
    TabsModule
  ]
})
export class SurveyTypeComponent implements OnInit {
  constructor(
    private Administrative: AdministrativeService,
    private Router: Router,
    private FormBuilder: FormBuilder
  ) {

  }

  @ViewChild('surveyTypeModal', {static: false}) surveyTypeModal: ModalDirective;
  @ViewChild('representationModal', {static: false}) representationModal: ModalDirective;
  @ViewChild('groupModal', {static: false}) groupModal: ModalDirective;
  @ViewChild('questionTypeModal', {static: false}) questionTypeModal: ModalDirective;

  surveyTypes: any[] = [];
  questionTypes: any[] = [];
  categories: any[] = [];
  interests: any[] = [];
  groupRepresentations: any[] = [];
  newSurveyType: any;
  newCategory: any;
  newInterest: any;
  newRepresentation: any;
  newQuestionType: any;
  newAlternative: any;
  processing: boolean = false;
  surveyTypeSelected: any;
  surveyTypeForm: FormGroup = this.FormBuilder.group({
    surveyTypeID: [],
    name: [],
    description: [],
    statusID: [1],
    userCreated: [1]
  });

  categoryForm: FormGroup = this.FormBuilder.group({
    analysisCategoryID: [],
    name: [],
    abbr: [],
    description: [],
    additionalField: [],
    statusID: [1],
    userCreated: [1]
  });
  

  interestForm: FormGroup = this.FormBuilder.group({
    vocationalInterestsID: [],
    name: [],
    abbr: [],
    description: [],
    statusID: [1],
    userCreated: [1]
  });

  representationForm: FormGroup = this.FormBuilder.group({
    groupRepresentationID: [],
    surveyTypeID: [],
    analysisCategoryID: [],
    vocationalInterestsID: [],
    quantityQuestionAnswereds: [],
    name: [],
    description: [],
    statusID: [1],
    userCreated: [1]
  });

  ngOnInit() {
    this.getSurveyTypes();  
    this.getQuestionTypes();  
    this.getCategories();
    this.getInterests();
    // this.getGroupRepresentations();
  }

  async getQuestionTypes() {
    let result: any = await this.Administrative.getQuestionTypes().toPromise();
    this.questionTypes = result.filter((i: any) => i.statusID === 1);
    this.getAlternatives();
  }

  async getAlternatives() {
    let result: any = await this.Administrative.getAlternatives().toPromise();
    this.questionTypes.map((q: any) => {
      q.alternatives = result.filter((i: any) => i.questionTypeID === q.questionTypeID && i.statusID === 1);
    });
    console.log(this.questionTypes);
  }

  async getSurveyTypes() {
    let result: any = await this.Administrative.getSurveyType().toPromise();
    this.surveyTypes = result;
  }

  async getCategories() {
    let result: any = await this.Administrative.getAnalysisCategory().toPromise();
    this.categories = result;
  }

  async getInterests() {
    let result: any = await this.Administrative.getVocationalInterest().toPromise();
    this.interests = result;
  }

  // async getGroupRepresentations() {
  //   let result: any = await this.Administrative.getGroupRepresentation().toPromise();
  //   this.groupRepresentations = result;
  // }

  toggleSurveyType(surveyType?: any) {
    if (this.surveyTypeModal.isShown) {
      this.surveyTypeModal.hide();
    } else {
      this.surveyTypeModal.config.keyboard = false;
      this.surveyTypeModal.config.ignoreBackdropClick = true;
      this.surveyTypeModal.show();
      this.newSurveyType = {};
      if (surveyType) {
        this.newSurveyType = JSON.parse(JSON.stringify(surveyType));
        this.newSurveyType.editing = true;
        this.surveyTypeForm.controls['surveyTypeID'].setValue(surveyType.surveyTypeID);
        this.surveyTypeForm.controls['name'].setValue(surveyType.name);
        this.surveyTypeForm.controls['description'].setValue(surveyType.description);
        this.surveyTypeForm.updateValueAndValidity();
      }
    }
  }

  saveSurveyType() {
    let data: any = this.surveyTypeForm.value;
    Swal.fire({
      text: `¿Estas seguro de ${data.surveyTypeID ? 'actualizar' : 'guardar'} el Tipo de Encuesta?`,
      icon: 'question',
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: 'Cancelar',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        this.processing = true;
        let body: any = {};
        let result: any;
        if (data.surveyTypeID) {
          // update
          body.updates = [data];
          result = await this.Administrative.updateSurveyType(body).toPromise();
        } else {
          // create
          body.news = [data];
          result = await this.Administrative.saveSurveyType(body).toPromise();
        }
        this.processing = false;
        if (!result) {
          Swal.fire({
            text: 'Hubo un error',
            icon: 'error',
          });
          return;
        }
        Swal.fire({
          text: `${data.surveyTypeID ? 'Actualización' : 'Guardado'} exitosamente`,
          icon: 'success',
        });
        this.getSurveyTypes();
        this.toggleSurveyType();
      }
    });
  }

  deleteSurveyType(surveyType: any) {
    Swal.fire({
      text: `¿Estas seguro de eliminar el Tipo de Encuesta?`,
      icon: 'question',
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: 'Cancelar',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        let body: any = {
          deletes: [surveyType]
        };
        let result: any = await this.Administrative.deleteSurveyType(body).toPromise();
        if (!result) {
          Swal.fire({
            text: 'Hubo un error',
            icon: 'error',
          });
          return;
        }
        Swal.fire({
          text: 'Eliminación exitosa',
          icon: 'success',
        });
        this.getSurveyTypes();
      }
    });
  }

  toggleGroup() {
    if (this.groupModal.isShown) {
      this.groupModal.hide();
    } else {
      this.groupModal.config.keyboard = false;
      this.groupModal.config.ignoreBackdropClick = true;
      this.groupModal.show();
    }
  }

  toggleQuestionType() {
    if (this.questionTypeModal.isShown) {
      this.questionTypeModal.hide();
    } else {
      this.questionTypeModal.config.keyboard = false;
      this.questionTypeModal.config.ignoreBackdropClick = true;
      this.questionTypeModal.show();
    }
  }

  deleteQuestionType(questionType: any) {
    Swal.fire({
      text: `¿Estas seguro de eliminar el Tipo de Encuesta?`,
      icon: 'question',
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: 'Cancelar',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        questionType.statusID = 0;
        let body: any = {
          updates: [questionType]
        };
        let result: any = await this.Administrative.updateQuestionTypes(body).toPromise();
        if (!result) {
          Swal.fire({
            text: 'Hubo un error',
            icon: 'error',
          });
          return;
        }
        Swal.fire({
          text: 'Eliminación exitosa',
          icon: 'success',
        });
        this.getQuestionTypes();
      }
    });
  }

  toggleNewQuestionType(questionType?: any) {
    if (this.newQuestionType) {
      this.newQuestionType = undefined;
    } else {
      this.newQuestionType = {};
      if (questionType) {
        this.newQuestionType = JSON.parse(JSON.stringify(questionType));
        this.newQuestionType.editing = true;
      }
    }
  }

  toggleAlternative(questionType?: any, alternative?: any) {
    if (questionType.newAlternative) {
      questionType.newAlternative = undefined;
    } else {
      questionType.newAlternative = {
        questionTypeID: questionType.questionTypeID,
        statusID: 1,
      };
      if (alternative) {
        questionType.newAlternative = JSON.parse(JSON.stringify(alternative));
        questionType.newAlternative.editing = true;
      }
    }
  }

  saveAlternative(questionType: any) {
    Swal.fire({
      text: `¿Estas seguro de ${questionType.newAlternative.alternativeID ? 'actualizar' : 'guardar'} la Alternativa?`,
      icon: 'question',
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: 'Cancelar',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        this.processing = true;
        let body: any = {};
        let result: any;
        if (questionType.newAlternative.alternativeID) {
          // update
          questionType.newAlternative.userUpdated = 1;
          body.updates = [questionType.newAlternative];
          result = await this.Administrative.updateAlternatives(body).toPromise();
        } else {
          // create
          body.news = [questionType.newAlternative];
          result = await this.Administrative.saveAlternatives(body).toPromise();
        }
        this.processing = false;
        if (!result) {
          Swal.fire({
            text: 'Hubo un error',
            icon: 'error',
          });
          return;
        }
        Swal.fire({
          text: `${questionType.newAlternative.alternativeID ? 'Actualización' : 'Guardado'} exitosamente`,
          icon: 'success',
        });
        this.getQuestionTypes();
        this.toggleAlternative(questionType);
      }
    });
  }

  deleteAlternative(alternative: any) {
    Swal.fire({
      text: `¿Estas seguro de eliminar la Categoría?`,
      icon: 'question',
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: 'Cancelar',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false

    }).then(async (choice) => {
      if (choice.isConfirmed) {
        alternative.statusID = 0;
        let body: any = {
          updates: [alternative]
        };
        let result: any = await this.Administrative.updateAlternatives(body).toPromise();
        if (!result) {
          Swal.fire({
            text: 'Hubo un error',
            icon: 'error',
          });
          return;
        }
        Swal.fire({
          text: 'Eliminación exitosa',
          icon: 'success',
        });
        this.getAlternatives();
      }
    });
  }

  saveQuestionType() {
    Swal.fire({
      text: `¿Estas seguro de ${this.newQuestionType.questionTypeID ? 'actualizar' : 'guardar'} el Tipo de Pregunta?`,
      icon: 'question',
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: 'Cancelar',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        this.processing = true;
        let body: any = {};
        let result: any;
        if (this.newQuestionType.questionTypeID) {
          // update
          this.newQuestionType.userUpdated = 1;
          body.updates = [this.newQuestionType];
          result = await this.Administrative.updateQuestionTypes(body).toPromise();
        } else {
          // create
          this.newQuestionType.statusID = 1;
          this.newQuestionType.userCreated = 1;
          body.news = [this.newQuestionType];
          result = await this.Administrative.saveQuestionTypes(body).toPromise();
        }
        this.processing = false;
        if (!result) {
          Swal.fire({
            text: 'Hubo un error',
            icon: 'error',
          });
          return;
        }
        Swal.fire({
          text: `${this.newQuestionType.questionTypeID ? 'Actualización' : 'Guardado'} exitosamente`,
          icon: 'success',
        });
        this.newQuestionType = undefined;
        this.getQuestionTypes();
        this.toggleQuestionType();
      }
    });
  }

  toggleCategory(category?: any) {
    if (category) {
      this.newCategory = category;
      this.categoryForm.controls['analysisCategoryID'].setValue(category.analysisCategoryID);
      this.categoryForm.controls['name'].setValue(category.name);
      this.categoryForm.controls['abbr'].setValue(category.abbr);
      this.categoryForm.controls['description'].setValue(category.description);
      this.categoryForm.updateValueAndValidity();
    } else {
      this.newCategory = {};
      this.categoryForm.controls['analysisCategoryID'].setValue('');
      this.categoryForm.controls['name'].setValue('');
      this.categoryForm.controls['abbr'].setValue('');
      this.categoryForm.controls['description'].setValue('');
      this.categoryForm.updateValueAndValidity();
    }
  }

  saveCategory() {
    let data: any = this.categoryForm.value;
    Swal.fire({
      text: `¿Estas seguro de ${data.analysisCategoryID ? 'actualizar' : 'guardar'} la Categoría?`,
      icon: 'question',
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: 'Cancelar',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        this.processing = true;
        let body: any = {};
        let result: any;
        if (data.analysisCategoryID) {
          // update
          data.userUpdated = 1;
          body.updates = [data];
          result = await this.Administrative.updateAnalysisCategory(body).toPromise();
        } else {
          // create
          body.news = [data];
          result = await this.Administrative.saveAnalysisCategory(body).toPromise();
        }
        this.processing = false;
        if (!result) {
          Swal.fire({
            text: 'Hubo un error',
            icon: 'error',
          });
          return;
        }
        Swal.fire({
          text: `${data.analysisCategoryID ? 'Actualización' : 'Guardado'} exitosamente`,
          icon: 'success',
        });
        this.getCategories();
        this.cancelCategory();
      }
    });
  }

  cancelQuestion() {
    this.newQuestionType = undefined;
  }
  
  cancelCategory() {
    this.newCategory = undefined;
  }

  deleteCategory(category: any) {
    Swal.fire({
      text: `¿Estas seguro de eliminar la Categoría?`,
      icon: 'question',
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: 'Cancelar',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false

    }).then(async (choice) => {
      if (choice.isConfirmed) {
        let body: any = {
          deletes: [category]
        };
        let result: any = await this.Administrative.deleteAnalysisCategory(body).toPromise();
        if (!result) {
          Swal.fire({
            text: 'Hubo un error',
            icon: 'error',
          });
          return;
        }
        Swal.fire({
          text: 'Eliminación exitosa',
          icon: 'success',
        });
        this.getCategories();
      }
    });
  }

  toggleInterest(category?: any) {
    if (category) {
      this.newInterest = category;
      this.interestForm.controls['vocationalInterestsID'].setValue(category.vocationalInterestsID);
      this.interestForm.controls['name'].setValue(category.name);
      this.interestForm.controls['abbr'].setValue(category.abbr);
      this.interestForm.controls['description'].setValue(category.description);
      this.interestForm.updateValueAndValidity();
    } else {
      this.newInterest = {};
      this.interestForm.controls['vocationalInterestsID'].setValue('');
      this.interestForm.controls['name'].setValue('');
      this.interestForm.controls['abbr'].setValue('');
      this.interestForm.controls['description'].setValue('');
      this.interestForm.updateValueAndValidity();
    }
  }

  saveInterest() {
    let data: any = this.interestForm.value;
    Swal.fire({
      text: `¿Estas seguro de ${data.vocationalInterestsID ? 'actualizar' : 'guardar'} la Categoría?`,
      icon: 'question',
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: 'Cancelar',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        this.processing = true;
        let body: any = {};
        let result: any;
        if (data.vocationalInterestsID) {
          // update
          data.userUpdated = 1;
          body.updates = [data];
          result = await this.Administrative.updateVocationalInterest(body).toPromise();
        } else {
          // create
          body.news = [data];
          result = await this.Administrative.saveVocationalInterest(body).toPromise();
        }
        this.processing = false;
        if (!result) {
          Swal.fire({
            text: 'Hubo un error',
            icon: 'error',
          });
          return;
        }
        Swal.fire({
          text: `${data.vocationalInterestsID ? 'Actualización' : 'Guardado'} exitosamente`,
          icon: 'success',
        });
        this.getInterests();
        this.cancelInterest();
      }
    });
  }
  
  cancelInterest() {
    this.newInterest = undefined;
  }

  deleteInterest(category: any) {
    Swal.fire({
      text: `¿Estas seguro de eliminar la Categoría?`,
      icon: 'question',
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: 'Cancelar',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false

    }).then(async (choice) => {
      if (choice.isConfirmed) {
        let body: any = {
          deletes: [category]
        };
        let result: any = await this.Administrative.deleteVocationalInterest(body).toPromise();
        if (!result) {
          Swal.fire({
            text: 'Hubo un error',
            icon: 'error',
          });
          return;
        }
        Swal.fire({
          text: 'Eliminación exitosa',
          icon: 'success',
        });
        this.getInterests();
      }
    });
  }

  toggleResult(surveyType?: any) {
    if (this.representationModal.isShown) {
      this.representationModal.hide();
    } else {
      this.representationModal.config.keyboard = false;
      this.representationModal.config.ignoreBackdropClick = true;
      this.representationModal.show();
      this.surveyTypeSelected = surveyType;
      this.getGroupRepresentationsOfSurveyType();
    }
  }

  async getGroupRepresentationsOfSurveyType() {
    let result: any = await this.Administrative.getGroupRepresentation().toPromise();
    if (!result) {
      Swal.fire({
        text: 'Hubo un error',
        icon: 'error',
      });
      return;
    }
    this.groupRepresentations = result.filter((r: any) => r.surveyTypeID == this.surveyTypeSelected.surveyTypeID);
  }
  
  toggleRepresentation(representation?: any) {
    if (representation) {
      this.newRepresentation = representation;
      this.representationForm.controls['groupRepresentationID'].setValue(representation.groupRepresentationID);
      this.representationForm.controls['surveyTypeID'].setValue(representation.surveyTypeID);
      this.representationForm.controls['analysisCategoryID'].setValue(representation.analysisCategoryID);
      this.representationForm.controls['vocationalInterestsID'].setValue(representation.vocationalInterestsID);
      this.representationForm.controls['quantityQuestionAnswereds'].setValue(representation.quantityQuestionAnswereds);
      this.representationForm.controls['name'].setValue(representation.name);
      this.representationForm.controls['description'].setValue(representation.description);
      this.representationForm.updateValueAndValidity();
    } else {
      this.newRepresentation = {};
      this.representationForm.controls['groupRepresentationID'].setValue('');
      this.representationForm.controls['surveyTypeID'].patchValue(this.surveyTypeSelected.surveyTypeID);
      this.representationForm.controls['analysisCategoryID'].setValue('');
      this.representationForm.controls['vocationalInterestsID'].setValue('');
      this.representationForm.controls['quantityQuestionAnswereds'].setValue('');
      this.representationForm.controls['name'].setValue('');
      this.representationForm.controls['description'].setValue('');
      this.representationForm.updateValueAndValidity();
    }
  }

  saveRepresentation() {
    let data: any = this.representationForm.value;
    Swal.fire({
      text: `¿Estas seguro de ${data.groupRepresentationID ? 'actualizar' : 'guardar'} la Categoría?`,
      icon: 'question',
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: 'Cancelar',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        this.processing = true;
        let body: any = {};
        let result: any;
        if (data.groupRepresentationID) {
          // update
          data.userUpdated = 1;
          body.updates = [data];
          result = await this.Administrative.updateGroupRepresentation(body).toPromise();
        } else {
          // create
          body.news = [data];
          result = await this.Administrative.saveGroupRepresentation(body).toPromise();
        }
        this.processing = false;
        if (!result) {
          Swal.fire({
            text: 'Hubo un error',
            icon: 'error',
          });
          return;
        }
        Swal.fire({
          text: `${data.groupRepresentationID ? 'Actualización' : 'Guardado'} exitosamente`,
          icon: 'success',
        });
        this.getGroupRepresentationsOfSurveyType();
        this.cancelRepresentation();
      }
    });
  }
  
  cancelRepresentation() {
    this.newRepresentation = undefined;
  }

  deleteRepresentation(category: any) {
    Swal.fire({
      text: `¿Estas seguro de eliminar la Representación del Grupo?`,
      icon: 'question',
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: 'Cancelar',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        let body: any = {
          deletes: [category]
        };
        let result: any = await this.Administrative.deleteGroupRepresentation(body).toPromise();
        if (!result) {
          Swal.fire({
            text: 'Hubo un error',
            icon: 'error',
          });
          return;
        }
        Swal.fire({
          text: 'Eliminación exitosa',
          icon: 'success',
        });
        this.getCategories();
      }
    });
  }

  configSurveyType(surveyType: any) {
    this.Router.navigate(['/administracion/tipo-de-formulario', surveyType.surveyTypeID]);
  }

  toggleDetail(c: any) {
    c.showDetail = !c.showDetail;
  }

}
