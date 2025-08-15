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
import { COMPANY_CODES, MenuSettings, Menus } from '@utils/interfaces/others.interfaces';
import { ButtonArrowComponent } from '@components/button-arrow/button-arrow.component';
import { UserService } from '@services/user.service';

@Component({
  selector: 'component-menu-settings',
  templateUrl: './menu-settings.component.html',
  styleUrls: ['./menu-settings.component.css'],
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
export class MenuSettingsComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	charging: boolean=false;
	public filtersForm!: FormGroup;
	menuList: MenuSettings[]= [];
	countMenus: number= 0;
  actualMenus: number= 1;
  totalPageMenus: number= 1;
	pageLimit: number= 10;

	constructor( private fb: FormBuilder,
		private common: CommonService,
		private admin: AdministrativeService,
		private user: UserService ){
	super();
	}

	public ngOnInit(): void {
		this.initForm();
		this.getMenus();
	}

	public initForm():void{
    this.filtersForm = this.fb.group({
      search: ''
    });
	}

	public override ngOnDestroy() {
	super.ngOnDestroy();
	}

	public getMenus(): void{
		this.admin.getMenus(this.actualMenus, this.filtersForm.get('search')?.value || '', this.pageLimit).subscribe({
      next: (res) => {
				console.log(res)
				this.menuList=res.data;
				this.countMenus= res.count;
				if(this.countMenus <= this.pageLimit){
					this.totalPageMenus=1
				}else{
					this.totalPageMenus = Math.ceil(this.countMenus / this.pageLimit);
				}
      },
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
			}
    });
	}

	public changePageMenus( page: number):void {
    this.actualMenus = page;
    this.getMenus();
  }

	public loadMenus(item:any){
		return item.menus;
	}

	public changeState(menu:Menus, item:MenuSettings): void{
		console.log(menu, item);
	}

}
