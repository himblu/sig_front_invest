import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, FormArray } from '@angular/forms';
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
import { Partial, Period } from '@utils/interfaces/period.interfaces';
import { CurrentPeriod } from '@utils/interfaces/others.interfaces';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-partial',
  templateUrl: './partial.component.html',
  styleUrls: ['./partial.component.css'],
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
		MatIconModule
	],
})
export class PartialComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public filtersForm!: FormGroup;
	public partialForm!: FormGroup;
	periods:Period[];
	periodID:number;
	cargando: boolean = false;
  partialList: Partial[];
  actualPartial: number = 1;
  totalPagePartial: number = 0;
  countPartial: number = 0;
	pageLimit:number = 10;
  search: string = '';
	title: string = '';
	aux:number;
	total: number = 0;

	@ViewChild('modalClose', { read: ElementRef }) public modalClose: ElementRef;

	constructor( private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService ){
			super();
		}

		public ngOnInit(): void {
		this.getCurrentPeriod();
		this.getPeriods();
		this.initForm();
	}

	public override ngOnDestroy() {
    super.ngOnDestroy();
  }

	public initForm():void{
    this.filtersForm = this.fb.group({
      periodID: [''],
			percentage: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
    });

		this.partialForm = this.fb.group({
			count: [0, [Validators.required]],
			components:	this.fb.array([
				this.fb.group({
					periodID: ['', [Validators.required]],
					evaluationID: ['', [Validators.required]],
					percentage: ['', [Validators.required]],
					user: [sessionStorage.getItem('name')],
				}),
				this.fb.group({
					periodID: ['', [Validators.required]],
					evaluationID: ['', [Validators.required]],
					percentage: ['', [Validators.required]],
					user: [sessionStorage.getItem('name')],
				}),
				this.fb.group({
					periodID: ['', [Validators.required]],
					evaluationID: ['', [Validators.required]],
					percentage: ['', [Validators.required]],
					user: [sessionStorage.getItem('name')],
				}),
			]),
    });
  }

	public getComponentsRow() {
    return (this.partialForm.controls['components'] as FormArray);
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
				this.getPartials();
      },
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
				this.cargando = false;
			}
    });
  }

	public getPartials(periodID:number=this.periodID){
		this.periodID = periodID;
		this.cargando = true;
    this.api.getPartials(periodID).subscribe({
      next: (res) => {
        this.partialList = res.data;
				this.countPartial = res.count;
				if(this.countPartial<=this.pageLimit){
					this.totalPagePartial=1
				}else{
					this.totalPagePartial = Math.ceil(this.countPartial / this.pageLimit);
				}
				this.cargando = false;
      },
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
				this.cargando = false;
			}
    });
	}

	public getEvaluations(){
    this.api.getEvaluations().subscribe({
      next: (res:any) => {
				//console.log(res);
				let componentsArray=<FormArray>this.partialForm.controls['components'];
				for(let i = 0; i < this.getComponentsRow().length; i++){
					let components = componentsArray.controls[i];
					components.get('evaluationID').patchValue(res[i].evaluationID);
					components.get('periodID').patchValue(this.periodID);
				}
      },
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
			}
    });
	}

	public onSubmitPartial():void{
		if(this.partialForm.valid){
			this.partialForm.removeControl('count');
			this.cargando=true;
			this.api.postPartials(this.partialForm.value).subscribe({
				next: (res:any) => {
					let resp = res[0];
					this.common.message(`${resp[0].message}`,'','success','#86bc57');
					this.cargando=false;
					this.initForm();
					this.modalClose.nativeElement.click();
					this.getPartials();
				},
				error: (err: HttpErrorResponse) => {
					console.log('err',err);
					this.cargando=false;
				}
			});
		}
	}

	public updateInTable(partial:Partial): void{
		this.aux=partial.componentID;
		this.filtersForm.get('percentage').patchValue(partial.percentage);
	}

	public updatePartial(partial:Partial):void {
		this.cargando=true;
		partial.percentage=this.filtersForm.get('percentage').value;
			this.api.putPartials(partial).subscribe({
				next: (res:any) => {
					this.common.message(`${res[0].message}`,'','success','#86bc57');
					this.cargando=false;
					this.filtersForm.get('percentage').patchValue('');
					this.aux=0;
					this.getPartials();
				},
				error: (err: HttpErrorResponse) => {
					console.log('err',err);
					this.cargando=false;
				}
			});
	}

	public openModal(aux:number, item?:any):void{
		this.getEvaluations();
		if(aux==0){
			this.title='Nuevo parcial';
			this.initForm();
		}
	}

	public changePagePartial(page:number):void{
		this.actualPartial = page;
		this.getPartials();
	}

	public calculate(value1:number, value2:number, value3:number):void{
		this.total = value1+value2+value3;
		this.partialForm.get('count').markAsTouched();
		this.partialForm.get('count').patchValue(this.total)
	}

}
