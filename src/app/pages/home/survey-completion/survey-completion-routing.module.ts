import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@services/guards/auth.guard';
import { HomeComponent } from '../home.component';

const routes: Routes = [
  {
    path: '',
    // canActivate:[ AuthGuard ],
    component: HomeComponent,
    children:[
      {
        path: 'externa',
        loadComponent: () => import('./external-survey/external-survey.component').then((c) => c.ExternalSurveyComponent),
        data: { title: 'Rellenado de Absorción Externa', module: 'Lista de Encuestas'}
      },
      {
        path: 'externa/:surveyID/:surveyConfigID',
        loadComponent: () => import('./filling-out-external-survey/filling-out-external-survey.component').then((c) => c.FillingOutExternalSurveyComponent),
        data: { title: 'Rellenado de Absorción Externa', module: 'Lista de Encuestas'}
      },
      {
        path: '',
        redirectTo: '',
        pathMatch: 'full'
      },
      {
        path: '**',
        redirectTo: '404'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SurveyCompletionRoutingModule { }
