import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, } from '@angular/forms';
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
import { Period } from '@utils/interfaces/period.interfaces';
import { CurrentPeriod } from '@utils/interfaces/others.interfaces';

@Component({
  selector: 'app-evaluations',
  templateUrl: './evaluations.component.html',
  styleUrls: ['./evaluations.component.css'],
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
		MatTabsModule
],
})
export class EvaluationsComponent implements OnInit {

	public filtersForm!: FormGroup;
	public evaluationsForm!: FormGroup;
	public confForm!: FormGroup;
	periods: Period[];
	periodID:number;
	cargando: boolean = false;
  evaluationsList: any [] = [''];
	confList: any [] = [''];
  actualEvaluations: number = 1;
  totalPageEvaluations: number = 0;
  countEvaluations: number = 0;
	pageLimit:number = 10;
	actualConf: number = 1;
  totalPageConf: number = 0;
  countConf: number = 0;
  search: string = '';
	title: string = '';
	flagOnSubmit: number = 0;

	@ViewChild('modalClose', { read: ElementRef }) public modalClose: ElementRef;

	constructor( private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService ){}

	ngOnInit(): void {
		this.initForm();
		this.getCurrentPeriod();
		this.getPeriods();
	}

	public initForm():void{
    this.filtersForm = this.fb.group({
      periodID: [''],
			search: ['']
    });

		this.evaluationsForm = this.fb.group({
      standard: ['', [Validators.required]],
			question: ['', [Validators.required]],
    });

		this.confForm= this.fb.group({
      type: ['', [Validators.required]],
			alternatives: ['', [Validators.required]],
			standard: ['', [Validators.required]],
			attached: ['', [Validators.required]],
			evaluator1: ['', [Validators.required]],
			evaluator2: ['', [Validators.required]],
			questions: ['', [Validators.required]],
    });
  }

	private getPeriods(): void {
		this.cargando = true;
    this.api.getItcaPeriods().subscribe({
      next: (res: any) => {
        this.periods = res.data;
				this.cargando = false;
      },
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
				this.cargando = false;
			}
    });
  }

	private getCurrentPeriod(): void {
		this.cargando = true;
    this.api.getCurrentPeriod().subscribe({
      next: (res: CurrentPeriod) => {
        this.periodID = res.periodID;
				this.filtersForm.get('periodID').patchValue(this.periodID);
				this.cargando = false;
      },
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
				this.cargando = false;
			}
    });
  }

	public statusEvaluations(item:any, id:number):void{

	}

	public statusConf(item:any, id:number):void{

	}

	public getEvaluations(list:any){

	}

	public onSubmitEvaluations():void{

	}

	public onSubmitConf():void{
		if(this.confForm.get('alternatives').value == 1){
			this.confForm.get('evaluator1').patchValue('');
			this.confForm.get('evaluator1').clearValidators();
			this.confForm.get('evaluator1').updateValueAndValidity();
			this.confForm.get('evaluator2').patchValue('');
			this.confForm.get('evaluator2').clearValidators();
			this.confForm.get('evaluator2').updateValueAndValidity();
		}else{
			this.confForm.get('evaluator1').setValidators([Validators.required]);
			this.confForm.get('evaluator1').updateValueAndValidity();
			this.confForm.get('evaluator2').setValidators([Validators.required]);
			this.confForm.get('evaluator2').updateValueAndValidity();
		}

		if(this.confForm.valid){
			console.log(this.confForm.value)
		}else{

		}

	}

	public openModal(auxForSubmit:number, item?:any):void{
		if(auxForSubmit==0){
			this.title='Nueva pregunta';
			this.initForm();
			this.flagOnSubmit=0;
		}else if(auxForSubmit==1){
			this.title='Actualizar pregunta';
			this.flagOnSubmit=1;
		}
	}

	public changePageEvaluations(page:number):void{

	}

	public changePageConf(page:number):void{

	}

}
