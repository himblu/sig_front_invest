import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Course } from '@utils/interfaces/campus.interfaces';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { NgForOf, NgIf, UpperCasePipe } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ButtonArrowComponent } from '@components/button-arrow/button-arrow.component';
import { InputSearchComponent } from '@components/input-shearch/input-search.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-subjects',
  templateUrl: './subjects.component.html',
  styles: [],
  standalone: true,
    imports: [
        ReactiveFormsModule,
        UpperCasePipe,
        NgForOf,
        NgIf,
        MatSelectModule,
        MatFormFieldModule,
        MatButtonModule,
        MatInputModule,
        ButtonArrowComponent,
        InputSearchComponent,
				MatTooltipModule
    ]
})

export class SubjectsComponent implements OnInit{

  cargando: boolean = false;
	subjectForm!: FormGroup;
  subjectList: Course[] = [];
  count:      number = 0;
  totalPage:  number = 0;
  actual:     number = 1;
  search:     string ='';
	title: 			string='';
	flagOnSubmit:  			number=0;

	@ViewChild('modalClose', { read: ElementRef }) public modalClose: ElementRef;

  constructor( private fb: FormBuilder,
                private common: CommonService,
                private admin: AdministrativeService,
								private user: UserService ){
								this.initForm();
							}

  ngOnInit(): void {
    this.loading();
  }

  public initForm(): void {
		this.subjectForm= this.fb.group({
			courseID:                [0],
			courseName:              ['', [Validators.required]],
			courseAbbr:              ['', [Validators.required]],
			courseCred:              [0],
			courseSubject:           [''],
			courseHoursTeachContact: [0],
			courseHoursPracExp:      [0],
			courseHoursAutonomous:   [0],
			statusID:                [1],
			stateName:               [''],
			starPeriod:							 [''],
			courseHoursLab:          [0],
			courseHoursTheory:       [0],
			courseHoursPractice:     [0],
			courseCode:              [''],
			user:										 this.user.currentUser.userName
		});
	}

  changePage( page: number){
    this.actual = page;
    this.searchT(this.search);
  }

  loading(){
    this.cargando= true;
    this.admin.getSubject()
      .subscribe( subject => {
        this.subjectList = subject.data
        //console.log(subject);

        this.count = subject.count;
        this.totalPage = Math.ceil(this.count / 10);
        this.cargando=false;
      })
  }
  isValidField( field: string ): boolean | null{
    return this.subjectForm.controls[field].errors
          && this.subjectForm.controls[field].touched;
  }

  getFielError( field: string): string | null {
    if( !this.subjectForm.controls[field] ) return null;

    const errors = this.subjectForm.controls[field].errors || {};

    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
            return 'Campo requerido!';
        case 'min':
          if(errors['min'].min === 1){
            return 'Debe seleccionar una opción!';
          }else{
            return 'Cantidad Incorrecta!';
          }

        case 'email':
            return 'No es un formato de email valido!';
        case 'minlength':
            return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
      }
    }
    return '';
  }

	openModal(auxForSubmit:number, item?:Course){
		if(auxForSubmit==0){
			this.title='Agregar asignatura'
			this.initForm();
			this.flagOnSubmit=0;
		}else if(auxForSubmit==1){
			this.title='Actualizar asignatura'
			this.subjectForm.patchValue(item)
			this.subjectForm.get('courseID').patchValue(item.courseID)
			this.flagOnSubmit=1;
		}
	}

	onSubmit(){
		if(this.flagOnSubmit==0){
			console.log(this.subjectForm);
			if(!this.subjectForm.valid){
				this.subjectForm.markAllAsTouched();
				return;
			}
			const subject: Course = this.subjectForm.value;
			this.admin.postSubject(subject)
				.subscribe( (resp: any ) => {
					this.common.message(`${resp.message}`, '', 'success', '#86bc57');
					this.initForm();
					this.loading();
				})
				this.modalClose.nativeElement.click();
		}else if (this.flagOnSubmit==1){
			/*if(!this.subjectForm.valid){
      this.subjectForm.markAllAsTouched();
      return;
			}*/
			const subject: Course = this.subjectForm.value;

			this.admin.putSubject(subject)
			.subscribe( (resp: any ) => {
				this.common.message(`${resp.message}`, '', 'success', '#86bc57');
				this.loading();
			})
			this.modalClose.nativeElement.click();
		}
	}

	statusSubject(item:Course, id:number){
		let body={
			"courseID": item.courseID,
    	"statusID": id,
    	"user" : sessionStorage.getItem('name')
		}

		this.admin.subjectStatus(body).subscribe( (resp: any ) => {
			this.common.message(`${resp.message}`, '', 'success', '#86bc57');
			this.loading();
		})
	}

  searchT(search: string){
    this.search=search
    this.admin.getSubject(this.actual, this.search)
      .subscribe( subject => {
				//console.log(subject.data)
        this.subjectList = subject.data
        this.count = subject.count;
        this.totalPage = Math.ceil(this.count / 10);
        this.cargando=false;
      })
  }

}
