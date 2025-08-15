import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Instruction, Profession } from '@utils/interfaces/enrollment.interface';
import { environment } from '@environments/environment';
import { CivilStatus } from '@utils/interfaces/others.interfaces';

let url = environment.url;

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {

  constructor( private https: HttpClient ) { }

  /* *********************************** LISTAS GETTERS SETTERS ************************************** */
  public listInstruction: Instruction [] = []
  public listProfession: Profession [] = []
  public civilList: CivilStatus [] = []
  /* *********************************** ---------------------- ************************************** */
  
  
  /* *********************************** FUNCIONES VARIAS ********************************************* */
  
  /* *********************************** -------------------------- *********************************** */
  
  
  /* *************************************** SERVICIOS GET ******************************************* */
  
  charging(): void{

    this.https.get<Instruction[]>(`${url}/api/academic-instruction`)
      .subscribe( resp => this.listInstruction = resp);
    
    this.https.get<Profession[]>(`${url}/api/profession`)
      .subscribe( resp => this.listProfession = resp);

    this.https.get<CivilStatus[]>(`${url}/api/general-information/3`)
      .subscribe( resp => this.civilList = resp);

  }

  chargingCivil():Observable<CivilStatus[]>{
    return this.https.get<CivilStatus[]>(`${url}/api/general-information/3`);
  }
  /* *************************************** ------------- ******************************************* */
  
  
  /* *********************************** SERVICIOS POST *********************************************** */
  
  /* *********************************** -------------- *********************************************** */
  
  
  /* *********************************** SERVICIOS PUT ************************************************ */
  
  /* *********************************** ------------- ************************************************ */
  
  
  /* *********************************** SERVICIOS DELETE ********************************************* */
  
  /* *********************************** ---------------- ********************************************* */
}
