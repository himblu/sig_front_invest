import { Component, ViewChild, ElementRef, OnInit, OnDestroy, inject, SecurityContext } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { COMPANY_CODES, Groups, Roles, User, UserMenu, confMenu, confModules, usersRoles } from '@utils/interfaces/others.interfaces';
import { UserService } from '@services/user.service';
import { Router } from '@angular/router';
import { SPGetPerson2 } from '@utils/interfaces/person.interfaces';
import { ApiService } from '@services/api.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CreatePersonComponent } from '../create-person/create-person.component';
import { CreateUserComponent } from '../create-user/create-user.component';
import { UserPermissionsComponent } from '../user-permissions/user-permissions.component';

@Component({
  selector: 'component-users',
  standalone: true,
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
	imports: [
    NgForOf,
    NgIf,
    MatButtonModule,
		MatDialogModule,
    MatSelectModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    //NgxMaskDirective,
    MatIconModule,
    //RouterLink,
    MatTooltipModule,
		MatMenuModule,
		MatSnackBarModule,
		MatCheckboxModule,
		//NgClass,
		ModalModule,
		MatPaginatorModule
  ],
})
export class UsersComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public charging: boolean=false;
	public filtersForm!: FormGroup;
	public roles: Roles[] = [];
	public groups: Groups[] = [];
	public users: User[] = [];
	public pageIndex: number = 1;
  public pageSize: number = 10;
	public length: number = 0;
	public pageEvent!: PageEvent;
  public pageSizeOptions: number[] = [5, 10, 25, 50, 100];

	private dialog: MatDialog = inject(MatDialog);
	private snackBar: MatSnackBar = inject(MatSnackBar);
	private sanitizer: DomSanitizer = inject(DomSanitizer);

	constructor( private fb: FormBuilder,
		private common: CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private user: UserService,
		private router: Router ){
		super();
	}

	public ngOnInit(): void {
		this.initForm();
		this.getRoles();
		this.getGroupModule();
	}

	public override ngOnDestroy() {
	super.ngOnDestroy();
	}

	public initForm(): void {
		this.filtersForm = this.fb.group({
      search: [''],
			rolID: ['']
    });
	}

	public getUsers(): void {
		this.admin.getPaginatedUsers(this.filtersForm.get('rolID').value ,this.pageIndex, this.pageSize, this.filtersForm.get('search').value).subscribe({
      next: (res) => {
				//console.log('users', res.data)
				this.users = res.data;
				this.length= res.count;
				this.charging=false;
      },
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.charging=false;
			}
    });
	}

	public changePage(event: PageEvent): PageEvent {
		this.pageIndex = event.pageIndex+1;
    this.pageSize = event.pageSize;
		this.getUsers();
    return event;
	}

	public getRoles():void {
		this.charging= true;
		this.admin.getRoles().subscribe({
      next: (res: Roles[]) => {
				//console.log(res)
				this.roles = res;
				this.charging=false;
      },
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.charging=false;
			}
    });
	}

	public getGroupModule():void {
		this.charging= true;
		this.admin.getAllGroups().subscribe({
      next: (res) => {
				//console.log('groups', res);
				this.groups= res.data;
				this.charging=false;
      },
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.charging=false;
			}
    });
	}

	public editUser(item: User): void {
		this.router.navigateByUrl(`/reportes/actualizar-informacion/${item.personID}`)
	}

	public restorePassword(item: User): void {
		this.charging= true;
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
				this.getUsers();
				this.charging=false;
      },
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.charging=false;
			}
    });
	}

	public changeUserState(item: User, statusID: number): void {
		this.charging= true;
		let body= {
			"userId": item.userId,
			"statusID": statusID,
			"user": this.user.currentUser.userName
		}
		this.common.putUserState(body).subscribe({
      next: (res: any) => {
				//console.log(res)
				this.common.message(`${res.message}`, '', 'success', '#86bc57');
				this.getUsers();
				this.charging=false;
      },
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.charging=false;
			}
    });
	}

	public getPdf(personID: number,rolID:number): void{
		this.admin.getUserProfileReport(personID,rolID).subscribe({
			next: (res) => {
				//console.log(res);
				const blob: Blob = new Blob([res.body], { type: 'application/pdf' });
        const url = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob)));
        if (url) {
          window.open(url, '_blank');
        }
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public openPersonDialog(): void {
		const config: MatDialogConfig = new MatDialogConfig();
		config.id = 'CreatePersonComponent';
		config.autoFocus = false;
		config.minWidth = '40vw';
		config.maxWidth = '40vw';
		config.panelClass = 'transparent-panel';
		config.data = { };
		config.disableClose = false;
		const dialog = this.dialog.open(CreatePersonComponent, config);
		dialog.afterClosed()
		.pipe(untilComponentDestroyed(this))
		.subscribe((res) => {
			this.getUsers();
		});
	}

	public openUserDialog(): void {
		const roles= this.roles;
		const groups= this.groups;
		const config: MatDialogConfig = new MatDialogConfig();
		config.id = 'CreateUserComponent';
		config.autoFocus = false;
		config.minWidth = '55vw';
		config.maxWidth = '55vw';
		config.panelClass = 'transparent-panel';
		config.data = { roles, groups };
		config.disableClose = false;
		const dialog = this.dialog.open(CreateUserComponent, config);
		dialog.afterClosed()
		.pipe(untilComponentDestroyed(this))
		.subscribe((res) => {
			this.getUsers();
		});
	}

	public openPermissionDialog(item: User): void {
		const config: MatDialogConfig = new MatDialogConfig();
		config.id = 'UserPermissionsComponent';
		config.autoFocus = false;
		config.minWidth = '75vw';
		config.maxWidth = '75vw';
		config.panelClass = 'transparent-panel';
		config.data = { item };
		config.disableClose = false;
		const dialog = this.dialog.open(UserPermissionsComponent, config);
		dialog.afterClosed()
		.pipe(untilComponentDestroyed(this))
		.subscribe((res) => {
			this.getUsers();
		});
	}

}
