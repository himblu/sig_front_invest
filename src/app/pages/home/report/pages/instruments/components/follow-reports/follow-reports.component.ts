import { Component, ViewChild, ElementRef, OnInit, OnDestroy, inject, SecurityContext, Input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { NgFor, NgForOf, NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpErrorResponse } from '@angular/common/http';
import { filter, map, Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { Period } from '@utils/interfaces/period.interfaces';
import { CurrentPeriod } from '@utils/interfaces/others.interfaces';
import { UserService } from '@services/user.service';
import { CycleDetail, EvaluationInstrumentsReport, EvaluationInstrumentsTeacherFollowup, ModalityByCareer, School, SPGetCareer, StudyPlan } from '@utils/interfaces/campus.interfaces';
import { ROL } from '@utils/interfaces/login.interfaces';
import { DomSanitizer } from '@angular/platform-browser';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-follow-reports',
  standalone: true,
  imports: [
		ReactiveFormsModule,
		NgForOf,
		NgFor,
		NgIf,
		MatInputModule,
		MatButtonModule,
		MatFormFieldModule,
		MatSelectModule,
		MatTooltipModule,
		MatIconModule,
		MatPaginatorModule,
		MatSnackBarModule,
		MatMenuModule,
	],
  templateUrl: './follow-reports.component.html',
  styleUrls: ['./follow-reports.component.css']
})
export class FollowReportsComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public charging: boolean = false;
	public filtersForm!: FormGroup;
	@Input('periods') periods: Period[] = [];
	@Input('currentPeriod') currentPeriod: CurrentPeriod;
	private personID: number= this.user.currentUser.PersonId;
	protected readonly ROL = ROL;
	public currentRol = sessionStorage.getItem('rol');
	public schools: School[] = [];
	public careers: SPGetCareer[] = [];
	public study_plan: StudyPlan[] = [];
	public modalities: ModalityByCareer[] = [];
	public cycles: CycleDetail[] = [];
	public pageIndex: number = 1;
  public pageSize: number = 10;
	public length: number = 0;
	public pageEvent!: PageEvent;
  public pageSizeOptions: number[] = [5, 10, 25, 50, 100];
	public isCoordinator: boolean;
	public teachersList: EvaluationInstrumentsTeacherFollowup[] = [];
	public evaluationInstrumentsReport: EvaluationInstrumentsReport[] = [];
	public isDisabledReports:boolean =true;
	public isDisabledReport:boolean =true;
	private sanitizer: DomSanitizer = inject(DomSanitizer);
	private snackBar: MatSnackBar = inject(MatSnackBar);

	constructor(private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private activatedRoute: ActivatedRoute,
		private user: UserService ){
		super();
		this.initForm();
	}

	ngOnInit(): void {
		this.filtersForm.get('periodID').patchValue(this.currentPeriod.periodID);
		// this.userRol();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	public initForm(): void {
		this.filtersForm = this.fb.group({
			evaluationOrFollowup: [null, Validators.required],
			typeEvaluationInstrumentID: [null, Validators.required],
			periodID: ['', Validators.required],
			schoolID: ['', Validators.required],
			careerID: ['', Validators.required],
			studyPlanID: ['', Validators.required],
			modalityID: ['', Validators.required],
			cycleID: ['', Validators.required],
			filter: [''],
			page: [1],
			size: [10],
		});
	}

	private userRol(): void {
		if(this.user.currentUser.rolName === ROL.CAREERCOORDINATOR || this.currentRol === ROL.CAREERCOORDINATOR){
			this.isCoordinator= true;
			this.getSchoolsByCoordinator();
		}else if(this.user.currentUser.rolName === ROL.QUALITY || this.currentRol === ROL.QUALITY){
			this.isCoordinator= false;
			this.getSchoolsByPeriod();
		}else{
			this.isCoordinator= false;
			this.getSchoolsByDirector();
		}
	}

	public getSchoolsByDirector(): void {
		this.charging= true;
		this.api.getSchoolsByDirector(this.personID).subscribe({
			next: (res) => {
				//console.log(res);
				this.schools = res;
				this.charging= false;
			},
			error: (err: HttpErrorResponse) => {
				this.charging= false;
			}
		});
	}

	public getSchoolsByCoordinator(): void{
		this.admin.getSchoolsByPerson(this.personID).subscribe({
			next: (res) => {
				this.schools = res;
			},
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
			}
		});
	}

	public getSchoolsByPeriod(): void{
		this.admin.getSchoolsByPeriod(this.filtersForm.get('periodID').value).subscribe({
			next: (res) => {
				this.schools = res;
			},
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
			}
		});
	}

	public getEvaluationInstruments(): void {
		const filters= this.filtersForm;
		filters.get('evaluationOrFollowup').patchValue(null);
		filters.get('typeEvaluationInstrumentID').patchValue(null);
		filters.get('schoolID').patchValue('');
		filters.get('careerID').patchValue('');
		filters.get('studyPlanID').patchValue('');
		filters.get('modalityID').patchValue('');
		filters.get('cycleID').patchValue('');
		filters.get('filter').patchValue('');
		this.evaluationInstrumentsReport = [];
		this.teachersList = [];
		this.schools = [];
		this.careers = [];
		this.study_plan = [];
		this.modalities = [];
		this.cycles = [];
		this.length = 0;
		this.isDisabledReports=true;
		this.isDisabledReport=true;
	}

	public getSchools(): void {
		const filters= this.filtersForm;
		filters.get('schoolID').patchValue('');
		filters.get('careerID').patchValue('');
		filters.get('studyPlanID').patchValue('');
		filters.get('modalityID').patchValue('');
		filters.get('cycleID').patchValue('');
		filters.get('filter').patchValue('');
		this.teachersList = [];
		this.schools = [];
		this.careers = [];
		this.study_plan = [];
		this.modalities = [];
		this.cycles = [];
		this.length = 0;
		this.isDisabledReports=false;
		this.isDisabledReport=true;
		this.userRol();
	}

	public getCareers(): void {
		const filters= this.filtersForm;
		filters.get('careerID').patchValue('');
		filters.get('studyPlanID').patchValue('');
		filters.get('modalityID').patchValue('');
		filters.get('cycleID').patchValue('');
		filters.get('filter').patchValue('');
		this.teachersList = [];
		this.careers = [];
		this.study_plan = [];
		this.modalities = [];
		this.cycles = [];
		this.length = 0;
		this.isDisabledReports=false;
		this.isDisabledReport=true;
		let serviceUrl;
		if(this.isCoordinator === true) serviceUrl= this.admin.getCareersByPerson(this.personID, filters.value.schoolID)
		else serviceUrl= this.admin.getCareersBySchool(filters.value.periodID, filters.value.schoolID)
		serviceUrl.subscribe({
			next: (res) => {
				this.careers = res;
			},
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
			}
		});
	}

	public getStudyPlan(careerID: number): void{
		const filters= this.filtersForm;
		filters.get('studyPlanID').patchValue('');
		filters.get('modalityID').patchValue('');
		filters.get('cycleID').patchValue('');
		filters.get('filter').patchValue('');
		this.teachersList = [];
		this.study_plan = [];
		this.modalities = [];
		this.cycles = [];
		this.length = 0;
		this.isDisabledReports=false;
		this.isDisabledReport=true;
		this.admin.getStudyPlansByCareer(careerID).subscribe({
			next: (res) => {
				this.study_plan = res;
			},
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
			}
		});
	}

	public getModalities(careerID: number): void{
		this.admin.getModalitiesByCareer(careerID).subscribe({
			next: (res) => {
				this.modalities= res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getCycles(studyPlanID: number): void{
		const filters= this.filtersForm;
		filters.get('cycleID').patchValue('');
		filters.get('filter').patchValue('');
		this.teachersList = [];
		this.cycles = [];
		this.length = 0;
		this.isDisabledReports=false;
		this.isDisabledReport=true;
		this.admin.getCyclesByCareerAndStudyPlan(studyPlanID, this.filtersForm.get('careerID').value).subscribe({
			next: (res: CycleDetail[]) => {
					this.cycles= res;
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	public getEvaluationInstrumentsReport(): void{
		const filters= this.filtersForm;
		filters.get('typeEvaluationInstrumentID').patchValue(null);
		filters.get('schoolID').patchValue('');
		filters.get('careerID').patchValue('');
		filters.get('studyPlanID').patchValue('');
		filters.get('modalityID').patchValue('');
		filters.get('cycleID').patchValue('');
		filters.get('filter').patchValue('');
		this.teachersList = [];
		this.evaluationInstrumentsReport = [];
		this.teachersList = [];
		this.schools = [];
		this.careers = [];
		this.study_plan = [];
		this.modalities = [];
		this.cycles = [];
		this.length = 0;
		this.isDisabledReports=true;
		this.isDisabledReport=true;
		this.admin.getEvaluationInstrumentsReport(this.filtersForm.get('evaluationOrFollowup').value).subscribe({
			next: (res) => {
				this.evaluationInstrumentsReport= res;
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	public getEvaluationInstrumentsTeacherFollowup(): void{
		this.filtersForm.get('page').patchValue(this.pageIndex);
		this.filtersForm.get('size').patchValue(this.pageSize);
		if(this.filtersForm.valid){
			//console.log(this.filtersForm.value);
			this.admin.getEvaluationInstrumentsTeacherFollowup(this.filtersForm.value).subscribe({
				next: (res) => {
					//console.log('EvaluationInstrumentsTeacherFollowup', res);
					this.teachersList = res.data;
					this.length = res.count;
				},
				error: (err: HttpErrorResponse) => {
				}
			});
		}else{
			this.filtersForm.markAllAsTouched();
		}
	}

	public changePage(event: PageEvent): PageEvent {
		this.pageIndex = event.pageIndex+1;
    this.pageSize = event.pageSize;
		this.getEvaluationInstrumentsTeacherFollowup();
    return event;
	}

	public getGeneralReport(rute: string, teacher?: EvaluationInstrumentsTeacherFollowup): void{
		//console.log('teacher', teacher);
		if(this.filtersForm.valid){
			const fileName ='reporte evaluacion'
			let filters= this.filtersForm.value;
			let body= {
				"evaluationOrFollowup": filters.evaluationOrFollowup,
				"periodID": filters.periodID,
				"teacherID": teacher?.teacherID || 0,
				"modalityID": filters.modalityID,
				"schoolID": filters.schoolID,
				"careerID": filters.careerID,
				"studyPlanID": filters.studyPlanID,
				"courseID": teacher?.courseID || 0,
				"cycleID": filters.cycleID,
				"typeEvaluationInstrumentID": filters.typeEvaluationInstrumentID,
				"evaluationInstrumentsID": teacher?.evaluationInstrumentsID || 0,
				"parallelCode": teacher?.parallelCode || 0
			}
			this.admin.getReportInstruments(rute, body).subscribe({
				next: (res) => {
				if (res.body) {
					const contentType = res.headers.get('content-type') || undefined;
					
					const blob = new Blob([res.body], { type: contentType });
					const url = this.sanitizer.sanitize(
						SecurityContext.RESOURCE_URL, 
						this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob))
					); 
					if (url) {
						if(contentType === 'application/pdf'){
							window.open(url, '_blank');
						}else{
							const link = document.createElement('a');
							link.href = url;
							link.download = fileName;
							document.body.appendChild(link);
							link.click();

							// Limpiar memoria
							URL.revokeObjectURL(link.href);
							document.body.removeChild(link);
						}
					}
				}
			},
			error: (err: HttpErrorResponse) => {
				// console.error('Error al obtener el reporte:', err);
				this.snackBar.open(
					`No hay datos disponibles para generar el reporte.`,
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
			this.filtersForm.markAllAsTouched();
		}
	}

	public getReportPendingStudents(teacher: EvaluationInstrumentsTeacherFollowup): void{
		//console.log('teacher', teacher);
		this.admin.getReportPendingStudents(teacher.settingEvaluationInstrumentID, this.filtersForm.get('periodID').value).subscribe({
			next: (res) => {
				//console.log('report', res);
				if(res.body){
					let contentType: string | null | undefined = res.headers.get('content-type');
					// Porque el tipo de variable que recibe el type es string o undefined. No recibe null.
					if (!contentType) {
						contentType = undefined;
					}
					const blob: Blob = new Blob([res.body], { type: contentType });
					const url = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob)));
					if (url) {
						window.open(url, '_blank');
					}
				}
			},
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
			}
		});
	}

	public getFollowList(): void{
		this.filtersForm.get('page').patchValue(this.pageIndex);
		this.filtersForm.get('size').patchValue(this.pageSize);
		if(this.filtersForm.valid){
			//console.log(this.filtersForm.value);
			this.admin.getEvaluationInstrumentsTeacherFollowup(this.filtersForm.value).subscribe({
				next: (res) => {
					this.teachersList = res.data;
					this.length = res.count;
				},
				error: (err: HttpErrorResponse) => {
				}
			});
		}else{
			this.filtersForm.markAllAsTouched();
		}
	}

	public getReport(){
		this.teachersList = [];
		this.length = 0;
		this.isDisabledReport=false;
	}

	public getGeneralReportSumary(rute: string, evaluationInstrumentsID?: number,activityID?:number): void{
		const fileName =activityID!==undefined ? this.getReportName(evaluationInstrumentsID, activityID): 'REPORTE EVALUACIÓN';
		let filters= this.filtersForm.value;
		let body= {
			"periodID": filters.periodID,
			"evaluationInstrumentsID": evaluationInstrumentsID  ?? 1,
			"activityID": activityID ?? 1
		}
		this.admin.getReportInstruments(rute, body).subscribe({
			next: (res) => {
			if (res.body) {
				const contentType = res.headers.get('content-type') || undefined;
				
				const blob = new Blob([res.body], { type: contentType });
				const url = this.sanitizer.sanitize(
					SecurityContext.RESOURCE_URL, 
					this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob))
				); 
				if (url) {
					if(contentType === 'application/pdf'){
						window.open(url, '_blank');
					}else{
						const link = document.createElement('a');
						link.href = url;
						link.download = fileName;
						document.body.appendChild(link);
						link.click();

						// Limpiar memoria
						URL.revokeObjectURL(link.href);
						document.body.removeChild(link);
					}
				}
			}
		},
		error: (err: HttpErrorResponse) => {
			// console.error('Error al obtener el reporte:', err);
			this.snackBar.open(
				`No hay datos disponibles para generar el reporte.`,
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
	}

	getReportName(evaluationInstrumentsID?: number, activityID?: number): string {
		let nameReport = 'REPORTE ';
	  
		const activities = [
		  { activityID: 1, activityDesc: "DOCENCIA-" },
		  { activityID: 3, activityDesc: "GESTIÓN-ACADÉMICA-" },
		  { activityID: 4, activityDesc: "INVESTIGACIÓN-" },
		  { activityID: 5, activityDesc: "VINCULACIÓN-" }
		];
	  
		const evaluations = [
		  { evaluationInstrumentsID: 1, evaluationName: "HETEROEVALUACIÓN" },
		  { evaluationInstrumentsID: 3, evaluationName: "AUTOEVALUACIÓN" },
		  { evaluationInstrumentsID: 7, evaluationName: "COEVALUACIÓN-PARES-DOCENTES" },
		  { evaluationInstrumentsID: 8, evaluationName: "COEVALUACIÓN-PARES-DIRECTIVOS" },
		  { evaluationInstrumentsID: 23, evaluationName: "HETEROEVALUACIÓN-PROYECTO-EJECUCIÓN" },
		  { evaluationInstrumentsID: 24, evaluationName: "HETEROEVALUACIÓN-PROYECTO-TERMINADO" },
		  { evaluationInstrumentsID: 26, evaluationName: "HETEROEVALUACIÓN-PROYECTO-DIVULGACIÓN" },
		  { evaluationInstrumentsID: 21, evaluationName: "AUTOEVALUACIÓN" },
		  { evaluationInstrumentsID: 22, evaluationName: "COEVALUACIÓN-PARES-INVESTIGADORES" },
		  { evaluationInstrumentsID: 25, evaluationName: "COEVALUACIÓN-PARES-DIRECTIVOS" },
		  { evaluationInstrumentsID: 2, evaluationName: "HETEROEVALUACIÓN" },
		  { evaluationInstrumentsID: 6, evaluationName: "AUTOEVALUACIÓN" },
		  { evaluationInstrumentsID: 20, evaluationName: "COEVALUACIÓN-PARES-DOCENTES" },
		  { evaluationInstrumentsID: 11, evaluationName: "COEVALUACIÓN-PARES-DIRECTIVOS" },
		  { evaluationInstrumentsID: 9, evaluationName: "HETEROEVALUACIÓN" },
		  { evaluationInstrumentsID: 4, evaluationName: "AUTOEVALUACIÓN" },
		  { evaluationInstrumentsID: 19, evaluationName: "COEVALUACIÓN-PARES-DOCENTES" },
		  { evaluationInstrumentsID: 10, evaluationName: "COEVALUACIÓN-PARES-DIRECTIVOS" },
		];
	  
		switch (activityID) {
			case 1:
			  nameReport += activities.find(a => a.activityID === activityID)?.activityDesc || '';
			  break;
			case 3:
			  nameReport += activities.find(a => a.activityID === activityID)?.activityDesc || '';
			  break;
			case 4:
			  nameReport += activities.find(a => a.activityID === activityID)?.activityDesc || '';
			  break;
			case 5:
			  nameReport += activities.find(a => a.activityID === activityID)?.activityDesc || '';
			  break;
			default:
			  nameReport += '';
			  break;
		}

		switch (evaluationInstrumentsID) {
			case 1:
			  nameReport += evaluations.find(e => e.evaluationInstrumentsID === evaluationInstrumentsID)?.evaluationName || '';
			  break;
			case 3:
			  nameReport += evaluations.find(e => e.evaluationInstrumentsID === evaluationInstrumentsID)?.evaluationName || '';
			  break;
			case 7:
			  nameReport += evaluations.find(e => e.evaluationInstrumentsID === evaluationInstrumentsID)?.evaluationName || '';
			  break;
			case 8:
			  nameReport += evaluations.find(e => e.evaluationInstrumentsID === evaluationInstrumentsID)?.evaluationName || '';
			  break;
			case 23:
			  nameReport += evaluations.find(e => e.evaluationInstrumentsID === evaluationInstrumentsID)?.evaluationName || '';
			  break;
			case 24:
			  nameReport += evaluations.find(e => e.evaluationInstrumentsID === evaluationInstrumentsID)?.evaluationName || '';
			  break;
			case 26:
			  nameReport += evaluations.find(e => e.evaluationInstrumentsID === evaluationInstrumentsID)?.evaluationName || '';
			  break;
			case 21:
			  nameReport += evaluations.find(e => e.evaluationInstrumentsID === evaluationInstrumentsID)?.evaluationName || '';
			  break;
			case 22:
			  nameReport += evaluations.find(e => e.evaluationInstrumentsID === evaluationInstrumentsID)?.evaluationName || '';
			  break;
			case 25:
			  nameReport += evaluations.find(e => e.evaluationInstrumentsID === evaluationInstrumentsID)?.evaluationName || '';
			  break;
			case 2:
			  nameReport += evaluations.find(e => e.evaluationInstrumentsID === evaluationInstrumentsID)?.evaluationName || '';
			  break;
			case 6:
			  nameReport += evaluations.find(e => e.evaluationInstrumentsID === evaluationInstrumentsID)?.evaluationName || '';
			  break;
			case 20:
			  nameReport += evaluations.find(e => e.evaluationInstrumentsID === evaluationInstrumentsID)?.evaluationName || '';
			  break;
			case 11:
			  nameReport += evaluations.find(e => e.evaluationInstrumentsID === evaluationInstrumentsID)?.evaluationName || '';
			  break;
			case 9:
			  nameReport += evaluations.find(e => e.evaluationInstrumentsID === evaluationInstrumentsID)?.evaluationName || '';
			  break;
			case 4:
			  nameReport += evaluations.find(e => e.evaluationInstrumentsID === evaluationInstrumentsID)?.evaluationName || '';
			  break;
			case 19:
			  nameReport += evaluations.find(e => e.evaluationInstrumentsID === evaluationInstrumentsID)?.evaluationName || '';
			  break;
			case 10:
			  nameReport += evaluations.find(e => e.evaluationInstrumentsID === evaluationInstrumentsID)?.evaluationName || '';
			  break;
			default:
			  nameReport += '';
			  break;
		}
		return nameReport;
	  }
	  
}
