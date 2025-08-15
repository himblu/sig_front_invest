import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { School, SPGetCareer } from '@utils/interfaces/campus.interfaces';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { NgForOf, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { InputSearchComponent } from '@components/input-shearch/input-search.component';
import { ButtonArrowComponent } from '@components/button-arrow/button-arrow.component';
import { InputOnlyLettersComponent } from '@components/input-only-letters/input-only-letters.component';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TwoInputModalComponent } from '@components/two-input-modal/two-input-modal.component';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-schools',
  templateUrl: './schools.component.html',
  styleUrls: ['./schools.component.scss'],
  imports: [
    NgForOf,
    NgIf,
    MatButtonModule,
		MatDialogModule,
    MatSelectModule,
		MatPaginatorModule,
    MatFormFieldModule,
    InputSearchComponent,
    ButtonArrowComponent,
    InputOnlyLettersComponent,
    ReactiveFormsModule,
    MatInputModule,
    NgxMaskDirective,
    MatIconModule,
    RouterLink,
    MatTooltipModule
  ],
  providers: [
    provideNgxMask()
  ],
  standalone: true
})

export class SchoolsComponent {

	@ViewChild('paginator', { static: true }) public paginator!: MatPaginator;
	public pageEvent!: PageEvent;
	public pageSizeOptions: number[] = [5, 10, 25, 50, 100];
  cargando: boolean = false;
  schools: School[] = [];
  testPattern = {
    S: { pattern: new RegExp('[A-Za-z0-9áéíóúÁÉÍÓÚüÜñÑ]') },
  };
  careerList:       SPGetCareer[] = [];
  countSchool:      number = 0;
  actualSchool:     number = 1;
  totalPageSchool:  number = 1;
  countCareer:      number = 0;
  actualCareer:     number = 1;
  totalPageCareer:  number = 1;
  searchC :         string = '';
  searchS :         string = '';
  limit:            number = 5;

	@ViewChild('modalClose', { read: ElementRef }) public modalClose: ElementRef;

  constructor( private fb: FormBuilder,
                private common: CommonService,
                private admin: AdministrativeService,
								private dialog: MatDialog ){}

  ngOnInit(): void {
    this.loadSchool();
    this.loadCareer();
  }

  schoolFrom= this.fb.group({
    schoolID:           [0],
    schoolName:         ['', [Validators.required, Validators.pattern('[-_a-zA-Z0-9-ñÑÁáéÉíÍóÓúÚ ]*')]],
    schoolDesc:         [''],
    schoolPeriodStart:  [''],
    schoolPeriodEnd:    [''],
    state:              [''],
		user:							  [sessionStorage.getItem('name')]

  });

  carrerForm = this.fb.group({
    careerID:           [0],
    schoolName:         [''],
    schoolID:           [0, [Validators.required, Validators.min(1)]],
    careerName:         ['', [Validators.required, Validators.pattern('[-_a-zA-Z0-9-ñÑÁáéÉíÍóÓúÚ ]*')]],
    careerDesc:         ['', [Validators.required]],
    careerAcronym:      ['', [Validators.required, Validators.maxLength(10)]],
    careerPeriodStart:  [''],
    careerPeriodEnd:    [''],
  })

  changePageCareer( page: number){
    this.actualCareer = page;
    this.searchCareer(this.searchC);
  }

  changePageSchool( page: number){
    this.actualSchool = page;
    this.searchSchool(this.searchS);
  }

  loadSchool(){
    this.cargando = true;
    this.admin.getSchool()
      .subscribe( school => {
				//console.log(school);
        this.schools = school.data;
        this.countSchool= school.count;
				if(this.countSchool<=10){
					this.totalPageSchool=1
				}else{
					this.totalPageSchool = Math.ceil(this.countSchool / 10);
				}
        this.cargando= false;
      })
  }

  loadCareer(){
    this.cargando= true;
    this.admin.getCareers()
      .subscribe( career => {
        this.countCareer = career.count;
        this.careerList = career.data;
				if(this.countCareer<=10){
					this.totalPageCareer=1
				}else{
					this.totalPageCareer = Math.ceil(this.countCareer / 10);
				}
        this.cargando = false;
      })
  }

  acronymCarrer( acronym: string){
    setTimeout(() => {
      this.carrerForm.get('careerAcronym')?.setValue(acronym);
    }, 0);
  }

  nameCarrer( name: string){
    setTimeout(() => {
    this.carrerForm.get('careerName')?.setValue(name);
    }, 0);
  }

  schoolName(nameSchool: string) {
    this.schoolFrom.get('schoolName')?.setValue(nameSchool);
  }

  searchCareer(search: string){
    this.searchC=search
    this.admin.getCareers(this.actualCareer,this.searchC)
      .subscribe( career => {
        this.countCareer = career.count;
        this.careerList = career.data;
        if(this.countCareer<=10){
					this.totalPageCareer=1
				}else{
					this.totalPageCareer = Math.ceil(this.countCareer / 10);
				}
      })
  }

  searchSchool(search: string){
    this.searchS=search
    this.admin.getSchool(this.actualSchool, this.searchS)
      .subscribe( school => {
        this.schools = school.data;
        this.countSchool= school.count;
        if(this.countSchool<=10){
					this.totalPageSchool=1
				}else{
					this.totalPageSchool = Math.ceil(this.countSchool / 10);
				}
      })
  }
  onSubmit(){
    if(this.schoolFrom.valid){
      const school: School = this.schoolFrom.value as School;
      this.admin.postSchool(school)
        .subscribe( (resp: any) => {
					this.modalClose.nativeElement.click();
          this.common.message(`${resp.message}`,'','success','#86bc57');
          this.schoolFrom.reset();
          this.loadSchool();
        })
    }else{
      this.common.message('Información Incompleta','Revise que ningun campo este en color rojo', 'error', '#f5637e');
    }
  }

	updateSchool(item:any){
		const config: MatDialogConfig = new MatDialogConfig();
    config.id = item.schoolID;
    config.autoFocus = false;
    config.minWidth = '200px';
    config.maxWidth = '600px';
    config.panelClass = 'transparent-panel';
    config.data = {
      message: 'Actualización',
			label1:  'Nombre',
			label2:  'Descripción',
			in1:     item.schoolName,
			in2:		 item.schoolDesc,
			id:	     item.schoolID
    }
		const dialog = this.dialog.open(TwoInputModalComponent, config).afterClosed()
		.subscribe(response => {
			if(response==undefined||response.value==undefined){

			}else{
				const school: School = this.schoolFrom.value as School;
				school.schoolID=response.value.id;
				school.schoolName=response.value.in1;
				school.schoolDesc=response.value.in2;
				school.user=sessionStorage.getItem('name');
      	this.admin.putSchool(school)
					.subscribe( (resp: any) => {
						this.common.message(`${resp.message}`,'','success','#86bc57');
						this.schoolFrom.reset();
						this.loadSchool();
					})
			}
		});
	}

	statusSchool(item:School, id:number){
		let body={
			"schoolID": item.schoolID,
    	"statusID": id,
    	"user" : sessionStorage.getItem('name')
		}

		this.admin.schoolStatus(body).subscribe( (resp: any ) => {
			this.common.message(`${resp.message}`, '', 'success', '#86bc57');
			this.loadSchool()
		})
	}

  subCarrerFrom(){
    if(this.carrerForm.valid){
      const carrer: SPGetCareer = this.carrerForm.value as SPGetCareer;
      this.admin.postCarrer(carrer)
        .subscribe( (resp: any) => {
          this.common.message(`${resp.message}`,'','success','#86bc57');
          this.carrerForm.reset();
          this.loadCareer();
        });
    }else{
      this.common.message('Información Incompleta','Revise que ningún campo este en color rojo', 'error', '#f5637e');
    }
  }

	public statusSchools(item: School, id: number): void{
		let body={
    	"statusID": id,
    	"user" : sessionStorage.getItem('name'),
			"schoolID": item.schoolID
		}
		this.cargando = true;
		this.admin.putStatusSchool(body).subscribe({
			next: (res: any) => {
				this.common.message(`${res.message}`,'','success','#86bc57');
				this.cargando = false;
				this.loadSchool();
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.cargando = false;
			}
		});
	}

}
