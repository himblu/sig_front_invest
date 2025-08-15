import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { Disability } from '@utils/interfaces/others.interfaces';
import * as moment from 'moment';

@Component({
  selector: 'app-disability-info',
  templateUrl: './disability-info.component.html',
  styleUrls: ['./disability-info.component.css']
})
export class DisabilityInfoComponent implements OnInit {
  constructor(
    private Common: CommonService,
    private FormBuilder: FormBuilder,
    private ActivatedRoute: ActivatedRoute,
    private Router: Router,
    private Administrative: AdministrativeService
  ) {

  }

  disabilityInfoForm: FormGroup = this.FormBuilder.group({
    personID: ['', Validators.required],
    statusID: [1],
    disabilityID: ['', Validators.required],
    disabilityPersonID: [],
    percentageDisability: ['', Validators.required],
    commentary: ['', Validators.required],
    sequenceNro: []
  });

  hasDisability: boolean = false;
  existsDisability: boolean = false;
  existsPostulation: boolean = false;
  disabilities: Disability[] = [];
  userId: any;
  currentAdmissionPeriod: any;
  async ngOnInit() {
    let params: any = this.ActivatedRoute.snapshot.params;
    this.userId = params.userId;
    let resultPerson: any = await this.Common.getPersonByDocumentNumber(this.userId.substr(1)).toPromise();
    console.log(resultPerson);
    this.currentAdmissionPeriod = await this.Administrative.getCurrentAdmissionPeriod().toPromise();
    let postulantInfo: any = await this.Administrative.getPostulantCollegeByPersonID(resultPerson.personID).toPromise();
    if (postulantInfo) {
      console.log(postulantInfo);
      let currentPostulation: any = postulantInfo.find((p: any) => p.admissionPeriodID === this.currentAdmissionPeriod.admissionPeriodID);
      if (currentPostulation) {
        this.existsPostulation = true;
        this.disabilityInfoForm.disable();
      }
    }

    this.disabilityInfoForm.controls['personID'].patchValue(resultPerson.personID);
    let resultDisability: any = await this.Common.getStudentDisability(resultPerson.personID).toPromise();
    console.log(resultDisability);
    if (resultDisability.length) {
      this.existsDisability = true;
      this.disabilityInfoForm.controls['disabilityID'].patchValue(resultDisability[0].disabilityID);
      this.disabilityInfoForm.controls['percentageDisability'].patchValue(resultDisability[0].percentageDisability);
      this.disabilityInfoForm.controls['commentary'].patchValue(resultDisability[0].commentary);
      this.disabilityInfoForm.controls['disabilityPersonID'].patchValue(resultDisability[0].disabilityPersonID);
      this.disabilityInfoForm.controls['sequenceNro'].patchValue(resultDisability[0].sequenceNro);
      this.disabilityInfoForm.updateValueAndValidity();
      
    }
    console.log(this.disabilityInfoForm.value);
    this.hasDisability = resultDisability.length > 0;
    this.getDisabilities();
  }

  toggleDisability() {
    this.hasDisability = !this.hasDisability;
  }

  async getDisabilities() {
    let result: any = await this.Common.getDisabilities().toPromise();
    this.disabilities = result;
  }

  async toContinue() {
    if (!this.existsPostulation) {
      let data: any = JSON.parse(JSON.stringify(this.disabilityInfoForm.value));
      data.statusID = 1;
      data.userCreated = 'MIGRA';
      console.log('AQUI');
      data.dateCreated = moment();
      data.version = 1;
      // data.sequenceNro = 1;
      let body: any = {};
      let result: any;
      if (this.disabilityInfoForm.get('disabilityID').value) {
        if (!this.existsDisability) {
          body.news = [data];
          result = await this.Common.saveDisabilityPersonJSON(body).toPromise();
          // data.sequenceNro++;
        } else {
          body.updates = [data];
          result = await this.Common.updateDisabilityPersonJSON(body).toPromise();
        }
      }
      this.Router.navigate([`inscripcion/informacion-academica/${this.userId}`]);
      console.log(result);
    } else {
      this.Router.navigate([`inscripcion/informacion-academica/${this.userId}`]);
    }
  }

  updateDisability() {
    this.disabilityInfoForm.controls['percentageDisability'].patchValue(this.disabilityInfoForm.get('percentageDisability').value);
    this.disabilityInfoForm.updateValueAndValidity();
  }

}
