import { AuthGuard } from '@services/guards/auth.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../home.component';
import { CoordinatorsResolver } from './resolvers/coordinators.resolver';

const routes: Routes = [{
  path:'',
  canActivate:[AuthGuard],
  component: HomeComponent,
  children:[
    {
      path:'periodo-academico',
      loadComponent: () => import('./pages/academic-period/academic-period.component').then( c => c.AcademicPeriodComponent),
      data: { title: 'Periodo Académico', module: 'Tics'}
    },
		{
      path:'parciales',
      loadComponent: () => import('./pages/partial/partial.component').then( c => c.PartialComponent),
      data: { title: 'Parciales', module: 'Tics'}
    },
		{
      path:'calificaciones',
      loadComponent: () => import('./pages/grades/grades.component').then( c => c.GradesComponent),
      data: { title: 'Calificaciones', module: 'Tics'}
    },
		{
      path:'coordinadores',
      loadComponent: () => import('./pages/coordinators/coordinators.component').then( c => c.CoordinatorsComponent),
      data: { title: 'Coordinadores', module: 'Tics'},
			resolve: {
        resolver: CoordinatorsResolver
      }
    },
		{
      path:'directores',
      loadComponent: () => import('./pages/directors/directors.component').then( c => c.DirectorsComponent),
      data: { title: 'Directores', module: 'Tics'},
			resolve: {
        resolver: CoordinatorsResolver
      }
    },
		{
      path:'evaluaciones',
      loadComponent: () => import('./pages/evaluations/evaluations.component').then( c => c.EvaluationsComponent),
      data: { title: 'Evaluaciones', module: 'Tics'}
    },
		{
      path:'configuraciones',
      loadComponent: () => import('./pages/settings/settings.component').then( c => c.SettingsComponent),
      data: { title: 'Configuraciones', module: 'Tics'}
    },
		{
			path: '',
			redirectTo: '',
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
export class TicsRoutingModule { }
