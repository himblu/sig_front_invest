import { Component, Inject, inject, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '@services/api.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgFor, NgIf } from '@angular/common';
import { CommonService } from '@services/common.service';
import { DocumentTypee } from '@utils/interfaces/person.interfaces';

@Component({
  selector: 'app-create-person',
  standalone: true,
  imports: [
		ReactiveFormsModule,
		MatButtonModule,
		MatDialogModule,
		MatIconModule,
		MatRippleModule,
		MatInputModule,
		MatSelectModule,
		MatSnackBarModule,
		MatCheckboxModule,
		SpinnerLoaderComponent,
		NgIf,
		NgFor
	],
  templateUrl: './create-person.component.html',
  styleUrls: ['./create-person.component.css']
})

export class CreatePersonComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public isLoading: boolean = false;
	public filtersForm!: FormGroup;
	public documentTypes: DocumentTypee[] = [];

	private snackBar: MatSnackBar = inject(MatSnackBar);

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: { },
		private dialogRef: MatDialogRef<CreatePersonComponent>,
		private fb: FormBuilder,
		private api: ApiService,
		private common: CommonService,
	) {
		super();
		this.initForm();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	ngOnInit(): void {
		this.getDocumentType();
	}

	public initForm(): void {
		this.filtersForm= this.fb.group({
			personFirstName: ['', Validators.required],
			personMiddleName: ['', Validators.required],
			personLastName: ['', Validators.required],
			personFullName: '',
			typePersonCode: 'N',
			typeDocId: [1, Validators.required],
			personDocumentNumber: ['', Validators.required],
			personUrlImg: ''
		})
	}

	private getDocumentType(): void {
		this.isLoading = true;
		this.common.getDocumentType().subscribe({
			next: (res) => {
				//console.log(res);
				this.isLoading = false;
				this.documentTypes= res
			},
			error: (err: HttpErrorResponse) => {
				this.isLoading = false;
			}
		});
	}

	public onSubmit(): void {
		const filters= this.filtersForm.value;
		filters.personFullName= filters.personFirstName +''+ filters.personMiddleName +''+ filters.personLastName;
		if(this.filtersForm.valid){
			this.isLoading = true;
			this.api.postNaturalPerson(filters).subscribe({
				next: (res) => {
					//console.log(res);
					this.snackBar.open(
						`Registro exitoso`,
						'',
						{
							horizontalPosition: 'center',
							verticalPosition: 'top',
							duration: 4000,
							panelClass: ['green-snackbar']
						}
					);
					this.dialogRef.close(res);
					this.isLoading = false;
				},
				error: (err: HttpErrorResponse) => {
					this.isLoading = false;
				}
			});
		}else this.filtersForm.markAllAsTouched();
	}

}
