import { Component, ElementRef, inject, OnDestroy, OnInit, SecurityContext, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule} from '@angular/material/tooltip';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, distinctUntilChanged, map, Subscription } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { DateRange, MatDatepickerModule } from '@angular/material/datepicker';
import { CurrentPeriodItca, Period } from '@utils/interfaces/period.interfaces';
import {
  FileStatus,
  EnrolledStudent,
  PaginatedResource, FileStateByDepartment
} from '@utils/interfaces/person.interfaces';
import { ApiService } from '@services/api.service';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { DomSanitizer } from '@angular/platform-browser';
import { BUILD_ROUTE } from '@utils/functions';
import { ValidateDocumentComponent } from './components/validate-document/validate-document.component';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { FILE_STATE } from '@utils/interfaces/others.interfaces';
import { User } from '@utils/models/user.models';
import { UserService } from '@services/user.service';
import { ROL } from '@utils/interfaces/login.interfaces';
import { Cycle, Parallel, SPGetCareer, StudyPlan } from '@utils/interfaces/campus.interfaces';
import { AdministrativeService } from '@services/administrative.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface FiltersForm {
  period: number;
  search: string;
  status: number;
}

const DISPLAYED_COLUMNS: string[] = ['documentNumber', 'student', 'career', 'modality', 'levelID', 'parallel', 'scholarship', 'enrollDate', 'status', 'actions'];

@Component({
  selector: 'app-enrolled-student-report',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTooltipModule,
    MatTableModule,
    MatIconModule,
    MatMenuModule,
    MatPaginatorModule,
    MatRippleModule,
    NgClass,
    MatButtonModule,
    NgIf,
    MatSortModule,
    MatInputModule,
    NgForOf,
    MatDatepickerModule,
    MatNativeDateModule,
    DatePipe,
    CdkConnectedOverlay,
    CdkOverlayOrigin,
    SpinnerLoaderComponent,
    MatDialogModule,
		MatSnackBarModule,
		MatMenuModule
  ],
  templateUrl: './enrolled-student-report.component.html',
  styleUrls: [ './enrolled-student-report.component.css' ]
})

export class EnrolledStudentReportComponent extends OnDestroyMixin implements OnInit, OnDestroy {
	public user!: User;
	protected readonly FILE_STATE = FILE_STATE;
  public filtersForm!: FormGroup;
	public reportsForm!: FormGroup;
  public loadingStudentsDetail: boolean = true;
  public periods: Array<Period> = [];
  public fileStatuses: Array<FileStatus> = [];
  public studentsDetail: Array<EnrolledStudent> = [];
  public fileStatesByDepartment: Array<FileStateByDepartment> = [];
  public dataSource!: MatTableDataSource<EnrolledStudent>;
	public cycles: Cycle[] = [];
	public parallels: Parallel[] = [];
	public parallelsByCycle: Parallel[] = [];
	public careers: SPGetCareer[] = [];
	public studyPlans: StudyPlan[] = [];
  public pageIndex: number = 0;
  public pageSize: number = 10;
  public filters: string = '';
  public length: number = 0;
  public selectedDateRange!: DateRange<Date>;
  public pageEvent!: PageEvent;
  public displayedColumns: string[] = DISPLAYED_COLUMNS;
  public pageSizeOptions: number[] = [5, 10, 25, 50, 100];
  public loadingStatesByDepartment: boolean = true;
  public timeoutForGetStatesByDepartment: any;
  private getPdfContentSubscription!: Subscription;
	public isGettingNotes: boolean= false;
	public currentPeriod: CurrentPeriodItca;

  @ViewChild(MatSort, { static: true }) public sort!: MatSort;
  @ViewChild('paginator', { static: true }) public paginator!: MatPaginator;
	@ViewChild('reportsModalClose', { read: ElementRef }) public reportsModalClose: ElementRef;

	private getCareersSubscription!: Subscription;
  private getStudentsDetailSubscription!: Subscription;
  private getStatesByDepartmentSubscription!: Subscription;
  private formBuilder: FormBuilder = inject(FormBuilder);
  private api: ApiService = inject(ApiService);
	private admin: AdministrativeService = inject(AdministrativeService);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private sanitizer: DomSanitizer = inject(DomSanitizer);
  private dialog: MatDialog = inject(MatDialog);
  private router: Router = inject(Router);
	private userService: UserService = inject(UserService);
	private snackBar: MatSnackBar = inject(MatSnackBar);
  constructor() {
    super();
		this.user = this.userService.currentUser;
  }

  public ngOnInit(): void {
    this.initForm();
		this.initReportsForm();
    this.getDataFromResolver();
    this.getStudentsDetail();
  }

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.getStudentsDetailSubscription) {
      this.getStudentsDetailSubscription.unsubscribe();
    }
  }

  private getDataFromResolver(): void {
    this.activatedRoute.data
    .pipe(
    untilComponentDestroyed(this),
    map((value: any) => value['resolver']))
    .subscribe({
      next: (value: { periods: Period[], fileStatuses: FileStatus[], cycles: Cycle[], parallels: Parallel[], careers: SPGetCareer[], currentPeriod: CurrentPeriodItca }) => {
        this.periods = value.periods;
				if (this.user.rolName === ROL.RECTOR) {
					this.fileStatuses = value.fileStatuses.filter((state: FileStatus) => state.statusFileID === FILE_STATE.LEGALIZED);
				} else {
					this.fileStatuses = value.fileStatuses;
				}
				this.cycles = value.cycles;
				this.parallels = value.parallels;
				//this.careers = value.careers;
				this.currentPeriod = value.currentPeriod
				// console.log(this.currentPeriod);
      },
    });
		this.filtersForm.get('period').patchValue(this.currentPeriod.periodID);
		this.getCareerByID();
  }

	public initReportsForm(cycleID: number= 0): void {
		this.reportsForm = this.formBuilder.group({
      cycleID: [cycleID],
      parallelCode: ['-'],
			careerID: [''],
			studyPlanID: ['']
    });
	}

  private initForm(): void {
    this.filtersForm = this.formBuilder.group({
      period: [''],
      search: [''],
      status: [''],
			career: [''],
      range: this.formBuilder.group({
        startDate: [''],
        endDate: ['']
      }),
    });
    const searchInput: FormControl = this.filtersForm.get('search') as FormControl;
    if (searchInput) {
      searchInput.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        untilComponentDestroyed(this)
      ).subscribe({
        next: (value ) => {
          this.getStudentsDetail();
        }
      });
    }
  }

  private buildEncodedFilters(): void {
    this.filters = '{';
    const filtersValue: FiltersForm = this.filtersFormValue;
    if (filtersValue.period) this.filters = this.filters.concat(`periodID:and:eq:${filtersValue.period};`);
    if (filtersValue.status) {
      this.filters = this.filters.concat(`statusFileID:and:eq:${filtersValue.status};`);
    } else {
      // Sólo mostrar los estados PENDIENTE, RECHAZADO, APROBADO, LEGALIZADO
			if (this.user.rolName === ROL.RECTOR) {
				this.filters = this.filters.concat(`statusFileID:and:in:${FILE_STATE.LEGALIZED},;`);
			}
    }
    if (filtersValue.search) {
      this.filters = this.filters.concat(`student:or:like:${filtersValue.search};`);
      this.filters = this.filters.concat(`documentNumber:or:like:${filtersValue.search};`);
    }
    this.filters = this.filters === '{' ? '' : this.filters.slice(0, -1).concat('}');
    this.filters = encodeURIComponent(this.filters);
  }


  public get range(): FormGroup {
    return this.filtersForm.get('range') as FormGroup;
  }
  public get filtersFormValue(): FiltersForm {
    return this.filtersForm.value as FiltersForm;
  }

  public getStudentsDetail(event?: Sort): void {
    this.loadingStudentsDetail = true;
    if (this.getStudentsDetailSubscription) {
      this.getStudentsDetailSubscription.unsubscribe();
    }
    //this.buildEncodedFilters();
		let filter= this.filtersForm.value;
    this.getStudentsDetailSubscription = this.api.getEnrolledStudentsSP(
      this.pageIndex,
      this.pageSize,
      filter.period,
      filter.career,
			filter.status,
			filter.search,
      event?.active || 'enrollDate',
      event?.direction || 'desc'
    ).subscribe({
      next: (value: PaginatedResource<EnrolledStudent>) => {
        this.studentsDetail = value.items as Array<EnrolledStudent>;
        //console.log('this.studentsDetail',this.studentsDetail);
        this.length = value.totalItems;
        this.dataSource = new MatTableDataSource<EnrolledStudent>(this.studentsDetail);
        this.loadingStudentsDetail = false;
      },
      error: (err: HttpErrorResponse) => {
        //g(err);
        this.loadingStudentsDetail = false;
      }
    });
  }

  public getStudentsDetailFromPaginator(event: PageEvent): PageEvent {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getStudentsDetail();
    return event;
  }

  public trackByPeriodId(index: number, item: Period): number {
    return item.periodID;
  }

  public trackByFileStatusId(index: number, item: FileStatus): number {
    return item.statusFileID;
  }

  public get calendarStartDateFormControl(): FormControl {
    return this.filtersForm.get('calendarStartDate') as FormControl;
  }

  public get calendarEndDateFormControl(): FormControl {
    return this.filtersForm.get('calendarEndDate') as FormControl;
  }

  private setStartDateAndEndDateToForm(startDate: Date, endDate: Date): void {
    this.calendarStartDateFormControl.patchValue(startDate);
    this.calendarStartDateFormControl.updateValueAndValidity();

    this.calendarEndDateFormControl.patchValue(endDate);
    this.calendarStartDateFormControl.updateValueAndValidity();
  }

  public clearTimeout(): void {
    clearTimeout(this.timeoutForGetStatesByDepartment);
  }

  public getStatesByDepartment(item: EnrolledStudent): void {
    item.openOverlay = true;
    this.timeoutForGetStatesByDepartment = setTimeout(() => {
      if (this.getStatesByDepartmentSubscription) {
        this.getStatesByDepartmentSubscription.unsubscribe();
      }
      const filters: string = `{periodID:and:eq:${item.periodID};studentID:and:eq:${item.studentID}}`;
      const encodedFilters: string = encodeURIComponent(filters);
      this.getStatesByDepartmentSubscription = this.api.getFileStatesByDepartment(encodedFilters)
        .subscribe({
          next: (value: FileStateByDepartment[]) => {
            this.fileStatesByDepartment = value;
            this.loadingStatesByDepartment = false;
          },
          error: (err: HttpErrorResponse) => {
            item.openOverlay = false;
          },
          complete: () => {
          }
      });
    }, 1000);
  }

  public buildReport(relativeRoute: string, studentOrStatus?: number | string, isStudent = false): void {
    const filtersValue: FiltersForm = this.filtersFormValue;
    const route: string = BUILD_ROUTE(relativeRoute, filtersValue.period, studentOrStatus, isStudent);
    if (this.getPdfContentSubscription) {
      this.getPdfContentSubscription.unsubscribe();
    }
		let status= filtersValue.status
    this.getPdfContentSubscription = this.api.getPdfContent(route).subscribe((res: HttpResponse<Blob>) => {
      if (res.body) {
				//console.log(res);
        let contentType: string | null | undefined = res.headers.get('content-type');
        // Porque el tipo de variable que recibe el type es string o undefined. No recibe null.
        if (!contentType) {
          contentType = undefined;
        }
        const blob: Blob = new Blob([res.body], { type: contentType });
        const url = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob)));
        if (url) {
					var fileLink = document.createElement('a');
					fileLink.href = url;
					fileLink.download = 'pdf_name';
					//fileLink.click();
          window.open(url, '_blank');
        }
      }
    });
  }

	public getReportDragCredentials(rute: string, fileName: string, studentOrStatus?: number | string,): void{
		console.log('getReportDragCredentials', rute, fileName, studentOrStatus);
		let body= {
			periodID: this.filtersForm.get('period')?.value,
			statusFileID: studentOrStatus === null || studentOrStatus === undefined ? 0 : Number(studentOrStatus)
		}
		console.log('body', body);
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

	public validateDocument(enrolledStudent: EnrolledStudent): void {
    const config: MatDialogConfig = new MatDialogConfig();
    config.id = 'EnrolledStudentDialog';
    config.autoFocus = false;
    config.minWidth = '70vw';
    config.maxWidth = '80vw';
    config.panelClass = 'transparent-panel';
    config.data = {
      enrolledStudent
    }
    const dialog = this.dialog.open(ValidateDocumentComponent, config);
    dialog.afterClosed()
    .pipe(untilComponentDestroyed(this))
    .subscribe((res: boolean) => {
      if (res) {
        this.getStudentsDetail();
      }
    });
  }


  editInformation(row: EnrolledStudent){
    //console.log(row);
    this.router.navigate(['/reportes/actualizar-informacion/',row.personID])
  }

  public openFile(row: EnrolledStudent): void {
    const route: string = BUILD_ROUTE('enroll/matricula', row.periodID, row.studentID, true);
    if (this.getPdfContentSubscription) {
      this.getPdfContentSubscription.unsubscribe();
    }
    this.getPdfContentSubscription = this.api.getPdfContent(route).subscribe((res: HttpResponse<Blob>) => {
      if (res.body) {
        let contentType: string | null | undefined = res.headers.get('content-type');
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

	public homologations(student: EnrolledStudent): void{
		this.router.navigate(['/reportes/homologaciones/',student.personID]);
	}

	public parallelChange(student: EnrolledStudent): void{
		this.router.navigate(['/reportes/cambio-paralelo/'+ student.personID + '/' + student.studentID]);
	}

	protected readonly ROL = ROL;

	public excelStudentReport(): void {
		let status;
		if(this.filtersForm.get('status').value === '') status=0;
		else status= this.filtersForm.get('status').value;
		this.api.excelStudentReport(this.filtersForm.get('period').value, status).subscribe((res: HttpResponse<Blob>) => {
      if (res.body) {
        let contentType: string | null | undefined = res.headers.get('content-type');
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

	public getStudyPlans(careerID: number | string): void {
		if(careerID !== '')	this.admin.getCareerDetailCatalog(+careerID).subscribe({
			next: (res: StudyPlan[]) => {
				//console.log(res);
				this.studyPlans = res;
			},
			error: (err: HttpErrorResponse) => {
			},
			complete: () => {
			}
		});
	}

	public generateEnrollReport(): void {
		this.api.getEnrollReport(this.filtersForm.get('period').value, this.reportsForm.get('careerID').value, this.reportsForm.get('studyPlanID').value,
		this.reportsForm.get('cycleID').value, this.reportsForm.get('parallelCode').value).subscribe({
			next: (res: HttpResponse<Blob>) =>{
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
						this.reportsModalClose.nativeElement.click();
					}
				}
			},
			error: (err: HttpErrorResponse) => {
				this.reportsModalClose.nativeElement.click();
				this.snackBar.open(
          `Periodo (Nivel)`,
          'No disponible',
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

	public generateEnrollExcel(): void {
		this.api.getEnrollExcel(this.filtersForm.get('period').value, this.reportsForm.get('careerID').value, this.reportsForm.get('studyPlanID').value,
		this.reportsForm.get('cycleID').value, this.reportsForm.get('parallelCode').value).subscribe({
			next: (res: HttpResponse<Blob>) =>{
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
						this.reportsModalClose.nativeElement.click();
					}
				}
			},
			error: (err: HttpErrorResponse) => {
				this.reportsModalClose.nativeElement.click();
				this.snackBar.open(
          `Periodo (Nivel)`,
          'No disponible',
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

	public generateNotesReport(): void {
		this.api.getNotesReport(this.filtersForm.get('period').value, this.reportsForm.get('careerID').value, this.reportsForm.get('studyPlanID').value,
		this.reportsForm.get('cycleID').value, this.reportsForm.get('parallelCode').value).subscribe({
			next: (res: HttpResponse<Blob>) =>{
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
						this.reportsModalClose.nativeElement.click();
					}
				}
			},
			error: (err: HttpErrorResponse) => {
				this.reportsModalClose.nativeElement.click();
				this.snackBar.open(
          `Intente nuevamente`,
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

	public generateRecordReport(studentID: number): void {
		this.api.getAcademicReportReport(studentID).subscribe({
			next: (res: HttpResponse<Blob>) =>{
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
			},
			error: (err: HttpErrorResponse) => {
				this.snackBar.open(
          `Intente nuevamente`,
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

	public getParallelsByCycle(): void{
		let filters= this.reportsForm.value;
		this.admin.getParallelsByStudyPlanAndCycle(this.filtersForm.get('period').value, filters.careerID, filters.studyPlanID, filters.cycleID).subscribe({
			next: (res) => {
				//console.log('parallels', res);
				this.parallelsByCycle= res;
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	public getCareerByID(): void {
    if (this.getCareersSubscription) this.getCareersSubscription.unsubscribe();
    this.getCareersSubscription = this.admin.getCareerByPeriod(this.filtersForm.get('period').value).subscribe({
      next: (value) => {
        this.careers = value;
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
      }
    });
  }

}
