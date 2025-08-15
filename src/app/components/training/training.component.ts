import { Component, EventEmitter, Output, OnInit, Input, inject, SecurityContext } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Country } from '@utils/interfaces/others.interfaces';
import { Training } from '@utils/interfaces/rrhh.interfaces';
import { CommonService } from '@services/common.service';
import { RrhhService } from '@services/rrhh.service';
import { formatDate, NgFor, NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { environment } from '@environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { ApiService } from '@services/api.service';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import * as moment from 'moment';

const MAX_FILE_SIZE = 5000000;
interface Reg{
	'file': File,
	'index': number
}

@Component({
  selector: 'components-training',
  templateUrl: './training.component.html',
  styles: [
  ],
  providers: [
    provideNgxMask(),
  ],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgFor,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatButtonModule,
    MatStepperModule,
    MatSelectModule,
    NgxMaskDirective,
		MatDatepickerModule,
		MatSnackBarModule,
		SpinnerLoaderComponent,
		MatIconModule,
		MatCheckboxModule
  ]
})
export class TrainingComponent implements OnInit {

	public isLoadingInfo: boolean= false;
	private getPdfContentSubscription!: Subscription;

  /* *************************************** INPUTS & OUTPUTS ***************************************** */
  @Output() validForm: EventEmitter<boolean> = new EventEmitter();
  @Input('personID') personID: number = 0;
  /* *************************************** ---------------- ***************************************** */
  year = {
    S: { pattern: new RegExp('[+0-9]') },
  };

  /* ************************************ LISTAS GETTERS SETTERS ************************************** */

  /* *********************************** ------------------ ******************************************* */


  /* *********************************** VARIABLES GLOBALES ******************************************* */

	isLoading: boolean= false;
  countryList: Country[] = [];
  courses: any[] = [];
  listFilesUpload: Reg[] = [];
	training: Training[] = [];

  /* *********************************** ------------------ ******************************************* */


  /* *********************************** COSTRUCTOR Y CICLO DE VIDA *********************************** */
	private sanitizer: DomSanitizer = inject(DomSanitizer);

  constructor(private fb: FormBuilder,
    private common: CommonService,
    private rrhh: RrhhService,
		private snackBar: MatSnackBar,
		private api: ApiService,) { }

  ngOnInit(): void {

    this.addForm();
    this.load();
  }

  /* *********************************** -------------------------- *********************************** */


  /* *********************************** GETERS Y SETERS ********************************************** */

  get dynamicsArr(): FormArray {
    return this.trainingForm.get('dynamics') as FormArray;
  }
  /* *********************************** -------------------------- *********************************** */


  /* *********************************** FORMULARIOS DEL FORMULARIO *********************************** */

  public trainingForm!: FormGroup;

  private addForm(): void {
    this.trainingForm = this.fb.group({
      dynamics: this.fb.array([])
    })
  }

  public myForm: FormGroup = this.fb.group({
    personID: [0],
    trainingTypeID: ['', [Validators.required]],
    trainingName: ['', [Validators.required]],
    trainingPosition: ['', [Validators.required]],
    trainingInstitution: ['', [Validators.required]],
    initDate: [''],
		endDate: [''],
    countryID: [59, [Validators.required]],
    trainingHours: [0, [Validators.required]],
    urlDocument: [''],
		statusID: 1,
    // fileTraining: [0],
    user: [sessionStorage.getItem('name')]
  });

  /* *********************************** -------------------------- *********************************** */


  /* *********************************** FUNCIONES VARIAS ********************************************* */

  load() {
    this.common.getCountry()
      .subscribe(country => {
        this.countryList = country
      })
    this.common.getTrainingType().subscribe({
      next: (res) => {
        this.courses = res;

      },
      error: (err) => {
        console.log(err);
      },
    })
		setTimeout(() => {
			this.getTraining();
		}, 250);
  }

  charge() {
    if (!this.myForm.valid) {
      this.myForm.markAllAsTouched();
      return;
    }
    const form = this.myForm.value

    const record: FormGroup = this.fb.group({
			trainingID: '',
      personID: [this.personID],
      trainingTypeID: [form.trainingTypeID, [Validators.required]],
      trainingName: [form.trainingName, [Validators.required]],
      trainingPosition: [form.trainingPosition, [Validators.required]],
      trainingInstitution: [form.trainingInstitution, [Validators.required]],
      initDate: [moment(form.initDate).format('YYYY-MM-DD')],
			endDate: [moment(form.endDate).format('YYYY-MM-DD')],
      countryID: [form.countryID, [Validators.required]],
      trainingHours: [form.trainingHours, [Validators.required]],
      urlDocument: [''],
			statusID: [form.statusID],
      fileTraining: [null, [Validators.required]],
      user: [sessionStorage.getItem('name')]
    });

    this.dynamicsArr.push(record);
    this.myForm.reset({ countryID: 59 });
  }

  isValidField(field: string): boolean | null {
    return this.myForm.controls[field].errors
      && this.myForm.controls[field].touched;
  }

  isValidFieldInArray(formArray: FormArray, i: number) {
    return formArray.controls[i].errors
      && formArray.controls[i].touched;
  }

  getFielError(field: string): string | null {
    if (!this.myForm.controls[field]) return null;

    const errors = this.myForm.controls[field].errors || {};

    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
          return 'Campo requerido!';
        case 'min':
          if (errors['min'].min === 1) {
            return 'Debe seleccionar una opción!';
          } else {
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

  saveRecord() {
		this.isLoading= true;
    if (!this.trainingForm.valid) {
      this.trainingForm.markAllAsTouched();
      this.common.message('Información Incompleta o Incorrecta', ' Revise que no existan campos en color rojo', 'error', '#f5637e');
			this.isLoading= false;
      return;
    }
    const dynamic: any = this.trainingForm.value as any;
    this.rrhh.postTraining2(dynamic)
      .subscribe({ next: (res: any) =>{
        this.listFilesUpload.forEach((item: Reg, index: number) => {
					if(res[index].sequenceNro){
						this.rrhh.postFileDocs(item.file, this.personID, 18, res[index].sequenceNro).subscribe({
							next: (docs: any) => {
								console.log('docs', docs);
							}
						})
					}else{
						this.rrhh.postFileDocs(item.file, this.personID, 18, item.index+1).subscribe({
							next: (docs: any) => {
								console.log('docs', docs);
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
			trainingID: '',
			personID: [this.personID],
      trainingTypeID: ['', [Validators.required]],
      trainingName: ['', [Validators.required]],
      trainingPosition: ['', [Validators.required]],
      trainingInstitution: ['', [Validators.required]],
      initDate: [''],
			endDate: [''],
      countryID: ['', [Validators.required]],
      trainingHours: [0, [Validators.required]],
      urlDocument: [''],
			statusID: 1,
      fileTraining: [''],
      user: [sessionStorage.getItem('name')]
		});
	}

	public getTraining(): void {
		this.rrhh.getTraining(this.personID).subscribe({
			next: (res) => {
				if(res[0]){
					this.isLoadingInfo= true;
					//console.log('Training', res);
					this.training= res;
					for(let i=0; i<res.length; i++){
						let arr = this.trainingForm.controls['dynamics'] as FormArray;
						arr.push(this.addingRow());
						arr.controls[i].patchValue(res[i]);
						//if(res[i].initDate) arr.controls[i].get('initDate').patchValue(formatDate(res[i].initDate, 'yyyy-MM-dd', 'en-US', '+4000'));
						//if(res[i].endDate) arr.controls[i].get('endDate').patchValue(formatDate(res[i].endDate, 'yyyy-MM-dd', 'en-US', '+4000'));
					}
				}
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public putTraining(index: number): void {
		if(this.dynamicsArr.controls[index].get('statusID').value === true) this.dynamicsArr.controls[index].get('statusID').patchValue(1);
		else if(this.dynamicsArr.controls[index].get('statusID').value === false) this.dynamicsArr.controls[index].get('statusID').patchValue(0);
		if(this.dynamicsArr.controls[index].valid && this.dynamicsArr.controls[index].get('trainingID').value){
			this.rrhh.putTraining(this.dynamicsArr.controls[index].value).subscribe({
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
