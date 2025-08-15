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
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatRippleModule } from '@angular/material/core';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { UserService } from '@services/user.service';
import { ApiService } from '@services/api.service';
import { InstrumentQuestion } from '@utils/interfaces/others.interfaces';

@Component({
  selector: 'app-questions',
  standalone: true,
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
		MatFormFieldModule
	],
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css']
})
export class QuestionsComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public isLoading: boolean = false;
	public updateForm!: FormGroup;
	public instrumentQuestion: InstrumentQuestion;

	private updateSubscription!: Subscription;

	constructor(
    @Inject(MAT_DIALOG_DATA) private data: { item?: InstrumentQuestion },
		private dialogRef: MatDialogRef<QuestionsComponent>,
		private fb: FormBuilder,
		private user: UserService,
		private api: ApiService
  ){
		super();
		this.instrumentQuestion = data?.item;
  }

	ngOnInit(): void {
		this.initForm();
		this.updateForm.patchValue(this.instrumentQuestion);
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	public initForm():void{
    this.updateForm = this.fb.group({
      questionsID: ['', Validators.required],
			questionsDesc: ['', Validators.required],
			userCreated: this.user.currentUser.userName
    });
	}

	public onSubmit(): void {
		this.isLoading = true;
		if(this.updateForm.valid){
			if (this.updateSubscription) this.updateSubscription.unsubscribe();
			let body= [];
			body.push(this.updateForm.value);
			this.updateSubscription = this.api.putInstrumentsQuestions({'updates': body}).subscribe({
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

}
