import { Component, inject, OnDestroy, OnInit, SecurityContext, ViewChild } from '@angular/core';
import { DatePipe, LowerCasePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import {
	RequestedPublication,
	PublicationAvailability,
	PublicationCondition,
	PublicationIncomeType,
	PublicationListForm,
	PublicationType,
	REQUESTED_PUBLICATION_STATUS,
	RequestedPublicationDetail,
	RequestedPublicationByApplicant, PublicationStatus, PublicationListFormValue
} from '@utils/interfaces/library.interface';
import { Campus } from '@utils/interfaces/period.interfaces';
import { debounceTime, distinctUntilChanged, forkJoin, map, Observable, Subscription } from 'rxjs';
import { ApiService } from '@services/api.service';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PaginatedResource } from '@utils/interfaces/person.interfaces';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { CdkConnectedOverlay, CdkOverlayOrigin, Overlay } from '@angular/cdk/overlay';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmationComponent } from '../../../academic-management/components/confirmation/confirmation.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { addDays } from 'date-fns';
import {MajorSchool, SPGetCareer} from '@utils/interfaces/campus.interfaces';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import {AdministrativeService} from '@services/administrative.service';

const DISPLAYED_COLUMNS: string[] = ['documentNumber', 'names', 'dateRequest', 'numberPhone', 'modalityName', 'careerName','studyPlanDesc', 'requestStatusID', 'actions'];

interface ManageRequestedPublicationForm {
	requestId: FormControl<number |	null>;
	observation: FormControl<string | null>;
	status: FormControl<number | null>;
}

interface ManageRequestedPublicationFormValue {
	requestId: number;
	observation: string;
	status: number;
}

interface ManageRequestedPublicationDetailForm {
	requestDetailId: FormControl<number |	null>; // loanPublicationID
	observation: FormControl<string | null>;
	status: FormControl<number | null>;
}

interface ReturnPublicationDetailForm {
	requestDetailId: FormControl<number |	null>; // loanPublicationID
	condition: FormControl<number | null>;
	returnDate: FormControl<Date | null>;
	returnHour: FormControl<string | null>;
	observation: FormControl<string | null>;
}

interface ManageRequestedPublicationDetailFormValue {
	requestDetailId: number;
	observation: string;
	status: number;
}

let ECUADOR_LOCAL_STRING: string = new Date().toLocaleString('en-US',{ timeZone: 'America/Guayaquil'});

@Component({
	selector: 'app-borrowed-publication',
	standalone: true,
	imports: [
		MatButtonModule,
		MatFormFieldModule,
		MatIconModule,
		MatInputModule,
		MatMenuModule,
		MatOptionModule,
		MatPaginatorModule,
		MatRippleModule,
		MatSelectModule,
		MatSidenavModule,
		MatSortModule,
		MatTableModule,
		ReactiveFormsModule,
		SpinnerLoaderComponent,
		NgClass,
		NgIf,
		NgForOf,
		MatProgressSpinnerModule,
		MatDialogModule,
		MatSnackBarModule,
		CdkOverlayOrigin,
		CdkConnectedOverlay,
		MatTooltipModule,
		DatePipe,
		LowerCasePipe,
		MatDatepickerModule,
	],
	templateUrl: './borrowed-publication.component.html',
	styleUrls: ['./borrowed-publication.component.css'],
	animations: [
		trigger('detailExpand', [
			state('collapsed', style({height: '0px', minHeight: '0'})),
			state('expanded', style({height: '*'})),
			transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
		])
	],
	providers: [
		DatePipe
	]
})

export class BorrowedPublicationComponent extends OnDestroyMixin implements OnInit, OnDestroy {
	public startAt: Date = new Date(ECUADOR_LOCAL_STRING);
	public minDate: Date = this.startAt;
	public maxDate: Date = addDays(this.minDate, 90);
	public form!: FormGroup<PublicationListForm>;
	public manageRequestedPublicationForm!: FormGroup<ManageRequestedPublicationForm>;
	public manageRequestedPublicationDetailForm!: FormGroup<ManageRequestedPublicationDetailForm>;
	public returnRequestedPublicationDetailForm!: FormGroup<ReturnPublicationDetailForm>;
	public borrowedPublications: Array<RequestedPublication> = [];
	public isLoadingBorrowedPublications: boolean = true;
	public dataSource!: MatTableDataSource<RequestedPublication>;
	public pageIndex: number = 0;
	public pageSize: number = 10;
	public filters: string = '';
	public length: number = 0;
	public pageEvent!: PageEvent;
	public displayedColumns: string[] = DISPLAYED_COLUMNS;
	public displayedColumnsWithDetail: string[] = [...this.displayedColumns, 'expandedDetail'];
	public pageSizeOptions: number[] = [10, 25, 50, 100];
	public campuses: Array<Campus> = [];
	public expandedElement: RequestedPublication | null;
	public selectedBorrowedPublicationDetail: RequestedPublication;
	public isLoadingBorrowedPublicationDetail: boolean = false;
	public publicationsCondition: Array<PublicationCondition> = [];
	public schools: Array<MajorSchool> = [];
	public publicationTypes: Array<PublicationType> = [];
	public incomeTypes: Array<PublicationIncomeType> = [];
	public publicationStatuses: PublicationStatus[] = [];
	public publicationAvailabilities: Array<PublicationAvailability> = [];
	public careers: SPGetCareer[] = [];

	@ViewChild(MatSort, { static: true }) public sort!: MatSort;
	@ViewChild('paginator', { static: true }) public paginator!: MatPaginator;

	private getDeweySubcategoriesSubscription: Subscription;
	private getKnowledgeSpecificSubareasSubscription: Subscription;
	private getKnowledgeSubareasSubscription: Subscription;
	private getListsSubscription: Subscription;
	private updateRequestPublicationStatusSubscription: Subscription;
	private getPublicationsSubscription!: Subscription;
	private getPublicationDetailSubscription!: Subscription;
	private registerPublicationDetailReturnSubscription: Subscription;
	public overlay: Overlay = inject(Overlay);
	private formBuilder: FormBuilder = inject(FormBuilder);
	private api: ApiService = inject(ApiService);
	private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private sanitizer: DomSanitizer = inject(DomSanitizer);
	private dialog: MatDialog = inject(MatDialog);
	private snackBar: MatSnackBar = inject(MatSnackBar);
	private datePipe: DatePipe = inject(DatePipe);
	private admin: AdministrativeService = inject(AdministrativeService);


	constructor() {
		super();
		this.initForm();
		this.getLists();
		this.initRequestedPublicationFormManager();
		this.initRequestedPublicationDetailFormManager();
		this.initReturnPublicationDetailFormManager();
		this.getBorrowedPublications();
		this.getCareers();
	}

	private initForm(): void {
		this.form = this.formBuilder.group<PublicationListForm>({
			search: this.formBuilder.control(null),
			majors: this.formBuilder.control(''),
			publicationType: this.formBuilder.control(''),
			status: this.formBuilder.control(''),
		});
		const searchInput: FormControl = this.form.get('search') as FormControl;
		if (searchInput) {
			searchInput.valueChanges.pipe(
				debounceTime(300),
				distinctUntilChanged(),
				untilComponentDestroyed(this)
			).subscribe({
				next: () => {
					this.paginator.pageIndex = 0;
					this.pageIndex = 1;
					this.getBorrowedPublications();
				}
			});
		}
	}

	public getLists(): void {
		if (this.getListsSubscription) this.getListsSubscription.unsubscribe();
		let observables: Observable<any>[] = [];
		observables = [
			this.api.getMajorSchools(),
			this.api.getPublicationTypes(),
			this.api.getPublicationStatuses(),
			this.api.getPublicationConditions()
		];
		this.getListsSubscription = forkJoin(observables)
			.pipe(
				map((
					[
						schools,
					 	publicationTypes,
						publicationStatuses,
						publicationConditions
				 	]
				) => {
					return {
						schools,
						publicationTypes,
						publicationStatuses,
						publicationConditions
					};
				})
			).subscribe({
			next: (value: { schools: MajorSchool[], publicationTypes: PublicationType[], publicationStatuses: PublicationStatus[], publicationConditions: PublicationCondition[] }) => {
				this.schools = value.schools;
				this.publicationTypes = value.publicationTypes;
				this.publicationStatuses = value.publicationStatuses;
				this.publicationsCondition = value.publicationConditions;
			}
		});
	}

	private initRequestedPublicationFormManager(): void {
		this.manageRequestedPublicationForm = this.formBuilder.group<ManageRequestedPublicationForm>({
			requestId: this.formBuilder.control(null, [Validators.required]),
			status: this.formBuilder.control(null, [Validators.required]),
			observation: this.formBuilder.control(null, [Validators.required]),
		});
	}

	private initRequestedPublicationDetailFormManager(): void {
		this.manageRequestedPublicationDetailForm = this.formBuilder.group<ManageRequestedPublicationDetailForm>({
			requestDetailId: this.formBuilder.control(null, [Validators.required]),
			status: this.formBuilder.control(null, [Validators.required]),
			observation: this.formBuilder.control(null, [Validators.required]),
		});
	}

	private initReturnPublicationDetailFormManager(): void {
		this.returnRequestedPublicationDetailForm = this.formBuilder.group<ReturnPublicationDetailForm>({
			requestDetailId: this.formBuilder.control(null, [Validators.required]),
			returnDate: this.formBuilder.control(this.startAt, [Validators.required]),
			returnHour: this.formBuilder.control(null, [Validators.required]),
			observation: this.formBuilder.control(null),
			condition: this.formBuilder.control(null, [Validators.required]),
		});
	}

	public resetRequestedPublicationFormManager(): void {
		this.manageRequestedPublicationForm.reset();
	}

	public resetRequestedPublicationDetailFormManager(): void {
		this.manageRequestedPublicationDetailForm.reset();
	}

	public resetReturnPublicationDetailFormManager(): void {
		this.returnRequestedPublicationDetailForm.reset();
		this.returnRequestedPublicationDetailForm.patchValue({ returnDate: new Date(ECUADOR_LOCAL_STRING) });
	}

	public rejectRequestPublicationStatus(requestedPublication: RequestedPublication): void {
		this.manageRequestedPublicationForm.patchValue({
			requestId: requestedPublication.requestID,
			status: REQUESTED_PUBLICATION_STATUS.REJECTED
		});
		if (this.manageRequestedPublicationForm.invalid) {
			this.manageRequestedPublicationForm.markAllAsTouched();
			this.manageRequestedPublicationForm.markAsDirty();
			return;
		}
		if (this.updateRequestPublicationStatusSubscription) this.updateRequestPublicationStatusSubscription.unsubscribe();
		const formValue: ManageRequestedPublicationFormValue = this.manageRequestedPublicationForm.value as unknown as ManageRequestedPublicationFormValue;
		this.updateRequestPublicationStatusSubscription = this.api.updateRequestedPublication(
			formValue.requestId,
			formValue.status,
			formValue.observation
		).subscribe({
			next: (value) => {
				this.getBorrowedPublications();
				requestedPublication.openOverlay = false;
				this.snackBar.dismiss();
				this.snackBar.open(
					`Publicación Rechazada Correctamente`,
					undefined,
					{
						horizontalPosition: 'center',
						verticalPosition: 'top',
						duration: 4000,
						panelClass: ['green-snackbar']
					}
				);
			},
			error: () => {

			}
		});
	}

	public rejectRequestPublicationDetailStatus(publication: RequestedPublicationDetail): void {
		this.manageRequestedPublicationDetailForm.patchValue({
			requestDetailId: publication.loanPublicationID,
			status: REQUESTED_PUBLICATION_STATUS.REJECTED
		});
		if (this.manageRequestedPublicationDetailForm.invalid) {
			this.manageRequestedPublicationDetailForm.markAllAsTouched();
			this.manageRequestedPublicationDetailForm.markAsDirty();
			return;
		}
		if (this.updateRequestPublicationStatusSubscription) this.updateRequestPublicationStatusSubscription.unsubscribe();
		const formValue: ManageRequestedPublicationDetailFormValue = this.manageRequestedPublicationDetailForm.value as unknown as ManageRequestedPublicationDetailFormValue;
		this.updateRequestPublicationStatusSubscription = this.api.updateRequestedPublicationDetail(
			formValue.requestDetailId,
			formValue.status,
			formValue.observation
		).subscribe({
			next: (value) => {
				this.getBorrowedPublications();
				publication.openOverlay = false;
				this.snackBar.dismiss();
				this.snackBar.open(
					`Publicación Rechazada Correctamente`,
					undefined,
					{
						horizontalPosition: 'center',
						verticalPosition: 'top',
						duration: 4000,
						panelClass: ['green-snackbar']
					}
				);
			},
			error: () => {

			}
		});
	}

	public approveRequestedPublication(requestedPublication: RequestedPublication): void {
		const config: MatDialogConfig = new MatDialogConfig();
		config.autoFocus = false;
		config.minWidth = '200px';
		config.maxWidth = '600px';
		config.panelClass = 'transparent-panel';
		config.data = {
			message: '¿Estás seguro de aprobar esta solicitud? Todas las publicaciones asociadas a esta solicitud serán aprobadas.'
		};
		const dialog = this.dialog.open(ConfirmationComponent, config);
		dialog.afterClosed()
			.subscribe((res) => {
				if (res) {
					if (this.updateRequestPublicationStatusSubscription) this.updateRequestPublicationStatusSubscription.unsubscribe();
					this.updateRequestPublicationStatusSubscription = this.api.updateRequestedPublication(
						requestedPublication.requestID,
						REQUESTED_PUBLICATION_STATUS.APPROVED,
						''
					).subscribe({
						next: (value) => {
							this.getBorrowedPublications();
							this.snackBar.dismiss();
							this.snackBar.open(
								`Solicitud de Publicaciones Aprobada Correctamente`,
								undefined,
								{
									horizontalPosition: 'center',
									verticalPosition: 'top',
									duration: 4000,
									panelClass: ['green-snackbar']
								}
							);
						},
						error: () => {

						}
					});
				}
			});
	}

	public approveRequestedPublicationDetail(requestedPublicationDetail: RequestedPublicationDetail): void {
		const config: MatDialogConfig = new MatDialogConfig();
		config.autoFocus = false;
		config.minWidth = '200px';
		config.maxWidth = '600px';
		config.panelClass = 'transparent-panel';
		config.data = {
			message: '¿Estás seguro de aprobar esta publicación?'
		};
		const dialog = this.dialog.open(ConfirmationComponent, config);
		dialog.afterClosed()
			.subscribe((res) => {
				if (res) {
					if (this.updateRequestPublicationStatusSubscription) this.updateRequestPublicationStatusSubscription.unsubscribe();
					this.updateRequestPublicationStatusSubscription = this.api.updateRequestedPublicationDetail(
						requestedPublicationDetail.loanPublicationID,
						REQUESTED_PUBLICATION_STATUS.APPROVED,
						''
					).subscribe({
						next: (value) => {
							this.getBorrowedPublications();
							this.snackBar.dismiss();
							this.snackBar.open(
								`Solicitud de Documento Aprobada Correctamente`,
								undefined,
								{
									horizontalPosition: 'center',
									verticalPosition: 'top',
									duration: 4000,
									panelClass: ['green-snackbar']
								}
							);
						},
						error: () => {

						}
					});
				}
			});
	}

	public getBorrowedPublications(changeFilter:boolean=true,event?: Sort): void {
		this.isLoadingBorrowedPublications = true;
		if (this.getPublicationsSubscription) {
			this.getPublicationsSubscription.unsubscribe();
		}
		this.buildEncodedFilters();
		this.getPublicationsSubscription = this.api.getBorrowedPublications(
			this.pageIndex,
			this.pageSize,
			this.filters,
			event?.active || 'dateRequest',
			event?.direction || 'desc'
		).subscribe({
			next: (value: PaginatedResource<RequestedPublication>) => {
				this.borrowedPublications = value.items;
				this.length = value.totalItems;
				this.dataSource = new MatTableDataSource<RequestedPublication>(this.borrowedPublications);
				this.isLoadingBorrowedPublications = false;
				// Reiniciar la página en el paginador
				if (changeFilter) this.paginator.firstPage();
			},
			error: (err: HttpErrorResponse) => {
				this.isLoadingBorrowedPublications = false;
			}
		});
	}

	private buildEncodedFilters(): void {
		this.filters = '{';
		const filtersValue: PublicationListFormValue = this.form.value as unknown as PublicationListFormValue;
		if (filtersValue.search) {
			this.filters = this.filters.concat(`edition:or:like:${filtersValue.search};`);
			this.filters = this.filters.concat(`title:or:like:${filtersValue.search};`);
			this.filters = this.filters.concat(`deweyCodeInternal:or:like:${filtersValue.search};`);
			this.filters = this.filters.concat(`codeISBN:or:like:${filtersValue.search};`);
			this.filters = this.filters.concat(`personFirstName:or:like:${filtersValue.search};`);
			this.filters = this.filters.concat(`personMiddleName:or:like:${filtersValue.search};`);
			this.filters = this.filters.concat(`personLastName:or:like:${filtersValue.search};`);
		}
		this.filters = filtersValue.majors ? this.filters.concat(`careerID:and:eq:${filtersValue.majors};`) : this.filters.concat('');
		this.filters = filtersValue.publicationType ? this.filters.concat(`publicationTypeID:and:eq:${filtersValue.publicationType};`) : this.filters.concat('');
		this.filters = filtersValue.status ? this.filters.concat(`requestStatusID:and:eq:${filtersValue.status};`) : this.filters.concat('');
		this.filters = this.filters === '{' ? '' : this.filters.slice(0, -1).concat('}');
		this.filters = encodeURIComponent(this.filters);
	}

	public getPublicationsPaginator(event: PageEvent): PageEvent {
		this.pageIndex = event.pageIndex;
		this.pageSize = event.pageSize;
		this.getBorrowedPublications(false);
		return event;
	}

	public ngOnInit(): void {
	}

	public override ngOnDestroy() {
		super.ngOnDestroy();
	}

	public getRequestedPublication(element: RequestedPublication | null, updateDatasource: boolean = false): void {
		// https://stackblitz.com/edit/angular-35wzca?file=app%2Ftable-expandable-rows-example.html,app%2Ftable-expandable-rows-example.ts
		if (this.expandedElement === null || this.expandedElement !== element) {
			this.isLoadingBorrowedPublicationDetail = true;
			if (this.getPublicationDetailSubscription) {
				this.getPublicationDetailSubscription.unsubscribe();
			}
			this.getPublicationDetailSubscription = this.api.getRequestedPublication(element.requestID)
				.subscribe({
					next: (value: RequestedPublication) => {
						this.selectedBorrowedPublicationDetail = this.expandedElement = value;
						this.expandedElement = this.expandedElement === element ? null : element;
						if (updateDatasource) {
							const index = this.borrowedPublications.findIndex((item) => item.requestID === value.requestID);
							if (index !== -1) {
								this.borrowedPublications[index] = this.dataSource.data[index] = value;
							}
						}
					},
					error: (err: HttpErrorResponse) => {
						this.selectedBorrowedPublicationDetail = null;
					},
					complete: () => {
						setTimeout(() => {
							this.isLoadingBorrowedPublicationDetail = false;
						}, 400);
					}
				});
		}
		this.expandedElement = this.expandedElement === element ? null : element;
	}

	protected readonly REQUESTED_PUBLICATION_STATUS = REQUESTED_PUBLICATION_STATUS;

	public registerPublicationDetailReturn(publication: RequestedPublicationDetail, requestedPublication: RequestedPublication): void {
		this.returnRequestedPublicationDetailForm.patchValue({ requestDetailId: publication.loanPublicationID });
		if (this.returnRequestedPublicationDetailForm.invalid) {
			this.returnRequestedPublicationDetailForm.markAllAsTouched();
			this.returnRequestedPublicationDetailForm.markAsDirty();
			return;
		}
		if (this.registerPublicationDetailReturnSubscription) this.registerPublicationDetailReturnSubscription.unsubscribe();
		const formValue = this.returnRequestedPublicationDetailForm.value;
		this.registerPublicationDetailReturnSubscription = this.api.returnRequestedPublicationDetail(
			formValue.requestDetailId,
			formValue.condition,
			this.datePipe.transform(formValue.returnDate, 'yyyy-MM-dd') + ' ' + formValue.returnHour + ':00',
			formValue.observation
		).subscribe({
			next: (value: RequestedPublicationDetail) => {
				publication.openOverlayReturnForm = false;
				const rowTable=this.dataSource.filteredData.find(item=>item.requestID===this.selectedBorrowedPublicationDetail.requestID);
				this.updateStateIfOnlyOneHasStatus5(this.selectedBorrowedPublicationDetail.publications,rowTable)
				this.getRequestedPublication(requestedPublication, true);
				this.snackBar.dismiss();
				this.snackBar.open(
					`Devolución Registrada Correctamente`,
					undefined,
					{
						horizontalPosition: 'center',
						verticalPosition: 'top',
						duration: 4000,
						panelClass: ['green-snackbar']
					}
				);
			},
			error: (_err: HttpErrorResponse) => {
				console.error(_err);
			}
		});
	}

	public downloadFile(publication: RequestedPublicationDetail): void {
		this.api.getPublicationPdf(publication.publicationID).subscribe((res: HttpResponse<Blob>) => {
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

	public openReturnForm(publication: RequestedPublicationDetail): void {
		publication.openOverlayReturnForm = true;
		ECUADOR_LOCAL_STRING = new Date().toLocaleString('en-US', {timeZone: 'America/Guayaquil'});
		const now: Date = new Date(ECUADOR_LOCAL_STRING);
		const hours: number = now.getHours();
		const minutes: number = now.getMinutes();
		const formattedHour: string = `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`;

		this.returnRequestedPublicationDetailForm.patchValue({
			returnDate: now,
			returnHour: formattedHour
		});
	}

	public getCareers(){
		this.admin.getCareersTables().subscribe({
			next: (res) => {
				this.careers = res.data.filter(career => career.statusID === 1);
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	public updateStateIfOnlyOneHasStatus5(array: any[], requestedPublication: any): void {
		// Filter objects with requestStatusID equal to 5
		const statesWith5 = array.filter(item => item.requestStatusID !== 5);
		// Check if only one object has status 5
		if (statesWith5.length === 1) {
			requestedPublication.backgroundColor = '#007bff';
			requestedPublication.requestStatusID = 5;
			requestedPublication.requestStatusName = 'FINALIZADO';
		}
	}
}
