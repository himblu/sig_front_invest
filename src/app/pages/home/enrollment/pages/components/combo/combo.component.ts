import { Component, OnInit, EventEmitter, Output, Input, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { OnDestroyMixin, untilComponentDestroyed } from "@w11k/ngx-componentdestroyed";

import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { switchMap, tap } from 'rxjs';
import { Canton, Parish, Province } from '@utils/interfaces/others.interfaces';
import { CommonService } from '@services/common.service';

@Component({
  selector: 'enrollment-combo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,

  ],
  templateUrl: './combo.component.html',
  styles: [
  ]
})
export class ComboComponent extends OnDestroyMixin implements OnInit, AfterViewInit{

  /* *************************************** INPUTS & OUTPUTS ***************************************** */

  @Output() parishOut: EventEmitter<string> = new EventEmitter();
  @Output() provinceOut: EventEmitter<string> = new EventEmitter();
  @Output() cantonOut: EventEmitter<string> = new EventEmitter();
  @Output() getStatusForm: EventEmitter<any> = new EventEmitter();
  @Input('province') province: string = '';
  @Input('canton') canton: string = '';
  @Input('parish') parish: string = '';
  @Input('formP') formP: any;

  /* *************************************** ---------------- ***************************************** */


  /* ************************************ LISTAS GETTERS SETTERS ************************************** */

  /* *********************************** ------------------ ******************************************* */


  /* *********************************** VARIABLES GLOBALES ******************************************* */

  cargando:           boolean = false;
  provinces:          Province[] = [];
  cantonsByProvince:  Canton[] = [];
  parishByCantons:    Parish[] = [];
  addressForm: FormGroup;
  /* *********************************** ------------------ ******************************************* */


  /* *********************************** COSTRUCTOR Y CICLO DE VIDA *********************************** */

  constructor( private fb: FormBuilder,
                private common: CommonService ){
                  super();
                }

  ngOnInit(): void {
    this.addressForm = this.fb.group({
      provinceAddress:  ['', [Validators.required]],
      cantonAddress:    ['', [Validators.required]],
      parishAddress:    ['', [Validators.required]],
    });

    this.getStatusForm.emit(this.addressForm);

    this.loadProvince();

    this.onProvinceChange();

    this.onCantonsChange();

    this.onParishChange();


  }

  ngAfterViewInit(): void {
  }

  /* *********************************** -------------------------- *********************************** */


  /* *********************************** GETERS Y SETERS ********************************************** */

  /* *********************************** -------------------------- *********************************** */


  /* *********************************** FORMULARIOS DEL FORMULARIO *********************************** */



  /* *********************************** -------------------------- *********************************** */


  /* *********************************** FUNCIONES VARIAS ********************************************* */

  compareWithProvince(obj1:any,obj2:any){
    return obj1 && obj2 && (obj1 === Number(obj2));
  }

  compareWithParish(obj1:any,obj2:any){

    return obj1 && obj2 && (obj1 === Number(obj2));
  }

  compareWithCanton(obj1:any,obj2:any){
    return obj1 && obj2 && (obj1 === Number(obj2));
  }

  loadProvince(): void{
    // this.cargando=true;
    this.common.cargaCombo(6)
    .subscribe( province => {
      this.provinces=province;
      this.cargando=false;
      if(this.province != '' && this.province != 'null'){
        this.addressForm.get('provinceAddress')?.patchValue(this.province);
      }
      },(err) => {
        console.log(err);

        this.common.message(`${err.error.error}`,'','error','#f5637e');
        this.cargando=false;
      })
  }

  onProvinceChange(): void{
    this.addressForm.get('provinceAddress')?.valueChanges
    .pipe(
        untilComponentDestroyed( this ),
      tap( () => this.addressForm.get('cantonAddress')!.setValue('') ),
      switchMap((province) => this.common.getCantonByProvince(7, province || '')),
      )
      .subscribe( canton => {
      this.cantonsByProvince = canton;
      this.cargando=false
      this.addressForm.get('cantonAddress')?.setValue(this.canton);
    },(err) => {
      console.log(err);

      this.common.message(`${err.error.error}`,'','error','#f5637e');
      this.cargando=false;
    })
  }

  onCantonsChange(): void{
    this.cargando= true;
    this.addressForm.get('cantonAddress')?.valueChanges
    .pipe(
      untilComponentDestroyed( this ),
      tap( () => this.addressForm.get('parishAddress')!.setValue('') ),
      switchMap((cantons) => this.common.getParishByCanton(8, cantons || '')),
    )
    .subscribe( parish => {
      this.parishByCantons = parish;
      this.cargando=false
      this.addressForm.get('parishAddress')?.setValue(this.parish);
    },(err) => {
      console.log(err);

      this.common.message(`${err.error.error}`,'','error','#f5637e');
      this.cargando=false;
    })
  }

  onParishChange(): void{
    this.addressForm.get('parishAddress')?.valueChanges
      .pipe(
        untilComponentDestroyed( this )
      )
      .subscribe( resp => {
        this.parishOut.emit(resp || '');
        this.cantonOut.emit(this.addressForm.get('provinceAddress')?.value || '');
        this.provinceOut.emit(this.addressForm.get('cantonAddress')?.value || '');
      })
  }
  /* *********************************** -------------------------- *********************************** */
}
