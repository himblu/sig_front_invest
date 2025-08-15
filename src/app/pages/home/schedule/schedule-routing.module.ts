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
      path:'estudiante',
      loadComponent: () => import('./pages/student-schedule/student-schedule.component').then( c => c.StudentScheduleComponent),
      data: { title: 'Estudiante', module: 'Horarios'}
    },
		{
			path: '',
			redirectTo: 'estudiante',
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
export class ScheduleRoutingModule { }
