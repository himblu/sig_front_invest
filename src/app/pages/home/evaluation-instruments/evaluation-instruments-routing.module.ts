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
      path:'lista',
      loadComponent: () => import('./pages/evaluation-list/evaluation-list.component').then( c => c.EvaluationListComponent),
      data: { title: 'Lista', module: 'Instrumentos de Evaluación'}
    },
		{
      path:'cuestionario/:settingEvaluationInstrumentID/:personID',
      loadComponent: () => import('./pages/test/test.component').then( c => c.TestComponent),
      data: { title: 'Cuestionario', module: 'Instrumentos de Evaluación'}
    },
		{
			path: '',
			redirectTo: 'lista',
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
export class EvaluationInstrumentsRoutingModule { }
