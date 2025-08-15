import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../home.component';
import { AuthGuard } from '@services/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: HomeComponent,
    children: [
      {
        path: 'perfil-docente',
        loadComponent: () => import('./teaching-profile/teaching-profile.component').then((c) => c.TeachingProfileComponent),
        data: { title: 'Perfil Docente', module: 'RECURSOS HUMANOS' }
      },
      {
        path: 'crear-docente',
        loadComponent: () => import('./teaching-profile/teacher.component').then((c) => c.TeacherComponent),
        data: { title: 'Crear Docente', module: 'RECURSOS HUMANOS' }
      },
      {
        path: 'editar-docente/:id',
        loadComponent: () => import('./teaching-profile/teacher.component').then((c) => c.TeacherComponent),
        data: { title: 'Editar Docente', module: 'RECURSOS HUMANOS' }
      },
      {
        path: 'crear-colaborador',
        loadComponent: () => import('./create-user/create-user.component').then((c) => c.CreateUserComponent),
        data: { title: 'Crear Colaborador', module: 'RECURSOS HUMANOS' }
      },
      {
        path: 'cualidades-docente/:id',
        loadComponent: () => import('./qualities-teacher/qualities-teacher.component').then((c) => c.QualitiesTeacherComponent),
        data: { title: 'Cualidades Colaborador', module: 'RECURSOS HUMANOS' }
      },
			{
        path: 'registro-documentos',
        loadComponent: () => import('./document-registration/document-registration.component').then((c) => c.DocumentRegistrationComponent),
        data: { title: 'Registro Documentos', module: 'RECURSOS HUMANOS' }
      },
      {
        path: '',
        redirectTo: 'perfil-docente',
        pathMatch:'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HumanTalentRoutingModule { }
