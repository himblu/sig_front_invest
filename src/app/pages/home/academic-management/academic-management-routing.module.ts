import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../home.component';
import { CalendarResolver } from './pages/home-academic-management/services/calendar.resolver';
import { CurriculumResolver } from './pages/curriculum/services/resolvers/curriculum.resolver';
import { CurriculumDetailResolver } from './pages/curriculum-detail/services/resolvers/curriculum-detail.resolver';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home-academic-management/home-academic-management.component').then((c) => c.HomeAcademicManagementComponent),
        resolve: {
          resolver: CalendarResolver
        },
        data: { title: 'Calendario Académico', module: 'Gestión Académica' }
      },
      {
        path: 'crear-malla-curricular/:career-course',
        loadComponent: () => import('./pages/curriculum/curriculum.component').then((c) => c.CurriculumComponent),
        resolve: {
          resolver: CurriculumResolver
        },
        data: { title: 'Crear Malla Curricular', module: 'Gestión Académica' }
      },
      {
        path: 'malla-curricular/:study-plan/:career-id',
        loadComponent: () => import('./pages/curriculum-detail/curriculum-detail.component').then((c) => c.CurriculumDetailComponent),
        resolve: {
          resolver: CurriculumDetailResolver
        },
        data: { title: 'Malla Curricular', module: 'Gestión Académica' }
      },
      {
        path: 'horario-de-aula',
        loadComponent: () => import('./pages/hours-per-classroom/hours-per-classroom.component').then((c) => c.HoursPerClassroomComponent),
        data: { title: 'Horario de Aula', module: 'Gestión Académica' }
      },
      {
        path: '**',
        redirectTo: ''
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class AcademicManagementRoutingModule { }
