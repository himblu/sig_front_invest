import { Component, ViewChild, ElementRef, OnInit, OnDestroy, SecurityContext, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule, MatOptionSelectionChange } from '@angular/material/core';
import { UserService } from '@services/user.service';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MatStepperModule } from '@angular/material/stepper';
import { MatStepper } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Canton, CurrentPeriod, Parish, Province } from '@utils/interfaces/others.interfaces';
import { AgreementBusinessCareer, CareerAgreement, CourseOfPractice, CycleDetail, ListStudent, ListTeacher, Project, ProjectPracticeModality, SPGetCareer, SPGetModality, School, StudyPlan, TotalStudents, TotalTeachers } from '@utils/interfaces/campus.interfaces';
import { AgreementConvention, ProgramType, ProjectCode } from '@utils/interfaces/person.interfaces';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Period } from '@utils/interfaces/period.interfaces';
import { map } from 'rxjs';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-pre-professional-project',
  standalone: true,
  imports: [
		NgIf,
		NgForOf,
		ReactiveFormsModule,
		MatInputModule,
		MatButtonModule,
		MatFormFieldModule,
		MatSelectModule,
		MatTooltipModule,
		MatIconModule,
		MatNativeDateModule,
		MatMenuModule,
		MatStepperModule,
		MatDatepickerModule,
		MatAutocompleteModule,
		MatSnackBarModule,
		FormsModule,
		MatCheckboxModule
	],
	providers: [
		DatePipe,
	],
  templateUrl: './pre-professional-project.component.html',
  styleUrls: ['./pre-professional-project.component.scss']
})
export class PreProfessionalProjectComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	loading: boolean = false;
  public firstFormGroup: FormGroup;
	public School: School[]= [];
	public SPGetCareer: SPGetCareer[]= [];
	public SPGetModality: SPGetModality[]= [];
	public StudyPlan: StudyPlan[]= [];
	public CycleDetail: CycleDetail[]= [];
	public careerAgreements: CareerAgreement[] = [];
	public coursesOfPractice: CourseOfPractice[] = [];
	public agreementBusinessCareers: AgreementBusinessCareer[] = [];
	public currentPeriod: CurrentPeriod;
	public provinces: Province[] = [];
  public cantons: Canton[] = [];
  public parishes: Parish[] = [];
	public programType: ProgramType[]= [];
	public agreementConventions: AgreementConvention[] = [];
	public projectPracticeModalities: ProjectPracticeModality[] = [];
	public periods: Period[] = [];
	public isUpdating: boolean= false;

	private sanitizer: DomSanitizer = inject(DomSanitizer);

	constructor(private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private user: UserService,
		private router: Router,
		private snackBar: MatSnackBar,
		private activateRoute: ActivatedRoute,
		private datePipe: DatePipe){
		super();
	}

	public ngOnInit(): void {
		this.activateRoute.params.subscribe({
			next: (params: any) => {
				if(params.periodID && params.projectPracticasID){
					this.isUpdating= true;
					this.getGeneralProjectByID(params.periodID, params.projectPracticasID, params.careerID, params.studyPlanID);
				}
				this.initFirstFormGroup();
				this.getCurrentPeriod();
				this.getProgram();
				this.getAgreementConventions();
				this.getProjectPracticeModalities();
				this.getPeriods();
			}
		});
  }

  public override ngOnDestroy() {
    super.ngOnDestroy();
  }

	private initFirstFormGroup(): void{
    this.firstFormGroup = this.fb.group({
			p_flag_general: false,
			p_projectPracticasID: '',
			p_codeProject: ['', Validators.required],
			p_schoolID: ['', Validators.required],
			p_careerID: ['', Validators.required],
			p_modalityID: [null, Validators.required],
			p_studyPlanID: [null, Validators.required],
			p_cycleID: [''],
			p_programvincID: ['', Validators.required],
			p_objetivevincID: ['', Validators.required],
			p_nameProyect: ['', [Validators.required]],
			coursePractice: [''],
			coursesOfPractice: [''],
			p_initdateEstimated: ['', Validators.required],
			p_enddateEstimated: ['', Validators.required],
			p_numberDaysProject: ['', Validators.required],
			p_hoursPracticeProject: [''],
			p_periodID: ['', Validators.required],
			p_ruc: ['', Validators.required],
			p_numberBeneficiaries: [''],
			p_numberCodeProject: ['', Validators.required],
			p_user: this.user.currentUser.userName
    });
  }

	private getCurrentPeriod(): void{
		this.api.getCurrentPeriod().subscribe({
			next: (res: CurrentPeriod) => {
					//console.log(res);
					this.currentPeriod= res;
					this.firstFormGroup.get('p_periodID').patchValue(res.periodID);
					this.getSchool(res.periodID);
					this.loading = false;
			},
			error: (err: HttpErrorResponse) => {
					this.loading = false;
			}
		});
	}

	private getPeriods(): void {
    this.api.getItcaPeriods().subscribe({
      next: (res: any) => {
        this.periods = res.data;
      }
    });
  }

	public getSchool(periodID: number): void{
		this.admin.getSchoolsByPeriod(periodID).subscribe({
			next: (res: School[]) => {
					//console.log(res);
					this.School=res
					this.loading = false;
			},
			error: (err: HttpErrorResponse) => {
					this.loading = false;
			}
		});
	}

	public getCarrer(schoolID: number): void{
		this.admin.getCareersBySchool(this.firstFormGroup.get('p_periodID').value, schoolID).subscribe({
			next: (res: SPGetCareer[]) => {
					//console.log(res);
					this.SPGetCareer=res;
					this.loading = false;
			},
			error: (err: HttpErrorResponse) => {
					this.loading = false;
					this.SPGetCareer= [];
			}
		});
	}

	public getModality(careerID: number): void{
		this.admin.getModalitiesByCareer(careerID).subscribe({
			next: (res: SPGetModality[]) => {
					//console.log(res);
					this.SPGetModality= res
					this.admin.getStudyPlansByCareer(careerID).subscribe({
						next: (res: StudyPlan[]) => {
								//console.log(res);
								this.StudyPlan= res;
								this.loading = false;
						},
						error: (err: HttpErrorResponse) => {
								this.loading = false;
								this.StudyPlan= [];
						}
					});
					this.loading = false;
			},
			error: (err: HttpErrorResponse) => {
					this.loading = false;
					this.SPGetModality= [];
			}
		});
	}

	public getStudyPlans(studyPlanID: number): void{
		this.admin.getCyclesByCareerAndStudyPlan(studyPlanID, this.firstFormGroup.get('p_careerID').value).subscribe({
			next: (res: CycleDetail[]) => {
					//console.log(res);
					this.CycleDetail=res;
					this.loading = false;
			},
			error: (err: HttpErrorResponse) => {
					this.loading = false;
			}
		});
	}

	public getCareerAgreement(): void {
		let filters= this.firstFormGroup.value;
		this.admin.getCareerAgreement(filters.p_studyPlanID, filters.p_careerID, filters.p_cycleID).subscribe({
			next: (res: CareerAgreement[]) => {
				//console.log('careerAgreements+++', res);
				this.careerAgreements= res;
			},
			error: (err: HttpErrorResponse) => {
				this.loading = false;
			}
		});
	}

	public getAll(): void {
		this.getCourseOfPractice();
		this.getTotalStudents();
		this.getTotalTeacher();
	}

	public getCourseOfPractice(): void {
		let filters= this.firstFormGroup.value;
		this.admin.getCourseOfPractice(filters.p_studyPlanID, filters.p_careerID, filters.p_cycleID, filters.coursePractice).subscribe({
			next: (res: CourseOfPractice[]) => {
				//console.log('CourseOfPractice', res);
				this.coursesOfPractice= res;
			},
			error: (err: HttpErrorResponse) => {
				this.loading = false;
			}
		});
	}

	public getTotalStudents(): void {
		let filters= this.firstFormGroup.value;
		this.admin.getTotalStudents(filters.p_periodID, filters.p_modalityID, filters.p_studyPlanID, filters.p_careerID, filters.p_cycleID, filters.coursePractice).subscribe({
			next: (res: TotalStudents[]) => {
				//console.log('TotalStudents', res);
			},
			error: (err: HttpErrorResponse) => {
				this.loading = false;
			}
		});
	}

	public getTotalTeacher(): void {
		let filters= this.firstFormGroup.value;
		this.admin.getTotalTeacher(filters.p_periodID, filters.p_modalityID, filters.p_studyPlanID, filters.p_careerID, filters.p_cycleID, filters.coursePractice).subscribe({
			next: (res: TotalTeachers[]) => {
				//console.log('TotalTeacher', res);
			},
			error: (err: HttpErrorResponse) => {
				this.loading = false;
			}
		});
	}

	private getProgram(): void{
		this.common.getProgram(1).subscribe({
			next: (res: ProgramType[]) => {
				//console.log(res);
				this.loading = false;
				this.programType= res;
			},
			error: (err: HttpErrorResponse) => {
					this.loading = false;
			}
	});
}

	public getAgreementBusinessCareer(): void {
		let filters= this.firstFormGroup.value;
		this.admin.getAgreementBusinessCareer(filters.p_periodID, filters.p_careerID).subscribe({
			next: (res: AgreementBusinessCareer[]) => {
				//console.log('AgreementBusinessCareer', res);
				this.agreementBusinessCareers= res;
			},
			error: (err: HttpErrorResponse) => {
				this.loading = false;
			}
		});
	}

	public getProjectHours(): void {
		let arr= this.firstFormGroup.get('coursesOfPractice').value;
		let sum= 0;
		for(let i=0; i<arr.length; i++){
			sum += +arr[i].hours;
		}
		this.firstFormGroup.get('p_hoursPracticeProject').patchValue(sum*1);
	}

	public getProjectPracticeModalities(): void {
		this.admin.getProjectPracticeModalities().subscribe({
			next: (res) => {
				//console.log('ProjectPracticeModalities', res);
				this.projectPracticeModalities= res;
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	private clearValidators(key: string): void {
		this.firstFormGroup.get(key).clearValidators();
		this.firstFormGroup.get(key).updateValueAndValidity();
	}

	public validations(isUpdating: boolean): void {
		if (!this.firstFormGroup.get('p_flag_general').value && this.firstFormGroup.get('p_schoolID').value.length > 0 && this.firstFormGroup.get('p_careerID').value.length > 0){
			this.clearValidators('p_modalityID');
			this.clearValidators('p_studyPlanID');
		}else if(!this.firstFormGroup.get('p_flag_general').value && this.firstFormGroup.get('p_schoolID').value.length > 0){
			this.clearValidators('p_careerID');
			this.clearValidators('p_modalityID');
			this.clearValidators('p_studyPlanID');
		}else if(this.firstFormGroup.get('p_flag_general').value){
			this.clearValidators('p_schoolID');
			this.clearValidators('p_careerID');
			this.clearValidators('p_modalityID');
			this.clearValidators('p_studyPlanID');
		}
		if(!isUpdating) this.onSubmit();
		if(isUpdating) this.onUpdate();
	}

	private formattedDate(date: Date): string {
		return <string>this.datePipe.transform(date, 'yyyy-MM-dd');
	}

	public onSubmit(): void{
		if(this.firstFormGroup.get('p_flag_general').value) this.firstFormGroup.get('p_flag_general').patchValue(1);
		else if(!this.firstFormGroup.get('p_flag_general').value) this.firstFormGroup.get('p_flag_general').patchValue(0);
		if(this.firstFormGroup.valid){
			this.loading = true;
			this.admin.postProjectPractices(this.firstFormGroup.value).subscribe({
				next: (res: any) => {
					//console.log('post1', res);
					if(res[0].projectPracticasID){
						//this.postSubjects(res[0].projectPracticasID);
						this.firstFormGroup.get('p_projectPracticasID').patchValue(res[0].projectPracticasID);
						this.postProjectPracticesCareers();
					}else{
						this.snackBar.open(
							`Proyecto ya registrado`,
							null,
							{
								horizontalPosition: 'center',
								verticalPosition: 'top',
								duration: 4000,
								panelClass: ['red-snackbar']
							}
						);
					}
					this.loading = false;
				},
				error: (err: HttpErrorResponse) => {
					this.loading = false;
					this.snackBar.open(
						`Proyecto ya registrado`,
						null,
						{
							horizontalPosition: 'center',
							verticalPosition: 'top',
							duration: 4000,
							panelClass: ['red-snackbar']
						}
					);
				}
			});
		}else{
			this.firstFormGroup.markAllAsTouched();
		}
	}

	private postSubjects(projectPracticasID: number): void {
		this.loading = true;
		let arr= [];
		let courses= this.firstFormGroup.get('coursesOfPractice').value;
		for(let i=0; i<courses.length; i++){
			let obj= {
				p_projectPracticasID: projectPracticasID,
				p_courseID: courses[i].coursePractice,
				p_user: this.user.currentUser.userName
			}
			arr.push(obj);
		}
		this.admin.postProjectPracticesSubjects({'coursesOfPractice': arr}).subscribe({
			next: (res) => {
				//console.log('post2', res);
				this.common.message(`Registro Exitoso`,'','success','#86bc57');
				this.initFirstFormGroup();
				this.firstFormGroup.get('p_periodID').patchValue(this.currentPeriod.periodID);
				this.loading = false;
			},
			error: (err: HttpErrorResponse) => {
				this.loading = false;
			}
		});
	}

	public postProjectPracticesCareers(): void {
		this.loading = true;
		let schoolsID= this.firstFormGroup.get('p_schoolID').value;
		let careersID= this.firstFormGroup.get('p_careerID').value;
		let body= [];
		if(this.firstFormGroup.get('p_schoolID').value.length > 1){
			for(let i=0; i<this.firstFormGroup.get('p_schoolID').value.length; i++){
				let obj= {
					projectPracticasID: this.firstFormGroup.get('p_projectPracticasID').value,
					schoolID: schoolsID[i],
					careerID: this.firstFormGroup.get('p_studyPlanID').value,
					modalityID: this.firstFormGroup.get('p_modalityID').value,
					studyplanID: this.firstFormGroup.get('p_studyPlanID').value,
					userCreated: this.user.currentUser.userName,
					p_flg_gen: this.firstFormGroup.get('p_flag_general').value,
				}
				body.push(obj);
			}
		}else if(this.firstFormGroup.get('p_schoolID').value.length === 1){
			for(let i=0; i<this.firstFormGroup.get('p_careerID').value.length; i++){
				let obj= {
					projectPracticasID: this.firstFormGroup.get('p_projectPracticasID').value,
					schoolID: schoolsID[0],
					careerID: careersID[i],
					modalityID: this.firstFormGroup.get('p_modalityID').value,
					studyplanID: this.firstFormGroup.get('p_studyPlanID').value,
					userCreated: this.user.currentUser.userName,
					p_flg_gen: this.firstFormGroup.get('p_flag_general').value,
				}
				body.push(obj);
			}
		}
		//console.log(body);
		if(body.length > 0){
			this.admin.postProjectPracticesCareers({'news': body}).subscribe({
				next: (res) => {
					//console.log('post2', res);
					this.common.message(`Registro Exitoso`,'','success','#86bc57');
					this.initFirstFormGroup();
					this.firstFormGroup.get('p_periodID').patchValue(this.currentPeriod.periodID);
					this.loading = false;
				},
				error: (err: HttpErrorResponse) => {
					this.loading = false;
				}
			});
		}else if(this.firstFormGroup.get('p_flag_general').value){
			let obj: any = {
				projectPracticasID: this.firstFormGroup.get('p_projectPracticasID').value,
				schoolID: null,
				careerID: null,
				modalityID: null,
				studyplanID: null,
				userCreated: this.user.currentUser.userName,
				p_flg_gen: this.firstFormGroup.get('p_flag_general').value,
			}
			body.push(obj);
			this.admin.postProjectPracticesCareers({'news': body}).subscribe({
				next: (res) => {
					//console.log('post2', res);
					this.common.message(`Registro Exitoso`,'','success','#86bc57');
					this.initFirstFormGroup();
					this.firstFormGroup.get('p_periodID').patchValue(this.currentPeriod.periodID);
					this.loading = false;
				},
				error: (err: HttpErrorResponse) => {
					this.loading = false;
				}
			});
		}
	}

	public getAgreementConventions(): void{
		this.loading = true;
		this.common.getAgreementConventionsAll().subscribe({
			next: (res) => {
				//console.log('AgreementConventions', res);
				this.agreementConventions= res;
				this.loading = false;
			},
			error: (err: HttpErrorResponse) => {
					this.loading = false;
			}
		});
	}

	public dateDiff(): void  {
		const endDate= new Date(this.firstFormGroup.get('p_enddateEstimated').value);
		const initDate= new Date(this.firstFormGroup.get('p_initdateEstimated').value);
    let res = Math.round(
			((+endDate)	- (+initDate)) / (1000 * 60 * 60 * 24)
		);
		this.firstFormGroup.get('p_numberDaysProject').patchValue(res);
	}

	public getCodeProject(event: MatOptionSelectionChange, item: AgreementConvention): void {
		if(event.isUserInput){
			this.firstFormGroup.get('p_numberCodeProject').patchValue(item.codeNumber);
		}
	}

	public wordLimit(input: HTMLTextAreaElement, hint: any, limit: number):void{
    let val = input.value
    let words = val.split(/\s+/);
    let legal = "";
		let i;
    for(i = 0; i < words.length; i++) {
        if(i < limit) {
            legal += words[i] + " ";
        }
        if(i >= limit) {
            input.value = legal;
        }
				hint.textContent='Palabras: '+i
    }
	}

	public validateCode(code: string): void {
		this.common.getValidatePracticesCode(code).subscribe({
			next: (res: ProjectCode) => {
				if(res.existCodeProject === 1){
					this.snackBar.open(
						`Código ya registrado`,
						null,
						{
							horizontalPosition: 'center',
							verticalPosition: 'top',
							duration: 4000,
							panelClass: ['red-snackbar']
						}
					);
					this.firstFormGroup.get('p_codeProject').patchValue('');
				}
			},
				error: (err: HttpErrorResponse) => {
					this.loading = false;
			}
		});
	}

	public getGeneralProjectByID(periodID: number, projectPracticasID: number, careerID: number, studyPlanID: number): void{
		this.loading = true;
		this.admin.getProjectPracticesByID(periodID, projectPracticasID, careerID, studyPlanID).subscribe({
			next: (res: Project[]) => {
				//console.log('GeneralProject', res);
				let schools= [];
				let careers= [];
				schools.push(res[0].schoolID);
				careers.push(res[0].careerID);
				this.firstFormGroup.get('p_projectPracticasID').patchValue(res[0].projectPracticasID);
				this.firstFormGroup.get('p_periodID').patchValue(res[0].periodID);
				this.firstFormGroup.get('p_careerID').patchValue(careers);
				this.firstFormGroup.get('p_codeProject').patchValue(res[0].codeProject);
				this.firstFormGroup.get('p_schoolID').patchValue(schools);
				this.firstFormGroup.get('p_modalityID').patchValue(res[0].modalityID);
				this.firstFormGroup.get('p_studyPlanID').patchValue(res[0].studyPlanID)
				//this.firstFormGroup.get('p_cycleID').patchValue(res[0].cycleID);
				this.firstFormGroup.get('p_programvincID').patchValue(res[0].programvincID);
				this.firstFormGroup.get('p_objetivevincID').patchValue(res[0].modalityPracticeID);
				this.firstFormGroup.get('p_nameProyect').patchValue(res[0].nameProyect);
				this.firstFormGroup.get('p_initdateEstimated').patchValue(this.formattedDate(res[0].initdateEstimated));
				this.firstFormGroup.get('p_enddateEstimated').patchValue(this.formattedDate(res[0].enddateEstimated));
				this.firstFormGroup.get('p_numberDaysProject').patchValue(res[0].numberDaysProject);
				//this.firstFormGroup.get('p_hoursPracticeProject').patchValue(res[0].hoursPracticeProject);
				this.firstFormGroup.get('p_ruc').patchValue(res[0].ruc);
				this.firstFormGroup.get('p_numberBeneficiaries').patchValue(res[0].numberBeneficiaries);
				this.firstFormGroup.get('p_numberCodeProject').patchValue(res[0].numberCodeProject);
				this.getCarrer(res[0].schoolID);
				this.getModality(res[0].careerID);
				this.getStudyPlans(res[0].studyPlanID);
				this.loading = false;
			},
			error: (err: HttpErrorResponse) => {
				this.loading = false;
			}
		});
	}

	public onUpdate(): void{
		if(this.firstFormGroup.get('p_flag_general').value) this.firstFormGroup.get('p_flag_general').patchValue(1);
		else if(!this.firstFormGroup.get('p_flag_general').value) this.firstFormGroup.get('p_flag_general').patchValue(0);
		if(this.firstFormGroup.valid){
			this.loading = true;
			this.admin.putProjectPractices(this.firstFormGroup.value).subscribe({
				next: (res: any) => {
					//console.log('put', res);
					this.common.message(`${res.message}`,'','success','#86bc57');
					this.initFirstFormGroup();
					this.firstFormGroup.get('p_periodID').patchValue(this.currentPeriod.periodID);
					this.loading = false;
					this.router.navigateByUrl('/vinculacion-director/lista-proyectos');
				},
				error: (err: HttpErrorResponse) => {
					this.loading = false;
					this.snackBar.open(
						`No se pudo actualizar, intente más tarde.`,
						null,
						{
							horizontalPosition: 'center',
							verticalPosition: 'top',
							duration: 4000,
							panelClass: ['red-snackbar']
						}
					);
				}
			});
		}else{
			this.firstFormGroup.markAllAsTouched();
		}
	}

}
