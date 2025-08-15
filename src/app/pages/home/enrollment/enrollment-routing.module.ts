import { AuthGuard } from '@services/guards/auth.guard';
import { Directive, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../home.component';
import { EnrollmentSchoolResolver } from './pages/enrollment-school/services/resolvers/enrollment-school.resolver';
import { SocioeconomicResolver } from './pages/socioeconomic-sheet/services/resolvers/socioeconomic-sheet.resolver';
import { UploadDocumentsResolver } from './pages/upload-documents/services/resolvers/upload-documents.resolver';
import { VerifyGuard } from '@services/guards/verify.guard';
import { subjectReportGuard } from '@services/guards/subject-report.guard';
import { CheckProcessUserGuard, EnrollmentGuard, PersonalDocumentsGuard, ProofPaymentGuard, SocioEconomicSheetGuard } from '@services/guards/enrollment-process.guard';


const routes: Routes = [{
  path:'',
  canActivate:[AuthGuard],
  component: HomeComponent,
  children:[
    {
      path:'',
      canActivate: [CheckProcessUserGuard],
      loadComponent: () => import('./pages/start/start.component').then( c => c.StartComponent),
      data: { title: '', module: 'Matrículas'}
    },
    {
      path:'datos-estudiante',
      canActivate: [CheckProcessUserGuard],
      data:{ title:'Datos Personales Estudiante', module: 'Matrículas', parameter: '06', ruta:'/inicio', unidad:'2'},
      loadComponent: () => import('./pages/student-data/student-data.component').then( c => c.StudentDataComponent),
    },
    {
      path:'ficha-socioeconomica',
      canActivate: [SocioEconomicSheetGuard],
      data:{ title: 'Ficha Socioeconómica', module:'Matrículas', parameter: '01', ruta:'/matriculacion/datos-estudiante', unidad:'1'},
      loadComponent: () => import('./pages/socioeconomic-sheet/socioeconomic-sheet.component').then( c => c.SocioeconomicSheetComponent),
       resolve: {
        resolver: SocioeconomicResolver
      }
    },
    {
      path: 'carga-de-documentos',
      canActivate: [PersonalDocumentsGuard],
      data: { title: 'Registro de Documentos', module: 'Matrículas', parameter: '02', ruta:'/matriculacion/ficha-socioeconomica', unidad:'1'},
      loadComponent: () => import('./pages/upload-documents/upload-documents.component').then(c => c.UploadDocumentsComponent),
      resolve: {
        resolver: UploadDocumentsResolver
      },
    },
    {
      path:'matricula',
      canActivate: [EnrollmentGuard],
      data: { title:'Matrícula', module: 'Matrículas', parameter: '03', ruta:'/matriculacion/carga-de-documentos', unidad:'1'},
      resolve: {
        resolver: EnrollmentSchoolResolver
      },
      loadComponent: () => import('./pages/enrollment-school/enrollment-school.component').then( c => c.EnrollmentSchoolComponent),
    },

    {
      path:'pago-matricula',
      loadComponent: () => import('./pages/pay-enrollment/pay-enrollment.component').then(c => c.PayEnrollmentComponent),
      canActivate: [ProofPaymentGuard],
      data: { title:'Pago Matrícula', module: 'Matrículas', parameter: '04', ruta:'/matriculacion/matricula', unidad:'1'},
      resolve: {
        resolver: EnrollmentSchoolResolver
      }
    },
    {
      path: 'carga-de-documentos',
      loadComponent: () => import('./pages/upload-documents/upload-documents.component').then(c => c.UploadDocumentsComponent),
      canActivate: [PersonalDocumentsGuard],
      data: { title: 'Registro de Documentos', module: 'Matrículas'},
      resolve: {
        resolver: UploadDocumentsResolver
      }
    },
    {
      path: '**',
      redirectTo: ''
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EnrollmentRoutingModule { }
