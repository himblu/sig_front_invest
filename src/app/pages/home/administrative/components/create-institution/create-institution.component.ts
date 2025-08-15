import { Component, Inject, inject, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
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
import { UserService } from '@services/user.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonService } from '@services/common.service';
import { CollegeType, Country, InstitutionType, Sector } from '@utils/interfaces/others.interfaces';

@Component({
  selector: 'app-create-institution',
  standalone: true,
  imports: [
		ReactiveFormsModule,
		MatButtonModule,
		MatDialogModule,
		MatIconModule,
		MatRippleModule,
		NgIf,
		NgFor,
		SpinnerLoaderComponent,
		MatInputModule,
		MatSelectModule,
		MatSnackBarModule,
		MatFormFieldModule
	],
  templateUrl: './create-institution.component.html',
  styleUrls: ['./create-institution.component.css']
})

export class CreateInstitutionComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public isLoading: boolean = false;
	public instituteForm!: FormGroup;
	public countries: Country[] = [];
	public institutionTypes: InstitutionType[] = []
	public collegeTypes: CollegeType[] = [];
	public sectorList: Sector[] = [];

	private snackBar: MatSnackBar = inject(MatSnackBar);

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: { type: boolean },
		private dialogRef: MatDialogRef<CreateInstitutionComponent>,
		private fb: FormBuilder,
		private admin: AdministrativeService,
		private user: UserService,
		private common: CommonService
	) {
		super();
		this.initForm();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	ngOnInit(): void {
		this.getCountries();
		if(!this.data.type){
			this.getInstitutionTypes();
			this.getSector();
		}else{
			this.getCollegeType();
		}
	}

	public initForm(): void {
		if(!this.data.type){
			this.instituteForm= this.fb.group({
				countryID: ['', Validators.required],
				institutionTypeID: ['', Validators.required],
				sectorID: ['', Validators.required],
				institutionName: ['', Validators.required],
				institutionDesc: null,
				institutionAddress: null,
				user: this.user.currentUser.userName
			})
		}else{
			this.instituteForm= this.fb.group({
				collegeTypeID: ['', Validators.required],
				countryID: ['', Validators.required],
				provinceID: null,
				collegeName: ['', Validators.required],
				userCreated: this.user.currentUser.userName
			})
		}
	}

	private getCountries(): void {
		this.common.getCountries().subscribe({
			next: (res: Country[]) => {
				this.countries = res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getInstitutionTypes(): void {
		this.common.getInstitutionTypes().subscribe({
			next: (res) => {
				this.institutionTypes = res.data;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getCollegeType(): void {
		this.admin.getCollegeType(1,10).subscribe({
			next: (res) => {
				this.collegeTypes = res.data;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getSector(): void {
		this.common.getSector().subscribe({
      next: (res: Sector[]) => {
        this.sectorList = res;
      },
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
    })
	}

	public onSubmit(): void {
		if(this.instituteForm.valid){
			this.isLoading= true;
			let rute;
			if(!this.data.type) rute= this.admin.postInstitution(this.instituteForm.value);
			else{
				const filters= this.instituteForm.value;
				let body= {
					'news': [
						{
							"collegeTypeID": filters.collegeTypeID,
							"countryID": filters.countryID,
							"provinceID": filters.provinceID,
							"collegeName": filters.collegeName,
							"userCreated": filters.userCreated
						}
					]
				}
				rute= this.admin.saveCollege(body);
			}
			rute.subscribe({
				next: (res: any) => {
					//console.log('post', res);
					this.isLoading= false;
					if(res) this.snackBar.open(
						`Registro exitoso`,
						null,
						{
							horizontalPosition: 'center',
							verticalPosition: 'top',
							duration: 4000,
							panelClass: ['green-snackbar']
						}
					);
					this.dialogRef.close();
				},
				error: (err: HttpErrorResponse) => {
					//console.log('err',err);
					this.isLoading= false;
				}
			})
		}else{
			this.instituteForm.markAllAsTouched();
		}
	}

}
