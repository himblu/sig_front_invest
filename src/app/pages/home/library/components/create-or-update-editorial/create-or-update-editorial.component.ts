import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Editorial, EditorialForm, EditorialFormValue } from '@utils/interfaces/library.interface';
import { Country } from '@utils/interfaces/others.interfaces';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, Subscription, take } from 'rxjs';
import { ApiService } from '@services/api.service';
import { CommonService } from '@services/common.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { NgForOf, NgIf } from '@angular/common';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { MatInputModule } from '@angular/material/input';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

@Component({
  selector: 'app-create-or-update-editorial',
  standalone: true,
	imports: [
		MatButtonModule,
		MatDialogModule,
		MatFormFieldModule,
		MatIconModule,
		MatOptionModule,
		MatRippleModule,
		MatSelectModule,
		NgForOf,
		NgIf,
		ReactiveFormsModule,
		SpinnerLoaderComponent,
		MatInputModule,
		NgxMaskDirective
	],
	providers: [
		provideNgxMask(),
	],
  templateUrl: './create-or-update-editorial.component.html',
  styleUrls: ['./create-or-update-editorial.component.css']
})

export class CreateOrUpdateEditorialComponent {
	public countries: Country[] = [];
	public now: Date = new Date();
	public editorial: Editorial;
	public isLoadingEditorialInfo: boolean = true;
	public isSendingForm: boolean = false;
	public form: FormGroup;
	private sendFormSubscription: Subscription;

	private formBuilder: FormBuilder = inject(FormBuilder);
	private api: ApiService = inject(ApiService);
	private commonService: CommonService = inject(CommonService);
	private dialogRef: MatDialogRef<CreateOrUpdateEditorialComponent> = inject(MatDialogRef<CreateOrUpdateEditorialComponent>);
	constructor(
		@Inject(MAT_DIALOG_DATA) private data: { editorial?: Editorial }
	) {
		this.editorial = this.data?.editorial;
		this.initForm();
		// this.getCountries();
		this.isLoadingEditorialInfo = false;
	}

	private initForm(): void {
		this.form = this.formBuilder.group<EditorialForm>({
			name: this.formBuilder.control(this.editorial?.editorialDesc || null, [Validators.required, Validators.minLength(2), Validators.maxLength(255)]),
			// country: this.formBuilder.control( null, [Validators.required]),
			cityCountry: this.formBuilder.control(this.editorial?.cityCountryDesc || null, [Validators.required, Validators.minLength(2), Validators.maxLength(255)]),
			website: this.formBuilder.control(this.editorial?.website || null, [Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]),
			description: this.formBuilder.control(this.editorial?.description || null, [Validators.minLength(2), Validators.maxLength(255)]),
			foundationYear: this.formBuilder.control(this.editorial?.yearPublication || null, [Validators.min(0), Validators.max(this.now.getFullYear())]),
		});
	}

	private getCountries(): void {
		this.commonService.getCountries().pipe(take(1)).subscribe({
			next: (value: Country[]) => {
				this.countries = value;
				this.isLoadingEditorialInfo = false;
			},
			error: (err: HttpErrorResponse) => {
				this.isLoadingEditorialInfo = false;
			}
		});
	}

	public sendForm(): void {
		if (this.form.invalid) {
			this.form.markAsDirty();
			this.form.markAllAsTouched();
			return;
		}
		if (this.sendFormSubscription) {
			this.sendFormSubscription.unsubscribe();
		}
		this.form.disable({ emitEvent: false });
		this.isSendingForm = true;
		const editorial: EditorialFormValue = this.form.getRawValue();
		let observableToCreateOrUpdateEditorial: Observable<Editorial>;
		if (this.editorial?.editorialID) {
			observableToCreateOrUpdateEditorial = this.api.updateEditorial({...editorial, cityCountryId: this.editorial.cityCountryID, editorialId: this.editorial.editorialID });
		} else {
			observableToCreateOrUpdateEditorial = this.api.postEditorial(editorial);
		}
		this.sendFormSubscription = observableToCreateOrUpdateEditorial.subscribe({
			next: (value: Editorial) => {
				this.dialogRef.close(value);
			},
			error: (err: HttpErrorResponse) => {
				this.form.enable({ emitEvent: false });
				this.isSendingForm = false;
			}
		})
	}
}
