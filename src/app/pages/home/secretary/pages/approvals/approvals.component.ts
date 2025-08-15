import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, FormArray, } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { UserService } from '@services/user.service';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CoursesDetail, CycleDetail, NewStudents, School, SPGetCareer, SPGetModality, StudyPlan } from '@utils/interfaces/campus.interfaces';
import { BloodType, Canton, CivilStatus, Country, CurrentPeriod, Etnia, Gender, Identity, Nationality, NationalTowns, Parish, Province, Sex } from '@utils/interfaces/others.interfaces'
import { Campus, Institution, Period, RetrieveType } from '@utils/interfaces/period.interfaces';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SearchedStudent } from '@utils/interfaces/person.interfaces';
import { JsonPipe } from '@angular/common';
import { CIVIL_STATUS } from '@utils/interfaces/others.interfaces';
import { GENDER } from '@utils/interfaces/others.interfaces';
import { MatTabsModule } from '@angular/material/tabs';
import { InternalApprovalsComponent } from 'app/pages/home/report/pages/approvals/approvals.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-approvals',
  templateUrl: './approvals.component.html',
  styleUrls: ['./approvals.component.scss'],
	standalone: true,
	imports: [
		NgIf,
		NgForOf,
		ReactiveFormsModule,
		MatInputModule,
		MatButtonModule,
		MatFormFieldModule,
		MatSelectModule,
		MatIconModule,
		MatTooltipModule,
		MatDatepickerModule,
		MatNativeDateModule,
		//NgxMaskDirective,
		MatSnackBarModule,
		//JsonPipe,
		MatTabsModule,
		InternalApprovalsComponent
	],
	providers: [
		provideNgxMask(),
	],
})
export class ApprovalsComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public charging: boolean = false;
	public chargingModal: boolean = false;
	public approvalsForm!: FormGroup;
	public personForm!: FormGroup;
	public studentForm!: FormGroup;
	public studentDetailForm!: FormGroup;
	public homologationForm!: FormGroup;
	public currentPeriod: CurrentPeriod;
	public campuses: Campus[] = []; // Sucursal
	public periods: Period[] = []; // Periodo Académico
	public schools: School[] = []; // Escuela
	public studyPlans: StudyPlan[] = []; // Malla Académica
	public careers: SPGetCareer[] = []; // Carrera
	public modalities: SPGetModality[] = []; // Modalidad
	public civilStatuses: CivilStatus[] = [];
	public sexList: Sex[] = [];
	public genders: Gender[] = [];
  public bloodTypes: BloodType[] = [];
  public nationalities: Nationality[] = [];
  public countries: Country[] = [];
  public provinces: Province[] = [];
  public cantons: Canton[] = [];
	public parishes : Parish[] = [];
  public culturalGroups: Etnia[] = [];
	public nationalTownsList: NationalTowns[] = [];
	public documentTypes: Identity[] = [];
	public institutions : Institution[] = [];
	public cycles: CycleDetail[] = [];
	public courses: CoursesDetail[] = [];
	public retrieveTypes: RetrieveType[] = [];

	@ViewChild('modalClose', { read: ElementRef }) public modalClose: ElementRef;

	constructor(private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private user: UserService,
		private snackBar: MatSnackBar,
		private datePipe: DatePipe){
		super();
	}

	public ngOnInit(): void {
		this.initApprovalsForm();
		this.initPersonForm();
		this.initStudentForm();
		this.initStudentDetailForm();
		this.initHomologationForm();
		this.getCampuses();
		this.getCurrentPeriod();
		this.getCountries();
		this.getProvinces();
		this.getInstitutionByCountry();
		this.getPeriodsByCampus(1);
		this.getRetrieveTypes();
		this.common.charging();
		setTimeout(() => {
			this.charging = true;
      this.getData();
    }, 750);
  }

  public override ngOnDestroy() {
    super.ngOnDestroy();
  }

	public initApprovalsForm(): void {
		this.approvalsForm = this.fb.group({
			user: [this.user.currentUser.userName],
			search: '',
			studentID: ['', Validators.required],
			countryID: [59, Validators.required],
			campusID: [1, Validators.required],
			periodID: ['', Validators.required],
			schoolID: ['', Validators.required],
			careerID: ['', Validators.required],
			studyPlanID: ['', Validators.required],
			modalityID: ['', Validators.required],
			institutionID: ['', Validators.required],
			personFirstName: ['', Validators.required],
			personMiddleName: ['', Validators.required],
			personLastName: ['', Validators.required],
			personDocumentNumber: ['', [Validators.required, Validators.minLength(10)]],
			documentReferences: ['', Validators.required],
		});
	}

	public initPersonForm(): void {
		this.personForm = this.fb.group({
			user: [this.user.currentUser.userName],
			p_userID: '',
			personFirstName: ['', Validators.required],
			personMiddleName: ['', Validators.required],
			personLastName: ['', Validators.required],
			typeDocID: ['', Validators.required],
			personDocumentNumber: ['', [Validators.required, Validators.minLength(10)]],
			typePersonCode: 'N'
		});
	}

	public initStudentForm(): void{
		this.studentForm = this.fb.group({
			user: [this.user.currentUser.userName],
			personID: [''],
			p_recoveryEmail: ['', [Validators.required, Validators.email]],
			civilStatusID: ['', Validators.required],
			sexID: ['', Validators.required],
			genderID: ['', Validators.required],
			bloodTypeID: ['', Validators.required],
			nationalityID: ['', Validators.required],
			birthday: ['', Validators.required],
			countryID: ['', Validators.required],
			provinceID: ['', Validators.required],
			cantonID: ['', Validators.required],
			parishID: ['', Validators.required],
			ethnicityID: ['', Validators.required],
			religionID: null,
			nationalTownID: [null],
		});
	}

	public initStudentDetailForm(): void{
		this.studentDetailForm = this.fb.group({
			user: [this.user.currentUser.userName],
			personID: [''],
			levelID: [1, Validators.required],
			campusID: [1, Validators.required],
			modalityID: ['', Validators.required],
			schoolID: ['', Validators.required],
			careerID: ['', Validators.required],
			studyPlanID: ['', Validators.required],
			parallelID: null,
			workingDayID: 1,
			cycleID: 1
		});
	}

	public initHomologationForm(): void {
		this.homologationForm = this.fb.group({
			news: this.fb.array([
				this.fb.group({
					institutionOriginID: ['', [Validators.required]],
					periodID: ['', Validators.required],
					studentID: ['', [Validators.required]],
					periodSource: ['', [Validators.required]],
					courseSource: [null],
					courseName: ['', [Validators.required]],
					creditSource: [null, [Validators.required, Validators.min(1)]],
					hoursSource: [0],
					gradeSource: [null, [Validators.required, Validators.min(1)]],
					courseID: ['', [Validators.required]],
					creditFate: [null, [Validators.required, Validators.min(1)]],
					hoursFate: [0],
					gradeFate: [null, [Validators.required, Validators.min(1)]],
					courses: '',
					userCreated: this.user.currentUser.userName,
					documentReferences: ['', Validators.required],
					recognitionTypeID: [null, Validators.required]
				})
			]),
		});
	}

	private homologationFormRow(): FormGroup {
		return this.fb.group({
			institutionOriginID: ['', [Validators.required]],
			periodID: ['', Validators.required],
			studentID: ['', [Validators.required]],
			periodSource: ['', [Validators.required]],
			courseSource: [null],
			courseName: ['', [Validators.required]],
			creditSource: [null, [Validators.required, Validators.min(1)]],
			hoursSource: [0],
			gradeSource: [null, [Validators.required, Validators.min(1)]],
			courseID: ['', [Validators.required]],
			creditFate: [null, [Validators.required, Validators.min(1)]],
			hoursFate: [0],
			gradeFate: [null, [Validators.required, Validators.min(1)]],
			courses: '',
			userCreated: this.user.currentUser.userName,
			documentReferences: ['', Validators.required],
			recognitionTypeID: [null, Validators.required]
		});
	}

	public gethomologationFormControl(): FormArray{
		return (this.homologationForm.controls['news'] as FormArray);
	}

	public addNewsRow(): void {
		const newsArray = this.gethomologationFormControl();
		newsArray.push(this.homologationFormRow());
	}

	public removeOriginRow(rowIndex: number): void {
		const newsArray = this.gethomologationFormControl();
		if (newsArray.length > 1) {
			newsArray.removeAt(rowIndex);
		}
	}

	public onSubmitPerson(): void {
		if(this.personForm.valid && this.studentForm.valid && this.studentDetailForm.valid){
			this.chargingModal = true;
			//console.log(this.personForm.value);
			this.api.postStudentExternal(this.personForm.value).subscribe({
				next: (res: any) => {
					//console.log(res);
					if(res[0].personId){
						this.studentForm.get('personID').patchValue(res[0].personId);
						this.studentDetailForm.get('personID').patchValue(res[0].personId);
						this.onSubmitStudent();
					}else{
						this.chargingModal = false;
						this.snackBar.open(
							'Documento ya registrado',
							'',
							{
								horizontalPosition: 'center',
								verticalPosition: 'top',
								duration: 4000,
								panelClass: ['red-snackbar']
							}
						);
					}
				},
				error: (err: HttpErrorResponse) => {
					this.chargingModal = false;
				}
			});
		}else{
			this.personForm.markAllAsTouched();
			this.studentForm.markAllAsTouched();
			this.studentDetailForm.markAllAsTouched();
		}
	}

	public onSubmitStudent(): void{
		//console.log(this.studentForm.value);
		this.api.postStudentInfo(this.studentForm.value).subscribe({
			next: (res: any) => {
				//console.log(res);
				this.onSubmitStudentDetail();
			},
			error: (err: HttpErrorResponse) => {
				this.charging = false;
			}
		});
	}

	public onSubmitStudentDetail(): void {
		//console.log(this.studentDetailForm.value);
		this.api.postStudentDetailInfo(this.studentDetailForm.value).subscribe({
			next: (res: any) => {
				//console.log(res);
				this.onSubmitUser();
			},
			error: (err: HttpErrorResponse) => {
				this.charging = false;
			}
		});
	}

	public onSubmitUser(): void {
		let body = {
			p_personId: this.studentForm.get('personID').value,
			p_userName: 'I'+this.personForm.get('personDocumentNumber').value,
			p_userPassword: this.personForm.get('personDocumentNumber').value,
			p_recoveryEmail: this.studentForm.get('p_recoveryEmail').value,
			p_userCreated: this.user.currentUser.userName
		};
		this.api.postUser(body).subscribe({
			next: (res: any) => {
				//console.log(res);
				this.personForm.get('p_userID').patchValue(res.userId);
				setTimeout(() => {
					this.onSubmitUserRol();
				}, 100);
			},
			error: (err: HttpErrorResponse) => {
				this.charging = false;
			}
		});
	}

	public onSubmitUserRol(): void {
		let body = {
			p_rolID: 5,
			p_userID: this.personForm.get('p_userID').value,
			p_user: this.user.currentUser.userName
		};
		this.api.postUserRol(body).subscribe({
			next: (res: any) => {
				//console.log(res);
				this.onSubmitUserGroup();
			},
			error: (err: HttpErrorResponse) => {
				this.charging = false;
			}
		});
	}

	public onSubmitUserGroup(): void {
		let body = {
			userID: this.personForm.get('p_userID').value,
			groupID: 5,
			user: this.user.currentUser.userName
		};
		this.api.postUserGroup(body).subscribe({
			next: (res: any) => {
				//console.log(res);
				this.common.message(`${res.message}`,'','success','#86bc57');
				this.charging = false;
				this.personForm.reset();
				this.studentForm.reset();
				this.studentDetailForm.reset();
				this.modalClose.nativeElement.click();
			},
			error: (err: HttpErrorResponse) => {
				this.charging = false;
			}
		});
	}

	public onSubmitApprovals(): void {
		console.log(this.approvalsForm.value);
	}

	public onSubmitHomologation(): void {
		console.log(this.homologationForm.value);
	}

	private getData(): void{
		this.civilStatuses = this.common.civilList;
		this.sexList = this.common.sexList;
    this.genders = this.common.genderList;
    this.bloodTypes = this.common.bloodList;
    this.nationalities = this.common.nationalityList;
		this.culturalGroups = this.common.etniaList;
    this.documentTypes = this.common.identityList;
		this.charging = false;
	}

	public registoCivil(document: string): void {
		if(document.length < 10){
			this.personForm.get('personDocumentNumber').markAsTouched();
			this.personForm.get('personDocumentNumber').markAsDirty();
		}else{
			this.chargingModal = true;
			this.common.registoCivil(document).subscribe({
				next: (res) => {
					console.log(res);
					if(res.ok){
						this.chargingModal = false;
						let nameParts = res.consulta.nombre.split(' ');
						this.personForm.controls['personFirstName'].patchValue(`${nameParts[2]}${nameParts[3] ? ' '+nameParts[3] : ''}`);
            this.personForm.controls['personMiddleName'].patchValue(`${nameParts[0]}`);
            this.personForm.controls['personLastName'].patchValue(`${nameParts[1]}`);
						this.studentForm.controls['birthday'].patchValue(this.datePipe.transform(res.consulta.fechaNacimiento, 'yyyy-MM-dd'));
						this.studentForm.controls['civilStatusID'].patchValue(+CIVIL_STATUS[res.consulta.estadoCivil as any]);
						this.studentForm.controls['genderID'].patchValue(+GENDER[res.consulta.genero as any]);
					}else{
						this.personForm.controls['personFirstName'].patchValue('');
            this.personForm.controls['personMiddleName'].patchValue('');
            this.personForm.controls['personLastName'].patchValue('');
						this.studentForm.controls['birthday'].patchValue('');
						this.studentForm.controls['civilStatusID'].patchValue('');
						this.studentForm.controls['genderID'].patchValue('');
						this.snackBar.open(
							'Documento incorrecto',
							'',
							{
								horizontalPosition: 'center',
								verticalPosition: 'top',
								duration: 4000,
								panelClass: ['red-snackbar']
							}
						);
						this.chargingModal = false;
					}
				},
				error: (err: HttpErrorResponse) => {
					this.personForm.controls['personFirstName'].patchValue('');
					this.personForm.controls['personMiddleName'].patchValue('');
					this.personForm.controls['personLastName'].patchValue('');
					this.studentForm.controls['birthday'].patchValue('');
					this.snackBar.open(
						'Documento incorrecto',
						'',
						{
							horizontalPosition: 'center',
							verticalPosition: 'top',
							duration: 4000,
							panelClass: ['red-snackbar']
						}
					);
					this.chargingModal = false;
				}
			});
		}
	}

	public searchStudent(filter: string) {
		this.admin.getStudentByFilter(filter).subscribe({
			next: async (res) => {
				//console.log(res);
				if(res[0]){
					this.approvalsForm.get('studentID').patchValue(res[0].studentID);
					this.approvalsForm.get('personDocumentNumber').patchValue(res[0].documentNumber);
					this.approvalsForm.get('personFirstName').patchValue(res[0].PersonFirstName);
					this.approvalsForm.get('personMiddleName').patchValue(res[0].PersonMiddleName);
					this.approvalsForm.get('personLastName').patchValue(res[0].PersonLastName);
					this.approvalsForm.get('periodID').patchValue(this.currentPeriod.periodID);
					this.approvalsForm.get('schoolID').patchValue(res[0].schoolID);
					await this.getCareersBySchool(this.approvalsForm.get('schoolID').value);
					await this.approvalsForm.get('careerID').patchValue(res[0].careerID);
					await this.getStudyPlansByCareer(this.approvalsForm.get('careerID').value);
					await this.approvalsForm.get('studyPlanID').patchValue(res[0].studyPlanID);
					await this.getModalitiesByCareer(this.approvalsForm.get('careerID').value);
					await this.approvalsForm.get('modalityID').patchValue(res[0].modalityID);
					await this.getCycles();
				}else{
					this.approvalsForm.get('studentID').patchValue('');
					this.approvalsForm.get('personDocumentNumber').patchValue('');
					this.approvalsForm.get('personFirstName').patchValue('');
					this.approvalsForm.get('personMiddleName').patchValue('');
					this.approvalsForm.get('personLastName').patchValue('');
					this.approvalsForm.get('periodID').patchValue(this.currentPeriod.periodID);
					this.approvalsForm.get('schoolID').patchValue('');
					this.approvalsForm.get('careerID').patchValue('');
					this.approvalsForm.get('studyPlanID').patchValue('');
					this.approvalsForm.get('modalityID').patchValue('');
				}
			},
			error: (err: HttpErrorResponse) => {
				this.initApprovalsForm();
				this.approvalsForm.get('periodID').patchValue(this.currentPeriod.periodID);
			}
		});
	}

	private getCampuses(): void {
    this.admin.getAllCampuses().subscribe({
      next: (res: Campus[]) => {
        this.campuses = res;
      }
    });
  }

	public getPeriodsByCampus(campusID: number): void {
		this.admin.getPeriodsByCampus(campusID).subscribe({
			next: (value: Period[]) => {
				this.periods = value;
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	public getInstitutionByCountry(countryID: number = this.approvalsForm.get('countryID').value): void {
		this.admin.getInstitutionByCountry(countryID).subscribe({
			next: (res: Institution[]) => {
				this.institutions = res;
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	private getRetrieveTypes(): void {
		this.admin.getRetrieveTypes().subscribe({
			next: (res: RetrieveType[]) => {
				//console.log('RetrieveTypes', res);
				this.retrieveTypes= res;
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	private getCountries(): void {
    this.common.getCountries().subscribe({
      next: (res: Country[]) => {
        this.countries = res;
      }
    });
  }

	public getProvinces(countryID:number = 6): void {
    this.common.cargaCombo(countryID).subscribe({
      next: (res: Province[]) => {
        this.provinces = res;
      }
    });
  }

	public getCantons(event: MatSelectChange): void {
    this.common.getCantonByProvince(7, event.value).subscribe({
      next: (res: Canton[]) => {
        this.cantons = res;
      }
    });
  }

	public getParish(event: MatSelectChange): void {
    this.common.getParishByCanton(8, event.value).subscribe({
      next: (res: Parish[]) => {
        this.parishes = res;
      }
    });
  }

	public changeEtnia(): void {
    this.studentForm.get('ethnicityID')?.valueChanges
      .pipe(
        untilComponentDestroyed(this)
      )
      .subscribe(resp => {
        if (resp === 1) {
          this.common.getNationalTowns()
            .subscribe(nationalTowns => this.nationalTownsList = nationalTowns)
        } else {
          this.nationalTownsList = []
					this.studentForm.get('nationalTownID').patchValue(null);
        }
      })
  }

	private getCurrentPeriod(): void {
    this.api.getCurrentPeriod().subscribe({
      next: (res: CurrentPeriod) => {
        this.currentPeriod = res;
				setTimeout(() => {
					this.approvalsForm.get('periodID').patchValue(this.currentPeriod.periodID);
					this.getAllSchools();
				}, 100);
      }
    });
  }

	public getAllSchools(): void {
		this.admin.getAllSchools().subscribe({
			next: (value: School[]) => {
				 //console.log(value);
				this.schools = value;
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	// Al cambiar de escuela, traer las mallas
	public getCareersBySchool(schoolID: number): void {
		this.admin.getCareersBySchoolID(schoolID).subscribe({
			next: (value: SPGetCareer[]) => {
				this.careers = value;
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	public getStudyPlansByCareer(careerID: number): void {
		this.admin.getStudyPlansByCareer(careerID).subscribe({
			next: (value: StudyPlan[]) => {
				//console.log('studyPlans', value);
				this.studyPlans = value;
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	// Al cambiar de carrera, traer las modalidades
	public getModalitiesByCareer(careerID: number): void {
		this.admin.getModalitiesByCareer(careerID).subscribe({
			next: (value: SPGetModality[]) => {
				this.modalities = value;
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	public getCycles(): void {
		this.admin.getCyclesByCareerAndStudyPlan(this.approvalsForm.get('studyPlanID').value, this.approvalsForm.get('careerID').value).subscribe({
			next: (res) => {
				//console.log('cycles', res);
				this.cycles = res;
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	public getCoursesDetail(cycleID: number, index: number): void {
		this.admin.getCoursesDetail(this.approvalsForm.get('studyPlanID').value, this.approvalsForm.get('careerID').value,
			this.approvalsForm.get('modalityID').value, cycleID).subscribe({
			next: (res) => {
				//console.log('courses', res);
				this.courses = res;
				this.gethomologationFormControl().controls[index].get('courses').patchValue(res);
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	public setCredits(course: CoursesDetail, index: number): void {
		this.gethomologationFormControl().controls[index].get('creditFate').patchValue(course.credits);
	}

	public resetForms(): void {
		this.initApprovalsForm();
		this.initPersonForm();
		this.initStudentForm();
		this.initStudentDetailForm();
		this.careers = [];
		this.studyPlans = [];
		this.modalities = [];
		this.approvalsForm.get('periodID').patchValue(this.currentPeriod.periodID);
	}

	public postInstitution(): void {
		for(let i=0; i<this.gethomologationFormControl().length; i++){
			this.gethomologationFormControl().controls[i].get('institutionOriginID').patchValue(this.approvalsForm.get('institutionID').value);
			this.gethomologationFormControl().controls[i].get('studentID').patchValue(this.approvalsForm.get('studentID').value);
			this.gethomologationFormControl().controls[i].get('periodID').patchValue(this.approvalsForm.get('periodID').value);
		}
		//console.log(this.approvalsForm.value, JSON.parse(JSON.stringify(this.homologationForm.value)));
		if(this.approvalsForm.valid && this.homologationForm.valid){
			Swal.fire({
				icon: 'question',
				title: ``,
				text: `¿Está seguro de continuar?`,
				showCancelButton: true,
				confirmButtonText: "Si",
				cancelButtonText: "No",
				allowOutsideClick: false,
			}).then(result => {
				if(result.value){
					let body = {
						studentID: this.approvalsForm.get('studentID').value,
						institutionID: this.approvalsForm.get('institutionID').value,
						user: this.user.currentUser.userName,
						documentReferences: this.approvalsForm.get('documentReferences').value
					}
					this.admin.postInstitutionOrigin(body).subscribe({
						next: (res: any) => {
							//console.log(res[0].institutionOriginID);
							this.postNewSubjects(res[0].institutionOriginID);
						},
						error: (err: HttpErrorResponse) => {
						}
					});
				}
			});
		}else{
			this.approvalsForm.markAllAsTouched();
			this.homologationForm.markAllAsTouched();
		}
	}

	public postNewSubjects(institutionOriginID: number): void {
		for(let i=0; i<this.gethomologationFormControl().length; i++){
			this.gethomologationFormControl().controls[i].get('institutionOriginID').patchValue(institutionOriginID);
		}
		let json = [];
		for(let i=0; i<this.gethomologationFormControl().length; i++){
			let obj = JSON.parse(JSON.stringify(this.gethomologationFormControl().controls[i].value, [
				'institutionOriginID',
				'periodID',
				'studentID',
				'periodSource',
				'courseSource',
				'courseName',
				'creditSource',
				'hoursSource',
				'gradeSource',
				'courseID',
				'creditFate',
				'hoursFate',
				'gradeFate',
				'userCreated',
				'documentReferences',
				'recognitionTypeID'
			]))
			json.push(obj);
		}
		let arr = {'news': json};

		this.admin.postNewSubjects(arr).subscribe({
			next: (res) => {
				//console.log(res);
				this.resetForms();
				this.initHomologationForm();
				this.common.message(`Registro exitoso.`,'','success','#86bc57');
			},
			error: (err: HttpErrorResponse) => {
				this.snackBar.open(
					'Ha surgido un error.',
					'',
					{
						horizontalPosition: 'center',
						verticalPosition: 'top',
						duration: 4000,
						panelClass: ['red-snackbar']
					}
				);
			}
		});
	}

}
