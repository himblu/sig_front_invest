import { Component, ViewChild, ElementRef, OnInit, OnDestroy, inject, SecurityContext } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, FormControl, } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CreateOrUpdateExternalComponent } from '../../components/create-or-update-external/create-or-update-external.component';
import { debounceTime, distinctUntilChanged, forkJoin, map, Observable } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { ExternalUser } from '@utils/interfaces/others.interfaces';
import { UserService } from '@services/user.service';

@Component({
  selector: 'component-external-admin',
  standalone: true,
  imports: [
		ReactiveFormsModule,
		NgFor,
		NgIf,
		MatButtonModule,
		MatFormFieldModule,
		MatTooltipModule,
		MatIconModule,
		MatDialogModule,
		MatPaginatorModule,
		MatSnackBarModule,
		MatInputModule
	],
  templateUrl: './external-admin.component.html',
  styleUrls: ['./external-admin.component.css']
})

export class ExternalAdminComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public isLoading: boolean = false;
	public filtersForm!: FormGroup;
	public pageIndex: number = 1;
  public pageSize: number = 10;
	public length: number = 0;
	public pageEvent!: PageEvent;
  public pageSizeOptions: number[] = [5, 10, 25, 50, 100];
	public externalsList: ExternalUser[] = [];

	private dialog: MatDialog = inject(MatDialog);
	private snackBar: MatSnackBar = inject(MatSnackBar);

	constructor(private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private user: UserService ){
		super();
		this.initForm();
	}

	ngOnInit(): void {
		this.getAdministrativeExternal();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	public initForm(): void {
		this.filtersForm = this.fb.group({
			search: '',
		});
		const searchInput: FormControl = this.filtersForm.get('search') as FormControl;
		if (searchInput) {
			searchInput.valueChanges.pipe(
				debounceTime(300),
				distinctUntilChanged(),
				untilComponentDestroyed(this)
			).subscribe({
				next: () => {
					this.getAdministrativeExternal();
				}
			});
		}
	}

	public getAdministrativeExternal(): void {
		this.isLoading= true;
		this.admin.getAdministrativeExternal(this.pageIndex, this.pageSize, this.filtersForm.get('search').value).subscribe({
			next: (res) => {
				//console.log('getAdministrativeExternal', res);
				this.externalsList= res.data;
				this.length = res.count;
				this.isLoading= false;
			},
			error: (err: HttpErrorResponse) => {
				this.isLoading= false;
			}
		})
	}

	public changePage(event: PageEvent): PageEvent {
		this.pageIndex = event.pageIndex+1;
    this.pageSize = event.pageSize;
		this.getAdministrativeExternal();
    return event;
	}

	public openDialog(item?: ExternalUser): void {
		const config: MatDialogConfig = new MatDialogConfig();
		config.id = 'CreateOrUpdateExternalComponent';
		config.autoFocus = false;
		config.minWidth = '50vw';
		config.maxWidth = '50vw';
		config.panelClass = 'transparent-panel';
		config.data = { item };
		config.disableClose = true;
		const dialog = this.dialog.open(CreateOrUpdateExternalComponent, config);
		dialog.afterClosed()
		.pipe(untilComponentDestroyed(this))
		.subscribe((res) => {
			this.getAdministrativeExternal();
		});
	}

	public changeUserState(item: ExternalUser, statusID: number): void {
		this.isLoading= true;
		let body= {
			"userId": item.userId,
			"statusID": statusID,
			"user": this.user.currentUser.userName
		}
		this.common.putUserState(body).subscribe({
			next: (res: any) => {
				//console.log(res)
				this.common.message(`${res.message}`, '', 'success', '#86bc57');
				this.getAdministrativeExternal();
				this.isLoading=false;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.isLoading=false;
			}
		});
	}

	public restorePassword(item: ExternalUser): void {
		this.isLoading= true;
		let body= {
			"p_userId": item.userId,
			"p_userPassword": item.PersonDocumentNumber,
			"p_recoveryEmail": item.recoveryEmail,
			"p_userCreated": this.user.currentUser.userName
		}
		this.common.putChangePassword(item.userId, body).subscribe({
			next: (res: any) => {
				//console.log(res)
				this.common.message(`${res.message}`, '', 'success', '#86bc57');
				this.getAdministrativeExternal();
				this.isLoading=false;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.isLoading=false;
			}
		});
	}

}
