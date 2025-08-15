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
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { UserService } from '@services/user.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FileType } from '@utils/interfaces/campus.interfaces';
import { FilterTypesPipe } from '../../pipes/filterTypes.pipe';

@Component({
  selector: 'app-update-file-types',
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
		MatSnackBarModule,
		FilterTypesPipe
	],
  templateUrl: './update-file-types.component.html',
  styleUrls: ['./update-file-types.component.css']
})

export class UpdateFileTypesComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public isLoading: boolean = false;
	public filesForm!: FormGroup;
	public fileTypes: FileType[] = [];

	private snackBar: MatSnackBar = inject(MatSnackBar);

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: {},
		private dialogRef: MatDialogRef<UpdateFileTypesComponent>,
		private fb: FormBuilder,
		private common: CommonService,
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
		this.getFileTypes();
	}

	public initForm(): void {
		this.filesForm= this.fb.group({
			fileTypeID: ['', Validators.required],
			fileTypeName: ['', Validators.required],
			user: this.user.currentUser.userName
		})
	}

	public getFileTypes(): void{
		this.isLoading= true;
		this.admin.getFileTypes().subscribe({
			next: (res) => {
				//console.log('getFileTypes', res);
				this.fileTypes= res;
				this.isLoading = false;
			},
			error: (err: HttpErrorResponse) => {
				this.isLoading = false;
			}
		});
	}

	public selectedFile(event: MatOptionSelectionChange, item: FileType): void {
		if(event.isUserInput) this.filesForm.patchValue(item);
	}

	public onSubmit(): void {
		if(this.filesForm.valid){
			this.isLoading= true;
			this.admin.putFileType(this.filesForm.value).subscribe({
				next: (res: any) => {
					//console.log('put', res);
					this.snackBar.open(
						`${res.message}`,
						null,
						{
							horizontalPosition: 'center',
							verticalPosition: 'top',
							duration: 4000,
							panelClass: ['green-snackbar']
						}
					);
					this.isLoading = false;
					this.getFileTypes();
					this.initForm();
				},
				error: (err: HttpErrorResponse) => {
					this.isLoading = false;
				}
			});
		}else{
			this.filesForm.markAllAsTouched();
		}
	}

}
