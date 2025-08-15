
import { DatePipe, formatDate, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Output, OnInit, Input, inject, SecurityContext } from '@angular/core';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';

import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatStepperModule } from '@angular/material/stepper';

import { CommonService } from '@services/common.service';
import { RrhhService } from '@services/rrhh.service';
import { AdministrativeService } from '@services/administrative.service';

import { Country } from '@utils/interfaces/others.interfaces';
import { Course } from '@utils/interfaces/campus.interfaces';
import { ExperienceMatter, JobExperience, TimeAvailability, WorkExperience } from '@utils/interfaces/rrhh.interfaces';
import { phonePatern } from './../../shared/validators/validators';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { environment } from '@environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { ApiService } from '@services/api.service';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';

const MAX_FILE_SIZE = 5000000;
interface Reg{
	'file': File,
	'index': number
}

@Component({
  selector: 'components-work-experience',
  templateUrl: './work-experience.component.html',
  styles: [
  ],
  providers:[
    DatePipe,
		provideNgxMask()
  ],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    NgFor,
    NgIf,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatStepperModule,
		MatRadioModule,
		NgxMaskDirective,
		MatSnackBarModule,
		SpinnerLoaderComponent,
		MatIconModule,
		MatCheckboxModule
  ]
})
export class WorkExperienceComponent implements OnInit {

	public selectedFile?: any;
	public isLoadingInfo: boolean= false;
	private getPdfContentSubscription!: Subscription;

  /* *************************************** INPUTS & OUTPUTS ***************************************** */
  @Output() validForm: EventEmitter<boolean> = new EventEmitter();
  @Input('personID') personID: number = 0;
  /* *************************************** ---------------- ***************************************** */

  /* ************************************ LISTAS GETTERS SETTERS ************************************** */

	phone = {
    S: { pattern: new RegExp('[+0-9]') },
  };

  get dynamicsArr(): FormArray {
    return this.workForm.get('dynamics') as FormArray;
  }
  get dynamicsMatterArr(): FormArray {
    return this.matterForm.get('dynamics') as FormArray;
  }
  get dynamicsCualidadesArr(): FormArray {
    return this.cualidadesForm.get('dynamics') as FormArray;
  }
  /* *********************************** ------------------ ******************************************* */


  /* *********************************** VARIABLES GLOBALES ******************************************* */

	isLoading: boolean = false;
  dateControl1: string = '';
  dateControl2: string = '';
	jobExperience: any;
  courseList: Course[] = [];
	countryList: Country[] = [];
  timeAvailabilityList: TimeAvailability[] = [];
  listFilesUpload: Reg[] = [];
	jobExperienceList: JobExperience[] = [];

  /* *********************************** ------------------ ******************************************* */


  /* *********************************** COSTRUCTOR Y CICLO DE VIDA *********************************** */

	private sanitizer: DomSanitizer = inject(DomSanitizer);

  constructor( private fb: FormBuilder,
                private common: CommonService,
                private dateAdapter: DateAdapter<Date>,
                private rrhh: RrhhService,
                private datePipe: DatePipe,
                private admin:AdministrativeService,
								private api: ApiService,
								private snackBar: MatSnackBar, ){
                  // this.dateAdapter.setLocale('en-GB'); //dd/MM/yyyy
                }
  ngOnInit(): void {

    this.loading();
    this.addForm();
    this.addCualidadesForm();
    this.addMatterForm();
    this.myForm.get('dateAdmission').valueChanges
      .subscribe( resp => this.dateControl1 = resp);
    this.myForm.get('departureDate').valueChanges
      .subscribe( resp => this.dateControl2 = resp);

    this.myMatterForm.get('courseID').valueChanges
      .subscribe( resp => {
        this.chargeMatter(resp);
      });
    this.myCualidadesForm.get('scheduleTypeID').valueChanges
      .subscribe( resp => {
        this.chargeCualidades(resp);
      });
  }

  /* *********************************** -------------------------- *********************************** */


  /* *********************************** GETERS Y SETERS ********************************************** */

  /* *********************************** -------------------------- *********************************** */


  /* *********************************** FORMULARIOS DEL FORMULARIO *********************************** */

  public workForm!: FormGroup;
  public matterForm!: FormGroup;
  public cualidadesForm!: FormGroup;

  private addForm(): void {
    this.workForm = this.fb.group({
      dynamics: this.fb.array([])
    })
  }
  private addMatterForm(): void {
    this.matterForm = this.fb.group({
      dynamics: this.fb.array([])
    })
  }
  private addCualidadesForm(): void {
    this.cualidadesForm = this.fb.group({
      dynamics: this.fb.array([])
    })
  }

  public myForm: FormGroup = this.fb.group({
		personID:						'',
    institution:    		['', [Validators.required]],
    workAddress:    		['', [Validators.required]],
    responsibility: 		['', [Validators.required]],
    dateAdmission:  		['', [Validators.required]],
    departureDate:  		[null],
    workPhone:      		['', [Validators.required, Validators.minLength(9), Validators.maxLength(13)]],
		workName:           ['', [Validators.required]],
		urlDocument:        [''],
		countryID:     			[59, [Validators.required]],
		currentWork: 				['', [Validators.required]],
    user:           		['ADMIN'],
		type: 							['', [Validators.required]],
		statusID: 1,
		fileTraining:				null
  });

  public myMatterForm: FormGroup = this.fb.group({
    personID:     [0],
    teacherName:  [''],
    courseID:     [0,[Validators.required, Validators.min(0)]],
    courseName:   [''],
    state:        [''],
  });

  public myCualidadesForm: FormGroup = this.fb.group({
    personID:         [0],
    teacherName:      [''],
    scheduleTypeID:   [0],
    scheduleTypeName: [''],
    hours:            [0],
    state:            ['']
  });

  /* *********************************** -------------------------- *********************************** */


  /* *********************************** FUNCIONES VARIAS ********************************************* */

  loading(){
    this.admin.getSubject()
      .subscribe( course => {
        //console.log(course);
        this.courseList = course.data;
      })
    this.rrhh.getTimeAvailability()
      .subscribe( timeAvailability => {
        this.timeAvailabilityList= timeAvailability;
      })

		this.common.getCountry()
      .subscribe( country => {
        this.countryList = country
    })

		this.admin.getJobExperience()
		.subscribe( jobs => {
			this.jobExperience = jobs
			//console.log(jobs)
		})
		setTimeout(() => {
			this.getCurrentJobExperience();
		}, 250);
  }

  charge(){
    //console.log(this.myForm);

    if(!this.myForm.valid) {
      this.myForm.markAllAsTouched();
      return;
    }
    const form = this.myForm.value;

    const record: FormGroup = this.fb.group({
      personID:       [Number(this.personID)],
      institution:    [form.institution, [Validators.required]],
      workAddress:    [form.workAddress, [Validators.required]],
      responsibility: [form.responsibility, [Validators.required]],
      dateAdmission:  [this.formattedDate(new Date(this.dateControl1)), [Validators.required]],
      departureDate:  [(this.dateControl2)?this.formattedDate(new Date(this.dateControl2)):null],
      workPhone:      [form.workPhone, [Validators.required, Validators.minLength(9), Validators.maxLength(13)]],
			workName:       [form.workName, [Validators.required]],
			urlDocument:    [''],
			countryID:     	[form.countryID, [Validators.required]],
			currentWork: 		[form.currentWork, [Validators.required]],
			user:           ['ADMIN'],
			type: 					[form.type, [Validators.required]],
			fileTraining:   [null, [Validators.required]],
			statusID: 			[form.statusID],
			sequenceNro:		''
    });

    this.dynamicsArr.push(record);
    this.myForm.reset({country: 59});
  }

  chargeMatter(courseID: number){
    if(!this.myMatterForm.valid) {
      return;
    }
    const form = this.myMatterForm.value

    for (let i = 0; i < this.courseList.length; i++) {
      if(courseID === this.courseList[i].courseID){
        form.courseName = this.courseList[i].courseName;
        form.courseID = this.courseList[i].courseID;
        break;
      }
    }
    const record: FormGroup = this.fb.group({
      personID:     [Number(this.personID)],
      teacherName:  [''],
      courseID:     [form.courseID,[Validators.required]],
      courseName:   [form.courseName],
      state:        [''],
    });
    this.dynamicsMatterArr.push(record);

    //console.log(this.matterForm.value);

  }

  chargeCualidades(timeID: number){
    if(!this.myCualidadesForm.valid) {
      return;
    }
    const form = this.myCualidadesForm.value

    for (let i = 0; i < this.timeAvailabilityList.length; i++) {
      if(timeID === this.timeAvailabilityList[i].scheduleTypeID){
        form.scheduleTypeID = this.timeAvailabilityList[i].scheduleTypeID;
        form.scheduleTypeName = this.timeAvailabilityList[i].scheduleTypeName;
        break;
      }
    }
    const record: FormGroup = this.fb.group({
      personID:         [Number(this.personID)],
      teacherName:      [''],
      scheduleTypeID:   [form.scheduleTypeID, [Validators.required]],
      scheduleTypeName: [form.scheduleTypeName, [Validators.required]],
      hours:            [0, [Validators.required, Validators.min(1)]],
      state:            ['']
    });
    this.dynamicsCualidadesArr.push(record);

    //console.log(this.myCualidadesForm.value);

  }

  isValidField( field: string ): boolean | null{
    return this.myForm.controls[field].errors
          && this.myForm.controls[field].touched;
  }

  isValidFieldInArray(formArray: FormArray, i: number){
    return formArray.controls[i].errors
        && formArray.controls[i].touched;
  }

  getFielError( field: string): string | null {
    if( !this.myForm.controls[field] ) return null;

    const errors = this.myForm.controls[field].errors || {};

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

  public deleteDynamic(index: number): void {
    this.dynamicsArr.removeAt(index);
  }
  public deleteDynamicMatter(index: number): void {
    this.dynamicsMatterArr.removeAt(index);
  }
  public deleteDynamicCualidades(index: number): void {
    this.dynamicsCualidadesArr.removeAt(index);
  }

  saveRecord(){
		this.isLoading= true;
    if( this.workForm.invalid ){
      this.workForm.markAllAsTouched();
      this.common.message('Información Incompleta o Incorrecta Experiencia del Docente', ' Revise que no existan campos en color rojo', 'error','#f5637e');
			this.isLoading= false;
      return;
    }
    const dynamic: WorkExperience = this.workForm.value as WorkExperience;
    this.rrhh.postWorkExperience(dynamic)
      .subscribe({ next: (res: any) => {
				//console.log(res);
        this.listFilesUpload.forEach((item: Reg, index: number) => {
					if(res[index].sequenceNro){
						this.rrhh.postFileDocs(item.file, this.personID, 22, res[index].sequenceNro).subscribe({
							next: (docs: any) => {
								//console.log('docs', docs);
							},
							error: (err: HttpErrorResponse) => {
								//console.log('err',err);
								this.isLoading= false;
							}
						})
					}else{
						this.rrhh.postFileDocs(item.file, this.personID, 22, item.index+1).subscribe({
							next: (docs: any) => {
								//console.log('docs', docs);
							},
							error: (err: HttpErrorResponse) => {
								//console.log('err',err);
								this.isLoading= false;
							}
						})
					}
        });
        setTimeout(() => {
					this.common.nextStep.next(true);
					this.common.message('Se  ha guardado la información con éxito', '', 'success', "#d3996a");
					this.isLoading= false;
				}, 2500);
      	},
				error: (err: HttpErrorResponse) => {
					//console.log('err',err);
					this.isLoading= false;
				}
			});
  }

  private formattedDate(date: Date): string {
    return <string>this.datePipe.transform(date, 'yyyy-MM-dd');
  }

	public onChangeInput(files: FileList, index: number, input: HTMLInputElement): void {
    if (files) {
			if(files[0].size > MAX_FILE_SIZE){
				input.value='';
				this.snackBar.open(
          `Máximo 5MB permitido`,
          null,
          {
            horizontalPosition: 'center',
            verticalPosition: 'top',
            duration: 4000,
            panelClass: ['red-snackbar']
          }
        );
			}else{
				const file: File = files.item(0);
				const fileReader = new FileReader();
				if (file) {
					let reg= {
						'file': file,
						'index': index
					}
					this.listFilesUpload.push(reg);
				}
			}
    }
  }

	public addingRow(): FormGroup {
		return this.fb.group({
			personID:						'',
			institution:    		['', [Validators.required]],
			workAddress:    		['', [Validators.required]],
			responsibility: 		['', [Validators.required]],
			dateAdmission:  		['', [Validators.required]],
			departureDate:  		[null],
			workPhone:      		['', [Validators.required, Validators.minLength(9), Validators.maxLength(13)]],
			workName:           ['', [Validators.required]],
			urlDocument:        [''],
			countryID:     			[59, [Validators.required]],
			currentWork: 				['', [Validators.required]],
			user:           		['ADMIN'],
			type: 							['', [Validators.required]],
			fileTraining:				null,
			statusID: 1,
			sequenceNro:				''
		});
	}

	public getCurrentJobExperience(): void {
		this.rrhh.getJobExperience(this.personID).subscribe({
			next: (res) => {
				if(res[0]){
					this.isLoadingInfo= true;
					//console.log('JobExperience', res);
					this.jobExperienceList= res;
					for(let i=0; i<res.length; i++){
						let arr = this.workForm.controls['dynamics'] as FormArray;
						arr.push(this.addingRow());
						arr.controls[i].patchValue(res[i]);
						arr.controls[i].get('workName').patchValue(res[i].referenceName);
						//if(res[i].dateAdmission) arr.controls[i].get('dateAdmission').patchValue(formatDate(res[i].dateAdmission, 'yyyy-MM-dd', 'en-US', '+4000'));
						//if(res[i].departureDate) arr.controls[i].get('departureDate').patchValue(formatDate(res[i].departureDate, 'yyyy-MM-dd', 'en-US', '+4000'));
					}
				}
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public putWorkExperience(index: number): void {
		if(this.dynamicsArr.controls[index].get('statusID').value === true) this.dynamicsArr.controls[index].get('statusID').patchValue(1);
		else if(this.dynamicsArr.controls[index].get('statusID').value === false) this.dynamicsArr.controls[index].get('statusID').patchValue(0);
		if(this.dynamicsArr.controls[index].valid && this.dynamicsArr.controls[index].get('sequenceNro').value){
			this.rrhh.putWorkExperience(this.dynamicsArr.controls[index].value).subscribe({
				next: (res: any) => {
					//console.log('put', res);
					this.snackBar.open(
						`${res.message}`,
						null,
						{
							horizontalPosition: 'center',
							verticalPosition: 'top',
							duration: 3000,
							panelClass: ['green-snackbar']
						}
					);
				},
				error: (err: HttpErrorResponse) => {
					//console.log('err',err);
					this.snackBar.open(
						`Intente nuevamente.`,
						null,
						{
							horizontalPosition: 'center',
							verticalPosition: 'top',
							duration: 3000,
							panelClass: ['red-snackbar']
						}
					);
				}
			});
		}else{
			this.dynamicsArr.controls[index].markAllAsTouched();
		}
	}

	public openFile(relativeRoute: string): void {
    const route: string = `${environment.url}/${relativeRoute}`;
    if (this.getPdfContentSubscription) this.getPdfContentSubscription.unsubscribe();
    this.getPdfContentSubscription = this.api.getPdfContent(route).subscribe((res: HttpResponse<Blob>) => {
      if (res.body) {
        let contentType: string | null | undefined = res.headers.get('content-type');
        // Porque el tipo de variable que recibe el type es string o undefined. No recibe null.
        if (!contentType) {
          contentType = undefined;
        }
        const blob: Blob = new Blob([res.body], { type: contentType });
        const url = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob)));
        if (url) {
          window.open(url, '_blank');
        }
      }
    });
  }

}
