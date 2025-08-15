import { Component, Inject, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionSelectionChange, MatRippleModule } from '@angular/material/core';
import { NgForOf, NgIf } from '@angular/common';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AdministrativeService } from '@services/administrative.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DocumentTypee, PersonType } from '@utils/interfaces/person.interfaces';
import { CommonService } from '@services/common.service';
import { UnacemBlackList } from '@utils/interfaces/others.interfaces';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-create-black-list-user',
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
		MatSnackBarModule
	],
  templateUrl: './create-black-list-user.component.html',
  styleUrls: ['./create-black-list-user.component.css']
})

export class CreateBlackListUserComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public isLoading: boolean = false;
	public filtersForm!: FormGroup;
	public documentTypes: DocumentTypee[] = [];
	public personTypes: PersonType[] = [];

	private snackBar: MatSnackBar = inject(MatSnackBar);

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: { item?: UnacemBlackList },
		private dialogRef: MatDialogRef<CreateBlackListUserComponent>,
		private fb: FormBuilder,
		private admin: AdministrativeService,
		private common: CommonService,
		private user: UserService
	) {
		super();
		this.initForm();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	ngOnInit(): void {
		this.getDocumentType();
		this.getPersonType();
		if(this.data.item) this.filtersForm.patchValue(this.data.item);
	}

	public initForm(): void {
		this.filtersForm= this.fb.group({
			blackListID: null,
			personFullName: ['', Validators.required],
			typePersonCode: ['', Validators.required],
			typeDocId: [1, Validators.required],
			personDocumentNumber: ['', Validators.required],
			reason: '',
			user: this.user.currentUser.userName
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

	private getPersonType(): void {
		this.isLoading = true;
		this.common.getPersonType().subscribe({
			next: (res) => {
				this.personTypes= res;
				this.isLoading = false;
			},
			error: (err: HttpErrorResponse) => {
				this.isLoading = false;
			}
		});
	}

	public onSubmit(): void {
		if(this.filtersForm.valid){
			this.isLoading= true;
			let apiUrl;
			if(this.data?.item) apiUrl= this.admin.putUnacemBlackList(this.filtersForm.value);
			else apiUrl= apiUrl= this.admin.postUnacemBlackList(this.filtersForm.value);
			apiUrl.subscribe({
				next: (res) => {
					this.snackBar.open(
						`Registro exitoso`,
						null,
						{
							horizontalPosition: 'center',
							verticalPosition: 'top',
							duration: 4000,
							panelClass: ['green-snackbar']
						}
					);
					this.dialogRef.close(res);
					this.isLoading= false;
				},
				error: (err: HttpErrorResponse) => {
					//console.log('err',err);
					this.isLoading= false;
				}
			});
		}else this.filtersForm.markAllAsTouched();
	}

}
