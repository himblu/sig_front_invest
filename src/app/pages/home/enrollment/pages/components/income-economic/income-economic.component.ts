import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { CommonService } from '@services/common.service';
import { EnrollmentService } from '@services/enrollment.service';
import { CivilStatus } from '@utils/interfaces/others.interfaces';
import { Profession } from '@utils/interfaces/enrollment.interface';

@Component({
  selector: 'FSE-income-economic',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './income-economic.component.html',
  styles: [
  ]
})
export class IncomeEconomicComponent implements OnInit {
/* *************************************** INPUTS & OUTPUTS ***************************************** */

/* *************************************** ---------------- ***************************************** */


/* ************************************ LISTAS GETTERS SETTERS ************************************** */
get civilStatusList(): CivilStatus[]{
  return this.enrollment.civilList;
}

get professionList(): Profession[]{
  return this.enrollment.listProfession;
}
/* *********************************** ------------------ ******************************************* */


/* *********************************** VARIABLES GLOBALES ******************************************* */
valid: boolean=false;
/* *********************************** ------------------ ******************************************* */


/* *********************************** COSTRUCTOR Y CICLO DE VIDA *********************************** */

constructor( private fb: FormBuilder,
              private common: CommonService,
              private enrollment: EnrollmentService ){}

ngOnInit(): void {
  this.loading();
  this.addForm();
}

/* *********************************** -------------------------- *********************************** */


/* *********************************** GETERS Y SETERS ********************************************** */

get dynamicArr(){
  return this.familyForm.get('group') as FormArray;
}

/* *********************************** -------------------------- *********************************** */


/* *********************************** FORMULARIOS DEL FORMULARIO *********************************** */

public familyForm: FormGroup;

public addForm(): void{
  this.familyForm = this.fb.group({
    group: this.fb.array([])
  });
}

public myForm: FormGroup = this.fb.group({
  names:        ['', [Validators.required]],
  relationship: ['', [Validators.required]],
  age:          ['', [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]\d*$/)]],
  civilStatus:  ['', [Validators.required]],
  profession:   ['', [Validators.required]],
  income:       ['', [Validators.required, Validators.pattern(/^[0-9]+([.][0-9]+)?$/)]],
  spent:        ['', [Validators.required, Validators.pattern(/^[0-9]+([.][0-9]+)?$/)]],
});
/* *********************************** -------------------------- *********************************** */


/* *********************************** FUNCIONES VARIAS ********************************************* */

  async loading(){
  await this.enrollment.charging();
}
addMyForm(){
  if(!this.myForm.valid) {
    this.myForm.markAllAsTouched();
    return;
  }

  const form = this.myForm.value;

  const group: FormGroup = this.fb.group({
    names:        [form.names, [Validators.required]],
    relationship: [form.relationship, [Validators.required]],
    age:          [form.age, [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]\d*$/)]],
    civilStatus:  [form.civilStatus, [Validators.required]],
    profession:   [form.profession, [Validators.required]],
    income:       [form.income, [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+([.][0-9]+)?$/)]],
    spent:        [form.spent, [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+([.][0-9]+)?$/)]],
  });

  this.dynamicArr.push(group);
  this.valid=true;
  this.myForm.reset();

}

public deleteDynamic(index: number): void {
  this.dynamicArr.removeAt(index);
  if(this.dynamicArr.length===0){
    this.valid=false;
  }
}
/* *********************************** -------------------------- *********************************** */


/* ************************************** VALIDACIONES GLOBALES ************************************* */

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
    console.log(errors);
    switch (key) {
      case 'pattern':
          return 'Formato incorrecto!';
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
