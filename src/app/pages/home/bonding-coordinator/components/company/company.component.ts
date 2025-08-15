import { Component, ViewChild, ElementRef, OnInit, OnDestroy, SecurityContext, Inject, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, FormArray, FormsModule } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { HttpErrorResponse } from '@angular/common/http';
import { map, Subscription } from 'rxjs';
import { NgForOf, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatRippleModule } from '@angular/material/core';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { UserService } from '@services/user.service';
import { ApiService } from '@services/api.service';
import { Agreement, AgreementCareers, ApprovalBusinessType, SPGetCareer } from '@utils/interfaces/campus.interfaces';
import { AdministrativeService } from '@services/administrative.service';
import { Period } from '@utils/interfaces/period.interfaces';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonService } from '@services/common.service';
import { Agreementtype } from '@utils/interfaces/person.interfaces';

@Component({
  selector: 'app-company',
  standalone: true,
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.css'],
	imports: [
		NgIf,
		NgForOf,
		ReactiveFormsModule,
		FormsModule,
		MatInputModule,
		MatButtonModule,
		MatFormFieldModule,
		MatIconModule,
		MatDialogModule,
		SpinnerLoaderComponent,
		MatDatepickerModule,
		MatSelectModule,
		MatSnackBarModule
	],
})
export class CompanyComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public isLoading: boolean = false;
	public isUpdating: boolean;
	public agreementForm!: FormGroup;
	public businessCareerForm!: FormGroup;
	public careers: SPGetCareer[] = [];
	public periods: Period[] = [];
	public approvalBusinessType: ApprovalBusinessType[] = [];
	public agreementType: Agreementtype[] = [];

	private snackBar: MatSnackBar = inject(MatSnackBar);

	constructor( @Inject(MAT_DIALOG_DATA) private data: { updating: boolean, item?: Agreement  },
		private dialogRef: MatDialogRef<CompanyComponent>,
		private fb: FormBuilder,
		private api: ApiService,
		private admin: AdministrativeService,
		private common: CommonService,
		private user: UserService ){
		super();
		this.initForm();
	}

	ngOnInit(): void {
		this.getCareers();
		this.getPeriods();
		this.getApprovalBusinessType();
		this.getAgreementsType();
		//console.log(this.data);
		this.isUpdating= this.data.updating;
		if(this.data.item){
			this.getBusiness(this.data.item);
			this.agreementForm.get('p_bussinesName').patchValue(this.data.item.bussinesName);
			this.agreementForm.get('p_typeBusiness').patchValue(this.data.item.typeBusiness);
			this.agreementForm.get('p_ruc').patchValue(this.data.item.ruc);
			this.agreementForm.get('p_tradename').patchValue(this.data.item.tradename);
		}
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	public initForm():void{
    this.agreementForm = this.fb.group({
      p_ruc: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(13)]],
			p_typeBusiness: ['', [Validators.required, Validators.maxLength(7)]],
			p_bussinesName: ['', [Validators.required]],
			p_legalRepresentative: ['', [Validators.required]],
			p_position: ['', [Validators.required]],
			p_tradename: [''],
			p_businessPhone: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(10)]],
			p_bussinessEmail: ['', [Validators.required]],
			p_location: ['', [Validators.required]],
			p_referenceBusiness: [null],
			p_fiscalYears: [null],
			p_economicSector: ['', [Validators.required]],
			p_responsibleName: ['', [Validators.required]],
			p_responsiblePosition: [''],
			p_responsiblePhone: [''],
			p_responsibleEmail: [''],
			p_agreementsID: ['', [Validators.required]],
			p_user: this.user.currentUser.userName,
    });

		this.businessCareerForm = this.fb.group({
			p_ruc: ['', [Validators.required]],
			p_careerID: ['', [Validators.required]],
			p_periodID: ['', [Validators.required]],
			p_initdatePractice: ['', [Validators.required]],
			p_enddatePractice: ['', [Validators.required]],
			p_initdateAgreement: ['', [Validators.required]],
			p_enddateAgreement: ['', [Validators.required]],
			p_user: this.user.currentUser.userName,
		});
	}

	public getCareers():void{
		this.admin.getAgreementCareers().subscribe({
      next: (res) => {
				this.careers = res;
      }
    });
	}

	public getPeriods():void{
		this.api.getPeriods().subscribe({
      next: (res) => {
				this.periods = res.data;
      }
    });
	}

	public getBusiness(item: Agreement):void {
		this.admin.getBusinessCareer(item.ruc).subscribe({
      next: (res: AgreementCareers[]) => {
				//console.log('Business', res);
				this.agreementForm.get('p_ruc').patchValue(item.ruc);
				this.businessCareerForm.get('p_ruc').patchValue(item.ruc);
				if(res[0]){
					this.agreementForm.get('p_typeBusiness').patchValue(res[0].typeBusiness);
					this.agreementForm.get('p_bussinesName').patchValue(res[0].bussinesName);
					this.agreementForm.get('p_legalRepresentative').patchValue(res[0].legalRepresentative);
					this.agreementForm.get('p_position').patchValue(res[0].position);
					this.agreementForm.get('p_tradename').patchValue(res[0].tradename);
					this.agreementForm.get('p_businessPhone').patchValue(res[0].businessPhone);
					this.agreementForm.get('p_bussinessEmail').patchValue(res[0].bussinessEmail);
					this.agreementForm.get('p_referenceBusiness').patchValue(res[0].referenceBusiness);
					this.agreementForm.get('p_fiscalYears').patchValue(res[0].fiscalYears);
					this.agreementForm.get('p_economicSector').patchValue(res[0].economicSector);
					this.agreementForm.get('p_responsibleName').patchValue(res[0].responsibleName);
					this.agreementForm.get('p_responsiblePosition').patchValue(res[0].responsiblePosition);
					this.agreementForm.get('p_responsiblePhone').patchValue(res[0].responsiblePhone);
					this.agreementForm.get('p_responsibleEmail').patchValue(res[0].responsibleEmail);
					this.agreementForm.get('p_location').patchValue(res[0].location);
					this.agreementForm.get('p_agreementsID').patchValue(res[0].agreementsID);
					this.businessCareerForm.get('p_careerID').patchValue(res[0].careerID);
					this.businessCareerForm.get('p_periodID').patchValue(res[0].periodID);
					this.businessCareerForm.get('p_initdatePractice').patchValue(res[0].initdatePractice);
					this.businessCareerForm.get('p_enddatePractice').patchValue(res[0].enddatePractice);
					this.businessCareerForm.get('p_initdateAgreement').patchValue(res[0].initdateAgreement);
					this.businessCareerForm.get('p_enddateAgreement').patchValue(res[0].enddateAgreement);
				}
      },
			error: (err: HttpErrorResponse) => {
			}
    });
	}

	public onSubmit(): void{
		if(this.agreementForm.valid){
			this.businessCareerForm.get('p_ruc').patchValue((this.agreementForm.get('p_ruc').value).toString());
			this.agreementForm.get('p_ruc').patchValue((this.agreementForm.get('p_ruc').value).toString());
			this.agreementForm.get('p_businessPhone').patchValue((this.agreementForm.get('p_businessPhone').value).toString());
			if(this.agreementForm.get('p_responsiblePhone').value) this.agreementForm.get('p_responsiblePhone').patchValue((this.agreementForm.get('p_responsiblePhone').value).toString());
			let obj = JSON.parse(JSON.stringify(this.agreementForm.value, [
				"p_ruc",
				"p_typeBusiness",
				"p_bussinesName",
				"p_legalRepresentative",
				"p_position",
				"p_tradename",
				"p_businessPhone",
				"p_bussinessEmail",
				"p_location",
				"p_referenceBusiness",
				"p_fiscalYears",
				"p_economicSector",
				"p_responsibleName",
				"p_responsiblePosition",
				"p_responsiblePhone",
				"p_responsibleEmail",
				"p_agreementsID",
				"p_user",
			]))

			this.admin.postBusiness(obj).subscribe({
				next: (res) => {
					//console.log(res);
					//this.onSubmitBusiness();
					this.initForm();
					this.dialogRef.close(res);
				},
				error: (err: HttpErrorResponse) => {
					//console.log(err);
					this.snackBar.dismiss();
					this.snackBar.open(
						`${err.error.message[0]}`,
						undefined,
						{
							horizontalPosition: 'center',
							verticalPosition: 'top',
							duration: 4000,
							panelClass: ['red-snackbar']
						}
					);
				}
			});
		}else{
			this.agreementForm.markAllAsTouched();
			this.businessCareerForm.markAllAsTouched();
		}
	}

	public onSubmitBusiness(): void {
		let obj = JSON.parse(JSON.stringify(this.businessCareerForm.value, [
			"p_ruc",
			"p_careerID",
			"p_periodID",
			"p_initdatePractice",
			"p_enddatePractice",
			"p_initdateAgreement",
			"p_enddateAgreement",
			"p_user",
		]))

		this.admin.postBusinessCareer(obj).subscribe({
			next: (res) => {
				//console.log(res);
				this.initForm();
				this.dialogRef.close(res);
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	public updateAgreement(): void{
		if(this.agreementForm.valid){
			this.businessCareerForm.get('p_ruc').patchValue((this.agreementForm.get('p_ruc').value).toString());
			this.agreementForm.get('p_ruc').patchValue((this.agreementForm.get('p_ruc').value).toString());
			this.agreementForm.get('p_businessPhone').patchValue((this.agreementForm.get('p_businessPhone').value).toString());
			if(this.agreementForm.get('p_responsiblePhone').value) this.agreementForm.get('p_responsiblePhone').patchValue((this.agreementForm.get('p_responsiblePhone').value).toString());
			//console.log(this.agreementForm.value);
			let obj = JSON.parse(JSON.stringify(this.agreementForm.value, [
				"p_ruc",
				"p_typeBusiness",
				"p_bussinesName",
				"p_legalRepresentative",
				"p_position",
				"p_tradename",
				"p_businessPhone",
				"p_bussinessEmail",
				"p_location",
				"p_referenceBusiness",
				"p_fiscalYears",
				"p_economicSector",
				"p_responsibleName",
				"p_responsiblePosition",
				"p_responsiblePhone",
				"p_responsibleEmail",
				"p_agreementsID",
				"p_user",
			]))

			this.admin.putBusiness(obj).subscribe({
			next: (res) => {
				//console.log(res);
				//this.updateBusiness();
				this.initForm();
				this.dialogRef.close(res);
			},
			error: (err: HttpErrorResponse) => {
				this.snackBar.dismiss();
				this.snackBar.open(
					`No se pudo guardar, intente nuevamente`,
					undefined,
					{
						horizontalPosition: 'center',
						verticalPosition: 'top',
						duration: 4000,
						panelClass: ['red-snackbar']
					}
				);
			}
		});
		}else{
			this.agreementForm.markAllAsTouched();
			this.businessCareerForm.markAllAsTouched();
		}
	}

	public updateBusiness(): void {
		let obj = JSON.parse(JSON.stringify(this.businessCareerForm.value, [
			"p_ruc",
			"p_careerID",
			"p_periodID",
			"p_initdatePractice",
			"p_enddatePractice",
			"p_initdateAgreement",
			"p_enddateAgreement",
			"p_user",
		]))

		this.admin.putBusinessCareer(obj).subscribe({
			next: (res) => {
				//console.log(res);
				this.initForm();
				this.dialogRef.close(res);
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	public getApprovalBusinessType(): void{
		this.common.getApprovalBusinessType().subscribe({
			next: (res) => {
				this.approvalBusinessType= res;
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	private getAgreementsType(): void{
		this.isLoading= true;
		this.common.getAgreementsType().subscribe({
			next: (res: Agreementtype[]) => {
				//console.log(res);
				this.isLoading = false;
				this.agreementType = res
			},
			error: (err: HttpErrorResponse) => {
					this.isLoading = false;
			}
		});
	}

	public validateMail(input: HTMLInputElement): void {
		if(input.value.includes('@')){
			this.agreementForm.get('p_bussinessEmail').setErrors(null);
		}else{
			this.agreementForm.get('p_bussinessEmail').setErrors({'incorrect': true});
		}
	}

}
