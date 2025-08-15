import { Component, OnInit, EventEmitter, Output, Input, inject, SecurityContext } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { References } from '@utils/interfaces/rrhh.interfaces';
import { CommonService } from '@services/common.service';
import { DatePipe, formatDate, NgFor, NgIf } from '@angular/common';
import { RrhhService } from '@services/rrhh.service';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { environment } from '@environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { ApiService } from '@services/api.service';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import * as moment from 'moment';

const MAX_FILE_SIZE = 5000000;
interface Reg{
	'file': File,
	'index': number
}

@Component({
  selector: 'app-book-publish',
  templateUrl: './book-publish.component.html',
  styles: [

  ],
  providers:[
    DatePipe,
    provideNgxMask()
  ],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    NgFor,
    NgIf,
    MatTooltipModule,
    MatStepperModule,
    MatSelectModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    NgxMaskDirective,
		MatSnackBarModule,
		SpinnerLoaderComponent,
		MatIconModule,
		MatCheckboxModule
  ]
})
export class BookPublishComponent implements OnInit {

	public isLoadingInfo: boolean= false;
	private getPdfContentSubscription!: Subscription;

  /* *************************************** INPUTS & OUTPUTS ***************************************** */
  @Output() validForm: EventEmitter<boolean> = new EventEmitter();
  @Input('personID') personID: number = 0;
	isLoading: boolean= false;
  positions: any[]=[]
  countries: any[] = []
  listFilesUpload: Reg[] = [];
	public booksPublishing: any[] = [];

  testPattern = {
    S: { pattern: new RegExp('[A-Za-z0-9]') },
  };
  phone = {
    S: { pattern: new RegExp('[+0-9]') },
  };

	private sanitizer: DomSanitizer = inject(DomSanitizer);
	private api: ApiService = inject(ApiService);

  constructor( private fb: FormBuilder,
                private common: CommonService,
                private rrhh: RrhhService,
                private router: Router,
								private snackBar: MatSnackBar, ){}

  ngOnInit(): void {
    this.addForm();
    this.loadInformation();

    this.common.getCountries().subscribe({
      next: (res) => {
        this.countries = res;
      }
    })
  }

  /* *********************************** -------------------------- *********************************** */


  /* *********************************** GETERS Y SETERS ********************************************** */

  get dynamicsArr(): FormArray {
    return this.societyForm.get('dynamics') as FormArray;
  }
  /* *********************************** -------------------------- *********************************** */


  /* *********************************** FORMULARIOS DEL FORMULARIO *********************************** */

  public societyForm!: FormGroup;

  private addForm(): void {
    this.societyForm = this.fb.group({
      dynamics: this.fb.array([])
    })
  }

  public myForm: FormGroup = this.fb.group({
    personID:                     [this.personID],
    bookName:                  [''],
    bookPublishingDate:     [''],
    bookPublishingEditorial: [''],
    bookPublishingISBNNro: [''],
    bookPublishingParticipation: [''],
    urlDocument: [''],
    user: [sessionStorage.getItem('name')],
		statusID: 1,
    // fileBook: [0],
  });

  /* *********************************** -------------------------- *********************************** */


  /* *********************************** FUNCIONES VARIAS ********************************************* */

  charge(){
    //console.log('in charge', this.myForm);

    if(this.myForm.invalid) {
      this.myForm.markAllAsTouched();
      return;
    }
    //console.log('in value passs');

    const form = this.myForm.value

    const record: FormGroup = this.fb.group({
			bookPublishingID: '',
      personID:                     [this.personID],
      bookName:                  [form.bookName],
      bookPublishingDate:     [moment(form.bookPublishingDate).format('YYYY-MM-DD')],
      bookPublishingEditorial: [form.bookPublishingEditorial],
      bookPublishingISBNNro: [form.bookPublishingISBNNro],
      bookPublishingParticipation: [form.bookPublishingParticipation],
      urlDocument: [''],
      user: [sessionStorage.getItem('name')],
			statusID: form.statusID,
      fileBook: [null],
    });

    this.dynamicsArr.push(record);
    this.myForm.reset({country: 59});
  }

  isValidField( field: string ): boolean | null{
    return this.myForm.controls[field].errors
          && this.myForm.controls[field].touched;
  }

  isValidFieldInArray(formArray: FormArray, i: number){
    return formArray.controls[i].errors
        && formArray.controls[i].touched;
  }

  getFielError( field: string): string | null {
    if( !this.myForm.controls[field] ) return null;

    const errors = this .myForm.controls[field].errors || {};

    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
            return 'Campo requerido!';
        case 'min':
          if(errors['min'].min === 1){
            return 'Debe seleccionar una opción!';
          }else{
            return 'Cantidad Incorrecta!';
          }

        case 'email':
            return 'No es un formato de email valido!';
        case 'minlength':
            return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
      }
    }
    return '';
  }

  public deleteDynamic(index: number): void {
    this.dynamicsArr.removeAt(index);
  }

  saveRecord(){
    //console.log('in save record', this.societyForm);
		this.isLoading= true;
    if( this.societyForm.invalid ){
      this.societyForm.markAllAsTouched();
      this.common.message('Información Incompleta o Incorrecta', ' Revise que no existan campos en color rojo', 'error','#f5637e');
			this.isLoading= false;
      return;
    }
      const dynamic: any = this.societyForm.value as any;
      this.rrhh.postBookPublishing(dynamic)
        .subscribe({ next: (res: any) => {
          this.listFilesUpload.forEach((item: Reg, index: number) => {
						if(res[index].sequenceNro){
							this.rrhh.postFileDocs(item.file, this.personID, 20, res[index].sequenceNro).subscribe({
								next: (docs: any) => {
									console.log('docs', docs);
								}
							})
						}else{
							this.rrhh.postFileDocs(item.file, this.personID, 20, item.index+1).subscribe({
								next: (docs: any) => {
									console.log('docs', docs);
								}
							})
						}
          })
          setTimeout(() => {
						this.common.message('Se  ha guardado la información con éxito', '', 'success', "#d3996a");
						this.isLoading= false;
					}, 2500);
        	},
					error: (err: HttpErrorResponse) => {
						//console.log('err',err);
						this.isLoading= false;
					}
				});
  }


  loadInformation(){
    this.rrhh.getPosition().subscribe({
      next: (resp: any) => {
        this.positions = resp;
      }
    });

		setTimeout(() => {
			this.getBookPublishing();
		}, 250);
  }

  public onChangeInput(files: FileList, index: number, input: HTMLInputElement): void {
    if (files) {
			if(files[0].size > MAX_FILE_SIZE){
				input.value='';
				this.snackBar.open(
          `Máximo 5MB permitido`,
          null,
          {
            horizontalPosition: 'center',
            verticalPosition: 'top',
            duration: 4000,
            panelClass: ['red-snackbar']
          }
        );
			}else{
				const file: File = files.item(0);
				const fileReader = new FileReader();
				if (file) {
					let reg= {
						'file': file,
						'index': index
					}
					this.listFilesUpload.push(reg);
				}
			}
    }
  }

  public addingRow(): FormGroup {
		return this.fb.group({
			bookPublishingID: '',
			personID: [this.personID],
			bookName: [''],
			bookPublishingDate: [''],
			bookPublishingEditorial: [''],
			bookPublishingISBNNro: [''],
			bookPublishingParticipation: [''],
			urlDocument: [''],
			user: [sessionStorage.getItem('name')],
			statusID: 1,
			fileBook: [''],
		});
	}

	public getBookPublishing(): void {
		this.rrhh.getBookPublishing(this.personID).subscribe({
			next: (res) => {
				if(res[0]){
					this.isLoadingInfo= true;
					//console.log('BookPublishing', res);
					this.booksPublishing= res;
					for(let i=0; i<res.length; i++){
						let arr = this.societyForm.controls['dynamics'] as FormArray;
						arr.push(this.addingRow());
						arr.controls[i].patchValue(res[i]);
						//if(res[i].bookPublishingDate) arr.controls[i].get('bookPublishingDate').patchValue(formatDate(res[i].bookPublishingDate, 'yyyy-MM-dd', 'en-US', '+4000'));
					}
				}
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public putBookPublishing(index: number): void {
		if(this.dynamicsArr.controls[index].get('statusID').value === true) this.dynamicsArr.controls[index].get('statusID').patchValue(1);
		else if(this.dynamicsArr.controls[index].get('statusID').value === false) this.dynamicsArr.controls[index].get('statusID').patchValue(0);
		if(this.dynamicsArr.controls[index].valid && this.dynamicsArr.controls[index].get('bookPublishingID').value){
			this.rrhh.putBookPublishing(this.dynamicsArr.controls[index].value).subscribe({
				next: (res: any) => {
					//console.log('put', res);
					this.snackBar.open(
						`${res.message}`,
						null,
						{
							horizontalPosition: 'center',
							verticalPosition: 'top',
							duration: 3000,
							panelClass: ['green-snackbar']
						}
					);
				},
				error: (err: HttpErrorResponse) => {
					//console.log('err',err);
					this.snackBar.open(
						`Intente nuevamente.`,
						null,
						{
							horizontalPosition: 'center',
							verticalPosition: 'top',
							duration: 3000,
							panelClass: ['red-snackbar']
						}
					);
				}
			});
		}else{
			this.dynamicsArr.controls[index].markAllAsTouched();
		}
	}

	public openFile(relativeRoute: string): void {
    const route: string = `${environment.url}/${relativeRoute}`;
    if (this.getPdfContentSubscription) this.getPdfContentSubscription.unsubscribe();
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

}
