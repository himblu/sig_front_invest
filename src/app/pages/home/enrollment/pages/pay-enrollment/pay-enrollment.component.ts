import { Component, inject, OnInit,  SecurityContext } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import { CommonService } from '@services/common.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { forkJoin, Subscription } from 'rxjs';
import { AdministrativeService } from '@services/administrative.service';
import { ValidateStatus } from '@utils/interfaces/others.interfaces';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';

const MAX_FILE_SIZE = 5 * 1048576;
enum FILE_TYPE {
  PAYMENT_PROOF = 13
}

@Component({
  selector: 'app-pay-enrollment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    NgxMaskDirective,
		MatIconModule
  ],
  templateUrl: './pay-enrollment.component.html',
  styleUrls: ['./pay-enrollment.scss'],
  providers: [
    DatePipe,
    provideNgxMask()
  ]
})

export class PayEnrollmentComponent implements OnInit {
  public form: FormGroup;

  private router: Router = inject(Router);
  private formBuilder: FormBuilder = inject(FormBuilder);
  private datePipe: DatePipe = inject(DatePipe);
  private common: CommonService = inject(CommonService);
  private adminApi: AdministrativeService = inject(AdministrativeService);
	private sanitizer: DomSanitizer = inject(DomSanitizer);
  private sendProofSubscription: Subscription;
  maxDate = new Date();
  payDocumentsRequired: any = [];
  paymentsArrastres: any[] = [];
  /**newe to documents */
  documentForm: FormGroup;
  documentArrastresForm: FormGroup;
	detail:any;

  constructor() {
    // this.dateAdapter.setLocale('en-GB'); //dd/MM/yyyy
  }

  phone = {
    S: { pattern: new RegExp('[+0-9]') },
  };

  public ngOnInit(): void {
    this.documentForm = this.formBuilder.group({
      documentList: this.formBuilder.array([]),
    });

    this.documentArrastresForm = this.formBuilder.group({
      documentArrastresList: this.formBuilder.array([]),
    });

		this.getFiles();
    this.initForm();
		this.showAlertCheckEmail();
  }

  public initForm(): void {
    this.form = this.formBuilder.group({
      voucher: ['', Validators.required],
      image: ['', Validators.required],
      paymentDate: ['', Validators.required],
      file: ['']
    });

  }

  public sendForm(): void {
    let listRequest: any = []
    if (this.documentForm.invalid) {
      this.documentForm.markAllAsTouched();
      this.documentForm.markAsDirty();
      this.common.message('Campos requeridos', 'Ingrese la informacion solicitada', 'warning', '#d3996a')
      return
    }
    if (this.sendProofSubscription) {
      this.sendProofSubscription.unsubscribe();
    }

    const arrForm = this.getControlDocuments();
		//console.log(arrForm);
    for (let index = 0; index < arrForm.length; index++) {
      const element:any = arrForm[index].value;
      if(element.image != null && element.image != ''){
        listRequest.push(
          this.adminApi.postFilePayment(element)
        )
      }
    }

    forkJoin(listRequest).subscribe((responses) => {
      Swal.fire({
        text: '¡Información fue cargada con éxito!',
        imageUrl: `assets/images/final.jpeg`,
        imageWidth: 500,
        imageAlt: 'Instrucciones pos pago'
      })
      this.processAfterEnroll();
    });
  }

	processAfterEnroll() {
		const arrForm = this.getControlDocuments();
		let state= 1;
		let i= 0;
		for (let index = 0; index < arrForm.length; index++) {
      const element:any = arrForm[index].value;
      if(element.image != null && element.image != '') i++;
    };
		if(i !== arrForm.length) state= 0;
    let aux: ValidateStatus = {
			p_personID: +sessionStorage.getItem('id')! || 0,
      p_studentID: +sessionStorage.getItem('studentID')! || 0,
      p_companyID: 1,
      p_processEnrollCode: '05',
      p_state: state
    }
    // if (this.scheduleSignatureRepeatSave.length > 0) {
    //   this.scheduleSignatureRepeatSave.forEach(i => {
    //     let aux3: SignatureReport = {
    //       p_periodID: Number(this.statusStudent.periodID),
    //       p_classSectionNumber: i.classSectionNumber || 0,
    //       p_studentID: this.PersonID.PersonId,
    //       p_user: ''
    //     }
    //     this.adminApi.postSignatureRepeat(aux3)
    //       .subscribe(resp => {
    //       });
    //   });
    // }

		this.common.validateStatus(aux)
		.subscribe((resp: any) => {
			this.router.navigate(['/']).then();
		})
  }

	showAlertCheckEmail() {
    Swal.fire({
      imageUrl: '../../../../../assets/images/avisoMatriculaLegalizada.png',
      imageWidth: 500,
      imageHeight: 300,
      imageAlt: 'Custom image',
    })
  }

  private formattedDate(date: Date): string {
    return <string>this.datePipe.transform(date, 'yyyy-MM-dd');
  }

  public onChangeInput(files: FileList, index: number, id:any): void {
		if(files!=null){
			let type='';
			if(files[0].name.split('.').pop()=='pdf'){
				type='application/pdf'
			}else{
				type='image/jpeg'
			}
      setTimeout(() =>{
        const blob = new Blob([files[0]], { type: type });
        const url = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob)));
          if (url) {
            window.open(url, '_blank');
          }
      }, 400);

    }
    const fileControl = this.getControlDocuments()[index];
    if (files) {
      const file: File = files.item(0);
      const fileReader = new FileReader();
      if (file) {
        const fileFormControl: FormControl = fileControl.get('file') as FormControl;
        fileFormControl.patchValue(file);
      }
    }
  }

  getFiles() {
    const personId = Number(sessionStorage.getItem('id'));
		const studentId= +sessionStorage.getItem('studentID');
    this.adminApi.getFilesToUpload(personId, 1, '05', studentId).subscribe({
      next: (response: any) => {
				this.detail=response;
        response.forEach((element: any) => {
          if(element.flg_voucher === 1){
            this.addDocument(element.fileID);
          }else{
            this.addDocumentArrastre(element.fileID);
          }
        });
      }, error: (error) => {
        console.log(error);
      }
    })
  }

  addDocument(fileId: number) {
    const documentArray = this.documentForm.get('documentList') as FormArray;
    documentArray.push(this.createDocumentItem(fileId));
  }

  addDocumentArrastre(fileId: number) {
    const documentArray = this.documentArrastresForm.get('documentArrastresList') as FormArray;
    documentArray.push(this.createDocumentItemArrastre(fileId));
  }

  createDocumentItem(fileId: number): FormGroup {
    return this.formBuilder.group({
      voucher: ['', [Validators.required]],
      image: ['', [Validators.required]],
      paymentDate: ['', [Validators.required]],
      file: [''],
      fileId: [fileId]
    });
  }

  createDocumentItemArrastre(fileId: number): FormGroup {
    return this.formBuilder.group({
      voucher: [''],
      image: [''],
      paymentDate: [''],
      file: [''],
      fileId: [fileId]
    });
  }

  getControlDocuments() {
    return (this.documentForm.get('documentList') as FormArray).controls;
  }

  getPaymentsArrastres() {
    return (this.documentArrastresForm.get('documentArrastresList') as FormArray).controls;
  }

  onBlurVoucher(index:number){
    const fileControl:any = this.getControlDocuments();
    const valueVoucher = fileControl[index].get('voucher')?.value;
    for (let i = 0; i < fileControl.length; i++) {
      if(i != index){
        if(valueVoucher === fileControl[i].get('voucher')?.value){
          fileControl[index].get('voucher')?.setValue('');
          this.common.message('El número de comprobante a ingresar no pueden ser igual','','warning','#d3996a');
        }
      }
    }

    //validate in service
    this.common.getValidationVoucher(valueVoucher).subscribe({
      next: (response: any) => {
        if (response.existVoucherNumber === 1) {
          fileControl[index].get('voucher')?.setValue('');
          this.common.message('Código de Voucher ya esta registrado', '', 'warning', '#d3996a');
        }
      },
      error: (error: any) => {
        console.log(error);
      }
    })

  }

}
