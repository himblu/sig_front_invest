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
import { FileType, StudentProcessTemplate } from '@utils/interfaces/campus.interfaces';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FilterTypesPipe } from '../../pipes/filterTypes.pipe';
import { Period } from '@utils/interfaces/period.interfaces';

const MAX_FILE_SIZE = 5000000;

@Component({
  selector: 'app-template',
	standalone: true,
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css'],
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
		MatCheckboxModule,
		FilterTypesPipe
	],
})
export class TemplateComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public isLoading: boolean = false;
	public filesForm!: FormGroup;
	public typeForm!: FormGroup;
	public isUpdating: boolean= false;
	public fileTypes: FileType[] = [];
	public isPostingType: boolean= false;

	private file: File;
	private snackBar: MatSnackBar = inject(MatSnackBar);

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: { periods: Period[], item?: StudentProcessTemplate },
		private dialogRef: MatDialogRef<TemplateComponent>,
		private fb: FormBuilder,
		private common: CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private user: UserService
	) {
		super();
		this.initFilesForm();
		this.initTypesForm();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	ngOnInit(): void {
		if(this.data?.item){
			this.isUpdating= true;
			this.filesForm.patchValue(this.data.item);
		}
		this.getFileTypes();
	}

	public initFilesForm(): void {
		this.filesForm= this.fb.group({
			processTemplateID: [''],
			fileTypeID: ['', Validators.required],
			periodID: ['', Validators.required],
			orderNumber: ['', [Validators.required, Validators.min(1)]],
			statusID: [''],
		})
	}

	public initTypesForm(): void {
		this.typeForm= this.fb.group({
			fileTypeName: ['', Validators.required],
			fileTypeDesc: '',
			companyID: 1,
			flgLinkage: 1,
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

	public onSubmit(): void {
		if(!this.isUpdating) this.postStudentsProcessTemplate();
		else this.putStudentsProcessTemplate();
	}

	public postStudentsProcessTemplate(): void {
		if(this.file){
			if(this.filesForm.valid){
				this.isLoading= true;
				const fileTypeID= this.filesForm.get('fileTypeID').value;
				const periodID= this.filesForm.get('periodID').value;
				const orderNumber= this.filesForm.get('orderNumber').value;
				const studentProcessTemplate = JSON.stringify({fileTypeID, periodID, orderNumber});
				const formData = new FormData();
				formData.append("studentProcessTemplate", studentProcessTemplate);
				formData.append('linkageFile', this.file);
				this.admin.postStudentsProcessTemplate(formData).subscribe({
					next: (res) => {
						//console.log(res);
						this.dialogRef.close(res);
						this.isLoading = false;
					},
					error: (err: HttpErrorResponse) => {
						this.isLoading = false;
					}
				});
			}else{
				this.filesForm.markAllAsTouched();
			}
		}else{
			this.snackBar.open(
				`Archivo requerido`,
				null,
				{
					horizontalPosition: 'center',
					verticalPosition: 'top',
					duration: 4000,
					panelClass: ['red-snackbar']
				}
			);
		}
	}

	public putStudentsProcessTemplate(): void {
		if(this.filesForm.valid){
			this.isLoading= true;
			const statusID= this.filesForm.get('statusID');
			if (statusID.value === false || statusID.value === 0) statusID.patchValue(0);
			else statusID.patchValue(1);
			const studentProcessTemplate = JSON.stringify(this.filesForm.value);
			const formData = new FormData();
			formData.append("studentProcessTemplate", studentProcessTemplate);
			if (this.file) formData.append('linkageFile', this.file);
			this.admin.putStudentsProcessTemplate(formData).subscribe({
				next: (res) => {
					//console.log(res);
					this.dialogRef.close(res);
					this.isLoading = false;
				},
				error: (err: HttpErrorResponse) => {
					this.isLoading = false;
				}
			});
		}else{
			this.filesForm.markAllAsTouched();
		}
	}

	public onChangeInput(input: HTMLInputElement): void{
		if (input?.files.length) {
			if(input.files[0].size > MAX_FILE_SIZE){
				input.value='';
				this.snackBar.open(
          `Máximo 5MB permitido`,
          null,
          {
            horizontalPosition: 'center',
            verticalPosition: 'top',
            duration: 4000,
            panelClass: ['red-snackbar']
          }
        );
			} else{
				const file: File = input.files.item(0);
				if (file) {
					this.file= file;
				}
			}
		}else{
			this.file= null;
		}
	}

	public postType(): void {
		this.typeForm.get('fileTypeDesc').patchValue(this.typeForm.get('fileTypeName').value);
		if(this.typeForm.valid){
			this.isLoading= true;
			this.admin.postFileType(this.typeForm.value).subscribe({
				next: (res: any) => {
					//console.log(res);
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
					this.getFileTypes();
					this.initFilesForm();
					this.initTypesForm();
					this.isPostingType= false;
					this.isLoading = false;
				},
				error: (err: HttpErrorResponse) => {
					this.isLoading = false;
				}
			});
		}else{
			this.typeForm.markAllAsTouched();
		}
	}

}
