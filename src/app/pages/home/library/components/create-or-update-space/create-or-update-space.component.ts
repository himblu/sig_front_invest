import { Component, Inject, inject, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { LibrarySpace } from '@utils/interfaces/period.interfaces';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-create-or-update-space',
  standalone: true,
  templateUrl: './create-or-update-space.component.html',
  styleUrls: ['./create-or-update-space.component.scss'],
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
		MatSnackBarModule,
		MatCheckboxModule,
	],
})

export class CreateOrUpdateSpaceComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public isLoading: boolean = false;
	public spaceForm!: FormGroup;
	public listFilesUpload: File[] = [];
	public isUpdating: boolean= false;
	public isUpdatingPassword: boolean= false;
	public passwordVisible = false;

	private snackBar: MatSnackBar = inject(MatSnackBar);
	@ViewChild("password") password: HTMLInputElement;

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: { item?: LibrarySpace },
		private dialogRef: MatDialogRef<CreateOrUpdateSpaceComponent>,
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
		if(this.data.item){
			this.isUpdating= true;
			this.spaceForm.patchValue(this.data.item);
		}
	}

	public initForm(): void {
		this.spaceForm= this.fb.group({
			librarySpaceID: null,
			librarySpaceName: ['', Validators.required],
			librarySpaceDesc: ['', Validators.required],
			capacityMax: ['', [Validators.required, Validators.min(1)]],
			librarySpacePassword: [null, Validators.required],
			statusID: null,
			user: this.user.currentUser.userName
		})
	}

	public onSubmit(): void {
		let serviceUrl;
		let body= this.spaceForm.value;
		if(!this.isUpdating) serviceUrl= this.api.postLibrarySpaces(body);
		else{
			delete body['librarySpacePassword'];
			serviceUrl= this.api.putLibrarySpaces(body);
			if(this.isUpdatingPassword) this.updatePassword(this.spaceForm.get('librarySpacePassword').value);
			else this.spaceForm.removeControl('librarySpacePassword');
		}
		if(this.spaceForm.valid){
			this.isLoading= true;
			serviceUrl.subscribe({
				next: (res: any) => {
					//console.log(res);
					this.common.message(`${res?.message}`,'','success','#86bc57');
					this.dialogRef.close(res);
					this.isLoading= false;
				},
				error: (err: HttpErrorResponse) => {
					//console.log('err',err);
					this.snackBar.open(
						`Error al guardar, intente más tarde`,
						'',
						{
							horizontalPosition: 'center',
							verticalPosition: 'top',
							duration: 4000,
							panelClass: ['red-snackbar']
						}
					);
					this.isLoading= false;
				}
			});
		}else{
			this.spaceForm.markAllAsTouched();
		}
	}

	public updatePassword(password: string): void {
		if(this.spaceForm.valid){
			let body= {
				'librarySpaceID': this.data.item.librarySpaceID,
				'librarySpacePassword': password
			}
			this.api.putLibrarySpacesPassword(body).subscribe({
				next: (res: any) => {
					//console.log(res);
					this.common.message(`${res?.message}`,'','success','#86bc57');
				},
				error: (err: HttpErrorResponse) => {
					//console.log('err',err);
				}
			});
		}else{
			this.spaceForm.markAllAsTouched();
		}
	}

}
