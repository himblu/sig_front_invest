import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@services/guards/auth.guard';
import { HomeComponent } from '../home.component';
import {ListParticpantsComponent} from './list-particpants/list-particpants.component';

const routes: Routes = [
  {
    path: '',
    // canActivate:[ AuthGuard ],
    component: HomeComponent,
    children:[
      {
        path: 'administracion-de-usuarios',
        loadComponent: () => import('./management-user/management-user.component').then((c) => c.ManagementUserComponent),
        data: { title: 'Administración de Usuarios', module: 'Educación Continua - Servicios Especializados'}
      },
      {
        path: 'administracion-de-cursos',
        loadComponent: () => import('./management-course/management-course.component').then((c) => c.ManagementCourseComponent),
        data: { title: 'Administración de Cursos', module: 'Educación Continua - Servicios Especializados'}
      },
      {
        path: 'asignacion-de-cursos',
        loadComponent: () => import('./assignment-of-course/assignment-of-course.component').then((c) => c.AssignmentOfCourseComponent),
        data: { title: 'Asignación de Cursos', module: 'Educación Continua - Servicios Especializados'}
      },
      {
        path: 'asignacion-de-cursos/:assignmentID',
        loadComponent: () => import('./assignment-of-course-new/assignment-of-course-new.component').then((c) => c.AssignmentOfCourseNewComponent),
        data: { title: 'Detalle de Asignación de Cursos', module: 'Educación Continua - Servicios Especializados'}
      },
      {
        path: 'administracion-de-docentes',
        loadComponent: () => import('./management-teacher/management-teacher.component').then((c) => c.ManagementTeacherComponent),
        data: { title: 'Administración de Docentes', module: 'Educación Continua - Servicios Especializados'}
      },
      {
        path: 'validacion-de-pagos',
        loadComponent: () => import('./validate-payment/validate-payment.component').then((c) => c.ValidatePaymentComponent),
        data: { title: 'Validación de Pagos', module: 'Educación Continua - Servicios Especializados'}
      },
      {
        path: 'reporteria',
        loadComponent: () => import('./report-unacem/report-unacem.component').then((c) => c.ReportUnacemComponent),
        data: { title: 'Reportería', module: 'Educación Continua - Servicios Especializados'}
      },
			{
        path: 'reportes-secretaria',
        loadComponent: () => import('./secretary-reports/secretary-reports.component').then((c) => c.SecretaryReportsComponent),
        data: { title: 'Reportes Secretaría', module: 'Educación Continua - Servicios Especializados'}
      },
      { path: 'administracion-de-notas-del-curso',
        loadComponent: () => import('./management-score-of-course/management-score-of-course.component').then((c) => c.ManagementScoreOfCourseComponent),
        data: { title: 'Administración de Notas del Curso', module: 'Educación Continua - Servicios Especializados'}
      },
      { path: 'administracion-de-notas-del-curso-a-detalle/:teacherID/:periodID/:classSectionNumber',
        loadComponent: () => import('./management-score-of-course-detail/management-score-of-course-detail.component').then((c) => c.ManagementScoreOfCourseDetailComponent),
        data: { title: 'Administración de Notas del Curso', module: 'Educación Continua - Servicios Especializados'}
      },
      { path: 'generacion-de-certificados-de-unacem',
        loadComponent: () => import('./certificate-generation-of-unacem/certificate-generation-of-unacem.component').then((c) => c.CertificateGenerationOfUnacemComponent),
        data: { title: 'Generación de Certificado', module: 'Educación Continua - Servicios Especializados'}
      },
      { path: 'informacion-academica-del-curso',
        loadComponent: () => import('./academic-info-course/academic-info-course.component').then((c) => c.AcademicInfoCourseComponent),
        data: { title: 'Información Académica del Estudiante', module: 'Educación Continua - Servicios Especializados'}
      },
      { path: 'administracion-de-contratistas',
        loadComponent: () => import('./contractor-management/contractor-management.component').then((c) => c.ContractorManagementComponent),
        data: { title: 'Administración de Contratistas', module: 'Educación Continua - Servicios Especializados'}
      },
      { path: 'administracion-de-contratistas/:contractorID',
        loadComponent: () => import('./contractor-management-new/contractor-management-new.component').then((c) => c.ContractorManagementNewComponent),
        data: { title: 'Detalle de Contratista ', module: 'Educación Continua - Servicios Especializados'}
      },
      { path: 'oferta-academica',
        loadComponent: () => import('./academic-offer/academic-offer.component').then((c) => c.AcademicOfferComponent),
        data: { title: 'Oferta Académica de Cursos', module: 'Educación Continua - Servicios Especializados'}
      },
			{ path: 'list-participants',
				loadComponent: () => import('./list-particpants/list-particpants.component').then((c) => c.ListParticpantsComponent),
				data: { title: 'Particiapntes', module: 'Educación Continua - Servicios Especializados'}
			},
			{ path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then((c) => c.DashboardComponent),
        data: { title: 'Dashboard', module: 'Educación Continua - Servicios Especializados'}
      },
			{
        path: 'lista-negra',
        loadComponent: () => import('./black-list/black-list.component').then((c) => c.BlackListComponent),
        data: { title: 'Lista Negra', module: 'Educación Continua - Servicios Especializados'}
      },
      {
        path: '',
        redirectTo: '',
        pathMatch: 'full'
      },
      {
        path: '**',
        redirectTo: '404'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UnacemRoutingModule { }
