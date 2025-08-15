import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InscriptionPageComponent } from './inscription-page.component';
import { PersonalInfoComponent } from './personal-info/personal-info.component';
import { ContactInfoComponent } from './contact-info/contact-info.component';
import { DisabilityInfoComponent } from './disability-info/disability-info.component';
import { AcademicInfoComponent } from './academic-info/academic-info.component';
import { FileInfoComponent } from './file-info/file-info.component';


const routes: Routes = [
  {
    path: '',
    component: InscriptionPageComponent,
    children: [
      {
        path: 'informacion-personal',
        component: PersonalInfoComponent,
        data: { title: 'Información Personal', module: 'Inscripción'}
      },
      {
        path: 'informacion-personal/:userId',
        component: PersonalInfoComponent,
        data: { title: 'Información Personal', module: 'Inscripción'}
      },
      {
        path: 'informacion-de-contacto/:userId',
        component: ContactInfoComponent,
        data: { title: 'Información de Contacto', module: 'Inscripción'}
      },
      {
        path: 'informacion-de-discapacidad/:userId',
        component: DisabilityInfoComponent,
        data: { title: 'Información de Discapacidad', module: 'Inscripción'}
      },
      {
        path: 'informacion-academica/:userId',
        component: AcademicInfoComponent,
        data: { title: 'Información Académica', module: 'Inscripción'}
      },
      {
        path: 'informacion-de-archivos/:userId',
        component: FileInfoComponent,
        data: { title: 'Información Documentaria', module: 'Inscripción'}
      },
      {
        path: 'comprobantes-de-pago/:userId/:fileType',
        component: FileInfoComponent,
        data: { title: 'Información Financiera', module: 'Inscripción'}
      },
      // { path: 'registro',
      //   loadComponent: () => import('./sign-up/sign-up.component').then((c) => c.SignUpComponent),
      //   data: { title: 'Registro', module: 'Autenticación'}
      // },
      // { path: 'registro-manual',
      //   loadComponent: () => import('./manual-sign-up/manual-sign-up.component').then((c) => c.ManualSignUpComponent),
      //   data: { title: 'Registro Manual', module: 'Autenticación'}
      // },      
      // { path: 'recupera-clave',
      //   loadComponent: () => import('./remember-password/remember-password.component').then((c) => c.RememberPasswordComponent ),
      //   data: { title: 'Recupera Clave', module: 'Autenticación'}
      // },
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
export class InscriptionRoutingModule { }
