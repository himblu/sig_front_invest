import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { NgForOf, NgIf, NgClass } from '@angular/common';
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
import { COMPANY_CODES, User, confMenu, confModules } from '@utils/interfaces/others.interfaces';
import { UserService } from '@services/user.service';
import { MatOptionSelectionChange } from '@angular/material/core';

@Component({
  selector: 'component-modules',
  templateUrl: './modules.component.html',
  styleUrls: ['./modules.component.scss'],
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
		NgClass
  ],
})
export class ModulesComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	charging: boolean = false;
  modules: confModules[] = [];
	parents: confMenu[] = [];
	childs: confMenu[] = [];
	public companies = COMPANY_CODES;
	public moduleForm!: FormGroup;
	public menuForm!: FormGroup;
	public usersForm!: FormGroup;
	public users: User[] = [];
	showMenu: number=0;
	showSubmenu: number=0;
	title:string= '';
	flagOnSubmit: number;
	isParentClicked!: number;
	isChildClicked!: number;

	@ViewChild('modalClose', { read: ElementRef }) public modalClose: ElementRef;
	@ViewChild('modalMenuClose', { read: ElementRef }) public modalMenuClose: ElementRef;
	@ViewChild('userModalClose', { read: ElementRef }) public userModalClose: ElementRef;

  constructor( private fb: FormBuilder,
                private common: CommonService,
                private admin: AdministrativeService,
								private user: UserService ){
		super();
	}

  public ngOnInit(): void {
		this.initForms();
		this.iniUsersForm();
		this.loadModules();
  }

	public override ngOnDestroy() {
    super.ngOnDestroy();
  }

	private initForms(){
		this.moduleForm= this.fb.group({
			moduleName:         ['', [Validators.required]],
			moduleDesc:         ['', [Validators.required]],
			moduleAppID:        ['', [Validators.required]],
			user:               [this.user.currentUser.userName],
		});

		this.menuForm= this.fb.group({
			menuName:         ['', [Validators.required]],
			menuIcon:         [null, [Validators.required]],
			menuUrl:          [null, [Validators.required]],
			menuOrder:        [1, [Validators.required]],
			menuModuleID:     ['', [Validators.required]],
			menuParentID:     [null],
			menuExternalLink: [null],
			user:             [this.user.currentUser.userName],
		});

	}

	public iniUsersForm(): void {
		this.usersForm= this.fb.group({
			userID:         ['', [Validators.required]],
			menuID:         ['', [Validators.required]],
			rolID:         	['', [Validators.required]],
			search:         [''],
			PersonFullName: ['', [Validators.required]],
			PersonDocumentNumber: ['', [Validators.required]],
			user:           [this.user.currentUser.userName],
		});
	}

	public saveModule(): void{
		if(this.moduleForm.valid){
			this.charging= true;
			this.admin.postModule(this.moduleForm.value).subscribe({
				next: (res: any) => {
					this.modalClose.nativeElement.click();
					this.common.message(`${res.message}`,'','success','#86bc57');
					this.moduleForm.reset();
					this.charging= false;
				},
				error: (err: HttpErrorResponse) => {
					console.log('err',err);
					this.charging = false;
				}
			});
		}
	}

	public onSubmitUsers(): void{
		if(this.usersForm.valid){
			this.charging= true;
			this.admin.postUserMenu(this.usersForm.value).subscribe({
				next: (res: any) => {
					this.userModalClose.nativeElement.click();
					this.common.message(`${res[0].message}`,'','success','#86bc57');
					this.initForms();
					this.users= [];
					this.charging= false;
				},
				error: (err: HttpErrorResponse) => {
					//console.log('err',err);
					this.charging = false;
				}
			});
		}
	}

	public saveMenu(): void{
		if(this.menuForm.valid){
			this.charging= true;
			this.admin.postMenu(this.menuForm.value).subscribe({
				next: (res: any) => {
					this.modalMenuClose.nativeElement.click();
					this.common.message(`${res.message}`,'','success','#86bc57');
					this.menuForm.reset();
					this.charging= false;
				},
				error: (err: HttpErrorResponse) => {
					console.log('err',err);
					this.charging = false;
				}
			});
		}
	}

	private loadModules(): void{
		this.charging= true;
		this.admin.getModule().subscribe({
      next: (res) => {
				//console.log(res)
				this.modules=res;
				this.charging= false;
      },
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
				this.charging = false;
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
				console.log('err',err);
				this.showSubmenu=0;
				this.showMenu=0;
			}
    });
	}

	public loadChildMenu(menu:confMenu, i?: number): void{
		this.isChildClicked = i;
		this.admin.getChildMenu(menu.menuID).subscribe({
      next: (res) => {
				//console.log(res)
				this.childs=res;
				this.showSubmenu=1;
      },
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
				this.showSubmenu=0;
			}
    });
	}

	public searchUsers(): void{
		this.admin.getUsers(this.usersForm.get('search').value).subscribe({
      next: (res) => {
				this.users = res;
      },
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
    });
	}

	public patchUser(user: User, event: MatOptionSelectionChange): void {
		if(event.isUserInput){
			this.usersForm.get('userID').patchValue(user.userId);
			this.usersForm.get('PersonFullName').patchValue(user.PersonFullName);
			this.usersForm.get('PersonDocumentNumber').patchValue(user.PersonDocumentNumber);
			this.usersForm.get('rolID').patchValue(user.rolID);
		}
	}

	public openModal(auxForSubmit:number, item?:any): void{
		if(auxForSubmit==0){
			this.title='Nuevo menú'
			this.menuForm.reset();
			this.menuForm.get('menuModuleID').patchValue(item.moduleID)
			this.menuForm.get('menuOrder').patchValue(1);
			this.menuForm.get('menuUrl').setValidators(null);
			this.menuForm.get('menuUrl').setErrors(null);
			this.flagOnSubmit=0;
		}else if(auxForSubmit==1){
			this.title='Nuevo submenú'
			this.menuForm.reset();
			this.menuForm.get('menuModuleID').patchValue(item.menuModuleID);
			this.menuForm.get('menuParentID').patchValue(item.menuID);
			this.menuForm.get('menuIcon').setValidators(null);
			this.menuForm.get('menuIcon').setErrors(null);
			this.flagOnSubmit=1;
		}
	}

}
