import { Component, ViewChild, ElementRef, OnInit, OnDestroy, inject, SecurityContext } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { NgFor, NgForOf, NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CreateOrUpdateSpaceComponent } from '../../components/create-or-update-space/create-or-update-space.component';
import { LibrarySpace } from '@utils/interfaces/period.interfaces';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { ReportsComponent } from '../../components/reports/reports.component';

@Component({
  selector: 'app-list-spaces',
  standalone: true,
  templateUrl: './list-spaces.component.html',
  styleUrls: ['./list-spaces.component.css'],
	imports: [
		ReactiveFormsModule,
		NgFor,
		NgIf,
		MatInputModule,
		MatButtonModule,
		MatFormFieldModule,
		MatSelectModule,
		MatTooltipModule,
		MatIconModule,
		MatDialogModule,
		MatPaginatorModule,
		MatSnackBarModule,
		MatTabsModule,
		ReportsComponent
	]
})

export class ListSpacesComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public isLoading: boolean = false;
	public filtersForm!: FormGroup;
	public pageIndex: number = 1;
  public pageSize: number = 10;
	public length: number = 0;
	public pageEvent!: PageEvent;
  public pageSizeOptions: number[] = [5, 10, 25, 50, 100];
	public librarySpaces: LibrarySpace[] = [];

	private dialog: MatDialog = inject(MatDialog);
	private snackBar: MatSnackBar = inject(MatSnackBar);

	constructor(private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService ){
		super();
		this.initForm();
	}

	ngOnInit(): void {
		this.getLibrarySpace();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	public initForm(): void {
		this.filtersForm = this.fb.group({
			search: '',
			status: [1, Validators.required]
		});
	}

	public changePage(event: PageEvent): PageEvent {
		this.pageIndex = event.pageIndex+1;
    this.pageSize = event.pageSize;
		this.getLibrarySpace();
    return event;
	}

	public getLibrarySpace(state: boolean= true): void {
		this.isLoading= state;
		this.api.getLibrarySpace(this.filtersForm.get('search').value, this.pageIndex, this.pageSize).subscribe({
			next: (res) => {
				//console.log('LibrarySpace', res);
				this.librarySpaces= res.data;
				this.length = res.count;
				this.isLoading= false;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.isLoading= false;
			}
		});
	}

	public putLibrarySpaceState(item: LibrarySpace, statusID: number): void {
		this.isLoading= true;
		let body= {
			librarySpaceID: item.librarySpaceID,
			statusID: statusID
		}
		this.api.putLibrarySpaceState(body).subscribe({
			next: (res: any) => {
				this.getLibrarySpace();
				this.isLoading= false;
				this.snackBar.open(
          `${res.message}`,
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
				//console.log('err',err);
				this.isLoading= false;
			}
		});
	}

	public openDialog(item?: LibrarySpace): void {
		const config: MatDialogConfig = new MatDialogConfig();
		config.id = 'ReplyProcedureComponent';
		config.autoFocus = false;
		config.minWidth = '50vw';
		config.maxWidth = '50vw';
		config.panelClass = 'transparent-panel';
		config.data = { item };
		config.disableClose = false;
		const dialog = this.dialog.open(CreateOrUpdateSpaceComponent, config);
		dialog.afterClosed()
		.pipe(untilComponentDestroyed(this))
		.subscribe((res) => {
			if (res) {
				this.getLibrarySpace();
			}
		});
	}

}
