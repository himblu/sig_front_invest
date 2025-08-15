import { Observable, throwError, catchError } from 'rxjs';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {

  get token(): string{
    return sessionStorage.getItem('token') || localStorage.getItem('token') || '';
  }

  constructor( private common: CommonService) { }

  intercept( req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const headers = new HttpHeaders({
      'Authorization':`Bearer ${this.token}`,
    })

    const reqClone = req.clone({
      headers
    })
    return next.handle( reqClone );
  }

  errorControl( err: HttpErrorResponse){
    if(err.status === 401){
      this.common.message(`${err.error.error}`,`${err.error.error}`, 'info', '#2eb4d8');
      this.common.logout();
    }
    else if(err.status === 403){
      this.common.message(`${err.error.error}`,'','warning','#d3996a');
    }
    else if(err.status === 404){
      this.common.message(`${err.error.error}`,'','warning','#d3996a');
    }
    else if(err.status === 409){
      this.common.message(`${err.error.error}`,`${err.error.message[0]}`,'warning','#f5637e');
    }
    else if(err.status === 500){
      //this.common.message(`${err.error.error}`,'Compruebe su conexión a internet o comuniquese con el administrador de TICs','error','#f5637e');
      // this.common.logout();
      // FIXME: Please check it out.
    }
    else{
      this.common.message('ERROR DE CONEXIÓN','Es posible que su conexión a internet este inestable!!!','info','#2eb4d8');
    }
    return throwError({status:err.status, msg: err.error.message[0]});
  }
}
