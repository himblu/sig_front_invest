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
      path:'configuracion-archivos',
      loadComponent: () => import('./pages/file-setting/file-setting.component').then( c => c.FileSettingComponent),
      data: { title: 'Configuración de Archivos', module: 'Vinculación Administrador'}
    },
		{
			path: '',
			redirectTo: 'configuracion-archivos',
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
export class BondingAdminRoutingModule { }
