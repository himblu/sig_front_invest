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
        path: 'configuracion',
        loadComponent: () => import('./category-moodle-integration/category-moodle-integration.component').then((c) => c.CategoryMoodleIntegrationComponent),
        data: { title: 'Integración con Moodle', module: 'Administrativo'}
      },
      {
        path: 'configuracion/curso/:courseID/:cohortID',
        loadComponent: () => import('./course-moodle-integration/course-moodle-integration.component').then((c) => c.CourseMoodleIntegrationComponent),
        data: { title: 'Información del Curso', module: 'Administrativo'}
      },
      {
        path: 'postulante/:postulantID',
        loadComponent: () => import('./student-moodle-integration/student-moodle-integration.component').then((c) => c.StudentMoodleIntegrationComponent),
        data: { title: 'Información del Postulante', module: 'Administrativo'}
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
export class MoodleIntegrationRoutingModule { }
