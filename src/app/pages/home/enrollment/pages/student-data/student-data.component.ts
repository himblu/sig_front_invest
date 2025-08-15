import { OperatorsCellular } from './../../../../../utils/interfaces/others.interfaces';
import { Component, OnInit, EventEmitter, Output, Directive } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { OnDestroyMixin, untilComponentDestroyed } from "@w11k/ngx-componentdestroyed";
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { SPGetPerson, SPGetPerson2 } from '@utils/interfaces/person.interfaces';
import { BloodType, CivilStatus, Disability, Etnia, Gender, Identity, NationalTowns, Nationality, Sex, ValidateStatus } from '@utils/interfaces/others.interfaces';
import { CommonService } from '@services/common.service';
import { Router } from '@angular/router';
import { LoginService } from '@services/login.service';
import { Consulta } from '@utils/interfaces/cedula.interfaces';
import { ComboComponent } from '../components/combo/combo.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { MaxValueDirective } from './directives/MaxValueDirective';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-student-data',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatIconModule,
    MatInputModule,
    MatNativeDateModule,
    MatSelectModule,
    MatTooltipModule,
    MatCheckboxModule,
    NgxMaskDirective,
    MatSlideToggleModule,
    ComboComponent,
    MatSnackBarModule,
  ],
  templateUrl: './student-data.component.html',
  styleUrls: ['./student-data.component.css'],
  providers: [
    DatePipe,
    provideNgxMask(),
    ComboComponent,
    MaxValueDirective
  ]
})


export class StudentDataComponent extends OnDestroyMixin implements OnInit {



  /* *************************************** INPUTS & OUTPUTS ***************************************** */

  @Output() validForm: EventEmitter<boolean> = new EventEmitter();
  @Output() idPerson: EventEmitter<number> = new EventEmitter();
  /* *************************************** ---------------- ***************************************** */


  /* ************************************ LISTAS GETTERS SETTERS ************************************** */

  /* *********************************** ------------------ ******************************************* */


  /* *********************************** VARIABLES GLOBALES ******************************************* */

  testPattern = {
    S: { pattern: new RegExp('[A-Za-z0-9]') },
  };
  phone = {
    S: { pattern: new RegExp('[+0-9]') },
  };

  cargando: boolean = false;
  consultation!: Consulta;
  disability: boolean = false;
  person!: SPGetPerson;
  nationalTownsList: NationalTowns[] = [];
  province: string = '';
  canton: string = '';
  parish: string = '';
  operatorsList: OperatorsCellular[] = [];
  checkIfShowCombo: boolean = false;
  formState: FormGroup;
  personInformation: any;
  /* *********************************** ------------------ ******************************************* */


  /* *********************************** COSTRUCTOR Y CICLO DE VIDA *********************************** */

  constructor(private common: CommonService,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private login: LoginService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
    super();
    // this.dateAdapter.setLocale('en-GB'); //dd/MM/yyyy
  }

  ngOnInit(): void {

    this.loadParams();

    this.loading();

    this.changeEtnia();
  }
  /* *********************************** -------------------------- *********************************** */


  /* *********************************** GETERS Y SETERS ********************************************** */

  get identityList(): Identity[] {
    return this.common.identityList;
  }
  get sexList(): Sex[] {
    return this.common.sexList;
  }
  get genderList(): Gender[] {
    return this.common.genderList;
  }
  get etniaList(): Etnia[] {
    return this.common.etniaList;
  }
  get bloodList(): BloodType[] {
    return this.common.bloodList;
  }
  get civilList(): CivilStatus[] {
    return this.common.civilList;
  }
  get nationalityList(): Nationality[] {
    return this.common.nationalityList;
  }
  get disabilityList(): Disability[] {
    return this.common.disabilityList;
  }
  /* *********************************** -------------------------- *********************************** */


  /* *********************************** FORMULARIOS DEL FORMULARIO *********************************** */

  personForm: FormGroup = this.fb.group({
    personID: [0],
    typeDocument: ['', [Validators.required, Validators.min(1)]],
    sexID: ['', [Validators.required, Validators.min(1)]],
    genderID: [0, [Validators.required, Validators.min(1)]],
    nationalityID: [59],
    ethnicityID: [0, [Validators.required, Validators.min(1)]],
    civilStatusID: [0, [Validators.required, Validators.min(1)]],
    bloodTypeID: ['', [Validators.required, Validators.min(1)]],
    documentNumber: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    firstName: ['', [Validators.required]],
    surname: ['', [Validators.required]],
    secondSurname: ['', [Validators.required]],
    birthday: ['', [Validators.required]],
    placeResidence: ['', [Validators.required]],
    birthPlace: ['', [Validators.required]],
    celularPhone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
    housePhone: ['', [Validators.minLength(9), Validators.maxLength(9)]],
    emergencyPhone: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(10)]],
    disabilityID: [0],
    percentageDisability: [0, [Validators.maxLength(5), Validators.max(100)]],
    cometaryDisability: [''],
    parishID: [0, [Validators.required, Validators.min(1)]],
    avatar: [''],
    userName: [''],
    countryID: [0, [Validators.required]],
    contactName: ['', [Validators.required]],
    cantonID: [0],
    contactAddress: ['', [Validators.required]],
    provinceID: [0],
    nationalTownID: [0],
    cellularOperator: [0, [Validators.required]],
		operatorName: [0, [Validators.required]],
    foreignTitle: [false],
  });


  /* *********************************** FUNCIONES VARIAS ********************************************* */

  changeEtnia() {
    this.personForm.get('ethnicityID')?.valueChanges
      .pipe(
        untilComponentDestroyed(this)
      )
      .subscribe(resp => {
        if (resp === 1) {
          this.common.getNationalTowns()
            .subscribe(nationalTowns => this.nationalTownsList = nationalTowns)
        } else {
          this.nationalTownsList = []
        }
      })
  }

  chargeInfo(person: Consulta) {
    //Primero deshabilitamos los campos que se llenan previamente, antes de realizar la consulta al Registro Civil
    //Deshabilitar cedula
    // if (this.personForm.get('identity').value !== '') {
    // 	this.personForm.get('identity').disable();
    // }
    // //Deshabilitar tipo de documento
    // if (this.personForm.get('typeDocId').value !== '') {
    // 	this.personForm.get('typeDocId').disable();
    // }
    // //Deshabilitar nombres
    // if (this.personForm.get('firstName').value !== '') {
    // 	this.personForm.get('firstName').disable();
    // }
    // //Deshabilitar primer apellido
    // if (this.personForm.get('middleName').value !== '') {
    // 	this.personForm.get('middleName').disable();
    // }
    // //Deshabilitar segundo apellido
    // if (this.personForm.get('lastName').value !== '') {
    // 	this.personForm.get('lastName').disable();
    // }
    // //Deshabilitar telefono
    // if (this.personForm.get('celularPhone').value !== '') {
    // 	this.personForm.get('celularPhone').disable();
    // }
    // //Deshabilitar email
    // if (this.personForm.get('email').value !== '') {
    // 	this.personForm.get('email').disable();
    // }

    // //Ahora verificaremos cual es la respuesta que nos envia el registro civil y segun eso, deshabilitar campos

    // //Lugar de domicilio
    // if (person.lugarDomicilio !== '') {
    // 	this.personForm.get('placeResidence')?.setValue(person.lugarDomicilio);
    // 	this.personForm.get('placeResidence').disable();
    // }

    // //sexo
    // if (person.genero === 'HOMBRE') {
    // 	this.personForm.get('sex')?.setValue(2);
    // }else {
    // 	this.personForm.get('sex')?.setValue(1);
    // }
    // this.personForm.get('sex').disable();

    // //Estado civil
    // if (person.estadoCivil === 'SOLTERO') {
    // 	this.personForm.get('civilStatus')?.setValue(1);
    // } else if (person.estadoCivil === 'CASADO'){
    // 	this.personForm.get('civilStatus')?.setValue(2);
    // } else if (person.estadoCivil === 'DIVORCIADO') {
    // 	this.personForm.get('civilStatus')?.setValue(3);
    // } else if (person.estadoCivil === 'VIUDO'){
    // 	this.personForm.get('civilStatus')?.setValue(4);
    // }
    // this.personForm.get('civilStatus').disable();

    // //Nacionalidad
    // if (person.nacionalidad === 'ECUATORIANA') {
    // 	this.personForm.get('countryID')?.setValue(59);
    // 	this.personForm.get('countryID').disable();
    // }

    // //Lugar de nacimiento
    // if (person.lugarNacimiento !== '') {
    // 	this.personForm.get('birthPlace')?.setValue(person.lugarNacimiento);
    // 	this.personForm.get('birthPlace').disable();
    // }

    // //Fecha de nacimiento
    // var splitDate = person.fechaNacimiento.split('/');
    // let dateBirthday: Date = new Date(splitDate[2] + '-' + splitDate[1] + '-' + splitDate[0]);
    // if (person.fechaNacimiento !== '') {
    // 	this.personForm.get('birthDate')?.setValue(this.formattedDate(new Date(dateBirthday)));
    // 	this.personForm.get('birthDate').disable();
    // }

    // console.log('personal information',person);

    this.personForm.get('placeResidence')?.setValue(person.calleDomicilio);
    this.personForm.get('birthPlace')?.setValue(person.lugarNacimiento);
    var split = person.nombre.split(' ');
    if (split.length === 3) {
      this.personForm.get('firstName')?.setValue(split[2]);
    } else {
      this.personForm.get('firstName')?.setValue(split[2] + ' ' + split[3]);
    }

    this.personForm.get('surname')?.setValue(split[0]);
    this.personForm.get('secondSurname')?.setValue(split[1]);
    var splitDate = person.fechaNacimiento.split('/');
    let dateBirthday: Date = new Date(splitDate[2] + '-' + splitDate[1] + '-' + splitDate[0]);

    this.personForm.get('birthday')?.setValue(this.formattedDate(new Date(dateBirthday)));
    if (person.genero === 'HOMBRE') {
      this.personForm.get('sexID')?.setValue(2)
    } else {
      this.personForm.get('sexID')?.setValue(1)
    }
    if (person.estadoCivil === 'SOLTERO') {
      this.personForm.get('civilStatusID')?.setValue(1);
    }
    else if (person.estadoCivil === 'CASADO') {
      this.personForm.get('civilStatusID')?.setValue(2);
    }
    else if (person.estadoCivil === 'DIVORCIADO') {
      this.personForm.get('civilStatusID')?.setValue(3);
    }
    else if (person.estadoCivil === 'VIUDO') {
      this.personForm.get('civilStatusID')?.setValue(4);
    }

    if (person.nacionalidad === 'ECUATORIANA') {
      this.personForm.get('countryID')?.setValue(59);
    }

  }

  private formattedDate(date: Date): string {
    return <string>this.datePipe.transform(date, 'yyyy-MM-dd');
  }

  loadParams() {
    const personID = Number(sessionStorage.getItem('id')) || 0;
    this.common.getPerson(personID)
      .subscribe((person: any) => {
        person = this.mappingInformation(person);
        this.personInformation = person;
        this.province = String(person.provinceID);
        this.canton = String(person.cantonID);
        this.parish = String(person.parishID);
        this.common.getPsychologicalTest(person.documentNumber)
          .subscribe((resp: any) => {
            if (resp.estado_general_test === null || resp.estado_general_test === 0) {
              this.common.message('Para continuar con el proceso de Matrícula debe realizar los Test Psicológicos y Encuesta', '', 'info', '#2eb4d8');
            }
            this.checkIfShowCombo = true;
          })
        this.personForm.reset(person);
      })

  }

  async loading() {
    this.cargando = true;
    await this.common.charging();
    this.cargando = false;

    this.common.getOperatorsCellular()
      .subscribe(resp => {
        this.operatorsList = resp;
      })

    const personID = Number(sessionStorage.getItem('id'));
		const studentID = Number(sessionStorage.getItem('studentID'));
    this.common.getLastState(studentID).subscribe({
      next: (resp) => {
        this.common.message(`${resp[0].msg} ${resp[0].state}`, '', 'info', '#2eb4d8');
      }
    })
  }

	reValidation(){
		Swal
    .fire({
				icon: 'question',
        title: "Tu nombre es?",
				text: this.personForm.get('firstName').value+' '+this.personForm.get('surname').value+' '+this.personForm.get('secondSurname').value,
        showCancelButton: true,
        confirmButtonText: "Si",
        cancelButtonText: "No",
    })
    .then(result => {
			if(result.value){
				this.savePerson();
			}else{
				this.personForm.get('documentNumber').enable()
				this.personForm.get('firstName').enable()
				this.personForm.get('surname').enable()
				this.personForm.get('secondSurname').enable()
				this.personForm.get('sexID').enable()
				this.personForm.get('civilStatusID').enable()
			}
    });
	}

	cellularOperator(item:any){
		this.personForm.get('cellularOperator')?.setValue(item.operatorID);
		//alert(this.personForm.get('cellularOperator').value)
	}

  savePerson() {
    this.formState.markAllAsTouched();
    if (!this.personForm.valid) {
      this.personForm.markAllAsTouched();
      this.common.message('Información Incompleta o Incorrecta', ' Revise que no existan campos en color rojo', 'error', '#f5637e');
      return;
    }
		this.personForm.get('documentNumber').enable()
		this.personForm.get('firstName').enable()
		this.personForm.get('surname').enable()
		this.personForm.get('secondSurname').enable()
		this.personForm.get('sexID').enable()
		this.personForm.get('civilStatusID').enable()

    if (this.personForm.get('disabilityID')?.value !== 0 && this.personForm.get('percentageDisability')?.value === 0) {
      this.common.message('El campo de Discapacidad esta activo', 'Por favor coloque el Porcentaje de Discapacidad para guardar los cambios', 'warning', '#d3996a');
    } else {
      const userCreated = sessionStorage.getItem('name');
      this.personForm.get('userName')?.setValue(userCreated);
      this.personForm.get('birthday')?.setValue(this.formattedDate(this.personForm.get('birthday')?.value));
			this.personForm.get('avatar')?.setValue('');
			this.personForm.get('nationalityID')?.setValue(59);
      const person: SPGetPerson2 = this.personForm.value as SPGetPerson2;
      this.common.savePerson2(person)
        .subscribe((resp: any) => {
          sessionStorage.setItem('personId', resp.personId);
          this.idPerson.emit(resp.personId);
          this.validForm.emit(true);
          let request: any = [];
          if (person.disabilityID != null && person.disabilityID !== 0) {
            request.push(this.common.createNewDocumentPerson(1, '01'))
          }
          if (person.foreignTitle != null && person.foreignTitle) {
            request.push(this.common.createNewDocumentPerson(3, '01'))
          }

          let aux: ValidateStatus = {
						p_personID: +sessionStorage.getItem('id')! || 0,
						p_studentID: +sessionStorage.getItem('studentID')! || 0,
						p_companyID: 1,
						p_processEnrollCode: '01',
						p_state: 1
					}

          if (request.length > 0) {
            forkJoin(request).subscribe({
              next: (resp: any) => {
                this.common.validateStatus(aux)
                  .subscribe({
                    next: (data: any) => {
                      this.router.navigateByUrl('/matriculacion/ficha-socioeconomica');
                    }, error: (err: any) => {
                      console.log(err);
                    }
                  })
              },
              error: (err: any) => {
                console.log(err);
              }
            })
          } else {
            this.common.validateStatus(aux)
              .subscribe({
                next: (data: any) => {
                  this.router.navigateByUrl('/matriculacion/ficha-socioeconomica');
                }, error: (err: any) => {
                  console.log(err);
                }
              })
          }

        }, (err) => {
          this.snackBar.open(
            'Ha ocurrido un error, intentalo mas tarde.',
            'Cerrar',
            {
              horizontalPosition: 'center',
              verticalPosition: 'top',
              duration: 4000,
              panelClass: ['warning-snackbar']
            }
          );
        });
    }
  }

  searchIdentity() {
    const identity = this.personForm.get('documentNumber')?.value;
    const typeIdentity = this.personForm.get('typeDocument')?.value;
    if (identity?.length === 10 && typeIdentity === 1) {
      this.cargando = true;
      this.login.registoCivil(identity)
        .subscribe(cedula => {
          if (cedula.consulta.nombre) {
						Swal
								.fire({
										icon: 'question',
										title: "Tu nombre es?",
										text: cedula.consulta.nombre,
										showCancelButton: true,
										confirmButtonText: "Si",
										cancelButtonText: "No",
								})
								.then(result => {
									if(result.value){
										//alert(cedula.consulta.nombre)
										this.consultation = cedula.consulta;
										this.chargeInfo(this.consultation);
										this.personForm.get('documentNumber').disable()
										this.personForm.get('firstName').disable()
										this.personForm.get('surname').disable()
										this.personForm.get('secondSurname').disable()
										this.personForm.get('sexID').disable()
										this.personForm.get('civilStatusID').disable()
									}else{
										this.personForm.get('documentNumber').enable()
										this.personForm.get('firstName').enable()
										this.personForm.get('surname').enable()
										this.personForm.get('secondSurname').enable()
										this.personForm.get('sexID').enable()
										this.personForm.get('civilStatusID').enable()
										this.common.message('Cédula Incorrecta', 'Vuelva a ingresar el número de documento', 'warning', '#d3996a');
         						this.personForm.get('documentNumber')?.setValue('');
										this.personForm.get('documentNumber').markAllAsTouched()
										this.personForm.get('firstName')?.setValue('');
										this.personForm.get('firstName').markAllAsTouched()
										this.personForm.get('surname')?.setValue('');
										this.personForm.get('surname').markAllAsTouched()
										this.personForm.get('secondSurname')?.setValue('');
										this.personForm.get('secondSurname').markAllAsTouched()
									}
								});
          } else {
            this.common.message('Cédula Incorrecta', 'Vuelva a ingresar el número de documento', 'warning', '#d3996a');
            this.personForm.get('documentNumber')?.setValue('');
						this.personForm.get('documentNumber').markAllAsTouched()
          }
          this.cargando = false;
        }, (err) => {
          this.cargando = false;
					this.common.message('Cédula Incorrecta', 'Vuelva a ingresar el número de documento', 'warning', '#d3996a');
          this.personForm.get('documentNumber')?.setValue('');
					this.personForm.get('documentNumber').markAllAsTouched()
        })
    }
  }

  getParish(parish: string) {
    this.personForm.get('parishID')?.setValue(Number(parish) || 0);
  }
  getProvince(province: string) {
    this.personForm.get('provinceID')?.setValue(Number(province) || 0);
  }
  getCanton(canton: string) {
    this.personForm.get('cantonID')?.setValue(Number(canton) || 0);
  }

  public fileChangeEvent(event: any): void {
    if (event.target.files.length) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (reader.result) {
          this.personForm.get('avatar')?.setValue(reader.result as string);
          this.personForm.get('avatar')?.markAsTouched();
          this.personForm.get('avatar')?.markAsDirty();
        }
      }
    }
  }

  loadInformationform(keyField: string, valueField: string) {
    this.personForm.get(keyField)?.setValue(valueField);
  }

  /* *********************************** -------------------------- *********************************** */


  /* ************************************** VALIDACIONES GLOBALES ************************************* */

  isValidField(field: string): boolean | null {
    return this.personForm.controls[field].errors
      && this.personForm.controls[field].touched;
  }

  getFielError(field: string): string | null {
    if (!this.personForm.controls[field]) return null;
    const errors = this.personForm.controls[field].errors || {};
    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
          return 'Campo requerido!';
        case 'min':
          if (errors['min'].min === 1) {
            return 'Debe seleccionar una opción!';
          } else {
            return 'Cantidad Incorrecta!';
          }

        case 'email':
          return 'No es un formato de email valido!';
        case 'minlength':
          return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
        case 'maxlength':
          return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
      }
    }
    return '';
  }

  getStatusForm(eve: any) {
    this.formState = eve;
    if (this.province !== '' && this.province !== 'null' && this.canton !== '' && this.canton != 'null' && this.parish !== '' && this.parish !== 'null') {
      this.formState.get('provinceAddress')?.setValue(this.province);
      this.formState.get('cantonAddress')?.setValue(this.canton);
      this.formState.get('parishAddress')?.setValue(this.parish);
    }
  }

  mappingInformation(person:any){
    person['surname'] = person.middleName;
    person['secondSurname'] = person.lastName;
    person['documentNumber'] = person.identity;
    person['typeDocument'] = person.typeDocId;
    person['sexID'] = person.sex;
    person['genderID'] = person.gender;
    person['civilStatusID'] = person.civilStatus;
    person['bloodTypeID'] = person.bloodType;
    person['ethnicityID'] = person.etnia;
    person['birthday'] = person.birthDate;
		person['operatorName'] = person.cellularOperator;
		person['cellularOperator'] = person.cellularOperatorID;
    return person;
  }
}
