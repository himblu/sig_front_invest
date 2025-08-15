import { Component, Inject, inject, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule, MatRippleModule, MatOptionSelectionChange } from '@angular/material/core';
import { DatePipe, NgFor, NgForOf, NgIf } from '@angular/common';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { COMPANY_CODES, ItcaPayment } from '@utils/interfaces/others.interfaces';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CommonService } from '@services/common.service';
import { ConceptOptionPayment, EnrollType } from '@utils/interfaces/enrollment.interface';
import { Period } from '@utils/interfaces/period.interfaces';
import {Cycle, SPGetCareer, StudyPlan} from '@utils/interfaces/campus.interfaces';
import {AdministrativeService} from '@services/administrative.service';

interface DataArray {
	currentPeriodID: number;
	enrollmentTypes: EnrollType[];
	periods: Period[];
	enrollTypeDesc: string;
	careerID : number;
}


@Component({
  selector: 'app-create-or-update-payment',
  standalone: true,
  imports: [
		ReactiveFormsModule,
		MatButtonModule,
		MatDialogModule,
		MatIconModule,
		MatRippleModule,
		NgIf,
		NgFor,
		SpinnerLoaderComponent,
		MatInputModule,
		MatSelectModule,
		MatSnackBarModule,
		MatFormFieldModule,
		MatSlideToggleModule,
		MatDatepickerModule,
		MatNativeDateModule,
	],
	providers: [
		DatePipe,
	],
  templateUrl: './create-or-update-payment.component.html',
  styleUrls: ['./create-or-update-payment.component.css']
})

export class CreateOrUpdatePaymentComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public isLoading: boolean = false;
	public formPayment!: FormGroup;
	public quotaNumbers!: FormGroup;
	public isUpdating: boolean = false;
	public listEnrollmentType: EnrollType[] = [];
  public listPeriod: Period[] = [];
  public maxDate: string;
  public minDate: string;
	public isChecked = false;
	public valid = true;
	public cycles: Cycle[] = [];
	public careers: SPGetCareer[] = [];
	public careerIDSelected: number = 0;
	public isGettingNotes: boolean= false;
	public studyPlans: StudyPlan[] = [];
	public showArrastre = false;
	public arrastreId: number = 0;
	public enrollmentTypeDescSelected: string = '';
	private conceptsOptionPayment: ConceptOptionPayment[] = [];
	private snackBar: MatSnackBar = inject(MatSnackBar);
	private datePipe: DatePipe = inject(DatePipe);
	private common: CommonService = inject(CommonService);
	private admin: AdministrativeService = inject(AdministrativeService);

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: { array: DataArray, item?: ItcaPayment },
		private dialogRef: MatDialogRef<CreateOrUpdatePaymentComponent>,
		private fb: FormBuilder,
	) {
		super();
		this.initForm();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	ngOnInit(): void {
		if (!this.data.item) {
			this.formPayment.get('periodID').patchValue(this.data.array.currentPeriodID);
			const period: Period= this.listPeriod.filter(item => item.periodID === this.data.array.currentPeriodID)[0];
			if(period) this.getDates(period, true);
		}
		else{
			//console.log('flgEdit', this.data.item.flgEdit);
			this.isUpdating= true;
			const period: Period= this.listPeriod.filter(item => item.periodID === this.data.item.periodID)[0];
			if(period) this.getDates(period, true);
			this.formPayment.patchValue(this.data.item);
			this.filledArrayQuota();
			if(+this.data.item.discount > 0) this.isChecked= true;
			this.getConceptsOptionPayment();
			if(!this.data.item.flgEdit){
				const controls = this.formPayment.controls;
				for (const name in controls) {
					if(name !== 'endDate') this.formPayment.get(name)?.disable();
				}
				const quota= this.quotaNumbers.get('quota') as FormArray;
				for(let i=0; i<quota.value.length; i++){
					let obj= quota.controls[i] as FormGroup;
					obj.get('amount')?.disable();
					obj.get('expirationDate')?.disable();
				}
			}else {
				this.formPayment.get('quotaNumber')?.disable();
				this.formPayment.get('periodID')?.disable();
			}
		}
		if (this.isUpdating && this.showArrastre) {
			// ya parchaste careerID, studyPlanID y cycleID
			// dispara la recarga en cascada:
			const cId  = this.formPayment.get('careerID')!.value;
			const spId = this.formPayment.get('studyPlanID')!.value;
			this.getCareerByID();
			if (cId)  this.getStudyPlans(cId);
			if (spId) this.getCycleByStudyPlanID(spId);
		}
		this.listEnrollmentType= this.data.array.enrollmentTypes;
		this.listPeriod= this.data.array.periods;
		this.careerIDSelected= this.data.array.careerID;
		this.enrollmentTypeDescSelected= this.data.array.enrollTypeDesc;
		if(this.enrollmentTypeDescSelected.toUpperCase() === 'ARRASTRE') {
			this.showArrastre = true;
			this.onEnrollTypeChange(3);
			this.formPayment.get('careerID')!.setValue(this.careerIDSelected);
			this.getStudyPlans(this.careerIDSelected);
		}
	}

	private getConceptsOptionPayment(): void {
		this.common.getConceptsOptionPayment(this.data.item.paymentOptionID).subscribe({
			next: (res) => {
				this.conceptsOptionPayment= res;
				for(let i=0; i<res.length; i++){
					if(i > 0) this.quotaNumbersForm.controls[i-1].patchValue(res[i]);
				}
			},
			error: (err: HttpErrorResponse) => {
				//console.log(err);
			}
		})
	}

	public initForm(): void {
    this.formPayment = this.fb.group({
      paymentOptionID: [''],
      conditions: ['O', Validators.required],
      enrollTypeID: ['', Validators.required],
			careerID:    null,
			studyPlanID:  null,
			cycleID:      null,
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      quotaNumber: ['', Validators.required],
      amountEnroll: ['', Validators.required],
      tariff: ['', Validators.required],
      discount: [0, Validators.required],
      totalAmount: [0, Validators.required],
      periodID: ['', Validators.required],
      companyID: [COMPANY_CODES.ITCA, Validators.required],
      paymentOptionDesc: ['', Validators.required],
      statusID: '',
      user: [String(sessionStorage.getItem('name'))]
    });

    this.quotaNumbers = this.fb.group({
      quota: this.fb.array([])
    });
  }

	public changePeriod(): void {
		const control = <FormArray>this.quotaNumbers.controls['quota'];
		control.controls.forEach((x: any) => {
			x.get('periodID')?.setValue(this.formPayment.get('periodID')?.value);
		});
	}

	getDates(period: Period, event: boolean) {
    if(event){
			this.maxDate = period.periodDateEnd.toString();
    	this.minDate = period.periodDateStart.toString();
		}
  }

	filledArrayQuota() {
    const numberQuots = this.formPayment.get('quotaNumber')?.value;
    this.getRange(numberQuots);
  }

	addFormQuota(index: number) {
		const control = <FormArray>this.quotaNumbers.get('quota');
		control.push(this.initQuota(index));
	}

	initQuota(index: number) {
		return this.fb.group({
			periodID: [this.formPayment.get('periodID')?.value, Validators.required],
			companyID: [COMPANY_CODES.ITCA, Validators.required],
			paymentOptionID: [0],
			conceptsPaymentID: [index, Validators.required],
			amount: ['', Validators.required],
			expirationDate: [this.getDateExpired(index), Validators.required],
			user: [Number(sessionStorage.getItem('userId')), Validators.required]
		});
	}

	get quotaNumbersForm(): FormArray {
    return this.quotaNumbers.get('quota') as FormArray;
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

	getDateExpired(i: number) {
    const dateEnd = new Date(this.formPayment.get('endDate')?.value);
    if (dateEnd) {
      dateEnd.setMonth(dateEnd.getMonth() + (i - 1));
      dateEnd.setDate(16);
    }
    return dateEnd;
  }

	getStatus() {
    if (this.isChecked) {
      this.formPayment.get('discount')?.setValue(0);
      this.blurCalcAmount();
    }
  }

	blurCalcAmount() {
    let totalAmount = 0;
    if (+this.formPayment.get('tariff')?.value > 0) {
      totalAmount += +this.formPayment.get('tariff')?.value;
    }
    if (+this.formPayment.get('amountEnroll')?.value > 0) {
      totalAmount += +this.formPayment.get('amountEnroll')?.value;
    }
    if (+this.formPayment.get('discount')?.value > 0) {
      totalAmount -= (+this.formPayment.get('discount')?.value / 100) * totalAmount;
    }
    let n = parseFloat(totalAmount.toFixed(2))
    this.formPayment.get('totalAmount')?.setValue(n);
  }

	setPaymentId(paymentId: number) {
    const control = <FormArray>this.quotaNumbers.controls['quota'];
    control.controls.forEach((x: any) => {
      x.get('paymentOptionID')?.setValue(paymentId);
    });
  }

	public onSubmit(): void {
		if(!this.isUpdating) this.postPayment();
		else{
			if(this.data.item.flgEdit) this.postPayment();
			else this.updatePayment();
		}
	}

	public postPayment(): void {
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

    if (this.formPayment.get('discount')?.value == 0) {
      this.formPayment.get('conditions')?.setValue('O');
    }

    let quota = this.quotaNumbers.get('quota')?.getRawValue()
    let arr = []
    for (let i = 0; i < quota.length; i++) {
      arr[i] = +quota[i].amount;
    }
    let total = 0
    for (let i of arr) total += i;
    total = parseFloat(total.toFixed(2))
    if (total == this.formPayment.get('tariff')?.value) {
      this.valid = true;
			let optionUrl;
			if(this.isUpdating) optionUrl= this.common.putOptionPaymentOptions(this.formPayment.getRawValue());
			else optionUrl= this.common.saveOptionPayment(this.formPayment.getRawValue());
      optionUrl.subscribe({
        next: (res: any) => {
          if (res && res.length > 0 && res[0]?.error === 409) {
            this.common.message(res[0]?.message, '', 'error', '#f5637e');
          } else {
            if(!this.isUpdating) this.setPaymentId(res[0].paymentOptionID);
						let conceptUrl;
						if(this.isUpdating){
							let body= [];
							body.push(this.conceptsOptionPayment[0]);
							body[0].amount= this.formPayment.value.amountEnroll;
							body[0].expirationDate= this.formPayment.value.endDate;
							body[0].careerID= this.formPayment.value.careerID;
							body[0].studyPlanID = this.formPayment.value.studyPlanID;
							body[0].cycleID = this.formPayment.value.cycleID;
							body[0].user= String(sessionStorage.getItem('name'));
							for(let i=0; i<this.quotaNumbers.get('quota')?.getRawValue().length; i++){
								body.push(this.quotaNumbers.get('quota')?.getRawValue()[i]);
							}
							conceptUrl= this.common.putConceptPayment(body);
						}
						else conceptUrl= this.common.saveConceptPayment(this.quotaNumbers.get('quota')?.getRawValue());
            conceptUrl.subscribe({
              next: (res: any) => {
                if (res && res.length > 0 && res[0]?.error === 409) {
                  this.common.message(res[0]?.message, '', 'error', '#f5637e');
                } else {
                  this.common.message('Datos guardados correctamente', '', 'success', '#2eb4d8');
                  this.dialogRef.close(res);
                }
              }
            });
          }
        }
      });
    } else {
      this.valid = false;
    }
	}

	public updatePayment(statusID?: number): void {
    this.isLoading = true;
    this.formPayment.get('amountEnroll')?.patchValue(+this.formPayment.get('amountEnroll')?.value);
    this.formPayment.get('tariff')?.patchValue(+this.formPayment.get('tariff')?.value);
		this.formPayment.get('careerID')?.patchValue(+this.formPayment.get('careerID')?.value);
		this.formPayment.get('studyPlanID')?.patchValue(+this.formPayment.get('studyPlanID')?.value);
		this.formPayment.get('cycleID')?.patchValue(+this.formPayment.get('cycleID')?.value);
    if (statusID! >= 0) this.formPayment.get('statusID')?.patchValue(statusID);
    if (this.formPayment.valid) {
      //console.log(this.formPayment.value);
      this.common.putOptionPayment(this.formPayment.getRawValue()).subscribe({
        next: (res) => {
          this.common.message('Datos actualizados correctamente', '', 'success', '#2eb4d8');
          this.isLoading = false;
					this.dialogRef.close(res);
        },
        error: (err: HttpErrorResponse) => {
          //console.log(err);
          this.isLoading = false;
        }
      });
    }
  }
	public getStudyPlans(careerID: number | string): void {
		if(careerID !== '')	this.admin.getCareerDetailCatalog(+careerID).subscribe({
			next: (res: StudyPlan[]) => {
				//console.log(res);
				this.studyPlans = res;
			},
			error: (err: HttpErrorResponse) => {
			},
			complete: () => {
			}
		});
		 this.getCycleByStudyPlanID(this.formPayment.get('studyPlanID')?.value);
	}
	public getCycleByStudyPlanID(studyPlanID: number | string): void {
		if(studyPlanID !== '')	this.admin.getCycleByStudyPlan(+studyPlanID).subscribe({
			next: (res: Cycle[]) => {
				// console.log(res);
				this.cycles = res;
			},
			error: (err: HttpErrorResponse) => {
			},
			complete: () => {
			}
		});
	}

	public getCareerByID(): void {
		const periodID = this.formPayment.get('periodID')?.value;
		this.admin.getCareerByPeriod(periodID).subscribe({
			next: (value: SPGetCareer[]) => {
				this.careers = value;
				if (this.careerIDSelected > 0 ){
				this.formPayment.get('careerID')!.setValue(this.careerIDSelected);
			}
			},
			error: (err: HttpErrorResponse) => {
				console.error('Error al cargar carreras:', err);
			}
		});
	}



	public onEnrollTypeChange(selectedId: number) {
		this.arrastreId = this.listEnrollmentType
			.find(x => x.enrollTypeDesc.toLowerCase() === 'arrastre')
			?.enrollTypeID!;
		this.showArrastre = (selectedId === this.arrastreId);

		const career    = this.formPayment.get('careerID')!;
		const studyPlan = this.formPayment.get('studyPlanID')!;
		const cycle     = this.formPayment.get('cycleID')!;
		if (this.showArrastre) {
			// Agrega el required
			career?.setValidators(Validators.required );
			studyPlan?.setValidators(Validators.required );
			cycle?.setValidators( Validators.required );
		} else {
			// Quita el required
			career.clearValidators();
			studyPlan.clearValidators();
			cycle.clearValidators();
			// Opcional: limpia sus valores
			this.formPayment.patchValue({
				careerID:     0,
				studyPlanID: 0,
				cycleID:     0
			});
		}
		this.getCareerByID();
		// this.getCycleByStudeyPlanID();
		// Re-calcular el estado de validación
		career.updateValueAndValidity();
		studyPlan.updateValueAndValidity();
		cycle.updateValueAndValidity();
	}

	public onCareerChange(careerID: number): void {
		// Si estamos en modo creación, limpiamos hijos
		if (!this.isUpdating) {
			this.studyPlans = [];
			this.formPayment.get('studyPlanID')!.reset();
			this.cycles = [];
			this.formPayment.get('cycleID')!.reset();
		}
		// Luego recargamos las mallas
		this.getStudyPlans(careerID);
	}

	public onStudyPlanChange(studyPlanID: number): void {
		if (!this.isUpdating) {
			this.cycles = [];
			this.formPayment.get('cycleID')!.reset();
		}
		this.getCycleByStudyPlanID(studyPlanID);
	}
}
