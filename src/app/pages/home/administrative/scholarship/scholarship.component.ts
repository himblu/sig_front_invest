import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AdministrativeService } from '@services/administrative.service';
import { MaterialComponentModule } from 'app/material-component/material-component.module';
import { Validators } from 'ngx-editor';
import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import { ApiService } from '@services/api.service';
import { GeneralResponse } from '@utils/interfaces/calendar.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-scholarship',
  templateUrl: './scholarship.component.html',
  styleUrls: ['./scholarship.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MaterialComponentModule,
    ModalModule
  ]
})
export class ScholarshipComponent implements OnInit {
  constructor(
    private FormBuilder: FormBuilder,
    private Administrative: AdministrativeService,
    private API: ApiService,
  ) {

  }

  @ViewChild('scholarshipModal', {static: false}) scholarshipModal: ModalDirective;

  searchBecaForm: FormGroup = this.FormBuilder.group({
    textFilter: ['']
  });

  scholarships: any[] = [];
  scholarshipConfigs: any[] = [];
  scholarshipConfigFiles: any[] = [];
  scholarshipSelected: any;
  scholarshipConfigSelected: any;
  newScholarship: boolean = false;
  editScholarship: boolean = false;
  seeConfig: boolean = false;
  periods: any[] = [];
  modalities: any[] = [];
  schools: any[] = [];
  careers: any[] = [];
  fileTypes: any[] = [];

  scholarshipForm: FormGroup = this.FormBuilder.group({
    typeBecaID: [],
    typeBecaName: [''],
    typeBecaDesc: [''],
    statusID: [1],
    userCreated: ['MIGRA'],
    version: [1]
  });

  scholarshipConfigForm: FormGroup = this.FormBuilder.group({
    quantityVacancy: [0],
    typeBecaID: [],
    periodID: [''],
    modalityID: [''],
    schoolID: [''],
    careerID: [''],
    fileNumber: [1],
    fileMinimalNumber: [1,],
  });

  ngOnInit() {
    this.getScholarships();
    this.getPeriods();
    this.getModalities();
    this.getCareers();
    this.getFileTypes();
  }

  async getFileTypes() {
    let result:any = await this.Administrative.getFileTypes().toPromise();
    this.fileTypes = result;
  }

  async getCareers() {
    let result: any = await this.Administrative.getCareerAll().toPromise();
    console.log(result);
    this.schools = result;
  }

  // async getSchools() {
  //   let result: GeneralResponse = await this.Administrative.getSchools().toPromise();
  //   console.log(result);
  //   this.schools = result.data;
  // }

  async getModalities() {
    let result: any = await this.Administrative.getModalityAll().toPromise();
    console.log(result);
    this.modalities = result;
  }

  async getPeriods() {
    let result: GeneralResponse = await this.API.getPeriods().toPromise();
    console.log(result);
    this.periods = result.data;
  }

  async getScholarships() {
    let result: any = await this.Administrative.getScholarships().toPromise();
    console.log(result);
    this.scholarships = result;
  }

  async toggleScholarship(item?: any) {
    if (this.scholarshipSelected) {
      this.scholarshipSelected = undefined;
    } else {
      this.newScholarship = !item ? true : false;
      this.editScholarship = !item ? false : true;
      this.scholarshipSelected = {};
      if (item) {
        console.log(item);
        this.scholarshipSelected = JSON.parse(JSON.stringify(item));
        this.scholarshipSelected.editing = true;
        this.scholarshipForm.controls['typeBecaID'].patchValue(item.typeBecaID);
        this.scholarshipForm.controls['typeBecaName'].patchValue(item.typeBecaName);
        this.scholarshipForm.controls['typeBecaDesc'].patchValue(item.typeBecaDesc);
        this.scholarshipForm.controls['statusID'].patchValue(item.statusID);
        this.scholarshipForm.updateValueAndValidity();
        this.getScholarshipConfig();
      }
    }
  }
  

  selectSchool() {
    console.log(this.scholarshipConfigForm.value);
    console.log(this.scholarshipConfigForm.controls['schoolID'].value);
    let schoolSelected: any = this.schools.find((s: any) => this.scholarshipConfigForm.controls['schoolID'].value);
    console.log(schoolSelected);
    this.careers = schoolSelected.careers;
    this.scholarshipConfigForm.controls['careerID'].enable();
    this.scholarshipConfigForm.updateValueAndValidity();
  }

  async getScholarshipConfig() {
    let result: any = await this.Administrative.getScholarshipConfigs().toPromise();
    console.log(result);
    console.log(this.scholarshipSelected);
    this.scholarshipConfigs = result.filter((b: any) => b.typeBecaID === this.scholarshipSelected.typeBecaID);
  }

  async saveScholarship() {
    console.log();
    if (this.scholarshipSelected.editing) {
      let body: any = {
        updates: [this.scholarshipForm.value]
      };

      let result: any = await this.Administrative.updateScholarship(body).toPromise();
      console.log(result);
    } else {

      let body: any = {
        news: [this.scholarshipForm.value]
      };

      let result: any = await this.Administrative.saveScholarship(body).toPromise();
      console.log(result);
      this.scholarshipSelected = undefined;
      Swal.fire({
        text: 'Se creo correctamente la Beca',
        icon: 'success'
      });
      this.getScholarships();
    }
  }

  async toggleScholarshipConfig(scholarshipConfig?: any) {
    if (this.scholarshipModal.isShown) {
      this.scholarshipModal.hide();
    } else {
      this.scholarshipModal.show();
      this.scholarshipModal.config.keyboard = false;
      this.scholarshipModal.config.ignoreBackdropClick = true;
      this.scholarshipConfigSelected = {};
      this.scholarshipConfigForm.controls['careerID'].disable();
      console.log(this.scholarshipSelected);
      this.scholarshipConfigForm.controls['typeBecaID'].patchValue(this.scholarshipSelected.typeBecaID);
      if (scholarshipConfig) {
        this.scholarshipConfigSelected = JSON.parse(JSON.stringify(scholarshipConfig));
        this.getScholarshipConfigFiles();
        this.scholarshipConfigSelected.editing = true;
        this.scholarshipConfigForm.controls['becaConfigID'].patchValue(scholarshipConfig.becaConfigID);
        this.scholarshipConfigForm.controls['quantityVacancy'].patchValue(scholarshipConfig.quantityVacancy);
        this.scholarshipConfigForm.controls['typeBecaID'].patchValue(scholarshipConfig.typeBecaID);
        this.scholarshipConfigForm.controls['periodID'].patchValue(scholarshipConfig.periodID);
        this.scholarshipConfigForm.controls['modalityID'].patchValue(scholarshipConfig.modalityID);
        this.scholarshipConfigForm.controls['schoolID'].patchValue(scholarshipConfig.schoolID);
        this.scholarshipConfigForm.controls['careerID'].patchValue(scholarshipConfig.careerID);
        this.scholarshipConfigForm.controls['fileNumber'].patchValue(scholarshipConfig.fileNumber);
        this.scholarshipConfigForm.controls['fileMinimalNumber'].patchValue(scholarshipConfig.fileMinimalNumber);
      }
    }
  }

  
  async getScholarshipConfigFiles() {
    let result: any = await this.Administrative.getScholarshipConfigFiles().toPromise();
    this.scholarshipConfigFiles = result.filter((f: any) => f.becaCpnfigID === this.scholarshipConfigSelected.becaConfigID);
    console.log(this.scholarshipConfigFiles);
  }

  async saveScholarshipConfig() {
    console.log(this.scholarshipConfigForm.value);
    let data: any = this.scholarshipConfigForm.value;
    if (data.typeBecaID) {
      let body: any = {
        news: [this.scholarshipConfigForm.value]
      };
      let result: any = await this.Administrative.saveScholarshipConfig(body).toPromise();
      console.log(result);
      if (!result) {
        Swal.fire({
          text: 'Ocurrio un problema.',
          icon: 'error',
        });
        return;
      }
      this.toggleScholarshipConfig();
    } else {
      this.scholarshipConfigs.push(data);
    }
  }

  toggleSelectFileType(fileType: any) {
    if (this.fileTypes.filter((f: any) => f.selected).length < this.scholarshipConfigForm.controls['fileNumber'].value) {
      fileType.selected = !fileType.selected; 
    } else {
      if (fileType.selected) {
        fileType.selected = false;
      } else {
        Swal.fire({
          text: 'Llegaste al limite de Archivos seleccionados',
          icon: 'warning'
        });
        return;
      }
    }
  }

  deleteScholarship(scholarship: any) {
    Swal.fire({
      text: '¿Estas seguro de eliminar la Beca?',
      icon: 'question',
      showCancelButton: true,
      showConfirmButton: true,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        let body: any = {
          deletes: [scholarship]
        };
        let result: any = await this.Administrative.deleteScholarship(body).toPromise();
        Swal.fire({
          text: 'Se elimino el Tipo de Beca',
          icon: 'success'
        });
        this.getScholarships();
      }
    })
  }
}
