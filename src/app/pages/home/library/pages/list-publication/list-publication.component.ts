import { Component, inject, OnDestroy, OnInit, SecurityContext, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatNativeDateModule, MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { JsonPipe, NgClass, NgForOf, NgIf, NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import {
	Author,
	DeweyCategory,
	DeweySubcategory,
	KnowledgeArea,
	KnowledgeSpecificSubarea,
	KnowledgeSubarea, PublicationAvailability,
	PublicationCondition,
	PublicationIncomeType, PublicationListForm, PublicationListFormValue, PublicationStatus,
	PublicationType,
	PublicationView,
} from '@utils/interfaces/library.interface';
import { debounceTime, distinctUntilChanged, map, Subscription } from 'rxjs';
import { ApiService } from '@services/api.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PaginatedResource } from '@utils/interfaces/person.interfaces';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { environment } from '@environments/environment';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatBadgeModule } from '@angular/material/badge';
import { Campus, Period } from '@utils/interfaces/period.interfaces';
import {MajorSchool, SPGetCareer, SPGetModality } from '@utils/interfaces/campus.interfaces';
import { ConfirmationComponent } from '../../../academic-management/components/confirmation/confirmation.component';
import { RequestPublicationComponent } from '../../components/request-publication/request-publication.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { UserService } from '@services/user.service';
import { User } from '@utils/models/user.models';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { ROL } from '@utils/interfaces/login.interfaces';
import { RequestedPublicationComponent } from '../../components/requested-publication/requested-publication.component';
import { BorrowedPublicationComponent } from '../borrowed-publication/borrowed-publication.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdministrativeService } from '@services/administrative.service';

const DISPLAYED_COLUMNS: string[] = ['deweyCodeInternal', 'title', 'edition', 'codeISBN', 'publicationYear', 'stock', 'statusID', 'actions'];

@Component({
  selector: 'app-list-publication',
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
		MatSortModule,
		MatTableModule,
		MatDialogModule,
		MatSnackBarModule,
		NgForOf,
		NgIf,
		ReactiveFormsModule,
		SpinnerLoaderComponent,
		NgClass,
		MatSidenavModule,
		MatBadgeModule,
		MatNativeDateModule,
		MatDatepickerModule,
		MatTabsModule,
		NgTemplateOutlet,
		RequestedPublicationComponent,
		BorrowedPublicationComponent,
		RouterLink,
		MatTooltipModule,
	],
  templateUrl: './list-publication.component.html',
  styleUrls: ['./list-publication.component.css']
})

export class ListPublicationComponent extends OnDestroyMixin implements OnInit, OnDestroy{
	@ViewChild(BorrowedPublicationComponent) borrowedPublicationComponent?: BorrowedPublicationComponent;
	@ViewChild(RequestedPublicationComponent) RequestedPublicationComponent?: RequestedPublicationComponent;

	public visibleBorrowedComponent: boolean = false;
	public user: User;
	public form!: FormGroup<PublicationListForm>;
  public publications: Array<PublicationView> = [];
	public publicationsToBeLending: Array<PublicationView> = [];
  public isLoadingPublications: boolean = true;
  public authors: Array<Author> = [];
  public dataSource!: MatTableDataSource<PublicationView>;
  public pageIndex: number = 0;
  public pageSize: number = 10;
  public filters: string = '';
  public length: number = 0;
  public pageEvent!: PageEvent;
  public displayedColumns: string[] = DISPLAYED_COLUMNS;
  public pageSizeOptions: number[] = [10, 25, 50, 100];
	public deweyCategories: Array<DeweyCategory> = [];
	public deweySubcategories: Array<DeweySubcategory> = [];
	public knowledgeAreas: Array<KnowledgeArea> = [];
	public knowledgeSubareas: Array<KnowledgeSubarea> = [];
	public knowledgeSpecificSubareas: Array<KnowledgeSpecificSubarea> = [];
	public campuses: Array<Campus> = [];
	public schools: Array<MajorSchool> = [];
	public careers: SPGetCareer[] = [];
	public publicationsCondition: Array<PublicationCondition> = [];
	public incomeTypes: Array<PublicationIncomeType> = [];
	public publicationTypes: Array<PublicationType> = [];
	public publicationAvailabilities: Array<PublicationAvailability> = [];
	public periods: Period[] = [];
	public modalities: SPGetModality[] = [];
	public publicationStatuses: PublicationStatus[] = [];
	public rolIDSession:string;
	public rolesAllowed : string[] = ['16', '1'];
  @ViewChild(MatSort, { static: true }) public sort!: MatSort;
  @ViewChild('paginator') public paginator!: MatPaginator;

	private getPdfContentSubscription!: Subscription;
	private getDeweySubcategoriesSubscription: Subscription;
	private getKnowledgeSpecificSubareasSubscription: Subscription;
	private getKnowledgeSubareasSubscription: Subscription;
  private getPublicationsSubscription!: Subscription;
  private formBuilder: FormBuilder = inject(FormBuilder);
  private api: ApiService = inject(ApiService);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private dialog: MatDialog = inject(MatDialog);
  private snackBar: MatSnackBar = inject(MatSnackBar);
	private userService: UserService = inject(UserService);
	private sanitizer: DomSanitizer = inject(DomSanitizer);
	private admin: AdministrativeService = inject(AdministrativeService);

  constructor() {
	  super();
	  this.rolIDSession = sessionStorage.getItem('rolID');
		this.user = this.userService.currentUser;
  }

	public ngOnInit(): void {
		this.initForm();
		this.loadSelectedPublicationsFromLocalStorage();
		this.getDataFromResolver();
		this.getPublications();
		this.getCareers();
	}

	private initForm(): void {
		this.form = this.formBuilder.group<PublicationListForm>({
			search: this.formBuilder.control(null),
			deweyCategory: this.formBuilder.control(''),
			deweySubcategory: this.formBuilder.control(''),
			knowledgeArea: this.formBuilder.control(''),
			knowledgeSubarea: this.formBuilder.control(''),
			knowledgeSpecificSubarea: this.formBuilder.control(''),
			majors: this.formBuilder.control(''),
			publicationType: this.formBuilder.control(''),
		});
		const searchInput: FormControl = this.form.get('search') as FormControl;
		if (searchInput) {
			searchInput.valueChanges.pipe(
				debounceTime(300),
				distinctUntilChanged(),
				untilComponentDestroyed(this)
			).subscribe({
				next: () => {
					this.getPublications();
				}
			});
		}
	}

	private getDataFromResolver(): void {
		this.activatedRoute.data
			.pipe(
				untilComponentDestroyed(this),
				map((value: any) => value['resolver']))
			.subscribe({
				next: (value: {
					publicationsCondition: PublicationCondition[],
					deweyCategories: DeweyCategory[],
					schools: MajorSchool[],
					knowledgeAreas: KnowledgeArea[],
					incomeTypes: PublicationIncomeType[],
					campuses: Campus[],
					publicationTypes: PublicationType[],
					availabilityPublications: PublicationAvailability[],
					periods: Period[],
					publicationStatuses: PublicationStatus[]
					// modalities: SPGetModality[]
				}) => {
					this.publicationsCondition = value.publicationsCondition;
					this.deweyCategories = value.deweyCategories;
					this.schools = value.schools;
					this.knowledgeAreas = value.knowledgeAreas;
					this.incomeTypes = value.incomeTypes;
					this.campuses = value.campuses;
					this.publicationTypes = value.publicationTypes;
					this.publicationAvailabilities = value.availabilityPublications;
					this.periods = value.periods;
					this.publicationStatuses = value.publicationStatuses;
					// this.modalities = value.modalities;
				},
			});
	}

	public override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	private saveSelectedPublicationsToLocalStorage(): void {
		localStorage.setItem('selectedPublications', JSON.stringify(this.publicationsToBeLending));
	}

	private loadSelectedPublicationsFromLocalStorage(): void {
		this.publicationsToBeLending = JSON.parse(localStorage.getItem('selectedPublications')) as PublicationView[] || [];
	}

	public getPublications(changeFilter:boolean=true, event?: Sort): void {
    this.isLoadingPublications = true;
    if (this.getPublicationsSubscription) {
      this.getPublicationsSubscription.unsubscribe();
    }
		if (changeFilter) {
			this.pageIndex=0
		}
    this.buildEncodedFilters();
    this.getPublicationsSubscription = this.api.getPublications(
      this.pageIndex,
      this.pageSize,
      this.filters,
      event?.active || 'title',
      event?.direction || 'asc'
    ).subscribe({
      next: (value: PaginatedResource<PublicationView>) => {
				//console.log(value);
        this.publications = value.items;
        this.length = value.totalItems;
        this.dataSource = new MatTableDataSource<PublicationView>(this.publications);
        this.isLoadingPublications = false;
				// this.requestSelectedPublications();
				if (changeFilter && this.paginator)	this.paginator.firstPage()
      },
      error: (_err: HttpErrorResponse) => {
        this.isLoadingPublications = false;
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
			this.filters = this.filters.concat(`authorName:or:like:${filtersValue.search};`);
		}
    this.filters = filtersValue.deweyCategory ? this.filters.concat(`deweyCategoryID:and:eq:${filtersValue.deweyCategory};`) : this.filters.concat('');
    this.filters = filtersValue.deweySubcategory ? this.filters.concat(`deweySubCategoryID:and:eq:${filtersValue.deweySubcategory};`) : this.filters.concat('');
    this.filters = filtersValue.knowledgeArea ? this.filters.concat(`knowledgeAreaID:and:eq:${filtersValue.knowledgeArea};`) : this.filters.concat('');
    this.filters = filtersValue.knowledgeSubarea ? this.filters.concat(`subAreaKnowledgeID:and:eq:${filtersValue.knowledgeSubarea};`) : this.filters.concat('');
    this.filters = filtersValue.knowledgeSpecificSubarea ? this.filters.concat(`specificSubareaKnowledgeID:and:eq:${filtersValue.knowledgeSpecificSubarea};`) : this.filters.concat('');
    this.filters = filtersValue.publicationType ? this.filters.concat(`publicationTypeID:and:eq:${filtersValue.publicationType};`) : this.filters.concat('');
		this.filters = filtersValue.majors ? this.filters.concat(`careerID:and:eq:${filtersValue.majors};`) : this.filters.concat('');
    this.filters = this.filters === '{' ? '' : this.filters.slice(0, -1).concat('}');
    this.filters = encodeURIComponent(this.filters);
  }

  public changeStatus(publication: PublicationView): void {
		const config: MatDialogConfig = new MatDialogConfig();
		config.id = 'updatePublicationStatus';
		config.autoFocus = false;
		config.minWidth = '200px';
		config.maxWidth = '600px';
		config.panelClass = 'transparent-panel';
		const message: string = `${publication.statusID === 1 ? '¿Estás seguro de inhabilitar esta publicación? Esta publicación ya no estará disponible para préstamo y todos los usuarios que tengan pendiente la solicitud de esta publicación, serán notificados sobre la cancelación del préstamo.' : '¿Estás seguro de volver a activar esta publicación?'}`;
		config.data = {
			message
		};
		const dialog = this.dialog.open(ConfirmationComponent, config);
		dialog.afterClosed()
			.pipe(untilComponentDestroyed(this))
			.subscribe((res) => {
				if (res) {
					this.api.updatePublicationStatus(publication.publicationID, publication.statusID === 1 ? 0 : 1).subscribe({
						next: (_value) => {
							this.snackBar.open(
								`Publicación ${publication.statusID === 1 ? 'desactivada': 'activada' } correctamente`,
								undefined,
								{
									horizontalPosition: 'center',
									verticalPosition: 'top',
									duration: 4000,
									panelClass: ['green-snackbar']
								}
							);
							this.getPublications();
						}
					});
				}
			});
  }

  // public createOrUpdatePublication(publication?: PublicationView): void {
	// 	this.router.navigate(['/biblioteca/editar-publicacion/'+publication.publicationID]).then();
  // }

  public getPublicationsPaginator(changeFilter:boolean=true,event: PageEvent): PageEvent {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getPublications(changeFilter);
    return event;
  }

	public addToSelectedPublications(publication: PublicationView): void {
		const item: PublicationView = this.publicationsToBeLending.find((value: PublicationView) => value.publicationID === publication.publicationID);
		if (!item) {
			this.publicationsToBeLending.push(publication);
			this.saveSelectedPublicationsToLocalStorage();
			this.snackBar.open(
				`${publication.title} ${publication.edition} agregado correctamente`,
				undefined,
				{
					horizontalPosition: 'center',
					verticalPosition: 'top',
					duration: 4000,
					panelClass: ['green-snackbar']
				}
			);
		}
	}

	public removeSelectedPublication(index: number): void {
		this.publicationsToBeLending.splice(index, 1);
		this.saveSelectedPublicationsToLocalStorage();
	}

	public getDeweySubcategories(category: string): void {
		if (!category) {
			this.form.patchValue({
				deweySubcategory: '',
				knowledgeSpecificSubarea: ''
			});
			this.deweySubcategories = [];
			this.getPublications();
			return;
		}
		if (this.getDeweySubcategoriesSubscription) this.getDeweySubcategoriesSubscription.unsubscribe();
		this.getDeweySubcategoriesSubscription = this.api.getDeweySubcategories(+category).subscribe({
			next: (value: DeweySubcategory[]) => {
				this.deweySubcategories = value;
				this.form.patchValue({
					deweySubcategory: '',
					knowledgeSpecificSubarea: ''
				});
				this.getPublications();
			},
			error: (err: HttpErrorResponse) => {
				console.error(err);
				this.form.patchValue({
					deweySubcategory: '',
					knowledgeSpecificSubarea: ''
				});
				this.deweySubcategories = [];
			}
		});
	}

	public getKnowledgeSubareas(area: string): void {
		if (!area) {
			this.form.patchValue({
				knowledgeSubarea: '',
				knowledgeSpecificSubarea: ''
			});
			this.knowledgeSpecificSubareas = [];
			this.getPublications();
			return;
		}
		if (this.getKnowledgeSubareasSubscription) this.getKnowledgeSubareasSubscription.unsubscribe();
		this.getKnowledgeSubareasSubscription = this.api.getKnowledgeSubareas(+area).subscribe({
			next: (value: KnowledgeSubarea[]) => {
				this.knowledgeSubareas = value;
				this.form.patchValue({
					knowledgeSubarea: '',
					knowledgeSpecificSubarea: ''
				});
				this.knowledgeSpecificSubareas = [];
				this.getPublications();
			},
			error: (err: HttpErrorResponse) => {
				console.error(err);
				this.form.patchValue({
					knowledgeSubarea: '',
					knowledgeSpecificSubarea: ''
				});
				this.knowledgeSubareas = this.knowledgeSpecificSubareas = [];
			}
		});
	}

	public getKnowledgeSpecificSubareas(subarea: string): void {
		if (!subarea) {
			this.form.controls.knowledgeSpecificSubarea.patchValue('');
			this.knowledgeSpecificSubareas = [];
			this.getPublications();
			return;
		}
		if (this.getKnowledgeSpecificSubareasSubscription) this.getKnowledgeSpecificSubareasSubscription.unsubscribe();
		this.getKnowledgeSpecificSubareasSubscription = this.api.getKnowledgeSpecificSubareas(+subarea).subscribe({
			next: (value: KnowledgeSpecificSubarea[]) => {
				this.knowledgeSpecificSubareas = value;
				this.form.controls.knowledgeSpecificSubarea.patchValue('');
				this.getPublications();
			},
			error: (err: HttpErrorResponse) => {
				console.error(err);
				this.form.controls.knowledgeSpecificSubarea.patchValue('');
				this.knowledgeSpecificSubareas = [];
			}
		});
	}

	public requestSelectedPublications(): void {
		if (this.publicationsToBeLending.length) {
			const config: MatDialogConfig = new MatDialogConfig();
			config.id = 'requestPublicationDialog';
			config.autoFocus = false;
			config.minWidth = '90vw';
			config.maxWidth = '90vw';
			config.panelClass = 'transparent-panel';
			config.data = {
				publications: this.publicationsToBeLending
			};
			config.disableClose = true;
			const dialog = this.dialog.open(RequestPublicationComponent, config);
			dialog.afterClosed()
				.pipe(untilComponentDestroyed(this))
				.subscribe((res) => {
					if (res) {
						this.snackBar.dismiss();
						this.snackBar.open(
							`Solicitud realizada correctamente`,
							undefined,
							{
								horizontalPosition: 'center',
								verticalPosition: 'top',
								duration: 4000,
								panelClass: ['green-snackbar']
							}
						);
						this.publicationsToBeLending = [];
						this.saveSelectedPublicationsToLocalStorage();
					}
				});
		}
	}

	public downloadFile(publication: PublicationView): void {
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

	protected readonly ROL = ROL;

	public trackByPeriod(index: number, period: Period): number {
		return period.periodID;
	}

	public trackByPublicationStatus(index: number, publicationStatus: PublicationStatus): number {
		return publicationStatus.requestStatusID;
	}

	// public trackByModality(index: number, modality: SPGetModality): number {
	// 	return modality.modalityID;
	// }
	//
	// public trackBySchool(index: number, school: MajorSchool): number {
	// 	return school.schoolID;
	// }

	public downloadReport(
		type: 'income' | 'request' | 'borrow',
		filterBy: 'career' | 'modality' | 'school' | 'period' | 'report',
		entity: number, period: number, publicationStatus?: number): void {
		if	(!entity){
			this.openFile(`api/library-reports/report-publication-loan-by-academic-period?periodID=${period}`);
			return;
			}
		this.api.downloadLibraryDocument(type, filterBy, entity, period, publicationStatus).subscribe((res: HttpResponse<Blob>) => {
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
	public getCareers(){
		this.admin.getCareersTables().subscribe({
			next: (res) => {
				this.careers = res.data.filter(career => career.statusID === 1);
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	public deletePublication(publication: PublicationView): void {
		const config: MatDialogConfig = new MatDialogConfig();
		config.id = 'deletePublicationConfirmation';
		config.autoFocus = false;
		config.minWidth = '200px';
		config.maxWidth = '600px';
		config.panelClass = 'transparent-panel';
		config.data = {
			message: '¿Estás seguro de eliminar esta publicación? Esta acción no se puede deshacer.'
		};

		const dialog = this.dialog.open(ConfirmationComponent, config);

		dialog.afterClosed()
			.pipe(untilComponentDestroyed(this))
			.subscribe((res) => {
				if (res) {
					const updatedData = this.dataSource.data.filter(item => item !== publication);

					this.api.deletePublication(publication.publicationID).subscribe({
						next: () => {
							this.snackBar.open(
								`Publicación eliminada correctamente`,
								undefined,
								{
									horizontalPosition: 'center',
									verticalPosition: 'top',
									duration: 4000,
									panelClass: ['green-snackbar']
								}
							);
							this.dataSource.data = updatedData;
						},
						error: ({error}) => {
							console.error('Error eliminando la publicación:', error.message);
							this.snackBar.open(
								`${error.message}`,
								undefined,
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
			});
	}

	public onTabChange(event: MatTabChangeEvent): void {
		switch (event.index){
			case 0:
					this.getPublications()
				break
			case 1:
				// this.visibleBorrowedComponent = true;
				if(this.isAllowedRole()){
					this.borrowedPublicationComponent.getBorrowedPublications();
				}else{
					this.RequestedPublicationComponent.getRequestedPublications();
				}
                            
				break
		}
	}

	isAllowedRole(): boolean {
		return this.rolesAllowed.includes(this.rolIDSession);
	}

}
