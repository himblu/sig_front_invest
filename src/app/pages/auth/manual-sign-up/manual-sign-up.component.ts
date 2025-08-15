import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import {ErrorStateMatcher} from '@angular/material/core';
import { CommonService } from '@services/common.service';
import { LoginService } from '@services/login.service';
import { NgIf } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';


export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-manual-sign-up-registration',
  templateUrl: './manual-sign-up.component.html',
  styleUrls: ['./manual-sign-up.component.css'],
  imports: [
    NgIf,
    ReactiveFormsModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule
  ],
  standalone: true
})

export class ManualSignUpComponent {

  /* *************************************** INPUTS & OUTPUTS ***************************************** */

  /* *************************************** ---------------- ***************************************** */


  /* *********************************** VARIABLES GLOBALES ******************************************* */

  cargando: boolean = false;

  matcher = new MyErrorStateMatcher();
  /* *********************************** ------------------ ******************************************* */


  /* *********************************** COSTRUCTOR Y CICLO DE VIDA *********************************** */

  constructor( private dateAdapter: DateAdapter<Date>,
                private fb: FormBuilder,
                private login: LoginService,
                private common: CommonService ){
      // this.dateAdapter.setLocale('en-GB'); //dd/MM/yyyy
    }
  /* *********************************** -------------------------- *********************************** */


  /* *********************************** GETERS Y SETERS ********************************************** */

  /* *********************************** -------------------------- *********************************** */


  /* *********************************** FORMULARIOS DEL FORMULARIO *********************************** */
    emailFormControl = new FormControl('', [Validators.required, Validators.email]);
    acceptFormControl = new FormControl(false, [Validators.required]);
    celularFormControl = new FormControl('', [Validators.required, Validators.pattern('^[0-9,$]*$'), Validators.maxLength(10), Validators.minLength(10)]);

  personForm: FormGroup = this.fb.group({
    calleDomicilio:       [ ''],
    cedula:               [ , [Validators.required]],
    conyuge:              [ ''],
    estadoCivil:          [ , [Validators.required]],
    fechaCedulacion:      [ ''],
    fechaNacimiento:      [ , [Validators.required]],
    genero:               [ , [Validators.required]],
    instruccion:          [ ''],
    lugarDomicilio:       [ ''],
    lugarNacimiento:      [ ''],
    nacionalidad:         [ , [Validators.required]],
    nombre:               [ , [Validators.required]],
    nombreMadre:          [ ''],
    nombrePadre:          [ ''],
    numeracionDomicilio:  [ ''],
    profesion:            [ ''],
    tipoDocumento:        [ , [Validators.required, Validators.min(1)]],

  });

  public registerForm:FormGroup = this.fb.group({
    email:       ['', [Validators.required, Validators.email]],
    id_person:   ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
    celular:     ['', [ Validators.minLength(10), Validators.maxLength(10)]],
    accept:      [false]
  });

  /* *********************************** -------------------------- *********************************** */


  /* *********************************** FUNCIONES VARIAS ********************************************* */

  onSubmit(){

    if(this.personForm.valid){

      this.registerForm.controls['email'].patchValue(this.emailFormControl.value);
      this.registerForm.controls['id_person'].patchValue(this.personForm.get('cedula')?.value);
      this.registerForm.controls['celular'].patchValue(this.celularFormControl.value);
      this.registerForm.controls['accept'].patchValue(this.acceptFormControl.value);
      if(this.acceptFormControl.value){
        this.cargando=true;
        const data: any = {'user':this.registerForm.value, 'person':this.personForm.value};
        this.login.personRegister(data)
          .subscribe( (resp:any) => {
            //console.log(resp);
            this.common.message(resp.success,'','success', '#86bc57')
            this.cargando=false;
          })
      }else{
        this.common.message('Debe acceptar Terminos y Condiciones.','','error','#f5637e');
      }
    }else{
      this.common.message('Verificar que la información este completa.','No debe existir campos en color rojo','error','#f5637e');
    }
  }

  /* *********************************** -------------------------- *********************************** */
}
