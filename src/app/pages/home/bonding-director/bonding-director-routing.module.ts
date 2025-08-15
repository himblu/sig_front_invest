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
      path:'proyecto-pre-profesional',
      loadComponent: () => import('./pages/pre-professional-project/pre-professional-project.component').then( c => c.PreProfessionalProjectComponent),
      data: { title: 'Dirección / Proyecto General', module: 'Vinculación Director'}
    },
		{
      path:'proyecto-pre-profesional/:periodID/:projectPracticasID/:careerID/:studyPlanID',
      loadComponent: () => import('./pages/pre-professional-project/pre-professional-project.component').then( c => c.PreProfessionalProjectComponent),
      data: { title: 'Dirección / Proyecto General', module: 'Vinculación Director'}
    },
		{
      path:'lista-proyectos',
      loadComponent: () => import('./pages/project-list/project-list.component').then( c => c.ProjectListComponent),
      data: { title: 'Lista Proyectos', module: 'Vinculación Director'}
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
export class BondingDirectorRoutingModule { }
