import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { EnrollmentService } from '@services/enrollment.service';

@Component({
  selector: 'FSE-housing-information',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIf, 
    NgFor,
    ReactiveFormsModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './housing-information.component.html',
  styles: [
  ]
})
export class HousingInformationComponent implements OnInit{

  /* *************************************** INPUTS & OUTPUTS ***************************************** */
  
  /* *************************************** ---------------- ***************************************** */
  
  
  /* ************************************ LISTAS GETTERS SETTERS ************************************** */
  
  /* *********************************** ------------------ ******************************************* */
  
  
  /* *********************************** VARIABLES GLOBALES ******************************************* */
  
  typeHouseList: string[] = ['casa', 'departamento'];
  /* *********************************** ------------------ ******************************************* */
  
  
  /* *********************************** COSTRUCTOR Y CICLO DE VIDA *********************************** */
  
  constructor( private fb: FormBuilder,
                private enrollment: EnrollmentService ){}
  
  ngOnInit(): void {
  
  }
  
  /* *********************************** -------------------------- *********************************** */
  
  
  /* *********************************** GETERS Y SETERS ********************************************** */
  
  /* *********************************** -------------------------- *********************************** */
  
  
  /* *********************************** FORMULARIOS DEL FORMULARIO *********************************** */
  
  public houseForm: FormGroup = this.fb.group({
    typeHouse:    ['', [Validators.required]],
    addressHouse: ['', [Validators.required]],
    location:     ['', [Validators.required]],
    services:     this.fb.array([]),
    menInhabit:   [0, [Validators.required, Validators.min(0)]],
    womenInhabit: [0, [Validators.required, Validators.min(0)]],
    health: ['', Validators.required],
    bachelor:    [''],
    thirdLevel:  [''],
    fourthLevel: [''],
  });


  toppings = new FormControl('');
  toppingList: string[] = ['Agua', 'Luz', 'Teléfono', 'TvCable', 'Internet'];
  /* *********************************** -------------------------- *********************************** */
  
  
  /* *********************************** FUNCIONES VARIAS ********************************************* */
  
  /* *********************************** -------------------------- *********************************** */
  
  
  /* ************************************** VALIDACIONES GLOBALES ************************************* */
  
  isValidField( field: string ): boolean | null{
    return this.houseForm.controls[field].errors
          && this.houseForm.controls[field].touched;
  }

  getFielError( field: string): string | null {
    if( !this.houseForm.controls[field] ) return null;
  
    const errors = this.houseForm.controls[field].errors || {};
  
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
