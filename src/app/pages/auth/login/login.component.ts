import { Router, RouterModule } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import { CommonService } from '@services/common.service';
import { LoginService } from '@services/login.service';
import { MatButtonModule } from '@angular/material/button';
import { AdministrativeService } from '@services/administrative.service';
import Swal from 'sweetalert2';
import { environment } from '@environments/environment';
import { CommonModule } from '@angular/common';
import { localToSessionStorage } from '@utils/functions';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule
  ],
  standalone: true
})

export class LoginComponent extends OnDestroyMixin implements OnInit, OnDestroy{

	public backgroundImage: string= environment.loginBackground;
  public matcher = new MyErrorStateMatcher();

  constructor( private fb:FormBuilder,
    private loginService: LoginService,
    private common:CommonService,
    private Administrative: AdministrativeService,
    private Router: Router
  ){
		super();
		if(sessionStorage.getItem('userId') || localStorage.getItem('userId')) this.Router.navigateByUrl('/');
	}

  public loginForm:FormGroup = this.fb.group({
    p_userName:       [(localStorage.getItem('email') === 'invitado' ? '' : localStorage.getItem('email')) || '', [Validators.required]],
    p_userPassword:   ['', [Validators.required, Validators.minLength(5)]],
    remember:        [localStorage.getItem('remember') || false]
  });

  emailFormControl = new FormControl('', [Validators.required]);
  passwordFormControl = new FormControl('', [Validators.required, Validators.minLength(5)]);

  isProduction: boolean = true;
  ngOnInit(): void {
    sessionStorage.clear();
		localStorage.clear();
    this.getEnvironmentSetting();
  }

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

  async getEnvironmentSetting() {
    let result: any = await this.Administrative.getSystemVariableByIdentifier('IP_ENVIRONMENT', 'dont').toPromise();
    if (!result) {
      result = {
        evsaToken: environment.url
      };
    }
    this.isProduction = environment.url.includes(result.evsaToken);
  }

  async onSubmit(){
    if(this.loginForm.valid){
      let data: any = await this.loginService.loginWeb(this.loginForm.value).toPromise();
      if (data.message) {
        Swal.fire({
          text: data.message,
          icon: 'error'
        });
        return;
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('mail', data.user.userEmail);
        localStorage.setItem('name', data.user.userName);
        localStorage.setItem('personID', String(data.user.PersonId));
        localStorage.setItem('img', data.user.userImg);
        localStorage.setItem('id', String(data.user.PersonId));
        localStorage.setItem('userId', String(data.user.userId));
        if (!data.user.changePassword) {
					localToSessionStorage();
          this.Router.navigate(['/autenticacion/cambiar-clave']);
        } else {
          let profiles: any = await this.Administrative.getUserProfiles(data.user.PersonId).toPromise();
          if (!profiles.length) {
            Swal.fire({
              text: 'No cuentas con perfiles para ingresar al Sistema de ITCA',
              icon: 'error'
            });
            return;
          } else {
            if (profiles.length === 1) {
              if (profiles[0].rolID === 5) {
                let careers: any = await this.Administrative.getCareerByPerson(data.user.PersonId).toPromise();
                careers = careers.filter((c: any) => c.currentCareer === 'Y');
                localStorage.setItem('rol', profiles[0].rolName);
                localStorage.setItem('rolID', String(profiles[0].rolID));
                if (careers.length === 0) {
                  // POSTULANTE
									localToSessionStorage();
                  this.Router.navigateByUrl('/administracion').then();
                } else {
                  if (careers.length === 1) {
                    localStorage.setItem('careerID', careers[0].careerID);
                    localStorage.setItem('career', careers[0].careerName);
                    localStorage.setItem('studentID', careers[0].studentID);
										localStorage.setItem('cycle', careers[0].cycle);
										localToSessionStorage();
                    this.Router.navigateByUrl('/administracion').then();
                  } else {
                    localStorage.setItem('careers', JSON.stringify(careers));
										localToSessionStorage();
                    this.Router.navigateByUrl('/autenticacion/seleccionar-carrera').then();
                  }
                }
              } else {
                localStorage.setItem('rol', profiles[0].rolName);
                localStorage.setItem('rolID', String(profiles[0].rolID));
                // let menu: any = await this.Administrative.getMenuOfUserIDAndRolIDAndCompanyID(data.user.userId, profiles[0].rolID, 1).toPromise();
								localToSessionStorage();
                this.Router.navigateByUrl('/administracion').then();
              }
            } else {
							localToSessionStorage();
              this.Router.navigateByUrl('/autenticacion/seleccionar-perfil').then();
            }
          }
        }
      }
    }else{
      this.common.message('Formulario incompleto!','Revise los campos en color rojo y completelos!', 'error', '#f5637e');
    }
  }

}
