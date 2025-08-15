import { Component, ViewChild, ElementRef, OnInit, OnDestroy, SecurityContext, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { NgClass, NgForOf, NgIf, NgStyle } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule, MatOptionSelectionChange } from '@angular/material/core';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { CreateBlackListUserComponent } from '../components/create-black-list-user/create-black-list-user.component';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { UnacemBlackList } from '@utils/interfaces/others.interfaces';
import { UserService } from '@services/user.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-black-list',
  standalone: true,
  imports: [
		NgIf,
		NgForOf,
		ReactiveFormsModule,
		MatInputModule,
		MatButtonModule,
		MatFormFieldModule,
		MatSelectModule,
		MatTooltipModule,
		MatIconModule,
		MatNativeDateModule,
		MatPaginatorModule,
		FormsModule,
		MatDialogModule,
		NgClass,
		NgStyle,
		MatSnackBarModule
	],
  templateUrl: './black-list.component.html',
  styleUrls: ['./black-list.component.css']
})

export class BlackListComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public isLoading: boolean= false;
	public filtersForm!: FormGroup;
	public pageIndex: number = 1;
  public pageSize: number = 10;
  public length: number = 0;
  public pageEvent!: PageEvent;
  public pageSizeOptions: number[] = [5, 10, 25, 50, 100];
	public blackList: UnacemBlackList[] = [];

	private dialog: MatDialog = inject(MatDialog);
	private snackBar: MatSnackBar = inject(MatSnackBar);

	constructor(
		private fb: FormBuilder,
		private admin: AdministrativeService,
		private user: UserService
	){
		super();
		this.initFiltersForm();
	}

	public ngOnInit(): void {
		this.getUnacemBlackList();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	private initFiltersForm(): void{
		this.filtersForm = this.fb.group({
			filter: '',
		});
		const searchInput: FormControl = this.filtersForm.get('filter') as FormControl;
		if (searchInput) {
			searchInput.valueChanges.pipe(
				debounceTime(300),
				distinctUntilChanged(),
				untilComponentDestroyed(this)
			).subscribe({
				next: (value ) => {
					this.getUnacemBlackList(false);
				}
			});
		};
	}

	public getUnacemBlackList(loading: boolean= true): void {
		this.isLoading= loading;
		this.admin.getUnacemBlackList(this.pageIndex, this.pageSize, this.filtersForm.get('filter').value).subscribe({
			next: (res) => {
				//console.log('list', res.data);
				this.blackList= res.data;
				this.length= res.count;
				this.isLoading= false;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.isLoading= false;
			}
		});
	}

	public getPaginator(event: PageEvent): PageEvent {
    this.pageIndex = event.pageIndex+1;
    this.pageSize = event.pageSize;
		this.getUnacemBlackList(false);
    return event;
  }

	public openDialog(item?: UnacemBlackList): void {
		const config: MatDialogConfig = new MatDialogConfig();
		config.id = 'CreateBlackListUserComponent';
		config.autoFocus = true;
		config.minWidth = '55vw';
		config.maxWidth = '55vw';
		config.panelClass = 'transparent-panel';
		config.data = { item };
		config.disableClose = false;
		const dialog = this.dialog.open(CreateBlackListUserComponent, config);
		dialog.afterClosed()
		.pipe(untilComponentDestroyed(this))
		.subscribe((res) => {
			if(res) this.getUnacemBlackList();
		});
	}

	public updatePersonStatus(item: UnacemBlackList): void {
		this.isLoading= true;
		if(!item.statusID) item.statusID= 1;
		else item.statusID= 0;
		let body= {
			blackListID: item.blackListID,
			statusID: item.statusID,
			user: this.user.currentUser.userName
		};
		this.admin.putUnacemBlackListStatus(body).subscribe({
			next: (res: any) => {
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
				this.isLoading= false;
				this.getUnacemBlackList();
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.isLoading= false;
			}
		});
	}

}
