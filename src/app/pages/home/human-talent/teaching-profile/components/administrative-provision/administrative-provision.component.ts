import { Component, ViewChild, ElementRef, OnInit, OnDestroy, SecurityContext, Inject, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, FormArray, FormsModule } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { HttpErrorResponse } from '@angular/common/http';
import { map, Subscription } from 'rxjs';
import { NgForOf, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatRippleModule } from '@angular/material/core';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { UserService } from '@services/user.service';
import { ApiService } from '@services/api.service';
import { AdministrativeService } from '@services/administrative.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonService } from '@services/common.service';
import { Colaborator, Staff } from '@utils/interfaces/rrhh.interfaces';
import { Charge, ColaboratorPosition } from '@utils/interfaces/person.interfaces';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RrhhService } from '@services/rrhh.service';

@Component({
  selector: 'app-administrative-provision',
  standalone: true,
  templateUrl: './administrative-provision.component.html',
  styleUrls: ['./administrative-provision.component.css'],
	imports: [
		NgIf,
		NgForOf,
		ReactiveFormsModule,
		FormsModule,
		MatInputModule,
		MatButtonModule,
		MatFormFieldModule,
		MatIconModule,
		MatDialogModule,
		SpinnerLoaderComponent,
		MatDatepickerModule,
		MatSelectModule,
		MatSnackBarModule,
		MatTooltipModule
	],
})

export class AdministrativeProvisionComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public isLoading: boolean = false;
	public isAddingCharges: boolean = false;
	public chargesForm!: FormGroup;
	public colaborator: Colaborator;
	private currentPeriodID: number;
	public positionContracts: Charge[] = [];
	public staffs: Staff[] = [];
	public colaboratorPosition: ColaboratorPosition[] = [];

	private snackBar: MatSnackBar = inject(MatSnackBar);

	constructor( @Inject(MAT_DIALOG_DATA) private data: { item: Colaborator  },
		private dialogRef: MatDialogRef<AdministrativeProvisionComponent>,
		private fb: FormBuilder,
		private api: ApiService,
		private admin: AdministrativeService,
		private rrhh: RrhhService,
		private user: UserService ){
		super();
		this.initForm();
	}

	ngOnInit(): void {
		this.colaborator= this.data.item;
		this.getCurrrentPeriod();
		this.getCollaboratorPosition(this.data.item.PersonId);
		this.getPositionContract(this.data.item.typeStaffID);
		//this.getStaff();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	public initForm(): void {
		this.chargesForm= this.fb.group({
			charges: ['', Validators.required],
		})
	}

	private getCurrrentPeriod(): void {
		this.api.getCurrentPeriod().subscribe({
      next: (data) => {
        this.currentPeriodID = data.periodID;
      }
    })
	}

	public getPositionContract(staffID: number): void {
		this.admin.getPositionContract(staffID).subscribe({
			next: (res: Charge[]) => {
				//console.log('PositionContract', res);
				this.positionContracts= res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getCollaboratorPosition(personID: number): void {
		this.admin.getCollaboratorPosition(personID).subscribe({
			next: (res: ColaboratorPosition[]) => {
				//console.log('CollaboratorPosition', res);
				this.colaboratorPosition = res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getStaff(): void {
		this.rrhh.getStaff().subscribe({
			next: (res: Staff[]) => {
				//console.log('Staff', res);
				this.staffs= res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public onSubmit(): void {
		let body= [];
		let arr= this.chargesForm.get('charges').value;
		for(let i=0; i<arr.length; i++){
			let obj= {
				personID: this.data.item.PersonId,
				positionID: arr[i],
				startPeriod: this.currentPeriodID.toString(),
				user: this.user.currentUser.userName
			}
			body.push(obj);
		}
		//console.log(body);
		this.admin.postTeacherPosition({'dynamics': body}).subscribe({
			next: (res) => {
				//console.log('post', res);
				this.dialogRef.close(res);
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.snackBar.open(
					`No se pudo guardar, intente más tarde.`,
					'',
					{
						horizontalPosition: 'center',
						verticalPosition: 'top',
						duration: 4000,
						panelClass: ['red-snackbar']
					}
				);
			}
		});
	}

}
