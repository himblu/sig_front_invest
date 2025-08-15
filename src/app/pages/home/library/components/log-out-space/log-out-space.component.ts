import { Component, Inject, inject, OnInit, OnDestroy } from '@angular/core';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { LibrarySpaceDetail, LibraryStudentDetail } from '@utils/interfaces/person.interfaces';
import { NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { LibrarySpace } from '@utils/interfaces/period.interfaces';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, } from '@angular/forms';
import { ApiService } from '@services/api.service';
import { Router } from '@angular/router';
import { CommonService } from '@services/common.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-log-out-space',
	standalone: true,
	imports: [
		MatDialogModule,
		SpinnerLoaderComponent,
		NgIf,
		MatButtonModule,
		MatIconModule,
		MatRippleModule,
		MatInputModule,
		MatFormFieldModule,
		ReactiveFormsModule,
		MatSnackBarModule
	],
  templateUrl: './log-out-space.component.html',
  styleUrls: ['./log-out-space.component.css']
})

export class LogOutSpaceComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public isLoading: boolean = false;
	public filtersForm!: FormGroup;
	public passwordVisible = false;

	private snackBar: MatSnackBar = inject(MatSnackBar);

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: { space: LibrarySpaceDetail },
		private dialogRef: MatDialogRef<LogOutSpaceComponent>,
		private fb: FormBuilder,
		private api: ApiService,
		private router: Router,
		private common:CommonService,
	) {
		super();
		this.initForm();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	ngOnInit(): void {

	}

	public initForm(): void {
		this.filtersForm= this.fb.group({
			p_librarySpaceID: this.data.space.librarySpaceID,
			p_librarySpacePassword: ['', Validators.required]
		})
	}

	public onSubmit(): void {
			if(this.filtersForm.valid){
				this.api.postLibraryLogout(this.filtersForm.value).subscribe({
					next: (res: any) => {
						//console.log('post', res);
						this.dialogRef.close();
						this.common.message(`${res.message}`, '', 'success', "#d3996a");
						this.router.navigateByUrl('/biblioteca/lista-espacios');
					},
					error: (err: HttpErrorResponse) => {
						this.snackBar.open(
							`Contraseña incorrecta`,
							null,
							{
								horizontalPosition: 'center',
								verticalPosition: 'top',
								duration: 3000,
								panelClass: ['red-snackbar']
							}
						);
					}
				});
			}else{
				this.filtersForm.markAllAsTouched();
			}
		}

}
