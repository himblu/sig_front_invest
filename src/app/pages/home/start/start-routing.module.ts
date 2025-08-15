import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@services/guards/auth.guard';
import { HomeComponent } from '../home.component';

const routes: Routes = [{
  path:'',
  canActivate: [AuthGuard],
    component: HomeComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./start.component').then((c) => c.StartComponent),
        data: { title: 'Inicio', module: 'ITCA' }
      },
      {
        path: '',
        redirectTo: '',
        pathMatch:'full'
      }
    ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StartRoutingModule { }
