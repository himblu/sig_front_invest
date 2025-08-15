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
import { ActivatedRoute, Router } from '@angular/router';
import { AcademicalHistory, AcademicalInformation, ConsultedStudent } from '@utils/interfaces/person.interfaces';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Campus, Period, RetrieveType } from '@utils/interfaces/period.interfaces';
import { CoursesDetail, CycleDetail, School, SPGetCareer, SPGetModality, StudyPlan, WorkingDay } from '@utils/interfaces/campus.interfaces';
import { CurrentPeriod } from '@utils/interfaces/others.interfaces';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';

@Component({
  selector: 'component-approvals',
  standalone: true,
  templateUrl: './approvals.component.html',
  styleUrls: ['./approvals.component.scss'],
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
		MatSnackBarModule
	],
	providers: [
		DatePipe
	],
})
export class InternalApprovalsComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public charging: boolean = false;
	public approvalsForm!: FormGroup;
	public homologationForm!: FormGroup;
	public student: ConsultedStudent;
	public studentInformation: AcademicalInformation;
	public campuses: Campus[] = []; // Sucursal
	public periods: Period[] = []; // Periodo Académico
	public schools: School[] = []; // Escuela
	public studyPlans: StudyPlan[] = []; // Malla Académica
	public careers: SPGetCareer[] = []; // Carrera
	public modalities: SPGetModality[] = []; // Modalidad
	public workingDays: WorkingDay[] = []; // Jornada
	public academicalHistory: AcademicalHistory[] = [];
	public currentPeriod: CurrentPeriod;
	public cycles: CycleDetail[] = [];
	public courses: CoursesDetail[] = [];
	public retrieveTypes: RetrieveType[] = [];

	constructor(private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private user: UserService,
		private datePipe: DatePipe,
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private snackBar: MatSnackBar,){
		super();
	}

	ngOnInit() {
    this.initApprovalsForm();
		this.initHomologationForm();
		this.getCurrentPeriod();
		this.getPeriods();
		this.getCampuses();
		this.getRetrieveTypes();
  }

	public override ngOnDestroy() {
    super.ngOnDestroy();
  }

	public initApprovalsForm(): void {
		this.approvalsForm = this.fb.group({
			user: [this.user.currentUser.userName],
			search: '',
			studentID: ['', Validators.required],
			personFirstName: ['', Validators.required],
			personMiddleName: ['', Validators.required],
			personLastName: ['', Validators.required],
			personDocumentNumber: ['', [Validators.required, Validators.minLength(10)]],
			campusID: [1, Validators.required],
			periodID: ['', Validators.required],
			schoolID: ['', Validators.required],
			careerID: ['', Validators.required],
			studyPlanID: ['', Validators.required],
			modalityID: ['', Validators.required],
			workingDayID: null,
			personID: ['', Validators.required],
			levelID: 1,
			parallelID: null,
			cycleID: 1
		});
	}

	public initHomologationForm(): void {
		this.homologationForm = this.fb.group({
			news: this.fb.array([
				this.fb.group({
					institutionOriginID: 50,
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
					//cycleID: ['', [Validators.required]],
					courses: '',
					userCreated: this.user.currentUser.userName,
					recognitionTypeID: [null, Validators.required]
				})
			]),
		});
	}

	private homologationFormRow(): FormGroup {
		return this.fb.group({
			institutionOriginID: 50,
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
			//cycleID: ['', [Validators.required]],
			courses: '',
			userCreated: this.user.currentUser.userName,
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

	public searchStudent(filter: string) {
		this.admin.getStudentByFilter(filter).subscribe({
			next: async (res) => {
				//console.log('searchStudent', res[0]);
				setTimeout(() => {
					if(res[0]){
						this.approvalsForm.get('studentID').patchValue(res[0].studentID);
						this.approvalsForm.get('personID').patchValue(res[0].PersonId);
						this.approvalsForm.get('personDocumentNumber').patchValue(res[0].documentNumber);
						this.approvalsForm.get('personFirstName').patchValue(res[0].PersonFirstName);
						this.approvalsForm.get('personMiddleName').patchValue(res[0].PersonMiddleName);
						this.approvalsForm.get('personLastName').patchValue(res[0].PersonLastName);
						this.getStudentInformation(res[0].PersonId);
						this.getStudentAcademicalInformation(res[0].studentID);
					}else{
						this.approvalsForm.get('studentID').patchValue('');
						this.approvalsForm.get('personID').patchValue('');
						this.approvalsForm.get('personDocumentNumber').patchValue('');
						this.approvalsForm.get('personFirstName').patchValue('');
						this.approvalsForm.get('personMiddleName').patchValue('');
						this.approvalsForm.get('personLastName').patchValue('');
					}
				}, 100);
			},
			error: (err: HttpErrorResponse) => {
				this.initApprovalsForm();
				this.student= null;
				this.studentInformation= null;
			}
		});
	}

	public getNewStudent(filter: string): Promise<number> {
		return new Promise((resolve, reject) => {
			this.admin.getStudentByFilter(filter).subscribe({
				next: async (res) => {
					setTimeout(() => {
						if (res[0]) {
							this.approvalsForm.get('studentID').patchValue(res[0].studentID);
							this.approvalsForm.get('personID').patchValue(res[0].PersonId);
							this.approvalsForm.get('personDocumentNumber').patchValue(res[0].documentNumber);
							this.approvalsForm.get('personFirstName').patchValue(res[0].PersonFirstName);
							this.approvalsForm.get('personMiddleName').patchValue(res[0].PersonMiddleName);
							this.approvalsForm.get('personLastName').patchValue(res[0].PersonLastName);
							this.getStudentInformation(res[0].PersonId);
							this.getStudentAcademicalInformation(res[0].studentID);
							resolve(res[0].studentID); // Retorna el nuevo studentID
						} else {
							this.approvalsForm.get('studentID').patchValue('');
							this.approvalsForm.get('personID').patchValue('');
							this.approvalsForm.get('personDocumentNumber').patchValue('');
							this.approvalsForm.get('personFirstName').patchValue('');
							this.approvalsForm.get('personMiddleName').patchValue('');
							this.approvalsForm.get('personLastName').patchValue('');
							resolve(null);
						}
					}, 100);
				},
				error: (err: HttpErrorResponse) => {
					this.initApprovalsForm();
					this.student = null;
					this.studentInformation = null;
					reject(err);
				}
			});
		});
	}
	private getStudentInformation(personID: number): void{
		//this.charging = true;
		this.common.getStudentInformation(personID).subscribe({
			next: (res: ConsultedStudent) => {
				//console.log('student', res);
				this.student = res;
				this.charging = false;
			},
			error: (err: HttpErrorResponse) => {
				this.charging = false;
				this.student = null;
			}
		});
	}

	private getStudentAcademicalInformation(studentID: number){
		//this.charging = true;
		this.common.getInternalInfoStudent(studentID).subscribe({
			next: (res) => {
				//console.log('studentInformation', res);
				this.studentInformation = res;
				this.getStudentAcademicalHistory(res.studentID);
				this.charging = false;
			},
			error: (err: HttpErrorResponse) => {
				this.charging = false;
				this.studentInformation = null;
			}
		});
	}

	private getStudentAcademicalHistory(studentID: number){
		//this.charging = true;
		this.common.getStudentAcademicalHistory(studentID).subscribe({
			next: (res: AcademicalHistory[]) => {
				//console.log('studentAcademicalHistory', res);
				for(let i=0; i<res.length; i++){
					if(i>0) this.addNewsRow();
					this.gethomologationFormControl().controls[i].get('periodSource').patchValue(res[i].periodDesc);
					this.gethomologationFormControl().controls[i].get('courseName').patchValue(res[i].courseName);
					if(res[i].credits) this.gethomologationFormControl().controls[i].get('creditSource').patchValue(res[i].credits);
					else this.gethomologationFormControl().controls[i].get('creditSource').patchValue(0);
					this.gethomologationFormControl().controls[i].get('gradeSource').patchValue(res[i].grade);
					this.gethomologationFormControl().controls[i].get('studentID').patchValue(this.studentInformation.studentID);
					this.gethomologationFormControl().controls[i].get('periodID').patchValue(this.approvalsForm.get('periodID').value);
				}
				setTimeout(() => {
					this.academicalHistory = res;
					this.charging = false;
				}, 50);
			},
			error: (err: HttpErrorResponse) => {
				this.charging = false;
				this.initHomologationForm();
			}
		});
	}

	private getCurrentPeriod(): void {
    this.api.getCurrentPeriod().subscribe({
      next: (res: CurrentPeriod) => {
				//console.log(res);
        this.currentPeriod = res;
				setTimeout(() => {
					this.approvalsForm.get('periodID').patchValue(this.currentPeriod.periodID);
					this.getAllSchools();
				}, 100);
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

	private getCampuses(): void {
    this.admin.getAllCampuses().subscribe({
      next: (res: Campus[]) => {
        this.campuses = res;
      }
    });
  }

	public getPeriods(): void {
		this.admin.getAllPeriods().subscribe({
			next: (value) => {
				//console.log(value);
				this.periods = value;
			},
			error: (err: HttpErrorResponse) => {
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
				//console.log(value);
				this.modalities = value;
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	public getWorkingDays(item: SPGetModality): void {
		if(item.workingORmodule === 'J'){
			this.approvalsForm.get('workingDayID').addValidators(Validators.required);
			this.admin.getWorkingDaysByModality(item.modalityID).subscribe({
				next: (value: WorkingDay[]) => {
					this.workingDays = value;
				},
				error: (err: HttpErrorResponse) => {
				}
			});
		}else{
			this.approvalsForm.get('workingDayID').clearValidators();
			this.approvalsForm.get('workingDayID').patchValue(null);
		}
	}

	public getCycles(studyPlanID: number, careerID: number): void {
		this.admin.getCyclesByCareerAndStudyPlan(studyPlanID, careerID).subscribe({
			next: (res) => {
				this.cycles = res;
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	public getCoursesDetail(cycleID: number, i:number): void {
		this.admin.getCoursesDetail(this.approvalsForm.get('studyPlanID').value, this.approvalsForm.get('careerID').value,
			this.approvalsForm.get('modalityID').value, cycleID).subscribe({
			next: (res) => {
				this.gethomologationFormControl().controls[i].get('courses').patchValue(res);
				//console.log(this.gethomologationFormControl().controls[i].get('courses').value);
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	public setCredits(course: CoursesDetail, index: number): void {
		this.gethomologationFormControl().controls[index].get('creditFate').patchValue(course.credits);
	}

	public postStudentInformation(): void {
		// console.log('studentInformation', this.studentInformation);
		this.charging = true;

		// Validamos el formulario antes de continuar
		if (!this.approvalsForm.valid) {
			this.approvalsForm.markAllAsTouched();
			this.homologationForm.markAllAsTouched();
			this.charging = false;
			return;
		}

		// Preguntamos confirmación al usuario
		Swal.fire({
			icon: 'question',
			text: '¿Está seguro de continuar?',
			showCancelButton: true,
			confirmButtonText: 'Si',
			cancelButtonText: 'No',
			allowOutsideClick: false,
		}).then(result => {
			if (!result.value) {
				// Si cancela, detenemos el spinner
				this.charging = false;
				return;
			}

			// Si confirma, enviamos la información
			this.api.postStudentDetailInfo(this.approvalsForm.value).subscribe({
				next: async () => {
					try {
						// Obtenemos el nuevo studentID
						const newStudentID = await this.getNewStudent(this.studentInformation.PersonDocumentNumber);
						// console.log('Nuevo studentID:', newStudentID);
						// Con el nuevo ID, posteamos las asignaturas
						this.postNewSubjects(newStudentID);
						// Limpiamos formularios y estado
						this.initApprovalsForm();
						this.initHomologationForm();
						this.student = null;
						this.studentInformation = null;
						this.academicalHistory = null;

						// Mensaje de éxito
						this.common.message('Registro exitoso.', '', 'success', '#86bc57');
					} catch (searchError) {
						console.error('Error al buscar estudiante:', searchError);
						this.common.message('No se pudo obtener el nuevo ID de estudiante.', '', 'error', '#f5637e');
					} finally {
						this.charging = false;
					}
				},
				error: (err: HttpErrorResponse) => {
					console.error('Error al registrar información del estudiante:', err);
					this.common.message('Error al registrar la información.', '', 'error', '#f5637e');
					this.charging = false;
				}
			});
		});
	}

	public postNewSubjects(newStudentID: number): void {
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
				'recognitionTypeID'
			]))
			obj.studentID = newStudentID; // Asigna el nuevo studentID
			// console.log('Objeto antes del push:', obj); // <-- Depuración
			if(obj.courseID && obj.creditFate && obj.gradeFate) json.push(obj);
		}
		// console.log('JSON final a enviar:', json);
		// console.log(newStudentID);
		let arr = {'news': json};
		//console.log(arr);
		this.admin.postNewSubjects(arr).subscribe({
			next: (res) => {
				//console.log(res);
				this.initApprovalsForm();
				this.initHomologationForm();
				this.common.message(`Registro exitoso.`,'','success','#86bc57');
				this.student= null;
				this.studentInformation= null;
				this.academicalHistory= null;
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
