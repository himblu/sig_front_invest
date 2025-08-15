import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { CommonService } from '@services/common.service';
import { tap } from 'rxjs';

  
  @Injectable({
    providedIn: 'root'
  })
  export class VerifyGuard implements CanActivate{
    constructor( private common: CommonService,
                private router:Router ){}

    canActivate(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot,
    ){
      const parameter = route.data['parameter'] ;
      const ruta = route.data['ruta'];
      const unidad = route.data['unidad'];
      let showSwal = false;
      let msg:string; 
      return this.common.validRouteEnrollment(parameter)
            .pipe(
              tap( isAuth => {
                if(!isAuth){
                  if(parameter === '07'){
                    msg =  'Para continuar con el proceso de Matrícula, es un prerrequisito la Matrícula de Segunda Lengua'
                    // this.common.message('Para continuar con el proceso de Matrícula, es un prerrequisito la Matrícula de Segunda Lengua', '', 'warning', '#d3996a');
                  }
                  if(parameter === '02'){
                    msg = 'Es un prerrequisito completar la Ficha Socioeconómica';
                    // this.common.message('Es un prerrequisito completar la Ficha Socioeconómica', '', 'warning', '#d3996a');
                  }
                  else if(parameter === '03'){
                    msg = 'Es un prerrequisito completar la Carga de Documentos';
                    // this.common.message('Es un prerrequisito completar la Carga de Documentos', '', 'warning', '#d3996a');
                  }
                  else if(parameter === '04'){
                    msg = 'Es un prerrequisito completar la Matrícula';
                    // this.common.message('Es un prerrequisito completar la Matrícula', '', 'warning', '#d3996a');
                  }
                  else if(parameter === '01'){
                    msg = 'Es un prerrequisito completar la Actualización de Información';
                    // this.common.message('Es un prerrequisito completar la Actualización de Información', '', 'warning', '#d3996a');
                  }
                  // console.log(ruta);
                  // if(msg != undefined){
                  //   this.common.message(msg, '', 'warning', '#d3996a');
                  //   console.log('show');
                  // }                  
                  this.router.navigateByUrl(ruta);
                }
              })
            );
        
    }

    reportSubject(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot,
    ){
      return this.common.getFailedSubject()
      .pipe(
        tap( isTrue => {
          if(!isTrue){
            this.router.navigateByUrl('/inicio');
          }
        })
      )
    }
  }

