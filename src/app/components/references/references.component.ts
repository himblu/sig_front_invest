import { Component, OnInit, EventEmitter, Output, Input, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { References } from '@utils/interfaces/rrhh.interfaces';
import { CommonService } from '@services/common.service';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { RrhhService } from '@services/rrhh.service';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatStepperModule } from '@angular/material/stepper';
import { provideNgxMask, NgxMaskDirective } from 'ngx-mask';
import { HttpErrorResponse } from '@angular/common/http';
import { ROL } from '@utils/interfaces/login.interfaces';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'components-references',
  templateUrl: './references.component.html',
  styles: [
  ],
  providers:[
    DatePipe,
    provideNgxMask()

  ],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    NgFor,
    NgIf,
    MatTooltipModule,
    MatStepperModule,
    NgxMaskDirective,
		SpinnerLoaderComponent,
		MatSnackBarModule,
		MatCheckboxModule
  ]
})
export class ReferencesComponent implements OnInit {

	isLoading: boolean= false;
	protected readonly ROL = ROL;
	public rol: string;
	public isLoadingInfo: boolean= false;

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


  /* ************************************ LISTAS GETTERS SETTERS ************************************** */

  /* *********************************** ------------------ ******************************************* */


  /* *********************************** VARIABLES GLOBALES ******************************************* */

  /* *********************************** ------------------ ******************************************* */


  /* *********************************** COSTRUCTOR Y CICLO DE VIDA *********************************** */

	private snackBar: MatSnackBar = inject(MatSnackBar);

  constructor( private fb: FormBuilder,
                private common: CommonService,
                private rrhh: RrhhService,
                private router: Router ){
								this.rol = sessionStorage.getItem('rol')
								}

  ngOnInit(): void {
    this.addForm();
		this.getReferences();
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
    personID:           [this.personID],
    referenceFullName:  ['', [Validators.required]],
    referencePosition:  ['', [Validators.required]],
    referenceCompany:   ['', [Validators.required]],
    referencePhone:     ['', [Validators.required, Validators.minLength(9), Validators.maxLength(13)]],
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
      personID:           [this.personID],
			sequenceNro: '',
      referenceFullName:  [form.referenceFullName, [Validators.required]],
      referencePosition:  [form.referencePosition, [Validators.required]],
      referenceCompany:   [form.referenceCompany, [Validators.required]],
      referencePhone:     [form.referencePhone, [Validators.required, Validators.minLength(9), Validators.maxLength(13)]],
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
      const dynamic: References = this.societyForm.value as References;
      this.rrhh.postReferences(dynamic)
        .subscribe({
					next: (res) => {
						this.isLoading= false;
						this.common.message('Perfil Docente', 'Guardado con éxito', 'success', '#86bc57');
						if(this.rol === this.ROL.TEACHER){
							this.router.navigateByUrl('/').then();
						}else{
							this.router.navigateByUrl('/talento-humano/perfil-docente').then();
						}
					},
					error: (err: HttpErrorResponse) => {
						this.isLoading= false;
						this.common.message('Perfil Docente', 'Guardado con éxito', 'success', '#86bc57');
          	if(this.rol === this.ROL.TEACHER){
							this.router.navigateByUrl('/').then();
						}else{
							this.router.navigateByUrl('/talento-humano/perfil-docente').then();
						}
					}
				});
      //console.log(this.societyForm.value);
  }

  public addingRow(): FormGroup {
		return this.fb.group({
			personID:           [this.personID],
			sequenceNro: '',
			referenceFullName:  ['', [Validators.required]],
			referencePosition:  ['', [Validators.required]],
			referenceCompany:   ['', [Validators.required]],
			referencePhone:     ['', [Validators.required, Validators.minLength(9), Validators.maxLength(13)]],
			fileInvestigation: '',
			statusID: 1,
		});
	}

	public getReferences(): void {
		this.rrhh.getReferences(this.personID).subscribe({
			next: (res) => {
				if(res[0]) this.isLoadingInfo= true;
				//console.log('References', res);
				for(let i=0; i<res.length; i++){
					let arr = this.societyForm.controls['dynamics'] as FormArray;
					arr.push(this.addingRow());
					arr.controls[i].patchValue(res[i]);
				}
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public putReferences(index: number): void {
		if(this.dynamicsArr.controls[index].get('statusID').value === true) this.dynamicsArr.controls[index].get('statusID').patchValue(1);
		else if(this.dynamicsArr.controls[index].get('statusID').value === false) this.dynamicsArr.controls[index].get('statusID').patchValue(0);
		//console.log(this.dynamicsArr.controls[index].value);
		if(this.dynamicsArr.controls[index].valid && this.dynamicsArr.controls[index].get('sequenceNro').value){
			this.rrhh.putReferences(this.dynamicsArr.controls[index].value).subscribe({
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

}
