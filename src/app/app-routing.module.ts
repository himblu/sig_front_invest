import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NoPageFoundComponent } from '@shared/no-page-found/no-page-found.component';

const routes: Routes = [
  {
    path: 'autenticacion',
    loadChildren: () => import('./pages/auth/auth.module').then( m => m.AuthModule)
  },
  {
    path: 'inscripcion',
    loadChildren: () => import('./pages/inscription/inscription.module').then( m => m.InscriptionModule)
  },
  {
    path: 'inicio',
    loadChildren: () => import('./pages/home/start/start.module').then( m => m.StartModule)
  },
  {
    path: 'administracion',
    loadChildren: () => import('./pages/home/administrative/administrative.module').then( m => m.AdministrativeModule)
  },
  {
    path: 'rellenado-de-encuesta',
    loadChildren: () => import('./pages/home/survey-completion/survey-completion.module').then( m => m.SurveyCompletionModule)
  },
  {
    path: 'unacem',
    loadChildren: () => import('./pages/home/unacem/unacem.module').then( m => m.UnacemModule)
  },
  {
    path: 'beca',
    loadChildren: () => import('./pages/home/scholarship/scholarship.module').then( m => m.ScholarshipModule)
  },
  {
    path: 'absorcion',
    loadChildren: () => import('./pages/home/absorption/absorption.module').then( m => m.AbsorptionModule)
  },
  {
    path: 'integracion-con-moodle',
    loadChildren: () => import('./pages/home/moodle-integration/moodle-integration.module').then( m => m.MoodleIntegrationModule)
  },
  {
    path: 'configuracion',
    loadChildren: () => import('./pages/home/setting/setting.module').then( m => m.SettingModule)
  },
  {
    path: '',
    loadChildren: () => import('./pages/home/start/start.module').then( m => m.StartModule)
  },
  {
    path: 'gestion-academica',
    loadChildren: () => import('./pages/home/academic-management/academic-management.module').then(m => m.AcademicManagementModule)
  },
	{
    path: 'academico-estudiante',
    loadChildren: () => import('./pages/home/academic-student/academic-student.module').then(m => m.AcademicStudentModule)
  },
	{
    path: 'academico-docente',
    loadChildren: () => import('./pages/home/academic-teacher/academic-teacher.module').then(m => m.AcademicTeacherModule)
  },
	{
    path: 'coordinador-carrera',
    loadChildren: () => import('./pages/home/career-coordinator/career-coordinator.module').then(m => m.CareerCoordinatorModule)
  },
	{
    path: 'coordinador-general',
    loadChildren: () => import('./pages/home/general-coordinator/general-coordinator.module').then(m => m.GeneralCoordinatorModule)
  },
	{
    path: 'vinculacion-administracion',
    loadChildren: () => import('./pages/home/bonding-admin/bonding-admin.module').then(m => m.BondingAdminModule)
  },
	{
    path: 'vinculacion-coordinador',
    loadChildren: () => import('./pages/home/bonding-coordinator/bonding-coordinator.module').then(m => m.BondingCoordinatorModule)
  },
	{
    path: 'vinculacion-juridico',
    loadChildren: () => import('./pages/home/bonding-legal/bonding-legal.module').then(m => m.BondingLegalModule)
  },
	{
    path: 'vinculacion-estudiante',
    loadChildren: () => import('./pages/home/bonding-student/bonding-student.module').then(m => m.BondingStudentModule)
  },
	{
    path: 'vinculacion-director',
    loadChildren: () => import('./pages/home/bonding-director/bonding-director.module').then(m => m.BondingDirectorModule)
  },
	{
    path: 'vinculacion-docente',
    loadChildren: () => import('./pages/home/bonding-teacher/bonding-teacher.module').then(m => m.BondingTeacherModule)
  },
  {
    path: 'talento-humano',
    loadChildren: () => import('./pages/home/human-talent/human-talent.module').then( m => m.HumanTalentModule)
  },
  {
    path: 'distributivo',
    loadChildren: () => import('./pages/home/distributive/distributive.module').then( m => m.DistributiveModule)
  },
  {
    path: 'matriculacion',
    loadChildren: () => import('./pages/home/enrollment/enrollment.module').then( m => m.EnrollmentModule)
  },
  {
    path: 'reportes',
    loadChildren: () => import('./pages/home/report/report.module').then( m => m.ReportModule)
  },
  {
    path: 'horarios',
    loadChildren: () => import('./pages/home/schedule/schedule.module').then( m => m.ScheduleModule)
  },
	{
    path: 'tics',
    loadChildren: () => import('./pages/home/tics/tics.module').then( m => m.TicsModule)
  },
  {
    path: 'biblioteca',
    loadChildren: () => import('./pages/home/library/library.module').then( m => m.LibraryModule)
  },
	{
    path: 'secretaria',
    loadChildren: () => import('./pages/home/secretary/secretary.module').then( m => m.SecretaryModule)
  },
	{
    path: 'tramites',
    loadChildren: () => import('./pages/home/procedure/procedure.module').then( m => m.ProcedureModule)
  },
	{
    path: 'instrumentos',
    loadChildren: () => import('./pages/home/evaluation-instruments/evaluation-instruments.module').then( m => m.EvaluationInstrumentsModule)
  },
  {
    path: 'ventas',
    loadChildren: () => import('./pages/home/sale/sale.module').then( m => m.SaleModule)
  },
  {
    path: 'politicas',
    loadChildren: () => import('./pages/home/policies/policies.module').then(m => m.PoliciesModule)
  },
	{
		path: ':personID',
		loadChildren: () =>
			import('./pages/home/public-view/public-view.module').then(
				m => m.PublicViewModule
			),
	},
  {
    path:'404',
    component: NoPageFoundComponent
  },
  {
    path: '**',
    redirectTo: '404'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: false })],
  exports: [RouterModule]
})

export class AppRoutingModule { }
