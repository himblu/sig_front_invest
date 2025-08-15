import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { CommonService } from '@services/common.service';
import { EnrollmentService } from '@services/enrollment.service';

import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { Instruction, Profession } from '@utils/interfaces/enrollment.interface';


@Component({
  selector: 'FSE-family-group',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, 
    NgIf,
    NgFor,
    ReactiveFormsModule,
    MatButtonModule,
    MatDividerModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './family-group.component.html',
  styles: [
  ]
})
export class FamilyGroupComponent {

  /* *************************************** INPUTS & OUTPUTS ***************************************** */
  @Output() validForm: EventEmitter<boolean> = new EventEmitter();
  /* *************************************** ---------------- ***************************************** */
  
  
  /* ************************************ LISTAS GETTERS SETTERS ************************************** */
  
  /* *********************************** ------------------ ******************************************* */
  
  
  /* *********************************** VARIABLES GLOBALES ******************************************* */
  
  cargando: boolean=false;
  valid: boolean=false;
  /* *********************************** ------------------ ******************************************* */
  
  
  /* *********************************** COSTRUCTOR Y CICLO DE VIDA *********************************** */
  
  constructor( private fb: FormBuilder,
                private enrollment: EnrollmentService,
                private common: CommonService ){}
  
  ngOnInit(): void {
    this.charging();
  }
  
  /* *********************************** -------------------------- *********************************** */
  
  
  /* *********************************** GETERS Y SETERS ********************************************** */
  
  get instructionList(): Instruction[]{
    return this.enrollment.listInstruction;
  }

  get professionList(): Profession[]{
    return this.enrollment.listProfession;
  }
  /* *********************************** -------------------------- *********************************** */
  
  
  /* *********************************** FORMULARIOS DEL FORMULARIO *********************************** */
  
  groupForm: FormGroup = this.fb.group({
    fatherName:     ['', [Validators.required]],
    professionF:    ['', [Validators.required]],
    instructionF:   ['', [Validators.required]],
    motherName:     ['', [Validators.required]],
    professionM:    ['', [Validators.required]],
    instructionM:   ['', [Validators.required]],
    numberChildren: ['', [Validators.required]],
    men:            ['', [Validators.required]],
    woman:          ['', [Validators.required]]
  });
  /* *********************************** -------------------------- *********************************** */
  
  
  /* *********************************** FUNCIONES VARIAS ********************************************* */
  
  async charging(){
    this.cargando=true;
    await this.enrollment.charging();
    this.cargando=false;
  }
  saveData(){
    if(!this.groupForm.valid){
      this.groupForm.markAllAsTouched();
      this.common.message('Formulario Incompleto','Revise que ningún campo este en color rojo', 'warning', '#d3996a');
      return;
    }
    this.cargando=true;
    this.validForm.emit(true);
    this.valid=true;
    this.cargando=false;
  }
  /* *********************************** -------------------------- *********************************** */
  
  
  /* ************************************** VALIDACIONES GLOBALES ************************************* */
  
  
  isValidField( field: string ): boolean | null{
    return this.groupForm.controls[field].errors
          && this.groupForm.controls[field].touched;
  }

  getFielError( field: string): string | null {
    if( !this.groupForm.controls[field] ) return null;

    const errors = this .groupForm.controls[field].errors || {};

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

  /* *********************************** -------------------------- *********************************** */
}
