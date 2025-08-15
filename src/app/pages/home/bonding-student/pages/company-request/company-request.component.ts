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
import { InputSearchComponent } from '@components/input-shearch/input-search.component';
import { ButtonArrowComponent } from '@components/button-arrow/button-arrow.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { UserService } from '@services/user.service';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { ExternsRegister } from '@utils/interfaces/person.interfaces';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RrhhService } from '@services/rrhh.service';
import { ApprovalBusinessType, ApprovalRequest } from '@utils/interfaces/campus.interfaces';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';

const MAX_FILE_SIZE = 5000000;

@Component({
  selector: 'app-company-request',
	standalone: true,
	imports: [
		NgIf,
		NgForOf,
		ReactiveFormsModule,
		MatInputModule,
		MatButtonModule,
		MatFormFieldModule,
		MatSelectModule,
		InputSearchComponent,
		ButtonArrowComponent,
		MatTooltipModule,
		MatIconModule,
		MatNativeDateModule,
		MatPaginatorModule,
		MatMenuModule,
		MatSnackBarModule,
		MatDialogModule,
		SpinnerLoaderComponent
	],
  templateUrl: './company-request.component.html',
  styleUrls: ['./company-request.component.css']
})
export class CompanyRequestComponent extends OnDestroyMixin implements OnInit, OnDestroy{
	loading: boolean = false;
	loadingModal: boolean = false;
	public projectForm!: FormGroup;
	public agreementForm!: FormGroup;
	public filtersForm!: FormGroup;
	public searchForm!: FormGroup;
	public filesForm!: FormGroup;
	public pageIndex: number = 1;
  public pageSize: number = 10;
  public length: number = 0;
  public pageEvent!: PageEvent;
	public subjectsList: ApprovalRequest [] = [];
	public approvalBusinessType: ApprovalBusinessType[] = [];
  public pageSizeOptions: number[] = [5, 10, 25, 50, 100];

	@ViewChild('paginator', { static: true }) public paginator!: MatPaginator;
	@ViewChild('modalClose', { read: ElementRef }) public modalClose: ElementRef;

	private sanitizer: DomSanitizer = inject(DomSanitizer);

	constructor(private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private rrhh: RrhhService,
		private user: UserService,
		private router: Router,
		private snackBar: MatSnackBar,
		private dialog: MatDialog){
		super();
	}

	public ngOnInit(): void {
		this.initForms();
		this.initFiltersForm();
		this.getApprovalRequestBus();
		this.getApprovalBusinessType();
  }

  public override ngOnDestroy() {
    super.ngOnDestroy();
  }

	private sessionsRegister(): void {
		this.agreementForm= this.fb.group({
			p_ruc: ['', [Validators.required, Validators.minLength(13), Validators.maxLength(13)]],
			p_typeBusiness: ['', [Validators.required]],
			p_bussinesName: ['', [Validators.required]],
			p_personID: [''],
			p_studentID: sessionStorage.getItem('studentID') || 0,
			p_rucBusinessFile: ['', [Validators.required]],
			p_cedulaBusinessFile: ['', [Validators.required]],
			p_sheetBusineesFile: [''],
			p_signedFile: ['', [Validators.required]],
			p_appointmentFile: [''],
			p_user: [this.user.currentUser.userName],
		});
	}

	private initFiltersForm(): void {
		this.filesForm = this.fb.group({
			files: this.fb.array([
				this.fb.group({
					campoarchivo: 'rucBusinessFile',
					file: ''
				}),
				this.fb.group({
					campoarchivo: 'cedulaBusinessFile',
					file: ''
				}),
				this.fb.group({
					campoarchivo: 'sheetBusineesFile',
					file: ''
				}),
				this.fb.group({
					campoarchivo: 'signedFile',
					file: ''
				}),
				this.fb.group({
					campoarchivo: 'appointmentFile',
					file: ''
				}),
			])
		})
	}

	private initSearchForm(): void {
		this.searchForm= this.fb.group({
			search: [''],
		});
	}

	public onSubmit(): void{
		this.approvalRequest();
	}

	private initForms(): void{
		this.sessionsRegister();
		this.initSearchForm();
	}

	private approvalRequest(): void{
		this.loadingModal= true;
		if(this.agreementForm.valid){
			this.agreementForm.get('p_personID').patchValue(+sessionStorage.getItem('id'))
			let body = JSON.parse(JSON.stringify(this.agreementForm.value, [
				'p_ruc',
				'p_typeBusiness',
				'p_bussinesName',
				'p_personID',
				'p_studentID',
				'p_user',
			]));

			this.common.postRequestRegister(body).subscribe({
				next: (res: any) => {
					//console.log(res);
					if(res[0].approvalRequestBusID){
						this.postFileApprovalRequestBus(res[0].approvalRequestBusID);
					}else{
						this.loadingModal = false;
						this.snackBar.open(
							`${res[0].message}`,
							'',
							{
								horizontalPosition: 'center',
								verticalPosition: 'top',
								duration: 4000,
								panelClass: ['red-snackbar']
							}
						);
						this.modalClose.nativeElement.click();
						this.initForms();
					}
				},
				error: (err: HttpErrorResponse) => {
					this.loadingModal = false;
					this.snackBar.open(
						'Este proceso no se encuentra habilitado, comuníquese con el administrador.',
						'',
						{
							horizontalPosition: 'center',
							verticalPosition: 'top',
							duration: 4000,
							panelClass: ['red-snackbar']
						}
					);
					this.modalClose.nativeElement.click();
				}
			});
		}else{
			this.agreementForm.markAllAsTouched();
			this.snackBar.open(
				'Campos vacíos',
				'',
				{
					horizontalPosition: 'center',
					verticalPosition: 'top',
					duration: 4000,
					panelClass: ['red-snackbar']
				}
			);
			this.loadingModal = false;
		}
	}

	public postFileApprovalRequestBus(approvalRequestBusID: number): void {
		const studentID= +sessionStorage.getItem('studentID')! || 0;
		let files= this.filesForm.controls['files'] as FormArray;
		for(let i=0; i<files.length; i++){
			let campoArchivo= files.controls[i].get('campoarchivo').value;
			let file= files.controls[i].get('file').value as File;
			if(file) this.rrhh.postFileApprovalRequestBus(file, approvalRequestBusID, this.user.currentUser.PersonId, campoArchivo,
				this.user.currentUser.userName, studentID).subscribe({
				next: (res) => {
					//console.log(res);
					this.getApprovalRequestBus();
					setTimeout(() => {
						this.initForms();
						this.modalClose.nativeElement.click();
						this.common.message(`Registro Exitoso`,'','success','#86bc57');
						this.loading = false;
						this.loadingModal = false;
					}, 1000);
				},
					error: (err: HttpErrorResponse) => {
						this.loading = false;
				}
			});
		}
	}

	public onChangeInput(files: FileList, i: number, input: HTMLInputElement): void {
    let filesArray= this.filesForm.controls['files'] as FormArray;
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
      	filesArray.controls[i].get('file').patchValue(file);
			}
    }
  }

	public getApprovalRequestRucValidation(ruc: number): void {
		this.common.getApprovalRequestRucValidation(ruc).subscribe({
			next: (res) => {
				//console.log(res);
				this.snackBar.open(
          `Empresa ya registrada`,
          null,
          {
            horizontalPosition: 'center',
            verticalPosition: 'top',
            duration: 4000,
            panelClass: ['green-snackbar']
          }
        );
				this.modalClose.nativeElement.click();
			},
			error: (err: HttpErrorResponse) => {
			}
		})
	}

	public getApprovalRequestBus(): void{
		//this.loading = true;
		const studentID= +sessionStorage.getItem('studentID')! || 0;
		this.common.getApprovalRequestBus(this.pageIndex, this.pageSize, this.searchForm.get('search').value, this.user.currentUser.PersonId,
			'E', studentID).subscribe({
			next: (res) => {
				//console.log(res);
				this.loading = false;
				this.length = res.count;
				this.subjectsList= res.data;
			},
			error: (err: HttpErrorResponse) => {
				this.loading = false;
			}
		});
	}

	public getApprovalRequestPaginator(event: PageEvent): PageEvent {
		//console.log(event);
    this.pageIndex = event.pageIndex+1;
    this.pageSize = event.pageSize;
    this.getApprovalRequestBus();
    return event;
  }

	public getApprovalBusinessType(): void{
		this.loading = true;
		this.common.getApprovalBusinessType().subscribe({
			next: (res) => {
				this.approvalBusinessType= res;
				this.loading = false;
			},
			error: (err: HttpErrorResponse) => {
				this.loading = false;
			}
		});
	}

}
