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

@Component({
  selector: 'app-classrooms',
  templateUrl: './classrooms.component.html',
  styleUrls: ['./classrooms.component.css'],
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
export class ClassroomsComponent implements OnInit {

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

	@ViewChild('aulaModalClose', { read: ElementRef }) public aulaModalClose: ElementRef;
	@ViewChild('tipoModalClose', { read: ElementRef }) public tipoModalClose: ElementRef;

	constructor( private fb: FormBuilder,
		private common: CommonService,
		private admin: AdministrativeService ){}

	ngOnInit(): void {
		this.loadingClassroom();
		this.loadingClassroomType();
	}

	classroomTypeFrom =  this.fb.group({
    classroomTypeID:    [0],
    classroomTypeName:  ['', [Validators.required]],
    classroomTypeDesc:  [''],
    state:              [''],
  });

  classroomFrom = this.fb.group({
    classroomID:        [0],
    classroomTypeID:    [0,[Validators.required, Validators.min(1)]],
    classroomTypeName:  [''],
    buildingID:         [0,[Validators.required, Validators.min(1)]],
    buildingName:       [''],
    classroomName:      ['',[Validators.required]],
    classroomDesc:      ['',[Validators.required]],
    seating:            [0,[Validators.required, Validators.min(1)]],
    chairs:             [0,[Validators.required, Validators.min(1)]],
    capacity:           [0,[Validators.required, Validators.min(1)]],
    capacityMax:        [0,[Validators.required, Validators.min(1)]],
    capacityMin:        [0,[Validators.required, Validators.min(1)]],
    state:              [0],
  });

	changePageClassroomType(page: number ){
    this.actualClassroomType = page;
    this.searchClassroomType('');
  }

  changePageClassroom(page: number ){
    this.actualClassroom = page;
    this.searchClassroom('');
  }

  searchClassroomType( filter: string ){
    this.admin.getClassroomType(this.actualClassroomType, filter)
      .subscribe( classroom => {
        this.classroomTypeList = classroom.data;
        this.countClassroomType = classroom.count;
        this.totalPageClassroomType = Math.ceil(this.countClassroomType / 3);
      });
  }

  searchClassroom( filter: string ){
    this.admin.getClassroom(this.actualClassroom, filter, 10)
      .subscribe( classroom => {
        //console.log(classroom);

        this.classroomList = classroom.data;
        this.countClassroom = classroom.count;
        this.totalPageClassroom = Math.ceil(this.countClassroom / 10);
      });
  }

	loadingClassroomType(){
    this.cargando = true;
    this.admin.getClassroomType(1,'',0)
      .subscribe( classroomType => {
        this.classroomTypeSelect = classroomType.data;
      })
    this.admin.getClassroomType()
      .subscribe( classroom => {
        this.classroomTypeList = classroom.data;
        this.countClassroomType = classroom.count;
        this.totalPageClassroomType = Math.ceil(this.countClassroomType / 3);
        this.cargando = false;
      });
  }

  loadingClassroom(){
    this.cargando = true;
    this.admin.getClassroom(1,'', 10)
      .subscribe( classroom => {
        this.classroomList = classroom.data;
				console.log(classroom.data)
        this.countClassroom = classroom.count;
        this.totalPageClassroom = Math.ceil(this.countClassroom / 10);
        this.cargando = false;
      });
  }

	classroomNameType( name: string ){
    this.classroomTypeFrom.get('classroomTypeName')?.setValue(name);
  }
  classroomName( name: string ){
    this.classroomFrom.get('classroomName')?.setValue(name);
  }

	onSubmitClassroom(){
    if(this.classroomFrom.valid){
      const classroom: SPGetClassroom = this.classroomFrom.value as SPGetClassroom;
      this.admin.postClassroom(classroom)
        .subscribe( (resp: any) => {
					this.aulaModalClose.nativeElement.click();
          this.common.message(`${resp.message}`, '', 'success', '#86bc57');
          this.classroomFrom.reset();
          this.loadingClassroom();
        })
    }else{
      this.common.message('Información Incompleta','Revise que ningún campo este en color rojo', 'error', '#f5637e');
    }
  }

  onSubmitClassroomType(){
    if(this.classroomTypeFrom.valid){
      const classroomType: SPGetClassroomType = this.classroomTypeFrom.value as SPGetClassroomType;
      this.admin.postClassroomType(classroomType)
        .subscribe( (resp: any) => {
          this.common.message( `${resp.message}`, '', 'success', '#86bc57');
          this.classroomTypeFrom.reset();
					this.tipoModalClose.nativeElement.click();
          this.loadingClassroomType();
        })
    }else{
      this.common.message('Información Incompleta','Revise que ningún campo este en color rojo', 'error', '#f5637e')
    }
  }
}
