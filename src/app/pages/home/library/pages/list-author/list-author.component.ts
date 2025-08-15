import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
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
import { SpinnerLoaderComponent } from "@components/spinner-loader/spinner-loader.component";
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { Country } from '@utils/interfaces/others.interfaces';
import { Author, AuthorListForm } from '@utils/interfaces/library.interface';
import { debounceTime, distinctUntilChanged, map, Subscription, take } from 'rxjs';
import { ApiService } from '@services/api.service';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PaginatedResource } from '@utils/interfaces/person.interfaces';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmationComponent } from '../../../academic-management/components/confirmation/confirmation.component';
import {
	CreateOrUpdateAuthorComponent
} from '../../components/create-or-update-author/create-or-update-author.component';

const DISPLAYED_COLUMNS: string[] = ['authorName', 'nationality', 'publications', 'actions'];

@Component({
  selector: 'app-list-author',
  standalone: true,
  imports: [
		CommonModule,
		FormsModule,
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
		ReactiveFormsModule,
		SpinnerLoaderComponent,
		MatDialogModule,
		MatSnackBarModule
	],
  templateUrl: './list-author.component.html',
  styleUrls: ['./list-author.component.css']
})

export class ListAuthorComponent extends OnDestroyMixin implements OnInit, OnDestroy {
	public countries: Array<Country> = [];
	public filtersForm!: FormGroup;
	public isLoadingAuthorList: boolean = false;
	public authors: Array<Author> = [];
	public dataSource!: MatTableDataSource<Author>;
	public pageIndex: number = 0;
	public pageSize: number = 10;
	public filters: string = '';
	public length: number = 0;
	public pageEvent!: PageEvent;
	public displayedColumns: string[] = DISPLAYED_COLUMNS;
	public pageSizeOptions: number[] = [10, 25, 50, 100];
	@ViewChild(MatSort, {static: true}) public sort!: MatSort;
	@ViewChild('paginator', {static: true}) public paginator!: MatPaginator;

	private getAuthorsSubscription!: Subscription;
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
	}

	public override ngOnDestroy() {
		super.ngOnDestroy();
		if (this.getAuthorsSubscription) {
			this.getAuthorsSubscription.unsubscribe();
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
				next: (value: { authors: PaginatedResource<Author>, /*countries: Country[]*/ }): void => {
					this.authors = value.authors.items;
					this.length = value.authors.totalItems;
					this.dataSource = new MatTableDataSource<Author>(this.authors);
				},
			});
	}

	private initForm(): void {
		this.filtersForm = this.formBuilder.group<AuthorListForm>({
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
					this.getAuthors();
				}
			});
		}
	}

	private buildEncodedFilters(): void {
		this.filters = '{';
		const search = this.filtersForm.value.search;
		if (search) {
			this.filters = this.filters.concat(`authorName:or:like:${search};`);
			this.filters = this.filters.concat(`nationality:or:like:${search};`);
		}
		this.filters = this.filters === '{' ? '' : this.filters.slice(0, -1).concat('}');
		this.filters = encodeURIComponent(this.filters);
	}

	public getAuthors(event?: Sort): void {
		this.isLoadingAuthorList = true;
		if (this.getAuthorsSubscription) {
			this.getAuthorsSubscription.unsubscribe();
		}
		this.buildEncodedFilters();
		this.getAuthorsSubscription = this.api.getAuthors(
			this.pageIndex,
			this.pageSize,
			this.filters,
			event?.active || 'authorName',
			event?.direction || 'desc'
		).subscribe({
			next: (value: PaginatedResource<Author>) => {
				this.authors = value.items;
				this.length = value.totalItems;
				this.dataSource = new MatTableDataSource<Author>(this.authors);
				this.isLoadingAuthorList = false;
			},
			error: (err: HttpErrorResponse) => {
				this.isLoadingAuthorList = false;
			}
		});
	}

	public getAuthorsPaginator(event: PageEvent): PageEvent {
		this.pageIndex = event.pageIndex;
		this.pageSize = event.pageSize;
		this.getAuthors();
		return event;
	}

	public createOrUpdateAuthor(author?: Author): void {
		const config: MatDialogConfig = new MatDialogConfig();
		this.dialog.closeAll();
		config.id = 'editAuthorDialog';
		config.autoFocus = false;
		config.minWidth = '70vw';
		config.width = '70vw';
		config.minWidth = '200px';
		config.maxWidth = '600px';
		config.panelClass = 'transparent-panel';
		config.data = { author };
		const dialog = this.dialog.open(CreateOrUpdateAuthorComponent, config);
		dialog.afterClosed()
			.pipe(take(1))
			.subscribe((res) => {
				if (res) {
					this.snackBar.dismiss();
					this.snackBar.open(
						`Autor ${author ? 'actualizado' : 'creado'} correctamente`,
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

	public deleteAuthor(author: Author): void {
		if (author.publications !== 0) {
			this.snackBar.dismiss();
			this.snackBar.open(
				`Este autor tiene publicaciones asignadas. Elimina sus publicaciones asignadas o remueve sus referencias e intenta de nuevo.`,
				null,
				{
					duration: 5000,
					verticalPosition: 'bottom',
					horizontalPosition: 'center',
					panelClass: ['warning-snackbar']
				}
			);
			return;
		}
		const config: MatDialogConfig = new MatDialogConfig();
		config.id = 'deleteAuthorDialog';
		config.autoFocus = false;
		config.minWidth = '200px';
		config.maxWidth = '600px';
		config.panelClass = 'transparent-panel';
		config.data = {
			message: '¿Estás seguro de eliminar a este autor?'
		};
		const dialog = this.dialog.open(ConfirmationComponent, config);
		dialog.afterClosed()
			.pipe(take(1))
			.subscribe((res) => {
				if (res) {
					this.api.deleteAuthor(author.authorID).pipe(take(1)).subscribe({
						next: (value: any) => {
							this.snackBar.dismiss();
							this.snackBar.open(
								`Autor eliminado correctamente`,
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

