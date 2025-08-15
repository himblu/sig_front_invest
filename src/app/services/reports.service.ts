import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Utils } from '@utils/index';
import { GeneralResponse } from '@utils/interfaces/calendar.interface';
import { Period } from '@utils/interfaces/period.interfaces';
import { Observable, map } from 'rxjs';

let url: string = environment.url;

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  constructor( private https: HttpClient ) { }

  /* *********************************** LISTAS GETTERS SETTERS ************************************** */
  
  /* *********************************** ---------------------- ************************************** */
  
  
  /* *********************************** FUNCIONES VARIAS ********************************************* */
  
  /* *********************************** -------------------------- *********************************** */
  
  
  /* *************************************** SERVICIOS GET ******************************************* */
  public getPeriods():Observable<Period[]> {
    return this.https.get<GeneralResponse>(`${url}/api/period`)
      .pipe(map((res: GeneralResponse) => res.data.map((p: Period) => Utils.parsePeriod(p))));
  }
  /* *************************************** ------------- ******************************************* */
  
  
  /* *********************************** SERVICIOS POST *********************************************** */
  
  /* *********************************** -------------- *********************************************** */
  
  
  /* *********************************** SERVICIOS PUT ************************************************ */
  
  /* *********************************** ------------- ************************************************ */
  
  
  /* *********************************** SERVICIOS DELETE ********************************************* */
  
  /* *********************************** ---------------- ********************************************* */
}
