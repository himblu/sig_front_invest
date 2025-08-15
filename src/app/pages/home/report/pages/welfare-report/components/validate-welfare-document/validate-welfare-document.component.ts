import { DatePipe, NgClass, NgFor, NgIf, NgOptimizedImage } from '@angular/common';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, inject, Inject, SecurityContext } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { ApiService } from '@services/api.service';
import {
  COMPANY_CODES, DOCUMENT_CODES, FILE_STATE,
  SPGetFileState,
  StudentDocument,
  ValidationDocument, ValidationStudentDocument, Welfare
} from '@utils/interfaces/others.interfaces';
import { forkJoin, map, Subscription } from 'rxjs';

@Component({
  selector: 'app-validate-welfare-document',
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
    MatCheckboxModule
  ],
  templateUrl: './validate-welfare-document.component.html',
  styleUrls: ['./validate-welfare-document.component.scss']
})

export class ValidateWelfareDocumentComponent {
  public validationDocuments: ValidationDocument[] = [];
  public documentStates: SPGetFileState[] = [];
  public loading: boolean = true;
  public form!: FormGroup;
  public image: any;

  private getFormInformationSubscription!: Subscription;
  private sendFormSubscription!: Subscription;
  private getPdfContentSubscription!: Subscription;
  private api: ApiService = inject(ApiService);
  private formBuilder: FormBuilder = inject(FormBuilder);
  private snackBar: MatSnackBar = inject(MatSnackBar);
  private sanitizer: DomSanitizer = inject(DomSanitizer);
  private dialogRef: MatDialogRef<ValidateWelfareDocumentComponent> = inject(MatDialogRef<ValidateWelfareDocumentComponent>);
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { enrolledStudent: Welfare }
  ) {
    this.getFormInformation();
    this.getPersonImage();
  }

  private getFormInformation(): void {
    if (this.getFormInformationSubscription) {
      this.getFormInformationSubscription.unsubscribe();
    }
    const observables = [
      this.api.getValidationDocuments(
        this.data.enrolledStudent.personID,
        this.data.enrolledStudent.periodID,
        COMPANY_CODES.ITCA,
        DOCUMENT_CODES.ITCA_DOCUMENT,
        this.data.enrolledStudent.studentID,
      ),
      this.api.getDocumentsStates()
    ];
    this.getFormInformationSubscription = forkJoin(observables)
      .pipe(map(([
        validationDocuments,
        documentStates
      ]) => {
        return {
          validationDocuments: validationDocuments as ValidationDocument[],
          documentStates: documentStates as SPGetFileState[]
        }
      })).subscribe({
        next: (value: { validationDocuments: ValidationDocument[], documentStates: SPGetFileState[] }) => {
          console.warn(value);
          this.validationDocuments = value.validationDocuments;
          // this.documentStates = value.documentStates;
          this.documentStates = value.documentStates.filter((state) => state.statusFileID === FILE_STATE.APPROVED || state.statusFileID === FILE_STATE.REJECTED);
          this.initForm();
        },
        error: (_err: HttpErrorResponse) => {
          this.dialogRef.close();
        }
      })
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
      sendEmail: [true],
      documents: this.formBuilder.array([])
    });
    const documentsFormArray: FormArray = this.documentsFormArray;
    this.validationDocuments = this.validationDocuments.filter((v) => v.statusFileID !== FILE_STATE.NO_FILE);
    this.validationDocuments.map((document: StudentDocument) => {
      const documentFormGroup: FormGroup = this.formBuilder.group({
        fileID: [document.fileID, [Validators.required]],
        fileTypeID: [document.fileTypeID],
        fileTypeName: [document.fileTypeName],
        statusFileID: [
          (document.statusFileID === FILE_STATE.APPROVED || document.statusFileID === FILE_STATE.REJECTED) ? document.statusFileID : '',
          [Validators.required]],
        statusFileDesc: [document.statusFileDesc],
        personID: [document.personID, [Validators.required]],
        periodID: [document.periodID],
        urlFile: [document.urlFile],
        studentID: [this.data.enrolledStudent.studentID],
        commentary: [
          { value: document.commentary, disabled: document.statusFileID !== FILE_STATE.REJECTED },
        ]
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
    if (this.form.invalid) {
      this.form.markAsDirty();
      this.form.markAllAsTouched();
      return;
    }
    if (this.sendFormSubscription) {
      this.sendFormSubscription.unsubscribe();
    }
    const formValue: ValidationStudentDocument = this.form.value as ValidationStudentDocument;
    this.sendFormSubscription = this.api.putValidateStudentDocuments(formValue)
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
        error: (_err: HttpErrorResponse) => {
        }
      });
  }

  // FIXME: Buscar la manera de mejorar este código
  public setCommentaryAsRequiredField(index: number, ngValue: string): void {
    // Para extraer el valor de esa selección.
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
    const route: string = `${relativeRoute}`;
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

  public getPersonImage(): void {
    if (this.data.enrolledStudent.personUrlImg) {
      let rute = this.data.enrolledStudent.personUrlImg.replace('upload/files/itca/docs/students/', '')
      this.api.getPersonImage(this.data.enrolledStudent.personID, rute).subscribe({
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
      this.image = reader.result;
    }, false);

    if (image) {
      reader.readAsDataURL(image);
    }
  }

}
