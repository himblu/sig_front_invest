import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatRadioModule} from '@angular/material/radio';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatCardModule} from '@angular/material/card';
import { MatCheckboxModule} from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'FSE-labor-data',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatRadioModule,
    FormsModule,
    MatCardModule,
    MatCheckboxModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './labor-data.component.html',
  styles: [
  ]
})
export class LaborDataComponent implements OnInit {

  /* *************************************** INPUTS & OUTPUTS ***************************************** */
  
  /* *************************************** ---------------- ***************************************** */
  
  
  /* ************************************ LISTAS GETTERS SETTERS ************************************** */
  
  /* *********************************** ------------------ ******************************************* */
  
  
  /* *********************************** VARIABLES GLOBALES ******************************************* */
  
  labelPosition: 'before' = 'before' ;
  valid: boolean= false;

  /* *********************************** ------------------ ******************************************* */
  
  
  /* *********************************** COSTRUCTOR Y CICLO DE VIDA *********************************** */
  
  constructor( private fb: FormBuilder ){}
  
  ngOnInit(): void {
  
    this.workingForm.get('currentJob').valueChanges
      .subscribe( resp => {
        this.valid = resp;
      })
  }
  
  /* *********************************** -------------------------- *********************************** */
  
  
  /* *********************************** GETERS Y SETERS ********************************************** */
  
  /* *********************************** -------------------------- *********************************** */
  
  
  /* *********************************** FORMULARIOS DEL FORMULARIO *********************************** */
  
  public workingForm: FormGroup = this.fb.group({
    currentJob:     [false],
    company:        [''],
    companyAddress: [''],
    positionWork:   [''],
    phone:          ['', Validators.pattern(/^[0-9]\d*$/)],
    workingHours:   ['', Validators.pattern(/^(0[8-9]|1[0-6]):[0-5][0-9] - (0[8-9]|1[0-7]):[0-5][0-9]\d*$/)],
    serviceTime:    ['', Validators.pattern(/^[0-9]\d*$/)],
  });
  /* *********************************** -------------------------- *********************************** */
  
  
  /* *********************************** FUNCIONES VARIAS ********************************************* */
  
  /* *********************************** -------------------------- *********************************** */
  
  
  /* ************************************** VALIDACIONES GLOBALES ************************************* */
  
  isValidField( field: string ): boolean | null{
    return this.workingForm.controls[field].errors
          && this.workingForm.controls[field].touched;
  }

  getFielError( field: string): string | null {
    if( !this.workingForm.controls[field] ) return null;
  
    const errors = this.workingForm.controls[field].errors || {};
  
    for (const key of Object.keys(errors)) {
      console.log(errors);
      switch (key) {
        case 'pattern':
            return 'Formato incorrecto solo números!';
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

  /* *********************************** -------------------------- *********************************** */
}
