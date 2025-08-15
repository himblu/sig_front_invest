import { Component, ViewChild, ElementRef, OnInit, OnDestroy, inject, SecurityContext, Input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, FormArray, FormControl, } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { NgFor, NgForOf, NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { filter, map, Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '@services/user.service';
import { ActivatedRoute } from '@angular/router';
import { Period } from '@utils/interfaces/period.interfaces';
import { CurrentPeriod } from '@utils/interfaces/others.interfaces';
import { CoursesLinkage, CoursesLinkageFile, Cycle } from '@utils/interfaces/campus.interfaces';
import { environment } from '@environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { FILE_STATE } from '@utils/interfaces/others.interfaces';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { FilterBySequencePipe } from '../../pipes/filter-by-sequence.pipe';

const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
const MAX_FILE_SIZE = 15000000;

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [
		ReactiveFormsModule,
		NgForOf,
		NgFor,
		NgIf,
		MatInputModule,
		MatButtonModule,
		MatFormFieldModule,
		MatSelectModule,
		MatTooltipModule,
		MatIconModule,
		MatSnackBarModule,
		FilterBySequencePipe
	],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})

export class FileUploadComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public charging: boolean = false;
	public filtersForm!: FormGroup;
	public filesForm!: FormGroup;
	public periods: Period[] = [];
	public currentPeriod: CurrentPeriod
	public cycles: Cycle[] = [];
	public coursesLinkages: CoursesLinkage[] = [];
	public readonly file_state= FILE_STATE;
	@ViewChild('submit', { read: ElementRef }) public submit: ElementRef;

	private getPdfContentSubscription!: Subscription;
	private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private sanitizer: DomSanitizer = inject(DomSanitizer);
	private snackBar: MatSnackBar = inject(MatSnackBar);

	constructor(private fb: FormBuilder,
		private common: CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private user: UserService, ){
		super();
		this.initForms();
	}

	ngOnInit(): void {
		this.getDataFromResolver();
		this.getCyclesByPerson();
		this.initFilesForm();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	private getDataFromResolver(): void {
    this.activatedRoute.data
    .pipe(untilComponentDestroyed(this), map((value: any) => value['resolver']))
    .subscribe({ next: (value: {
				periods: Period[],
				currentPeriod: CurrentPeriod
			}) => {
        this.periods = value.periods;
        this.currentPeriod = value.currentPeriod;
      },
    });
		this.filtersForm.get('periodID').patchValue(this.currentPeriod.periodID);
  }

	public initForms(): void {
		this.filtersForm= this.fb.group({
			filter: '',
			periodID: ['', Validators.required],
			cycleID: ['', Validators.required],
			studentID: +sessionStorage.getItem('studentID'),
		})
	}

	public initFilesForm(): void {
		this.filesForm= this.fb.group({
			data: this.fb.array([])
		});
	}

	public getDataArray(): FormArray {
		return this.filesForm.controls['data'] as FormArray;
	}

	public getDataRow(i: number, index: number, control: string): FormControl {
		let data= this.filesForm.controls['data'] as FormArray;
		let array= data.controls[i] as FormArray;
		let row = array.controls[index].get(control) as FormControl;
		return row;
	}

	public addFilesControl() {
    this.getDataArray().push(this.fb.array([]));
	}


	public filesRow(course: CoursesLinkage, file: CoursesLinkageFile): FormGroup {
    return this.fb.group({
			urlFile: [file.urlFile || '', [Validators.required]],
			periodID: [this.filtersForm.get('periodID').value, [Validators.required]],
			personID: [this.user.currentUser.PersonId, [Validators.required]],
			studentID: +sessionStorage.getItem('studentID'),
			modalityPracticeID: [course.modalityPracticeID, [Validators.required]],
			processTemplateID: [file.processTemplateID, [Validators.required]],
			projectPracInformativeID: [course.projectPracInformativeID, [Validators.required]],
			studentProcessFileID: file.studentProcessFileID || 0,
			statusFileID: file.statusFileID,
			statusFileDesc: file.statusFileDesc,
		});
	}

	public addFilesRow(course: CoursesLinkage, file: CoursesLinkageFile, i: number) {
    let array= this.getDataArray().controls[i] as FormArray;
    array.push(this.filesRow(course, file));
	}

	public getCyclesByPerson(): void{
		this.charging= true;
		this.admin.getCyclesByPerson(this.user.currentUser.PersonId).subscribe({
			next: (res: Cycle[]) => {
				this.cycles=res;
				this.charging = false;
			},
			error: (err: HttpErrorResponse) => {
				this.charging = false;
			}
		});
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

	public openRelativeFile(item: CoursesLinkageFile): void {
		if(item.urlFile.includes('http') || item.urlFile.includes('www')){
			window.open(item.urlFile, '_blank');
		}else{
			window.open(environment.pullZone + item.urlFile, '_blank');
		}
  }

	public getCoursesLinkage(state: boolean= true): void{
		if(this.filtersForm.valid){
			this.charging= state;
			this.admin.getCoursesLinkage(this.filtersForm.value).subscribe({
				next: (res: CoursesLinkage[]) => {
					//console.log('CoursesLinkage', res);
					this.coursesLinkages= res;
					this.initFilesForm();
					for(let i=0; i<this.coursesLinkages.length; i++){
						this.addFilesControl();
						for(let index=0; index<this.coursesLinkages[i].files.length; index++){
							if(this.coursesLinkages[i].files[index]) this.addFilesRow(this.coursesLinkages[i], this.coursesLinkages[i].files[index], i);
						}
					}
					this.charging = false;
				},
				error: (err: HttpErrorResponse) => {
					this.charging = false;
				}
			});
		}else{
			this.filtersForm.markAllAsTouched();
		}
	}

	public postFile(i: number, index: number, file: File, input: HTMLInputElement): void {
		const array = this.getDataArray().controls[i] as FormArray;
		let servicePath;
		let formData = new FormData();
		formData.append('file', file);
		this.charging= true;
		if(array.controls[index].get('statusFileID').value === this.file_state.NO_FILE) servicePath= this.common.postProjectCoursesFile(formData);
		else servicePath= this.common.putProjectCoursesFile(formData, array.controls[index].get('studentProcessFileID').value);
		servicePath.subscribe({
			next: (res: any) => {
				//console.log('urlFile', res.urlFile);
				array.controls[index].get('urlFile').patchValue(res.urlFile);
				input.setAttribute("disabled", "true");
				this.onSubmit(i, index);
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err', err);
				this.charging= false;
				input.value= '';
				this.snackBar.open(
					`No se pudo guardar el archivo, intente nuevamente`,
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

	public onSubmit(i: number, index: number): void {
		const array = this.getDataArray().controls[i] as FormArray;
		if(array.controls[index].valid){
			let body= [];
			/* for(let index=0; index<array.value.length; index++){
				if(array.value[index].statusFileID !== this.file_state.APPROVED) body.push(array.value[index]);
			} */
			body.push(array.controls[index].value);
			this.charging= true;
			this.admin.getStudentProcessFIles({'items': body}).subscribe({
				next: (res: any) => {
					//console.log('post', res);
					this.common.message(`${res.message}`,'','success','#86bc57');
					this.charging = false;
					this.initFilesForm();
					this.getCoursesLinkage();
				},
				error: (err: HttpErrorResponse) => {
					this.charging = false;
				}
			});
		}else{
			array.markAllAsTouched();
		}
	}

	public onChangeInput(files: FileList, input: HTMLInputElement, i: number, index: number): void{
		if(files[0].size > MAX_FILE_SIZE){
			input.value='';
			this.snackBar.open(
				`Máximo 15MB permitido`,
				null,
				{
					horizontalPosition: 'center',
					verticalPosition: 'top',
					duration: 4000,
					panelClass: ['red-snackbar']
				}
			);
		}else{
			Swal.fire({
				icon: 'question',
				title: ``,
				text: `¿Está seguro de subir el archivo?`,
				showCancelButton: true,
				confirmButtonText: "Si",
				cancelButtonText: "No",
				allowOutsideClick: false,
			}).then(result => {
				if(result.value){
					this.postFile(i, index, files.item(0), input);
				}else{
					input.value='';
				}
			});
		}
	}

}
