import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, FormArray } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { NgForOf, NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { InputSearchComponent } from '@components/input-shearch/input-search.component';
import { ButtonArrowComponent } from '@components/button-arrow/button-arrow.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatTableModule } from '@angular/material/table';
import { ComponentPeriod, Period } from '@utils/interfaces/period.interfaces';
import { CurrentPeriod, TeacherFollowUp, TimeAvailabilityTeacher } from '@utils/interfaces/others.interfaces';
import { SPGetCareer, School, StudyPlan, TeachingProcess } from '@utils/interfaces/campus.interfaces';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-teacher-follow-up',
  templateUrl: './teacher-follow-up.component.html',
  styleUrls: ['./teacher-follow-up.component.css'],
	standalone: true,
	imports: [
		NgIf,
		NgForOf,
		ReactiveFormsModule,
		MatInputModule,
		MatButtonModule,
		MatFormFieldModule,
		MatSelectModule,
		InputSearchComponent,
		ButtonArrowComponent,
		MatTooltipModule,
		MatIconModule,
		CdkAccordionModule,
		MatTableModule,
		MatProgressBarModule
	],
	animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class TeacherFollowUpComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	charging: boolean = false;
	periods:Period[];
	currentPeriod:CurrentPeriod;
	public filtersForm!: FormGroup;
	actualTeachers: number = 1;
	totalPageTeachers: number = 0;
	countTeachers: number = 0;
	pageLimit:number = 10;
	public teachers:TeacherFollowUp[];
	public componentPeriod:ComponentPeriod[];
	public schools: School[];
	public careers: SPGetCareer[];
	public studyPlans: StudyPlan[];
	public teachingProcess: TeachingProcess[];
	public partial1:ComponentPeriod;
	public partial2:ComponentPeriod;
	columnsToDisplay = [
			'teacher',
			'documentNumber',
			'amount'
		];
	expandedElement: TeacherFollowUp | null;

	constructor( private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService ){
			super();
		}

	public ngOnInit(): void {
		this.initForm();
		this.getCurrentPeriod();
		this.getPeriods();
	}

	public override ngOnDestroy() {
    super.ngOnDestroy();
  }

	public initForm():void{
    this.filtersForm = this.fb.group({
      schoolID: ['', [Validators.required]],
			careerID: ['', [Validators.required]],
			periodID: ['', [Validators.required]],
			studyPlanID: ['', [Validators.required]],
    });
	}

	public changePageTeachers(page:number):void {
		this.actualTeachers = page;
		this.searchTeachers();
	}

	public searchTeachers():void {
    this.admin.getTeacherFollowUp(this.filtersForm.get('periodID').value, this.filtersForm.get('schoolID').value, this.filtersForm.get('careerID').value, this.filtersForm.get('studyPlanID').value,
			this.actualTeachers, this.pageLimit).subscribe({
      next: (res) => {
				//console.log(res);
        this.teachers = res.data;
				this.countTeachers = res.count;
				if(this.countTeachers<=this.pageLimit){
					this.totalPageTeachers=1
				}else{
					this.totalPageTeachers = Math.ceil(this.countTeachers / this.pageLimit);
				}
      }
    });
  }

	private getCurrentPeriod(): void {
		this.charging = true;
    this.api.getCurrentPeriod().subscribe({
      next: (res: CurrentPeriod) => {
        this.currentPeriod = res;
				this.filtersForm.get('periodID').patchValue(this.currentPeriod.periodID);
				this.getActivities(this.currentPeriod.periodID);
				this.getSchoolsByPeriod(this.currentPeriod.periodID);
				this.charging = false;
      },
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
				this.charging = false;
			}
    });
  }

	private getPeriods(): void {
		this.charging = true;
    this.api.getPeriods().subscribe({
      next: (res) => {
        this.periods = res.data;
				this.charging = false;
      },
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
				this.charging = false;
			}
    });
  }

	// Al cambiar de periodo, traer las escuelas
	public getSchoolsByPeriod(periodID :number= this.currentPeriod.periodID): void {
		this.schools= [];
		this.filtersForm.reset({periodID: periodID});
		this.admin.getSchoolsByPeriod(periodID).subscribe({
			next: (res) => {
				this.schools=res;
			},
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
			}
		});
	}

	// Al cambiar de escuela, traer las carreras
	public getCareersBySchool(schoolID: number): void {
		this.filtersForm.get('careerID').patchValue('');
		this.filtersForm.get('studyPlanID').patchValue('');
		this.admin.getCareersBySchool(this.filtersForm.get('periodID').value, schoolID).subscribe({
			next: (res) => {
				this.careers = res;
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	public getStudyPlansByCareer(careerID: number): void {
		this.filtersForm.get('studyPlanID').patchValue('');
		this.admin.getStudyPlansByCareer(careerID).subscribe({
			next: (res) => {
				this.studyPlans = res;
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	public getTeachingProcess(personID: number): void {
		console.log(personID);
		this.teachingProcess=null;
		this.admin.getTeachingProcess(this.filtersForm.get('periodID').value, this.filtersForm.get('schoolID').value, this.filtersForm.get('careerID').value,
			this.filtersForm.get('studyPlanID').value, personID).subscribe({
			next: (res) => {
				//console.log(res);
				this.teachingProcess=res;
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	public getActivities(periodID:number): void {
		this.charging = true;
    this.api.getComponentGrades(periodID).subscribe({
      next: (res) => {
				//console.log(res);
        this.componentPeriod = res;
				this.partial1 = res[0];
				this.partial2 = res[1];
				this.charging = false;
      },
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
				this.charging = false;
			}
    });
  }

}
