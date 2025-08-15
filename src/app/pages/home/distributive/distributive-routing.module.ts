import { ClassroomsComponent } from './classrooms/classrooms.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@services/guards/auth.guard';
import { HomeComponent } from '../home.component';
import { TeachersComponent } from './teachers/teachers.component';
import { ModelerComponent } from './modeler/modeler.component';
import { ModelerResolver } from './modeler/services/resolvers/modeler.resolver';
import { CareerComponent } from '../administrative/career/career.component';
import { ListComponent } from './teachers/list/list.component';
import { ListResolver } from './teachers/list/services/list.resolver';
import { ClassRoomsResolver } from './classrooms/services/classrooms.resolver';
import { CareersComponent } from './careers/careers.component';
import { CareersResolver } from './careers/services/careers.resolver';
import { ViewComponent } from './view/view.component';
import { ViewResolver } from './view/services/view.resolver';
const routes: Routes = [{
  path:'',
  canActivate:[ AuthGuard ],
  component:HomeComponent,
  children:[
    {
      path: 'lista-docentes',
      component: ListComponent,
      resolve: {
        resolver: ListResolver
      },
      data: { title: 'Docentes', module: 'Distributivo' }
    },
    {
      path: 'docentes',
      component: TeachersComponent,
      data: { title: 'Docentes', module: 'Distributivo' }
    },
    {
      path: 'aulas',
      component: ClassroomsComponent,
      resolve: {
        resolver: ClassRoomsResolver
      },
      data: { title: 'Aulas', module: 'Distributivo' }
    },
    {
      path: 'asignaturas',
      component: CareerComponent,
      data: { title: 'Asignaturas', module: 'Distributivo' }
    },
    {
      path: 'carreras',
      component: CareersComponent,
      resolve: {
        resolver: CareersResolver
      },
      data: { title: 'Carreras', module: 'Distributivo' }
    },
    {
      path: 'modelador',
      component: ModelerComponent,
      resolve: {
        resolver: ModelerResolver
      },
      data: { title: 'Modelador', module: 'Distributivo' }
    },
    {
      path: 'vista',
      component: ViewComponent,
      resolve: {
        resolver: ViewResolver
      },
      data: { title: 'Modelador', module: 'Distributivo' }
    },
  ]

}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DistributiveRoutingModule { }
