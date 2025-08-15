import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';

import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonService } from '@services/common.service';

@Component({
  selector: 'app-levels',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIf,
    NgFor,
    ReactiveFormsModule,
    MatButtonModule,
    MatDividerModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatNativeDateModule
  ],
  templateUrl: './levels.component.html',
  styles: [
  ],
  providers:[
    DatePipe
  ]
})
export class LevelsComponent implements OnInit{


  /* *************************************** INPUTS & OUTPUTS ***************************************** */
  
  /* *************************************** ---------------- ***************************************** */
  
  
  /* ************************************ LISTAS GETTERS SETTERS ************************************** */
  
  get dynamicArr(): FormArray {
    return this.levelsForm.get('levels') as FormArray;
  }
  /* *********************************** ------------------ ******************************************* */
  
  
  /* *********************************** VARIABLES GLOBALES ******************************************* */
  
  /* *********************************** ------------------ ******************************************* */
  
  
  /* *********************************** COSTRUCTOR Y CICLO DE VIDA *********************************** */
  
  constructor( private fb:FormBuilder,
                private common: CommonService,
                private dateAdapter: DateAdapter<Date>,
                private datePipe: DatePipe, ){
    this.dateAdapter.setLocale('en-GB'); //dd/MM/yyyy
  }
  
  ngOnInit(): void {
    this.addForm();
  }
  
  /* *********************************** -------------------------- *********************************** */
  
  
  /* *********************************** GETERS Y SETERS ********************************************** */
  
  /* *********************************** -------------------------- *********************************** */
  
  
  /* *********************************** FORMULARIOS DEL FORMULARIO *********************************** */
  
  public levelsForm!: FormGroup;

  private addForm(): void {
    this.levelsForm = this.fb.group({
      cycleName: [this.myForm.get('cycleName')?.value, Validators.required],
      startDate: [this.myForm.get('startDate')?.value, Validators.required],
      endDate:   [this.myForm.get('endDate')?.value, Validators.required],
      levels:    this.fb.array([])
    });
  }

  public myForm: FormGroup = this.fb.group({
    cycleName:       ['', Validators.required],
    startDate:       ['', Validators.required],  
    endDate:         ['', Validators.required],  
    levelID:         [0],
    levelName:       ['', [Validators.required]],
    teachingContact: [80, [Validators.required, Validators.min(80)]]
  });

  /* *********************************** -------------------------- *********************************** */
  
  
  /* *********************************** FUNCIONES VARIAS ********************************************* */
  
  charging(){
    if( !this.myForm.valid ){
      this.myForm.markAllAsTouched();
      this.common.message('No se puede agregar Periodo','Revisar campos en color rojo', 'warning', '#d3996a');
      return;
    }

    const form: any = this.myForm.value;
    const level: FormGroup = this.fb.group({
      levelID:              [form.levelID],
      levelName:            [form.levelName, [Validators.required]],
      teachingContact:      [form.teachingContact, [Validators.required, Validators.min(10)]]

    });

    this.dynamicArr.push(level);
    this.myForm.get('levelName')?.setValue('');
    this.myForm.get('teachingContact')?.setValue(80);
  }

  public deleteDynamic(index: number): void {   
    this.dynamicArr.removeAt(index);
  }

  saveLevels(){
    if(this.dynamicArr.length > 0){
      this.levelsForm.get('cycleName')?.setValue( this.myForm.get('cycleName')?.value);
      this.levelsForm.get('startDate')?.setValue( this.formattedDate(new Date(this.myForm.get('startDate')?.value)));
      this.levelsForm.get('endDate')?.setValue( this.formattedDate(new Date(this.myForm.get('endDate')?.value)));
      if(!this.levelsForm.valid){
        this.levelsForm.markAllAsTouched();
        return;
      }
      this.common.saveLevel(this.levelsForm.value)
        .subscribe( (resp:any) => {
        })
    }else{
      this.common.message('No se puede Guardar','Debe agregar por lo menos un Periodo', 'error', '#f5637e');
    }
  }
  /* *********************************** -------------------------- *********************************** */


  /* ****************************************** VALIDACIONES ****************************************** */

  private formattedDate(date: Date): string {
    return <string>this.datePipe.transform(date, 'yyyy-MM-dd');
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
  /* *********************************** -------------------------- *********************************** */
}
