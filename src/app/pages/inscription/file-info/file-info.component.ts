import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '@environments/environment';
import { AdministrativeService } from '@services/administrative.service';
import { ApiService } from '@services/api.service';
import { CommonService } from '@services/common.service';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Validators } from 'ngx-editor';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-file-info',
  templateUrl: './file-info.component.html',
  styleUrls: ['./file-info.component.css'],
})
export class FileInfoComponent implements OnInit{
  constructor(
    private ActivatedRoute: ActivatedRoute,
    private Administrative: AdministrativeService,
    private ElementRef: ElementRef,
    private Common: CommonService,
    private FormBuilder: FormBuilder,
    private API: ApiService,
		private router: Router
  ) {

  }

  @ViewChild('validationEnrollModal', {static: false}) validationEnrollModal: ModalDirective;
  @ViewChild('instructionModal', {static: false}) instructionModal: ModalDirective;

  userId: any;
  fileType: any;
  files: any[] = [];
  fileSelected: any;
  validation: any = {};
  personalInfo: any = {};
  academicInfo: any = {};
  accept: boolean;
  currentAdmissionPeriod: any;
  newEnrollment: any = {};
  filesUploades: any[] = [];
  financialEntities: any[] = [];
  transactionTypes: any[] = [];
  conceptCostLeveling: any;
  currentDate: any;
  isRegularizing: boolean = false;
  isInserted: boolean = false;
  financialForm: FormGroup = this.FormBuilder.group({
    conceptsID: [undefined,Validators.required],
    financialEntity: ['',Validators.required],
    transactionType: ['',Validators.required],
    payDay: [undefined,Validators.required],
    voucherNumber: [undefined,Validators.required],
  });
  showModal: boolean = false;
  showVideo: boolean = true;
  saving: boolean = false;
  ngOnInit(): void {
    Swal.fire({
      text: 'Cargando Información',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      showCancelButton: false,
      showConfirmButton: false
    });
    let params: any = this.ActivatedRoute.snapshot.params;
    this.userId = params.userId;
    this.fileType = params.fileType;
    this.currentDate = moment().format('YYYY-MM-DD');
    this.getFilesOfStudent();
    this.getFinancialEntities();
    this.getTransactionTypes();
    this.getConceptCostOfLeveling()
    // this.getAcademicInfo();

  }

  async getConceptCostOfLeveling() {
    let result: any = await this.Administrative.getConceptCostOfLeveling().toPromise();
    this.conceptCostLeveling = result;
  }

  async getFinancialEntities() {
    let result: any = await this.Administrative.getFinancialEntities().toPromise();
    this.financialEntities = result;
  }

  async getTransactionTypes() {
    let result: any = await this.Administrative.getTransactionTypes().toPromise();
    this.transactionTypes = result;
  }

  async getFilesOfStudent() {
    let result: any = await this.Administrative.getFileProcessConfig().toPromise();
    /* console.log(result);
    console.log(this.fileType); */
    let docFinantials: any = [13];
    if (!this.fileType) {
      this.files = result.filter((r: any) => r.otherProcessID === 1 && !docFinantials.includes(r.fileTypeID));
    } else {
      this.files = result.filter((r: any) => r.otherProcessID === 1 && docFinantials.includes(r.fileTypeID));
    }
    this.files.map((f: any) => {
      switch (f.executableTypeID) {
        case 1:
          f.accept = '.jpeg,.jpg,.png';
          break;
        case 2:
          f.accept = '.pdf';
          break;
        default:
          break;
      }
    });

    this.getPersonalInfo();
    // this.getFileUploadeds()
  }

  async getPersonalInfo() {
    let resultPerson: any = await this.Common.getPersonByDocumentNumber(this.userId.substr(1)).toPromise();
    let resultPersonInf: any = await this.Common.getPersonInfByPersonID(resultPerson.personID).toPromise();
    //console.log(resultPerson);
    this.personalInfo = resultPerson;
    this.personalInfo.fullName = `${resultPerson.firstName} ${resultPerson.middleName || ''} ${resultPerson.lastName || ''}`.toUpperCase();
    //console.log(this.personalInfo);
    this.getCurrentAdmissionPeriod();
  }

  async getCurrentAdmissionPeriod() {
    let result: any = await this.Administrative.getCurrentAdmissionPeriod().toPromise();
    this.currentAdmissionPeriod = result;
    if (this.currentAdmissionPeriod) {
      this.newEnrollment.admissionPeriodID = this.currentAdmissionPeriod.admissionPeriodID;
    }
    //console.log(this.currentAdmissionPeriod);
    let resultPostulations: any = await this.Administrative.getPostulantByPersonIDAndLevelID(this.personalInfo.personID, 1).toPromise();
    let resultPostulantCollege: any = await this.Administrative.getPostulantCollegeByPersonID(this.personalInfo.personID).toPromise();
    let postulantCollegeOfCurrentAdmissionPeriodID = resultPostulations.find((p: any) => p.admissionPeriodID === this.currentAdmissionPeriod.admissionPeriodID);
    if (postulantCollegeOfCurrentAdmissionPeriodID) {

      let resultFilePerson: any = await this.Administrative.getFilePostulantByPersonIDAndAdmissionPeriodID(postulantCollegeOfCurrentAdmissionPeriodID.postulantID, this.currentAdmissionPeriod.admissionPeriodID).toPromise();
      //console.log(resultFilePerson);
      let population = resultFilePerson;
      let docFinantials: any = [13];
      if (this.fileType) {
        population = population.filter((i: any) => docFinantials.includes(i.fileTypeID));
        if (population.some((i: any) => i.statusFileID === 3 || i.statusFileID === 4)) {
          this.isRegularizing = true;
        }
        //console.log("<<<<<<<<<<<<<<<<<<<<population>>>>>>>>>>>>>>>>>>>>>>>>>>");
        //console.log(population);
      } else {
        if (population.some((i: any) => i.statusFileID === 3 || i.statusFileID === 4)) {
          this.isRegularizing = true;
        }
      }
      if (this.isRegularizing) {
        this.filesUploades = resultFilePerson.filter((f: any) => f.statusFileID === 4);
        this.files = this.files.filter((f: any) => this.filesUploades.map((x: any) => x.fileTypeID).includes(f.fileTypeID));
      } else {
        if (resultFilePerson.length) {
          this.filesUploades = resultFilePerson;
        } else {
          this.filesUploades = this.files;
        }
      }
      this.files.map((f: any) => {
        // let fileUploadedFound: any = this.filesUploades.find((x: any) => x.fileTypeID === f.fileTypeID);
        let fileUploadedFound: any = this.filesUploades.find((x: any) => x.fileTypeID === f.fileTypeID);
        if (fileUploadedFound) {
          if (fileUploadedFound.statusFileID) {
            f.editing = true;
            f.statusFileID = fileUploadedFound.statusFileID;
            f.filePostulandID = fileUploadedFound.filePostulandID;
            f.commentary = fileUploadedFound.commentary;
            f.hasFile = fileUploadedFound.statusFileID === 4 ? false : true;
            f.url = `${environment.url}/${fileUploadedFound.pathFile}`;
            f.amount = fileUploadedFound.amount ? parseFloat(fileUploadedFound.amount) : fileUploadedFound.amount;
            f.voucherNumber = fileUploadedFound.voucherNumber;
            f.financialEntity = fileUploadedFound.financialEntity;
            f.transactionType = fileUploadedFound.transactionType;
            f.payDay = fileUploadedFound.payDay;
          }
        }
      });


      let resultDisability: any = await this.Common.getStudentDisability(this.personalInfo.personID).toPromise();

      //console.log(resultPostulations);
      if (postulantCollegeOfCurrentAdmissionPeriodID) {
        if (!postulantCollegeOfCurrentAdmissionPeriodID.foreignBachelor) {
          this.files = this.files.filter((f: any) => f.fileTypeID !== 9);
        }
        if (!postulantCollegeOfCurrentAdmissionPeriodID.studentGrant) {
          this.files = this.files.filter((f: any) => f.fileTypeID !== 11);
        }
      }

      if (!resultDisability.length) {
        this.files = this.files.filter((f: any) => f.fileTypeID !== 10);
      }

      if (!this.personalInfo.nationalTownID || this.personalInfo.nationalTownID === null || this.personalInfo.nationalTownID === 0 ) {
        this.files = this.files.filter((f: any) => f.fileTypeID !== 12);
      }
      /* console.log(resultPostulantCollege);
      console.log(postulantCollegeOfCurrentAdmissionPeriodID);
      console.log(this.currentAdmissionPeriod); */
      this.verifyFiles();
      this.academicInfo = resultPostulations.find((p: any) => p.admissionPeriodID === this.currentAdmissionPeriod.admissionPeriodID);
      //console.log(this.academicInfo);
      this.academicInfo.collegeTypeName = resultPostulantCollege[0].collegeTypeName;
      this.academicInfo.collegeName = resultPostulantCollege[0].collegeName;
      this.academicInfo.degreeTitle = resultPostulantCollege[0].degreeTitle;

      this.academicInfo = Object.assign(this.academicInfo, postulantCollegeOfCurrentAdmissionPeriodID);
      //console.log(this.academicInfo);
      Swal.close();
      this.showModal = true;
      this.toggleInstructions();
      if (this.fileType) {
        setTimeout(() => {
          this.showVideo = false;
        }, 33000);
      }
    } else {
      Swal.close();
      Swal.fire({
        text: 'No tienes registro de postulación. No puedes estar aqui',
        icon: 'error',
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
        showCancelButton: false,
        showConfirmButton: true,
        confirmButtonColor: '#014898'
      }).then((choice) => {
        if (choice.isConfirmed) {
          this.Common.logout();
        }
      })
    }
  }

  toggleInstructions() {
    if (this.instructionModal.isShown) {
      this.instructionModal.hide();
    } else {
      this.instructionModal.config.keyboard = false;
      this.instructionModal.config.ignoreBackdropClick = true;
      this.instructionModal.show();
    }
  }

  async validateVoucher() {
    this.fileSelected.error = true;
    if (this.financialForm.controls['financialEntity'].value && this.financialForm.controls['transactionType'].value && this.financialForm.controls['voucherNumber'].value) {
      let financialEntity: any = this.financialForm.controls['financialEntity'].value;
      let transactionType: any = this.financialForm.controls['transactionType'].value;
      let voucherNumber: any = this.financialForm.controls['voucherNumber'].value;
      let result: any = await this.Administrative.getFilePostulantByFinancialInfo(financialEntity, transactionType, voucherNumber).toPromise();
      //console.log(result);
      this.fileSelected.error = result.length > 0;
      if (this.fileSelected.error) {
        Swal.fire({
          text: 'Existe un voucher registrado anteriormente con esos datos.',
          icon: 'error'
        });
        this.verifyFiles();
        return;
      }
      this.verifyFiles();
      this.validatePaymentDate();
    }
  }

  async toggleSelectFile(file: any) {
    if (((this.fileSelected && !this.fileSelected.error) || !this.fileSelected)) {
      this.fileSelected = file;
      if (this.isInserted) {
        //console.log(this.fileSelected.url);
        let parts: any = this.fileSelected.url.split('/');
		    let fileName = parts[parts.length - 1];
        this.fileSelected.url = `${environment.url}/api/file/view/${this.personalInfo.personID}/${fileName}`
        // let fileInfo: any = await this.API.getPersonImage(this.personalInfo.personID, fileName).toPromise();
        // console.log(fileInfo);
      }
      //console.log(this.fileSelected);
      if (this.fileSelected.fileTypeID === 13) {
        this.fileSelected.isfinancial = true;
        if (this.fileSelected.isfinancial) {

          this.financialForm.controls['financialEntity'].patchValue(this.fileSelected.financialEntity);
          this.financialForm.controls['voucherNumber'].patchValue(this.fileSelected.voucherNumber);
          this.financialForm.controls['transactionType'].patchValue(this.fileSelected.transactionType);
          this.financialForm.controls['payDay'].patchValue(this.fileSelected.payDay);
        }
        if (this.fileSelected.hasFile === true) {
          this.fileSelected.error = true;
          this.verifyFiles();
        } else {
          this.fileSelected.error = false;
        }
      }
    }
  }

  changeFile(e: any, fileSelected: any) {
    fileSelected.hasFile = false;
    if ((e.target.files && e.target.files[0]) || !fileSelected.hasFile) {
      const file = e.target.files[0];
      if (file.size > 1000000) {
        Swal.fire({
          text: 'El archiso subido excede el limite permitido (1mb)',
          icon: 'warning'
        });
        this.resetFile(fileSelected);
        return;
      }
      fileSelected.fileObject = file;
      const reader = new FileReader();
      reader.onload = e => fileSelected.url = reader.result as string;
      fileSelected.hasFile = true;
      reader.readAsDataURL(file);
      if (fileSelected.fileTypeID === 13) {
        this.financialForm.controls['conceptsID'].patchValue(this.conceptCostLeveling.conceptsPaymentID);
        this.financialForm.updateValueAndValidity();
        fileSelected.amount = this.conceptCostLeveling.amount;
      }
    }
    this.verifyFiles();
  }

  verifyFiles() {
    if (this.fileSelected && this.fileSelected.isfinancial) {
      this.fileSelected.error = !this.financialForm.controls['financialEntity'].value && !this.financialForm.controls['transactionType'].value && !this.financialForm.controls['voucherNumber'].value && !this.financialForm.controls['payDay'].value;
      //console.log(this.fileSelected);
    }
    this.validation.allFilesChoiceds = this.files.filter((f: any) => f.hasFile).length === this.files.length;
    this.validation.anyErrors = this.files.some((f: any) => f.error);
    //console.log(this.files);
    let isInserted = this.files.every((f: any) => f.statusFileID && f.statusFileID === 2);
    this.isInserted = isInserted;
    //console.log(isInserted);
    if (this.financialForm && this.fileSelected) {
      if (this.isInserted) {
        this.financialForm.disable();
      }
      let data: any = this.financialForm.value;
      //console.log(data);
      this.fileSelected = Object.assign(this.fileSelected, data);
      /* console.log(this.validation);
      console.log(this.fileSelected); */
    }
  }

  resetFile(fileSelected: any) {
    fileSelected.file = undefined;
    fileSelected.url = undefined;
    fileSelected.hasFile = false;
    fileSelected.error = false;
    this.verifyFiles();
  }

  toggleValidationModal() {
    if (!this.validation.allFilesChoiceds) {
      Swal.fire({
        text: 'Todos los archivos son necesarios para completar este proceso',
        icon: 'warning'
      });
      return;
    }
    if (this.validation.anyErrors) {
      Swal.fire({
        text: 'Todos los archivos son necesarios para completar este proceso',
        icon: 'warning'
      });
      return;
    }
    if (this.validationEnrollModal.isShown) {
      this.validationEnrollModal.hide();
    } else {
      this.validationEnrollModal.config.keyboard = false;
      this.validationEnrollModal.config.ignoreBackdropClick = true;
      this.validationEnrollModal.show();
    }
  }

  validatePaymentDate() {
    //console.log(this.financialForm.controls['payDay'].value);
    if (this.financialForm.controls['payDay'].value) {
      this.fileSelected.payDay = this.financialForm.controls['payDay'].value;
      this.fileSelected.error = moment(this.financialForm.controls['payDay'].value).isAfter(moment());
    }
  }

  async saveEnroll() {
    // Subiendo archivos
    if (!this.accept && !this.fileType && !this.isRegularizing) {
      Swal.fire({
        text: 'Necesitas aceptar que registraste la INFORMACIÓN REQUERIDA para finalizar la INSCRIPCIÓN',
        icon: 'error'
      });
      return;
    }
    this.saving = true;
    for (let i = 0; i < this.files.length; i++) {
      let fileItem = this.files[i];
      /* console.log(fileItem);
      console.log(this.isRegularizing); */
      if (fileItem.fileObject) {
        let extension = fileItem.fileObject.name.substr(-6).split('.')[1];
        let resultUploadFile: any;

        if (fileItem.executableTypeID === 1) {
          resultUploadFile = await this.Administrative.uploadPostulantImages(fileItem.fileTypeID, fileItem.fileObject, fileItem.fileTypeID, this.academicInfo.postulantID, fileItem.financialEntity === '' ? 0 : fileItem.financialEntity, fileItem.transactionType === '' ? 0 : fileItem.transactionType, fileItem.voucherNumber, fileItem.payDay, fileItem.conceptsID, fileItem.amount, this.isRegularizing, fileItem.filePostulandID).toPromise();
        }
        if (fileItem.executableTypeID === 2) {
          resultUploadFile = await this.Administrative.uploadPostulantDocuments(fileItem.fileTypeID, fileItem.fileObject, fileItem.fileTypeID, this.academicInfo.postulantID, fileItem.financialEntity === '' ? 0 : fileItem.financialEntity, fileItem.transactionType === '' ? 0 : fileItem.transactionType, fileItem.voucherNumber, fileItem.payDay, fileItem.conceptsID, fileItem.amount, this.isRegularizing, fileItem.filePostulandID).toPromise();
        }
        //console.log(resultUploadFile);
        fileItem.path = resultUploadFile.path;
      }
    }
    this.saving = false;
    if (!this.isRegularizing) {
      Swal.fire({
        text: 'Se culminó el proceso de Inscripción',
        icon: 'success'
      });
      if (!this.fileType) {
        this.toggleValidationModal();
      }
      this.ngOnInit();
    } else {
      Swal.fire({
        text: 'Se realizó la regularización de documentos correctamente.',
        icon: 'success',
      });
      this.toggleRegularizing();
      this.ngOnInit();
    }
		this.router.navigateByUrl('/inscripcion/comprobantes-de-pago/'+this.userId+'/financiero');
  }

  toggleRegularizing() {
    if (!this.validation.allFilesChoiceds) {
      Swal.fire({
        text: 'Debes subir todos los documentos para poder continuar',
        icon: 'error'
      });
      return;
    }
    if (this.validation.anyErrors) {
      Swal.fire({
        text: 'Existen algunos items con errores. Revisa y vuelve a intentar',
        icon: 'error'
      });
      return;
    }
    Swal.fire({
      text: '¿Estas seguro de enviar los documentos?',
      icon: 'question',
      showConfirmButton: true,
      confirmButtonColor: '#014898',
      showCancelButton: true,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      cancelButtonText: 'Cancelar'
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        this.saveEnroll();
      }
    })
  }

}
