import { Component, Inject, inject } from '@angular/core';
import { Author, AuthorForm, AuthorFormValue } from '@utils/interfaces/library.interface';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, Subscription, take } from 'rxjs';
import { ApiService } from '@services/api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Country } from '@utils/interfaces/others.interfaces';
import { CommonService } from '@services/common.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { NgForOf, NgIf } from '@angular/common';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {UppercaseDirective} from '@shared/directives/UppercaseDirective';

@Component({
  selector: 'app-create-or-update-author',
  standalone: true,
	imports: [
		ReactiveFormsModule,
		MatButtonModule,
		MatDialogModule,
		MatIconModule,
		MatRippleModule,
		NgForOf,
		NgIf,
		SpinnerLoaderComponent,
		MatInputModule,
		MatSelectModule,
		UppercaseDirective
	],
  templateUrl: './create-or-update-author.component.html',
  styleUrls: ['./create-or-update-author.component.css']
})

export class CreateOrUpdateAuthorComponent {
	public countries: Country[] = [];
	public author: Author;
	public isLoadingAuthorInfo: boolean = true;
	public isSendingForm: boolean = false;
	public form: FormGroup;
	private sendFormSubscription: Subscription;

	private formBuilder: FormBuilder = inject(FormBuilder);
	private api: ApiService = inject(ApiService);
	private commonService: CommonService = inject(CommonService);
	private dialogRef: MatDialogRef<CreateOrUpdateAuthorComponent> = inject(MatDialogRef<CreateOrUpdateAuthorComponent>);
	constructor(
		@Inject(MAT_DIALOG_DATA) private data: { author?: Author }
	) {
		this.author = this.data?.author;
		this.initForm();
		this.getCountries();
	}

	private getCountries(): void {
		this.commonService.getCountries().pipe(take(1)).subscribe({
			next: (value: Country[]) => {
				this.countries = value;
				this.isLoadingAuthorInfo = false;
			},
			error: (err: HttpErrorResponse) => {
				this.isLoadingAuthorInfo = false;
			}
		});
	}

	private initForm(): void {
		this.form = this.formBuilder.group<AuthorForm>({
			name: this.formBuilder.control(this.author?.authorName || null, [Validators.required, Validators.minLength(2), Validators.maxLength(255)]),
			nationality: this.formBuilder.control(this.author?.nationalityID || null),
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
		const author: AuthorFormValue = this.form.getRawValue();
		let observableToCreateOrUpdateAuthor: Observable<Author>;
		if (this.author?.authorID) {
			observableToCreateOrUpdateAuthor = this.api.updateAuthor({ ...author, authorId: this.author.authorID });
		} else {
			observableToCreateOrUpdateAuthor = this.api.postAuthor(author);
		}
		this.sendFormSubscription = observableToCreateOrUpdateAuthor.subscribe({
			next: (value: Author) => {
				this.dialogRef.close(value);
			},
			error: (err: HttpErrorResponse) => {
				this.form.enable({ emitEvent: false });
				this.isSendingForm = false;
			}
		})
	}
}
