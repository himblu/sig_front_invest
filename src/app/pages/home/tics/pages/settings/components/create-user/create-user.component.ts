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
import { UserService } from '@services/user.service';
import { CommonService } from '@services/common.service';
import { SPGetPerson2 } from '@utils/interfaces/person.interfaces';
import { Groups, Roles } from '@utils/interfaces/others.interfaces';

@Component({
  selector: 'app-create-user',
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
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css']
})

export class CreateUserComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public isLoading: boolean = false;
	public usersForm!: FormGroup;

	private snackBar: MatSnackBar = inject(MatSnackBar);

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: { roles: Roles[], groups: Groups[] },
		private dialogRef: MatDialogRef<CreateUserComponent>,
		private fb: FormBuilder,
		private api: ApiService,
		private user: UserService,
		private common: CommonService,
	) {
		super();
		this.initUsersForm();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	ngOnInit(): void {

	}

	public initUsersForm(): void {
		this.usersForm = this.fb.group({
			fullName: '',
			p_personId: ['', Validators.required],
			p_userName: ['', Validators.required],
			p_userPassword: ['', Validators.required],
			p_recoveryEmail: ['', [Validators.required, Validators.email]],
			p_rolID: ['', Validators.required],
			groupID: ['', Validators.required],
			p_userCreated: this.user.currentUser.userName
		})
	}

	public getPersonByDocumentNumber(document: string): void {
		this.common.getPersonByDocumentNumber(document).subscribe({
			next: (res: SPGetPerson2) => {
				if(res){
					//console.log('person', res)
					let fullName: string= res.firstName +' '+ res.middleName +' '+ res.lastName;
					this.usersForm.get('fullName').patchValue(fullName);
					this.usersForm.get('p_personId').patchValue(res.personID);
					this.usersForm.get('p_userPassword').patchValue(res.identity);
					this.usersForm.get('p_recoveryEmail').patchValue(res.emailRecovery);
				}
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public onSubmitUsers(): void {
		if(this.usersForm.valid){
			this.isLoading= true;
			this.api.postUser(this.usersForm.value).subscribe({
				next: (res: any) => {
					//console.log(res.userId);
					this.postUserRol(res.userId);
				},
				error: (err: HttpErrorResponse) => {
					//console.log('err',err);
					this.snackBar.open(
						`${err.error.message[0]}`,
						null,
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
			this.usersForm.markAllAsTouched();
		}
	}

	public postUserRol(userID: number): void {
		let body= {
			"p_rolID": this.usersForm.get('p_rolID').value,
			"p_userID": userID,
			"p_user": this.user.currentUser.userName
		}
		this.api.postUserRol(body).subscribe({
      next: (res) => {
				//console.log(res);
				this.postUserGroup(userID);
      },
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.isLoading= false;
			}
		});
	}

	public postUserGroup(userID: number): void {
		let body= {
			"groupID": this.usersForm.get('groupID').value,
			"userID": userID,
			"user": this.user.currentUser.userName
		}
		this.api.postUserGroup(body).subscribe({
      next: (res) => {
				//console.log(res);
				this.initUsersForm();
				this.common.message(`Registrado Correctamente`,'','success','#86bc57');
				this.isLoading= false;
				this.dialogRef.close(res);
      },
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.isLoading= false;
			}
		});
	}

}
