import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, FormArray } from '@angular/forms';
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
import { Partial, Period, SubComponentType } from '@utils/interfaces/period.interfaces';
import { CurrentPeriod } from '@utils/interfaces/others.interfaces';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { filterPartialsPipe } from './pipes/filter-partials.pipe';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-grades',
  templateUrl: './grades.component.html',
  styleUrls: ['./grades.component.css'],
	standalone: true,
	imports: [
		NgIf,
		NgForOf,
		ReactiveFormsModule,
		MatInputModule,
		MatButtonModule,
		MatFormFieldModule,
		MatSelectModule,
		//InputSearchComponent,
		//ButtonArrowComponent,
		MatTooltipModule,
		MatIconModule,
		filterPartialsPipe,
		MatPaginatorModule
],
})
export class GradesComponent implements OnInit {

	public filtersForm!: FormGroup;
	public gradesForm!: FormGroup;
	periods:Period[];
	cargando: boolean = false;
  gradesList: Partial [] = [];
	activitiesList: SubComponentType [] = [];
	partialsList: Partial[];
  public pageIndex: number = 1;
  public pageSize: number = 10;
  public length: number = 0;
	public pageEvent!: PageEvent;
  public pageSizeOptions: number[] = [5, 10, 25, 50, 100];
  search: string = '';
	title: string = '';
	aux:number;
	total: number = 0;

	@ViewChild('modalClose', { read: ElementRef }) public modalClose: ElementRef;

	constructor( private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService ){}

	ngOnInit(): void {
		this.initForm();
		this.initFiltersForm();
		this.getCurrentPeriod();
		this.getPeriods();
		this.getActivities();
	}

	public initFiltersForm(): void {
		this.filtersForm = this.fb.group({
      periodID: [''],
			percentage: ['', Validators.required],
    });
	}

	public initForm():void{

		this.gradesForm = this.fb.group({
			count: [0, [Validators.required]],
			componentID: ['', [Validators.required]],
			subComponents: this.fb.array([
				this.fb.group({
					periodID: ['', [Validators.required]],
					componentID: ['', [Validators.required]],
					subComponentTypeID: ['', [Validators.required]],
					percentage: ['', [Validators.required]],
					user: [sessionStorage.getItem('name')],
				}),
				this.fb.group({
					periodID: ['', [Validators.required]],
					componentID: ['', [Validators.required]],
					subComponentTypeID: ['', [Validators.required]],
					percentage: ['', [Validators.required]],
					user: [sessionStorage.getItem('name')],
				}),
				this.fb.group({
					periodID: ['', [Validators.required]],
					componentID: ['', [Validators.required]],
					subComponentTypeID: ['', [Validators.required]],
					percentage: ['', [Validators.required]],
					user: [sessionStorage.getItem('name')],
				}),
				this.fb.group({
					periodID: ['', [Validators.required]],
					componentID: ['', [Validators.required]],
					subComponentTypeID: ['', [Validators.required]],
					percentage: ['', [Validators.required]],
					user: [sessionStorage.getItem('name')],
				}),
				this.fb.group({
					periodID: ['', [Validators.required]],
					componentID: ['', [Validators.required]],
					subComponentTypeID: ['', [Validators.required]],
					percentage: ['', [Validators.required]],
					user: [sessionStorage.getItem('name')],
				}),
			]),
    });
  }

	private getActivities(): void {
		this.cargando = true;
    this.api.getActivities().subscribe({
      next: (res) => {
				console.log(res);
        this.activitiesList = res;
				this.cargando = false;
      },
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
				this.cargando = false;
			}
    });
  }

	private getPartials(): void {
		this.cargando = true;
    this.api.getPartialsByPeriod(this.filtersForm.get('periodID').value).subscribe({
      next: (res) => {
        this.partialsList = res;
				this.cargando = false;
      },
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
				this.cargando = false;
			}
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
				this.filtersForm.get('periodID').patchValue(res.periodID);
				this.cargando = false;
				this.getGrades();
				this.getPartials();
      },
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
				this.cargando = false;
			}
    });
  }

	public getGrades(){
    this.api.getGrades(this.filtersForm.get('periodID').value, this.pageSize, this.pageIndex).subscribe({
      next: (res) => {
				//console.log(res);
        this.gradesList = res.data;
				this.length = res.count;
      },
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
			}
    });
	}

	public getSubComponentsRow(): FormArray {
    return (this.gradesForm.controls['subComponents'] as FormArray);
	}

	public onSubmitGrades(): void {
		let body= [];
		for(let i = 0; i < this.getSubComponentsRow().length; i++){
			this.getSubComponentsArray('subComponentTypeID', i).patchValue(this.activitiesList[i].subComponentTypeID);
			this.getSubComponentsArray('periodID', i).patchValue(this.filtersForm.get('periodID').value);
			this.getSubComponentsArray('componentID', i).patchValue(this.gradesForm.get('componentID').value);
			body.push(this.getSubComponentsRow().controls[i].value);
		}
		if(this.gradesForm.get('componentID').value === 1002){
			body= [];
			body.push(this.getSubComponentsRow().controls[0].value);
			for(let i = 0; i < this.getSubComponentsRow().length; i++){
				this.getSubComponentsArray('percentage', i).clearValidators();
				this.getSubComponentsArray('percentage', i).updateValueAndValidity();
			}
		}
		console.log(body);
		if(this.gradesForm.valid){
			//this.gradesForm.removeControl('count');
			//this.gradesForm.removeControl('componentID');
			this.api.postGrades({'subComponents': body}).subscribe({
				next: (res: any) => {
					let resp = res[0];
					this.common.message(`${resp[0].message}`,'','success','#86bc57');
					this.cargando=false;
					this.initForm();
					this.modalClose.nativeElement.click();
					this.getGrades();
				},
				error: (err: HttpErrorResponse) => {
					console.log('err',err);
					this.cargando=false;
				}
			});
		}else {
			this.gradesForm.markAllAsTouched();
		}
	}

	public openModal(aux: number, item?: SubComponentType):void{
		if(aux==0){
			this.title='Nueva calificación';
			this.initForm();
		}
	}

	public changePageGrades(event: PageEvent): PageEvent {
		this.pageIndex = event.pageIndex+1;
    this.pageSize = event.pageSize;
		this.getGrades();
    return event;
	}

	private getSubComponentsArray(value: any, i:number){
		let subComponentsArray=<FormArray>this.gradesForm.controls['subComponents'];
		let subComponents = subComponentsArray.controls[i];
		return subComponents.get(value);
	}

	public calculate(value1: number=this.getSubComponentsArray('percentage',0).value, value2: number=this.getSubComponentsArray('percentage',1).value,
	value3:number=this.getSubComponentsArray('percentage',2).value, value4:number=this.getSubComponentsArray('percentage',3).value,
	value5:number=this.getSubComponentsArray('percentage',4).value): void{
		this.total = value1+value2+value3+value4+value5;
		this.gradesForm.get('count').markAsTouched();
		this.gradesForm.get('count').patchValue(this.total)
	}

	public updateInTable(item: any): void{
		this.aux = item.subComponentID;
		this.filtersForm.get('percentage').patchValue(item.percentage);
	}

	public updatePartial(item: any):void {
		item["user"]=sessionStorage.getItem('name');
		item["percentage"]=this.filtersForm.get('percentage').value;
		this.cargando=true;
			this.api.putGrades(item).subscribe({
				next: (res:any) => {
					this.common.message(`${res.message}`,'','success','#86bc57');
					this.cargando=false;
					this.filtersForm.get('percentage').patchValue('');
					this.aux=0;
					this.getGrades();
				},
				error: (err: HttpErrorResponse) => {
					console.log('err',err);
					this.cargando=false;
				}
			});
	}

}
