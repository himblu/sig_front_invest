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
import { CourseToInstrument, CycleDetail, EvaluationInstrumentsReport, EvaluationInstrumentsTeacherFollowup, ModalityByCareer, School, SPGetCareer, StudyPlan } from '@utils/interfaces/campus.interfaces';
import { ROL } from '@utils/interfaces/login.interfaces';
import { DomSanitizer } from '@angular/platform-browser';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-subject-reports',
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
		MatMenuModule
	 ],
  templateUrl: './subject-reports.component.html',
  styleUrls: ['./subject-reports.component.css']
})
export class SubjectReportsComponent extends OnDestroyMixin implements OnInit, OnDestroy {

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
	public subjectsList: CourseToInstrument[] = [];

	private sanitizer: DomSanitizer = inject(DomSanitizer);

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
		this.userRol();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	public initForm(): void {
		this.filtersForm= this.fb.group({
			periodID: ['', Validators.required],
			schoolID: ['', Validators.required],
			careerID: ['', Validators.required],
			studyPlanID: ['', Validators.required],
			modalityID: ['', Validators.required],
			cycleID: ['', Validators.required],
			filter: [''],
			page: [1],
			size: [10],
		})
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

	public getSchools(): void {
		const filters= this.filtersForm;
		filters.get('schoolID').patchValue('');
		filters.get('careerID').patchValue('');
		filters.get('studyPlanID').patchValue('');
		filters.get('modalityID').patchValue('');
		filters.get('cycleID').patchValue('');
		filters.get('filter').patchValue('');
		this.subjectsList = [];
		this.length = 0;
		this.userRol();
	}

	public getCareers(): void {
		const filters= this.filtersForm;
		filters.get('careerID').patchValue('');
		filters.get('studyPlanID').patchValue('');
		filters.get('modalityID').patchValue('');
		filters.get('cycleID').patchValue('');
		filters.get('filter').patchValue('');
		this.subjectsList = [];
		this.length = 0;
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
		this.subjectsList = [];
		this.length = 0;
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
		filters.get('modalityID').patchValue('');
		filters.get('cycleID').patchValue('');
		filters.get('filter').patchValue('');
		this.subjectsList = [];
		this.length = 0;
		this.admin.getCyclesByCareerAndStudyPlan(studyPlanID, this.filtersForm.get('careerID').value).subscribe({
			next: (res: CycleDetail[]) => {
					this.cycles= res;
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	public getSubjectsList(): void{
		this.filtersForm.get('page').patchValue(this.pageIndex);
		this.filtersForm.get('size').patchValue(this.pageSize);
		if(this.filtersForm.valid){
			//console.log(this.filtersForm.value);
			this.admin.getCoursesToInstrumentsReports(this.filtersForm.value).subscribe({
				next: (res) => {
					//console.log('CoursesToInstrumentsReports', res);
					this.subjectsList = res.data;
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
		this.getSubjectsList();
    return event;
	}

	public getGeneralReport(rute: string, item?: CourseToInstrument): void{
		//console.log('item', item);
		if(this.filtersForm.valid){
			let personID= 0;
			if(this.isCoordinator) personID= this.personID;
			let body= {
				"periodID": item.periodID,
				"classSectionNumber": item.classSectionNumber,
				"courseID": item.courseID,
				"personID": item.personID,
				"coordinatorPersonID": personID,
				"schoolID": item.schoolID,
				"careerID": item.careerID,
				"studyPlanID": item.studyPlanID
			}
			this.admin.getReportInstruments(rute, body).subscribe({
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
		}else{
			this.filtersForm.markAllAsTouched();
		}
	}

}
