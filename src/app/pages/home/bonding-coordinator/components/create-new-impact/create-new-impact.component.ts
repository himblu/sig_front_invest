import { Component, Inject, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { filter, Observable, Subscription, take } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { NgForOf, NgIf } from '@angular/common';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { UserService } from '@services/user.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-create-new-impact',
  standalone: true,
  imports: [
		ReactiveFormsModule,
		MatButtonModule,
		MatDialogModule,
		MatIconModule,
		MatRippleModule,
		NgIf,
		SpinnerLoaderComponent,
		MatInputModule,
		MatSelectModule,
		MatSnackBarModule
	],
  templateUrl: './create-new-impact.component.html',
  styleUrls: ['./create-new-impact.component.css']
})

export class CreateNewImpactComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public isLoading: boolean = false;
	public filtersForm!: FormGroup;

	private snackBar: MatSnackBar = inject(MatSnackBar);

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: { },
		private dialogRef: MatDialogRef<CreateNewImpactComponent>,
		private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private user: UserService
	) {
		super();
		this.initFiltersForm();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	ngOnInit(): void {

	}

	public initFiltersForm(): void {
		this.filtersForm= this.fb.group({
			projectTypeName: ['', Validators.required],
			user: this.user.currentUser.userName
		})
	}

	public onSubmit(): void {
		if(this.filtersForm.valid){
			this.admin.postProjectType(this.filtersForm.value).subscribe({
				next: (res) => {
					this.snackBar.open(
						`Ingresado exitosamente`,
						null,
						{
							horizontalPosition: 'center',
							verticalPosition: 'top',
							duration: 4000,
							panelClass: ['green-snackbar']
						}
					);
					this.dialogRef.close(res);
				},
				error: (err: HttpErrorResponse) => {
					this.snackBar.open(
						`Error al ingresar, intente más tarde`,
						null,
						{
							horizontalPosition: 'center',
							verticalPosition: 'top',
							duration: 4000,
							panelClass: ['red-snackbar']
						}
					);
					this.dialogRef.close(null);
				}
			});
		}else{
			this.filtersForm.markAllAsTouched();
		}
	}

}
