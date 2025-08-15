import { Component, ViewChild, ElementRef, OnInit, OnDestroy, SecurityContext, Inject, inject } from '@angular/core';
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
import { MatSelectModule } from '@angular/material/select';
import { Period } from '@utils/interfaces/period.interfaces';
import { AdministrativeService } from '@services/administrative.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-events-reports',
  standalone: true,
  templateUrl: './events-reports.component.html',
  styleUrls: ['./events-reports.component.css'],
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
		MatCheckboxModule,
		MatSelectModule
	]
})
export class EventsReportsComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public isLoading: boolean = false;
	public reportsForm!: FormGroup;
	public periods: Period[] = [];

	private reportsSubscription!: Subscription;
	private sanitizer: DomSanitizer = inject(DomSanitizer);

	constructor(
    @Inject(MAT_DIALOG_DATA) public data: { calendar?: number },
		private dialogRef: MatDialogRef<EventsReportsComponent>,
		private fb: FormBuilder,
		private user: UserService,
		private api: ApiService,
		private admin: AdministrativeService
  ){
		super();
		this.getPeriods();
  }

	ngOnInit(): void {
		this.initForm();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	public initForm():void{
    this.reportsForm = this.fb.group({
			periodID: ['', Validators.required],
      statusID: [0, Validators.required],
    });
	}

	public getPeriods():void{
		this.api.getPeriods().subscribe({
      next: (res) => {
				this.periods = res.data;
      }
    });
	}

	public getCalendarEventReport(): void {
		this.isLoading = true;
		if(this.reportsForm.valid){
			if (this.reportsSubscription) this.reportsSubscription.unsubscribe();
			this.reportsSubscription = this.admin.getCalendarEventReport(this.reportsForm.get('periodID').value, this.data.calendar, this.reportsForm.get('statusID').value).subscribe({
				next: (res) => {
					this.isLoading= false;
					let contentType: string | null | undefined = res.headers.get('content-type');
					// Porque el tipo de variable que recibe el type es string o undefined. No recibe null.
					if (!contentType) {
						contentType = undefined;
					}
					const blob: Blob = new Blob([res.body], { type: contentType });
					const url = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob)));
					if (url) {
						window.open(url, '_blank');
					}
					this.dialogRef.close(res);
				},
				error: (err: HttpErrorResponse) => {
					this.isLoading= false;
				}
			});
		}else{
			this.reportsForm.markAllAsTouched();
		}
	}

}
