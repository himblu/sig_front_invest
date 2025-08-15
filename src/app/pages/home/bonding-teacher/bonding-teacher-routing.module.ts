import { AuthGuard } from '@services/guards/auth.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../home.component';
import { BondingTeacherResolver } from './resolvers/bonding-teacher.resolver';

const routes: Routes = [{
  path:'',
  canActivate:[AuthGuard],
  component: HomeComponent,
  children:[
		{
      path:'lista-proyectos',
      loadComponent: () => import('./pages/project-list/project-list.component').then( c => c.ProjectListComponent),
      data: { title: 'Lista Proyectos', module: 'Vinculación Docente'}
    },
		{
      path:'proyecto-docente/:projectPracticasID/:periodID/:projectPracInformativeID',
      loadComponent: () => import('./pages/teacher-project/teacher-project.component').then( c => c.TeacherProjectComponent),
      data: { title: 'Proyecto de Prácticas Pre-Profesionales', module: 'Vinculación Docente'}
    },
		{
      path:'lista-tutorias',
      loadComponent: () => import('./pages/tutoring-list/tutoring-list.component').then( c => c.TutoringListComponent),
      data: { title: 'Lista Tutorías', module: 'Vinculación Docente'},
			resolve: {
        resolver: BondingTeacherResolver
      }
    },
		{
      path:'calificaciones-tutorias/:projectPracInformativeID',
      loadComponent: () => import('./pages/tutoring-grades/tutoring-grades.component').then( c => c.TutoringGradesComponent),
      data: { title: 'Calificaciones Tutorías', module: 'Vinculación Docente'}
    },
		{
			path: '',
			redirectTo: 'lista-proyectos',
			pathMatch:'full'
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
export class BondingTeacherRoutingModule { }
