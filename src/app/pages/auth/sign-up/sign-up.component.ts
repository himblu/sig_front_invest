import { Component, ElementRef, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Consulta } from '@utils/interfaces/cedula.interfaces';
import { CommonService } from '@services/common.service';
import { LoginService } from '@services/login.service';
import Swal from 'sweetalert2';
import { CommonModule, NgForOf, NgIf, NgStyle } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { Login } from '@utils/interfaces/login.interfaces';
import { alphaNumeric, onlyNumbers, onlyLetters, APP_EXTERN_UNACEM } from 'app/constants';
import { CivilStatus, Contractor, Identity, Nationality, UnacemBlackList } from '@utils/interfaces/others.interfaces';
import * as moment from 'moment';
import { AdministrativeService } from '@services/administrative.service';
import { SecurityService } from '@services/security.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '@services/api.service';
import { AdmissionPeriod } from '@utils/interfaces/period.interfaces';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { InfoCheckComponent } from '../components/info-check/info-check.component';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatSelectModule,
		MatSnackBarModule,
		MatDialogModule,
		NgStyle
  ],
  standalone: true
})

export class SignUpComponent extends OnDestroyMixin implements OnInit, OnDestroy{

  public isLoading: boolean = false;
	public registerForm!: FormGroup;
	public backgroundImage: string= 'url('+environment.signupBackground+')';
  numeroIngresado: string = '';
  numeroIngresadoInvalido: boolean = false;
  registroCivil!: Consulta;
  showAnotherFields: boolean = false;
  recordFounded: boolean = false;
  hasPersonInfo: boolean = false;
  personExists: boolean = false;
  cedula: string;
  civilStatuses: CivilStatus[] = [];
  nationalities: Nationality[] = [];
  typDocLong: number = 0;
  existsPerson: boolean = false;
  unacem: any = {};
  collaborators: any[] = [];
  responsibles: any[] = [];
	documentTypes: Identity[] = [];
  isUnacem: boolean = false;
  redirect: any;
	public currentPeriodID!: number;
	public contractors: Contractor[] = [];

	private snackBar: MatSnackBar = inject(MatSnackBar);
	private dialog: MatDialog = inject(MatDialog);

  constructor (
    private common: CommonService,
    private fb:FormBuilder,
    private login: LoginService,
    private Router: Router,
    private Administrative: AdministrativeService,
    private ActivatedRoute: ActivatedRoute,
    private Security: SecurityService,
    private ElementRef: ElementRef
  ){
		super();
		this.initRegisterForm();
	}

	public override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  personForm: FormGroup = this.fb.group({
    calleDomicilio:       [''],
    cedula:               [''],
    conyuge:              [''],
    civilStatusID:        [''],
    fechaCedulacion:      [''],
    birthday:      				[''],
    genderID:             [''],
    instruccion:          [''],
    lugarDomicilio:       [''],
    placeOfBirth:         [''],
    nacionalityID:        [''],
    nombre:               [''],
    nombreMadre:          [''],
    nombrePadre:          [''],
    numeracionDomicilio:  [''],
    profesion:            [''],
    tipoDocumento:        [1],

  });

  async ngOnInit() {
    let params: any = this.ActivatedRoute.snapshot.queryParams;
    this.redirect = params['login_redirect'];
    //console.log(this.redirect);
    let credentials: Login = {
      p_userName: 'invitado',
      p_userPassword: '123456',
      remember: true
    };

    if (this.redirect) {
      this.isUnacem = this.redirect === APP_EXTERN_UNACEM;
      this.unacem = {
        type: 1,
      }
    }else this.getCurrentPeriod();

    let auth: any = await this.login.login(credentials, true).toPromise();
    this.common.charging();
    this.getContractors();
    setTimeout( async () => {
      this.getData();
    }, 500);

  }

	public initRegisterForm(): void {
		this.registerForm = this.fb.group({
			email: [''],
			typeDocId: ['', [Validators.required]],
			personDocumentNumber: [{value: '', disabled: true}, [Validators.required]],
			personFirstName: ['', [Validators.required]],
			personFullName: ['', [Validators.required]],
			personMiddleName: ['', [Validators.required]],
			personLastName: ['', [Validators.required]],
			cellphone: [{value: '', disabled: true}, [Validators.required]],
			personEmail: [{value: '', disabled: true}, [Validators.required, Validators.email]],
			personUrlImg: [''],
			userCreated: [''],
			userOrigin: [''],
			accept: [{value: false, disabled: true}],
			state: true,
		});
		const state: FormControl = this.registerForm.get('state') as FormControl;
		if (state) {
			state.valueChanges.pipe(
				debounceTime(300),
				distinctUntilChanged(),
				untilComponentDestroyed(this)
			).subscribe({
				next: (value) => {
					this.selectContractor();
				}
			});
		}
	}

  async getContractors() {
    let result: any = await this.Administrative.getContractor({}).toPromise();
    this.contractors = result; //.filter((c: any) => c.statusID === 1);
  }

  async getData() {
    //console.log(this.common.identityList);
    this.documentTypes = this.common.identityList;
    this.civilStatuses = this.common.civilList;
    this.nationalities = this.common.nationalityList;
  }

  onSubmit(){
    if(this.registerForm.valid){
      if(this.registerForm.get('accept')?.value){
        this.isLoading=true;
        const data: any = {'user':this.registerForm.value, 'person':this.personForm.value};
        this.login.personRegister(data)
          .subscribe( (resp:any) => {
            Swal.fire({
              icon: 'success',
              title: 'Hola...',
              text: resp.success,
            })
            this.isLoading=false;
          }, (err) => {
						//console.log(err);
            this.mensaje(`${err.error.error}`);
            this.isLoading=false;
          })
      }else{
        this.mensaje('Para completar el registro debe aceptar los Términos y Condiciones')
      }
    }else{
      if(this.registerForm.get('personDocumentNumber')?.value.length !== 10){
        this.mensaje('Cédula Incorrecta');
      }
      else if(!this.registerForm.get('accept')?.value){
        this.mensaje('Debe aceptar Términos y Condiciones');
      }

    }

  }

  onlyLetters(e: any) {
    onlyLetters(e);
  }

  onlyNumbers(e: any) {
    onlyNumbers(e);
  }

  alphaNumeric(e: any) {
    alphaNumeric(e);
  }

  async queryCivilRecord(){
    this.registerForm.controls['accept'].enable();
    this.registerForm.updateValueAndValidity();
    const cedula: string = this.registerForm.get('personDocumentNumber')?.value;
    //console.log(cedula);
    this.recordFounded = false;
    let typeDocId = this.registerForm.get('typeDocId').value;
    if(typeDocId === 1 && cedula.length === 10){
      Swal.fire({
        html: '<i class="fa fa-cog fa-spin fa-3x"></i> <br> <h2 class="text-center">Buscando Información de la Persona.</h2>',
        showConfirmButton: false,
        showCancelButton: false,
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false
      });
      // let body: any = {
      //   personDocumentNumber: cedula
      // };
      let personFound: any = await this.common.getPersonByDocumentNumber(cedula).toPromise();
      if (personFound) {
        Swal.fire({
          text: 'La persona ya se encuentra registrada en ITCA',
          icon: 'warning',
        });
        this.personExists = true;
        this.registerForm.controls['accept'].disable();
				this.registerForm.get('personDocumentNumber').patchValue('');
        this.unacem.continue = false;
        this.registerForm.updateValueAndValidity();
      }else{
				this.showAnotherFields = true;
				this.registroCivil = {cedula: ''};
				this.registroCivil.cedula = this.registerForm.get('personDocumentNumber').value;
				this.registerForm.controls['personFullName'].patchValue(``);
				this.registerForm.controls['personMiddleName'].patchValue(``);
				this.registerForm.controls['personLastName'].patchValue(``);
				this.registerForm.updateValueAndValidity();
				this.recordFounded = true;
				this.hasPersonInfo = false;
				this.isLoading=false;
				let backList: UnacemBlackList[] = await this.common.validateBlackList(+cedula).toPromise();
				if(backList[0]){
					Swal.fire({
						text: 'La persona se encuentra en la lista negra',
						icon: 'warning',
					});
					this.personExists = true;
					this.registerForm.controls['accept'].disable();
					this.registerForm.get('personDocumentNumber').patchValue('');
					this.unacem.continue = false;
					this.registerForm.updateValueAndValidity();
				}else Swal.close();
			}
      /* this.common.registoCivil(cedula)
        .subscribe( resp => {
					//console.log(resp);
          if(resp.ok){
            if(resp.consulta.fechaNacimiento){
              this.registroCivil = resp.consulta;
              this.recordFounded = true;
              this.hasPersonInfo = true;
              let nameParts = this.registroCivil.nombre.split(' ');
              this.showAnotherFields = true;
              this.registerForm.controls['personFullName'].patchValue(`${nameParts[2]}${nameParts[3] ? ' '+nameParts[3] : ''}`);
              this.registerForm.controls['personFullName'].disable;
              this.registerForm.controls['personFirstName'].patchValue(`${nameParts[2]}${nameParts[3] ? ' '+nameParts[3] : ''}`);
              this.registerForm.controls['personFirstName'].disable;
              this.registerForm.controls['personMiddleName'].patchValue(`${nameParts[0]}`);
              this.registerForm.controls['personMiddleName'].disable;
              this.registerForm.controls['personLastName'].patchValue(`${nameParts[1]}`);
              this.registerForm.controls['personLastName'].disable;
              this.registerForm.updateValueAndValidity();
              this.llenaFormulario();
              // Swal.fire({
              //   icon: 'success',
              //   title: 'Hola...',
              //   text: resp.consulta.nombre,
              // });
            }else{
              this.mensaje('Cédula incorrecta, verifique el numero de identificación por favor...')
            }

          }
          this.isLoading=false;

          Swal.close();
        }, (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'No hay conección, vuelva a intentar en unos segundos',
            // footer: '<a href="/auth/registroManual">Desea un registro manual?</a>'
          });
          this.showAnotherFields = true;
          this.registroCivil = {cedula: ''};
          this.registroCivil.cedula = this.registerForm.get('personDocumentNumber').value;
          this.registerForm.controls['personFullName'].patchValue(``);
          this.registerForm.controls['personMiddleName'].patchValue(``);
          this.registerForm.controls['personLastName'].patchValue(``);
          this.registerForm.updateValueAndValidity();
          this.recordFounded = true;
          this.hasPersonInfo = false;
          this.isLoading=false;
        }) */
    } else {
      if (this.registerForm.controls['typeDocId'].value !== 3) {
        this.showAnotherFields = false;
      } else {
        this.showAnotherFields = true;
      }
    }
  }

  selectDocumentType() {
    //console.log('selectDocumentType');
    this.showAnotherFields = this.registerForm.get('typeDocId').value === 3;
    let typeDocSelected = this.documentTypes.find((d: any) => d.typeDocId === this.registerForm.get('typeDocId').value) || {typeDocLong: 10};
    this.typDocLong = typeDocSelected.typeDocLong;
    this.registerForm.controls['personDocumentNumber'].enable();
    this.registerForm.controls['personEmail'].enable();
    this.registerForm.controls['cellphone'].enable();
    this.registerForm.controls['accept'].enable();
    this.unacem.continue = true;
    this.unacem.isNew = true;
    this.registerForm.controls['personFirstName'].patchValue(``);
    this.registerForm.controls['personMiddleName'].patchValue(``);
    this.registerForm.controls['personLastName'].patchValue(``);
    this.registerForm.updateValueAndValidity();
  }

  validarNumero(event: any) {
    const input = event.target;
    const value = input.value;

    if (!/^\d*$/.test(value)) {
      this.numeroIngresadoInvalido = true;
    } else {
      this.numeroIngresadoInvalido = false;
    }
  }

  llenaFormulario(){
    this.personForm.controls['calleDomicilio'].patchValue(this.registroCivil.calleDomicilio);
    this.personForm.controls['cedula'].patchValue(this.registroCivil.cedula);
    this.personForm.controls['conyuge'].patchValue(this.registroCivil.conyuge);
    let civilStatusFound = this.civilStatuses.find((c: CivilStatus) => c.civilStatusDesc === this.registroCivil.estadoCivil);
    //console.log(this.registroCivil);
    //console.log(civilStatusFound);
    this.personForm.controls['civilStatusID'].patchValue(civilStatusFound.civilStatusID || 0);
    this.personForm.controls['fechaCedulacion'].patchValue(this.registroCivil.fechaCedulacion);
    this.personForm.controls['birthday'].patchValue(this.registroCivil.fechaNacimiento);
    this.personForm.controls['genderID'].patchValue(this.registroCivil.genero === 'MUJER' ? '1' : '2');
    this.personForm.controls['instruccion'].patchValue(this.registroCivil.instruccion);
    this.personForm.controls['lugarDomicilio'].patchValue(this.registroCivil.lugarDomicilio);
    this.personForm.controls['placeOfBirth'].patchValue(this.registroCivil.lugarNacimiento);
    //console.log(this.nationalities);
    let nationalityFound = this.nationalities.find((n: Nationality) => n.nationality_1.toUpperCase() === this.registroCivil.nacionalidad?.toUpperCase());
    this.personForm.controls['nacionalityID'].patchValue(nationalityFound?.countryID || 59);
    this.personForm.controls['nombre'].patchValue(this.registroCivil.nombre);
    this.personForm.controls['nombreMadre'].patchValue(this.registroCivil.nombreMadre);
    this.personForm.controls['nombrePadre'].patchValue(this.registroCivil.nombrePadre);
    this.personForm.controls['numeracionDomicilio'].patchValue(this.registroCivil.numeracionDomicilio);
    this.personForm.controls['profesion'].patchValue(this.registroCivil.profesion);
  }

  mensaje(texto: string){
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: texto,
    })
  }

  async toContinue() {
    if (!this.registerForm.valid &&
      !this.registerForm.controls['personFullName']?.value &&
      this.registerForm.controls['personMiddleName']?.value &&
      this.registerForm.controls['personFirstName']?.value) {

      const personFullNameWritten =`${this.registerForm.controls['personMiddleName'].value} ${this.registerForm.controls['personLastName']?.value || ''} ${this.registerForm.controls['personFirstName'].value}`;
      this.registerForm.controls['personFullName'].patchValue(personFullNameWritten);
      this.registerForm.controls['personFullName'].disable;
    }

		if(this.registerForm.valid && this.personForm.valid){
			let users:any = await this.Administrative.getUsers(this.registerForm.controls['personDocumentNumber'].value).toPromise();
			if (users.length) {
				Swal.fire({
					text: 'Ya existe una persona registrada con el Número de Document ingresado. Revise y vuelva a intentar.',
					icon: 'error'
				});
				return;
			}

			let validateEmail: any = await this.Administrative.getPersonEmailLikeText(this.registerForm.controls['personEmail'].value).toPromise();
			if (validateEmail.length) {
				Swal.fire({
					text: 'Ya existe una persona registrada con el correo proporcionado. Revise y vuelva a intentar.',
					icon: 'error'
				});
				return;
			}
			Swal.fire({
				text: '¿Estás seguro de haber ingresado los datos correctamente?',
				icon: 'question',
				allowEnterKey: false,
				allowEscapeKey: false,
				allowOutsideClick: false,
				showConfirmButton: true,
				showCancelButton: true,
				confirmButtonText: 'Sí, estoy seguro',
				confirmButtonColor: '#014898',
				cancelButtonText: 'No'
			}).then(async (choice) => {
				if (choice.isConfirmed) {
					if(this.isUnacem){
						const config: MatDialogConfig = new MatDialogConfig();
						config.id = 'InfoCheckComponent';
						config.autoFocus = false;
						config.minWidth = '45vw';
						config.maxWidth = '45vw';
						config.panelClass = 'transparent-panel';
						config.data = { };
						config.disableClose = true;
						const dialog = this.dialog.open(InfoCheckComponent, config);
						dialog.afterClosed()
						.pipe(untilComponentDestroyed(this))
						.subscribe((res: boolean) => {
							if(res){
								this.postForms();
							} else {
								this.registerForm.get('accept').patchValue(false);
							}
						});
					} else {
						this.postForms();
					}
				}
			})
		} else {
			this.snackBar.dismiss();
			this.snackBar.open(
				`Campos incompletos`,
				null,
				{
					horizontalPosition: 'center',
					verticalPosition: 'top',
					duration: 4000,
					panelClass: ['red-snackbar']
				}
			);
		}
  }

	async postForms() {
		Swal.fire({
			html: '<i class="fa fa-cog fa-spin fa-3x"></i> <br> <h2 class="text-center">Recopilando datos para tu Inscripción</h2>',
			showConfirmButton: false,
			showCancelButton: false,
			allowEnterKey: false,
			allowEscapeKey: false,
			allowOutsideClick: false
		});
		let newRecord: any = this.registerForm.value;
		newRecord.personFullName = `${newRecord.personMiddleName} ${newRecord.personLastName} ${newRecord.personFirstName}`;
		newRecord.userCreated = 'invitado';
		newRecord.user = 'invitado';
		newRecord.userOrigin = 'invitado';
		newRecord.typePersonCode = 'N';
		newRecord.sendEmail = 1;
		if (this.isUnacem) {
			newRecord.userID = `${newRecord.personDocumentNumber}`;
			newRecord.userRol = 24;
		} else newRecord.userID = `I${newRecord.personDocumentNumber}`;
		newRecord.sendMail = true;
		newRecord.isUnacem = this.isUnacem;
		let body: any = {
			news: [newRecord]
		};
		let result: any = await this.common.savePersonJSON(body).toPromise();
		if (this.hasPersonInfo) {
			// Grabando información Personal -> PERSONINF
			//console.log(this.personForm.value);
			let dataPersonInf: any = this.personForm.value;
			dataPersonInf.birthday = moment(dataPersonInf.birthday, 'DD/MM/YYYY').format('YYYY-MM-DDThh:mm:ssTZD');
			dataPersonInf.personID = result[0].personID;
			dataPersonInf.bloodTypeID = 1;
			dataPersonInf.sexID = 1;
			dataPersonInf.statusID = 1;
			dataPersonInf.userCreated = 'CONVALIDACIÓN';
			dataPersonInf.version = 1;
			let bodyPersonInf = {
				news: [dataPersonInf]
			};
			let resultPersonInf: any = await this.common.savePersonInfJSON(bodyPersonInf).toPromise();
			//console.log(resultPersonInf);
		}
		let bodyEmail: any = {
			news: [
				{
					emailTypeID: 1,
					personID: result[0].personID,
					sequenceNro: 1,
					emailDesc: newRecord.personEmail,
					statusID: 1,
					userCreated: 'MIGRA',
					userOrigin: 'ec2_user',
					version: 0
				}
			]
		};

		let resultEmail: any = await this.common.saveEmailJSON(bodyEmail).toPromise();
		// console.log(result);
		// console.log('../../inscripcion/informacion-personal/I1050098639');

		if (this.isUnacem) {
			if(this.unacem.contractorID){
				let professionID: number= null;
				let bodyContractorCollaborator= {
					"contractorID": this.unacem.contractorID,
					"personID": result[0].personID,
					"userID": result[0].userID,
					"professionID": professionID,
					"createBy": result[0].userID
				}
				let resultContractorCollaborator = await this.Administrative.postContractorCollaborator(bodyContractorCollaborator).toPromise();
				//console.log('resultContractorCollaborator', resultContractorCollaborator);
			}

			let bodyPhoneInitial: any = {
				news: [
					{
						phoneTypeID: 2,
						operatorID: 2,
						personId: result[0].personID,
						sequenceNro: 0,
						numberPhone: this.registerForm.controls['cellphone'].value,
						numberReferences: null,
						comentary: null,
						statusID: 1,
						dateCreated: moment().format('YYYY-MM-DD'),
						userCreated: 'MIGRA',
						userOrigin: 'MIGRA'
					}
				]
			}
			let resultPhoneInitial: any = await this.common.savePhoneJSON(bodyPhoneInitial).toPromise();

			// this.unacem.billingDocumentNumber = this.registerForm.controls['billingDocumentNumber'].value;

			// CREACION DE PERSONAS
			this.unacem.businessName = this.unacem.billingName;
			this.unacem.businessAddress = this.unacem.billingAddress;
			this.unacem.businessPhone = this.unacem.billingPhone;
			this.unacem.billingEmail = this.registerForm.controls['personEmail'].value;
			this.unacem.billingDocumentType = this.unacem.billingDocumentNumber.length === 13 ? 4 : 1;
			this.responsibles = [
				{
					userID: result[0].userID,
					personID: result[0].personID,
					professionID: 42,
					isMain: true,
					createBy: result[0].userID
				}
			];

			// CREACION DE COLABORADORES / RESPONSABLES
			let newContractor: any = this.unacem;
			newContractor.createBy = result[0].personID || result[0].userID;
			let body: any = {
				news: [newContractor]
			};

			let resultContractor: any = await this.Administrative.postContractor(body).toPromise();
			if (!resultContractor) {
				Swal.fire({
					text: 'Hubo un error al insertar al Contratista',
					icon: 'error'
				});
				return;
			}

			if (this.responsibles.length) {
				this.responsibles.map((r: any) => {
					r.contractorID = resultContractor[0].contractorID;
				});

				let bodyResponsible: any = {
					news: this.responsibles
				}

				let resultResponsible: any = await this.Administrative.postContractorResponsible(bodyResponsible).toPromise();

				if (!resultResponsible) {
					Swal.fire({
						text: 'Hubo un error al insertar a los responsables',
						icon: 'error'
					});
					return;
				}
			}
		} else {
			let bodyPhone = {
				phoneTypeID: 2,
				operatorID: 2,
				personID: result[0].personID,
				numberPhone: this.registerForm.get('cellphone').value,
				numberReferences: '',
				commentary: '',
				user: 'MIGRA'
			}
			let resultPhone: any = await this.common.postPersonPhone(bodyPhone).toPromise();
		}
		Swal.close();
		if (this.isUnacem) {
			Swal.fire({
				title: '¡Completado!',
				text: 'Se han enviado las credenciales a tu correo para continuar con este proceso.',
				icon: 'success'
			});
		} else {
			Swal.fire({
				title: '¡Completado!',
				text: 'Se ha culminado el Proceso Inicial de Registro. Se han enviado las credenciales a tu correo para continuar con este proceso.',
				icon: 'success'
			});
		}
		this.logout();
	}

  toggleSelectType(type: number) {
    this.unacem.type = type;
    this.unacem.isNew = this.unacem.type === 2;
  }

  toggleCreateContractor() {
    // this.unacem.isNew = !this.unacem.isNew;
    // this.unacem.blockedContractor = !this.unacem.blockedContractor;
    this.initializeFormContractor();
  }

  async selectContractor() {
    if (this.unacem.contractorID) {
      if(this.registerForm.get('state').value){
				let contractorSelected: any = this.contractors.find((c: any) => this.unacem.contractorID === c.contractorID);
				if (contractorSelected) {
					let responsibles: any = await this.Administrative.getContractorResponsibleByContractorID(contractorSelected.contractorID).toPromise();
					this.responsibles = responsibles;
					this.unacem.businessName = contractorSelected.businessName;
					this.unacem.businessAddress = contractorSelected.businessAddress;
					this.unacem.businessPhone = contractorSelected.businessPhone;
					this.unacem.billingName = contractorSelected.billingName;
					this.unacem.billingAddress = contractorSelected.billingAddress;
					this.unacem.billingPhone = contractorSelected.billingPhone;
					this.unacem.billingDocumentNumber = contractorSelected.billingDocumentNumber;
					this.unacem.billingDocumentType = contractorSelected.billingDocumentType;
				}
			} else {
				this.responsibles = undefined;
				this.unacem.businessName = undefined;
				this.unacem.businessAddress = undefined;
				this.unacem.businessPhone = undefined;
				this.unacem.billingName = undefined;
				this.unacem.billingAddress = undefined;
				this.unacem.billingPhone = undefined;
				this.unacem.billingDocumentNumber = undefined;
				this.unacem.billingDocumentType = undefined;
			}
    }
  }

  initializeFormContractor() {
    if (this.unacem.type === 2) {
      this.unacem.contractorID = undefined;
      this.unacem.blockedContractor = !this.unacem.blockedContractor;
    }
    this.unacem.businessName = undefined;
    this.unacem.businessAddress = undefined;
    this.unacem.businessPhone = undefined;
    this.unacem.billingName = undefined;
    this.unacem.billingAddress = undefined;
    this.unacem.billingPhone = undefined;
    this.unacem.billingDocumentNumber = undefined;
    this.unacem.billingDocumentType = undefined;
  }

  async validCollaborators() {
    const file: HTMLInputElement = this.ElementRef.nativeElement.querySelector(`#file-collaborators`)
    let fileCount: number = file.files.length;
    let formData = new FormData();
    if (fileCount > 0) {
      formData.append('file', file.files.item(0));
      let data: any = await this.Administrative.uploadInBuilk(formData).toPromise();
      //console.log(data);
      this.collaborators = data;
      this.collaborators.map((c: any) => {
        c.professionID = 42;
        let isInvalid = false;
        if (c.typeDocId === 1) {
          isInvalid = isNaN(c.personDocumentNumber) || c.personDocumentNumber.length !== 10;
        }
        c.isInvalid = isInvalid;
      });
      this.unacem.existsInvalids = this.collaborators.some((c: any) => c.isInvalid);
      this.unacem.returningData = true;
    }
  }

  toggleDownloadFile() {
    this.unacem.downloadedFormat = true;
  }

	public getCurrentPeriod(): void{
		this.Administrative.getCurrentAdmissionPeriod().subscribe({
			next: (res: AdmissionPeriod) => {
				if(res?.admissionPeriodID) this.currentPeriodID = res.admissionPeriodID;
				else {
					Swal.fire({
						text: 'No se puede completar el registro fuera del periodo académico',
						icon: 'error'
					});
					this.registerForm.disable();
				}
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public logout(): void{
		this.common.logout();
	}

}
