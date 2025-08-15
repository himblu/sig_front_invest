import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { GeneralResponse, Modality } from '@utils/interfaces/calendar.interface';
import { CareerList, School } from '@utils/interfaces/campus.interfaces';
import { Country } from '@utils/interfaces/others.interfaces';
import { Campus } from '@utils/interfaces/period.interfaces';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Validators } from 'ngx-editor';
import { Observable, map, startWith } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-academic-info',
  templateUrl: './academic-info.component.html',
  styleUrls: ['./academic-info.component.css']
})
export class AcademicInfoComponent implements OnInit {
  constructor(
    private Administrative: AdministrativeService,
    private FormBuilder: FormBuilder,
    private ActivatedRoute: ActivatedRoute,
    private Router: Router,
    private Common: CommonService
  ) {

  }

  @ViewChild('collegeModal', {static: false}) collegeModal: ModalDirective;
  

  modalities: Modality[] = [];
  schools: any[] = [];
  careers: CareerList[] = [];
  allCareers: any[] = [];
  scholarships: any[] = [];
  allCollegeTypes: any[] = [];
  collegeTypes: any[] = [];
  campus: Campus[] = [];
  countries: Country[] = [];
  colleges: any[] = [];
  collegesFiltereds: any[] = [];
  admissionModes: any[] = [];
  currentAdmissionPeriod: any;
  newPostulant: any = {
    studyPlanID: 1,
    levelID: 1,
    testID: 1,
    puntaje: 0,
    statusAdmitted: 0
  };
  academicInfoForm: FormGroup = this.FormBuilder.group({
    branchID: [, Validators.required],
    modalityID: [, Validators.required],
    schoolID: [''],
    careerID: [{value: '', disabled: true}, Validators.required],
    collegeTypeID: [],
    collegeID: [],
    collegeTypeName: [],
    degreeTitle: [, Validators.required],
    countryID: [59],
    bachalorExtern: [],
    foreignBachelor: [],
    degreeScore: [, Validators.required],
    conductScore: [],
    yearGetDegree: [, Validators.required],
    studentGrant: [false],
    workingDayID: [],
    studyPlanID: []
  });

  collegeForm: FormGroup = this.FormBuilder.group({
    collegeName: [],
    countryID: [],
    collegeTypeID: [],
    userCreated: ['MIGRA']
  });

  userId: any;

  myControl = new FormControl('');
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions: Observable<string[]>;
  currentYear: any;
  allWorkingDays: any[] = [];
  workingDays: any[] = [];
  haveWorkDay: boolean = false;

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.collegesFiltereds.map((o: any) => o.collegeName).filter(option => option.toLowerCase().includes(filterValue));
  }


  ngOnInit() {
    Swal.fire({
      html: '<i class="fa fa-cog fa-spin fa-3x"></i> <br> <h2 class="text-center">Buscando Información del Postulante.</h2>',
      showConfirmButton: false,
      showCancelButton: false,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    });
    let params: any = this.ActivatedRoute.snapshot.params;
    this.userId = params.userId;
    this.currentYear = moment().year();
    this.academicInfoForm.controls['yearGetDegree'].patchValue(this.currentYear);
    this.academicInfoForm.updateValueAndValidity();
    console.log(this.currentYear);
    this.Common.charging();
    setTimeout(() => {
      this.getInitialData();
    }, 2000);
  }

  async getInitialData() {

    let resultPerson: any = await this.Common.getPersonByDocumentNumber(this.userId.substr(1)).toPromise();
    console.log(resultPerson);
    this.newPostulant.personID = resultPerson.personID;
    this.newPostulant.PersonID = resultPerson.personID;
    this.campus = await this.Administrative.getAllCampuses().toPromise();
    console.log(this.campus);

    this.countries = await this.Common.getCountries().toPromise();
    console.log(this.countries);
    this.countries = this.countries.filter((c: any) => c.countryID !== 59);
    let resultModalities: any = await this.Administrative.getModalityAll().toPromise();
    console.log(resultModalities);
    this.modalities = resultModalities;
    
    let resultCareers: any = await this.Administrative.getCareerAllWithAdmissionCurrentNoGrouped().toPromise();
    console.log(resultCareers);
    this.allCareers = resultCareers;
    
    let resultSchools: any = await this.Administrative.getCareerAllWithAdmissionCurrent().toPromise();
    console.log(resultSchools);
    this.schools = resultSchools;

    let resultScholarships: any =  await this.Administrative.getScholarships().toPromise();
    console.log(resultScholarships);
    this.scholarships = resultScholarships;

    let resultCollegeTypes: GeneralResponse = await this.Administrative.getCollegeType(1,10).toPromise();
    console.log(resultCollegeTypes);
    this.allCollegeTypes = resultCollegeTypes.data;
    this.collegeTypes = resultCollegeTypes.data;
    this.colleges = [];

    let resultAcademicMode: any = await this.Administrative.getAdmissionModeByIDNameLevel().toPromise();
    console.log(resultAcademicMode);
    this.admissionModes = resultAcademicMode;

    let resultCurrentAdmissionPeriod: any = await this.Administrative.getCurrentAdmissionPeriod().toPromise();
    this.currentAdmissionPeriod = resultCurrentAdmissionPeriod;
    this.newPostulant.admissionPeriodID = this.currentAdmissionPeriod.admissionPeriodID;

    let resultPostulations: any = await this.Administrative.getPostulantByPersonIDAndLevelID(resultPerson.personID, this.newPostulant.levelID).toPromise();
    console.log(resultPostulations);
    if (resultPostulations.length) {
      let resultPostulantCollege: any = await this.Administrative.getPostulantCollegeByPersonID(resultPerson.personID).toPromise();
      let postulantCollegeOfCurrentAdmissionPeriodID = resultPostulantCollege.find((p: any) => p.admissionPeriodID === this.currentAdmissionPeriod.admissionPeriodID);

      console.log(resultPostulantCollege);

      this.newPostulant = resultPostulations.find((p: any) => p.admissionPeriodID === this.currentAdmissionPeriod.admissionPeriodID);
      this.newPostulant = Object.assign(this.newPostulant, postulantCollegeOfCurrentAdmissionPeriodID);

      console.log('Buscar postulaciones con el periodo Admision actual');
      console.log(this.newPostulant);
      this.newPostulant.editing = true;
      this.academicInfoForm.controls['branchID'].patchValue(this.newPostulant.branchID);
      this.academicInfoForm.controls['modalityID'].patchValue(this.newPostulant.modalityID);
      this.academicInfoForm.controls['workingDayID'].patchValue(this.newPostulant.workingDayID);
      this.academicInfoForm.controls['schoolID'].patchValue(this.newPostulant.schoolID);
      this.academicInfoForm.controls['studentGrant'].patchValue(this.newPostulant.studentGrant);
      this.selectSchool();
      this.academicInfoForm.controls['schoolID'].enable();
      this.academicInfoForm.controls['careerID'].patchValue(this.newPostulant.careerID);
      this.academicInfoForm.controls['careerID'].enable();
      this.academicInfoForm.controls['degreeTitle'].patchValue(this.newPostulant.degreeTitle);
      this.academicInfoForm.controls['collegeTypeID'].patchValue(this.newPostulant.collegeTypeID);
      this.academicInfoForm.controls['foreignBachelor'].patchValue(this.newPostulant.foreignBachelor);
      this.academicInfoForm.controls['countryID'].patchValue(this.newPostulant.countryID);
      this.filterCollegeType();
      this.academicInfoForm.controls['degreeScore'].patchValue(this.newPostulant.degreeScore);
      this.academicInfoForm.controls['conductScore'].patchValue(this.newPostulant.conductScore);
      this.academicInfoForm.controls['yearGetDegree'].patchValue(this.newPostulant.yearGetDegree);
      this.academicInfoForm.updateValueAndValidity();
      this.academicInfoForm.disable();
    }

    let result: any = await this.Administrative.getWorkingDaysByModality2(1).toPromise();
    let workings: any = [1,4];
    this.allWorkingDays = result.filter((r: any) => workings.includes(r.workingOrModuleID));
    console.log(this.allWorkingDays);
    // this.workingDays = result.filter((r: any) => workings.includes(r.workingOrModuleID));
    Swal.close();
  }

  selectModality() {
    if (this.academicInfoForm.get('modalityID').value) {
      this.academicInfoForm.controls['workingDayID'].patchValue('');
      this.academicInfoForm.controls['schoolID'].patchValue('');
      // this.academicInfoForm.controls['schoolID'].patchValue('');
      // this.academicInfoForm.controls['schoolID'].enable();
      this.academicInfoForm.controls['careerID'].patchValue('');
      this.academicInfoForm.controls['careerID'].enable();
      this.careers = this.allCareers.filter((c: any) => c.modalityID === this.academicInfoForm.get('modalityID').value);
      console.log(this.careers);
      this.workingDays = this.allWorkingDays.filter((w: any) => this.careers.map((c: any) => c.workingDayID).includes(w.workingOrModuleID)) ;
      console.log(this.workingDays);
      let admisionModeSelected = this.admissionModes.find((a: any) => a.admissionPeriodID === this.currentAdmissionPeriod.admissionPeriodID && a.modalityID === this.academicInfoForm.get('modalityID').value);
      console.log(admisionModeSelected);
      this.newPostulant.admissionModeID = admisionModeSelected.admissionModeID;
      this.haveWorkDay = this.workingDays.length > 0;
      if (!this.haveWorkDay) {
        this.academicInfoForm.controls['workingDayID'].patchValue('');
      }
    }
  }

  selectWorkingDay() {
    this.careers = [];
    this.academicInfoForm.controls['careerID'].patchValue('');
    if (this.academicInfoForm.get('workingDayID').value) {
      this.careers = this.allCareers.filter((c: any) => c.modalityID === this.academicInfoForm.controls['modalityID'].value && c.workingDayID === this.academicInfoForm.get('workingDayID').value);
    }
  }

  async selectSchool() {
    console.log(this.academicInfoForm.get('schoolID').value);
    if (this.academicInfoForm.get('schoolID').value) {
      console.log('MAASDASd');
      let schoolSelected: any = this.schools.find(school => school.schoolID === this.academicInfoForm.get('schoolID').value);
      console.log(schoolSelected);
      if (schoolSelected) {
        this.careers = schoolSelected.careers;
        this.academicInfoForm.controls['careerID'].patchValue(this.newPostulant.careerID);
        this.academicInfoForm.controls['careerID'].enable();
      }
    }
  }

  selectCareer() {
    
    if (this.academicInfoForm.get('careerID').value) {
      let careerFound: any = this.allCareers.find((c: any) => c.careerID === this.academicInfoForm.get('careerID').value && c.modalityID === this.academicInfoForm.controls['modalityID'].value);
      if (careerFound) {
        console.log(careerFound);
        this.academicInfoForm.controls['schoolID'].patchValue(careerFound.schoolID);
        this.academicInfoForm.controls['studyPlanID'].patchValue(careerFound.studyPlanID);
      }
    }
  }

  async filterCollegeType() {
    this.collegesFiltereds = [];
    this.myControl.patchValue('');
    this.myControl.disable();
    if (this.academicInfoForm.get('bachalorExtern').value) {
      this.collegeTypes = this.allCollegeTypes.filter((c: any) => c.collegeTypeID === 5);
    } else {
      this.collegeTypes = this.allCollegeTypes.filter((c: any) => c.collegeTypeID !== 5);
    }
    if (this.academicInfoForm.get('collegeTypeID').value) {
      let result = await this.Administrative.getCollegeTypeByCountryIDAndCollegeType(0, this.academicInfoForm.get('collegeTypeID').value).toPromise();
      console.log(result);1
      this.collegesFiltereds = result;
      this.filteredOptions = this.myControl.valueChanges.pipe(
        startWith(''),
        map(value => this._filter(value || '')),
      );
      console.log(this.collegesFiltereds);
      if (this.newPostulant.editing) {
        console.log(this.newPostulant);
        console.log(this.collegesFiltereds);
        let collegeSelected: any = this.collegesFiltereds.find((c: any) => c.collegeID === this.newPostulant.collegeID);
        if (collegeSelected) {
          this.academicInfoForm.controls['countryID'].patchValue(collegeSelected.countryID);
          this.academicInfoForm.controls['bachalorExtern'].patchValue(collegeSelected.countryID !== 59);
          this.myControl.patchValue(collegeSelected.collegeName);
        }
      } else {
        console.log("this.academicInfoForm.get('countryID').value");
        console.log(this.academicInfoForm.get('countryID').value);
        if (!this.academicInfoForm.get('bachalorExtern').value) {
          this.academicInfoForm.controls['countryID'].patchValue(59);
        }
        if (this.academicInfoForm.get('countryID').value) {
          this.collegesFiltereds = this.collegesFiltereds.filter((c: any) => c.countryID == this.academicInfoForm.get('countryID').value);
        } else {
          this.collegesFiltereds = [];
        }
      }
      if (this.newPostulant.editing) {
        this.myControl.disable();
      } else {
        this.myControl.enable();
      }
    } else {
      this.myControl.disable();
    }
  }

  toContinue() {
    if (this.newPostulant.editing) {
      this.Router.navigate([`/inscripcion/informacion-de-archivos/${this.userId}`]);
    } else {
      Swal.fire({
        text: '¿Estás seguro de continuar para GRABAR al postulante?',
        icon: 'question',
        // icon: 'quesion',
        showConfirmButton: true,
        confirmButtonColor: '#014898',
        showCancelButton: true,
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
        cancelButtonText: 'Cancelar'
      }).then(async (choice) => {
        if (choice.isConfirmed) {
          let data: any = this.academicInfoForm.value;
          this.newPostulant = Object.assign(this.newPostulant, data);
          this.newPostulant.userCreated = 'MIGRA';
          this.newPostulant.userOrigin = 'MIGRA';
          this.newPostulant.foreignBachelor = this.newPostulant.bachalorExtern;
          console.log(this.newPostulant);
          console.log(data);
          if (!this.myControl.value) {
            Swal.fire({
              text: 'Elija un Colegio',
              icon: 'warning'
            });
            return;
          }
          let collegeSelected: any = this.collegesFiltereds.find((c: any) => c.collegeName === this.myControl.value);
          console.log(collegeSelected);
          this.newPostulant.collegeID = collegeSelected.collegeID;
          console.log(this.newPostulant);
          let bodyPostulantCollege: any = {};
          let resultPostulantCollege: any;
          if (!this.newPostulant.editing) {
            bodyPostulantCollege.news = [this.newPostulant];
            resultPostulantCollege = await this.Administrative.savePostulantCollege(bodyPostulantCollege).toPromise();
          } else {
            bodyPostulantCollege.updates = [this.newPostulant];
            resultPostulantCollege = await this.Administrative.updatePostulantCollege(bodyPostulantCollege).toPromise();
          }
          if (!resultPostulantCollege) {
            Swal.fire({
              text: 'Hubo un error al registrar el Colegio del Postulante',
              icon: 'error'
            });
            return;
          }
          console.log(bodyPostulantCollege);
          let body: any = {};
          let resultPostulant: any;
          if (!this.newPostulant.editing) {
            body.news = [this.newPostulant];
            resultPostulant = await this.Administrative.savePostulant(body).toPromise();
          } else {
            body.updates = [this.newPostulant];
            resultPostulant = await this.Administrative.updatePostulant(body).toPromise();
          }
          console.log(body);
          if (!resultPostulant) {
            Swal.fire({
              text: 'Hubo un error',
              icon: 'error'
            });
            return;
          }
          Swal.fire({
            text: `Se ${this.newPostulant.editing ? 'actualizó' : 'guardó'} la Información Académica`,
            icon: 'success'
          });
          this.Router.navigate([`/inscripcion/informacion-de-archivos/${this.userId}`]);
        }  
      })  
    }

  }

  toggleCollege() {
    if (this.collegeModal.isShown) {
      this.collegeModal.hide();
    } else {
      this.collegeModal.config.keyboard = false;
      this.collegeModal.config.ignoreBackdropClick = true;
      this.collegeModal.show();
      this.collegeForm.controls['countryID'].patchValue(this.academicInfoForm.get('countryID').value);
      this.collegeForm.controls['collegeTypeID'].patchValue(this.academicInfoForm.get('collegeTypeID').value);
      this.collegeForm.updateValueAndValidity();
    }
  }

  async saveCollege() {
    let data = this.collegeForm.value;
    console.log(data);
    let body: any = {
      news: [data]
    };
    let result: any = await this.Administrative.saveCollege(body).toPromise();
    console.log(result);
    if (!result) {
      Swal.fire({
        text: 'Error al guardar el colegio',
        icon: 'error'
      });
      return;
    }
    Swal.fire({
      text: 'Se guardo el colegio',
      icon: 'success'
    });
    this.toggleCollege();
    this.collegesFiltereds.push(...result);
    this.myControl.patchValue(data.collegeName);
    

    // data.collegeID = this.colleges.length + 1;
    // this.colleges.push(data);
    // this.toggleCollege();
    // Swal.fire({
    //   text: 'Se grabo el colegio',
    //   icon: 'success'
    // });
    // this.academicInfoForm.controls['collegeID'].patchValue(data.collegeID);
    // this.filteredOptions = this.myControl.valueChanges.pipe(
    //   startWith(''),
    //   map(value => this._filter(value || '')),
    // );
  }

}
