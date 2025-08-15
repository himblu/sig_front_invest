import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { LoginService } from '@services/login.service';
import { Login } from '@utils/interfaces/login.interfaces';
import { BloodType, Canton, CivilStatus, Country, Etnia, Gender, Groups, Identity, NationalTowns, Nationality, Parish, Province, Sex } from '@utils/interfaces/others.interfaces';
import { Campus } from '@utils/interfaces/period.interfaces';
import { onlyLetters, onlyNumbers } from 'app/constants';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.css']
})
export class PersonalInfoComponent implements OnInit {

  constructor(
    private Common: CommonService,
    private Auth: LoginService,
    private FormBuilder: FormBuilder,
    private ActivatedRoute: ActivatedRoute,
    private Administrative: AdministrativeService,
    private Router: Router,
    private ElementRef: ElementRef
  ) {}

  @ViewChild('userPhotoPreview') userPhotoPreview: ElementRef<HTMLElement>;

  @ViewChild('instructionModal', {static: false}) instructionModal: ModalDirective;

  civilStatuses: CivilStatus[] = [];
  genders: Gender[] = [];
  sexs: Sex[] = [];
  bloodTypes: BloodType[] = [];
  nationalities: Nationality[] = [];
  countries: Country[] = [];
  provinces: Province[] = [];
  cantons: Canton[] = [];
  culturalGroups: Etnia[] = [];
  nationalityTows: NationalTowns[] = []
  documentTypeSelected: Identity;

  parishes: Parish[] = [];

  editBasicInfo: boolean = true;
  documentTypes: Identity[] = [];
  data: CommonService;
  existsPersonInf: boolean = false;
  userId: string;
  currentAdmissionPeriod: any;
  existsPostulation: boolean = false;
  personalInfo: any = {};

  canChoiseDataAcademic: boolean = false;
  urlUserPhoto: string;
  currentDate: any;

  async ngOnInit() {

    this.currentDate = moment().subtract(15, 'years').format('YYYY-MM-DD');
    //console.log(this.currentDate);
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
    if (!this.userId) {
      // HACER OTRA COSA => HOMOLOGACIÓN
     // console.log('aqui entroe');
      this.canChoiseDataAcademic = true;
    }
    //console.log("<<<<<<<<<<<<<<<<<<<this.canChoiseDataAcademic>>>>>>>>>>>>>>>>>>>>>>>>>");
    //console.log(this.canChoiseDataAcademic);
    this.currentAdmissionPeriod = await this.Administrative.getCurrentAdmissionPeriod().toPromise();
    this.personalInfo.documentNumber = this.userId.substring(1);
    //console.log(this.personalInfo);
    this.Common.charging();
    setTimeout(() => {
      this.getData();
    }, 1000);
  }

  async getData() {
    //console.log(this.Common);
    //console.log(this.Common.civilList);
    if (!this.canChoiseDataAcademic ) {
      let resultPerson: any = await this.Common.getPersonByDocumentNumber(this.userId.substr(1)).toPromise();
      //console.log(resultPerson);
      resultPerson.documentNumber = resultPerson.identity;
      this.personalInfo = JSON.parse(JSON.stringify(resultPerson));
      let postulantInfo: any = await this.Administrative.getPostulantCollegeByPersonID(resultPerson.personID).toPromise();
      if (postulantInfo) {
        //console.log(postulantInfo);
        //console.log(this.currentAdmissionPeriod);
        if (this.currentAdmissionPeriod) {
          let currentPostulation: any = postulantInfo.find((p: any) => p.admissionPeriodID === this.currentAdmissionPeriod.admissionPeriodID);
          if (currentPostulation) {
            this.existsPostulation = true;
            // this.personalInfoForm.disable();
          } else {
            this.existsPostulation = false;
          }
        } else {
          this.existsPostulation = false;
        }
      }
      let resultPersonInf: any = await this.Common.getPersonInfByPersonID(resultPerson.personID).toPromise();
      //console.log(resultPersonInf);
      //console.log('-------------');
      if (resultPersonInf) {
        this.existsPersonInf = true;
        this.personalInfo = Object.assign(this.personalInfo, resultPersonInf); // JSON.parse(JSON.stringify(resultPersonInf));
      }
      // this.personalInfo = Object.assign(this.personalInfo, resultPerson);
      this.personalInfo.personFirstName = resultPerson.firstName;
      this.personalInfo.personMiddleName = resultPerson.middleName;
      this.personalInfo.personLastName = resultPerson.lastName;
      this.personalInfo.documentType = resultPerson.typeDocId;
    }

    this.civilStatuses = this.Common.civilList;
    this.genders = this.Common.genderList;
    this.sexs = this.Common.sexList;
    this.bloodTypes = this.Common.bloodList;
    this.nationalities = this.Common.nationalityList;
    this.parishes = this.Common.parish;
    this.countries = await this.Common.getCountries().toPromise();

    this.provinces = await this.Common.cargaCombo(6).toPromise();
    this.culturalGroups = this.Common.etniaList;
    this.nationalityTows = await this.Common.getNationalityTowns().toPromise();
    this.documentTypes = this.Common.identityList;
    console.log(this.personalInfo);
    this.personalInfo.countryID = this.personalInfo.countryID || undefined;
    this.personalInfo.nationalTownID = this.personalInfo.nationalTownID || undefined;
    this.personalInfo.provinceID = this.personalInfo.provinceID || undefined;
    this.personalInfo.nationalityID = this.personalInfo.nationalityID || undefined;
    this.personalInfo.ethnicityID = this.personalInfo.ethnicityID || undefined;
    this.selectProvince();
    this.personalInfo.cantonID = this.personalInfo.cantonID || undefined;
    Swal.close();
    this.toggleInstructions();
    this.selectDocumentType();
    // this.documentTypes = this.Common.identityList;
  }

  async selectProvince() {
    if (this.personalInfo.provinceID) {
      this.cantons = await this.Common.getCantonByProvince(7, this.personalInfo.provinceID).toPromise();
    }
  }

  toggleEditBasicInfo() {
    this.editBasicInfo = !this.editBasicInfo;
  }

  selectDocumentType() {
    if (this.personalInfo.documentType) {
      this.documentTypeSelected = this.documentTypes.find((d: Identity) => d.typeDocId === this.personalInfo.documentType);
      if (this.documentTypeSelected) {
        this.personalInfo.typeDocLong = this.documentTypeSelected.typeDocLong;
      }
    }
  }



  onlyLetters(e: any) {
    onlyLetters(e);
  }

  onlyNumbers(e: any) {
    onlyNumbers(e);
  }

  async saveAndContinue() {
    if (!this.existsPostulation) {
      if (!this.existsPersonInf) {
        // let newPersonInf: any = JSON.parse(JSON.stringify(this.personalInfoForm.value));
        let newPersonInf: any = JSON.parse(JSON.stringify(this.personalInfo));
        newPersonInf.birthday = moment(newPersonInf.birthday).format('YYYY-MM-DD');
        newPersonInf.statusID = 1;
        newPersonInf.userCreated = this.userId;
        newPersonInf.version = 0;
        console.log(newPersonInf);
        let body: any = {
          news: [newPersonInf]
        };
        let newPerson: any = await this.Common.savePersonInfJSON(body).toPromise();
        console.log(newPerson);
      } else {
        // let updatePersonInf: any = JSON.parse(JSON.stringify(this.personalInfoForm.value));
        let updatePersonInf: any = JSON.parse(JSON.stringify(this.personalInfo));
        updatePersonInf.birthday = moment(updatePersonInf.birthday).format('YYYY-MM-DD');
        updatePersonInf.statusID = 1;
        updatePersonInf.userCreated = this.userId;
        updatePersonInf.dateCreated = moment();
        updatePersonInf.version = 0;
        console.log(updatePersonInf);
        let body: any = {
          updates: [updatePersonInf]
        };
        let updatePerson: any = await this.Common.updatePersonInfJSON(body).toPromise();
        console.log('updatePerson');
        console.log(updatePerson);
      }
    }
    this.Router.navigate([`/inscripcion/informacion-de-contacto/${this.userId}`]);
  }

  changePhoto(e: any) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const reader = new FileReader();
      reader.onload = e => this.urlUserPhoto = reader.result as string;
      reader.readAsDataURL(file);
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

}
