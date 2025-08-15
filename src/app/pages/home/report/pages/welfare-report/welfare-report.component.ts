import { Component, inject, OnDestroy, OnInit, SecurityContext, ViewChild } from '@angular/core';
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
import { ActivatedRoute } from '@angular/router';
import { DateRange, MatDatepickerModule } from '@angular/material/datepicker';
import { Period } from '@utils/interfaces/period.interfaces';
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
import { ValidateWelfareDocumentComponent } from './components/validate-welfare-document/validate-welfare-document.component';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { FILE_STATE, Welfare } from '@utils/interfaces/others.interfaces';
import { AdministrativeService } from '@services/administrative.service';
import { SPGetCareer } from '@utils/interfaces/campus.interfaces';

interface FiltersForm {
  period: number;
  search: string;
  status: number;
}

const DISPLAYED_COLUMNS: string[] = ['documentNumber', 'student', 'career', 'modality', 'levelID', 'parallel', 'scholarship', 'enrollDate', 'status', 'actions'];

@Component({
  selector: 'app-welfare-report',
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
    MatDialogModule
  ],
  templateUrl: './welfare-report.component.html',
  styleUrls: [ './welfare-report.component.css' ]
})

export class WelfareReportComponent extends OnDestroyMixin implements OnInit, OnDestroy {
	protected readonly FILE_STATE = FILE_STATE;
  public filtersForm!: FormGroup;
  public loadingStudentsDetail: boolean = true;
  public periods: Array<Period> = [];
  public fileStatuses: Array<FileStatus> = [];
  public studentsDetail: Array<Welfare> = [];
  public fileStatesByDepartment: Array<FileStateByDepartment> = [];
  public dataSource!: MatTableDataSource<Welfare>;
	public careers: SPGetCareer[] = [];
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
  @ViewChild(MatSort, { static: true }) public sort!: MatSort;
  @ViewChild('paginator', { static: true }) public paginator!: MatPaginator;

	private getCareersSubscription!: Subscription;
  private getStudentsDetailSubscription!: Subscription;
  private getWelfareStatesSubscription!: Subscription;
  private formBuilder: FormBuilder = inject(FormBuilder);
  private api: ApiService = inject(ApiService);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private sanitizer: DomSanitizer = inject(DomSanitizer);
  private dialog: MatDialog = inject(MatDialog);
	private admin: AdministrativeService = inject(AdministrativeService);
  constructor() {
    super();
  }

  public ngOnInit(): void {
    this.initForm();
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
      next: (value: { periods: Period[], fileStatuses: FileStatus[] }) => {
        this.periods = value.periods;
        this.fileStatuses = value.fileStatuses.filter((state: FileStatus) => !(state.statusFileID === FILE_STATE.LEGALIZED));
        // this.fileStatuses = value.fileStatuses;
      },
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
        next: (value) => {
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
      // Sólo mostrar los estados PENDIENTE, RECHAZADO, APROBADO, SIN ARCHIVO
      this.filters = this.filters.concat(`statusFileID:and:nin:${FILE_STATE.LEGALIZED};`);
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
    this.getStudentsDetailSubscription = this.api.getWelfaresSp(
      this.pageIndex,
      this.pageSize,
      filter.period,
      filter.career,
			filter.status,
			filter.search,
      event?.active || 'enrollDate',
      event?.direction || 'desc'
    ).subscribe({
      next: (value: PaginatedResource<Welfare>) => {
        this.studentsDetail = value.items as Array<Welfare>;
        this.length = value.totalItems;
        this.dataSource = new MatTableDataSource<Welfare>(this.studentsDetail);
        this.loadingStudentsDetail = false;
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
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
      if (this.getWelfareStatesSubscription) {
        this.getWelfareStatesSubscription.unsubscribe();
      }
      const filters: string = `{periodID:and:eq:${item.periodID};studentID:and:eq:${item.studentID}}`;
      const encodedFilters: string = encodeURIComponent(filters);
      this.getWelfareStatesSubscription = this.api.getFileStatesByDepartment(encodedFilters)
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

  public buildReport(relativeRoute: string, studentOrStatus?: number | string, isStudent: boolean = false): void {
    const filtersValue: FiltersForm = this.filtersFormValue;
    const route: string = BUILD_ROUTE(relativeRoute, filtersValue.period, studentOrStatus, isStudent);
    if (this.getPdfContentSubscription) {
      this.getPdfContentSubscription.unsubscribe();
    }
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

  public validateDocument(enrolledStudent: Welfare): void {
    const config: MatDialogConfig = new MatDialogConfig();
    config.id = 'EnrolledStudentDialog';
    config.autoFocus = false;
    config.minWidth = '70vw';
    config.maxWidth = '80vw';
    config.panelClass = 'transparent-panel';
    config.data = {
      enrolledStudent
    }
    const dialog = this.dialog.open(ValidateWelfareDocumentComponent, config);
    dialog.afterClosed()
    .pipe(untilComponentDestroyed(this))
    .subscribe((res: boolean) => {
      if (res) {
        this.getStudentsDetail();
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
