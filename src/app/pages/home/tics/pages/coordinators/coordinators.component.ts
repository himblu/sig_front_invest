import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, FormArray} from '@angular/forms';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { NgForOf, NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Period } from '@utils/interfaces/period.interfaces';
import { CoordinatorList, CurrentPeriod, Tables } from '@utils/interfaces/others.interfaces';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '@services/user.service';
import { SPGetCareer } from '@utils/interfaces/campus.interfaces';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { map } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-coordinators',
  templateUrl: './coordinators.component.html',
  styleUrls: ['./coordinators.component.css'],
	standalone: true,
	imports: [
		NgIf,
		NgForOf,
		ReactiveFormsModule,
		MatInputModule,
		MatButtonModule,
		MatFormFieldModule,
		MatSelectModule,
		MatTooltipModule,
		MatIconModule,
		MatPaginatorModule
	],
})
export class CoordinatorsComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public filtersForm!: FormGroup;
	public coordinatorsForm!: FormGroup;
	public periods: Period[];
	public currentPeriod: CurrentPeriod;
	public charging: boolean = false;
  public coordinatorsList: CoordinatorList [];
	public careers: SPGetCareer[] = [];
  public pageIndex: number = 1;
  public pageSize: number = 10;
  public length: number = 0;
	public pageEvent!: PageEvent;
  public pageSizeOptions: number[] = [5, 10, 25, 50, 100];
  public search: string = '';
	public title: string = '';
	public flagOnSubmit: number = 0;

	@ViewChild('paginator', { static: true }) public paginator!: MatPaginator;
	@ViewChild('modalClose', { read: ElementRef }) public modalClose: ElementRef;

	constructor( private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private user: UserService,
		private activatedRoute: ActivatedRoute, ){
		super();
		this.initForm();
	}

	ngOnInit(): void {
		this.getDataFromResolver();
		this.getCoordinators();
	}

	public initForm(periodID?: number):void{
    this.filtersForm = this.fb.group({
      periodID: [''],
			search: ['']
    });

		this.coordinatorsForm = this.fb.group({
      search: [''],
			periodID: [periodID || ''],
			careerID: ['', [Validators.required]],
			personID: ['', [Validators.required]],
			coordinator: ['', [Validators.required]],
			document: ['', [Validators.required]],
			user: this.user.currentUser.userName
    });
  }

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	private getDataFromResolver(): void {
    this.activatedRoute.data.pipe(untilComponentDestroyed(this),
    map((value: any) => value['resolver'])).subscribe({
			next: (value: { periods: Period[], currentPeriod: CurrentPeriod, careers: Tables<SPGetCareer> }) => {
				this.periods= value.periods,
				this.currentPeriod= value.currentPeriod,
				this.careers= value.careers.data;
			},
    });
  }

	public getCoordinators(){
    this.api.getCoordinatorList(this.filtersForm.get('search').value, this.pageIndex, this.pageSize).subscribe({
      next: (res) => {
				//console.log(res.data)
        this.coordinatorsList= res.data;
				this.length = res.count;
      },
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
			}
    });
	}

	public statusCoordinator(item:CoordinatorList, id:number){
		let body={
			"careerID": item.careerID,
    	"statusID": id,
			"personID": item.personID,
    	"user" : this.user.currentUser.userName
		}
		this.charging = true;
		this.admin.putStatusCoordinator(body)
		.subscribe({
			next: (res) => {
				//console.log(resp);
				this.common.message(`${res.message}`,'','success','#86bc57');
				this.getCoordinators();
				this.charging = false;
			},
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
				this.charging = false;
			}
		})
	}

	public searchCoordinators(){
		this.api.getCoordinatorBySearch(this.coordinatorsForm.get('search').value).subscribe({
      next: (res) => {
				if(res[0]){
					this.coordinatorsForm.get('personID').patchValue(res[0].personID);
					this.coordinatorsForm.get('coordinator').patchValue(res[0].Coordinador);
					this.coordinatorsForm.get('document').patchValue(res[0].NroDocumento);
				}else{
					this.coordinatorsForm.get('personID').patchValue('');
					this.coordinatorsForm.get('coordinator').patchValue('');
					this.coordinatorsForm.get('document').patchValue('');
				}
      },
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.coordinatorsForm.get('personID').patchValue('');
				this.coordinatorsForm.get('coordinator').patchValue('');
				this.coordinatorsForm.get('document').patchValue('');
			}
    });
	}

	public onSubmitCoordinators():void{
		let arr=[];
		if(this.coordinatorsForm.valid){
			let career = <FormArray>this.coordinatorsForm.controls['careerID']
			for(let i=0; i<career.value.length; i++){
				let obj={
					careerID: career.value[i],
					personID: this.coordinatorsForm.get('personID').value,
					periodID: this.coordinatorsForm.get('periodID').value,
					user: this.coordinatorsForm.get('user').value
				};
				arr.push(obj);
			}
			this.charging=true;
			this.api.postCoordinator({"data": arr}).subscribe({
				next: (res:any) => {
					this.initForm(this.currentPeriod.periodID);
					let resp=res[0]
					this.modalClose.nativeElement.click();
					this.common.message(`${resp[0].message}`,'','success','#86bc57');
					this.charging=false;
				},
				error: (err: HttpErrorResponse) => {
					console.log('err',err);
					this.charging=false;
				}
			});
		}
	}

	public openModal(auxForSubmit:number, item?:any):void{
		if(auxForSubmit==0){
			this.title='Asignar carrera';
			this.initForm(this.currentPeriod.periodID);
			this.flagOnSubmit=0;
		}else if(auxForSubmit==1){
			this.title='Actualizar carrera';
			this.flagOnSubmit=1;
		}
	}

	public changePageCoordinators(event: PageEvent): PageEvent {
		this.pageIndex = event.pageIndex+1;
    this.pageSize = event.pageSize;
		this.getCoordinators();
    return event;
	}

}
