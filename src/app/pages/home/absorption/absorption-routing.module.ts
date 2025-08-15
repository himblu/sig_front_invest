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
        path: 'reporteria',
        loadComponent: () => import('./absorption-report/absorption-report.component').then((c) => c.AbsorptionReportComponent),
        data: { title: 'Resultados', module: 'Absorción'}
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
export class AbsorptionRoutingModule { }
