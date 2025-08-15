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
      path:'pea',
      loadComponent: () => import('./pages/coordinator-pea/coordinator-pea.component').then( c => c.CoordinatorPeaComponent),
      data: { title: 'Pea', module: 'Coordinador de Carrera'}
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
export class CareerCoordinatorRoutingModule { }
