import { switchMap } from 'rxjs';
import { tap } from 'rxjs';
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Canton, Parish, Province } from '@utils/interfaces/others.interfaces';
import { CommonService } from '@services/common.service';
import { OnDestroyMixin, untilComponentDestroyed } from "@w11k/ngx-componentdestroyed";
import { NgForOf, NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
@Component({
  selector: 'components-combo',
  templateUrl: './combo.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
  styles: [
  ],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgForOf,
    MatFormFieldModule,
    MatSelectModule
  ]
})

export class ComboComponent extends OnDestroyMixin implements OnInit {

/* *************************************** INPUTS & OUTPUTS ***************************************** */

@Output() parishOut: EventEmitter<string> = new EventEmitter();
@Output() provinceOut: EventEmitter<string> = new EventEmitter();
@Output() cantonOut: EventEmitter<string> = new EventEmitter();
/* *************************************** ---------------- ***************************************** */


/* *********************************** VARIABLES GLOBALES ******************************************* */

cargando: boolean = false;
provinces:Province[]=[];
cantonsByProvince: Canton[] = [];
parishByCantons: Parish[] = [];
/* *********************************** ------------------ ******************************************* */


/* *********************************** COSTRUCTOR Y CICLO DE VIDA *********************************** */

  constructor( private fb: FormBuilder,
                private common: CommonService ){
                  super();
                }

  ngOnInit(): void {
    this.common.getFormStatus().subscribe({
      next: (valid: boolean) => {
        if (!valid) {
          this.addressForm.markAllAsTouched();
          this.addressForm.markAsDirty();
        }
        // if (this.addressForm.touched) {
        // }
        // if (valid) {
        //   this.addressForm.markAllAsTouched();
        //   this.addressForm.markAsDirty();
        // }
        // if (valid) {
        //   this.addressForm.markAsUntouched();
        //   this.addressForm.setErrors(null);
        //   this.addressForm.updateValueAndValidity();
        // } else {
        //   this.addressForm.markAllAsTouched();
        //   this.addressForm.markAsDirty();
        // }
      }
    });
    this.loadProvince();

    this.onProvinceChange();

    this.onCantonsChange();

    this.onParishChange();

  }
/* *********************************** -------------------------- *********************************** */


/* *********************************** GETERS Y SETERS ********************************************** */

/* *********************************** -------------------------- *********************************** */


/* *********************************** FORMULARIOS DEL FORMULARIO *********************************** */

addressForm = this.fb.group({
  provinceAddress:  ['', [Validators.required]],
  cantonAddress:    ['', [Validators.required]],
  parishAddress:     ['', [Validators.required]],
});
/* *********************************** -------------------------- *********************************** */


/* *********************************** FUNCIONES VARIAS ********************************************* */

loadProvince(): void{
  this.cargando=true;
  this.common.cargaCombo(6)
  .subscribe( province => {
    this.provinces=province;
    this.cargando=false;
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
    switchMap((province) => {
      this.provinceOut.emit(province || '');
      return this.common.getCantonByProvince(7, province || '')
    }),
    )
    .subscribe( canton => {
    this.cantonsByProvince = canton;
    this.cargando=false
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
    switchMap((cantons) => {
      this.cantonOut.emit(cantons || '');
      return this.common.getParishByCanton(8, cantons || '')
    }),
  )
  .subscribe( parish => {
    this.parishByCantons = parish;
    this.cargando=false
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
    })
}
/* *********************************** -------------------------- *********************************** */
}
