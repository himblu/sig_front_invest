import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../home.component';

const routes: Routes = [
  {
    path: '',
    // canActivate:[ AuthGuard ],
    component: HomeComponent,
    children:[
      {
        path: 'usuario',
        loadComponent: () => import('./user-setting/user-setting.component').then((c) => c.UserSettingComponent),
        data: { title: 'Usuario', module: 'Configuración'}
      },
      {
        path: '',
        redirectTo: 'usuario',
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
export class SettingRoutingModule { }