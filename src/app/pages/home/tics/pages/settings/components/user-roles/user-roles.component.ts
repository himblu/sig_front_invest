import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { NgForOf, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { COMPANY_CODES, Groups, Roles, confMenu, confModules, usersRoles } from '@utils/interfaces/others.interfaces';
import { ButtonArrowComponent } from '@components/button-arrow/button-arrow.component';
import { UserService } from '@services/user.service';

@Component({
  selector: 'component-user-roles',
  templateUrl: './user-roles.component.html',
  styleUrls: ['./user-roles.component.css'],
	standalone: true,
	imports: [
    NgForOf,
    NgIf,
    MatButtonModule,
		MatDialogModule,
    MatSelectModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    NgxMaskDirective,
    MatIconModule,
    RouterLink,
    MatTooltipModule,
		MatMenuModule,
		ButtonArrowComponent
  ],
})
export class UserRolesComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	charging: boolean=false;
	public filtersForm!: FormGroup;
	public userForm!: FormGroup;
	public rolForm!: FormGroup;
	public groupForm!: FormGroup;
	countUsersRol: number=0;
  actualUsersRol: number=1;
  totalPageUsersRol: number=1;
	pageLimit: number=10;
	usersRolList: usersRoles[]=[];
	rolesList: Roles[]=[]
	groupsList: Groups[]=[];
	index: number;

	constructor( private fb: FormBuilder,
		private common: CommonService,
		private admin: AdministrativeService,
		private user: UserService ){
	super();
	}

	public ngOnInit(): void {
		this.initForm();
		this.getUsersRol();
		this.getRoles();
		this.getGroups();
	}

	public override ngOnDestroy() {
	super.ngOnDestroy();
	}

	public initForm():void{
    this.filtersForm = this.fb.group({
      search: [''],
			forSave: ['']
    });

		this.userForm = this.fb.group({
      p_personId: ['', [Validators.required]],
			p_userName: ['', [Validators.required]],
			p_userPassword: ['', [Validators.required]],
			p_recoveryEmail: ['', [Validators.required]],
			p_userCreated: [this.user.currentUser.userName],
    });

		this.rolForm = this.fb.group({
      p_userID: ['', [Validators.required]],
			p_rolID: ['', [Validators.required]],
			p_user: [this.user.currentUser.userName],
    });

		this.groupForm = this.fb.group({
      userID: ['', [Validators.required]],
			groupID: ['', [Validators.required]],
			user: [this.user.currentUser.userName],
    });

	}

	public getUsersRol(): void{
		this.admin.getUsersRoles(this.actualUsersRol, this.filtersForm.get('search').value, this.pageLimit).subscribe({
      next: (res) => {
				//console.log(res)
				this.usersRolList=res.data;
				this.countUsersRol= res.count;
				if(this.countUsersRol<=this.pageLimit){
					this.totalPageUsersRol=1
				}else{
					this.totalPageUsersRol = Math.ceil(this.countUsersRol / this.pageLimit);
				}
      },
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
			}
    });
	}

	private getRoles(): void{
		this.admin.getRoles().subscribe({
      next: (res) => {
				//console.log(res)
				this.rolesList=res;
      },
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
			}
    });
	}

	private getGroups(): void{
		this.admin.getGroups().subscribe({
      next: (res) => {
				//console.log(res)
				this.groupsList=res.data;
      },
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
			}
    });
	}

	public updateRolesInTable(item:usersRoles, forSave:number, i:number): void{
		this.filtersForm.get('forSave').patchValue(forSave);
		this.rolForm.reset();
		this.groupForm.reset();
		this.index=i;
		this.userForm.get('p_personId').patchValue(item.PersonId);
		this.userForm.get('p_recoveryEmail').patchValue(item.emailDesc);
		this.userForm.get('p_userPassword').patchValue(item.PersonDocumentNumber);
		this.rolForm.get('p_userID').patchValue(item.userId);
		this.groupForm.get('userID').patchValue(item.userId);
		this.rolForm.get('p_user').patchValue(this.user.currentUser.userName);
		this.groupForm.get('user').patchValue(this.user.currentUser.userName);
	}

	public getRolName(name:string):void {
		if(name == 'PROFESOR' || name == 'DOCENTE'){
			this.userForm.get('p_userName').patchValue('D'+this.userForm.get('p_userPassword').value);
		}else{
			this.userForm.get('p_userName').patchValue('A'+this.userForm.get('p_userPassword').value);
		}
	}

	public submit():void {
		this.charging=true;
		if(this.filtersForm.get('forSave').value == 0){
			console.log(this.userForm.value);
		this.admin.postUsersRoles(this.userForm.value).subscribe({
      next: (res:any) => {
				//console.log(res.userID)
				this.rolForm.get('p_userID').patchValue(res.userId);
				this.groupForm.get('userID').patchValue(res.userId);
				this.saveRoles();
				this.saveGroups();
      },
			error: (err) => {
				if(err.error.error == 'Información duplicada'){
					this.saveRoles();
					this.saveGroups();
				}
			}
    });
		}else if(this.filtersForm.get('forSave').value == 1){
			this.saveGroups();
		}
	}

	public saveRoles():void {
		console.log(this.rolForm.value);
		this.admin.postRoles(this.rolForm.value).subscribe({
      next: (res) => {
				//console.log(res)
      },
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
			}
    });
	}

	public saveGroups():void {
		console.log(this.groupForm.value);
		this.admin.postGroups(this.groupForm.value).subscribe({
      next: (res) => {
				//console.log(res)
				this.charging=false;
				this.initForm();
				this.getUsersRol();
				this.index=null;
      },
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
				this.charging=false;
			}
    });
	}

	public changePageUsersRol( page: number): void{
    this.actualUsersRol = page;
    this.getUsersRol();
  }

}
