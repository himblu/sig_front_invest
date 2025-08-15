import { ChangeDetectorRef, Component, inject,  SecurityContext, ViewChild, ElementRef } from '@angular/core';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule, ValidationErrors,
  Validators
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FILE_STATE, SPGetFileState, StudentDocument, ValidateStatus } from '@utils/interfaces/others.interfaces';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { map, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministrativeService } from '@services/administrative.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonService } from '@services/common.service';
import { User } from '@utils/models/user.models';
import { UserService } from '@services/user.service';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { ApiService } from '@services/api.service';
import Swal from 'sweetalert2';
import { DomSanitizer } from '@angular/platform-browser';

const MAX_FILE_SIZE = 5 * 1048576;

@Component({
  selector: 'app-upload-documents',
  standalone: true,
  imports: [
    MatIconModule,
    MatSelectModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    NgForOf,
    NgIf,
    MatSnackBarModule,
    MatTooltipModule,
    NgClass,
    NgxMaskDirective
  ],
  templateUrl: './upload-documents.component.html',
  styleUrls: ['./upload-documents.component.css']
})

export class UploadDocumentsComponent extends OnDestroyMixin {
  public user: User;
  public form: FormGroup;
  public documents: StudentDocument[] = [];
  public documentsStates: SPGetFileState[] = []
	@ViewChild('input') input!: ElementRef <any>;
  private postFileSubscription: Subscription;
  private formBuilder: FormBuilder = inject(FormBuilder);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private adminApi: AdministrativeService = inject(AdministrativeService);
  private snackBar: MatSnackBar = inject(MatSnackBar);
  private userService: UserService = inject(UserService);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private api: ApiService = inject(ApiService);
  private router: Router = inject(Router);
	private sanitizer: DomSanitizer = inject(DomSanitizer);
  constructor( private common : CommonService ) {
    super();
    this.user = this.userService.currentUser;
    this.getDataFromResolver();
    this.initForm();
    this.api.getCurrentPeriod().subscribe((res) => {
      console.log(res);
    });
  }

  private initForm(): void {
    this.form = this.formBuilder.group({});
    this.documents.map((item) => {
      this.form.registerControl(
        item.fileID.toString(),
        this.formBuilder.control('', [Validators.required])
      );
    });
  }

  private getDataFromResolver(): void {
    this.activatedRoute.data
    .pipe(
    untilComponentDestroyed(this),
    map((value: any) => value['resolver']))
    .subscribe({
      next: (value: { documents: StudentDocument[], documentsStates: SPGetFileState[], documentsUpload: StudentDocument[] }) => {
        console.log(value);
        this.documents = value.documentsUpload;
        this.documentsStates = value.documentsStates;
      },
    });
  }

  public onChangeInput(files: FileList, item: StudentDocument): void {
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
		Swal
    .fire({
				icon: 'question',
        title: "El archivo es correcto?",
        showCancelButton: true,
        confirmButtonText: "Si",
        cancelButtonText: "No",
    })
    .then(result => {
			if(result.value){
				if (files) {
					const file: File = files.item(0);
					const fileReader = new FileReader();

					const control = this.form.get(item.fileID.toString());
					fileReader.onloadend = (e) => {
						control.patchValue(file);
						let errors: ValidationErrors = control.errors || {};
						if (file.size > MAX_FILE_SIZE) {
							errors['sizeError'] = true;
							control.setErrors(Object.keys(errors).length > 0 ? errors : null);
							return;
						} else {
							delete errors['sizeError'];
						}

						const arr = new Uint8Array(e.target.result as ArrayBuffer).subarray(0, 4);
						let isValid: boolean = false;
						let header = '';
						for (let i = 0; i < arr.length; i++) {
							header += arr[i].toString(16);
							isValid = header === '25504446';
						}
						if (isValid) {
							delete errors['invalidMimeType'];
						} else {
							// errors['invalidMimeType'] = true;
						}
						control.setErrors(Object.keys(errors).length > 0 ? errors : null);
						control.markAsTouched();
						this.cdr.markForCheck();
						if (Object.keys(errors).length === 0) {
							this.postFile(item.fileTypeID, file, item.fileID);
						}
					};
					fileReader.readAsArrayBuffer(file.slice(0 , 4));
				}
			}else{
				this.input.nativeElement.value='';
				this.snackBar.open(
          `Cargue el archivo nuevamente`,
          null,
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

  private postFile(fileType: number, file: File, fileId:number): void {
    if (this.postFileSubscription) {
      this.postFileSubscription.unsubscribe();
    }
    this.postFileSubscription = this.adminApi.postStudentDocument(fileType, file, fileId)
      .subscribe({
      next: (value: StudentDocument) => {
        this.snackBar.dismiss();
        this.snackBar.open(
          `Documento cargado exitosamente`,
          null,
          {
            horizontalPosition: 'center',
            verticalPosition: 'top',
            duration: 4000,
            panelClass: ['green-snackbar']
          }
        );
        const indexStudentDocumentSent: number = this.documents.findIndex((item) => item.fileTypeID === value.fileTypeID);
        if (indexStudentDocumentSent !== -1) {
          this.documents[indexStudentDocumentSent] = value;
        }
        if(this.form.valid){
          let aux: ValidateStatus = {
						p_personID: +sessionStorage.getItem('id')! || 0,
						p_studentID: +sessionStorage.getItem('studentID')! || 0,
						p_companyID: 1,
						p_processEnrollCode: '03',
						p_state: 1
					}
          this.common.validateStatus(aux)
            .subscribe((resp: any) => {
              this.router.navigateByUrl('/matriculacion/matricula').then();
            })
        }
      }
    });
  }

  // save(){
  //   if(this.form.valid){
  //     let aux: ValidateStatus = {
  //       p_personID: +sessionStorage.getItem('id')! || 0,
  //       p_companyID: 1,
  //       p_processEnrollCode:'03',
  //       p_state: 1
  //     }
  //     this.common.validateStatus(aux)
  //     .subscribe( (resp: any) => {
  //         this.common.message('Documentos cargados', '', 'success', '#86bc57');
  //         console.log(resp);
  //       })
  //   }
  //   else{
  //     this.common.message('Debe cargar los 2 archivos para continuar', '', 'info', '#2eb4d8');
  //   }
  // }
	protected readonly FILE_STATE = FILE_STATE;
}
