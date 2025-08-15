import { AgreementConvention, Business, Code, StatusAgreement } from './../../../../utils/interfaces/person.interfaces';
import { Component, ViewChild, ElementRef, OnInit, OnDestroy, SecurityContext, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { NgForOf, NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { UserService } from '@services/user.service';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Agreementtype, ObjetiveType, ProgramType } from '@utils/interfaces/person.interfaces';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { DatePipe } from '@angular/common';
import { SPGetCareer } from '@utils/interfaces/campus.interfaces';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { environment } from '@environments/environment';

const MAX_FILE_SIZE = 15000000 ;

@Component({
  selector: 'app-agreements',
	standalone: true,
	imports: [
		NgIf,
		NgForOf,
		ReactiveFormsModule,
		MatInputModule,
		MatButtonModule,
		MatFormFieldModule,
		MatSelectModule,
		MatTooltipModule,
		MatIconModule,
		MatNativeDateModule,
		MatPaginatorModule,
		MatMenuModule,
		MatDatepickerModule,
		MatAutocompleteModule,
		AsyncPipe,
		DatePipe,
		MatSnackBarModule
	],
	providers: [
		DatePipe
	],
  templateUrl: './agreements.component.html',
  styleUrls: ['./agreements.component.scss']
})
export class AgreementsComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	loading: boolean = false;
	public projectForm!: FormGroup;
	public acuerdosForm!: FormGroup;
	public conveniosForm!: FormGroup;
	public filtersForm!: FormGroup;
	public businessForm!: FormGroup;
	public myControl = new FormControl<string | Business>('', Validators.required);
	public pageIndex: number = 1;
  public pageSize: number = 10;
  public length: number = 0;
  public pageEvent!: PageEvent;
  public pageSizeOptions: number[] = [5, 10, 25, 50, 100];
	public agreementType: Agreementtype[] = [];
	public programType: ProgramType[]= [];
	public objetiveType: ObjetiveType[]= [];
	public statusType: StatusAgreement[]= [];
	public agreementConventions: AgreementConvention[] = [];
	public careers: SPGetCareer[] = [];
	public options: Business[] = [];
  public filteredOptions: Observable<Business[]>;
	public entidad: string;
	public representante: string;
	public responsable: string;
	public isUpdating: boolean= false;
	public updatingItem: AgreementConvention= null;

	private file!: File;
	private sanitizer: DomSanitizer = inject(DomSanitizer);
	private snackBar: MatSnackBar = inject(MatSnackBar);
	private getPdfContentSubscription!: Subscription;

	@ViewChild('paginator', { static: true }) public paginator!: MatPaginator;
	@ViewChild('modalClose', { read: ElementRef }) public modalClose: ElementRef;
	@ViewChild('openModal', { read: ElementRef }) public openModal: ElementRef;

	constructor(private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private user: UserService,
		private router: Router,
		private date: DatePipe){
		super();
	}

	public ngOnInit(): void {
		this.initForms();
		this.initFiltersForm();
		this.getApprovalRequest();
		this.business_box();
		this.getAllCareers();
		this.getStatutsAgreement();
  }

	public business_box(): void{
		this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const ruc = typeof value === 'string' ? value : value?.ruc;
        return ruc ? this._filter(ruc as string) : this.options.slice();
      }),
    );
	}

	public _filter(ruc: string): Business[] {
    const filterValue = ruc.toLowerCase();
    return this.options.filter(option => option.ruc.toLowerCase().includes(filterValue));

  }

	private initFiltersForm(): void{
    this.filtersForm = this.fb.group({
      state: ['', Validators.required],
      search: [''],
			statusAgreement: [0]
    });
  }

	private initConventForm(): void{
    this.conveniosForm = this.fb.group({
			p_agreementConventionsID: '',
      p_agreementsID: [1],
      p_codeNumber: ['', [Validators.required]],
			p_ruc: [''],
			p_initdateAgreement: ['', [Validators.required]],
			p_enddateAgreement: ['', [Validators.required]],
			p_programvincID: ['', [Validators.required]],
			p_statusAgreement: ['', [Validators.required]],
			p_urlFile: ['', [Validators.required]],
			p_user: [this.user.currentUser.userName],
    });
  }

	private initBussinesForm(): void{
    this.businessForm = this.fb.group({
			entidad: ['', Validators.required],
			representante: ['', Validators.required],
			responsable: ['', Validators.required],
			objetives: ['', Validators.required],
			other: '',
    });
  }

	private initAgreementsForm(): void{
    this.acuerdosForm = this.fb.group({
			p_agreementConventionsID: '',
      p_agreementsID: [2],
      p_codeNumber: ['', [Validators.required]],
			p_ruc: [''],
			p_initdateAgreement: ['', [Validators.required]],
			p_enddateAgreement: ['', [Validators.required]],
			p_position: ['', Validators.required],
			p_statusAgreement: ['', [Validators.required]],
			p_careerID: ['', [Validators.required]],
			p_urlFile: ['', [Validators.required]],
			p_user: [this.user.currentUser.userName],
    });
  }

  public override ngOnDestroy() {
    super.ngOnDestroy();
  }

	public onSubmit(id: number): void{
		if(id === 1){
			if(this.conveniosForm.valid && this.businessForm.valid){
				let body = JSON.parse(JSON.stringify(this.conveniosForm.value, [
					'p_agreementsID',
					'p_codeNumber',
					'p_ruc',
					'p_initdateAgreement',
					'p_enddateAgreement',
					'p_programvincID',
					'p_statusAgreement',
					'p_urlFile',
					'p_user',
				]))
				this.common.postConventiosRegister(body).subscribe({
						next: (res) => {
							//console.log(res);
							this.postObjetives(this.conveniosForm.get('p_codeNumber').value);
					},
						error: (err: HttpErrorResponse) => {
								this.loading = false;
						}
				});
			}else{
				this.conveniosForm.markAllAsTouched();
				this.businessForm.markAllAsTouched();
				this.myControl.markAllAsTouched();
			}
		}else if(id === 2){
			if(this.acuerdosForm.valid && this.businessForm.valid){
				let body = JSON.parse(JSON.stringify(this.acuerdosForm.value, [
					'p_agreementsID',
					'p_codeNumber',
					'p_ruc',
					'p_initdateAgreement',
					'p_enddateAgreement',
					'p_position',
					'p_statusAgreement',
					'p_careerID',
					'p_urlFile',
					'p_user',
				]))
				this.common.postAgreementRegister(body).subscribe({
						next: (res) => {
							//console.log(res);
							this.postObjetives(this.acuerdosForm.get('p_codeNumber').value);
					},
						error: (err: HttpErrorResponse) => {
								this.loading = false;
						}
				});
			}else{
				this.acuerdosForm.markAllAsTouched();
				this.businessForm.markAllAsTouched();
				this.myControl.markAllAsTouched();
			}
		}
	}

	public postObjetives(codeNumber: string): void {
		let body= [];
		let objetivesArr= this.businessForm.get('objetives').value;
		for(let i=0; i<objetivesArr.length; i++){
			let other= '';
			if(objetivesArr[i] === 4) other=this.businessForm.get('other').value;
			let obj={
				p_codeNumber: codeNumber,
				p_objetivevincID: objetivesArr[i],
				p_other: other,
				p_user: this.user.currentUser.userName
			}
			body.push(obj);
		}

		this.common.postAgreementsConventionsObjetives({'dynamics': body}).subscribe({
			next: (res) => {
				//console.log(res);
				this.getAgreementConventions();
				this.initForms();
				this.modalClose.nativeElement.click();
				this.common.message(`Registro exitoso`,'','success','#86bc57');
				this.updatingItem= null;
				this.file= null;
				this.isUpdating= false;
			},
				error: (err: HttpErrorResponse) => {
					this.loading = false;
			}
		});
	}

	public findOther(): boolean {
		let objetivesArr= this.businessForm.get('objetives').value;
		let validator= 0;
		for(let i=0; i<objetivesArr.length; i++){
			if(objetivesArr[i] === 4) validator++
		}
		if(validator > 0) return true;
		else return false;
	}

	public initForms(): void {
		this.initConventForm();
		this.initAgreementsForm();
		this.initBussinesForm();
		this.myControl.reset();
		this.file= null;
		this.updatingItem= null;
	}

	private getApprovalRequest(): void{
		this.loading = true;
		this.common.getAgreementsType().subscribe({
				next: (res: Agreementtype[]) => {
					//console.log(res);
					this.loading = false;
					this.agreementType = res
				},
				error: (err: HttpErrorResponse) => {
						this.loading = false;
				}
		});
	}

	public getBusiness(agreementsID: number): void{
		this.loading = true;
		this.common.getBusinessByID(agreementsID).subscribe({
				next: (res: Business[]) => {
					//console.log(res);
					this.loading = false;
					this.options=res
					this.business_box();
				},
				error: (err: HttpErrorResponse) => {
						this.loading = false;
				}
		});
	}

	private getAllCareers(): void {
		this.loading = true;
		this.admin.getCareersTables().subscribe({
				next: (res) => {
					//console.log(res);
					this.loading = false;
					this.careers= res.data;
				},
				error: (err: HttpErrorResponse) => {
						this.loading = false;
				}
		});
	}

	public getdataforms(agreementsID: number): void{
		this.getProgram(agreementsID);
		this.getObjetive(agreementsID);
	}

	private getProgram(agreementsID: number): void{
			this.common.getProgram(agreementsID).subscribe({
				next: (res: ProgramType[]) => {
					//console.log(res);
					this.loading = false;
					this.programType= res;
				},
				error: (err: HttpErrorResponse) => {
						this.loading = false;
				}
		});
	}

	private getObjetive(agreementsID: number): void{
		this.common.getObjetive(agreementsID).subscribe({
			next: (res: ObjetiveType[]) => {
				//console.log(res);
				this.loading = false;
				this.objetiveType= res;
			},
			error: (err: HttpErrorResponse) => {
					this.loading = false;
			}
		});
	}

	private getStatutsAgreement(): void{
		this.common.getStatusAgreements().subscribe({
			next: (res: StatusAgreement[]) => {
				//console.log(res);
				this.loading = false;
				this.statusType= res;
			},
			error: (err: HttpErrorResponse) => {
					this.loading = false;
			}
		});
	}

	public fillBussines(entidad: string, representante: string, responsable: string, ruc: string, item: Business): void{
		//console.log('business', item);
		this.businessForm.get('entidad').patchValue(entidad);
		this.businessForm.get('representante').patchValue(representante);
		this.businessForm.get('responsable').patchValue(responsable);
		this.conveniosForm.get('p_ruc').patchValue(ruc);
		this.acuerdosForm.get('p_ruc').patchValue(ruc);
		this.acuerdosForm.get('p_position').patchValue(item.position);
	}

	public getAgreementConventions(): void{
		this.common.getAgreementConventions(this.filtersForm.get('state').value, this.pageIndex, this.pageSize,
		this.filtersForm.get('search').value, this.filtersForm.get('statusAgreement').value).subscribe({
			next: (res) => {
				//console.log('AgreementConventions', res.data);
				this.agreementConventions = res.data;
				this.length = res.count;
				this.loading = false;
			},
			error: (err: HttpErrorResponse) => {
					this.loading = false;
			}
		});
	}

	public getBusinessPaginator(event: PageEvent): PageEvent {
		//console.log(event);
    this.pageIndex = event.pageIndex+1;
    this.pageSize = event.pageSize;
    this.getAgreementConventions();
    return event;
  }

	public getAgreementConventionsByID(item: AgreementConvention): void {
		this.common.getAgreementConventionsByID(this.filtersForm.get('state').value, item.agreementConventionsID).subscribe({
			next: (res) => {
				//console.log('AgreementConvention', res);
				if(res[0]){
					if(item.agreementsID === 1){
						this.conveniosForm.get('p_agreementsID').patchValue(res[0].agreementsID);
						this.conveniosForm.get('p_codeNumber').patchValue(res[0].codeNumber);
						this.conveniosForm.get('p_ruc').patchValue(res[0].ruc);
						this.conveniosForm.get('p_urlFile').patchValue(res[0].urlFile);
						this.myControl.patchValue(res[0].ruc);
						this.conveniosForm.get('p_initdateAgreement').patchValue(res[0].initdateAgreement);
						this.conveniosForm.get('p_enddateAgreement').patchValue(res[0].enddateAgreement);
						this.conveniosForm.get('p_programvincID').patchValue(res[0].programvincID);
						this.conveniosForm.get('p_statusAgreement').patchValue(res[0].statusAgreement);
						this.conveniosForm.get('p_agreementConventionsID').patchValue(res[0].agreementConventionsID);
						this.businessForm.get('entidad').patchValue(res[0].typeBusiness);
						this.businessForm.get('representante').patchValue(res[0].legalRepresentative);
						this.businessForm.get('responsable').patchValue(res[0].responsibleName);
					}else{
						this.acuerdosForm.get('p_agreementsID').patchValue(res[0].agreementsID);
						this.acuerdosForm.get('p_codeNumber').patchValue(res[0].codeNumber);
						this.acuerdosForm.get('p_ruc').patchValue(res[0].ruc);
						this.acuerdosForm.get('p_urlFile').patchValue(res[0].urlFile);
						this.myControl.patchValue(res[0].ruc);
						this.acuerdosForm.get('p_initdateAgreement').patchValue(res[0].initdateAgreement);
						this.acuerdosForm.get('p_enddateAgreement').patchValue(res[0].enddateAgreement);
						this.acuerdosForm.get('p_position').patchValue(res[0].position);
						this.acuerdosForm.get('p_statusAgreement').patchValue(res[0].statusAgreement);
						this.acuerdosForm.get('p_careerID').patchValue(res[0].careerID);
						this.acuerdosForm.get('p_agreementConventionsID').patchValue(res[0].agreementConventionsID);
						this.businessForm.get('entidad').patchValue(res[0].typeBusiness);
						this.businessForm.get('representante').patchValue(res[0].legalRepresentative);
						this.businessForm.get('responsable').patchValue(res[0].responsibleName);
					}
					this.updatingItem= res[0];
					this.getConventionsObjetives(item);
				}
			},
			error: (err: HttpErrorResponse) => {
					this.loading = false;
			}
		});
	}

	public getConventionsObjetives(item: AgreementConvention): void {
		this.common.getConventionsObjetives(item.agreementConventionsID).subscribe({
			next: (res) => {
				//console.log('ConventionsObjetives', res);
				let arr= [];
				for(let i=0; i<res.length; i++){
					if(res[i].other) this.businessForm.get('other').patchValue(res[i].other);
					arr.push(res[i].objetivevincID);
				}
				this.businessForm.get('objetives').patchValue(arr);
				this.isUpdating= true;
				this.openModal.nativeElement.click();
			},
			error: (err: HttpErrorResponse) => {
					this.loading = false;
			}
		});
	}

	public onUpdate(id: number): void{
		if(id === 1){
			if(this.conveniosForm.valid && this.businessForm.valid){
				let body = JSON.parse(JSON.stringify(this.conveniosForm.value, [
					'p_agreementConventionsID',
					'p_agreementsID',
					'p_codeNumber',
					'p_ruc',
					'p_initdateAgreement',
					'p_enddateAgreement',
					'p_programvincID',
					'p_statusAgreement',
					'p_urlFile',
				]))
				this.common.putConventiosRegister(body).subscribe({
					next: (res) => {
						//console.log(res);
						this.putObjetives(this.conveniosForm.get('p_codeNumber').value);
					},
						error: (err: HttpErrorResponse) => {
						this.loading = false;
					}
				});
			}else{
				this.conveniosForm.markAllAsTouched();
				this.businessForm.markAllAsTouched();
				this.myControl.markAllAsTouched();
			}
		}else if(id === 2){
			if(this.acuerdosForm.valid && this.businessForm.valid){
				let body = JSON.parse(JSON.stringify(this.acuerdosForm.value, [
					'p_agreementConventionsID',
					'p_agreementsID',
					'p_codeNumber',
					'p_ruc',
					'p_initdateAgreement',
					'p_enddateAgreement',
					'p_position',
					'p_statusAgreement',
					'p_careerID',
					'p_urlFile',
				]))
				this.common.putAgreementRegister(body).subscribe({
						next: (res) => {
							//console.log(res);
							this.putObjetives(this.acuerdosForm.get('p_codeNumber').value);
					},
						error: (err: HttpErrorResponse) => {
								this.loading = false;
						}
				});
			}else{
				this.acuerdosForm.markAllAsTouched();
				this.businessForm.markAllAsTouched();
				this.myControl.markAllAsTouched();
			}
		}
	}

	public putObjetives(codeNumber: string): void {
		let body= [];
		let objetivesArr= this.businessForm.get('objetives').value;
		for(let i=0; i<objetivesArr.length; i++){
			let other= '';
			if(objetivesArr[i] === 4) other=this.businessForm.get('other').value;
			let obj={
				p_codeNumber: codeNumber,
				p_objetivevincID: objetivesArr[i],
				p_other: other,
				p_user: this.user.currentUser.userName
			}
			body.push(obj);
		}

		this.common.postAgreementsConventionsObjetives({'dynamics': body}).subscribe({
			next: (res) => {
				//console.log(res);
				this.getAgreementConventions();
				this.initForms();
				this.modalClose.nativeElement.click();
				this.common.message(`Registro exitoso`,'','success','#86bc57');
				this.file= null;
				this.updatingItem= null;
				this.isUpdating= false;
			},
				error: (err: HttpErrorResponse) => {
				this.loading = false;
			}
		});
	}

	public generateReport(item: AgreementConvention): void {
		this.admin.getAgreementConventionLetterFormat(item.agreementConventionsID).subscribe({
			next: (res) => {
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
			},
			error: (err: HttpErrorResponse) => {
				console.log('err',err);
			}
		});
	}

	public validateCode(code: string, form: number): void {
		this.common.getValidateCode(code).subscribe({
			next: (res: Code) => {
				if(res.existCodeNumber === 1){
					this.snackBar.open(
						`Código ya registrado`,
						null,
						{
							horizontalPosition: 'center',
							verticalPosition: 'top',
							duration: 4000,
							panelClass: ['red-snackbar']
						}
					);
					if(form === 1) this.conveniosForm.get('p_codeNumber').patchValue('');
					if(form === 2) this.acuerdosForm.get('p_codeNumber').patchValue('');
				}
			},
				error: (err: HttpErrorResponse) => {
					this.loading = false;
			}
		});
	}

	public onChangeInput(files: FileList, input: HTMLInputElement, id: number): void{
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
			this.file= files.item(0);
			if(id === 1) this.conveniosForm.get('p_urlFile').patchValue('file');
			else this.acuerdosForm.get('p_urlFile').patchValue('file');
		}
	}

	public validateFile(id: number): void {
		if(id === 1){
			if(this.conveniosForm.valid && this.businessForm.valid){
				if(this.isUpdating && !this.file) this.onUpdate(id);
				else this.postFile(id);
			}else{
				this.conveniosForm.markAllAsTouched();
				this.businessForm.markAllAsTouched();
			}
		}else{
			if(this.acuerdosForm.valid && this.businessForm.valid){
				if(this.isUpdating && !this.file) this.onUpdate(id);
				else this.postFile(id);
			}else{
				this.acuerdosForm.markAllAsTouched();
				this.businessForm.markAllAsTouched();
			}
		}
	}

	private postFile(id?: number): void {
		let agreementConventionsID: number;
		if(id === 1) agreementConventionsID= +this.conveniosForm.get('p_agreementConventionsID').value;
		else agreementConventionsID= +this.acuerdosForm.get('p_agreementConventionsID').value;
		let servicePath;
		let formData = new FormData();
		formData.append('file', this.file);
		if(!this.isUpdating) servicePath= this.common.postAgreementConventionsFile(formData);
		else servicePath= this.common.putAgreementConventionsFile(formData, agreementConventionsID);
		servicePath.subscribe({
			next: (res: any) => {
				//console.log('urlFile', res.urlFile);
				if(id === 1) this.conveniosForm.get('p_urlFile').patchValue(res.urlFile);
				else this.acuerdosForm.get('p_urlFile').patchValue(res.urlFile);
				if(!this.isUpdating) this.onSubmit(id);
				else this.onUpdate(id);
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err', err);
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

	public openFile(relativeRoute: string): void {
		if(relativeRoute.includes('http') || relativeRoute.includes('www')){
			window.open(relativeRoute, '_blank');
		}else{
			window.open(environment.pullZone + relativeRoute, '_blank');
		}
  }

}
