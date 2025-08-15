import { Component, Inject, inject, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { NgFor, NgForOf, NgIf } from '@angular/common';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { UserService } from '@services/user.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Colaborator, SustantiveFunctions } from '@utils/interfaces/rrhh.interfaces';
import { RrhhService } from '@services/rrhh.service';
import { TimeAvailability } from '@utils/interfaces/campus.interfaces';
import { AdministrativeService } from '@services/administrative.service';
import { ApiService } from '@services/api.service';
import { CommonService } from '@services/common.service';
import { ConsultedStudent } from '@utils/interfaces/person.interfaces';

@Component({
  selector: 'app-sustantive-functions',
  standalone: true,
  imports: [
		ReactiveFormsModule,
		MatButtonModule,
		MatDialogModule,
		MatIconModule,
		MatRippleModule,
		NgIf,
		SpinnerLoaderComponent,
		MatInputModule,
		MatSelectModule,
		MatSnackBarModule,
		MatCheckboxModule,
		NgFor
	],
  templateUrl: './sustantive-functions.component.html',
  styleUrls: ['./sustantive-functions.component.css']
})
export class SustantiveFunctionsComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public isLoading: boolean = false;
	public sustantiveForm!: FormGroup;
	public sustantiveFunctions: SustantiveFunctions[] = [];
	public timeAvailability: TimeAvailability[] = [];
	public currentTeacher: ConsultedStudent;

	private personID: number;
	private currentPeriodID: number;
	private snackBar: MatSnackBar = inject(MatSnackBar);

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: { personID: number, flag: boolean },
		private dialogRef: MatDialogRef<SustantiveFunctionsComponent>,
		private fb: FormBuilder,
		private rrhh: RrhhService,
		private user: UserService,
		private admin: AdministrativeService,
		private api: ApiService,
		private common: CommonService,
	) {
		super();
		this.initSustantiveForm();
		this.getCurrentPeriod();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	ngOnInit(): void {
		this.personID= this.data.personID;
		this.getInformation();
		this.getSustantiveFunctions(this.personID);
	}

	public getCurrentPeriod(): void{
		this.api.getCurrentPeriod().subscribe({
			next: (res) => {
				this.currentPeriodID = res.periodID;
			},
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
			}
		});
	}

	public initSustantiveForm(): void {
		this.sustantiveForm = this.fb.group({
			dynamics: this.fb.array([])
		})
	}

	public sustantiveFormRow(): FormGroup {
		return this.fb.group({
			personID: [null, [Validators.required]],
			scheduleTypeID: [null, [Validators.required]],
			periodID: [null, [Validators.required]],
			amount: [0, [Validators.required]],
			user: this.user.currentUser.userName
		});
	}

	public getSustantiveFormRow(): FormArray {
		return (this.sustantiveForm.controls['dynamics'] as FormArray);
	}

	private addSustantiveFormRow(): void {
		const array = this.getSustantiveFormRow();
		array.push(this.sustantiveFormRow());
	}

	public getInformation(): void {
		this.common.getStudentInformation(this.personID).subscribe({
			next: (resp) => {
				this.currentTeacher= resp;
			}
		})
	}

	public getSustantiveFunctions(personID: number): void{
		this.initSustantiveForm();
		this.isLoading= true;
		this.rrhh.getSustantiveFunctions().subscribe({
			next: (res: SustantiveFunctions[]) => {
				if(res.length){
					for(let i=0; i<res.length; i++){
						this.addSustantiveFormRow();
						if(!this.data.flag) this.getSustantiveFormRow().controls[i].get('amount').disable();
					}
					//console.log(this.sustantiveForm.value);
					this.sustantiveFunctions = res;
					this.getTimeAvailability(personID);
				}
				this.isLoading= false;
			},
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
				this.isLoading= false;
			}
		});
	}

	public getTimeAvailability(personID: number): void {
		this.isLoading= true;
		this.admin.getTimeAvailability(this.currentPeriodID, personID).subscribe({
			next: (res: TimeAvailability[]) => {
				//console.log('TimeAvailability', res);
				if(res.length){
					for(let i=0; i<res.length; i++){
						//this.addSustantiveFormRow();
						this.getSustantiveFormRow().controls[i].patchValue(res[i]);
						this.getSustantiveFormRow().controls[i].get('personID').patchValue(this.personID);
						this.getSustantiveFormRow().controls[i].get('periodID').patchValue(this.currentPeriodID);
						this.getSustantiveFormRow().controls[i].get('scheduleTypeID').patchValue(this.sustantiveFunctions[i].scheduleTypeID);
					}
					this.timeAvailability = res;
				}
				this.isLoading= false;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.isLoading= false;
			}
		});
	}

	public onSubmit(): void {
		if(this.sustantiveForm.valid){
			this.isLoading= true;
			//console.log(this.sustantiveForm.value);
			this.admin.postTimeAvailability(this.sustantiveForm.value).subscribe({
				next: (res:any) => {
					//console.log(res);
					this.snackBar.open(
						`${res.message}`,
						'',
						{
							horizontalPosition: 'center',
							verticalPosition: 'top',
							duration: 4000,
							panelClass: ['green-snackbar']
						}
					);
					this.isLoading= false;
					this.dialogRef.close();
				},
				error: (err: HttpErrorResponse) => {
					//console.log('err',err);
					this.snackBar.open(
						`${err.error.message[0]}`,
						'',
						{
							horizontalPosition: 'center',
							verticalPosition: 'top',
							duration: 4000,
							panelClass: ['red-snackbar']
						}
					);
					this.isLoading= false;
				}
			});
		}else{
			this.sustantiveForm.markAllAsTouched();
		}
	}

}
