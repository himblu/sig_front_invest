import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {NgIf} from '@angular/common';


import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { EnrollmentService } from '@services/enrollment.service';

@Component({
  selector: 'FSE-family-economic-data',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    NgxMaskDirective,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule
  ],
  providers: [
    provideNgxMask(),
  ],
  templateUrl: './family-economic-data.component.html',
  styles: [
  ]
})
export class FamilyEconomicDataComponent extends OnDestroyMixin implements OnInit {

  /* *************************************** INPUTS & OUTPUTS ***************************************** */
  
  /* *************************************** ---------------- ***************************************** */
  
  
  /* ************************************ LISTAS GETTERS SETTERS ************************************** */
  
  /* *********************************** ------------------ ******************************************* */
  
  
  /* *********************************** VARIABLES GLOBALES ******************************************* */
  testPattern = {
    S: { pattern: new RegExp('[0-9]') },
  };

  global: number = 0;
  /* *********************************** ------------------ ******************************************* */
  
  
  /* *********************************** COSTRUCTOR Y CICLO DE VIDA *********************************** */
  
  constructor( private fb: FormBuilder,
              private enrollment: EnrollmentService){
                super();
              }
  
  ngOnInit(): void {
    this.loading();
  }
  
  /* *********************************** -------------------------- *********************************** */
  
  
  /* *********************************** GETERS Y SETERS ********************************************** */
  
  /* *********************************** -------------------------- *********************************** */
  
  
  /* *********************************** FORMULARIOS DEL FORMULARIO *********************************** */
  
  public averageIncomeForm: FormGroup = this.fb.group({
    fatherIncome:        [0, [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+([.][0-9]+)?$/)]],
    motherIncome:        [0, [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+([.][0-9]+)?$/)]],
    familyIncome:        [0, [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+([.][0-9]+)?$/)]],
    studentIncome:       [0, [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+([.][0-9]+)?$/)]],
    partnerContribution: [0, [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+([.][0-9]+)?$/)]],
    otherIncome:         [0, [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+([.][0-9]+)?$/)]],
    totalIncome:         [0, [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+([.][0-9]+)?$/)]]
  });

  public averageExpensesForm: FormGroup = this.fb.group({
    livingPlace:    [0, [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+([.][0-9]+)?$/)]],
    feeding:        [0, [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+([.][0-9]+)?$/)]],
    health:         [0, [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+([.][0-9]+)?$/)]],
    lockerRoom:     [0, [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+([.][0-9]+)?$/)]],
    education:      [0, [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+([.][0-9]+)?$/)]],
    transportation: [0, [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+([.][0-9]+)?$/)]],
    recreation:     [0, [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+([.][0-9]+)?$/)]],
    credits:        [0, [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+([.][0-9]+)?$/)]],
    water:          [0, [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+([.][0-9]+)?$/)]],
    light:          [0, [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+([.][0-9]+)?$/)]],
    housePhone:     [0, [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+([.][0-9]+)?$/)]],
    celularPhone:   [0, [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+([.][0-9]+)?$/)]],
    internet:       [0, [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+([.][0-9]+)?$/)]],
    tvCable:        [0, [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+([.][0-9]+)?$/)]],
    otherExpenses:  [0, [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+([.][0-9]+)?$/)]],
    totalExpenses:  [0, [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+([.][0-9]+)?$/)]],
  });
  /* *********************************** -------------------------- *********************************** */
  
  
  /* *********************************** FUNCIONES VARIAS ********************************************* */
  
  loading(){
    this.averageIncomeForm.get('fatherIncome').valueChanges
      .pipe(
        untilComponentDestroyed(this)
      )
      .subscribe( resp => this.totalPlusAverage(resp));
    this.averageIncomeForm.get('motherIncome').valueChanges
      .pipe(
        untilComponentDestroyed(this)
      )
      .subscribe( resp => this.totalPlusAverage(resp));
    this.averageIncomeForm.get('familyIncome').valueChanges
      .pipe(
        untilComponentDestroyed(this)
      )
      .subscribe( resp => this.totalPlusAverage(resp));
    this.averageIncomeForm.get('studentIncome').valueChanges
      .pipe(
        untilComponentDestroyed(this)
      )
      .subscribe( resp => this.totalPlusAverage(resp));
    this.averageIncomeForm.get('partnerContribution').valueChanges
      .pipe(
        untilComponentDestroyed(this)
      )
      .subscribe( resp => this.totalPlusAverage(resp));
    this.averageIncomeForm.get('otherIncome').valueChanges
      .pipe(
        untilComponentDestroyed(this)
      )
      .subscribe( resp => this.totalPlusAverage(resp));
    
    
    this.averageExpensesForm.get('livingPlace').valueChanges
      .pipe(
        untilComponentDestroyed(this)
      )
      .subscribe( resp => this.totalPlusExpenses(resp));
    this.averageExpensesForm.get('feeding').valueChanges
      .pipe(
        untilComponentDestroyed(this)
      )
      .subscribe( resp => this.totalPlusExpenses(resp));
    this.averageExpensesForm.get('health').valueChanges
      .pipe(
        untilComponentDestroyed(this)
      )
      .subscribe( resp => this.totalPlusExpenses(resp));
    this.averageExpensesForm.get('lockerRoom').valueChanges
      .pipe(
        untilComponentDestroyed(this)
      )
      .subscribe( resp => this.totalPlusExpenses(resp));
    this.averageExpensesForm.get('education').valueChanges
      .pipe(
        untilComponentDestroyed(this)
      )
      .subscribe( resp => this.totalPlusExpenses(resp));
    this.averageExpensesForm.get('transportation').valueChanges
      .pipe(
        untilComponentDestroyed(this)
      )
      .subscribe( resp => this.totalPlusExpenses(resp));
    this.averageExpensesForm.get('recreation').valueChanges
      .pipe(
        untilComponentDestroyed(this)
      )
      .subscribe( resp => this.totalPlusExpenses(resp));
    this.averageExpensesForm.get('credits').valueChanges
      .pipe(
        untilComponentDestroyed(this)
      )
      .subscribe( resp => this.totalPlusExpenses(resp));
    this.averageExpensesForm.get('water').valueChanges
      .pipe(
        untilComponentDestroyed(this)
      )
      .subscribe( resp => this.totalPlusExpenses(resp));
    this.averageExpensesForm.get('light').valueChanges
      .pipe(
        untilComponentDestroyed(this)
      )
      .subscribe( resp => this.totalPlusExpenses(resp));
    this.averageExpensesForm.get('housePhone').valueChanges
      .pipe(
        untilComponentDestroyed(this)
      )
      .subscribe( resp => this.totalPlusExpenses(resp));
    this.averageExpensesForm.get('celularPhone').valueChanges
      .pipe(
        untilComponentDestroyed(this)
      )
      .subscribe( resp => this.totalPlusExpenses(resp));
    this.averageExpensesForm.get('internet').valueChanges
      .pipe(
        untilComponentDestroyed(this)
      )
      .subscribe( resp => this.totalPlusExpenses(resp));
    this.averageExpensesForm.get('tvCable').valueChanges
      .pipe(
        untilComponentDestroyed(this)
      )
      .subscribe( resp => this.totalPlusExpenses(resp));
    this.averageExpensesForm.get('otherExpenses').valueChanges
      .pipe(
        untilComponentDestroyed(this)
      )
      .subscribe( resp => this.totalPlusExpenses(resp));
  }

  totalPlusAverage( value: number){
    let total: number = 0;
    let fatherIncome: number = Number(this.averageIncomeForm.get('fatherIncome').value);
    let motherIncome: number = Number(this.averageIncomeForm.get('motherIncome').value);
    let familyIncome: number = Number(this.averageIncomeForm.get('familyIncome').value);
    let studentIncome: number = Number(this.averageIncomeForm.get('studentIncome').value);
    let partnerContribution: number = Number(this.averageIncomeForm.get('partnerContribution').value);
    let otherIncome: number = Number(this.averageIncomeForm.get('otherIncome').value);
    total = fatherIncome + motherIncome + familyIncome + studentIncome + partnerContribution + otherIncome;
    
    this.averageIncomeForm.get('totalIncome').setValue(total);
    this.subTotal();
  }
  
  totalPlusExpenses( value:number ){
    let total: number = 0;
    let livingPlace: number = Number(this.averageExpensesForm.get('livingPlace').value);
    let feeding: number = Number(this.averageExpensesForm.get('feeding').value);
    let health: number = Number(this.averageExpensesForm.get('health').value);
    let lockerRoom: number = Number(this.averageExpensesForm.get('lockerRoom').value);
    let education: number = Number(this.averageExpensesForm.get('education').value);
    let transportation: number = Number(this.averageExpensesForm.get('transportation').value);
    let recreation: number = Number(this.averageExpensesForm.get('recreation').value);
    let credits: number = Number(this.averageExpensesForm.get('credits').value);
    let water: number = Number(this.averageExpensesForm.get('water').value);
    let light: number = Number(this.averageExpensesForm.get('light').value);
    let housePhone: number = Number(this.averageExpensesForm.get('housePhone').value);
    let celularPhone: number = Number(this.averageExpensesForm.get('celularPhone').value);
    let internet: number = Number(this.averageExpensesForm.get('internet').value);
    let tvCable: number = Number(this.averageExpensesForm.get('tvCable').value);
    let otherExpenses: number = Number(this.averageExpensesForm.get('otherExpenses').value);

    total = livingPlace + feeding + health + lockerRoom + education + transportation + recreation + credits + water + light + housePhone + celularPhone + internet + tvCable + otherExpenses;

    this.averageExpensesForm.get('totalExpenses').setValue(total);
    this.subTotal();
  }

  subTotal(){
    const income = this.averageIncomeForm.get('totalIncome').value;
    const expenses = this.averageExpensesForm.get('totalExpenses').value;
    this.global = income - expenses
  }
  /* *********************************** -------------------------- *********************************** */
  
  
  /* ************************************** VALIDACIONES GLOBALES ************************************* */
  
  isValidField( field: string ): boolean | null{
    return this.averageIncomeForm.controls[field].errors
          && this.averageIncomeForm.controls[field].touched;
  }

  getFielError( field: string): string | null {
    if( !this.averageIncomeForm.controls[field] ) return null;
  
    const errors = this.averageIncomeForm.controls[field].errors || {};
  
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
  
  isValidField2( field: string ): boolean | null{
    return this.averageExpensesForm.controls[field].errors
          && this.averageExpensesForm.controls[field].touched;
  }

  getFielError2( field: string): string | null {
    if( !this.averageExpensesForm.controls[field] ) return null;
  
    const errors = this.averageExpensesForm.controls[field].errors || {};
  
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
