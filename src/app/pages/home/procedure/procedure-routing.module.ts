import { AuthGuard } from '@services/guards/auth.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../home.component';
import { proceduresResolver } from './services/resolvers/procedures.resolver';

const routes: Routes = [{
  path:'',
  canActivate:[AuthGuard],
  component: HomeComponent,
  children:[
    {
      path:'lista-tramites',
      loadComponent: () => import('./pages/procedure-list/procedure-list.component').then( c => c.ProcedureListComponent),
      data: { title: 'Lista Trámites', module: 'Trámites'}
    },
		{
      path:'enviar-tramites',
      loadComponent: () => import('./pages/outbox-procedure/outbox-procedure.component').then( c => c.OutboxProcedureComponent),
      data: { title: ' Enviar Trámites', module: 'Trámites'},
			resolve: {
				resolver: proceduresResolver
			},
    },
		{
      path:'tramites-recibidos',
      loadComponent: () => import('./pages/inbox-procedure/inbox-procedure.component').then( c => c.InboxProcedureComponent),
      data: { title: 'Trámites Recibidos', module: 'Trámites'}
    },
		{
      path:'tramites-enviados',
      loadComponent: () => import('./pages/sent-procedure/sent-procedure.component').then( c => c.SentProcedureComponent),
      data: { title: 'Trámites Enviados', module: 'Trámites'}
    },
		{
			path: '',
			redirectTo: 'lista-tramites',
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
export class ProcedureRoutingModule { }
