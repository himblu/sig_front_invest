import { Component, ViewChild, ElementRef, OnInit, OnDestroy, SecurityContext, inject } from '@angular/core';
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
import { Period } from '@utils/interfaces/period.interfaces';
import { SPGetCareer, School, StudyPlan } from '@utils/interfaces/campus.interfaces';
import { SyllabusSubject } from '@utils/interfaces/others.interfaces';
import { DomSanitizer } from '@angular/platform-browser';
import { UserService } from '@services/user.service';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-pea-list',
  templateUrl: './pea-list.component.html',
  styleUrls: ['./pea-list.component.css'],
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
		MatPaginatorModule
	],
})
export class PeaListComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	charging: boolean = false;
	public filtersForm!: FormGroup;
	public pageIndex: number = 1;
  public pageSize: number = 10;
  public length: number = 0;
	public pageEvent!: PageEvent;
  public pageSizeOptions: number[] = [5, 10, 25, 50, 100];
	peaList: SyllabusSubject[];
	periods: Period[];
	schools: School[];
	careers: SPGetCareer[];
	study_plan: StudyPlan[];

	private sanitizer: DomSanitizer = inject(DomSanitizer);

	constructor( private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private user: UserService ){
		super();
		}

	public ngOnInit(): void {
		this.initForm();
		this.getPeriods();
	}

	public override ngOnDestroy() {
    super.ngOnDestroy();
  }

	public initForm():void{
    this.filtersForm = this.fb.group({
			periodID: ['', [Validators.required]],
      schoolID: ['', [Validators.required]],
			careerID: ['', [Validators.required]],
			studyPlanID: ['', [Validators.required]],
    });
	}

	public getPeaList(studyPlanID: number= this.filtersForm.get('studyPlanID').value): void{
		this.admin.getSyllabusSubjectPrincipal(this.filtersForm.get('periodID').value, this.filtersForm.get('schoolID').value, this.filtersForm.get('careerID').value, studyPlanID,
		this.pageIndex, this.pageSize).subscribe({
			next: (res) => {
				this.peaList = res.data;
				this.length = res.count;
			},
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
			}
		});
	}

	public changePagePea(event: PageEvent): PageEvent {
		this.pageIndex = event.pageIndex+1;
    this.pageSize = event.pageSize;
		this.getPeaList();
    return event;
	}

	private getPeriods(): void{
		this.charging=true;
    this.api.getPeriods().subscribe({
      next: (res) => {
        this.periods = res.data;
				this.charging=false;
      },
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
				this.charging=false;
			}
    });
	}

	public getSchools(periodID:number): void{
		this.schools= [];
		this.filtersForm.get('schoolID').patchValue('');
		this.careers= [];
		this.filtersForm.get('careerID').patchValue('');
		this.study_plan= [];
		this.filtersForm.get('studyPlanID').patchValue('');
    this.admin.getSchoolsByPeriod(periodID).subscribe({
			next: (res) => {
				this.schools = res;
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	public getCareers(schoolID:number): void{
		this.careers= [];
		this.filtersForm.get('careerID').patchValue('');
		this.study_plan= [];
		this.filtersForm.get('studyPlanID').patchValue('');
		this.admin.getCareersBySchool(this.filtersForm.get('periodID').value, schoolID)
			.subscribe({
				next: (res) => {
					this.careers = res;
				},
				error: (err: HttpErrorResponse) => {
				}
			});
	}

	public getStudyPlan(careerID:number): void{
		this.study_plan= [];
		this.filtersForm.get('studyPlanID').patchValue('');
		this.admin.getStudyPlansByCareer(careerID).subscribe({
			next: (res) => {
				this.study_plan = res;
			},
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
			}
		});
	}

	public getPdf(courseID:number): void{
		this.admin.getSyllabusSubjecPdfContent(this.filtersForm.get('periodID').value, this.filtersForm.get('studyPlanID').value, this.filtersForm.get('careerID').value,
			courseID, this.user.currentUser.PersonId, 'C').subscribe({
			next: (res) => {
				//console.log(res);
				const blob: Blob = new Blob([res.body], { type: 'application/pdf' });
        const url = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob)));
        if (url) {
          window.open(url, '_blank');
        }
			},
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
			}
		});
	}

}
