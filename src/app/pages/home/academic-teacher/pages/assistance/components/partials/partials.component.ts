import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { NgForOf, NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { InputSearchComponent } from '@components/input-shearch/input-search.component';
import { ButtonArrowComponent } from '@components/button-arrow/button-arrow.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'component-partials',
  templateUrl: './partials.component.html',
  styleUrls: ['./partials.component.css'],
	standalone: true,
	imports: [
		NgIf,
		NgForOf,
		ReactiveFormsModule,
		MatInputModule,
		MatButtonModule,
		MatFormFieldModule,
		MatSelectModule,
		InputSearchComponent,
		ButtonArrowComponent,
		MatTooltipModule,
		MatIconModule,
		MatTabsModule,
		MatCheckboxModule
	],
})
export class PartialsComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	cargando: boolean = false;
	public filtersForm!: FormGroup;
	public partialsForm!: FormGroup;
	public unitsForm!: FormGroup;
	partialsList: any [] = [];
  actualPartials: number = 1;
  totalPagePartials: number = 0;
  countPartials: number = 0;
	pagePartialsLimit:number = 10;
	title: string = '';
	flagOnSubmit: number = 0;

	constructor(private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService ){
		super();
	}

	public ngOnInit(): void {
		this.initForm();
  }

  public override ngOnDestroy() {
    super.ngOnDestroy();
  }

	public initForm():void{
    this.filtersForm = this.fb.group({
      partial: ['']
    });

		this.partialsForm = this.fb.group({
      description: ['', [Validators.required]],
			percentage: ['', [Validators.required]]
    });

		this.unitsForm = this.fb.group({
      description: ['', [Validators.required]],
			name: ['', [Validators.required]]
    });
	}

	public openModal(auxForSubmit:number, item?:any):void{
		if(auxForSubmit==0){
			this.title='Nueva actividad';
			this.initForm();
			this.flagOnSubmit=0;
		}else if(auxForSubmit==1){
			this.title='Actualizar actividad';
			this.flagOnSubmit=1;
		}
	}

	public onSubmitPartials():void{

	}

	public onSubmitUnits():void{

	}

	public changePagePartials(page:number):void{

	}

}
