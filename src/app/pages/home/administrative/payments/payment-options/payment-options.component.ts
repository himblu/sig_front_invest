import { CommonModule, DatePipe, formatDate, NgFor, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { ComboComponent } from '@components/combo/combo.component';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { AdministrativeService } from '@services/administrative.service';
import { ApiService } from '@services/api.service';
import { CommonService } from '@services/common.service';
import { COMPANY_CODES, ItcaPayment } from '@utils/interfaces/others.interfaces';
import { Period } from '@utils/interfaces/period.interfaces';
import { FileStatus } from '@utils/interfaces/person.interfaces';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CreateOrUpdatePaymentComponent } from '../../components/create-or-update-payment/create-or-update-payment.component';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { EnrollType } from '@utils/interfaces/enrollment.interface';
import {SPGetCareer} from '@utils/interfaces/campus.interfaces';

export interface PeriodicElement {
  number: number;
  detail: string;
  enrollment: string;
  tariff: string;
  numberPayments: string;
  finalCost: string;
  enrollmentType: string;
  status: string;
  amountEnroll: string;
}

interface FiltersForm {
  period: number;
  search: string;
}

const ELEMENT_DATA: PeriodicElement[] = [];

@Component({
  selector: 'app-payment-options',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIf,
    NgFor,
    ReactiveFormsModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    SpinnerLoaderComponent,
    MatTooltipModule,
    MatMenuModule,
  ],
  templateUrl: './payment-options.component.html',
  styles: [
  ],
  providers: [
    DatePipe,
    provideNgxMask()
  ]
})


export class PaymentOptionsComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	displayedColumns: string[] = [
    'number',
    'detail',
    'enrollment',
    'tariff',
    'numberPayments',
    'finalCost',
    'enrollmentType',
    'status',
    'action'
  ];
  dataSource: ItcaPayment[] = [];
  color = '#004899'
  public charging: boolean = false;
  public filtersForm!: FormGroup;
  public fileStatuses: Array<FileStatus> = [];
  public loadingPaymentOptions: boolean = true;
  public formPayment!: FormGroup;
  public quotaNumbers!: FormGroup;
  public listEnrollmentType: EnrollType[] = [];
  public listPeriod: Period[] = [];
	public careers: SPGetCareer[] = [];
  public isUpdating: boolean = false;
  public pageIndex: number = 0;
  public pageSize: number = 10;
  public length: number = 0;
  public filters: string = '';
  public pageEvent!: PageEvent;
  public pageSizeOptions: number[] = [5, 10, 25, 50, 100];
  public currentPeriod: number = 0;

  private formBuilder: FormBuilder = inject(FormBuilder);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private datePipe: DatePipe = inject(DatePipe);
  private api: ApiService = inject(ApiService);
  private adminService: AdministrativeService = inject(AdministrativeService)
  private common: CommonService = inject(CommonService);
	private dialog: MatDialog = inject(MatDialog);
  @ViewChild('paginator', { static: true }) public paginator!: MatPaginator;

  constructor() {
    super();
  }

  public async ngOnInit() {
    this.filterForm();
    this.loadCatalogs();
    this.getPaymentOptions();
    this.initForm();
    this.getCurrentPeriod()
  }

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  truncateDecimals(value: number) {
    const factor = Math.pow(10, 2);
    return Math.trunc(value * factor) / factor;
  }

  async getCurrentPeriod() {
    this.adminService.getCurrentPeriodItca().subscribe((val) => {
      this.currentPeriod = val.periodID;
    })
  }

  getPaymentOptions(event?: any) {
    this.loadingPaymentOptions = true;
    this.buildEncodedFilters();
    this.api.getPaymentOptions(
      this.pageIndex,
      this.pageSize,
      this.filters,
      event?.active || '',
      event?.direction || 'desc'
    ).subscribe({
      next: (res) => {
        //console.log('payments', res);
        this.dataSource = res.items;
        this.length = res.totalItems;
        this.loadingPaymentOptions = false;
      },
      error: (err) => {
        console.log(err);
        this.loadingPaymentOptions = false;
      }
    });
  }

  filterForm() {
    this.filtersForm = this.formBuilder.group({
      period: [''],
      search: ['']
    });
    const searchInput: FormControl = this.filtersForm.get('search') as FormControl;
    if (searchInput) {
      searchInput.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        untilComponentDestroyed(this)
      ).subscribe({
        next: (value) => {
          this.getPaymentOptions();
        }
      });
    }
  }

  public get filtersFormValue(): FiltersForm {
    return this.filtersForm.value as FiltersForm;
  }

  public trackByPeriodId(index: number, item: Period): number {
    return item.periodID;
  }

  private buildEncodedFilters(): void {
    this.filters = '{';
    const filtersValue: FiltersForm = this.filtersFormValue;
    if (filtersValue.period) this.filters = this.filters.concat(`periodID:and:eq:${filtersValue.period};`);
    this.filters = this.filters.concat(`companyID:and:eq:${COMPANY_CODES.ITCA};`);
    if (filtersValue.search) {
      this.filters = this.filters.concat(`paymentOptionDesc:or:like:${filtersValue.search};`);
      this.filters = this.filters.concat(`enrollTypeDesc:or:like:${filtersValue.search};`);
    }
    this.filters = this.filters === '{' ? '' : this.filters.slice(0, -1).concat('}');
    this.filters = encodeURIComponent(this.filters);
  }

  public getPaymentOptionsPaginator(event: PageEvent): PageEvent {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getPaymentOptions();
    return event;
  }

  initForm() {
    this.formPayment = this.formBuilder.group({
      paymentOptionID: [''],
      conditions: ['O', Validators.required],
      enrollTypeID: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      quotaNumber: ['', Validators.required],
      amountEnroll: ['', Validators.required],
      tariff: ['', Validators.required],
      discount: [0, Validators.required],
      totalAmount: [0, Validators.required],
      periodID: ['', Validators.required],
      companyID: [COMPANY_CODES.ITCA, Validators.required],
      paymentOptionDesc: ['', Validators.required],
      statusID: '',
      user: [String(sessionStorage.getItem('name'))]
    });

    this.quotaNumbers = this.formBuilder.group({
      quota: this.formBuilder.array([])
    });
  }

  loadCatalogs() {
    this.common.getEnrollmentType().subscribe({
      next: (res) => {
        this.listEnrollmentType = res;
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
      }
    });
    this.api.getPeriods().subscribe({
      next: (res) => {
        this.listPeriod = res.data;
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
      }
    });
  }

  public fillModal(item: ItcaPayment): void {
    this.initForm();
    this.formPayment.patchValue(item);
  }

  public updatePayment(statusID?: number): void {
    this.charging = true;
    this.formPayment.get('amountEnroll')?.patchValue(+this.formPayment.get('amountEnroll')?.value);
    this.formPayment.get('tariff')?.patchValue(+this.formPayment.get('tariff')?.value);
    if (statusID! >= 0) this.formPayment.get('statusID')?.patchValue(statusID);
    if (this.formPayment.valid) {
      //console.log(this.formPayment.value);
      this.common.putOptionPayment(this.formPayment.value).subscribe({
        next: (res) => {
          //console.log(res);
          this.common.message('Datos actualizados correctamente', '', 'success', '#2eb4d8');
          this.initForm();
          this.isUpdating = false;
          this.charging = false;
          this.getPaymentOptions();
        },
        error: (err: HttpErrorResponse) => {
          //console.log(err);
          this.charging = false;
        }
      });
    }
  }

	public openDialog(item?: ItcaPayment): void {
		const array= {
			currentPeriodID: this.currentPeriod,
			periods: this.listPeriod,
			enrollmentTypes: this.listEnrollmentType,
			enrollTypeDesc: item?.enrollTypeDesc?? 0,
			careerID: item?.careerID ?? 0
		}
		const config: MatDialogConfig = new MatDialogConfig();
		config.id = 'CreateOrUpdatePaymentComponent';
		config.autoFocus = false;
		config.minWidth = '70vw';
		config.maxWidth = '70vw';
		config.panelClass = 'transparent-panel';
		config.data = { array, item };
		config.disableClose = true;
		const dialog = this.dialog.open(CreateOrUpdatePaymentComponent, config);
		dialog.afterClosed()
		.pipe(untilComponentDestroyed(this))
		.subscribe((res) => {
			if(res) this.getPaymentOptions();
		});
	}

}
