import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { Canton, Country, OperatorsCellular, Parish, PhoneType, Province, Relationship } from '@utils/interfaces/others.interfaces';
import { alphaNumeric, onlyLetters, onlyNumbers } from 'app/constants';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contact-info',
  templateUrl: './contact-info.component.html',
  styleUrls: ['./contact-info.component.css']
})
export class ContactInfoComponent implements OnInit{

  constructor(
    private FormBuilder: FormBuilder,
    private Common: CommonService,
    private Router: Router,
    private ActivatedRoute: ActivatedRoute,
    private Administrative: AdministrativeService
  ) {

  }

  cellphoneOperators: OperatorsCellular[] = [];
  relationShips: Relationship[] = [];
  countries: Country[] = [];
  provinces: Province[] = [];
  cantons: Canton[] = [];
  parishes: Parish[] = [];
  phoneTypes: PhoneType[] = [];
  userId: any;
  contactInfoForm: FormGroup = this.FormBuilder.group({
    personId: ['', Validators.required],
    cantonID: [{value: '', disabled: true},  Validators.required],
    provinceID: ['', Validators.required],
    countryID: ['', Validators.required],
    parishID: [{value: '', disabled: true}, Validators.required],
    numberPhone: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(10)]],
    phoneTypeID: ['', Validators.required],
    operatorID: ['', Validators.required],
    celularPhone: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(10)]],
    addressFloorNumber: ['', [Validators.required, Validators.maxLength(20)]],
    numberReferences: ['', [Validators.maxLength(10)]],
    emailDesc: ['', Validators.required],
    addressDesc: ['', Validators.required],
    contactFullName: ['', Validators.required],
    relationShipID: ['', Validators.required],
    contactPhone: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(10)]],
    comentary: ['', [Validators.required, Validators.maxLength(10)]],
    contactAddress: ['', Validators.required],
    email: ['', Validators.required],
    sequenceNro: ['', Validators.required],
    secondaryStreet_1: ['', Validators.required],
    secondaryStreet_2: [''],
    addressReferences: ['', Validators.required],
    latitude: [],
    altitude: []
  });
  existsPhone: boolean = false;
  existsContact: boolean = false;
  existsEmail: boolean = false;
  existsAddress: boolean = false;
  existsPostulation: boolean = false;
  currentAdmissionPeriod: any;

  zoom = 18;
  async ngOnInit(){
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
    let resultPerson: any = await this.Common.getPersonByDocumentNumber(this.userId.substr(1)).toPromise();
    this.currentAdmissionPeriod = await this.Administrative.getCurrentAdmissionPeriod().toPromise();
    let postulantInfo: any = await this.Administrative.getPostulantCollegeByPersonID(resultPerson.personID).toPromise();
    if (postulantInfo) {
      console.log(postulantInfo);
      let currentPostulation: any = postulantInfo.find((p: any) => p.admissionPeriodID === this.currentAdmissionPeriod.admissionPeriodID);
      if (currentPostulation) {
        this.existsPostulation = true;
        this.contactInfoForm.disable();
      }
    }
    let resultContact: any = await this.Common.getContactByPersonID(resultPerson.personID).toPromise();
    console.log(resultContact);
    let resultPhone: any = await this.Common.getPhoneByPersonId(resultPerson.personID).toPromise();

    let resultEmail: any = await this.Common.getEmailStudent(resultPerson.personID).toPromise();

    let resultAddress: any = await this.Common.getAddressInformation(resultPerson.personID).toPromise();
    console.log(resultAddress);
    console.log(resultEmail);
    console.log(resultPhone);
    console.log(resultPerson);

    if (resultPerson) {
      
      this.contactInfoForm.controls['personId'].patchValue(resultPerson.personID);
      this.contactInfoForm.controls['email'].patchValue(resultPerson.email);
      this.contactInfoForm.controls['emailDesc'].patchValue(resultPerson.emailDesc);
      this.contactInfoForm.controls['countryID'].patchValue(resultPerson.countryID);
      this.contactInfoForm.controls['provinceID'].patchValue(resultPerson.provinceID);
      this.selectProvince();
      this.contactInfoForm.controls['cantonID'].patchValue(resultPerson.cantonID);
      this.getParishesByCanton();
      this.contactInfoForm.controls['celularPhone'].patchValue(resultPerson.celularPhone);
      this.contactInfoForm.updateValueAndValidity();
    }

    if (resultAddress) {
      resultAddress.addressDesc = resultAddress.mainStreet;
      this.existsAddress = true;
      this.contactInfoForm.controls['parishID'].patchValue(resultAddress.parishID);
      this.contactInfoForm.controls['addressDesc'].patchValue(resultAddress.addressDesc);
      this.contactInfoForm.controls['addressFloorNumber'].patchValue(resultAddress.addressFloorNumber);
      this.contactInfoForm.controls['secondaryStreet_1'].patchValue(resultAddress.secondaryStreet_1);
      this.contactInfoForm.controls['secondaryStreet_2'].patchValue(resultAddress.secondaryStreet_2);
      this.contactInfoForm.controls['addressReferences'].patchValue(resultAddress.addressReferences);
      this.contactInfoForm.updateValueAndValidity();
    }

    if (resultEmail.length) {
      this.existsEmail = true;
      this.contactInfoForm.controls['emailDesc'].patchValue(`${resultEmail[0].emailDesc}`.toLowerCase());
      this.contactInfoForm.updateValueAndValidity();
    }
    if (resultPhone) {
      this.existsPhone = true;
      this.contactInfoForm.controls['phoneTypeID'].patchValue(resultPhone.phoneTypeID);
      this.contactInfoForm.controls['operatorID'].patchValue(resultPhone.operatorID);
      this.contactInfoForm.controls['numberPhone'].patchValue(resultPhone.numberPhone);
      this.contactInfoForm.controls['numberReferences'].patchValue(resultPhone.numberReferences);
      this.contactInfoForm.updateValueAndValidity();
    }
    if (resultContact) {
      this.existsContact = true;
      this.contactInfoForm.controls['contactFullName'].patchValue(resultContact.contactFullName);
      this.contactInfoForm.controls['relationShipID'].patchValue(resultContact.relationShipID);
      this.contactInfoForm.controls['contactPhone'].patchValue(resultContact.contactPhone);
      this.contactInfoForm.controls['contactAddress'].patchValue(resultContact.contactAddress);
      this.contactInfoForm.updateValueAndValidity();
    }
    
    // let resultContactPerson: any = await this.Common.getCon
    this.Common.charging();
    setTimeout(() => {
      Swal.close();
      this.getPhoneTypes();
      this.getCellphoneOperators();
      this.getRelationShips();
      this.getCountries();
      this.getProvinces();
    }, 1000);
  }

  async getProvinces() {
    this.provinces = await this.Common.cargaCombo(6).toPromise();
  }

  async getPhoneTypes() {
    let result: any = await this.Common.getPhoneTypes().toPromise();
    this.phoneTypes = result.filter((p: PhoneType) => p.phoneTypeID !== 1);
  }

  async getCellphoneOperators() {
    let result: any = await this.Common.getCellphoneOperators().toPromise();
    console.log(result);
    this.cellphoneOperators = result.filter((i: OperatorsCellular) => i.operatorID !== 1);
  }

  async getRelationShips() {
    let result: any = await this.Common.getRelationShips().toPromise();
    console.log(result);
    this.relationShips = result;
  }

  async getCountries() {
    let result: any = await this.Common.getCountries().toPromise();
    this.countries = result;
  }

  async getParishesByCanton() {
    if (this.contactInfoForm.get('cantonID').value) {
      this.parishes = await this.Common.getParishByCanton(8, this.contactInfoForm.get('cantonID').value).toPromise();
      console.log(this.parishes);
      if (this.existsPostulation) {
        this.contactInfoForm.controls['parishID'].disable();  
      } else {
        this.contactInfoForm.controls['parishID'].enable();
      }
    } else {
      this.contactInfoForm.controls['parishID'].disable();
    }
  }

  async selectProvince() {
    if (this.contactInfoForm.get('provinceID').value) {
      this.cantons = await this.Common.getCantonByProvince(7, this.contactInfoForm.get('provinceID').value).toPromise();
      if (this.existsPostulation) {
        this.contactInfoForm.controls['cantonID'].disable();  
      } else {
        this.contactInfoForm.controls['cantonID'].enable();
      }
      
    } else {
      this.contactInfoForm.controls['cantonID'].disable();
    }
  }

  async toContinue() {
    console.log(this.contactInfoForm.value);
    let dataContact: any = JSON.parse(JSON.stringify(this.contactInfoForm.value));
    dataContact.statusID = 1;
    dataContact.emailTypeID = 1;
    dataContact.userCreated = 'MIGRA';
    dataContact.userOrigin = 'ec2_user';
    dataContact.sequenceNro = 1;
    dataContact.version = 1;
    dataContact.streetTypeID = 1;
    dataContact.zoneID = 1;
    dataContact.addressTypeID = 1;
    dataContact.personID = dataContact.personId;
    // dataContact.addressDesc = 'Sin Dirección';
    let bodyContact:any = {};
    let bodyPhone: any = {};
    let bodyEmail: any = {};
    let bodyAddress: any = {};

    let resultAddress: any;
    if (!this.existsAddress) {
      bodyAddress.news = [dataContact];
      resultAddress = await this.Common.saveAddressJSON(bodyAddress).toPromise();
    } else {
      bodyAddress.updates = [dataContact];
      resultAddress = await this.Common.updateAddressJSON(bodyAddress).toPromise();
    }

    let resultEmail: any;
    if (!this.existsEmail) {
      bodyEmail.news = [dataContact]
      resultEmail = await this.Common.saveEmailJSON(bodyEmail).toPromise();
    } else {
      bodyEmail.updates = [dataContact]
      resultEmail = await this.Common.updateEmailJSON(bodyEmail).toPromise();
    }
    let resultContact: any;
    if (!this.existsContact) {
      bodyContact.news = [dataContact];
      resultContact = await this.Common.saveContactJSON(bodyContact).toPromise();
    } else {
      bodyContact.updates = [dataContact];
      resultContact = await this.Common.updateContactJSON(bodyContact).toPromise();
    }
    let resultPhone: any;
    if (!this.existsPhone) {
      bodyPhone.news = [dataContact];
      resultPhone = await this.Common.savePhoneJSON(bodyPhone).toPromise();
    } else {
      bodyPhone.updates = [dataContact];
      resultPhone = await this.Common.updatePhoneJSON(bodyPhone).toPromise();
    }
    console.log(resultPhone);

    this.Router.navigate([`/inscripcion/informacion-de-discapacidad/${this.userId}`]);
  }

  onlyletters(e: any) {
    onlyLetters(e);
  }

  alphaNumeric(e: any) {
    alphaNumeric(e);
  }

  onlyNumbers(e: any) {
    onlyNumbers(e);
  }

  // addMarker(event: any) {
  //   if (!this.existsPostulation) {
  //     console.log(event);
  //     console.log(event.latLng.lat());
  //     console.log(event.latLng.lng());
  //     if (event.latLng != null) this.markerPositions = [event.latLng.toJSON()];
  //     this.contactInfoForm.controls['latitude'].patchValue(event.latLng.lat());
  //     this.contactInfoForm.controls['altitude'].patchValue(event.latLng.lng());
  //     this.contactInfoForm.updateValueAndValidity();
  //   }
  // }

}
