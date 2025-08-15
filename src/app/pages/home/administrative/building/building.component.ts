import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { School, SPGetBuilding, SPGetClassroom, SPGetClassroomType } from '../../../../utils/interfaces/campus.interfaces';
import { NgForOf, NgIf, UpperCasePipe } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { InputSearchComponent } from '@components/input-shearch/input-search.component';
import { ButtonArrowComponent } from '@components/button-arrow/button-arrow.component';
import { InputOnlyLettersComponent } from '@components/input-only-letters/input-only-letters.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RrhhService } from '@services/rrhh.service';
import { Campus } from '@utils/interfaces/period.interfaces';

@Component({
  selector: 'app-building',
  templateUrl: './building.component.html',
  styles: [],
	imports: [
		UpperCasePipe,
		ReactiveFormsModule,
		MatInputModule,
		MatSelectModule,
		NgForOf,
		NgIf,
		MatButtonModule,
		InputSearchComponent,
		ButtonArrowComponent,
		InputOnlyLettersComponent,
		MatTooltipModule
	],
  standalone: true
})

export class BuildingComponent implements OnInit {

  cargando: boolean = false;
  schools: School[] = [];
  buildingList: SPGetBuilding[] = [];
  countBuilding: number = 0;
  actualBuilding: number = 1;
  totalPageBuilding: number = 1;
  classroomTypeList: SPGetClassroomType[] = [];
  countClassroomType: number = 0;
  actualClassroomType: number = 1;
  totalPageClassroomType: number = 1;
  classroomList: SPGetClassroom[] = [];
  countClassroom: number = 0;
  actualClassroom: number = 1;
  totalPageClassroom: number = 1;
  buildingSelect: SPGetBuilding[] = [];
  classroomTypeSelect: SPGetClassroomType[] = [];
	title: 			string='';
	campuses: Campus[] = [];
	flagOnSubmit:  			number=0;

	@ViewChild('modalClose', { read: ElementRef }) public modalClose: ElementRef;

  constructor( private fb: FormBuilder,
              private common: CommonService,
              private admin: AdministrativeService,
							private rrhh: RrhhService ){}

  ngOnInit(): void {
    this.loadingBuilding();
  }

  buildingForm = this.fb.group({
    buildingID:   [0 ],
    campusID:     [0 , [Validators.required]],
    campusName:   [''],
    buildingName: ['', [Validators.required]],
    buildingDesc: [''],
    floorNro:     [0, [Validators.required, Validators.min(1)]],
    seating:      [0],
    status:       [''],
		user:					[sessionStorage.getItem('name')]
  });

  changePageBuilding(page: number ){
    this.actualBuilding = page;
    this.searchBuilding('');
  }

  loadingBuilding(){
    this.cargando = true;
    this.admin.getBuildings(1, '', 0)
      .subscribe( building => {
        this.buildingSelect = building.data;
      })
    this.admin.getBuildings()
      .subscribe( building => {
        this.buildingList = building.data;
        this.countBuilding = building.count;
        this.totalPageBuilding = Math.ceil(this.countBuilding / 10);
        this.cargando = false;
      });
    this.admin.getSchools()
      .subscribe( schools => {
        this.schools = schools.data;
        this.cargando = false;
      } )
		this.rrhh.getCampus()
		.subscribe( res => {
			this.campuses = res;
			this.cargando = false;
		})
  }

  nameBuilding( name: string ){
    this.buildingForm.get('buildingName')?.setValue(name);
  }

  searchBuilding( filter: string ){
    this.admin.getBuildings(this.actualBuilding, filter)
    .subscribe( building => {
      this.buildingList = building.data;
      this.countBuilding = building.count;
      this.totalPageBuilding = Math.ceil(this.countBuilding / 10);
    });
  }

	openModal(auxForSubmit:number, item?:SPGetBuilding){
		if(auxForSubmit==0){
			this.title='Agregar edificio'
			this.buildingForm.reset();
			this.flagOnSubmit=0;
		}else if(auxForSubmit==1){
			this.title='Actualizar edificio'
			this.buildingForm.patchValue(item)
			this.buildingForm.get('buildingID').patchValue(item.buildingID)
			this.flagOnSubmit=1;
		}
	}

  onSubmitBuilding(){
    if(this.buildingForm.valid){
      //this.buildingForm.get('campusID').setValue(1);
      const building: SPGetBuilding = this.buildingForm.value as SPGetBuilding;
			if(this.flagOnSubmit == 0){
				this.admin.postBuilding(building)
        .subscribe( (resp:any) => {
          this.common.message(`${resp.message}`,'', 'success','#86bc57');
          this.buildingForm.reset();
					this.modalClose.nativeElement.click();
          this.loadingBuilding();
        })
			}else if(this.flagOnSubmit == 1){
				this.admin.putBuilding(building)
        .subscribe( (resp:any) => {
          this.common.message(`${resp.message}`,'', 'success','#86bc57');
          this.buildingForm.reset();
					this.modalClose.nativeElement.click();
          this.loadingBuilding();
        })
			}
    }else{
      this.common.message('Información Incompleta','Revise que ningún campo este en color rojo', 'error', '#f5637e');
    }
  }

}
