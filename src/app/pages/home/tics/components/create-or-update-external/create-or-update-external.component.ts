import { DocumentTypee } from './../../../../../utils/interfaces/person.interfaces';
import { Component, Inject, inject, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { filter, forkJoin, map, Observable, Subscription, take } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { NgFor, NgForOf, NgIf } from '@angular/common';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { UserService } from '@services/user.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Institution } from '@utils/interfaces/period.interfaces';
import { ExternalUser, Roles } from '@utils/interfaces/others.interfaces';

@Component({
  selector: 'app-create-or-update-external',
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
		MatSnackBarModule,
		NgFor
	],
  templateUrl: './create-or-update-external.component.html',
  styleUrls: ['./create-or-update-external.component.css']
})
export class CreateOrUpdateExternalComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public isLoading: boolean = false;
	public externalForm!: FormGroup;
	public userForm!: FormGroup;
	public rolForm!: FormGroup;
	public isUpdating: boolean= false;
	public institutions: Institution[] = [];
	public roles: Roles[] = [];
	public documentTypes: DocumentTypee[] = [];

	private getDataSubscription!: Subscription;
	private snackBar: MatSnackBar = inject(MatSnackBar);

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: { item?: ExternalUser },
		private dialogRef: MatDialogRef<CreateOrUpdateExternalComponent>,
		private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private user: UserService
	) {
		super();
		this.initExternalForm();
		this.initUserForm();
		this.initRolForm();
	}

	override ngOnDestroy(): void {
		this.getDataSubscription.unsubscribe();
		super.ngOnDestroy();
	}

	ngOnInit(): void {
		if(this.data.item){
			const item: ExternalUser= this.data.item;
			this.externalForm.get('personDocumentNumber').patchValue(item.PersonDocumentNumber);
			this.externalForm.get('personFirstName').patchValue(item.PersonFirstName);
			this.externalForm.get('personLastName').patchValue(item.PersonLastName);
			this.externalForm.get('personPhone').patchValue(item.PersonPhone);
			this.externalForm.get('personEmail').patchValue(item.recoveryEmail);
			this.externalForm.get('personId').patchValue(item.PersonId);
			this.externalForm.get('typeDocId').patchValue(item.typeDocId);
			this.getAdministrativeExternalInstitutions();
			this.isUpdating= true;
		}
		if(this.getDataSubscription) this.getDataSubscription.unsubscribe();
		const observables: Observable<any>[] = [
			this.admin.getInstitutionToSurvey(),
			this.admin.getRoles(),
			this.common.getDocumentType()
		];
		this.getDataSubscription = forkJoin(observables).pipe(map((
			[
				institutions,
				roles,
				documentTypes
			]
		) : {
			institutions: Institution[],
			roles: Roles[],
			documentTypes: DocumentTypee[]
		}	=> {
			return {
				institutions,
				roles,
				documentTypes
			};
		})).subscribe({
			next: (res) => {
				this.institutions= res.institutions;
				this.roles= res.roles;
				this.documentTypes= res.documentTypes;
			},
			error: (err: HttpErrorResponse) => {
				this.snackBar.open(
					'Hubo un error al cargar la información. Por favor, intenta de nuevo.',
					'',
					{
						horizontalPosition: 'center',
						verticalPosition: 'top',
						duration: 5000,
						panelClass: ['red-snackbar']
					}
				);
				this.dialogRef.close(false);
			}
		});
	}

	public initExternalForm(): void {
		this.externalForm= this.fb.group({
			personId: null,
			typeDocId: ['', Validators.required],
			personDocumentNumber: ['', [Validators.required]],
			personFirstName: ['', Validators.required],
			personLastName: ['', Validators.required],
			personPhone: ['', [Validators.required, Validators.maxLength(10)]],
			personEmail: ['', [Validators.required, Validators.email]],
			institutionID: [[], Validators.required],
			user: this.user.currentUser.userName
		})
	}

	public initUserForm(): void {
		this.userForm= this.fb.group({
			p_personId: [null],
			p_userName: ['', Validators.required],
			p_userPassword: [''],
			p_recoveryEmail: [null],
			p_userCreated: this.user.currentUser.userName
		})
	}

	public initRolForm(): void {
		this.rolForm= this.fb.group({
			p_rolID: [{ value: 30, disabled: true }],
			p_userID: [null],
			p_user: this.user.currentUser.userName
		})
	}

	public getAdministrativeExternalInstitutions(): void {
		this.isLoading= true;
		this.admin.getAdministrativeExternalInstitutions(this.data.item.PersonId).subscribe({
			next: (res) => {
				//console.log('administrativeExternalInstitutions', res);
				let institutes: number[] = this.externalForm.get('institutionID').value;
				for(let i=0; i<res.length; i++){
					institutes.push(res[i].institutionID);
				}
				this.isLoading= false;
			},
			error: (err: HttpErrorResponse) => {
				this.isLoading= false;
			}
		})
	}

	public onSubmit(): void {
		if(!this.isUpdating) this.postAdministrativeExternal();
		else this.putAdministrativeExternal();
	}

	public postAdministrativeExternal(): void {
		if(this.externalForm.valid && this.userForm.valid && this.rolForm.valid){
			this.isLoading= true;
			this.admin.postAdministrativeExternal(this.externalForm.value).subscribe({
				next: (res: any) => {
					//console.log('post 1', res[0].personId);
					this.postAdministrativeExternalInstitution(res[0].personId);
				},
				error: (err: HttpErrorResponse) => {
					this.isLoading= false;
					this.snackBar.open(
						`${err.error.message}`,
						'',
						{
							horizontalPosition: 'center',
							verticalPosition: 'top',
							duration: 5000,
							panelClass: ['red-snackbar']
						}
					);
				}
			})
		}else{
			this.externalForm.markAllAsTouched();
			this.userForm.markAllAsTouched();
			this.rolForm.markAllAsTouched();
		}
	}

	public postAdministrativeExternalInstitution(personID: number): void {
		const institutions: []= this.externalForm.get('institutionID').value;
		let body= [];
		for(let i=0; i<institutions.length; i++){
			let obj= {
				personId: personID,
				institutionID: institutions[i]
			}
			body.push(obj);
		}
		this.admin.postAdministrativeExternalInstitution({'news': body}).subscribe({
			next: (res) => {
				//console.log('post2', res);
				if(!this.isUpdating) this.postUser(personID);
				else{
					this.snackBar.open(
						'Datos actualizados exitosamente',
						'',
						{
							horizontalPosition: 'center',
							verticalPosition: 'top',
							duration: 5000,
							panelClass: ['green-snackbar']
						}
					);
					this.isLoading= false;
					this.dialogRef.close(true);
				}
			},
			error: (err: HttpErrorResponse) => {
				this.isLoading= false;
			}
		})
	}

	public postUser(personID: number): void {
		this.userForm.get('p_personId').patchValue(personID);
		this.admin.postAdministrativeExternalAbsortion(this.userForm.value).subscribe({
			next: (res: any) => {
				//console.log('post3', res.userId);
				this.sendExternalEmail(personID);
				this.postUserRol(res.userId);
			},
			error: (err: HttpErrorResponse) => {
				this.isLoading= false;
			}
		})
	}

	public sendExternalEmail(personID: number): void {
		this.api.sendExternalEmail(personID).subscribe({
			next: (res: any) => {
				//console.log('email', res);
			},
			error: (err: HttpErrorResponse) => {
				this.isLoading= false;
			}
		})
	}

	public postUserRol(userId: number): void {
		this.rolForm.get('p_userID').patchValue(userId);
		this.api.postUserRol(this.rolForm.getRawValue()).subscribe({
			next: (res: any) => {
				//console.log('post4', res);
				this.snackBar.open(
					'Registro exitoso',
					'',
					{
						horizontalPosition: 'center',
						verticalPosition: 'top',
						duration: 5000,
						panelClass: ['green-snackbar']
					}
				);
				this.isLoading= false;
				this.dialogRef.close(true);
			},
			error: (err: HttpErrorResponse) => {
				this.isLoading= false;
			}
		})
	}

	public putAdministrativeExternal(): void {
		if(this.externalForm.valid){
			this.isLoading= true;
			this.admin.putAdministrativeExternal(this.externalForm.value).subscribe({
				next: (res) => {
					this.postAdministrativeExternalInstitution(this.data.item.PersonId);
				},
				error: (err: HttpErrorResponse) => {
					this.isLoading= false;
				}
			})
		}else{
			this.externalForm.markAllAsTouched();
		}
	}

}
