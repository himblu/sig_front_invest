import { Component, Inject, inject, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { confMenu, confModules, User, UserMenu } from '@utils/interfaces/others.interfaces';
import { AdministrativeService } from '@services/administrative.service';
import { UserService } from '@services/user.service';
import { CommonService } from '@services/common.service';

@Component({
  selector: 'app-user-permissions',
  standalone: true,
  imports: [
		ReactiveFormsModule,
		MatButtonModule,
		MatDialogModule,
		MatIconModule,
		MatRippleModule,
		MatInputModule,
		MatSelectModule,
		MatSnackBarModule,
		MatCheckboxModule,
		SpinnerLoaderComponent,
		NgIf,
		NgFor,
		NgClass
	],
  templateUrl: './user-permissions.component.html',
  styleUrls: ['./user-permissions.component.css']
})

export class UserPermissionsComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public isLoading: boolean = false;
	public showMenu: number= 0;
	public showSubmenu: number= 0;
	public isParentClicked!: number;
	public isChildClicked!: number;
	public modules: confModules[] = [];
	public parents: confMenu[] = [];
	public childs: confMenu[] = [];
	private childArray: UserMenu[] = [];

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: { item: User },
		private dialogRef: MatDialogRef<UserPermissionsComponent>,
		private fb: FormBuilder,
		private user: UserService,
		private admin: AdministrativeService,
		private common: CommonService,
	) {
		super();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	ngOnInit(): void {
		this.getModules();
	}

	public getModules(): void {
		this.isLoading= true;
		this.admin.getModule().subscribe({
			next: (res) => {
				this.modules = res;
				this.isLoading=false;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.isLoading=false;
			}
		});
	}

	public loadParentMenu(module:confModules, i?: number): void{
		this.isParentClicked = i;
		this.isChildClicked = null;
		this.admin.getParentMenu(module.moduleID).subscribe({
			next: (res) => {
				//console.log(res)
				this.parents=res;
				this.showSubmenu=0;
				this.showMenu=1;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.showSubmenu=0;
				this.showMenu=0;
			}
		});
	}

	public loadChildMenu(menu:confMenu, i?: number): void{
		this.isChildClicked = i;
		this.admin.getChildMenu(menu.menuID).subscribe({
			next: (res) => {
				//console.log('submenú',  res)
				this.childs=res;
				this.showSubmenu= 1;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.showSubmenu= 0;
			}
		});
	}

	public getSubmenus(event: MatCheckboxChange, item: confMenu): void {
		//console.log(event.checked, item);
		if(event.checked){
			let obj: UserMenu= {
				"userID" : this.data.item.userId,
				"moduleID" : item.menuModuleID,
				"menuID" : item.menuID,
				"rolID" : this.data.item.rolID
			}
			this.childArray.push(obj);
		}else{

		}
	}

	public postPermissions(): void {
		this.admin.postUserPermissions({'news': this.childArray}).subscribe({
			next: (res) => {
				//console.log(res);
				this.common.message(`Registrado Correctamente`,'','success','#86bc57');
				this.dialogRef.close(res);
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

}
