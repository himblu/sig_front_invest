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
        path: 'carrito-de-compras/:cartID',
        loadComponent: () => import('./shopping-cart/shopping-cart.component').then( m => m.ShoppingCartComponent),
        data: { title: 'Detalle de Carrito de Compras', module: 'Ventas'}
      },
      {
        path: 'payment-result',
        loadComponent: () => import('./payment-result/payment-result.component').then(m => m.PaymentResultComponent),
        data: { title: 'Resultado del Pago', module: 'Ventas' }
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
export class SaleRoutingModule { }
