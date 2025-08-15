import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ComboComponent } from '@components/combo/combo.component';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { Router } from '@angular/router';

export interface PeriodicElement {
  number: number;
  detail: string;
  enrollment: string;
  tarif: string;
  numberPayments: string;
  finalCost: string;
  enrollmentType: string;
  status: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { number: 1, detail: 'Matrícula', enrollment: '2021-2022', tarif: '$ 100', numberPayments: '1', finalCost: '$ 100', enrollmentType: 'Matrícula', status: 'Activo' },
  { number: 2, detail: 'Matrícula', enrollment: '2021-2022', tarif: '$ 80', numberPayments: '1', finalCost: '$ 100', enrollmentType: 'Matrícula', status: 'Activo' },
  { number: 3, detail: 'Matrícula', enrollment: '2021-2022', tarif: '$ 70', numberPayments: '1', finalCost: '$ 100', enrollmentType: 'Matrícula', status: 'Activo' },
  { number: 4, detail: 'Matrícula', enrollment: '2021-2022', tarif: '$ 90', numberPayments: '1', finalCost: '$ 100', enrollmentType: 'Matrícula', status: 'Activo' },
  { number: 5, detail: 'Matrícula', enrollment: '2021-2022', tarif: '$ 60', numberPayments: '1', finalCost: '$ 100', enrollmentType: 'Matrícula', status: 'Activo' },
  { number: 6, detail: 'Matrícula', enrollment: '2021-2022', tarif: '$ 50', numberPayments: '1', finalCost: '$ 100', enrollmentType: 'Matrícula', status: 'Activo' },
  { number: 7, detail: 'Matrícula', enrollment: '2021-2022', tarif: '$ 40', numberPayments: '1', finalCost: '$ 100', enrollmentType: 'Matrícula', status: 'Activo' },
  { number: 8, detail: 'Matrícula', enrollment: '2021-2022', tarif: '$ 30', numberPayments: '1', finalCost: '$ 100', enrollmentType: 'Matrícula', status: 'Activo' },
  { number: 9, detail: 'Matrícula', enrollment: '2021-2022', tarif: '$ 20', numberPayments: '1', finalCost: '$ 100', enrollmentType: 'Matrícula', status: 'Activo' },
  { number: 10, detail: 'Matrícula', enrollment: '2021-2022', tarif: '$ 10', numberPayments: '1', finalCost: '$ 100', enrollmentType: 'Matrícula', status: 'Activo' },
];

@Component({
  selector: 'app-create-payment',
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
    NgxMaskDirective,
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './create-payment.component.html',
  styles: [
  ],
  providers: [
    DatePipe,
    provideNgxMask()
  ]
})


export class CreatePaymentComponent implements OnInit {
  displayedColumns: string[] = [
    'number',
    'detail',
    'enrollment',
    'tarif',
    'numberPayments',
    'finalCost',
    'enrollmentType',
    'status',
    'action'
  ];
  dataSource = ELEMENT_DATA;

  formPayment!: FormGroup;
  quotaNumbers!: FormGroup;
  listEnrollmentType: any[] = [];
  listPeriod: any[] = [];

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private common: CommonService,
    private api: ApiService,
    private router: Router
  ) {

  }
  ngOnInit(): void {
    this.initForm();
    this.loadCatalogs();
  }

  initForm() {
    this.formPayment = this.fb.group({
      conditions: ['O', Validators.required],
      enrollTypeID: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      quotaNumber: ['', Validators.required],
      amountEnroll: ['', Validators.required],
      tariff: ['', Validators.required],
      discount: [0, Validators.required],
      totalAmount: [0, Validators.required],
      periodID: ['', Validators.required],
      companyID: [1, Validators.required],
      paymentOptionDesc: [''],
      user: [Number(sessionStorage.getItem('userId'))]
    });

    this.quotaNumbers = this.fb.group({
      quota: this.fb.array([])
    });
  }
  isValidField(field: string): boolean | null {
    // return this.teacherForm.controls[field].errors
    //   && this.teacherForm.controls[field].touched;
    return false;
  }

  getFielError(field: string): string | null {
    // if (!this.teacherForm.controls[field]) return null;

    // const errors = this.teacherForm.controls[field].errors || {};

    // for (const key of Object.keys(errors)) {
    //   switch (key) {
    //     case 'required':
    //       return 'Campo requerido!';
    //     case 'min':
    //       if (errors['min'].min === 1) {
    //         return 'Debe seleccionar una opción!';
    //       } else {
    //         return 'Cantidad Incorrecta!';
    //       }

    //     case 'email':
    //       return 'No es un formato de email valido!';
    //     case 'minlength':
    //       return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    //   }
    // }
    return '';
  }

  addFormQuota(index: number) {
    const control = <FormArray>this.quotaNumbers.get('quota');
    control.push(this.initQuota(index));
  }

  initQuota(index: number) {
    return this.fb.group({
      periodID: [this.formPayment.get('periodID')?.value, Validators.required],
      companyID: [1, Validators.required],
      paymentOptionID: [0],
      conceptsPaymentID: [index, Validators.required],
      amount: ['', Validators.required],
      expirationDate: [this.getDateExpired(index), Validators.required],
      user: [Number(sessionStorage.getItem('userId')), Validators.required]
    });
  }

  getRange(count: number) {
    const control = <FormArray>this.quotaNumbers.controls['quota'];
    control.controls = [];
    if (control.length < count) {
      for (let i = 0; i < count; i++) {
        this.addFormQuota(i + 1);
      }
    }

    control.controls.forEach((x: any) => {
      x.get('periodID')?.setValue(this.formPayment.get('periodID')?.value);
    });

    return control.controls;
  }

  get quotaNumbersForm(): FormArray {
    return this.quotaNumbers.get('quota') as FormArray;
  }

  getDateExpired(i: number) {
    const dateEnd = new Date(this.formPayment.get('endDate')?.value);
    if (dateEnd) {
      dateEnd.setMonth(dateEnd.getMonth() + i);
      dateEnd.setDate(15);
    }
    return this.datePipe.transform(dateEnd, 'yyyy-MM-dd');
  }

  loadCatalogs() {
    this.common.getEnrollmentType().subscribe({
      next: (res: any) => {
        this.listEnrollmentType = res;
      },
      error: (err: any) => {
        console.log(err);
      }
    });
    this.api.getPeriods().subscribe({
      next: (res: any) => {
        this.listPeriod = res.data;

      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }

  saveOptionPayment() {
    if (this.formPayment.invalid) {
      this.formPayment.markAllAsTouched();
      return;
    }
    if (this.quotaNumbersForm.controls.length <= 0) {
      this.common.message('Debe agregar por lo menos una cuota', '', 'error', '#f5637e');
      return;
    }
    if (this.quotaNumbersForm.invalid) {
      this.quotaNumbersForm.markAllAsTouched();
      return;
    }

    if (this.formPayment.get('discount')?.value > 0) {
      this.formPayment.get('conditions')?.setValue('T');
    }
    this.common.saveOptionPayment(this.formPayment.value).subscribe({
      next: (res: any) => {
        
        if (res && res.length > 0 && res[0]?.error === 409) {
          this.common.message(res[0]?.message, '', 'error', '#f5637e');
        } else {
          this.setPaymentId(res[0].paymentOptionID);
          this.common.saveConceptPayment(this.quotaNumbers.get('quota')?.getRawValue()).subscribe({
            next: (res: any) => {
              if (res && res.length > 0 && res[0]?.error === 409) {
                this.common.message(res[0]?.message, '', 'error', '#f5637e');
              } else {
                this.common.message('Datos guardados correctamente', '', 'success', '#2eb4d8');
                this.router.navigate(['/opciones/pagos']);
              }
            }
          });
        }
      }
    });
  }

  changePeriod(eve: any) {
    const control = <FormArray>this.quotaNumbers.controls['quota'];
    control.controls.forEach((x: any) => {
      x.get('periodID')?.setValue(this.formPayment.get('periodID')?.value);
    });
  }

  filledArrayQuota() {
    const numberQuots = this.formPayment.get('quotaNumber')?.value;
    this.getRange(numberQuots);
  }

  setPaymentId(paymentId: number) {
    const control = <FormArray>this.quotaNumbers.controls['quota'];
    control.controls.forEach((x: any) => {
      x.get('paymentOptionID')?.setValue(paymentId);
    });
  }

  blurCalcAmount($event: any) {  
    let totalAmount = 0;
      if (this.formPayment.get('tariff')?.value > 0) {
        totalAmount += this.formPayment.get('tariff')?.value;
      }
      if (this.formPayment.get('discount')?.value > 0) {
        totalAmount -= this.formPayment.get('discount')?.value;
      }
      if (this.formPayment.get('amountEnroll')?.value > 0) {
        totalAmount += this.formPayment.get('amountEnroll')?.value;
      }
      this.formPayment.get('totalAmount')?.setValue(totalAmount);
  }

}
