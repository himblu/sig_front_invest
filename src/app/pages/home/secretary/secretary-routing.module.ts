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
      path:'homologaciones',
      loadComponent: () => import('./pages/approvals/approvals.component').then( c => c.ApprovalsComponent),
      data: { title: 'Homologaciones', module: 'Secretaría'}
    },
		{
			path: '',
			redirectTo: 'homologaciones',
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
export class SecretaryRoutingModule { }
