import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@services/guards/auth.guard';
import { isFinancialRoleGuard } from '@services/guards/is-financial-role.guard';
import { isSecretaryRoleGuard } from '@services/guards/is-secretary-role.guard';
import { isWelfareRoleGuard } from '@services/guards/is-welfare-role.guard';
import { HomeComponent } from '../home.component';
import {
  EnrolledStudentReportResolver
} from './pages/enrolled-student-report/services/resolvers/enrolled-student-report.resolver';
import { FinancialReportResolver } from './pages/financial-report/services/resolvers/financial-report.resolver';
import { instrumentsResolver } from './pages/instruments/resolvers/instruments.resolver';
import { QuotaControlResolver } from './pages/quota-control/services/resolvers/quaota-control.resolver';
import { WelfareReportResolver } from './pages/welfare-report/services/resolvers/welfare-report.resolver';

const routes: Routes = [{
  path: '',
  canActivate: [AuthGuard],
  component: HomeComponent,
  children: [
    {
      path: 'secretaria',
      canActivate: [isSecretaryRoleGuard],
      loadComponent: () => import('./pages/enrolled-student-report/enrolled-student-report.component').then(c => c.EnrolledStudentReportComponent),
      data: { title: 'Matrículas', module: 'Reportes' },
      resolve: {
        resolver: EnrolledStudentReportResolver
      }
    },
    {
      path: 'financiero',
      canActivate: [isFinancialRoleGuard],
      loadComponent: () => import('./pages/financial-report/financial-report.component').then(c => c.FinancialReportComponent),
      data: { title: 'Matrículas', module: 'Reportes' },
      resolve: {
        resolver: FinancialReportResolver
      }
    },
    {
      path: 'financiero/pago-por-cuotas',
      canActivate: [isFinancialRoleGuard],
      loadComponent: () => import('./pages/quota-control/quota-control.component').then(c => c.QuotaControlComponent),
      data: { title: 'Control por cuotas', module: 'Reportes' },
      resolve: {
        resolver: QuotaControlResolver
      }
    },
    {
      path: 'bienestar',
      canActivate: [isWelfareRoleGuard],
      loadComponent: () => import('./pages/welfare-report/welfare-report.component').then(c => c.WelfareReportComponent),
      data: { title: 'Matrículas', module: 'Reportes' },
      resolve: {
        resolver: WelfareReportResolver
      }
    },
    {
      path: 'actualizar-informacion',
      loadComponent: () => import('./pages/enrolled-student-report/components/update-information/update-information.component').then(c => c.UpdateInformationComponent),
      data: { title: 'Actualizar Informacion', module: 'Reportes' },
    },
    {
      path: 'actualizar-informacion/:personId',
      loadComponent: () => import('./pages/enrolled-student-report/components/update-information/update-information.component').then(c => c.UpdateInformationComponent),
      data: { title: 'Actualizar Informacion', module: 'Reportes' },
    },
    {
      path: 'cambio-paralelo/:personID/:studentID',
      loadComponent: () => import('./pages/parallel-change/parallel-change.component').then(c => c.ParallelChangeComponent),
      data: { title: 'Cambio de Paralelo', module: 'Reportes' },
    },
    {
      path: 'instrumentos',
      loadComponent: () => import('./pages/instruments/pages/instruments.component').then(c => c.InstrumentsComponent),
      data: { title: 'Instrumentos', module: 'Reportes' },
      resolve: {
        resolver: instrumentsResolver
      }
    },
    {
      path: '',
      redirectTo: 'secretaria',
      pathMatch: 'full'
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ReportRoutingModule { }
