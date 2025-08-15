import { Component, EventEmitter, Output, OnInit, Input, Inject, SecurityContext, inject } from '@angular/core';
import { Form, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateAdapter, MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { ExperienceMatter, TimeAvailability, WorkExperience } from '@utils/interfaces/rrhh.interfaces';
import { CommonService } from '@services/common.service';
import { RrhhService } from '@services/rrhh.service';
import { DatePipe, NgClass, NgFor, NgIf, NgOptimizedImage } from '@angular/common';
import { Course } from '@utils/interfaces/campus.interfaces';
import { AdministrativeService } from '@services/administrative.service';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '@services/api.service';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ValidationDocument, SPGetFileState, COMPANY_CODES, DOCUMENT_CODES, FILE_STATE, StudentDocument, ValidationStudentDocument } from '@utils/interfaces/others.interfaces';
import { EnrolledStudent, SPGetPerson2 } from '@utils/interfaces/person.interfaces';
import { ValidateDocumentComponent } from 'app/pages/home/report/pages/enrolled-student-report/components/validate-document/validate-document.component';
import { Subscription, forkJoin, map } from 'rxjs';
import { environment } from '@environments/environment';

@Component({
  selector: 'components-validate-files',
  templateUrl: './validate-files.component.html',
  styleUrls: ['./validate-files.component.scss'],
  providers:[
    DatePipe
  ],
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    MatSnackBarModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatRippleModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    DatePipe,
    SpinnerLoaderComponent,
    NgClass,
    NgOptimizedImage,
    MatCheckboxModule,
		MatTooltipModule
  ]
})
export class ValidateFilesComponent {
  public validationDocuments: ValidationDocument[] = [];
  public documentStates: SPGetFileState[] = [];
  public loading: boolean = true;
  public form!: FormGroup;

  private getFormInformationSubscription!: Subscription;
  private sendFormSubscription!: Subscription;
  private getPdfContentSubscription!: Subscription;
  private api: ApiService = inject(ApiService);
  private formBuilder: FormBuilder = inject(FormBuilder);
  private snackBar: MatSnackBar = inject(MatSnackBar);
  private sanitizer: DomSanitizer = inject(DomSanitizer);
  private dialogRef: MatDialogRef<ValidateDocumentComponent> = inject(MatDialogRef<ValidateDocumentComponent>);
	personImage: any;
  infoCollaborator: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { enrolledStudent: any },
    private rrhh: RrhhService,
		private common: CommonService
  ) {
    this.getFormInformation();
		this.getPersonInfo(this.data.enrolledStudent.PersonId);
  }

  private getFormInformation(): void {
    //console.log('data',this.data);

    if (this.getFormInformationSubscription) {
      this.getFormInformationSubscription.unsubscribe();
    }
    this.api.getDocumentsStates().subscribe({
      next: (value: any) => {
        //this.documentStates = value;
				//console.log('estados', value);
				this.documentStates as SPGetFileState[]
				this.documentStates = value.filter((state:any) => state.statusFileID === FILE_STATE.APPROVED || state.statusFileID === FILE_STATE.REJECTED);
      }
    })
    this.rrhh.getFileDocs(this.data.enrolledStudent.PersonId).subscribe({
      next: (value: any) => {
        //console.log('value',value);
        this.validationDocuments = value;
				this.rrhh.getCollaboratorPrev2(this.data.enrolledStudent.PersonId, this.data.enrolledStudent.dateContract).subscribe({
					next: (value: any) => {
						this.infoCollaborator = value;
						this.initForm();
					}
				})
      }
    })
    //console.log(".enrolledStudent",this.data.enrolledStudent);
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
      documents: this.formBuilder.array([])
    });
    const documentsFormArray: FormArray = this.documentsFormArray;
    this.validationDocuments = this.validationDocuments.filter((v) => v.statusFileID !== FILE_STATE.NO_FILE);
    this.validationDocuments.map((document: any) => {
      const documentFormGroup: FormGroup = this.formBuilder.group({
        docEmpleadoID: [document.docEmpleadoID, [Validators.required]] ,
        statusFileID: [document.statusFileID, [Validators.required]] ,
        commentary:  [''],
        fileTypeName: [document.fileTypeName, [Validators.required]],
        urlFile: [document.urlFile, [Validators.required]],
				sendEmail: [this.infoCollaborator.sendMail],
				personID: [this.data.enrolledStudent.PersonId],
				typeDocName: [document.typeDocName],
				observation: [document.observation],
      });
      if (document.statusFileID === FILE_STATE.REJECTED) {
        documentFormGroup.get('commentary')?.addValidators(Validators.required);
      }
      documentsFormArray.push(documentFormGroup);
    });
    this.loading = false;
  }

  public get documentsFormArray(): FormArray {
    return this.form.get('documents') as FormArray;
  }

  public getDocumentFormGroup(index: number): FormGroup {
    return this.documentsFormArray.get(index.toString()) as FormGroup;
  }

  public sendForm(): void {
    //console.log('this.form',this.form);

    if (this.form.invalid) {
      this.form.markAsDirty();
      this.form.markAllAsTouched();
      return;
    }
    if (this.sendFormSubscription) {
      this.sendFormSubscription.unsubscribe();
    }
    const formValue: ValidationStudentDocument = this.form.value as ValidationStudentDocument;
    //console.log('formValue',formValue);
    const objFiles:any = {"dynamics":formValue.documents};
		//console.log(objFiles)
    this.sendFormSubscription = this.api.putFileDocs(objFiles)
      .subscribe({
        next: (value: any) => {
          if (value) {
            this.snackBar.dismiss();
            this.snackBar.open(
            `Documentos validados exitosamente`,
            undefined,
              {
                horizontalPosition: 'center',
                verticalPosition: 'top',
                duration: 4000,
                panelClass: ['green-snackbar']
              }
            );
            this.dialogRef.close(true);
          }
        },
        error: (err: HttpErrorResponse) => {
        }
    });
  }

  // FIXME: Buscar la manera de mejorar este código
  public setCommentaryAsRequiredField(index: number, ngValue: string): void {
    const value: number = +ngValue.split(' ')[1];
    const state = this.documentStates.find((state) => state.statusFileID === +value);
    const formGroup: FormGroup = this.getDocumentFormGroup(index);
    if (state) {
      if (state.statusFileID === FILE_STATE.REJECTED) {
        formGroup.get('commentary')?.enable();
        formGroup.get('commentary')?.addValidators(Validators.required);
      } else {
        formGroup.get('commentary')?.patchValue('');
        formGroup.get('commentary')?.disable();
        formGroup.get('commentary')?.clearValidators();
      }
      formGroup.get('commentary')?.updateValueAndValidity();
    } else {
      formGroup.get('commentary')?.patchValue('');
      formGroup.get('commentary')?.disable();
      formGroup.get('commentary')?.clearValidators();
    }
  }

  public openFile(relativeRoute: string): void {
    const route: string = `${environment.url}/${relativeRoute}`;

    if (this.getPdfContentSubscription) {
      this.getPdfContentSubscription.unsubscribe();
    }
    this.getPdfContentSubscription = this.api.getPdfContent(route).subscribe((res: HttpResponse<Blob>) => {
      if (res.body) {
        let contentType: string | null | undefined = res.headers.get('content-type');
        // Porque el tipo de variable que recibe el type es string o undefined. No recibe null.
        if (!contentType) {
          contentType = undefined;
        }
        const blob: Blob = new Blob([res.body], { type: contentType });
        const url = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob)));
        if (url) {
          window.open(url, '_blank');
        }
      }
    });
  }

	private getPersonInfo(personID: number): void {
		this.common.getPerson(personID).subscribe({
			next: (res) => {
				//console.log('currentPerson', res);
				if(res.avatar) this.getPersonImage(res, personID);
				else this.personImage= null;
			},
			error: (_err: HttpErrorResponse) => {
			}
    });
	}

	private getPersonImage(currentPerson: SPGetPerson2, personID: number): void {
		if(currentPerson.avatar !== "default.png"){
			//console.log(currentPerson.avatar);
			let rute= currentPerson.avatar.replace('api/file/view-employee/', '')
			this.api.getEmployeeImage(rute).subscribe({
				next: (res) => {
					this.createImageFromBlob(res);
				},
				error: (_err: HttpErrorResponse) => {
				}
			});
		}
	}

	private createImageFromBlob(image: Blob) {
		let reader = new FileReader();
		reader.addEventListener("load", () => {
			 this.personImage = reader.result;
		}, false);

		if (image) {
			 reader.readAsDataURL(image);
		}
	}

}
