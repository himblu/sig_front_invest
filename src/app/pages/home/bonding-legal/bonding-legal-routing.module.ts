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
      path:'acuerdos-convenios',
      loadComponent: () => import('./agreements/agreements.component').then( c => c.AgreementsComponent),
      data: { title: 'Acuerdos y Convenios', module: 'Vinculación Jurídico'}
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
export class BondingLegalRoutingModule { }
