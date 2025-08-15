import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@services/guards/auth.guard';
import { HomeComponent } from '../home.component';
import { ProjectPracticasResolver } from './pages/project-modality-practice/services/resolvers/project-modality-practice.resolver';

const routes: Routes = [{
  path: '',
  canActivate: [AuthGuard],
  component: HomeComponent,
  children: [
    {
      path: 'aprobacion-empresas',
      loadComponent: () => import('./pages/company-aprovation/company-aprovation.component').then(c => c.CompanyAprovationComponent),
      data: { title: 'Aprobación De Empresas', module: 'Vinculación Coordinador' }
    },
    {
      path: 'crear-empresas',
      loadComponent: () => import('./pages/create-company/create-company.component').then(c => c.CreateCompanyComponent),
      data: { title: 'Crear Empresas', module: 'Vinculación Coordinador' }
    },
    {
      path: 'lista-proyectos',
      loadComponent: () => import('./pages/project-list/project-list.component').then(c => c.ProjectListComponent),
      data: { title: 'Lista Proyectos', module: 'Vinculación Coordinador' }
    },
    {
      path: 'proyecto-practicas-laborales',
      loadComponent: () => import('./pages/project-modality-practice/project-modality-practice.component').then(c => c.ProjectModalityPracticeComponent),
      data: { title: 'Proyectos de practicas laborales', module: 'Vinculación Coordinador', modalityPracticeID: 1 },
      resolve: {
        resolver: ProjectPracticasResolver
      }
    },
    {
      path: 'proyecto-servicio-comunitario',
      loadComponent: () => import('./pages/project-modality-practice/project-modality-practice.component').then(c => c.ProjectModalityPracticeComponent),
      data: { title: 'Práctica de Servicio Comunitario', module: 'Vinculación Coordinador', modalityPracticeID: 2 },
      resolve: {
        resolver: ProjectPracticasResolver
      }
    },
    {
      path: 'proyecto-coordinador/:id/:careerID/:studyPlanID/:schoolID/:modalityID',
      loadComponent: () => import('./pages/coordinator-project/coordinator-project.component').then(c => c.CoordinatorProjectComponent),
      data: { title: 'Coordinación / Proyecto de Prácticas Pre-Profesionales', module: 'Vinculación Coordinador' }
    },
    {
      path: '',
      redirectTo: 'lista-proyectos',
      pathMatch: 'full'
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
export class BondingCoordinatorRoutingModule { }
