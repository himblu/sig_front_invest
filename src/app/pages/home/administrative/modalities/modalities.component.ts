import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SPGetModality } from '@utils/interfaces/campus.interfaces';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { NgForOf, NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { InputSearchComponent } from '@components/input-shearch/input-search.component';
import { ButtonArrowComponent } from '@components/button-arrow/button-arrow.component';
import { InputOnlyLettersComponent } from '@components/input-only-letters/input-only-letters.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-modalities',
  templateUrl: './modalities.component.html',
  styles: [],
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
        InputOnlyLettersComponent,
				MatTooltipModule
    ],
  standalone: true
})

export class ModalitiesComponent {

  cargando: boolean = false;
  modalitiesList: SPGetModality [] = [];
  actualModalities: number = 1;
  totalPageModalities: number = 0;
  countModalities: number = 0;
	pageLimit:number=10;
  search: string = '';
	title: string='';
	flagOnSubmit: number=0;

	@ViewChild('modalClose', { read: ElementRef }) public modalClose: ElementRef;

  constructor( private fb: FormBuilder,
              private common:CommonService,
              private admin: AdministrativeService ){}

  ngOnInit(): void {
    this.modalityLoad();
  }

  modalityForm = this.fb.group({
    modalityID:     [0],
    modalityName:   ['', [Validators.required]],
    modalityDesc:   [''],
    state:          [''],
		statusID:       [1],
		user:						sessionStorage.getItem('name')
  });

  private modalityLoad():void{
    this.cargando = true;
    this.admin.getModalities()
      .subscribe( modality => {
        this.modalitiesList = modality.data;
        this.countModalities = modality.count;
        this.totalPageModalities = Math.ceil(this.countModalities / this.pageLimit);
        this.cargando=false;
      })
  }

  public changePageModalities( page: number):void{
    this.actualModalities = page;
    this.searchModalities(this.search);
  }

  public searchModalities(filter: string):void{
    this.search = filter;
    this.admin.getModalities(this.actualModalities, this.search)
      .subscribe( modality => {
        this.modalitiesList = modality.data;
        this.countModalities = modality.count;
        this.totalPageModalities = Math.ceil(this.countModalities / this.pageLimit);
      })
  }

  public onSubmitModality():void{
		this.cargando = true;
    if(this.modalityForm.valid){
      const modality: SPGetModality = this.modalityForm.value as SPGetModality;
			if(this.flagOnSubmit==0){
				this.admin.postModality(modality)
        .subscribe( (resp: any) => {
          //console.log(resp);
					this.modalClose.nativeElement.click();
          this.common.message(`${resp.message}`,'','success','#86bc57');
          this.modalityForm.reset();
          this.modalityLoad();
					this.cargando = false;
        })
			}else if(this.flagOnSubmit==1){
				this.admin.putModality(modality)
        .subscribe( (resp: any) => {
          //console.log(resp);
					this.modalClose.nativeElement.click();
          this.common.message(`${resp.message}`,'','success','#86bc57');
          this.modalityForm.reset();
          this.modalityLoad();
					this.cargando = false;
        })
			}
    }else{
			this.cargando = false;
		}
  }

	public openModal(auxForSubmit:number, item?:SPGetModality):void{
		if(auxForSubmit==0){
			this.title='Agregar modalidad'
			this.modalityForm.reset();
			this.flagOnSubmit=0;
		}else if(auxForSubmit==1){
			//console.log(item)
			this.title='Actualizar modalidad'
			this.modalityForm.patchValue(item)
			this.modalityForm.get('modalityID').patchValue(item.modalityID)
			this.flagOnSubmit=1;
		}
	}

	public statusModalities(item:SPGetModality, id:number):void{
		let body={
			"modalityID": item.modalityID,
    	"statusID": id,
    	"user" : sessionStorage.getItem('name')
		}
		this.cargando = true;
		this.admin.putStatusModality(body)
        .subscribe( (resp) => {
          //console.log(resp);
          this.common.message(`${resp.message}`,'','success','#86bc57');
          this.modalityForm.reset();
          this.modalityLoad();
					this.cargando = false;
        })
	}

}
