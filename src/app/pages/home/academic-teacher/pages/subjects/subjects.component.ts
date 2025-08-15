import { Component, ViewChild, ElementRef, OnInit, OnDestroy, SecurityContext, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { NgForOf, NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Period } from '@utils/interfaces/period.interfaces';
import { CurrentPeriod, SubjectsList } from '@utils/interfaces/others.interfaces';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, distinctUntilChanged, filter, map, Subscription } from 'rxjs';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { COMPANY_CODES } from '@utils/interfaces/others.interfaces';
import { UserService } from '@services/user.service';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { CdkOverlayOrigin, OverlayModule } from '@angular/cdk/overlay';
import { Unit, Units } from '@utils/interfaces/campus.interfaces';
import { environment } from '@environments/environment';

interface FiltersForm {
  periodID: number;
  search: string;
}

@Component({
  selector: 'app-subjects',
  templateUrl: './subjects.component.html',
  styleUrls: ['./subjects.component.css'],
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
		MatPaginatorModule,
		MatMenuModule,
		OverlayModule
	],
})
export class SubjectsComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	studentsOpen = false;
	gradesOpen = false;
	triggerOrigin: CdkOverlayOrigin;
	triggerOriginGrades: CdkOverlayOrigin;
	public filtersForm!: FormGroup;
	public subjectsForm!: FormGroup;
	periods:Period[];
	currentPeriod:CurrentPeriod;
	isLoading: boolean = false;
  subjectsList: SubjectsList [] = [];
	public pageIndex: number = 0;
  public pageSize: number = 10;
  public length: number = 0;
  public filters: string = '';
  public pageEvent!: PageEvent;
  public pageSizeOptions: number[] = [5, 10, 25, 50, 100];
	public units:Units[];
  search: string = '';
	title: string = '';

	private getPdfContentSubscription!: Subscription;
	@ViewChild('paginator', { static: true }) public paginator!: MatPaginator;

	private sanitizer: DomSanitizer = inject(DomSanitizer);

	constructor(private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private user: UserService,
		private router: Router){
		super();
	}

	public ngOnInit(): void {
		this.common.sendSubject= null;
		this.initFiltersForm();
		this.getCurrentPeriod();
		this.getPeriods();
		this.getUnits();
  }

  public override ngOnDestroy() {
    super.ngOnDestroy();
  }

	public toggle(trigger: CdkOverlayOrigin, i:number):void {
		if(i == 1){
			this.triggerOrigin = trigger;
			this.studentsOpen = !this.studentsOpen
		}else if(i == 2){
			this.triggerOriginGrades = trigger;
			this.gradesOpen = !this.gradesOpen
		}
	}

	initFiltersForm(){
    this.filtersForm = this.fb.group({
      periodID: [''],
      search: ['']
    });
    const searchInput: FormControl = this.filtersForm.get('search') as FormControl;
    if (searchInput) {
      searchInput.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        untilComponentDestroyed(this)
      ).subscribe({
        next: (value ) => {
					this.getSubjectsList();
        }
      });
    }
  }

	getSubjectsList(event?: any){
		//this.isLoading = true;
    this.buildEncodedFilters();
    this.api.getSubjectsList(
      this.pageIndex,
      this.pageSize,
      this.filters,
      event?.active || '',
      event?.direction || 'desc'
    ).subscribe({
      next: (res) => {
				//console.log('subjectsList', res)
        this.subjectsList = res.items;
        this.length = res.totalItems;
				this.isLoading = false;
      },
      error: (err) => {
        console.log(err);
				this.isLoading = false;
      }
    });
  }

	private buildEncodedFilters(): void {
    this.filters = '{';
    const filtersValue: FiltersForm = this.filtersForm.value;
		this.filters = this.filters.concat(`personID:and:eq:${this.user.currentUser.PersonId};`);
		//this.filters = this.filters.concat(`personID:and:eq:248;`);
    if (filtersValue.periodID){
			this.filters = this.filters.concat(`periodID:and:eq:${filtersValue.periodID};`);
		} else{
			this.filters = this.filters.concat(`periodID:and:eq:${this.currentPeriod.periodID};`);
		}
    if (filtersValue.search) {
      this.filters = this.filters.concat(`courseName:or:like:${filtersValue.search};`);
      this.filters = this.filters.concat(`careerName:or:like:${filtersValue.search};`);
    }
    this.filters = this.filters === '{' ? '' : this.filters.slice(0, -1).concat('}');
    this.filters = encodeURIComponent(this.filters);
  }

  public getSubjectsListPaginator(event: PageEvent): PageEvent {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getSubjectsList();
    return event;
  }

	private getPeriods(): void {
		this.isLoading = true;
    this.api.getItcaPeriods().subscribe({
      next: (res: any) => {
        this.periods = res.data;
				this.isLoading = false;
      },
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
				this.isLoading = false;
			}
    });
  }

	private getCurrentPeriod(): void {
		this.isLoading = true;
    this.api.getCurrentPeriod().subscribe({
      next: (res: CurrentPeriod) => {
				//console.log('currentPeriod', res);
        this.currentPeriod = res;
				this.filtersForm.get('periodID').patchValue(this.currentPeriod.periodID);
				this.getSubjectsList();
				this.isLoading = false;
      },
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
				this.isLoading = false;
			}
    });
  }

	public sendSubject(item: SubjectsList):void{
		this.common.sendSubject = item;
		this.router.navigate(['/academico-docente/asistencia']);
	}

	public pea(item: SubjectsList):void{
		this.common.sendSubject = item;
		this.router.navigate(['/academico-docente/pea']);
	}

	public openFile(relativeRoute: string): void {
			const route: string = `${environment.url}/${relativeRoute}`;
			if (this.getPdfContentSubscription) this.getPdfContentSubscription.unsubscribe();
			this.getPdfContentSubscription = this.api.getPdfContent(route).subscribe((res: HttpResponse<Blob>) => {
				if (res.body) {
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
			});
		}

	public getStudentsPdf(subject: SubjectsList): void{
		this.admin.getAcademicReportsPdfContent(subject.periodID, subject.classSectionNumber).subscribe({
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

	public getStudentsExcel(subject: SubjectsList): void{
		this.admin.getAcademicReportsExcelContent(subject.periodID, subject.classSectionNumber).subscribe({
			next: (res) => {
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
			},
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
			}
		});
	}

	public getGradesPdf(subject: SubjectsList): void{
		this.admin.getAcademicReportsGradesPdfContent(subject.periodID, subject.classSectionNumber).subscribe({
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

	public getGradesExcel(subject: SubjectsList): void{
		this.admin.getAcademicReportsGradesExcelContent(subject.periodID, subject.classSectionNumber).subscribe({
			next: (res) => {
				//console.log(res);
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
			},
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
			}
		});
	}

	public getGeneralReportPdf(): void{
		this.admin.getAcademicReportsGeneralPdfContent(this.filtersForm.get('periodID').value, this.user.currentUser.PersonId).subscribe({
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

	public getGeneralReportExcel(): void{
		this.admin.getAcademicReportsGeneralExcelContent(this.filtersForm.get('periodID').value, this.user.currentUser.PersonId).subscribe({
			next: (res) => {
				//console.log(res);
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
			},
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
			}
		});
	}

	private getUnits():void {
		this.isLoading = true;
    this.admin.getUnits().subscribe({
      next: (res) => {
				//console.log(res);
       	this.units=res;
				this.isLoading = false;
      },
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.isLoading = false;
			}
    });
	}

	public getGapReportPdf(unit:Units, subject:SubjectsList): void{
		this.admin.getGapReportPdf(this.filtersForm.get('periodID').value, subject.schoolID, subject.careerID, subject.studyPlanID, subject.courseID,
			this.user.currentUser.PersonId, unit.unitID, subject.parallelCode).subscribe({
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

	public getGeneralReport(rute: string, item?: SubjectsList): void{
			//console.log('item', item);
			if(this.filtersForm.valid){
				let body= {
					"periodID": item.periodID,
					"classSectionNumber": item.classSectionNumber,
					"courseID": item.courseID,
					"personID": item.personID,
					"coordinatorPersonID": 0,
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
