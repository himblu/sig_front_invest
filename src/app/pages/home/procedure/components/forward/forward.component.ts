import { Component, Inject, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { NgFor, NgForOf, NgIf } from '@angular/common';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin, map, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CurrentPeriod, MessageManagementContent, UserByTypeRol } from '@utils/interfaces/others.interfaces';
import { UserService } from '@services/user.service';
import { ApiService } from '@services/api.service';
import { TypeRol } from '@utils/interfaces/person.interfaces';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AdministrativeService } from '@services/administrative.service';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-forward',
  standalone: true,
  templateUrl: './forward.component.html',
  styleUrls: ['./forward.component.css'],
	imports: [
		ReactiveFormsModule,
		MatButtonModule,
		MatDialogModule,
		MatIconModule,
		MatRippleModule,
		NgIf,
		NgFor,
		NgForOf,
		SpinnerLoaderComponent,
		MatInputModule,
		MatSelectModule,
		MatSnackBarModule,
		MatAutocompleteModule,
		MatCheckboxModule
	],
})

export class ForwardComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public isLoading: boolean = false;
	public forwardForm!: FormGroup;
	public types: TypeRol[] = [];
	public users: UserByTypeRol[] = [];
	public sendingNumber: number= 0;

	private currentPeriod: CurrentPeriod;
	private getInfoSubscription: Subscription;
	private snackBar: MatSnackBar = inject(MatSnackBar);
	private admin: AdministrativeService= inject(AdministrativeService);
	private api: ApiService = inject(ApiService);

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: { currentMessage: MessageManagementContent},
		private dialogRef: MatDialogRef<ForwardComponent>,
		private fb: FormBuilder,
		private user: UserService
	) {
		super();
		this.initForm();
	}

	ngOnInit(): void {
		this.forwardForm.get('messageID').patchValue(this.data.currentMessage.messageID);
		this.getInfo();
	}

	override ngOnDestroy(): void {
		if (this.getInfoSubscription)	this.getInfoSubscription.unsubscribe();
		super.ngOnDestroy();
	}

	public initForm(): void {
		this.forwardForm= this.fb.group({
			messageID: null,
			periodID: null,
			userCreated: this.user.currentUser.userName,
			typeRolID: [null, Validators.required],
			detailAddressee: [[], Validators.required],
		});
	}

	private getInfo(): void {
		if (this.getInfoSubscription)	this.getInfoSubscription.unsubscribe();
		this.isLoading= true;
		this.getInfoSubscription = forkJoin({
			types: this.api.getTypeRolByRolID(+sessionStorage.getItem('rolID')),
			currentPeriod: this.api.getCurrentPeriod()
		}).pipe(map((res: { types: TypeRol[], currentPeriod: CurrentPeriod }) => {
			this.types= res.types;
			this.currentPeriod= res.currentPeriod;
			return res;
		})).subscribe({
			next: (value) => {
				/* for(let i=0; i<this.data.currentMessage.detailAddressee.length; i++){
					this.areas= this.areas.filter((item: Area)=>
						item.areaID !== this.data.currentMessage.detailAddressee[i].areaID
					);
				}; */
				this.forwardForm.get('periodID').patchValue(this.currentPeriod.periodID);
				this.isLoading = false;
			},
			error: (err: HttpErrorResponse) => {
				this.isLoading = false;
				this.snackBar.dismiss();
				this.snackBar.open(
          `Error al cargar la información, intente nuevamente`,
          null,
          {
            horizontalPosition: 'center',
            verticalPosition: 'top',
            duration: 4000,
            panelClass: ['red-snackbar']
          }
        );
				this.dialogRef.close();
			}
		});
	}

	public getUsersByTypeRolID(filter: string): void{
		if(filter === '') this.users= [];
		else{
			this.admin.getUsersByTypeRolID(this.forwardForm.get('typeRolID').value, this.currentPeriod.periodID, 0, filter).subscribe({
				next: (res: UserByTypeRol[]) => {
					//console.log('UsersByTypeRol', res);
					this.users= res;
					let selectedUsers: number[]= this.forwardForm.get('detailAddressee').value;
					for(let i=0; i<selectedUsers.length; i++){
						let filterUser= this.users.filter((item: UserByTypeRol)=> item.userID === selectedUsers[i])[0];
						if(filterUser) filterUser.selected= true;
					};
				},
				error: (err: HttpErrorResponse) => {
					//console.log('err',err);
				}
			});
		}
	}

	public optionClicked(event: Event, user: UserByTypeRol): void {
    event.stopPropagation();
    this.toggleSelection(user);
  }

  public toggleSelection(user: UserByTypeRol): void {
    user.selected = !user.selected;
		let selectedUsers: number[]= this.forwardForm.get('detailAddressee').value;
		//console.log('array', selectedUsers);
    if (user.selected) {
      selectedUsers.push(user.userID);
    } else {
      const i = selectedUsers.findIndex(value => value === user.userID);
      selectedUsers.splice(i, 1);
    }
		this.sendingNumber= selectedUsers.length;
		this.forwardForm.get('detailAddressee').markAllAsTouched();
		this.forwardForm.get('detailAddressee').updateValueAndValidity();
  }

	public onSubmit(): void {
		if(this.forwardForm.valid){
			this.isLoading= true;
			this.api.postForwardMessage(this.forwardForm.value).subscribe({
				next: (res) => {
					this.isLoading= false;
					this.snackBar.dismiss();
					this.snackBar.open(
						`Reenviado correctamente`,
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
					this.isLoading= false;
				}
			})
		}else this.forwardForm.markAllAsTouched();
	}

}
