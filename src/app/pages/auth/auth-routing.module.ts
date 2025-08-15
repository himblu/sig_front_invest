import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthPageComponent } from './auth-page.component';
import { LoginVinculacionComponent } from './login-vinculacion/login-vinculacion.component';


const routes: Routes = [
  {
    path: '',
    component: AuthPageComponent,
    children: [
      {
        path: 'iniciar-sesion',
        loadComponent: () => import('./login/login.component').then((c) => c.LoginComponent),
        data: { title: 'Iniciar Sesión', module: 'Autenticación'}
      },
      {
        path: 'seleccionar-perfil',
        loadComponent: () => import('./select-profile/select-profile.component').then((c) => c.SelectProfileComponent),
        data: { title: 'Selecciona Perfil', module: 'Autenticación'}
      },
      {
        path: 'seleccionar-carrera',
        loadComponent: () => import('./select-career/select-career.component').then((c) => c.SelectCareerComponent),
        data: { title: 'Selecciona Carrera', module: 'Autenticación'}
      },
      { path: 'registro',
        loadComponent: () => import('./sign-up/sign-up.component').then((c) => c.SignUpComponent),
        data: { title: 'Registro', module: 'Autenticación'}
      },
      { path: 'registro-manual',
        loadComponent: () => import('./manual-sign-up/manual-sign-up.component').then((c) => c.ManualSignUpComponent),
        data: { title: 'Registro Manual', module: 'Autenticación'}
      },
      { path: 'recupera-clave',
        loadComponent: () => import('./remember-password/remember-password.component').then((c) => c.RememberPasswordComponent ),
        data: { title: 'Recupera Clave', module: 'Autenticación'}
      },
			{ path: 'login-vinculacion',
        loadComponent: () => import('./login-vinculacion/login-vinculacion.component').then((c) => c.LoginVinculacionComponent),
        data: { title: 'Login Vinculación', module: 'Autenticación'}
      },
      { 
        path: 'iniciar-sesion-encuesta',
        loadComponent: () => import('./sign-up-survey/sign-up-survey.component').then((c) => c.SignUpSurveyComponent),
        data: { title: 'Inicio de Sesión de Encuesta', module: 'Autenticación'}
      },
			{ path: 'registro-vinculacion',
        loadComponent: () => import('./sign-up-vinculacion/sign-up-vinculacion.component').then((c) => c.SignUpVinculacionComponent),
        data: { title: 'Registro Vinculación', module: 'Autenticación'}
      },
      { path: 'cambiar-clave',
        loadComponent: () => import('./change-password/change-password.component').then((c) => c.ChangePasswordComponent),
        data: { title: 'Registro Vinculación', module: 'Autenticación'}
      },
      {
        path: '**',
        redirectTo: 'iniciar-sesion'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
