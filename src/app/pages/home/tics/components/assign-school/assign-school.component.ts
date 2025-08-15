import { Component, Inject, inject, OnInit, OnDestroy } from '@angular/core';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { NgForOf, NgIf } from '@angular/common';
import { CurrentPeriod } from '@utils/interfaces/others.interfaces';
import { Period } from '@utils/interfaces/period.interfaces';
import { School, SPGetCareer } from '@utils/interfaces/campus.interfaces';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { UserService } from '@services/user.service';
import { ApiService } from '@services/api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CommonService } from '@services/common.service';

export interface Data {
	currentPeriod: CurrentPeriod,
	periods: Period[],
	careers: SPGetCareer[],
	schools: School[],
}

@Component({
  selector: 'app-assign-school',
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
	],
  templateUrl: './assign-school.component.html',
  styleUrls: ['./assign-school.component.css']
})

export class AssignSchoolComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public isLoading: boolean = false;
	public directorsForm!: FormGroup;

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: { arr: Data },
		private dialogRef: MatDialogRef<AssignSchoolComponent>,
		private fb: FormBuilder,
		private user: UserService,
		private api: ApiService,
		private common:CommonService,
	) {
		super();
		this.initForm();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	ngOnInit(): void {
		this.directorsForm.get('periodID').patchValue(this.data.arr.currentPeriod.periodID);
	}

	public initForm(): void {
		this.directorsForm = this.fb.group({
      search: [''],
			periodID: ['', [Validators.required]],
			schoolID: ['', [Validators.required]],
			personID: ['', [Validators.required]],
			director: ['', [Validators.required]],
			document: ['', [Validators.required]],
			user: this.user.currentUser.userName
    });
		const search: FormControl = this.directorsForm.get('search') as FormControl;
		if (search) {
			search.valueChanges.pipe(
				debounceTime(300),
				distinctUntilChanged(),
				untilComponentDestroyed(this)
			).subscribe({
				next: (search) => {
					this.searchCoordinators();
				}
			});
		}
	}

	public searchCoordinators(){
		this.api.getDirectorBySearch(this.directorsForm.get('search').value).subscribe({
			next: (res) => {
				//console.log(res);
				if(res[0]){
					this.directorsForm.get('personID').patchValue(res[0].personID);
					this.directorsForm.get('director').patchValue(res[0].Director);
					this.directorsForm.get('document').patchValue(res[0].NroDocumento);
				}else{
					this.directorsForm.get('personID').patchValue('');
					this.directorsForm.get('director').patchValue('');
					this.directorsForm.get('document').patchValue('');
				}
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.directorsForm.get('personID').patchValue('');
				this.directorsForm.get('director').patchValue('');
				this.directorsForm.get('document').patchValue('');
			}
		});
	}

	public onSubmit(): void {
		if(this.directorsForm.valid){
			let arr= [];
			this.isLoading= true;
			let schools = <FormArray>this.directorsForm.controls['schoolID'];
			for(let i=0; i<schools.value.length; i++){
				let obj={
					schoolID: +schools.value[i],
					personID: +this.directorsForm.get('personID').value,
					periodID: +this.directorsForm.get('periodID').value
				};
				arr.push(obj);
			};
			this.api.postDirector({"data": arr}).subscribe({
				next: (res) => {
					this.isLoading= false;
					this.common.message(`Registro exitoso`,'','success','#86bc57');
					this.dialogRef.close(res);
				},
				error: (err: HttpErrorResponse) => {
					console.log('err',err);
					this.isLoading= false;
				}
			});
		}else this.directorsForm.markAllAsTouched();
	}

}
