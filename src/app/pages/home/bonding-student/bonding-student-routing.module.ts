import { BondingStudentModule } from './bonding-student.module';
import { AuthGuard } from '@services/guards/auth.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../home.component';
import { BondingStudentResolver } from './resolvers/bonding-student.resolver';

const routes: Routes = [{
  path:'',
  canActivate:[AuthGuard],
  component: HomeComponent,
  children:[
		{
      path:'vinculacion-solicitud-empresa',
      loadComponent: () => import('./pages/company-request/company-request.component').then( c => c.CompanyRequestComponent),
      data: { title: 'Vinculación / Solicitud Empresas', module: 'Vinculación Estudiante'},
    },
		{
      path:'lista-proyectos',
      loadComponent: () => import('./pages/project-list/project-list.component').then( c => c.ProjectListComponent),
      data: { title: 'Lista Proyectos', module: 'Vinculación Estudiante'}
    },
		{
      path:'archivos',
      loadComponent: () => import('./pages/file-upload/file-upload.component').then( c => c.FileUploadComponent),
      data: { title: 'Archivos', module: 'Vinculación Estudiante'},
			resolve: {
        resolver: BondingStudentResolver
      }
    },
		{
      path:'calificaciones',
      loadComponent: () => import('./pages/grades/grades.component').then( c => c.GradesComponent),
      data: { title: 'Calificaciones', module: 'Vinculación Estudiante'},
			resolve: {
        resolver: BondingStudentResolver
      }
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
export class BondingStudentRoutingModule { }
