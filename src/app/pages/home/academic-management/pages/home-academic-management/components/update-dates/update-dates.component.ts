import { Component, ViewChild, ElementRef, OnInit, OnDestroy, SecurityContext, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, FormArray } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { HttpErrorResponse } from '@angular/common/http';
import { map, Subscription } from 'rxjs';
import { formatDate, NgForOf, NgIf } from '@angular/common';
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
import { IEvent } from '@utils/interfaces/calendar.interface';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-update-dates',
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
		MatFormFieldModule,
		MatDatepickerModule,
		MatNativeDateModule,
		MatCheckboxModule
	],
  templateUrl: './update-dates.component.html',
  styleUrls: ['./update-dates.component.css']
})
export class UpdateDatesComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public isLoading: boolean = false;
	public updateForm!: FormGroup;
	public event: IEvent;
	public calendar: number;
	public clickedCalendar: boolean= false;

	private updateSubscription!: Subscription;

	constructor(
    @Inject(MAT_DIALOG_DATA) public data: { event?: IEvent, calendar?: number },
		private dialogRef: MatDialogRef<UpdateDatesComponent>,
		private fb: FormBuilder,
		private user: UserService,
		private api: ApiService
  ){
		super();
		//console.log(data.event);
		this.event = data.event;
		this.calendar = data.calendar;
  }

	ngOnInit(): void {
		this.initForm();
		this.updateForm.patchValue(this.event);
		this.updateForm.get('calendarID').patchValue(this.event.calendarID);
		//this.updateForm.get('startDate').patchValue(this.formatDate(this.event.startDate));
		//this.updateForm.get('endDate').patchValue(this.formatDate(this.event.endDate));
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	public initForm():void{
    this.updateForm = this.fb.group({
			calendarID: '',
      branchID: [''],
			eventID: [''],
			modalityID: [''],
			classModuleID: [''],
			periodID: [''],
			startDate: ['', Validators.required],
			endDate: ['', Validators.required],
			commentary: [''],
			statusID: [1, Validators.required],
			user: [this.user.currentUser.userName],
    });
	}

	public formatDate(date: string | Date): string {
		return formatDate(date, 'yyyy-MM-dd', 'es', '+2000');
	}

	public onSubmit(): void {
		/* if(!this.clickedCalendar){
			this.updateForm.get('startDate').patchValue(this.event.startDate);
			this.updateForm.get('endDate').patchValue(this.event.endDate);
		} */
		//console.log(this.updateForm.value);
		this.isLoading = true;
		if(this.updateForm.valid){
			if(this.updateForm.get('statusID').value === true) this.updateForm.get('statusID').patchValue(1);
			if(this.updateForm.get('statusID').value === false) this.updateForm.get('statusID').patchValue(0);
			if(this.calendar === 1){
				if (this.updateSubscription) this.updateSubscription.unsubscribe();
				this.updateSubscription = this.api.putAcademicEvent(this.updateForm.value).subscribe({
					next: (res) => {
						this.isLoading= false;
						this.dialogRef.close(res);
					},
					error: (err: HttpErrorResponse) => {
						this.isLoading= false;
					}
				});
			}else if(this.calendar === 2){
				if (this.updateSubscription) this.updateSubscription.unsubscribe();
				this.updateSubscription = this.api.putAdminEvent(this.updateForm.value).subscribe({
					next: (res) => {
						this.isLoading= false;
						this.dialogRef.close(res);
					},
					error: (err: HttpErrorResponse) => {
						this.isLoading= false;
					}
				});
			}
		}else{
			this.updateForm.markAllAsTouched();
		}
	}

}
