import { Component, Inject, inject, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { StudentBondingFile, StudentGradesLinkage } from '@utils/interfaces/campus.interfaces';
import { SPGetFileState } from '@utils/interfaces/others.interfaces';
import { FILE_STATE } from '@utils/interfaces/others.interfaces';
import { environment } from '@environments/environment';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-files-list',
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
		MatTooltipModule
	],
  templateUrl: './files-list.component.html',
  styleUrls: ['./files-list.component.css']
})

export class FilesListComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public isLoading: boolean = false;
	public filesForm!: FormGroup;
	public files: StudentBondingFile[] = [];
	public fileStates: SPGetFileState[] = [];

	private snackBar: MatSnackBar = inject(MatSnackBar);

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: { item?: StudentGradesLinkage },
		private dialogRef: MatDialogRef<FilesListComponent>,
		private fb: FormBuilder,
		private common: CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private user: UserService
	) {
		super();
		this.initFilesForm();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	ngOnInit(): void {
		this.getFiles();
		this.getFileStates();
	}

	public initFilesForm(): void {
		this.filesForm= this.fb.group({
			files: this.fb.array([
				this.fb.group({
          studentProcessFileID: null,
          personID: [this.data.item.personID],
          statusFileID: ['', Validators.required],
          commentary: [''],
          user: [this.user.currentUser.userName],
        })
			])
		})
	}

	public getFilesArray(): FormArray {
    return this.filesForm.controls['files'] as FormArray;
  }

  public addFilesRow(): void {
    this.getFilesArray().push(this.filesRow());
  }

  public removeFilesRow(i: number): void {
    if(this.getFilesArray().length > 1){
      this.getFilesArray().removeAt(i);
    }
  }

  private filesRow(): FormGroup {
    return this.fb.group({
      studentProcessFileID: null,
			personID: [this.data.item.personID],
			statusFileID: ['', Validators.required],
			commentary: [''],
			user: [this.user.currentUser.userName],
    })
  }

	public getFileStates(): void {
		this.api.getDocumentsStates().subscribe({
      next: (value: SPGetFileState[]) => {
				this.fileStates = value.filter((state: SPGetFileState) =>
				state.statusFileID === FILE_STATE.APPROVED || state.statusFileID === FILE_STATE.REJECTED);
      }
    })
	}

	public getFiles(): void {
		this.isLoading= true;
		this.admin.getFilesByStudent(this.data.item.projectPracInformativeID, this.data.item.studentID).subscribe({
			next: (res) => {
				//console.log('FilesByStudent', res);
				this.files= res;
				for(let i=0; i<this.files.length; i++){
					if(i > 0) this.addFilesRow();
					this.getFilesArray().controls[i].patchValue(this.files[i]);
					this.getFilesArray().controls[i].get('commentary').patchValue(this.files[i].observation);
				}
				this.isLoading = false;
			},
			error: (err: HttpErrorResponse) => {
				this.isLoading = false;
			}
		});
	}

	public openFile(relativeRoute: string): void {
		if(relativeRoute.includes('http') || relativeRoute.includes('www')){
			window.open(relativeRoute, '_blank');
		}else{
			window.open(environment.pullZone + relativeRoute, '_blank');
		}
  }

	public onSubmit(): void {
		if(this.filesForm.valid){
			this.isLoading= true;
			this.admin.putFilesByStudent(this.filesForm.value).subscribe({
				next: (res) => {
					this.isLoading = false;
					this.dialogRef.close(res);
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
