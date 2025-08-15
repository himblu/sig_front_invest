import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdministrativeService } from '@services/administrative.service';

import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Period } from '@utils/interfaces/period.interfaces';

@Component({
  selector: 'app-activation-period',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCheckboxModule
  ],
  templateUrl: './activation-period.component.html',
  styles: [
  ]
})
export class ActivationPeriodComponent implements OnInit {

  /* *************************************** INPUTS & OUTPUTS ***************************************** */
  
  /* *************************************** ---------------- ***************************************** */
  
  
  /* ************************************ LISTAS GETTERS SETTERS ************************************** */
  
  /* *********************************** ------------------ ******************************************* */
  
  
  /* *********************************** VARIABLES GLOBALES ******************************************* */
  
  periodList: Period[] = [];
  /* *********************************** ------------------ ******************************************* */
  
  
  /* *********************************** COSTRUCTOR Y CICLO DE VIDA *********************************** */
  
  constructor( private admin: AdministrativeService ){}
  
  ngOnInit(): void {
    this.loading();
  }
  
  /* *********************************** -------------------------- *********************************** */
  
  
  /* *********************************** GETERS Y SETERS ********************************************** */
  
  /* *********************************** -------------------------- *********************************** */
  
  
  /* *********************************** FORMULARIOS DEL FORMULARIO *********************************** */
  
  /* *********************************** -------------------------- *********************************** */
  
  
  /* *********************************** FUNCIONES VARIAS ********************************************* */
  
  loading(){
    this.admin.getPeriods()
      .subscribe( resp => {
        this.periodList = resp
      })
  }
  /* *********************************** -------------------------- *********************************** */
  
  
  /* ************************************** VALIDACIONES GLOBALES ************************************* */
  
  /* *********************************** -------------------------- *********************************** */
}
