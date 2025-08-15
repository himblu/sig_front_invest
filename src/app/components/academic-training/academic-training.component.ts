import { Person } from '@utils/interfaces/person.interfaces';
import { Component, EventEmitter, OnInit, Output, Input, ElementRef, ViewChild, inject, SecurityContext } from '@angular/core';
import { Form, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import { Country } from '@utils/interfaces/others.interfaces';
import { AcademicTraining, Record, Training } from '@utils/interfaces/rrhh.interfaces';
import { CommonService } from '@services/common.service';
import { RrhhService } from '@services/rrhh.service';
import { DatePipe, formatDate, NgFor, NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '@services/api.service';
import { Subscription, tap } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { environment } from '@environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { MatCheckboxModule } from '@angular/material/checkbox';

const MAX_FILE_SIZE = 5000000;
interface Reg{
	'file': File,
	'index': number
}

@Component({
  selector: 'components-academic-training',
  templateUrl: './academic-training.component.html',
  styles: [],
  standalone: true,
  providers: [
    DatePipe
  ],
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgFor,
    NgIf,
    MatButtonModule,
    MatTooltipModule,
    MatStepperModule,
    MatInputModule,
    MatIconModule,
		MatSelectModule,
		SpinnerLoaderComponent,
		MatSnackBarModule,
		MatCheckboxModule
  ]
})
export class AcademicTrainingComponent implements OnInit {

  /* *************************************** INPUTS & OUTPUTS ***************************************** */
  @Output() validForm: EventEmitter<boolean> = new EventEmitter();
  @Input('personID') personID: number = 0;
  file_store: Array<FormData> = [];
  fd = new FormData();
  //file_list: Array<string> = [];
  /* *************************************** ---------------- ***************************************** */


  /* ************************************ LISTAS GETTERS SETTERS ************************************** */

  get dynamicsArr(): FormArray {
    return this.recordForm.get('dynamics') as FormArray;
  }
  /* *********************************** ------------------ ******************************************* */


  /* *********************************** VARIABLES GLOBALES ******************************************* */

  isLoading: boolean = false;
  countryList: Country[] = [];
  dateControl: string = '';
  sectorList: any[] = [];
  titleList: any[] = [];
  listFilesUpload: Reg[]= [];
	listFilesSenescytUpload: Reg[] = [];
	public isLoadingInfo: boolean= false;
	public academicTraining: AcademicTraining[] = [];

  @ViewChild('fileRef') fileRef: ElementRef;
	private sanitizer: DomSanitizer = inject(DomSanitizer);
	private snackBar: MatSnackBar = inject(MatSnackBar);
	private getPdfContentSubscription!: Subscription;

  /* *********************************** ------------------ ******************************************* */


  /* *********************************** COSTRUCTOR Y CICLO DE VIDA *********************************** */

  constructor(private fb: FormBuilder,
    private common: CommonService,
    private rrhh: RrhhService,
    private dateAdapter: DateAdapter<Date>,
    private datePipe: DatePipe,
    private api: ApiService,
  ) {
    // this.dateAdapter.setLocale('en-GB'); //dd/MM/yyyy
  }

  ngOnInit(): void {
    this.addForm();
    this.load();

    this.myForm.get('recordDate').valueChanges
      .subscribe(resp => this.dateControl = resp);
  }

  /* *********************************** -------------------------- *********************************** */


  /* *********************************** GETERS Y SETERS ********************************************** */

  /* *********************************** -------------------------- *********************************** */


  /* *********************************** FORMULARIOS DEL FORMULARIO *********************************** */

  public recordForm!: FormGroup;

  private addForm(): void {
    this.recordForm = this.fb.group({
      dynamics: this.fb.array([])
    })
  }

  public myForm: FormGroup = this.fb.group({
    personID: [this.personID],
    thirdLevelDegree: ['', [Validators.required]],
    recordDate: ['', [Validators.required]],
    university: ['', [Validators.required]],
    country: [59, [Validators.required]],
    recordSenescyt: ['', [Validators.required]],
    subAreaKnowledge: [''],
    type: [0, [Validators.required]],
    sector: [0, [Validators.required]],
		fileTraining: [''],
    urlDocument: [''],
		statusID: 1,
    user: ['ADMIN'],
  });

  /* *********************************** -------------------------- *********************************** */


  /* *********************************** FUNCIONES VARIAS ********************************************* */

  load() {

    this.common.getDegree().subscribe({
      next: (resp: any) => {
        this.titleList = resp;
        //console.log('titleList', this.titleList);
      }
    })
    this.common.getCountry()
      .subscribe(country => {
        this.countryList = country
      })
    this.common.getSector().subscribe({
      next: (resp: any) => {
        this.sectorList = resp;
        //console.log('sectorList', this.sectorList);
      }
    })
    //Get info saved
    /*this.rrhh.getTraining(this.personID).subscribe({
      next: (resp: any) => {
        ///console.log('getTraining', resp);
        if (resp.length > 0) {
          this.dynamicsArr.clear();
          for (let i = 0; i < resp.length; i++) {
            const record: FormGroup = this.fb.group({
              personID: [resp[i].personID],
              thirdLevelDegree: [resp[i].thirdLevelDegree, [Validators.required]],
              recordDate: [this.formattedDate(new Date(resp[i].recordDate)), [Validators.required]],
              university: [resp[i].university, [Validators.required]],
              country: [resp[i].country, [Validators.required]],
              recordSenescyt: [resp[i].recordSenescyt, [Validators.required]],
              subAreaKnowledge: [resp[i].subAreaKnowledge],
              type: [resp[i].type, [Validators.required]],
              sector: [resp[i].sector, [Validators.required]],
              fileTraining: [resp[i].fileTraining, [Validators.required]],
              urlDocument: [''],
              user: ['ADMIN'],
            });
            this.dynamicsArr.push(record);
          }
        }
      }
    })*/

		setTimeout(() => {
			this.getAcademicTraining();
		}, 250);
  }

  isValidField(field: string): boolean | null {
    return this.myForm.controls[field].errors
      && this.myForm.controls[field].touched;
  }

  isValidFieldInArray(formArray: FormArray, i: number) {
    return formArray.controls[i].errors
      && formArray.controls[i].touched;
  }

  getFielError(field: string): string | null {
    if (!this.myForm.controls[field]) return null;

    const errors = this.myForm.controls[field].errors || {};

    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
          return 'Campo requerido!';
        case 'min':
          if (errors['min'].min === 1) {
            return 'Debe seleccionar una opción!';
          } else {
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

  charge() {
    if (!this.myForm.valid) {
      this.myForm.markAllAsTouched();
      return;
    }
    const form = this.myForm.value;
    const record: FormGroup = this.fb.group({
			academicTrainingID: '',
      personID: [this.personID],
      thirdLevelDegree: [form.thirdLevelDegree, [Validators.required]],
      recordDate: [this.formattedDate(new Date(this.dateControl)), [Validators.required]],
      university: [form.university, [Validators.required]],
      country: [form.country, [Validators.required]],
      recordSenescyt: [form.recordSenescyt, [Validators.required]],
      subAreaKnowledge: [form.subAreaKnowledge],
      type: [form.type, [Validators.required]],
      sector: [form.sector, [Validators.required]],
      fileTraining: [form.fileTraining, [Validators.required]],
      urlDocument: [''],
			statusID: [form.statusID, [Validators.required]],
      user: ['ADMIN'],
    });
    this.dynamicsArr.push(record);
    this.myForm.reset({ country: 59 });
  }

  public deleteDynamic(index: number): void {
    this.dynamicsArr.removeAt(index);
  }

  saveRecord() {
		this.isLoading= true;
    if (!this.recordForm.valid) {
      this.recordForm.markAllAsTouched();
      this.common.message('Información Incompleta o Incorrecta', ' Revise que no existan campos en color rojo', 'error', '#f5637e');
			this.isLoading= false;
      return;
    }

    const dynamic: Training = this.recordForm.value as Training;
    const sequenceNmr: number[] = [];
    this.rrhh.postTraining(dynamic)
      .subscribe({ next: (res: any) => {
				//console.log('post', res);
          this.listFilesUpload.forEach((item: Reg, index: number) => {
            if(res[index].sequenceNro){
              this.rrhh.postFileDocs(item.file, this.personID, 17, res[index].sequenceNro).subscribe({
                next: (docs: any) => {
                  console.log('docs', docs);
                }
              });
            }else{
							this.rrhh.postFileDocs(item.file, this.personID, 17, item.index).subscribe({
                next: (docs: any) => {
                  console.log('docs', docs);
                }
              });
						}
        	});
					this.listFilesSenescytUpload.forEach((item: Reg, i: number) => {
						if(res[i].sequenceNro){
							this.submitFile(item.file, res[i].sequenceNro)
						}else{
							this.submitFile(item.file, item.index)
						}
					});
					setTimeout(() => {
						this.common.nextStep.next(true);
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

  private formattedDate(date: Date): string {
    return <string>this.datePipe.transform(date, 'yyyy-MM-dd');
  }

  public onChangeInput(files: FileList, input: HTMLInputElement, index?: number): void {
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

	public onChangeSenescytInput(files: FileList, input: HTMLInputElement, index?: number): void{
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
					this.listFilesSenescytUpload.push(reg);
				}
			}
		}
	}

	public submitFile(file: File, index: number): void {
		this.rrhh.postCollaboratorDocs(file, this.personID, 25, index).subscribe({
			next: (res) => {
				console.log(res);
			},
			error: (err: HttpErrorResponse) => {
				this.isLoading= false;
			}
		});
	}

	public addingRow(): FormGroup {
		return this.fb.group({
			academicTrainingID: '',
			personID: [this.personID],
			thirdLevelDegree: ['', [Validators.required]],
			recordDate: ['', [Validators.required]],
			university: ['', [Validators.required]],
			country: [59, [Validators.required]],
			recordSenescyt: ['', [Validators.required]],
			subAreaKnowledge: [''],
			type: [0, [Validators.required]],
			sector: [0, [Validators.required]],
			fileTraining: [''],
			urlDocument: [''],
			statusID: 1,
			user: ['ADMIN'],
		});
	}

  public getAcademicTraining(): void {
		this.rrhh.getAcademicTraining(this.personID).subscribe({
			next: (res) => {
				if(res[0]){
					this.isLoadingInfo= true;
					//console.log('AcademicTraining', res);
					this.academicTraining= res;
					for(let i=0; i<res.length; i++){
						let arr = this.recordForm.controls['dynamics'] as FormArray;
						arr.push(this.addingRow());
						arr.controls[i].patchValue(res[i]);
						arr.controls[i].get('sector').patchValue(res[i].sectorID);
						//if(res[i].recordDate) arr.controls[i].get('recordDate').patchValue(formatDate(res[i].recordDate, 'yyyy-MM-dd', 'en-US', '+4000'));
					}
				}
				//this.myForm.reset({ country: 59 });
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public putAcademicTraining(index: number): void {
		if(this.dynamicsArr.controls[index].get('statusID').value === true) this.dynamicsArr.controls[index].get('statusID').patchValue(1);
		else if(this.dynamicsArr.controls[index].get('statusID').value === false) this.dynamicsArr.controls[index].get('statusID').patchValue(0);
		if(this.dynamicsArr.controls[index].valid && this.dynamicsArr.controls[index].get('academicTrainingID').value){
			this.rrhh.putAcademicTraining(this.dynamicsArr.controls[index].value).subscribe({
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
