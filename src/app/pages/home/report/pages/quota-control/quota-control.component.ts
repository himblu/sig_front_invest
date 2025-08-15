import { DatePipe, NgClass, NgForOf, NgIf } from "@angular/common";
import { HttpErrorResponse, HttpResponse } from "@angular/common/http";
import {
	Component,
	ElementRef,
	inject,
	OnDestroy,
	OnInit,
	SecurityContext,
	ViewChild,
} from "@angular/core";
import {
	FormBuilder,
	FormControl,
	FormGroup,
	FormsModule,
	ReactiveFormsModule,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatNativeDateModule, MatRippleModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatPaginatorModule, PageEvent } from "@angular/material/paginator";
import { MatSelectModule } from "@angular/material/select";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSortModule, Sort } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatTooltipModule } from "@angular/material/tooltip";
import { DomSanitizer } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { SpinnerLoaderComponent } from "@components/spinner-loader/spinner-loader.component";
import { environment } from "@environments/environment";
import { AdministrativeService } from "@services/administrative.service";
import { ApiService } from "@services/api.service";
import {
	Cycle,
	Parallel,
	SPGetCareer,
	SPGetModality,
	StudyPlan,
} from "@utils/interfaces/campus.interfaces";
import { Paginated } from "@utils/interfaces/others.interfaces";
import { Period } from "@utils/interfaces/period.interfaces";
import {
	AvailableQuota,
	StudentQuotaControl,
} from "@utils/interfaces/person.interfaces";
import {
	OnDestroyMixin,
	untilComponentDestroyed,
} from "@w11k/ngx-componentdestroyed";
import { debounceTime, distinctUntilChanged, map, Subscription } from "rxjs";
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { QuotaFinancialReportComponent } from "../../components/quota-financial-report/quota-financial-report.component";

const DISPLAYED_COLUMNS: string[] = [
	"PersonDocumentNumber",
	"PersonFullName",
	"numberPhone",
	"careerName",
	"paymentOptionDesc",
	"totalAmount",
	"paidQuotasInfo",
];

@Component({
	selector: "app-quota-control",
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
		//DatePipe,
		MatDialogModule,
		SpinnerLoaderComponent,
		MatSnackBarModule,
	],
	templateUrl: "./quota-control.component.html",
	styleUrls: ["./quota-control.component.css"],
})
export class QuotaControlComponent
	extends OnDestroyMixin
	implements OnInit, OnDestroy
{
	public filtersForm!: FormGroup;
	public reportsForm!: FormGroup;
	public pageIndex: number = 0;
	public pageSize: number = 10;
	public length: number = 0;
	public filters: string = "";
	public pageSizeOptions: number[] = [5, 10, 25, 50, 100];
	private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	public periods: Array<Period> = [];
	public studentQuotaControl: Array<StudentQuotaControl> = [];
	public dataSource!: MatTableDataSource<StudentQuotaControl>;
	public currentPeriodId: number = 0;
	public availableQuotas: AvailableQuota[] = [];
	public loadingQuotaControl: boolean = true;
	private getQuotaControlSubscription!: Subscription;
	public displayedColumns: string[] = DISPLAYED_COLUMNS;
	public pageEvent!: PageEvent;
	public isGettingNotes: boolean = false;
	public cycles: Cycle[] = [];
	public parallels: Parallel[] = [];
	public parallelsByCycle: Parallel[] = [];
	public careers: SPGetCareer[] = [];
	public studyPlans: StudyPlan[] = [];
	public modalities: SPGetModality[] = [];
	public reportsModalClose: ElementRef;

	@ViewChild("reportsModalClose", { read: ElementRef })
	private getCareersSubscription!: Subscription;
	private dialog: MatDialog = inject(MatDialog);
	private formBuilder: FormBuilder = inject(FormBuilder);
	private api: ApiService = inject(ApiService);
	private admin: AdministrativeService = inject(AdministrativeService);
	private sanitizer: DomSanitizer = inject(DomSanitizer);
	private snackBar: MatSnackBar = inject(MatSnackBar);

	public ngOnInit(): void {
		this.initForm();
		this.initReportsForm();
		this.getDataFromResolver();
		this.getQuotaControls();
	}

	public override ngOnDestroy(): void {
		super.ngOnDestroy();
		if (this.getQuotaControlSubscription) {
			this.getQuotaControlSubscription.unsubscribe();
		}
		if (this.getCareersSubscription) {
			this.getCareersSubscription.unsubscribe();
		}
	}

	private getDataFromResolver(): void {
		this.activatedRoute.data
			.pipe(
				untilComponentDestroyed(this),
				map((value: any) => value["resolver"])
			)
			.subscribe({
				next: (value: {
					periods: Period[];
					currentPeriod: any;
					availableQuotas: AvailableQuota[];
					cycles: Cycle[];
					parallels: Parallel[];
					careers: SPGetCareer[];
					modalities: SPGetModality[];
				}) => {
					this.periods = value.periods;
					this.cycles = value.cycles;
					this.parallels = value.parallels;
					this.careers = value.careers;
					this.availableQuotas = value.availableQuotas;
					this.currentPeriodId = value.currentPeriod?.periodID;
					this.modalities = value.modalities;
				},
			});
	}

	private initForm(): void {
		this.filtersForm = this.formBuilder.group({
			period: 0,
			quotaNumber: 0,
			search: "",
		});
		const searchInput: FormControl = this.filtersForm.get(
			"search"
		) as FormControl;
		if (searchInput) {
			searchInput.valueChanges
				.pipe(
					debounceTime(300),
					distinctUntilChanged(),
					untilComponentDestroyed(this)
				)
				.subscribe({
					next: (value) => {
						this.getQuotaControls();
					},
				});
		}
	}

	public initReportsForm(cycleID: number = 0): void {
		this.reportsForm = this.formBuilder.group({
			cycleID: [cycleID],
			parallelCode: ["-"],
			careerID: [""],
			studyPlanID: [""],
		});
	}

	public getQuotaControls(event?: Sort): void {
		this.loadingQuotaControl = true;
		if (this.getQuotaControlSubscription) {
			this.getQuotaControlSubscription.unsubscribe();
		}
		let filter = this.filtersForm.value;
		this.getQuotaControlSubscription = this.api
			.getQuotaControl({
				periodID: filter.period,
				filter: filter.search,
				quotaNumber: filter.quotaNumber,
				page: this.pageIndex,
				size: this.pageSize,
			})
			.subscribe({
				next: (value: Paginated<StudentQuotaControl>) => {
					this.studentQuotaControl = value.data as Array<StudentQuotaControl>;
					this.length = value.count;
					this.dataSource = new MatTableDataSource<StudentQuotaControl>(
						this.studentQuotaControl
					);
					this.loadingQuotaControl = false;
				},
				error: (err: HttpErrorResponse) => {
					console.log(err);
					this.loadingQuotaControl = false;
				},
			});
	}

	getTooltipInfo(paidQuotasInfo: any): string {
		if (paidQuotasInfo) {
			return `Monto pagado: ${paidQuotasInfo.amount}$\n
					Fecha: ${paidQuotasInfo.payDay}`;
		} else {
			return "Cuota no pagada";
		}
	}

	public generateQuotaReport(): void {
		this.api
			.getQuotaControlReport(
				this.filtersForm.get("period").value,
				this.reportsForm.get("careerID").value,
				this.reportsForm.get("studyPlanID").value,
				this.reportsForm.get("cycleID").value,
				this.reportsForm.get("parallelCode").value
			)
			.subscribe({
				next: (res: HttpResponse<Blob>) => {
					if (res.body) {
						let contentType: string | null | undefined =
							res.headers.get("content-type");
						// Porque el tipo de variable que recibe el type es string o undefined. No recibe null.
						if (!contentType) {
							contentType = undefined;
						}
						const blob: Blob = new Blob([res.body], { type: contentType });
						const url = this.sanitizer.sanitize(
							SecurityContext.RESOURCE_URL,
							this.sanitizer.bypassSecurityTrustResourceUrl(
								URL.createObjectURL(blob)
							)
						);
						if (url) {
							window.open(url, "_blank");
							this.reportsModalClose.nativeElement.click();
						}
					}
				},
				error: (err: HttpErrorResponse) => {
					this.reportsModalClose.nativeElement.click();
					if (err.error instanceof Blob) {
						const reader = new FileReader();
						reader.onload = () => {
							try {
								const errorText = reader.result as string;
								const errorJson = JSON.parse(errorText);
								this.snackBar.open(
									`${errorJson.title}! ${errorJson.message}`,
									null,
									{
										horizontalPosition: "center",
										verticalPosition: "top",
										duration: 5000,
										panelClass: ["red-snackbar"],
									}
								);
							} catch (e) {
								this.snackBar.open(
									"Ocurrió un error! Consulte al administrador",
									null,
									{
										horizontalPosition: "center",
										verticalPosition: "top",
										duration: 5000,
										panelClass: ["red-snackbar"],
									}
								);
							}
						};
						reader.readAsText(err.error);
					} else {
						this.snackBar.open(
							`${err.error.title}!  ${err.error.message}`,
							null,
							{
								horizontalPosition: "center",
								verticalPosition: "top",
								duration: 5000,
								panelClass: ["red-snackbar"],
							}
						);
					}
				},
			});
	}

	public getStudyPlans(careerID: number | string): void {
		if (careerID !== "")
			this.admin.getCareerDetailCatalog(+careerID).subscribe({
				next: (res: StudyPlan[]) => {
					//console.log(res);
					this.studyPlans = res;
				},
				error: (err: HttpErrorResponse) => {},
				complete: () => {},
			});
	}

	public getParallelsByCycle(): void {
		let filters = this.reportsForm.value;
		this.admin
			.getParallelsByStudyPlanAndCycle(
				this.filtersForm.get("period").value,
				filters.careerID,
				filters.studyPlanID,
				filters.cycleID
			)
			.subscribe({
				next: (res) => {
					//console.log('parallels', res);
					this.parallelsByCycle = res;
				},
				error: (err: HttpErrorResponse) => {},
			});
	}

	public getCareerByID(): void {
		if (this.getCareersSubscription) this.getCareersSubscription.unsubscribe();
		this.getCareersSubscription = this.admin
			.getCareerByPeriod(this.filtersForm.get("period").value)
			.subscribe({
				next: (value) => {
					this.careers = value;
				},
				error: (err: HttpErrorResponse) => {
					console.log(err);
				},
			});
	}

	public generateEnrollReport(): void {
		this.api
			.getEnrollReport(
				this.filtersForm.get("period").value,
				this.reportsForm.get("careerID").value,
				this.reportsForm.get("studyPlanID").value,
				this.reportsForm.get("cycleID").value,
				this.reportsForm.get("parallelCode").value
			)
			.subscribe({
				next: (res: HttpResponse<Blob>) => {
					if (res.body) {
						let contentType: string | null | undefined =
							res.headers.get("content-type");
						// Porque el tipo de variable que recibe el type es string o undefined. No recibe null.
						if (!contentType) {
							contentType = undefined;
						}
						const blob: Blob = new Blob([res.body], { type: contentType });
						const url = this.sanitizer.sanitize(
							SecurityContext.RESOURCE_URL,
							this.sanitizer.bypassSecurityTrustResourceUrl(
								URL.createObjectURL(blob)
							)
						);
						if (url) {
							window.open(url, "_blank");
							this.reportsModalClose.nativeElement.click();
						}
					}
				},
				error: (err: HttpErrorResponse) => {
					this.reportsModalClose.nativeElement.click();
					this.snackBar.open(`Periodo (Nivel)`, "No disponible", {
						horizontalPosition: "center",
						verticalPosition: "top",
						duration: 4000,
						panelClass: ["red-snackbar"],
					});
				},
			});
	}

	public getQuotaControlFromPaginator(event: PageEvent): PageEvent {
		this.pageIndex = event.pageIndex;
		this.pageSize = event.pageSize;
		this.getQuotaControls();
		return event;
	}

	public trackByPeriodId(index: number, item: Period): number {
		return item.periodID;
	}

	public trackByAvailableQuota(index: number, item: AvailableQuota): number {
		return item.quota;
	}

	public openFile(relativeRoute: string): void {
		const route: string = `${environment.url}/${relativeRoute}`;
		this.api.getPdfContent(route).subscribe((res: HttpResponse<Blob>) => {
			if (res.body) {
				let contentType: string | null | undefined =
					res.headers.get("content-type");
				// Porque el tipo de variable que recibe el type es string o undefined. No recibe null.
				if (!contentType) {
					contentType = undefined;
				}
				const blob: Blob = new Blob([res.body], { type: contentType });
				const url = this.sanitizer.sanitize(
					SecurityContext.RESOURCE_URL,
					this.sanitizer.bypassSecurityTrustResourceUrl(
						URL.createObjectURL(blob)
					)
				);
				if (url) {
					window.open(url, "_blank");
				}
			}
		});
	}

	public openDialog(): void {
		const periodID= this.filtersForm.get('period').value;
		const modalities= this.modalities;
		const config: MatDialogConfig = new MatDialogConfig();
		config.id = 'QuotaFinancialReportComponent';
		config.autoFocus = false;
		config.minWidth = '50vw';
		config.maxWidth = '50vw';
		config.panelClass = 'transparent-panel';
		config.data = { periodID, modalities };
		config.disableClose = false;
		const dialog = this.dialog.open(QuotaFinancialReportComponent, config);
		dialog.afterClosed()
		.pipe(untilComponentDestroyed(this))
		.subscribe((res) => {
			this.getQuotaControls();
		});
	}
}
