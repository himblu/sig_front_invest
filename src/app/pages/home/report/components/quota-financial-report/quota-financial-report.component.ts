import { Component, Inject, inject, OnInit, OnDestroy, ViewChild, ElementRef, SecurityContext } from '@angular/core';
import { FormBuilder, FormGroup, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { filter, Observable, Subscription, take } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { NgFor, NgForOf, NgIf } from '@angular/common';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { UserService } from '@services/user.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SPGetModality } from '@utils/interfaces/campus.interfaces';
import { MatTooltipModule } from '@angular/material/tooltip';
import { environment } from '@environments/environment';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-quota-financial-report',
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
		MatTooltipModule
	],
  templateUrl: './quota-financial-report.component.html',
  styleUrls: ['./quota-financial-report.component.css']
})

export class QuotaFinancialReportComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public isLoading: boolean = false;
	public filtersForm!: FormGroup;

	private getPdfContentSubscription!: Subscription;
	private snackBar: MatSnackBar = inject(MatSnackBar);
	private sanitizer: DomSanitizer = inject(DomSanitizer);
	@ViewChild("password") password: HTMLInputElement;

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: { periodID: number, modalities: SPGetModality[] },
		private dialogRef: MatDialogRef<QuotaFinancialReportComponent>,
		private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private user: UserService
	) {
		super();
		this.initForm();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	ngOnInit(): void {
		console.log(this.data);
	}

	public initForm(): void {
		this.filtersForm= this.fb.group({
			modalityID: 0,
		})
	}

	public openFile(): void {
			const route: string = `${environment.url}/api/financial/reports/quota-payment-excel/${this.data.periodID}/${this.filtersForm.get('modalityID').value}`;
			if (this.getPdfContentSubscription) this.getPdfContentSubscription.unsubscribe();
			this.getPdfContentSubscription = this.api.getPdfContent(route).subscribe((res: HttpResponse<Blob>) => {
				if (res.body) {
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
					this.dialogRef.close();
				}
			});
		}

}
