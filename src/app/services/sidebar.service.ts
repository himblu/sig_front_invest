import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { map } from 'rxjs';
import { UserService } from '@services/user.service';
import { AdministrativeService } from './administrative.service';

@Injectable({
  providedIn: 'root'
})

export class SidebarService {
  private userService: UserService = inject(UserService);
  constructor(
    private http: HttpClient,
    private Administrative: AdministrativeService
  ) { }
     
  /*getMenuFrontEnd(){
    const url = environment.url;
    const role = sessionStorage.getItem('rol');
    const userId = sessionStorage.getItem('id');

    let menuSecretaria: any[] = [];
    let menuBienestar: any[] = [];
    let menuFinanciero: any[] = [];
    let menuEstudiante: any[] = [];

    this.http.get(`${url}/api/menu/user/1/${userId}`)
      .subscribe((response: any) => {
          console.log("menu",response);
          if (role === 'SECRETARIA GENERAL') {
            return menuSecretaria = response;
          }
          else if (role === 'BIENESTAR INSTITUCIONAL') {
            return menuBienestar = response;
          }
          else if (role === 'FINANCIERO') {
            return menuFinanciero = response;
          }
          else if (role === 'ESTUDIANTE') {
            return menuEstudiante = response;
          }
          else {
            return menuEstudiante = response;
          }

        }, (error) => {
          console.error('Error en la solicitud HTTP:', error);
        }
      );
  }*/
  
  /*getMenuFrontEnd() {
    const url = environment.url;
    const role = sessionStorage.getItem('rol');
    const userId = sessionStorage.getItem('id');

    return this.http.get(`${url}/api/menu/user/1/${userId}`);
  }*/

  getMenuFrontEnd() {
    const url = environment.url;
    let userID: any = +sessionStorage.getItem('userId');
    let rolID: any = +sessionStorage.getItem('rolID');
    let companyID: any = 1;
    return this.http.get<any[]>(`${url}/api/menu/user-rol-company/${userID}/${rolID}/${companyID}`).pipe(
      map((response: any[]) => {
        // console.log(response);
        // Mapear la respuesta del API al formato deseado
        return response.map(item => ({
          titulo: item.menu,
          icono: item.icon,
          menuID: item.menuID,
          submenu: item.rute.map((subitem: { title: any; route: any; }) => ({
            titulo: subitem.title,
            url: subitem.route
          }))
        }));
      })
    );
  }
} 
