import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatOptionModule, MatRippleModule } from "@angular/material/core";
import { MatPaginator, MatPaginatorModule, PageEvent } from "@angular/material/paginator";
import { MatSelectModule } from "@angular/material/select";
import { MatSort, MatSortModule, Sort } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatTooltipModule } from "@angular/material/tooltip";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { SpinnerLoaderComponent } from "@components/spinner-loader/spinner-loader.component";
import { PaginatedResource } from '@utils/interfaces/person.interfaces';
import { debounceTime, distinctUntilChanged, map, Subscription, take } from 'rxjs';
import { ApiService } from '@services/api.service';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { Editorial, EditorialListForm } from '@utils/interfaces/library.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { Country } from '@utils/interfaces/others.interfaces';
import { ConfirmationComponent } from '../../../academic-management/components/confirmation/confirmation.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
	CreateOrUpdateEditorialComponent
} from '../../components/create-or-update-editorial/create-or-update-editorial.component';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

const DISPLAYED_COLUMNS: string[] = ['editorialDesc', 'cityCountryDesc', 'yearPublication', 'publications', 'actions'];

@Component({
	selector: 'app-list-editorial',
	standalone: true,
	imports: [
		CommonModule,
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
		MatTooltipModule,
		ReactiveFormsModule,
		SpinnerLoaderComponent,
		MatDialogModule,
		MatSnackBarModule,
		NgxMaskDirective
	],
	templateUrl: './list-editorial.component.html',
	providers: [
		provideNgxMask()
	],
	styleUrls: ['./list-editorial.component.css']
})

export class ListEditorialComponent extends OnDestroyMixin implements OnInit, OnDestroy {
	public countries: Array<Country> = [];
	public filtersForm!: FormGroup;
	public isLoadingEditorialList: boolean = false;
	public editorials: Array<Editorial> = [];
	public dataSource!: MatTableDataSource<Editorial>;
	public pageIndex: number = 0;
	public pageSize: number = 10;
	public filters: string = '';
	public length: number = 0;
	public pageEvent!: PageEvent;
	public displayedColumns: string[] = DISPLAYED_COLUMNS;
	public pageSizeOptions: number[] = [10, 25, 50, 100];
	@ViewChild(MatSort, {static: true}) public sort!: MatSort;
	@ViewChild('paginator', {static: true}) public paginator!: MatPaginator;

	private getEditorialsSubscription!: Subscription;
	private formBuilder: FormBuilder = inject(FormBuilder);
	private api: ApiService = inject(ApiService);
	private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private sanitizer: DomSanitizer = inject(DomSanitizer);
	private dialog: MatDialog = inject(MatDialog);
	private snackBar: MatSnackBar = inject(MatSnackBar);

	constructor() {
		super();
	}

	public ngOnInit(): void {
		this.initForm();
		this.getDataFromResolver();
		// this.getEditorials();
	}

	public override ngOnDestroy() {
		super.ngOnDestroy();
		if (this.getEditorialsSubscription) {
			this.getEditorialsSubscription.unsubscribe();
		}
	}

	public trackByCountryId(index: number, item: Country): number {
		return item.countryID;
	}

	private getDataFromResolver(): void {
		this.activatedRoute.data
			.pipe(
				untilComponentDestroyed(this),
				map((value: any) => value['resolver']))
			.subscribe({
				next: (value: { editorials: PaginatedResource<Editorial>, countries: Country[] }): void => {
					this.editorials = value.editorials.items;
					this.length = value.editorials.totalItems;
					this.dataSource = new MatTableDataSource<Editorial>(this.editorials);
					this.countries = value.countries;
				},
			});
	}

	private initForm(): void {
		this.filtersForm = this.formBuilder.group<EditorialListForm>({
			search: this.formBuilder.control(null),
			country: this.formBuilder.control(null),
		});
		const searchInput: FormControl = this.filtersForm.get('search') as FormControl;
		if (searchInput) {
			searchInput.valueChanges.pipe(
				debounceTime(300),
				distinctUntilChanged(),
				untilComponentDestroyed(this)
			).subscribe({
				next: () => {
					this.getEditorials();
				}
			});
		}
	}

	private buildEncodedFilters(): void {
		this.filters = '{';
		const search = this.filtersForm.value.search;
		if (search) {
			this.filters = this.filters.concat(`editorialDesc:or:like:${search};`);
			this.filters = this.filters.concat(`cityCountryDesc:or:like:${search};`);
		}
		this.filters = this.filters === '{' ? '' : this.filters.slice(0, -1).concat('}');
		this.filters = encodeURIComponent(this.filters);
	}

	public getEditorials(event?: Sort): void {
		this.isLoadingEditorialList = true;
		if (this.getEditorialsSubscription) {
			this.getEditorialsSubscription.unsubscribe();
		}
		this.buildEncodedFilters();
		this.getEditorialsSubscription = this.api.getEditorials(
			this.pageIndex,
			this.pageSize,
			this.filters,
			event?.active || 'editorialDesc',
			event?.direction || 'desc'
		).subscribe({
			next: (value: PaginatedResource<Editorial>) => {
				this.editorials = value.items;
				this.length = value.totalItems;
				this.dataSource = new MatTableDataSource<Editorial>(this.editorials);
				this.isLoadingEditorialList = false;
			},
			error: (err: HttpErrorResponse) => {
				this.isLoadingEditorialList = false;
			}
		});
	}

	public getEditorialsPaginator(event: PageEvent): PageEvent {
		this.pageIndex = event.pageIndex;
		this.pageSize = event.pageSize;
		this.getEditorials();
		return event;
	}

	public createOrUpdateEditorial(editorial?: Editorial): void {
		const config: MatDialogConfig = new MatDialogConfig();
		this.dialog.closeAll();
		config.id = 'editEditorialDialog';
		config.autoFocus = false;
		config.minWidth = '70vw';
		config.width = '70vw';
		config.minWidth = '200px';
		config.maxWidth = '600px';
		config.panelClass = 'transparent-panel';
		config.data = { editorial };
		const dialog = this.dialog.open(CreateOrUpdateEditorialComponent, config);
		dialog.afterClosed()
			.pipe(take(1))
			.subscribe((res) => {
				if (res) {
					this.snackBar.dismiss();
					this.snackBar.open(
						`Editorial ${editorial ? 'actualizada' : 'creada'} correctamente`,
						null,
						{
							horizontalPosition: 'center',
							verticalPosition: 'top',
							duration: 4000,
							panelClass: ['green-snackbar']
						}
					);
				}
			});
	}

	public deleteEditorial(editorial: Editorial): void {
		// if (editorial.publications !== 0) {
		// 	this.snackBar.dismiss();
		// 	this.snackBar.open(
		// 		`Esta editorial tiene publicaciones asignadas. Elimina sus publicaciones asignadas e intenta de nuevo.`,
		// 		null,
		// 		{
		// 			duration: 5000,
		// 			verticalPosition: 'bottom',
		// 			horizontalPosition: 'center',
		// 			panelClass: ['warning-snackbar']
		// 		}
		// 	);
		// 	return;
		// }
		const config: MatDialogConfig = new MatDialogConfig();
		config.id = 'deleteEditorialDialog';
		config.autoFocus = false;
		config.minWidth = '200px';
		config.maxWidth = '600px';
		config.panelClass = 'transparent-panel';
		config.data = {
			message: '¿Estás seguro de eliminar esta editorial?'
		};
		const dialog = this.dialog.open(ConfirmationComponent, config);
		dialog.afterClosed()
			.pipe(take(1))
			.subscribe((res) => {
				if (res) {
					this.api.deleteEditorial(editorial.editorialID).pipe(take(1)).subscribe({
						next: (value: any) => {
							this.snackBar.dismiss();
							this.snackBar.open(
								`Editorial eliminada correctamente`,
								null,
								{
									horizontalPosition: 'center',
									verticalPosition: 'top',
									duration: 4000,
									panelClass: ['green-snackbar']
								}
							);
						},
						error: (err: HttpErrorResponse) => {

						}
					});
				}
			});
	}
}
