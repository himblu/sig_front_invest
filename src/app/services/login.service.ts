import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Login, LoginReg } from '@utils/interfaces/login.interfaces';
import { environment } from '@environments/environment';
import { Observable,tap } from 'rxjs';
import { Router } from '@angular/router';
import { Cedula } from '@utils/interfaces/cedula.interfaces';
import { SidebarService } from './sidebar.service';

let url: string = environment.url;
let urlCedula: string = 'http://pichincha.gapsystem.net:10048';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor( private https: HttpClient,
              private router:Router,
              private servi:SidebarService ) { }

  /* *********************************** LISTAS GETTERS SETTERS ************************************** */

  /* *********************************** ---------------------- ************************************** */


  /* *********************************** FUNCIONES VARIAS ********************************************* */

  /* *********************************** -------------------------- *********************************** */


  /* *************************************** SERVICIOS GET ******************************************* */

  login(login: Login, isGuest?: boolean):Observable<LoginReg>{
    return this.https.post<LoginReg>(`${url}/api/auth/login/1`, login)
    .pipe(
      tap( resp => {
        if(login.remember){
          localStorage.setItem('email', login.p_userName);
          localStorage.setItem('remember', 'true');
        } else{
          localStorage.removeItem('email');
          localStorage.removeItem('remember');
        }
        //console.log('************************************');
        //console.log(resp);
				localStorage.removeItem('selectedPublications');
        sessionStorage.setItem('token', resp.token);
        // sessionStorage.setItem('menu', JSON.stringify(menu));
        sessionStorage.setItem('mail', resp.user.userEmail);
        sessionStorage.setItem('name', resp.user.userName);
        sessionStorage.setItem('personID', String(resp.user.PersonId));
        sessionStorage.setItem('img', resp.user.userImg);
        sessionStorage.setItem('rol', resp.user.rolName);
        sessionStorage.setItem('rolID', String(resp.user.rolid));
        sessionStorage.setItem('id', String(resp.user.PersonId));
        sessionStorage.setItem('userId', String(resp.user.userId));
        // DEBE ESTAR EN EL COMPONENTE DE SIGN-IN
        if (!isGuest) {
          this.router.navigateByUrl('/administracion').then();
        }
      })
    );
  }

  loginWeb(login: Login, isGuest?: boolean) {
    return this.https.post<LoginReg>(`${url}/api/auth/login/1`, login);
  }

  /* *************************************** ------------- ******************************************* */


  /* *********************************** SERVICIOS POST *********************************************** */

  registoCivil(cedula: string):Observable<Cedula>{
    return this.https.get<Cedula>(`${urlCedula}/api/services/cedulaV2/${cedula}`);
  }

  personRegister( data: any ):Observable<LoginReg>{

    return this.https.post<LoginReg>(`${url}/api/auth/register`, data).pipe(
      tap( (resp: any) => {
        sessionStorage.setItem('token', resp.token);
        sessionStorage.setItem('mail', resp.user.userEmail);
        sessionStorage.setItem('name', resp.user.userName);
        sessionStorage.setItem('menu', JSON.stringify(resp.menu));
        sessionStorage.setItem('img', resp.user.userImg);
        sessionStorage.setItem('rol', resp.user.userRol);
        sessionStorage.setItem('id', String(resp.user.PersonId));
        this.router.navigateByUrl('/administracion').then();
      })
    );
  }

  /* *********************************** -------------- *********************************************** */


  /* *********************************** SERVICIOS PUT ************************************************ */

  /* *********************************** ------------- ************************************************ */


  /* *********************************** SERVICIOS DELETE ********************************************* */

  /* *********************************** ---------------- ********************************************* */
}
