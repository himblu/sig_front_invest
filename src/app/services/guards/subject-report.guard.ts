
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { CommonService } from '@services/common.service';
import { tap } from 'rxjs';
import Swal from 'sweetalert2';

  
  @Injectable({
    providedIn: 'root'
  })
  export class subjectReportGuard implements CanActivate{
    constructor( private common: CommonService,
                private router:Router ){}

    canActivate(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot,
    ){
      return this.common.getFailedSubject()
      .pipe(
        tap( isTrue => {
          debugger
          if(isTrue){
              Swal.fire({
                imageUrl: '../../../../assets/images/arrastre.png',
                imageHeight: 300,
                imageAlt: 'Información de Pago',
                // confirmButtonText: '<span style="color: white; background: #014898;">Cerrar</span>'
              }).then();
            
            this.router.navigateByUrl('/inicio');
          }
        })
      )
    }
  }


