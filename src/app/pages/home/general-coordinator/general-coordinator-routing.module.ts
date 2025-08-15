import { AuthGuard } from '@services/guards/auth.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../home.component';
import { instrumentsResolver } from './pages/instruments/services/resolvers/instruments.resolver';

const routes: Routes = [{
  path:'',
  canActivate:[AuthGuard],
  component: HomeComponent,
  children:[
		{
      path:'listado-pea',
      loadComponent: () => import('./pages/pea-list/pea-list.component').then( c => c.PeaListComponent),
      data: { title: 'Listado de Pea', module: 'Coordinador General'}
    },
		{
      path:'seguimiento-docente',
      loadComponent: () => import('./pages/teacher-follow-up/teacher-follow-up.component').then( c => c.TeacherFollowUpComponent),
      data: { title: 'Seguimiento al proceso Docente', module: 'Coordinador General'}
    },
		{
      path:'instrumentos',
      loadComponent: () => import('./pages/instruments/instruments.component').then( c => c.InstrumentsComponent),
			resolve: {
				resolver: instrumentsResolver
			},
      data: { title: 'Instrumentos', module: 'Coordinador General'}
    },
		{
      path:'lista-instrumentos',
      loadComponent: () => import('./pages/instruments-list/instruments-list.component').then( c => c.InstrumentsListComponent),
			resolve: {
				resolver: instrumentsResolver
			},
      data: { title: 'Lista Instrumentos', module: 'Coordinador General'}
    },
		{
      path: 'asignacion-de-instrumentos',
      loadComponent: () => import('./pages/select-instruments/select-instruments.component').then( c => c.SelectInstrumentsComponent),
      data: { title: 'Configurar Instrumentos', module: 'Coordinador General'}
    },
		{
			path: '',
			redirectTo: 'listado-pea',
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
export class GeneralCoordinatorRoutingModule { }
