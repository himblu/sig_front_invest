import { Component, ViewChild, ElementRef, OnInit, OnDestroy, SecurityContext, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, FormArray } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { HttpErrorResponse } from '@angular/common/http';
import { map, Subscription } from 'rxjs';
import { NgForOf, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatRippleModule } from '@angular/material/core';
import { EvaluationInstrument, InstrumentEvaluationActivity, InstrumentEvaluationComponent } from '@utils/interfaces/others.interfaces';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { UserService } from '@services/user.service';
import { ApiService } from '@services/api.service';
import { AdministrativeService } from '@services/administrative.service';

@Component({
  selector: 'component-evaluation-instrument',
  standalone: true,
  templateUrl: './evaluation-instrument.component.html',
  styleUrls: ['./evaluation-instrument.component.css'],
	imports: [
		MatButtonModule,
		MatIconModule,
		MatRippleModule,
		MatDialogModule,
		SpinnerLoaderComponent,
		NgForOf,
		NgIf,
		ReactiveFormsModule,
		MatInputModule,
		MatFormFieldModule,
		MatSelectModule
	]
})
export class EvaluationInstrumentComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public isLoading: boolean = false;
	public updateForm!: FormGroup;
	public evaluationInstruments: EvaluationInstrument;
	public instrumentEvaluationActivities: InstrumentEvaluationActivity[] = [];
	public instrumentEvaluationComponents: InstrumentEvaluationComponent[] = [];
	private updateSubscription!: Subscription;

	constructor(
    @Inject(MAT_DIALOG_DATA) private data: { item?: EvaluationInstrument },
		private dialogRef: MatDialogRef<EvaluationInstrumentComponent>,
		private fb: FormBuilder,
		private user: UserService,
		private api: ApiService,
		private admin: AdministrativeService
  ){
		super();
		this.evaluationInstruments = data?.item;
  }

	ngOnInit(): void {
		this.initForm();
		this.updateForm.patchValue(this.evaluationInstruments);
		this.getInstrumentEvaluationActivity();
		this.getInstrumentEvaluationComponent();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	public initForm():void{
    this.updateForm = this.fb.group({
      activityID: null,
			componentID: null,
			evaluationInstrumentsID: ['', Validators.required],
			typeEvaluationInstrumentID: ['', Validators.required],
			evaluationName: ['', Validators.required],
			indications: ['', Validators.required],
			periodID: ['', Validators.required],
			periodName: ['', Validators.required],
			statusID: [1, Validators.required],
			user: this.user.currentUser.userName
    });
	}

	public onSubmit(): void {
		this.isLoading = true;
		if(this.updateForm.valid){
			if (this.updateSubscription) this.updateSubscription.unsubscribe();
			this.updateSubscription = this.api.putEvaluationInstrument(this.updateForm.value).subscribe({
				next: (res) => {
					this.isLoading= false;
					this.dialogRef.close(res);
				},
				error: (err: HttpErrorResponse) => {
					this.isLoading= false;
				}
			});
		}else{
			this.updateForm.markAllAsTouched();
			this.isLoading= false;
		}
	}

	public getInstrumentEvaluationActivity(): void {
		this.admin.getInstrumentEvaluationActivity().subscribe({
			next: (res) => {
				this.instrumentEvaluationActivities = res;
				this.isLoading= false;
			},
			error: (err: HttpErrorResponse) => {
				this.isLoading= false;
			}
		});
	}


	public getInstrumentEvaluationComponent(): void {
		this.admin.getInstrumentEvaluationComponent().subscribe({
			next: (res) => {
				this.instrumentEvaluationComponents = res;
				this.isLoading= false;
			},
			error: (err: HttpErrorResponse) => {
				this.isLoading= false;
			}
		});
	}

}
