import { Component, Inject, inject, OnInit, OnDestroy, ViewChild, ElementRef, SecurityContext } from '@angular/core';
import { FormBuilder, FormGroup, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { NgIf } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { environment } from '@environments/environment';
import { Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { ApiService } from '@services/api.service';

@Component({
  selector: 'app-generate-qr',
  standalone: true,
  imports: [
		NgIf,
		MatButtonModule,
		MatIconModule,
		MatRippleModule,
		MatDialogModule,
		MatTooltipModule
	],
  templateUrl: './generate-qr.component.html',
  styleUrls: ['./generate-qr.component.css']
})

export class GenerateQRComponent extends OnDestroyMixin implements OnDestroy {

	private getPdfContentSubscription!: Subscription;
	private sanitizer: DomSanitizer = inject(DomSanitizer);

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: { qrCode: string, personID: number },
		private dialogRef: MatDialogRef<GenerateQRComponent>,
		private api: ApiService
	) {
		super();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	public openFile(relativeRoute: string): void {
		const body= {
			"periodSection": 0,
			"personID": this.data.personID,
			"startDate": "",
			"endDate": "",
		}
		const route: string = `${environment.url}/${relativeRoute}`;
		if (this.getPdfContentSubscription) this.getPdfContentSubscription.unsubscribe();
		this.getPdfContentSubscription = this.api.postPdfContent(route, body).subscribe((res: HttpResponse<Blob>) => {
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
					this.dialogRef.close();
				}
			}
		});
	}
}
