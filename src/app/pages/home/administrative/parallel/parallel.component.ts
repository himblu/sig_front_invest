import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { Router } from '@angular/router';
import { ComboComponent } from '../../enrollment/pages/components/combo/combo.component';
import { CommonService } from '@services/common.service';

@Component({
  selector: 'app-parallel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIf,
    NgFor,
    ReactiveFormsModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    ComboComponent,
    NgxMaskDirective
  ],
  templateUrl: './parallel.component.html',
  styles: [
  ],
  providers: [
    DatePipe,
    provideNgxMask()
  ]
})
export class ParallelComponent implements OnInit {

  /* *********************************** COSTRUCTOR Y CICLO DE VIDA *********************************** */

  constructor(private fb: FormBuilder,
    private common: CommonService,
    private router: Router
    ) { }

  ngOnInit(): void {
  }

  /* *********************************** -------------------------- *********************************** */


  /* *********************************** GETERS Y SETERS ********************************************** */

  /* *********************************** -------------------------- *********************************** */


  /* *********************************** FORMULARIOS DEL FORMULARIO *********************************** */

  public parallelForm: FormGroup = this.fb.group({
    parallelCode: ['', [Validators.required]],
    parallelDesc: ['', [Validators.required]],
    user: [Number(sessionStorage.getItem('userId')), [Validators.required]],
  });
  /* *********************************** -------------------------- *********************************** */


  /* *********************************** FUNCIONES VARIAS ********************************************* */

  saveParallel() {
    if (!this.parallelForm.valid) {
      this.parallelForm.markAllAsTouched();
      this.common.message('Revise los campos en color rojo', '', 'error', '#f5637e');
      return;
    }
    this.common.saveParallel(this.parallelForm.value)
      .subscribe((resp:any) => {
        console.log(resp);
        this.common.message('Paralelo guardado correctamente', '', 'success', '#86bc57');
        this.router.navigate(['/']);
      })
  }

  /* *********************************** -------------------------- *********************************** */


  /* ************************************** VALIDACIONES GLOBALES ************************************* */

  isValidField(field: string): boolean | null {
    return this.parallelForm.controls[field].errors
      && this.parallelForm.controls[field].touched;
  }

  getFielError(field: string): string | null {
    if (!this.parallelForm.controls[field]) return null;
    const errors = this.parallelForm.controls[field].errors || {};
    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
          return 'Campo requerido!';
      }
    }
    return '';
  }

  /* *********************************** -------------------------- *********************************** */
}
