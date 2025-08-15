import { Component, Inject, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgForOf, NgIf } from '@angular/common';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { UserService } from '@services/user.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CareerList } from '@utils/interfaces/campus.interfaces';
import { CurrentPeriod } from '../../../../../utils/interfaces/others.interfaces';
import { Period } from '@utils/interfaces/period.interfaces';

@Component({
  selector: 'app-period-dates',
	standalone: true,
  templateUrl: './period-dates.component.html',
  styleUrls: ['./period-dates.component.css'],
	imports: [
		ReactiveFormsModule,
		MatButtonModule,
		MatDialogModule,
		MatIconModule,
		NgForOf,
		NgIf,
		SpinnerLoaderComponent,
		MatInputModule,
		MatSelectModule,
		MatSnackBarModule,
	],
})

export class PeriodDatesComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public isLoading: boolean = false;
	public datesForm!: FormGroup;
	public currentPeriod: Period;

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: { item?: CareerList },
		private dialogRef: MatDialogRef<PeriodDatesComponent>,
		private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private user: UserService
	) {
		super();
		this.initDatesForm();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	ngOnInit(): void {
		//console.log(this.data.item);
		this.datesForm.patchValue(this.data.item);
		this.getPeriodById(this.data.item.periodID);
	}

	public initDatesForm(): void {
		this.datesForm= this.fb.group({
			startDate: ['', Validators.required],
			endDate: ['', Validators.required]
		})
	}

	private getPeriodById(periodID: number): void {
    this.api.getPeriodById(periodID).subscribe({
      next: (res) => {
				this.currentPeriod= res;
      },
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
    });
	}

	public onSubmit(): void {
		this.dialogRef.close(null);
	}

}
