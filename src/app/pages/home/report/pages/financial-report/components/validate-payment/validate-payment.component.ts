import { CommonModule, DatePipe, NgClass, NgFor, NgIf, NgOptimizedImage } from '@angular/common';
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
import { AdministrativeService } from '@services/administrative.service';
import { ApiService } from '@services/api.service';
import {
  COMPANY_CODES, DOCUMENT_CODES, FILE_STATE,
  FinancialEntity,
  SPGetFileState,
  TransactionType,
  ValidationDocument, ValidationStudentDocument
} from '@utils/interfaces/others.interfaces';
import { PaymentForEnrolledStudent, PaymentOption } from '@utils/interfaces/person.interfaces';
import { forkJoin, map, Subscription } from 'rxjs';

interface FiltersForm {
  period: number;
  search: string;
  status: number;
}

const DISPLAYED_COLUMNS: string[] = ['documentNumber', 'student', 'foreignLanguage', 'level', 'enrollDate', 'period', 'actions'];

@Component({
  selector: 'app-validate-payment',
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
    CommonModule,
  ],
  templateUrl: './validate-payment.component.html',
  styleUrls: ['./validate-payment.component.scss']
})

export class ValidatePaymentComponent {
  public validationDocuments: ValidationDocument[] = [];
  public transactions: TransactionType[] = [];
  public financialEntities: FinancialEntity[] = [];
  public documentStates: SPGetFileState[] = [];
  public loading: boolean = true;
  public form!: FormGroup;
  public image: any;
	public hasAssignScholarship: boolean = false;
  public quotaDetails: any[] = [];
	public paymentOptions: PaymentOption[] = [];

  private getFormInformationSubscription!: Subscription;
  private sendFormSubscription!: Subscription;
  private getPdfContentSubscription!: Subscription;
  private api: ApiService = inject(ApiService);
  private formBuilder: FormBuilder = inject(FormBuilder);
  private snackBar: MatSnackBar = inject(MatSnackBar);
  private dialogRef: MatDialogRef<ValidatePaymentComponent> = inject(MatDialogRef<ValidatePaymentComponent>);
  private sanitizer: DomSanitizer = inject(DomSanitizer);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
			paymentForEnrolledStudent: PaymentForEnrolledStudent,
			period: number,
			state?: boolean
		},
    private Administrative: AdministrativeService
  ) {
    //console.log('data', data);
    this.getFormInformation();
    this.getPersonImage();
    this.getAssignScholarshipStudent();
  }

  async getAssignScholarshipStudent() {
    this.hasAssignScholarship = false;
    let resultAssignScholarship: any = await this.Administrative.getStudentInfoToScholarshipAssign(this.data.paymentForEnrolledStudent.studentID).toPromise();
    //console.log(resultAssignScholarship);
    if (resultAssignScholarship.length) {
      this.hasAssignScholarship = true;
      let result: any = await this.Administrative.getAssignScholarshipStudentDetailByAssignStudentID(resultAssignScholarship[0].assignStudentID, this.data.period).toPromise();
      //console.log('AssignScholarshipStudentDetailByAssignStudentID', result);
      this.quotaDetails = result;
    }
  }

  private getFormInformation(): void {
    if (this.getFormInformationSubscription) {
      this.getFormInformationSubscription.unsubscribe();
    }
    const observables = [
      this.api.getValidationDocuments(
        this.data.paymentForEnrolledStudent.personID,
        this.data.paymentForEnrolledStudent.periodID,
        COMPANY_CODES.ITCA,
        DOCUMENT_CODES.ITCA_PROOF_PAYMENT,
        this.data.paymentForEnrolledStudent.studentID
      ),
      this.api.getTransactionTypes(),
      this.api.getFinancialEntities(),
      this.api.getDocumentsStates(),
			this.api.getPaymentOptionsDesc(this.data.paymentForEnrolledStudent.periodID, this.data.paymentForEnrolledStudent.studentID)
    ];
    this.getFormInformationSubscription = forkJoin(observables)
      .pipe(map(([
        validationDocuments,
        transactions,
        financialEntities,
        documentStates,
				paymentOptionsDesc
      ]) => {
        return {
          validationDocuments: validationDocuments as ValidationDocument[],
          transactions: transactions as TransactionType[],
          financialEntities: financialEntities as FinancialEntity[],
          documentStates: documentStates as SPGetFileState[],
					paymentOptionsDesc: paymentOptionsDesc as PaymentOption[]
        }
      })).subscribe({
        next: (value: { validationDocuments: ValidationDocument[], transactions: TransactionType[], financialEntities: FinancialEntity[], documentStates: SPGetFileState[], paymentOptionsDesc: PaymentOption[] }) => {
          this.validationDocuments = value.validationDocuments;
          this.transactions = value.transactions;
          this.financialEntities = value.financialEntities;
          this.documentStates = value.documentStates.filter((state) => state.statusFileID === FILE_STATE.APPROVED || state.statusFileID === FILE_STATE.REJECTED);
          // this.documentStates = value.documentStates;
					this.paymentOptions = value.paymentOptionsDesc;
					//console.log('PaymentOptions', value.paymentOptionsDesc);
          this.initForm();
        },
        error: (err: HttpErrorResponse) => {
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
    this.validationDocuments = this.validationDocuments.filter((v) => v.statusFileID !== FILE_STATE.NO_FILE)
    //console.log(this.validationDocuments);
    for(let i=0; i<this.validationDocuments.length; i++){
			const document= this.validationDocuments[i];
      const documentFormGroup: FormGroup = this.formBuilder.group({
        fileID: [document.fileID, [Validators.required]],
        fileTypeID: [document.fileTypeID],
				paymentOptionDesc: [document.paymentOptionDesc],
        fileTypeName: [document.fileTypeName],
        statusFileID: [
          (document.statusFileID === FILE_STATE.APPROVED || document.statusFileID === FILE_STATE.REJECTED) ? document.statusFileID : '',
          [Validators.required]
        ],
        statusFileDesc: [document.statusFileDesc],
        personID: [document.personID, [Validators.required]],
        studentID: [document.studentID],
        periodID: [document.periodID],
        urlFile: [document.urlFile],
        commentary: [
          { value: document.commentary, disabled: false }
        ],
        transactionTypeID: [document.transactionTypeID || '', [Validators.required]],
        financialEntityID: [document.financialEntityID || '', [Validators.required]],
        payDay: [document.payDay],
        voucherNumber: [document.voucherNumber],
        amount: [document.amount],
				index: i,
      });
      if (document.statusFileID === FILE_STATE.REJECTED) {
        documentFormGroup.get('commentary')?.addValidators(Validators.required);
      }
      documentsFormArray.push(documentFormGroup);
    };
    this.loading = false;
  }

  public get documentsFormArray(): FormArray {
    return this.form.get('documents') as FormArray;
  }

  public getDocumentFormGroup(index: number): FormGroup {
    return this.documentsFormArray.get(index.toString()) as FormGroup;
  }

  public sendForm(): void {
		if (this.sendFormSubscription) this.sendFormSubscription.unsubscribe();
    if (this.form.invalid) {
      this.form.markAsDirty();
      this.form.markAllAsTouched();
      return;
    }
    this.loading= true;
    const formValue: ValidationStudentDocument = this.form.value as ValidationStudentDocument;
    this.sendFormSubscription = this.api.putValidateStudentPayments(formValue)
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
						this.loading= false;
            this.dialogRef.close(true);
          }
        },
        error: (err: HttpErrorResponse) => {
					this.loading= false;
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
        // formGroup.get('commentary')?.enable();
        formGroup.get('commentary')?.addValidators(Validators.required);
      } else {
        formGroup.get('commentary')?.patchValue('');
        // formGroup.get('commentary')?.disable();
        formGroup.get('commentary')?.clearValidators();
      }
      formGroup.get('commentary')?.updateValueAndValidity();
    } else {
      formGroup.get('commentary')?.patchValue('');
      // formGroup.get('commentary')?.disable();
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
    if (this.data.paymentForEnrolledStudent.personUrlImg) {
      let rute = this.data.paymentForEnrolledStudent.personUrlImg.replace('upload/files/itca/docs/students/', '')
      this.api.getPersonImage(this.data.paymentForEnrolledStudent.personID, rute).subscribe({
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
