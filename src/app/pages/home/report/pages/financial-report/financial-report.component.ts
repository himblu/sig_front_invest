import { Component, inject, OnDestroy, OnInit, SecurityContext, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule} from '@angular/material/tooltip';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { DatePipe, NgClass, NgForOf, NgIf, CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, distinctUntilChanged, map, Subscription } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { DateRange, MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { Period } from '@utils/interfaces/period.interfaces';
import {
  FileStatus,
  PaginatedResource,
  PaymentEnrolledITCAStudent,
  PaymentForEnrolledStudent
} from '@utils/interfaces/person.interfaces';
import { AdministrativeService } from '@services/administrative.service';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { UserService } from '@services/user.service';
import { BUILD_ROUTE } from '@utils/functions';
import { DomSanitizer } from '@angular/platform-browser';
import { ApiService } from '@services/api.service';
import { ValidatePaymentComponent } from './components/validate-payment/validate-payment.component';
import { FILE_STATE } from '@utils/interfaces/others.interfaces';
import { BecaType, SPGetCareer } from '@utils/interfaces/campus.interfaces';
import { HTML } from 'ngx-editor/lib/trustedTypesUtil';

interface FiltersForm {
  period: number;
  search: string;
  status: number;
}

interface RangeForm {
  startDate: Date;
  endDate: Date;
	becaType: number;
}

const DISPLAYED_COLUMNS: string[] = ['documentNumber', 'student', 'career', 'modality', 'levelID', 'parallel', 'enrollDate', 'period', 'state', 'actions'];
const ORDINAL_LEVEL: string[] = [
	'Primero',
	'Segundo',
	'Tercero',
	'Cuarto',
	'Quinto',
	'Sexto',
	'Séptimo',
	'Octavo',
	'Noveno',
	'Décimo'
];

@Component({
  selector: 'app-financial-report',
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
    MatDialogModule,
    SpinnerLoaderComponent
  ],
  providers: [
    DatePipe
  ],
  templateUrl: './financial-report.component.html',
  styleUrls: ['./financial-report.component.css']
})

export class FinancialReportComponent extends OnDestroyMixin implements OnInit, OnDestroy {
	protected readonly ORDINAL_LEVEL: string[] = ORDINAL_LEVEL;
  public filtersForm!: FormGroup;
  public loadingStudentsDetail: boolean = true;
  public periods: Array<Period> = [];
  public fileStatuses: Array<FileStatus> = [];
  public studentsDetail: Array<PaymentForEnrolledStudent> = [];
	public careers: SPGetCareer[] = [];
	public becaTypes: BecaType[] = [];
  public dataSource!: MatTableDataSource<PaymentForEnrolledStudent>;
  public pageIndex: number = 0;
  public pageSize: number = 10;
  public length: number = 0;
  public filters: string = '';
  public selectedDateRange!: DateRange<Date>;
  public pageEvent!: PageEvent;
  public currentPeriodId: number = 0;
  public displayedColumns: string[] = DISPLAYED_COLUMNS;
  public pageSizeOptions: number[] = [5, 10, 25, 50, 100];

  @ViewChild(MatSort, { static: true }) public sort!: MatSort;
  @ViewChild('paginator', { static: true }) public paginator!: MatPaginator;
	@ViewChild('componentsDialog') componentsDialog: TemplateRef<MatDialog>;

	private getCareersSubscription!: Subscription;
	private getFileBecaTypesSubscription!: Subscription;
  private getITCAStudentsSubscription!: Subscription;
  private getPdfContentSubscription!: Subscription;
  private formBuilder: FormBuilder = inject(FormBuilder);
  private adminApi: AdministrativeService = inject(AdministrativeService);
  private api: ApiService = inject(ApiService);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private dialog: MatDialog = inject(MatDialog);
  private datePipe: DatePipe = inject(DatePipe);
  private userService: UserService = inject(UserService);
  private sanitizer: DomSanitizer = inject(DomSanitizer);
  constructor() {
    super();
  }

  public ngOnInit(): void {
    this.initForm();
    this.getDataFromResolver();
    this.getITCAStudents();
		this.getFileBecaTypes();
  }

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.getITCAStudentsSubscription) {
      this.getITCAStudentsSubscription.unsubscribe();
    }
  }

  private getDataFromResolver(): void {
    this.activatedRoute.data
    .pipe(
    untilComponentDestroyed(this),
    map((value: any) => value['resolver']))
    .subscribe({
      next: (value: { periods: Period[], fileStatuses: FileStatus[], currentPeriod:any }) => {
        this.periods = value.periods;
        this.fileStatuses = value.fileStatuses.filter((state: FileStatus) => state.statusFileID !== FILE_STATE.LEGALIZED);
        this.currentPeriodId = value.currentPeriod.periodID;
      },
    });
		this.filtersForm.get('period').patchValue(this.currentPeriodId);
		this.getCareerByID();
  }

  private initForm(): void {
    this.filtersForm = this.formBuilder.group({
      period: [''],
      search: [''],
      status: [''],
			career: [''],
      range: this.formBuilder.group({
        startDate: ['', Validators.required],
        endDate: ['', Validators.required],
				becaType: 0
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
          this.getITCAStudents();
        }
      });
    }
  }

  public get range(): FormGroup {
    return this.filtersForm.get('range') as FormGroup;
  }
  public get filtersFormValue(): FiltersForm {
    return this.filtersForm.value as FiltersForm;
  }

  public resetRangeValue(): void {
    this.range.patchValue({
      startDate: '',
      endDate: '',
			beca: 0
    })
  }

  public getITCAStudents(event?: Sort): void {
    this.loadingStudentsDetail = true;
    if (this.getITCAStudentsSubscription) {
      this.getITCAStudentsSubscription.unsubscribe();
    }
    //this.buildEncodedFilters();
		let filter= this.filtersForm.value;
    this.getITCAStudentsSubscription = this.adminApi.getStudentsForFinancialReportSP(
      this.pageIndex,
      this.pageSize,
			filter.period,
      filter.career,
			filter.status,
			filter.search,
      event?.active || 'enrollDate',
      event?.direction || 'desc'
    ).subscribe({
      next: (value: PaginatedResource<PaymentForEnrolledStudent>) => {
        this.studentsDetail = value.items as Array<PaymentForEnrolledStudent>;
				//console.log('studentsDetail', this.studentsDetail);
        this.length = value.totalItems;
        this.dataSource = new MatTableDataSource<PaymentForEnrolledStudent>(this.studentsDetail);
        this.loadingStudentsDetail = false;
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
        this.loadingStudentsDetail = false;
      }
    });
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

  public getStudentsDetailFromPaginator(event: PageEvent): PageEvent {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getITCAStudents();
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

  public validatePayment(paymentForEnrolledStudent: PaymentForEnrolledStudent): void {
		const period= this.filtersForm.get('period').value;
    const config: MatDialogConfig = new MatDialogConfig();
    config.id = 'PaymentEnrolledITCAStudentDialog';
    config.autoFocus = false;
    config.minWidth = '80vw';
    config.maxWidth = '80vw';
    config.panelClass = 'transparent-panel';
    config.data = {
      paymentForEnrolledStudent,
			period,
			'state': true
    }
    const dialog = this.dialog.open(ValidatePaymentComponent, config);
    dialog.afterClosed().pipe(untilComponentDestroyed(this)).subscribe((res) => {
      if (res) {
        this.getITCAStudents();
      }
    });
  }

  public buildReport(relativeRoute: string, studentOrStatus?: number, isStudent = false): void {
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

  private formattedDate(date: Date): string {
    return <string>this.datePipe.transform(date, 'yyyy-MM-dd');
  }

  public downloadProofPayments(): void {
    if (this.filtersForm.get('range').valid) {
      if (this.getPdfContentSubscription) {
        this.getPdfContentSubscription.unsubscribe();
      }
      const filtersValue: FiltersForm = this.filtersFormValue;
      const range: RangeForm = this.range.value as RangeForm;
      const startDate = this.formattedDate(range.startDate);
      const endDate = this.formattedDate(range.endDate);
      this.getPdfContentSubscription = this.api.getPdfProofPayments(
      filtersValue.period,
      startDate,
      endDate,
			range.becaType
      ).subscribe((res: HttpResponse<Blob>) => {
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
    }else{
			this.filtersForm.get('range').markAllAsTouched();
		}
  }

	public getCareerByID(): void {
    if (this.getCareersSubscription) this.getCareersSubscription.unsubscribe();
    this.getCareersSubscription = this.adminApi.getCareerByPeriod(this.filtersForm.get('period').value).subscribe({
      next: (value) => {
        this.careers = value;
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
      }
    });
  }

	public getFileBecaTypes(): void {
		let filter= this.filtersForm.value;
    if (this.getFileBecaTypesSubscription) this.getFileBecaTypesSubscription.unsubscribe();
    this.getFileBecaTypesSubscription = this.adminApi.getFileBecaTypes(filter.period).subscribe({
      next: (value) => {
        //console.log(value);
				this.becaTypes= value;
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
      }
    });
  }

	openComponentsDialog(): void {
		const config: MatDialogConfig = new MatDialogConfig();
    config.id = 'componentsDialog';
    config.autoFocus = false;
    config.minWidth = '55vw';
    config.maxWidth = '55vw';
		config.minHeight = '20vw';
		config.maxHeight = '30vw';
    config.panelClass = 'transparent-panel';
    config.data = {}
    const dialog = this.dialog.open(this.componentsDialog, config);
    dialog.afterClosed().pipe(untilComponentDestroyed(this)).subscribe((res) => {});
	}

}
