import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { MatStepperModule } from '@angular/material/stepper';
import { NgIf, UpperCasePipe, NgForOf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ComboComponent } from '../../enrollment/pages/components/combo/combo.component';
import { RrhhService } from '@services/rrhh.service';
import { Router } from '@angular/router';
import { CommonService } from '@services/common.service';
import { Identity } from '@utils/interfaces/others.interfaces';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styles: [
  ],
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    NgForOf,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatTooltipModule,
    MatButtonModule,
    MatStepperModule,
    NgxMaskDirective,
    MatDatepickerModule,
    ComboComponent,
    MatNativeDateModule,
    MatCheckboxModule
],
  providers: [
    provideNgxMask()
  ]
})
export class CreateUserComponent {

  /* *************************************** INPUTS & OUTPUTS ***************************************** */

  /* *************************************** ---------------- ***************************************** */


  /* ************************************ LISTAS GETTERS SETTERS ************************************** */

  /* *********************************** ------------------ ******************************************* */


  /* *********************************** VARIABLES GLOBALES ******************************************* */
  testPattern = {
    S: { pattern: new RegExp('[A-Za-z0-9]') },
  };
  phone = {
    S: { pattern: new RegExp('[+0-9]') },
  };



  formUser: FormGroup;
  personID: number = 0;
  positions: any[] = [];
  campus: any[] = [];


  get identityList(): Identity[] {
    return this.common.identityList;
  }
  /* *********************************** ------------------ ******************************************* */


  /* *********************************** COSTRUCTOR Y CICLO DE VIDA *********************************** */

  constructor( private fb: FormBuilder,
    private rrhh: RrhhService,
    private router: Router,
    private common: CommonService
    ){}

  ngOnInit(): void {
    this.initForm();
    this.common.charging();
    console.log(this.identityList);
    this.loadInformation();

  }


 loadInformation(){
  this.rrhh.getPositionContract().subscribe({
    next: (resp: any) => {
      console.log(resp);
      this.positions = resp;
    }
  })

  this.rrhh.getCampus().subscribe({
    next: (resp: any) => {
      console.log(resp);
      this.campus = resp;
    }
  })
  // this.common.identityList().subscribe({
  //   next: (resp: any) => {
  //     this.identityList = resp;
  //     console.log(this.identityList);
  //   },
  //   error: (err: any) => {
  //     console.log('err',err);
  //   }
  // })
 }
  /* *********************************** -------------------------- *********************************** */


  /* *********************************** GETERS Y SETERS ********************************************** */

  /* *********************************** -------------------------- *********************************** */


  /* *********************************** FORMULARIOS DEL FORMULARIO *********************************** */

  /* *********************************** -------------------------- *********************************** */


  /* *********************************** FUNCIONES VARIAS ********************************************* */

  valid( valid: boolean, form: string ){

  }
  chargeID( personID: number ){
    this.personID = personID;
  }
  initForm(){
    this.formUser = this.fb.group({
      typeDocId: ['', [Validators.required]],
      personDocumentNumber: ['', Validators.required],
      personFirstName: ['', [Validators.required]],
      personMiddleName: ['', [Validators.required]],
      personLastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      contratDate: ['', [Validators.required]],
      sendMail: [1, [Validators.required]],
      user: [''],
    });
  }


isValidField( field: string ): boolean | null{
  return this.formUser.controls[field].errors
        && this.formUser.controls[field].touched;
}


getFielError( field: string): string | null {
  if( !this.formUser.controls[field] ) return null;

  const errors = this .formUser.controls[field].errors || {};

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

saveUser(){
  if( this.formUser.invalid ){
    this.formUser.markAllAsTouched();
    return;
  }
  this.rrhh.postCollaborator(this.formUser.value)
    .subscribe({
      next: (resp: any) => {
        console.log('resp',resp);
        if(resp.length>0){
          if(resp[0].error){
            this.common.message(resp[0].message,'','error','#2eb4d8');
          }else{
            this.personID = resp.personID;
					this.common.message('Se ha registrado un colaborador de manera exitosa','','success','#2eb4d8');
        	this.router.navigate(['/talento-humano/perfil-docente']);

          }
        }
      },
      error: (err: any) => {
        console.log('err',err);
      }
    })
}
  /* *********************************** -------------------------- *********************************** */
}
