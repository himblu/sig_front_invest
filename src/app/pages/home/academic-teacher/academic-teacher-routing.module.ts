import { AuthGuard } from '@services/guards/auth.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../home.component';
import { CalendarResolver } from './pages/activities/services/calendar.resolver';

const routes: Routes = [{
  path:'',
  canActivate:[AuthGuard],
  component: HomeComponent,
  children:[
		{
      path:'asistencia',
      loadComponent: () => import('./pages/assistance/assistance.component').then( c => c.AssistanceComponent),
      data: { title: 'Asistencia', module: 'Académico Docente'}
    },
		{
      path:'asignaturas',
      loadComponent: () => import('./pages/subjects/subjects.component').then( c => c.SubjectsComponent),
      data: { title: 'Asignaturas', module: 'Académico Docente'}
    },
		{
      path:'actividades',
      loadComponent: () => import('./pages/activities/activities.component').then( c => c.ActivitiesComponent),
			resolve: {
				resolver: CalendarResolver
			},
      data: { title: 'Actividades', module: 'Académico Docente'}
    },
		{
      path:'pea',
      loadComponent: () => import('./pages/pea/pea.component').then( c => c.PeaComponent),
      data: { title: 'Pea', module: 'Académico Docente'}
    },
		{
      path:'editar-docente',
      loadComponent: () => import('./pages/update-teacher/update-teacher.component').then( c => c.UpdateTeacherComponent),
      data: { title: 'Editar Docente', module: 'Académico Docente'}
    },
		{
			path: '',
			redirectTo: 'actividades',
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
export class AcademicTeacherRoutingModule { }
