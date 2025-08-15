import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Canton, Parish, Province } from '@utils/interfaces/others.interfaces';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { Campus } from '@utils/interfaces/period.interfaces';
import { NgFor, NgIf, UpperCasePipe } from '@angular/common';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { InputSearchComponent } from '@components/input-shearch/input-search.component';
import { ButtonArrowComponent } from '@components/button-arrow/button-arrow.component';
import { InputOnlyLettersComponent } from '@components/input-only-letters/input-only-letters.component';
import { ComboComponent } from '@components/combo/combo.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-sede',
  templateUrl: './sede.component.html',
  styleUrls: ['./sede.component.css'],
  standalone: true,
    imports: [
        NgIf,
        NgFor,
        MatSelectModule,
        MatButtonModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatInputModule,
        UpperCasePipe,
        InputSearchComponent,
        ButtonArrowComponent,
        InputOnlyLettersComponent,
        ComboComponent,
				MatTooltipModule
    ]
})

export class SedeComponent implements OnInit, OnDestroy{

	public campusForm!: FormGroup;
  cargando: boolean = false;
	public provinces: Province[] = [];
  public cantons: Canton[] = [];
	public parishes : Parish[] = [];
  campusList: Campus[] = [];
  validar: boolean= false;
  count:      number = 0;
  totalPage:      number = 0;
  actual:     number = 1;
  search: string ='';
	isUpdating: boolean= false;

	@ViewChild('modalClose', { read: ElementRef }) public modalClose: ElementRef;

  constructor( private fb: FormBuilder,
                private common: CommonService,
                private admin: AdministrativeService){}

  ngOnInit() {
    this.getCampus();
		this.initForm();
		this.getProvinces();
  }

  ngOnDestroy(): void {
    this.common.setFormStatus(true);
  }

	public initForm(): void {
		this.campusForm = this.fb.group({
			campusID: [0],
			campusName: ['', [Validators.required, Validators.pattern('[-_a-zA-Z0-9-ñÑÁáéÉíÍóÓúÚ ]*')]],
			campusDetail: [''],
			campusAddress: ['', [Validators.required]],
			campusPeriodStart: [''],
			campusPeriodEnd: [''],
			parishID: [0, [Validators.required]],
			parishName: [''],
			cantonID: [0],
			cantonName: [''],
			provinceID: [0],
			provinceName: [''],
			state: [''],
			user: [''],
		});
	}

  changePage( page: number){
    this.actual = page;
    this.searchT(this.search);
  }

  nameCampus( nameCampus: string ) {
    this.campusForm.controls['campusName'].patchValue(nameCampus);

  }

  getCampus(){
    this.cargando=true;
    this.admin.getCampus(this.actual, this.search)
      .subscribe( campus => {
        this.campusList = campus.data;
        this.count = campus.count;

        this.cargando=false;
        this.totalPage = Math.ceil(this.count / 5);
      })
  }

  public getProvinces(countryID: number = 6): void {
		this.common.cargaCombo(countryID).subscribe({
			next: (res: Province[]) => {
				this.provinces = res;
			}
		});
	}

	public getCantons(provinceID: number): void {
		this.common.getCantonByProvince(7, provinceID.toString()).subscribe({
			next: (res: Canton[]) => {
				this.cantons = res;
			}
		});
	}

	public getParish(cantonID: number): void {
		this.common.getParishByCanton(8, cantonID.toString()).subscribe({
			next: (res: Parish[]) => {
				this.parishes = res;
			}
		});
	}

	public updateCampus(item: Campus): void {
		this.isUpdating= true;
		this.getCantons(item.provinceID);
		this.getParish(item.cantonID);
		this.campusForm.patchValue(item);
		//console.log(item);
	}

  saveCampus(){
    this.cargando=true;
    const formStatus = this.campusForm.valid;
    this.common.setFormStatus(formStatus);
    if(formStatus){
			if(!this.isUpdating){
				const campusData = this.campusForm.value as Campus;
				this.admin.postCampus(campusData).subscribe( (campus:any) => {
					this.common.message(`${campus.message}`,'', 'success','#86bc57');
					this.cargando=false;
					this.modalClose.nativeElement.click();
					this.getCampus();
				});
			}else{
				this.admin.putCampus(this.campusForm.value as Campus).subscribe({
					next: (res: any) => {
						this.common.message(`${res.message}`,'','success','#86bc57');
						this.cargando = false;
						this.modalClose.nativeElement.click();
						this.getCampus();
						this.isUpdating= false;
					},
					error: (err: HttpErrorResponse) => {
						//console.log('err',err);
						this.cargando = false;
					}
				});
			}
    }else{
      this.cargando=false;
      this.common.message('Información Incompleta', 'Revise que no existan campos en color rojo', 'error', '#f5637e');
    }
  }

  searchT(search: string){
    this.search=search
    this.admin.getCampus(this.actual, this.search)
      .subscribe( campus => {
        this.campusList = campus.data;
        this.count = campus.count;
        this.cargando=false;
        this.totalPage = Math.ceil(this.count / 5);
      })
  }

	public statusCampus(item: Campus, id: number): void{
		let body={
    	"statusID": id,
    	"user" : sessionStorage.getItem('name'),
			"campusID": item.campusID
		}
		this.cargando = true;
		this.admin.putStatusCampus(body).subscribe({
			next: (res: any) => {
				this.common.message(`${res.message}`,'','success','#86bc57');
				this.cargando = false;
				this.getCampus();
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.cargando = false;
			}
		});
	}

}
