import { AuthGuard } from '@services/guards/auth.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../home.component';

const routes: Routes = [{
  path:'',
  canActivate:[AuthGuard],
  component: HomeComponent,
  children:[
    {
      path:'administracion',
      loadComponent: () => import('./management-scholarship/management-scholarship.component').then( c => c.ManagementScholarshipComponent),
      data: { title: 'Administración de Beneficios', module: 'Becas'}
    },
		{
			path: '',
			redirectTo: 'administracion',
			pathMatch:'full'
		},
    {
			path: 'asignacion-de-beneficio-a-estudiante/:scholarshipID/:studentID',
			loadComponent: () => import('./assign-scholarship-student/assign-scholarship-student.component').then( c => c.AssignScholarshipStudentComponent),
            data: { title: 'Asignación de Beneficio', module: 'Becas'}
		},
    {
			path: 'lista-de-estudiantes-candidatos',
			loadComponent: () => import('./student-candidate-list/student-candidate-list.component').then( c => c.StudentCandidateListComponent),
            data: { title: 'Lista de Estudiantes Candidatos', module: 'Becas'}
		},
    {
			path: 'ficha-informativa-para-beca/:assignStudentID/:studentID',
			loadComponent: () => import('./scholarship-sheet/scholarship-sheet.component').then( c => c.ScholarshipSheetComponent),
            data: { title: 'Ficha economica de la Beca', module: 'Becas'}
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
export class ScholarshipRoutingModule { }
