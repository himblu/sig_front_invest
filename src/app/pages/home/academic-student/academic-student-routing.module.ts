import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../home.component';
import { SchedulesComponent } from './pages/schedules/schedules.component';
import { ActivitiesComponent } from './pages/activities/activities.component';
import { CalendarResolver } from './pages/activities/services/calendar.resolver';
import { GradesComponent } from './pages/grades/grades.component';
import { TasksComponent } from './pages/tasks/tasks.component';
import { TeacherEvaluationComponent } from './pages/teacher-evaluation/teacher-evaluation.component';
import { LibraryComponent } from './pages/library/library.component';
import { SubjectsComponent } from './pages/subjects/subjects.component';
import { SubjectDetailComponent } from './pages/subject-detail/subject-detail.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
			{
				path: 'horarios',
				component: SchedulesComponent,
				data: { title: 'Horarios', module: 'Académico Estudiante' }
			},
			{
				path: 'actividades',
				component: ActivitiesComponent,
				data: { title: 'Actividades', module: 'Académico Estudiante' },
				resolve: {
					resolver: CalendarResolver
				},
			},
			{
				path: 'calificaciones',
				component: GradesComponent,
				data: { title: 'Calificaciones', module: 'Académico Estudiante' }
			},
			{
				path: 'tareas',
				component: TasksComponent,
				data: { title: 'Tareas', module: 'Académico Estudiante' }
			},
			{
				path: 'evaluacion-docente',
				component: TeacherEvaluationComponent,
				data: { title: 'Evaluación Docente', module: 'Académico Estudiante' }
			},
			{
				path: 'biblioteca',
				component: LibraryComponent,
				data: { title: 'Biblioteca', module: 'Académico Estudiante' }
			},
			{
				path: 'listado-asignaturas',
				component: SubjectsComponent,
				data: { title: 'Listado de Asignaturas', module: 'Académico Estudiante' }
			},
			{
				path: 'detalle-asignatura',
				component: SubjectDetailComponent,
				data: { title: 'Detalle de Asignatura', module: 'Académico Estudiante' }
			},
			{
        path: '',
        redirectTo: 'actividades',
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

export class AcademicStudentRoutingModule { }
