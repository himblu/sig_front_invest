import { Injectable } from '@angular/core';

import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { CommonService } from '../common.service';
import { tap } from 'rxjs';
import { localToSessionStorage } from '@utils/functions';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate{
  constructor( private common: CommonService,
              private router: Router ){}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ){
    return this.common.validarToken()
      .pipe(
        tap( isAuth => {
          if(!isAuth){
            this.router.navigateByUrl('autenticacion/iniciar-sesion').then();
          }else localToSessionStorage();
        })
      );
  }
}


// export const authGuard: CanActivateFn = (route, state) => {


//     console.log('paso por el canActivate');

//     return true;

// };
