import { Component, ViewChild, ElementRef, OnInit, OnDestroy, inject, SecurityContext } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, FormArray} from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { Course, CourseDetailShort, School, SPGetCareer, StudyPlan } from '@utils/interfaces/campus.interfaces';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { NgForOf, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { InputSearchComponent } from '@components/input-shearch/input-search.component';
import { ButtonArrowComponent } from '@components/button-arrow/button-arrow.component';
import { InputOnlyLettersComponent } from '@components/input-only-letters/input-only-letters.component';
import { MatInputModule } from '@angular/material/input';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { UserService } from '@services/user.service';
import { RrhhService } from '@services/rrhh.service';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { DomSanitizer } from '@angular/platform-browser';
import { FilterByStatusPipe } from './pipes/filter-by-status.pipe';

@Component({
  selector: 'app-career',
  templateUrl: './career.component.html',
  styleUrls: ['./career.component.scss'],
  imports: [
    NgForOf,
    NgIf,
    MatButtonModule,
		MatDialogModule,
    MatSelectModule,
    MatFormFieldModule,
    InputSearchComponent,
    ButtonArrowComponent,
    InputOnlyLettersComponent,
    ReactiveFormsModule,
    MatInputModule,
    NgxMaskDirective,
    MatIconModule,
    RouterLink,
    MatTooltipModule,
		MatMenuModule,
		FilterByStatusPipe
  ],
  providers: [
    provideNgxMask()
  ],
  standalone: true
})


export class CareerComponent extends OnDestroyMixin implements OnInit, OnDestroy {

  charging: boolean = false;
  school: School[] = [];
  schools: School[] = [];
	subjects: CourseDetailShort[];
	studyPlans: StudyPlan[] = [];
  testPattern = {
    S: { pattern: new RegExp('[A-Za-z0-9áéíóúÁÉÍÓÚüÜñÑ]') },
  };
	public subjectsForm!: FormGroup;
  careerList:       SPGetCareer[] = [];
  countSchool:      number = 0;
  actualSchool:     number = 1;
  totalPageSchool:  number = 1;
  countCareer:      number = 0;
  actualCareer:     number = 1;
  totalPageCareer:  number = 1;
  searchC :         string = '';
  searchS :         string = '';
  limit:            number = 10;
	title: 						string='';
	flagOnSubmit:  		number=0;

	@ViewChild('modalClose', { read: ElementRef }) public modalClose: ElementRef;
	@ViewChild('subjectsModalClose', { read: ElementRef }) public subjectsModalClose: ElementRef;

	private sanitizer: DomSanitizer = inject(DomSanitizer);

  constructor( private fb: FormBuilder,
                private common: CommonService,
                private admin: AdministrativeService,
								private user: UserService,
								private rrhh: RrhhService ){
								super();
							}

  public ngOnInit(): void {
    this.loadSchool();
    this.loadCareer();
		this.initForm();
		this.loadSubjects();
  }

	public override ngOnDestroy() {
    super.ngOnDestroy();
  }

  schoolFrom= this.fb.group({
    schoolId:           [0],
    schoolName:         ['', [Validators.required, Validators.pattern('[-_a-zA-Z0-9-ñÑÁáéÉíÍóÓúÚ ]*')]],
    schoolDesc:         ['', [Validators.required]],
    schoolPeriodStart:  [''],
    schoolPeriodEnd:    [''],
    state:              [''],
  });

  carrerForm = this.fb.group({
    careerID:           [0],
    schoolName:         [''],
    schoolID:           [0, [Validators.required, Validators.min(1)]],
    careerName:         ['', [Validators.required, Validators.pattern('[-_a-zA-Z0-9-ñÑÁáéÉíÍóÓúÚ ]*')]],
    careerDesc:         [''],
    careerAcronym:      ['', [Validators.required, Validators.maxLength(10)]],
    careerPeriodStart:  [''],
    careerPeriodEnd:    [''],
  })

	public initForm():void{
		this.subjectsForm = this.fb.group({
			courseID: ['', [Validators.required]],
			careerID: ['', [Validators.required]],
			user: this.user.currentUser.userName,
    });
	}

	public getCourseRow() {
    return (this.subjectsForm.controls['courseID'] as FormArray);
	}

	public removeCourseRow(rowIndex: number, item: Course): void {
		const courses = this.subjectsForm.controls['courseID'].value;
		courses.splice(rowIndex, 1);
		this.subjectsForm.controls['courseID'].patchValue(courses);
	}

  changePageCareer( page: number){
    this.actualCareer = page;
    this.searchCareer(this.searchC);
  }

  changePageSchool( page: number){
    this.actualSchool = page;
    this.searchSchool(this.searchS);
  }

  loadSchool(){
    this.charging = true;
    this.admin.getSchools()
      .subscribe( schools => this.schools = schools.data )
    this.admin.getSchool()
      .subscribe( school => {
        this.school = school.data;
        this.countSchool= school.count;
        this.totalPageSchool = Math.ceil(this.countSchool / 2);
        this.charging= false;
      })
  }

  loadCareer(){
    this.charging= true;
    this.admin.getCareers()
      .subscribe( career => {
        this.countCareer = career.count;
        this.careerList = career.data;
        this.totalPageCareer = Math.ceil(this.countCareer / this.limit);
        this.charging = false;
      })
  }

	loadSubjects(){
			this.rrhh.getCourse().subscribe({
			next: (res) => {
				this.subjects=res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
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
        this.totalPageCareer = Math.ceil(this.countCareer / this.limit);
      })
  }

  searchSchool(search: string){
    this.searchS=search
    this.admin.getSchool(this.actualSchool, this.searchS)
      .subscribe( school => {
        this.school = school.data;
        this.countSchool= school.count;
        this.totalPageSchool = Math.ceil(this.countSchool / 2)
      })
  }

	public getStudyPlans(careerID: number): void {
		this.admin.getCareerDetailCatalog(careerID).subscribe({
      next: (res) => {
				//console.log(res);
				this.studyPlans = res;
      },
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
    });
	}

	public openModal(auxForSubmit:number, item?:SPGetCareer): void{
		if(auxForSubmit==0){
			this.title='Agregar carrera'
			this.carrerForm.reset();
			this.carrerForm.markAsTouched();
			this.flagOnSubmit=0;
		}else if(auxForSubmit==1){
			this.title='Actualizar carrera'
			this.carrerForm.patchValue(item)
			this.carrerForm.get('careerID').patchValue(item.careerID)
			this.flagOnSubmit=1;
		}
	}

  onSubmit(){
    if(this.schoolFrom.valid){
      const school: School = this.schoolFrom.value as School;
      this.admin.postSchool(school)
        .subscribe( (resp: any) => {
          this.common.message(`${resp.message}`,'','success','#86bc57');
          this.schoolFrom.reset();
          this.loadSchool();
        })
    }else{
      this.common.message('Información Incompleta','Revise que ningun campo este en color rojo', 'error', '#f5637e');
    }
  }

  subCarrerFrom(){
    if(this.carrerForm.valid){
			const carrer: SPGetCareer = this.carrerForm.value as SPGetCareer;
			if(this.flagOnSubmit == 0){
      	this.admin.postCarrer(carrer)
        .subscribe( (resp: any) => {
					this.modalClose.nativeElement.click();
          this.common.message(`${resp.message}`,'','success','#86bc57');
          this.carrerForm.reset();
          this.loadCareer();
        });
			}else if(this.flagOnSubmit == 1){
				this.admin.putCarrer(carrer)
        .subscribe( (resp: any) => {
					this.modalClose.nativeElement.click();
          this.common.message(`${resp.message}`,'','success','#86bc57');
          this.carrerForm.reset();
          this.loadCareer();
        });
			}
    }else{
      this.common.message('Información Incompleta','Revise que ningún campo este en color rojo', 'error', '#f5637e');
    }
  }

	public onSubmitSubjects(): void{
		Swal
			.fire({
					icon: 'question',
					title: "¿Estás seguro de continuar?",
					showCancelButton: true,
					confirmButtonText: "Si",
					cancelButtonText: "No",
					allowOutsideClick: false,
			})
			.then(result => {
				if(result.value){
					let courses:[]=this.subjectsForm.controls['courseID'].value
					let arr=[];
					for(let i=0; i<courses.length; i++){
						let obj={
							careerID: this.subjectsForm.get('careerID').value,
							user: this.user.currentUser.userName,
							courseID: this.getCourseRow().value[i].courseID
						};
						arr.push(obj);
					}

					this.charging= true;
					this.admin.postCarrerCourse({"careerCourse": arr}).subscribe({
						next: (res:any) => {
							let resp=res[0];
							this.subjectsModalClose.nativeElement.click();
          		this.common.message(`${resp[0].message}`,'','success','#86bc57');
							this.subjectsForm.reset();
							this.charging= false;
						},
						error: (err: HttpErrorResponse) => {
							//console.log('err',err);
							this.charging= false;
						}
					});
				}
			});
	}

	public getCareerDetailCatalogReportPdf(careerID:number, studyPlanID:number): void{
		this.admin.getCareerDetailCatalogReportPdf(careerID, studyPlanID).subscribe({
			next: (res) => {
				//console.log(res);
				const blob: Blob = new Blob([res.body], { type: 'application/pdf' });
        const url = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob)));
        if (url) {
          window.open(url, '_blank');
        }
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public statusCareers(item: SPGetCareer, id: number): void{
		let body={
    	"statusID": id,
    	"user" : sessionStorage.getItem('name'),
			"careerID": item.careerID,
			"schoolID": item.schoolID
		}
		this.charging = true;
		this.admin.putStatusCareer(body).subscribe({
			next: (res: any) => {
				this.common.message(`${res.message}`,'','success','#86bc57');
				this.charging = false;
				this.loadCareer();
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.charging = false;
			}
		});
	}

}
