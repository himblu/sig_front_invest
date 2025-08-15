import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { LoginService } from '@services/login.service';
import { GeneralResponse } from '@utils/interfaces/calendar.interface';
import { Login } from '@utils/interfaces/login.interfaces';
import { alphaNumeric, onlyLetters, onlyNumbers } from 'app/constants';
import { MaterialComponentModule } from 'app/material-component/material-component.module';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { BloodType, Canton, CivilStatus, Country, Parish, Province, Sex } from '@utils/interfaces/others.interfaces';
import { MatSelectChange } from '@angular/material/select';
import { Institution } from '@utils/interfaces/period.interfaces';

@Component({
  selector: 'app-sign-up-survey',
  templateUrl: './sign-up-survey.component.html',
  styleUrls: ['./sign-up-survey.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialComponentModule,
		MatInputModule,
		MatFormFieldModule,
		ReactiveFormsModule
  ],
	providers: [
		DatePipe,
	],
})
export class SignUpSurveyComponent implements OnInit {

  constructor(
    private Administrative: AdministrativeService,
    private Common: CommonService,
    private Login: LoginService,
    private Router: Router,
		private datePipe: DatePipe,
		private common: CommonService,
  ) {

  }

  newPerson: any = {
		provinceID: 0,
		cantonID: 0,
		parishID: 0,
	};
  documentTypes: any[] = [];
  collegeTypes: any[] = [];
  colleges: any[] = [];
  collegesFiltereds: Institution[] = [];
  filteredOptions: string[];
  currentAdmissionPeriod: any;

	public now: string= this.formattedDate(new Date);
	public bloodTypes: BloodType[] = [];
	public civilStatuses: CivilStatus[] = [];
	public sexList: Sex[] = [];
	public countries: Country[] = [];
	public provinces: Province[] = [];
	public cantons: Canton[] = [];
	public parishes : Parish[] = [];

  ngOnInit(): void {
    this.newPerson.showAnotherFields = true;
    this.loginWithGuest();
  }

  private async loginWithGuest() {
    let credentials: Login = {
      p_userName: 'invitado',
      p_userPassword: '123456',
      remember: true
    };

    let auth: any = await this.Login.login(credentials, true).toPromise();
		if(auth){
			this.Common.charging();
			setTimeout(() => {
				this.getCountries();
				this.getProvinces();
				this.getDocumentTypes();
				this.getCollegeTypes();
				this.getInstitutionsSurvey();
				this.bloodTypes = this.Common.bloodList;
				this.sexList = this.Common.sexList;
				this.civilStatuses = this.Common.civilList;
			}, 500);
		}
  }

  async getInstitutions() {
    this.collegesFiltereds = [];
    this.newPerson.collegeTypeID = undefined;
    let result: Institution[] = await this.Administrative.getInstitutionToSurvey().toPromise();
    this.collegesFiltereds = result;
    // this.collegesFiltereds.map((c: any) => {
    //   c.collegeName = c.institutionName;
    // })
  }

  async getInstitutionsSurvey() {
    this.collegesFiltereds = [];
    this.newPerson.collegeTypeID = undefined;
    let result: any = await this.Administrative.getInstitutionToSurveyCurrent().toPromise();
    this.collegesFiltereds = result;
    // this.collegesFiltereds.map((c: any) => {
    //   c.collegeName = c.institutionName;
    // })
  }

  async getDocumentTypes() {
    let result: any = await this.Common.getDocumentType().toPromise();
    // console.log(result);
    this.documentTypes = result;
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.collegesFiltereds.map((o: any) => o.collegeName).filter(option => option.toLowerCase().includes(filterValue));
  }

  async filterCollegeType() {
    this.newPerson.collegeName = undefined;
    if (this.newPerson.collegeTypeID && this.newPerson.countryID) {
      let result = await this.Administrative.getCollegeTypeByCountryIDAndCollegeType(this.newPerson.countryID, this.newPerson.collegeTypeID).toPromise();
      // console.log(result);
      this.collegesFiltereds = result;
      // console.log(this.collegesFiltereds);

    } else {
    }
  }

	public validateCountry(): void {
		if(this.newPerson.countryID === 59){
			this.newPerson.provinceID= undefined;
			this.newPerson.cantonID= undefined;
			this.newPerson.parishID= undefined;
		}else{
			this.newPerson.provinceID= 0;
			this.newPerson.cantonID= 0;
			this.newPerson.parishID= 0;
		}
	}

  filterCollege() {
    this.newPerson.error = true;
    this.newPerson.message = 'La Institución NO EXISTE. Verifique por favor.';
    if (this.newPerson.collegeName) {
      this.filteredOptions = this._filter(this.newPerson.collegeName);
    }
  }

  async getCollegeTypes() {
    let result: GeneralResponse = await this.Administrative.getCollegeType(1,20).toPromise();
    this.collegeTypes = result.data;
  }

  onlyNumbers(e: any) {
    onlyNumbers(e);
  }

  onlyLetters(e: any) {
    onlyLetters(e);
  }

  alphaNumeric(e: any) {
    alphaNumeric(e);
  }

  async toContinue() {
    Swal.fire({
      html: '<i class="fa fa-cog fa-spin fa-3x"></i> <br> <h2 class="text-center">Recopilando datos para su Registro</h2>',
      showConfirmButton: false,
      showCancelButton: false,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    });

    let userId;
    userId = `C${this.newPerson.personDocumentNumber}`;
    sessionStorage.setItem('userId', userId);
    this.newPerson.personFullName = `${this.newPerson.personMiddleName} ${this.newPerson.personLastName} ${this.newPerson.personFirstName}`;
    this.newPerson.userCreated = 'invitado';
    this.newPerson.user = 'invitado';
    this.newPerson.userID = userId;
    this.newPerson.userRol = 20;
    this.newPerson.sendMail = true;
    this.newPerson.userOrigin = 'invitado';
    this.newPerson.typePersonCode = 'N';
		this.newPerson.sendEmail = 1;
    let body: any = {
      news: [this.newPerson]
    };
    let result: any = await this.Common.savePersonJSON(body).toPromise();

		let addressBody: any = {
			personID: result[0].personID,
			streetTypeID: 1,
			zoneID: 1,
			addressTypeID: 1,
			addressDesc: this.newPerson.addressDesc,
			parishID: +this.newPerson.parishID,
			countryID: this.newPerson.countryID,
			provinceID: this.newPerson.provinceID,
			cantonID: this.newPerson.cantonID,
			user: 'MIGRA',
			addressFloorNumber: null,
			addressNro: null,
			addressReferences: null,
			secondaryStreet_1: null,
			secondaryStreet_2: null,
			description: null
		}
		let addressResult: any = await this.Common.postEnrollmentAddress(addressBody).toPromise();
		//console.log(addressResult);

		let infoBody: any = [
			{
				personID: result[0].personID,
				birthday: this.formattedDate(this.newPerson.birthday),
				bloodTypeID: this.newPerson.bloodTypeID,
				sexID: this.newPerson.sexID,
				genderID: this.newPerson.sexID,
				civilStatusID: this.newPerson.civilStatusID,
				religionID:  null,
				ethnicityID:  null,
				nationalTownID:  null,
				parishID: null,
				countryID: null,
				statusID: null,
				userCreated: 'MIGRA',
				cantonID: null,
				provinceID: null,
				suffrageplace:  null,
				placeOfBirth: null,
				foreignTitle: null,
				nationalityID: null
			}
		]
		let infoResult: any = await this.Common.savePersonInfJSON({'news': infoBody}).toPromise();
		//console.log(infoResult);

    let bodyEmail: any = {
      news: [
        {
          emailTypeID: 1,
          personID: result[0].personID,
          sequenceNro: 1,
          emailDesc: this.newPerson.personEmail,
          statusID: 1,
          userCreated: 'MIGRA',
          userOrigin: 'ec2_user',
          version: 0
        }
      ]
    };

    let resultEmail: any = await this.Common.saveEmailJSON(bodyEmail).toPromise();
    let bodyPhone: any = {
      news: [
        {
          phoneTypeID: 1,
          operatorID: 2,
          personId: result[0].personID,
          sequenceNro: 1,
          numberPhone: this.newPerson.numberPhone,
          statusID: 1,
          userCreated: 'MIGRA',
          userOrigin: 'ec2_user',
          version: 1
        }
      ]
    }
    let resultPhone: any = await this.Common.savePhoneJSON(bodyPhone).toPromise();
    let collegeSelected: any;
    if (this.newPerson.isCollege) {
      collegeSelected = await this.Administrative.getCollegeByID(this.newPerson.institutionID).toPromise();
    }

    // if (!collegeSelected) {
    // }
    let bodyCollege: any = {
      news: [
        {
          admissionPeriodID: 1,
          personID: result[0].personID,
          PersonID: result[0].personID,
          sequenceNro: 1,
          collegeTypeID: this.newPerson.collegeTypeID,
          collegeID: this.newPerson.institutionID,
          degreeTitle: '',
          degreeScore: 0,
          conductScore: 0,
          yearGetDegree: 0,
          userCreated: 'MIGRA',
          userOrigin: 'ec2_user',
          version: 1
        }
      ]
    };

    let resultCollege: any = await this.Administrative.savePostulantCollege(bodyCollege).toPromise();


    // return;
    // Asignación de Encuestas
    // let surveys: any = await this.Administrative.getSurveys().toPromise();
    // surveys = surveys.filter((s: any) => s.statusID === 1);

    // Modificar para el caso de colegios
    let assignments: any = await this.Administrative.getInstitutionAssignmentSurvey().toPromise();
    let assignmentsFounds: any = assignments.filter((a: any) => a.institutionID === this.newPerson.institutionID && a.statusID === 1);
    let surveys: any = assignmentsFounds;


    let resultCurrentAdmissionPeriodID: any = await this.Administrative.getCurrentAdmissionPeriod().toPromise();
    // console.log(resultCurrentAdmissionPeriodID);

    this.currentAdmissionPeriod = resultCurrentAdmissionPeriodID;

    let bodyAssign: any = {
      news: surveys.map((s: any) => {
        return {
          personID: result[0].personID,
          attempsNumbers: 1,
          surveyID: s.surveyID,
          periodID: this?.currentAdmissionPeriod===null ? null : this?.currentAdmissionPeriod.admissionPeriodID,
          statusID: 1
        };
      })
    };
    let resultAssign: any = await this.Administrative.saveSurveyConfig(bodyAssign).toPromise();

    if (!result) {
      Swal.fire({
        text: 'Hubo un problema',
        icon: 'error'
      });
      return;
    }

    // console.log(result);
    // console.log('../../inscripcion/informacion-personal/I1050098639');
    Swal.close();
    Swal.fire({
      title: '¡Completado!',
      text: 'Se ha culminado el Proceso Inicial de Registro. Se han enviado las credenciales a tu correo para continuar con este proceso.',
      icon: 'success',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      showConfirmButton: true,
      showCancelButton: false
    }).then((choice) => {
      if (choice.isConfirmed) {
        this.logout();
      }
    });
  }

  async validateDocument() {
    let result: any = await this.Common.getPersonByDocumentNumber(this.newPerson.personDocumentNumber).toPromise();
    // console.log(result);
    if (result && result.typeDocId === this.newPerson.typeDocId) {
      Swal.fire({
        text: 'Ya existe la persona con ese Tipo de Documento y Numero de Documento',
        icon: 'warning',
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
        showConfirmButton: true,
        showCancelButton: false
      }).then((choice) => {
        if (choice.isConfirmed) {
          this.newPerson.personDocumentNumber = undefined;
        }
      });
      return;
    }
  }

  toggleIsCollege() {
    this.newPerson.isCollege = !this.newPerson.isCollege;
    if (!this.newPerson.isCollege) {
      this.getInstitutions();
    }
  }

  selectInstitution() {
    if (this.newPerson.institutionID) {
      let collegeSelected: any = this.collegesFiltereds.find((c: any) => c.institutionID === this.newPerson.institutionID);
			console.log(collegeSelected);
      if (collegeSelected) {
				this.newPerson.collegeTypeID = collegeSelected.collegeTypeID;
        this.newPerson.isCollege = collegeSelected.isCollege === 1;
      }
    }
  }

	private getCountries(): void {
		this.Common.getCountries().subscribe({
			next: (res: Country[]) => {
				this.countries = res;
			}
		});
	}

	public getProvinces(countryID: number = 6): void {
		this.Common.cargaCombo(countryID).subscribe({
			next: (res: Province[]) => {
				this.provinces = res;
			}
		});
	}

	public getCantons(): void {
		this.Common.getCantonByProvince(7, this.newPerson.provinceID).subscribe({
			next: (res: Canton[]) => {
				this.cantons = res;
			}
		});
	}

	public getParish(): void {
		this.Common.getParishByCanton(8, this.newPerson.cantonID).subscribe({
			next: (res: Parish[]) => {
				this.parishes = res;
			}
		});
	}

	private formattedDate(date: Date): string {
		return <string>this.datePipe.transform(date, 'yyyy-MM-dd');
	}

	public logout(): void{
		this.common.logout();
	}

}
