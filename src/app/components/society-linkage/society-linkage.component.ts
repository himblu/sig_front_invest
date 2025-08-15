import { Component, EventEmitter, OnInit, Output, Input, inject, SecurityContext } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SocietyLinkage } from '@utils/interfaces/rrhh.interfaces';
import { CommonService } from '@services/common.service';
import { DatePipe, formatDate, NgFor, NgIf } from '@angular/common';
import { RrhhService } from '@services/rrhh.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatStepperModule } from '@angular/material/stepper';
import { provideNgxMask, NgxMaskDirective } from 'ngx-mask';
import { Subscription, tap } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { environment } from '@environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { ApiService } from '@services/api.service';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';

const MAX_FILE_SIZE = 5000000;
interface Reg {
	'file': File,
	'index': number
}

@Component({
  selector: 'components-society-linkage',
  templateUrl: './society-linkage.component.html',
  styles: [
  ],
  providers:[
    DatePipe,
    provideNgxMask()
  ],
  standalone: true,
  imports: [
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    NgFor,
    NgIf,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    MatStepperModule,
    NgxMaskDirective,
		MatSnackBarModule,
		SpinnerLoaderComponent,
		MatIconModule,
		MatCheckboxModule
  ]
})
export class SocietyLinkageComponent implements OnInit {

	isLoading: boolean= false;
	public isLoadingInfo: boolean= false;
	public societyLinkage: any[] = [];

  /* *************************************** INPUTS & OUTPUTS ***************************************** */
  @Output() validForm: EventEmitter<boolean> = new EventEmitter();
  @Input('personID') personID: number = 0;
  /* *************************************** ---------------- ***************************************** */
  testPattern = {
    S: { pattern: new RegExp('[A-Za-z0-9]') },
  };
  phone = {
    S: { pattern: new RegExp('[+0-9]') },
  };
	listFilesUpload: Reg[] = [];

	private getPdfContentSubscription!: Subscription;
	private sanitizer: DomSanitizer = inject(DomSanitizer);
	private snackBar: MatSnackBar = inject(MatSnackBar);


  /* ************************************ LISTAS GETTERS SETTERS ************************************** */

  /* *********************************** ------------------ ******************************************* */


  /* *********************************** VARIABLES GLOBALES ******************************************* */

  /* *********************************** ------------------ ******************************************* */


  /* *********************************** COSTRUCTOR Y CICLO DE VIDA *********************************** */

  constructor( private fb: FormBuilder,
                private common: CommonService,
                private rrhh: RrhhService,
                private datePipe: DatePipe,
								private api: ApiService,){}

  ngOnInit(): void {
    this.addForm();
		this.getSocietyLinkage();
  }

  /* *********************************** -------------------------- *********************************** */


  /* *********************************** GETERS Y SETERS ********************************************** */

  get dynamicsArr(): FormArray {
    return this.societyForm.get('dynamics') as FormArray;
  }
  /* *********************************** -------------------------- *********************************** */


  /* *********************************** FORMULARIOS DEL FORMULARIO *********************************** */

  public societyForm!: FormGroup;

  private addForm(): void {
    this.societyForm = this.fb.group({
      dynamics: this.fb.array([])
    })
  }

  public myForm: FormGroup = this.fb.group({
    personID:                 [0],
    societyLinkageID:         [0],
    projectName:              [''],
    societyLinkageHours:      [null],
    societyLinkageStartDate:  [null],
    societyLinkageEndDate:    [null],
		statusID: 1,
  });
  /* *********************************** -------------------------- *********************************** */


  /* *********************************** FUNCIONES VARIAS ********************************************* */

  charge(){
    if(!this.myForm.valid) {
      this.myForm.markAllAsTouched();
      return;
    }
    const form = this.myForm.value

    const record: FormGroup = this.fb.group({
      personID:                 [this.personID],
      societyLinkageID:         [0],
      projectName:              [form.projectName],
      societyLinkageHours:      [form.societyLinkageHours],
      societyLinkageStartDate:  [this.formattedDate(new Date(form.societyLinkageStartDate))],
      societyLinkageEndDate:    [this.formattedDate(new Date(form.societyLinkageEndDate))],
			statusID: form.statusID
    });

    this.dynamicsArr.push(record);
    this.myForm.reset({country: 59});
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

    const errors = this .myForm.controls[field].errors || {};

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

  saveRecord(){
		this.isLoading= true;
    if( !this.societyForm.valid ){
      this.societyForm.markAllAsTouched();
      this.common.message('Información Incompleta o Incorrecta', ' Revise que no existan campos en color rojo', 'error','#f5637e');
			this.isLoading= false;
      return;
    }
		const dynamic: SocietyLinkage = this.societyForm.value as SocietyLinkage;
		this.rrhh.postSocietyLinkage(dynamic)
			.subscribe({next: (res: any) => {
				this.validForm.emit(true);
				this.listFilesUpload.forEach((item: Reg, index: number) => {
					if(res[index].sequenceNro){
						this.submitFile(item.file, res[index].sequenceNro)
					}else{
						this.submitFile(item.file, item.index)
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
		//console.log(this.societyForm.value);
  }

  private formattedDate(date: Date): string {
		if(date){
			return <string>this.datePipe.transform(date, 'yyyy-MM-dd');
		}else{
			return '';
		}

  }

	public onChangeInput(files: FileList, input: HTMLInputElement, index?: number): void{
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

	public submitFile(file: File, index: number): void {
		//this.isLoading= true;
		this.rrhh.postCollaboratorDocs(file, this.personID, 23, index).subscribe({
			next: (res) => {
				//console.log(res);
				//this.isLoading= false;
			},
			error: (err: HttpErrorResponse) => {
				//this.isLoading= false;
			}
		});
	}

	public addingRow(): FormGroup {
		return this.fb.group({
			personID:                 [0],
			societyLinkageID:         [0],
			projectName:              [''],
			societyLinkageHours:      [null],
			societyLinkageStartDate:  [''],
			societyLinkageEndDate:    [''],
			fileInvestigation: '',
			statusID: 1
		});
	}

	public getSocietyLinkage(): void {
		this.rrhh.getSocietyLinkage(this.personID).subscribe({
			next: (res) => {
				if(res[0]){
					this.isLoadingInfo= true;
					//console.log('SocietyLinkage', res);
					this.societyLinkage= res;
					for(let i=0; i<res.length; i++){
						let arr = this.societyForm.controls['dynamics'] as FormArray;
						arr.push(this.addingRow());
						arr.controls[i].patchValue(res[i]);
						//if(res[i].societyLinkageStartDate) arr.controls[i].get('societyLinkageStartDate').patchValue(formatDate(res[i].societyLinkageStartDate, 'yyyy-MM-dd', 'en-US', '+4000'));
						//if(res[i].societyLinkageEndDate) arr.controls[i].get('societyLinkageEndDate').patchValue(formatDate(res[i].societyLinkageEndDate, 'yyyy-MM-dd', 'en-US', '+4000'));
					}
				}
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public putSocietyLinkage(index: number): void {
		if(this.dynamicsArr.controls[index].get('statusID').value === true) this.dynamicsArr.controls[index].get('statusID').patchValue(1);
		else if(this.dynamicsArr.controls[index].get('statusID').value === false) this.dynamicsArr.controls[index].get('statusID').patchValue(0);
		if(this.dynamicsArr.controls[index].valid && this.dynamicsArr.controls[index].get('societyLinkageID').value){
			this.rrhh.putSocietyLinkage(this.dynamicsArr.controls[index].value).subscribe({
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
