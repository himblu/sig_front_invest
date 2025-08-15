import { BooleanInput } from '@angular/cdk/coercion';
import { NgForOf, DatePipe, NgIf, formatDate } from '@angular/common';
import { Component, OnInit, Pipe, PipeTransform, ViewChild, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, NgControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { BloodType, Canton, CivilStatus, Disability, Etnia, Gender, Identity, Nationality, Parish, Province, Relationship, Sex } from '@utils/interfaces/others.interfaces';
import { ComboComponent } from 'app/pages/home/enrollment/pages/components/combo/combo.component';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { Observable, Subscription, forkJoin, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';

interface EndpointForm {
  form: number;
  endpoints: Observable<any>[];
}

@Pipe({
  name: 'stepFormGroup',
  standalone: true
})

export class StepFormGroupPipe implements PipeTransform {
  transform(form: FormGroup, number: number): FormGroup {
    return form.get(number.toString()) as FormGroup;
  }
}


@Component({
  selector: 'app-update-information',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatStepperModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSnackBarModule,
    NgForOf,
    //DatePipe,
    NgIf,
    NgxMaskDirective,
    MatIconModule,
    MatTooltipModule,
    StepFormGroupPipe,
    MatDatepickerModule,
    ComboComponent,
    MatNativeDateModule
  ],
  providers: [
    provideNgxMask()
  ],
  templateUrl: './update-information.component.html',
  styleUrls: ['./update-information.component.css']
})

export class UpdateInformationComponent implements OnInit {
  onChangeInput(arg0: FileList) {
    // throw new Error('Method not implemented.');
  }
  parish: string;
  province: string;
  provinceContact: string;
  cantonContact: string;
  parishContact: string;
  canton: string;
  hasDisability: BooleanInput = false;
  hasForeingTitle: BooleanInput = false;
  formState: FormGroup;
  formStateCatalog: FormGroup;
  checkIfShowCombo: boolean = false;
  nationalTownsList: any[] = [];
  countriesList: any[] = [];
  studentUser = '';
  personUpdate!: any;
  showParishContact: boolean = false;
  public relationships: Relationship[] = [];
  dataDisability: any;
	calendarFlag: boolean = false;
	provinces:Province[]=[];
	cantonsByProvince: Canton[] = [];
	parishByCantons: Parish[] = [];

  private sendFormSubscription: Subscription;
  private snackBar: MatSnackBar = inject(MatSnackBar);
  api: AdministrativeService = inject(AdministrativeService);
	router: Router = inject(Router);


  phone = {
    S: { pattern: new RegExp('[+0-9]') },
  };

  getCanton(eve: any, formNumber: number) {
    this.form.get(String(1)).get('cantonID')?.setValue(eve);
		this.form.get(String(3)).get('cantonID')?.setValue(eve);
  }
  getProvince(eve: any, formNumber: number) {
    this.form.get(String(1)).get('provinceID')?.setValue(eve);
		this.form.get(String(3)).get('provinceID')?.setValue(eve);
  }
  getParish(eve: any, formNumber: number) {
    this.form.get(String(1)).get('parishID')?.setValue(eve);
		this.form.get(String(3)).get('parishID')?.setValue(eve);
  }

  @ViewChild('stepper', { static: true }) private stepper: MatStepper;
  public form: FormGroup;
  private fb: FormBuilder = inject(FormBuilder);
  operatorsList: any[] = [];

  constructor(
    private common: CommonService,
    private activeRouter: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.initForm();
    this.loading()
		this.loadProvince();
    this.activeRouter.params.subscribe({
      next: (params: any) => {
        this.common.getStudentInformation(params.personId).subscribe({
          next: (res) => {
						console.log('student', res);
            this.personUpdate = res;
            this.province = String(res.provinceID);
            this.canton = String(res.cantonID);
            this.parish = String(res.parishID);
            this.form.get('1').patchValue(res);
						this.changeEtnia(res.ethnicityID);
            const user = `${res.firstName} ${res.surname} ${res.secondSurname}`;
            this.studentUser = user;
            this.form.get('1').get('user')?.setValue(user);
            this.checkIfShowCombo = true;

            this.common.getContacPhone(params.personId).subscribe({
              next: (res) => {
                res.forEach((element: any) => {
                  element['personID'] = params.personId;
                  element['user'] = this.studentUser;
                  this.buildContactPhoneFormArray(element);
                });
              }
            })
            this.common.getAddressInformation(params.personId).subscribe({
              next: (res: any) => {
								//console.log('address', res);
                this.form.get('3').patchValue(res);
                this.form.get('3').get('user')?.setValue(this.studentUser);
                this.form.get('3').get('personID')?.setValue(Number(params.personId));
                this.provinceContact = res.provinceID;
                this.cantonContact = res.cantonID;
                this.parishContact = res.parishID;
                this.showParishContact = true;

              }
            })
            this.common.getEmailStudent(params.personId).subscribe({
              next: (res) => {
                res.forEach((element: any) => {
                  element['personID'] = params.personId;
                  element['user'] = this.studentUser;
                  this.buildEmailStudentFormArray(element);
                });

              }
            })

            this.common.getEmergencyInfo(params.personId).subscribe({
              next: (res) => {
                res.forEach((element: any) => {
                  element['personID'] = params.personId;
                  element['user'] = this.studentUser;
                  this.buildContacEmergencyFormArray(element);
                });
              }
            })

            this.common.getStudentDisability(params.personId).subscribe({
              next: (res) => {
                if (res.length > 0) {
                  this.hasDisability = true;
                }
                res.forEach((element: any) => {
                  element['personID'] = params.personId;
                  element['user'] = this.studentUser;
                  this.buildDisablilityFormArray(element)
                });
              }
            })
          }
        })
      }
    })
  }

  async loading() {
    await this.common.charging();
    this.common.getOperatorsCellular()
      .subscribe(resp => {
        this.operatorsList = resp;
      })
    this.common.getCountries().subscribe({
      next: (res) => {
        this.countriesList = res;
      }
    })
    this.api.getRelationships().subscribe({
      next: (res) => {
        this.relationships = res;
      }
    })
  }

	loadProvince(): void{
		this.common.cargaCombo(6)
		.subscribe( province => {
			this.provinces=province;
		},(err) => {
			console.log(err);
			this.common.message(`${err.error.error}`,'','error','#f5637e');
		})
	}

	onProvinceChange(): void{
		this.cantonsByProvince = [];
		const form= this.form.get('1');
		this.common.getCantonByProvince(7, form.get('provinceID').value).subscribe( canton => {
			this.cantonsByProvince = canton;
		},(err) => {
			//console.log(err);
		})
	}

	onCantonsChange(): void{
		this.parishByCantons = [];
		const form= this.form.get('1');
		this.common.getParishByCanton(8, form.get('cantonID').value).subscribe( parish => {
			this.parishByCantons = parish;
		},(err) => {
			//console.log(err);
		})
	}

  public initForm(): void {
    this.form = this.fb.group({
      '1': this.buildPersonalInformationFormGroup(),
      '2': this.fb.group({
        contactPhone: this.fb.array([])
      }),
      '3': this.buildPersonalContactFormGroup(),
      '4': this.buildEmergencyInformationFormGroup(),
      '5': this.fb.group({
        disability: this.fb.array([]),
      }),
      '6': this.fb.group({
        emails: this.fb.array([])
      }),
      '7': this.fb.group({
        emergencyContacts: this.fb.array([])
      }),

    });

    this.form.get('1').get('birthday').valueChanges.subscribe((value: any) => {
      // Extract the date part without the time
      const dateOnly = value?.toISOString().split('T')[0];
      //console.log(dateOnly); // This will log the date in the format 'yyyy-mm-dd'
      this.form.get('1').get('birthday')?.setValue(dateOnly);
    });

  }

  public sendForm(number: number): void {
    const form: FormGroup = this.form.get(number.toString()) as FormGroup;
    //console.log('form',form);

    //this.formState.markAllAsTouched();
    if (form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.sendFormSubscription) {
      this.sendFormSubscription.unsubscribe();
    }
		if(number === 1 && this.calendarFlag === true){
			this.form.get('1').get('birthday').patchValue(formatDate(this.form.get('1').get('birthday').value, 'yyyy-MM-dd', 'es', '-1000'));
		}
    if (number === 5) {
      this.dataDisability =[
				{
					personID: this.personUpdate.personID,
					fileTypeID: 1,
					processEnrollCode: '01',
					user: this.studentUser,
				}
			]
    }
    const endpointsForm: EndpointForm[] = this.endpointsForm;
    const endpointForm: EndpointForm = endpointsForm.find((item) => item.form === number);
    if (endpointForm) {
      this.sendFormSubscription = forkJoin(endpointForm.endpoints).subscribe({
        next: (res) => {
          if (res) {
            this.snackBar.dismiss();
            this.snackBar.open(
              `Formulario Guardado con Éxito`,
              null,
              {
                horizontalPosition: 'center',
                verticalPosition: 'top',
                duration: 4000,
                panelClass: ['green-snackbar']
            	}
						);
            this.stepper.next();
						if(number === 5) this.router.navigateByUrl(`/`)
          }
        },
        error: (err) => {
          console.log(err);
        }
      })
    }

  }

  sendContactInfo() {
    const formAddress: FormGroup = this.form.get('3') as FormGroup;
		//console.log(formAddress);
    if (formAddress.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.sendFormSubscription) {
      this.sendFormSubscription.unsubscribe();
    }
    const endpointsForm: EndpointForm[] = this.endpointsForm;
    const endpointForm: EndpointForm = endpointsForm.find((item) => item.form === 3);

    if (endpointForm) {
      this.sendFormSubscription = forkJoin(endpointForm.endpoints).subscribe({
        next: (res) => {
          if (res) {
            this.snackBar.dismiss();
            this.snackBar.open(
              `Formulario Guardado con Éxito`,
              null,
              {
                horizontalPosition: 'center',
                verticalPosition: 'top',
                duration: 4000,
                panelClass: ['green-snackbar']
              });
            this.stepper.next();
          }
        },
        error: (err) => {
          console.log(err);
        }
      })
    }
  }

	public postEmails(): void {
		if(this.form.get('6').get('emails').valid){
			this.common.updateEmailsStudent(this.form.get('6').get('emails')?.value).subscribe({
        next: (res) => {
          if (res) {
            this.snackBar.dismiss();
            this.snackBar.open(
              `Formulario Guardado con Éxito`,
              null,
              {
                horizontalPosition: 'center',
                verticalPosition: 'top',
                duration: 4000,
                panelClass: ['green-snackbar']
              });
            //this.stepper.next();
          }
        },
        error: (err) => {
          console.log(err);
        }
      })
		}else{
			this.form.get('6').get('emails').markAllAsTouched();
		}
	}

	public postContacts(): void {
		if(this.form.get('2').get('contactPhone').valid){
			this.common.updateContactPhone(this.form.get('2').get('contactPhone')?.value).subscribe({
        next: (res) => {
          if (res) {
            this.snackBar.dismiss();
            this.snackBar.open(
              `Formulario Guardado con Éxito`,
              null,
              {
                horizontalPosition: 'center',
                verticalPosition: 'top',
                duration: 4000,
                panelClass: ['green-snackbar']
              });
            //this.stepper.next();
          }
        },
        error: (err) => {
          console.log(err);
        }
      })
		}else{
			this.form.get('2').get('contactPhone').markAllAsTouched();
		}

	}

  private buildPersonalInformationFormGroup(): FormGroup {
    return this.fb.group({
      personID: [null, [Validators.required]],
      typeDocument: [{ value: null }, [Validators.required]],//tipo de documento
      sexID: [null, [Validators.required]],//sexo
      genderID: [null, [Validators.required]],//genero
      ethnicityID: [null, [Validators.required]],//grupo cultural
      civilStatusID: [null, [Validators.required]],//estado civil
      bloodTypeID: [null, [Validators.required]],//tipo de sangre
      documentNumber: [{ value: null }, [Validators.required]],//numero documento
      firstName: [{ value: null }, [Validators.required]],//nombre
      surname: [{ value: null }, [Validators.required]],//nombre
      secondSurname: [{ value: null }, [Validators.required]],//nombre
      birthday: [null, [Validators.required]],//fecha de nacimiento
      nationalityID: [null, [Validators.required]],//nacionalidad
      cantonID: [null, [Validators.required]],//canton de nacimiento
      provinceID: [null, [Validators.required]],//provincia
      countryID: [null, [Validators.required]],//pais de nacimiento
      nationalTownID: [null], // pueblos y nacionalidades
      user: [null, [Validators.required]],
      parishID: [null], // parroquia
    });
  }

  public buildContactPhoneFormArray(objData?: any): void {
    const contactPhoneStudentFormArray: FormArray = this.contactPhoneStudent;
    let contactPhoneFormGroup: FormGroup;
    if (objData) {
      contactPhoneFormGroup = this.fb.group({
        sequenceNro: [objData.sequenceNro, [Validators.required]],
        operatorID: [objData.operatorID, [Validators.required]],
        // operatorName: [objData.operatorName, [Validators.required]],
        cellPhone: [objData.cellPhone, [Validators.required]],
        numberConventional: [objData.numberConventional],
        whatsapp: [objData.whatsapp],
        personID: [objData.personID, [Validators.required]],
        user: [objData.user, [Validators.required]],
      });
    } else {
      contactPhoneFormGroup = this.fb.group({
        sequenceNro: [0, [Validators.required]],
        operatorID: [null, [Validators.required]],
        // operatorName: [null, [Validators.required]],
        cellPhone: [null, [Validators.required]],
        numberConventional: [null],
        whatsapp: [null],
        personID: [this.personUpdate.personID, [Validators.required]],
        user: [this.studentUser, [Validators.required]],
      });
    }
    contactPhoneStudentFormArray.push(contactPhoneFormGroup);
  }

	public removeContactPhoneFormArray(): void {
		const contactPhoneStudentFormArray: FormArray = this.contactPhoneStudent;
		contactPhoneStudentFormArray.removeAt(contactPhoneStudentFormArray.length -1);
	}

  public get contactPhoneStudent(): FormArray {
    return (this.form.get('2') as FormGroup).get('contactPhone') as FormArray;
  }

  public buildEmailStudentFormArray(objData?: any): void {
    const buildEmailFormArray: FormArray = this.emailsStudent;
    let emailFormGroup: FormGroup;
    if (objData) {
      emailFormGroup = this.fb.group({
        sequenceNro: [objData.sequenceNro, [Validators.required]],
        emailDesc: [objData.emailDesc, [Validators.required]],
        // emailTypeID: [objData.emailTypeID, [Validators.required]],
        personID: [objData.personID, [Validators.required]],
        user: [objData.user, [Validators.required]],
      });
    } else {
      emailFormGroup = this.fb.group({
        sequenceNro: [0, [Validators.required]],
        emailDesc: [null, [Validators.required]],
        // emailTypeID: [1, [Validators.required]],
        personID: [this.personUpdate.personID, [Validators.required]],
        user: [this.studentUser, [Validators.required]],
      });
    }
    buildEmailFormArray.push(emailFormGroup);
  }

	public removeEmailStudentFormArray(): void {
		const buildEmailFormArray: FormArray = this.emailsStudent;
		buildEmailFormArray.removeAt(buildEmailFormArray.length -1);
	}

  public get emailsStudent(): FormArray {
    return (this.form.get('6') as FormGroup).get('emails') as FormArray;
  }

  buildContacEmergencyFormArray(objData?: any) {
    const buildEmergencyContactFormArray: FormArray = this.contactEmergencyFormArray;
    let contactEmergencyFormGroup: FormGroup;
    if (objData) {
      contactEmergencyFormGroup = this.fb.group({
        sequenceNro: [objData.sequenceNro, [Validators.required]],
        contactAddress: [objData.contactAddress, [Validators.required]],
        contactFullName: [objData.contactFullName, [Validators.required]],
        contactPhone: [objData.contactPhone, [Validators.required]],
        relationShipID: [objData.relationShipID, [Validators.required]],
        personID: [objData.personID, [Validators.required]],
        user: [objData.user, [Validators.required]],
      });
    } else {
      contactEmergencyFormGroup = this.fb.group({
        sequenceNro: [0, [Validators.required]],
        contactAddress: [null, [Validators.required]],
        contactFullName: [null, [Validators.required]],
        contactPhone: [null, [Validators.required]],
        relationShipID: [null, [Validators.required]],
        personID: [this.personUpdate.personID, [Validators.required]],
        user: [this.studentUser, [Validators.required]],
      });
    }

    buildEmergencyContactFormArray.push(contactEmergencyFormGroup);
  }

  public get contactEmergencyFormArray(): FormArray {
    return (this.form.get('7') as FormGroup).get('emergencyContacts') as FormArray;
  }

  buildPersonalContactFormGroup() {
    return this.fb.group({
      provinceID: [null, [Validators.required]],
      cantonID: [null, [Validators.required]],
      parishID: [null, [Validators.required]],
      mainStreet: [null, [Validators.required]],
      numberAddress: [null, [Validators.required]],
      secondaryStreet_1: [null, [Validators.required]],
      secondaryStreet_2: [null, [Validators.required]],
      addressReferences: [null, [Validators.required]],
      countryID: [null, [Validators.required]],
      description: [null, [Validators.required]],
      personID: [null, [Validators.required]],
      user: [null, [Validators.required]],
      sequenceNro: [0, [Validators.required]],
    });
  }

  buildEmergencyInformationFormGroup() {
    return this.fb.group({
      personToCall: [null, [Validators.required]],
      relationship: [null, [Validators.required]],//tipo de documento
      celularPhone: [null, [Validators.required]],//sexo
      conventionalPhone: [null, [Validators.required]],//genero
      address: [null, [Validators.required]],//nacionalida
    });
  }

  buildAdditionalInformationFormGroup() {
    return this.fb.group({
      disabilityID: [null, [Validators.required]],
      percentageDisability: [null, [Validators.required]],
      commentary: [null, [Validators.required]],
    });
  }

  buildDisablilityFormArray(objData?: any) {
    const disabilityFormArray: FormArray = this.disabilityFormArray;
    let disabilityFormGroup: FormGroup;
    if (objData) {
      disabilityFormGroup = this.fb.group({
        sequenceNro: [objData.sequenceNro, [Validators.required]],
        disabilityID: [objData.disabilityID, [Validators.required]],
        percentageDisability: [objData.percentageDisability, [Validators.required]],
        commentary: [objData.commentary, [Validators.required]],
        personID: [objData.personID, [Validators.required]],
        user: [objData.user, [Validators.required]],
      });
    } else {
      disabilityFormGroup = this.fb.group({
        sequenceNro: [0, [Validators.required]],
        disabilityID: [null, [Validators.required]],
        percentageDisability: [null, [Validators.required]],
        commentary: [null, [Validators.required]],
        personID: [this.personUpdate.personID, [Validators.required]],
        user: [this.studentUser, [Validators.required]],
      });
    }
    disabilityFormArray.push(disabilityFormGroup);
  }

  public get disabilityFormArray(): FormArray {
    return (this.form.get('5') as FormGroup).get('disability') as FormArray;
  }

  buildForeingTitle(): FormGroup {
    return this.fb.group({
      personID: [null, [Validators.required]],
      fileTypeID: [null, [Validators.required]],
      processEnrollCode: [null, [Validators.required]],
      user: [null, [Validators.required]],
    });
  }


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

  getStatusForm(eve: any, index: number) {
    if (index === 1) {
      this.formState = eve;
      this.form.get(index.toString()).get('provinceID')?.setValue(this.province);
      this.form.get(index.toString()).get('cantonID')?.setValue(this.canton);
      this.form.get(index.toString()).get('parishID')?.setValue(this.parish);
    } else {
      this.formStateCatalog = eve;
      this.form.get(index.toString()).get('provinceID')?.setValue(this.provinceContact);
      this.form.get(index.toString()).get('cantonID')?.setValue(this.cantonContact);
      this.form.get(index.toString()).get('parishID')?.setValue(this.parishContact);
    }
  }

  changeEtnia(eve:any) {
    if (eve === 1) {
      this.common.getNationalTowns()
        .subscribe(nationalTowns => this.nationalTownsList = nationalTowns)
    } else {
      this.nationalTownsList = []
    }
  }

  public get endpointsForm(): EndpointForm[] {
    return [
      {
        form: 1,
        endpoints: [this.common.updateInformation(this.form.get('1').value)]
      },
      {
        form: 3,
        endpoints: [
          this.common.updateAddressPerson(this.form.get('3').value),
          //this.common.updateEmailsStudent(this.form.get('6').get('emails')?.value),
          //this.common.updateContactPhone(this.form.get('2').get('contactPhone')?.value),
        ]
      },
      {
        form: 4,
        endpoints: [this.common.updateAddressPerson(this.form.get('3').value)]
      },
      {
        form: 5,
        endpoints: [
          this.common.updateDisability(this.form.get('5').get('disability').value),
          this.common.updateStudentDisability(this.dataDisability)
        ]
      },

      {
        form: 7,
        endpoints: [this.common.updateEmegencyInfo(this.form.get('7').get('emergencyContacts')?.value)]
      },
    ]
  }

  addDisability(eve: any) {
    this.hasDisability = eve;
    if (eve) {
      this.buildDisablilityFormArray();
    } else {
      const disabilityFormArray: FormArray = this.disabilityFormArray;
      disabilityFormArray.clear();
    }
  }

  addForeingTitle(eve: boolean) {
    const endpointsForm: EndpointForm[] = this.endpointsForm;
    const endpointForm: EndpointForm = endpointsForm.find((item) => item.form === 5);
    const body = {
      personID: this.personUpdate.personID,
      fileTypeID: 3,
      processEnrollCode: '01',
      user: this.studentUser,
    }
    if (eve) {
      endpointForm.endpoints.push(this.common.updateForeingTitle(body));
    } else {
      endpointForm.endpoints.pop();
    }
  }
}
