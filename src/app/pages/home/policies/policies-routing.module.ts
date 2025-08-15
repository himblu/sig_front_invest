import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@services/guards/auth.guard';
import { HomeComponent } from '../home.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: HomeComponent,
    children: [
      {
        path: 'terminos',
        loadComponent: () => import('./terms/terms.component').then(c => c.TermsComponent),
        data: { title: 'Términos y Condiciones', module: 'Políticas' }
      },
      {
        path: 'pagos',
        loadComponent: () => import('./policies-payment/policies-payment.component').then(c => c.PoliciesPaymentComponent),
        data: { title: 'Políticas de Pagos Electrónicos', module: 'Políticas' }
      },
      {
        path: 'envio',
        loadComponent: () => import('./policies-shipping/policies-shipping.component').then(c => c.PoliciesShippingComponent),
        data: { title: 'Políticas de Envio', module: 'Políticas' }
      },
      { path: '', redirectTo: 'terminos', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PoliciesRoutingModule {}  