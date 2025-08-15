import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@services/guards/auth.guard';
import { HomeComponent } from '../home.component';

const routes: Routes = [
  {
    path: '',
    // canActivate:[ AuthGuard ],
    component: HomeComponent,
    children:[
      {
        path: 'beca',
        loadComponent: () => import('./scholarship/scholarship.component').then((c) => c.ScholarshipComponent),
        data: { title: 'Administración de Becas', module: 'Administrativo'}
      },
      {
        path: 'calendario',
        loadComponent: () => import('./academic-calendar/academic-calendar.component').then((c) => c.AcademicCalendarComponent),
        data: { title: 'Calendario Administrativo', module: 'Administrativo'}
      },
      {
        path: 'carreras',
        loadComponent: () => import('./career/career.component').then((c) => c.CareerComponent),
        data: { title: 'Carreras', module: 'Administrativo'}
      },
      {
        path: 'coordinaciones',
        loadComponent: () => import('./coordinations/coordinations.component').then((c) => c.CoordinationsComponent),
        data: { title: 'Coordinaciones', module: 'Administrativo'}
      },
      {
        path: 'distributivo',
        loadComponent: () => import('./distributive/distributive.component').then((c) => c.DistributiveComponent),
        data: { title: 'Distributivo', module: 'Administrativo'}
      },
      {
        path: 'festivos',
        loadComponent: () => import('./holidays/holidays.component').then((c) => c.HolidaysComponent),
        data: { title: 'Festivos', module: 'Administrativo'}
      },
      {
        path: 'escuelas',
        loadComponent: () => import('./schools/schools.component').then((c) => c.SchoolsComponent),
        data: { title: 'Escuelas', module: 'Administrativo'}
      },
      {
        path: 'periodos',
        loadComponent: () => import('./academic-period/academic-period.component').then((c) => c.AcademicPeriodComponent),
        data: { title: 'Periodos Académicos', module: 'Administrativo'}
      },
      {
        path: 'campus',
        loadComponent: () => import('./campus/campus.component').then((c) => c.CampusComponent),
        data: { title: 'Administración', module: 'Administrativo'}
      },
      {
        path: 'sede',
        loadComponent: () => import('./sede/sede.component').then((c) => c.SedeComponent),
        data: { title: 'Sede', module: 'Administrativo'}
      },
      {
        path: 'modalidad',
        loadComponent: () => import('./modalities/modalities.component').then((c) => c.ModalitiesComponent),
        data: { title: 'Modalidad', module: 'Administrativo'}
      },
      {
        path: 'edificio',
        loadComponent: () => import('./building/building.component').then((c) => c.BuildingComponent),
        data: { title: 'Edificio', module: 'Administrativo'}
      },
			{
        path: 'aulas',
        loadComponent: () => import('./classrooms/classrooms.component').then((c) => c.ClassroomsComponent),
        data: { title: 'Aulas', module: 'Administrativo'}
      },
      {
        path: 'asignaturas',
        loadComponent: () => import('./subjects/subjects.component').then((c) => c.SubjectsComponent),
        data: { title: 'Asignaturas', module: 'Administrativo'}
      },
      {
        path: 'activacion',
        loadComponent: () => import('./activation-period/activation-period.component').then((c) => c.ActivationPeriodComponent),
        data: { title: 'Activación Periodo', module: 'Administrativo'}
      },
      {
        path: 'niveles',
        loadComponent: () => import('./levels/levels.component').then((c) => c.LevelsComponent),
        data: { title: 'Niveles', module: 'Administrativo'}
      },
      {
        path: 'paralelos',
        loadComponent: () => import('./parallel/parallel.component').then((c) => c.ParallelComponent),
        data: { title: 'Paralelos', module: 'Administrativo'}
      },
      {
        path: 'pagos',
        loadComponent: () => import('./payments/payment-options/payment-options.component').then((c) => c.PaymentOptionsComponent),
				data: { title: 'Opciones de Pago', module: 'Administrativo'}
      },
      {
        path: 'crear-pago',
        loadComponent: () => import('./payments/create-payment/create-payment.component').then((c) => c.CreatePaymentComponent),
				data: { title: 'Crear Pago', module: 'Administrativo'}
      },
      {
        path: 'nivelacion/validacion-de-documentos-de-postulante',
        loadComponent: () => import('./validate-documents-of-postulant/validate-documents-of-postulant.component').then((c) => c.ValidateDocumentsOfPostulantComponent),
        data: { title: 'Validación del Postulante', module: 'Administrativo'}
      },
      {
        path: 'gestor-de-formularios',
        loadComponent: () => import('./survey/survey.component').then((c) => c.SurveyComponent),
        data: { title: 'Gestor de Formularios', module: 'Administrativo'}
      },
      {
        path: 'configuracion-de-encuestas',
        loadComponent: () => import('./survey-config/survey-config.component').then((c) => c.SurveyConfigComponent),
        data: { title: 'Configuración de Encuestas', module: 'Administrativo'}
      },
      {
        path: 'administracion-de-procesos',
        loadComponent: () => import('./process-management/process-management.component').then((c) => c.ProcessManagementComponent),
        data: { title: 'Administración de Procesos', module: 'Administrativo'}
      },
      {
        path: 'tipo-de-formulario',
        loadComponent: () => import('./survey-type/survey-type.component').then((c) => c.SurveyTypeComponent),
        data: { title: 'Tipo de Formulario', module: 'Administrativo'}
      },
      {
        path: 'tipo-de-formulario/:surveyTypeID',
        loadComponent: () => import('./survey-type-detail/survey-type-detail.component').then((c) => c.SurveyTypeDetailComponent),
        data: { title: 'Detalle de Tipo de Formulario', module: 'Administrativo'}
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
export class AdministrativeRoutingModule { }
