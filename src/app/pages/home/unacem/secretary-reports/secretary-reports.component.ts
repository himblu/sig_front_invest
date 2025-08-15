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
import { MatNativeDateModule, MatOptionSelectionChange } from '@angular/material/core';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DatePipe } from '@angular/common';
import { Collaborator, Contractor, UnacemCourse, UnacemStudentReport } from '@utils/interfaces/others.interfaces';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { environment } from '@environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { GenerateQRComponent } from '../components/generate-qr/generate-qr.component';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { ROL } from '@utils/interfaces/login.interfaces';

@Component({
  selector: 'app-secretary-reports',
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
		MatDatepickerModule,
		//DatePipe,
		FormsModule,
		MatDialogModule
	],
	providers: [
		DatePipe
	],
  templateUrl: './secretary-reports.component.html',
  styleUrls: ['./secretary-reports.component.css']
})

export class SecretaryReportsComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	protected readonly ROL = ROL;
	public isLoading: boolean= false;
	public currentRol= sessionStorage.getItem('rol');
	public filtersForm!: FormGroup;
	public pageIndex: number = 1;
  public pageSize: number = 10;
  public length: number = 0;
  public pageEvent!: PageEvent;
  public pageSizeOptions: number[] = [5, 10, 25, 50, 100];
	public contractors: Contractor[] = [];
	public collaborators: Collaborator[] = [];
	public reportList: UnacemStudentReport[] = [];
	public courses: UnacemCourse[] = [];

	private getPdfContentSubscription!: Subscription;
	private sanitizer: DomSanitizer = inject(DomSanitizer);
	private dialog: MatDialog = inject(MatDialog);

	constructor(
		private fb: FormBuilder,
		private admin: AdministrativeService,
		private api: ApiService,
		private date: DatePipe,
	){
		super();
		this.initFiltersForm();
	}

	public ngOnInit(): void {
		this.getContractor();
		this.getUnacemStudentsReport();
		this.getUnacemCourseByContractor();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	private initFiltersForm(): void{
		this.filtersForm = this.fb.group({
			contractorID: [0],
			courseID: [0],
			personID: [0],
			startDate: [''],
			endDate: [''],
			page: [1],
			limit: [10],
			filter: '',
			isShowing: true,
		});
		const searchInput: FormControl = this.filtersForm.get('filter') as FormControl;
		if (searchInput) {
			searchInput.valueChanges.pipe(
				debounceTime(300),
				distinctUntilChanged(),
				untilComponentDestroyed(this)
			).subscribe({
				next: (value ) => {
					if(!this.filtersForm.get('filter')?.value) this.makeRequired();
					else{
						let filters= this.filtersForm;
						filters.get('contractorID').patchValue(0);
						filters.get('contractorID').disable();
						filters.get('courseID').patchValue(0);
						filters.get('courseID').disable();
						filters.get('personID').patchValue(0);
						filters.get('personID').disable();
						filters.get('startDate').patchValue('');
						filters.get('startDate').disable();
						filters.get('endDate').patchValue('');
						filters.get('endDate').disable();
						filters.updateValueAndValidity();
					}
					this.getUnacemStudentsReport();
				}
			});
		};
	}

	public makeRequired(): void {
		let filters= this.filtersForm;
		//filters.get('contractorID').addValidators(Validators.required);
		filters.get('contractorID').enable();
		//filters.get('courseID').addValidators(Validators.required);
		filters.get('courseID').enable();
		//filters.get('personID').addValidators(Validators.required);
		filters.get('personID').enable();
		filters.get('startDate').enable();
		filters.get('endDate').enable();
		filters.updateValueAndValidity();
	}

	public getContractor(): void{
		this.isLoading= true;
		this.admin.getContractor({}).subscribe({
			next: (res) => {
				//console.log('contractors', res)
				this.contractors= res;
				this.isLoading= false;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.isLoading= false;
			}
		});
	}

	public getContractorCollaborator(contractorID: number): void{
		this.admin.getContractorCollaboratorByContractorID(contractorID).subscribe({
			next: (res) => {
				//console.log('collaborators', res)
				this.collaborators= res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

	public getUnacemCourseByContractor(): void {
		this.admin.getUnacemCourseByContractor(this.filtersForm.get('contractorID').value, this.filtersForm.get('personID').value).subscribe({
			next: (res) => {
				//console.log('courses', res)
				this.courses= res;
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		})
	}

	public getUnacemStudentsReport(loading: boolean= true): void {
		this.filtersForm.get('page').patchValue(this.pageIndex);
		this.filtersForm.get('limit').patchValue(this.pageSize);
		if(this.filtersForm.valid){
			this.isLoading= loading;
			this.admin.getUnacemStudentsReport(this.filtersForm.getRawValue()).subscribe({
				next: (res) => {
					//console.log('report', res.data);
					this.reportList= res.data;
					this.length= res.count;
					this.isLoading= false;
					if(!this.filtersForm.get('filter')?.value) this.makeRequired();
				},
				error: (err: HttpErrorResponse) => {
					//console.log('err',err);
					this.isLoading= false;
				}
			});
		}else this.filtersForm.markAllAsTouched();
	}

	public getPaginator(event: PageEvent): PageEvent {
    this.pageIndex = event.pageIndex+1;
    this.pageSize = event.pageSize;
		this.getUnacemStudentsReport(false);
    return event;
  }

	public openFile(relativeRoute: string, isQR?: boolean): void {
		const filters= this.filtersForm.value;
		let status;
		if(filters.isShowing) status= 1;
		else status= 0;
		let body;
		if(!isQR) body= {
			"contractorID": filters.contractorID,
			"courseID": filters.courseID,
			"personID": filters.personID,
			"filter": filters.filter,
			"startDate": filters.startDate,
			"endDate": filters.endDate,
			"status": status
		};
		else body= {
			"periodSection": 0,
			"contractorID": filters.contractorID,
			"statusGradeID": 0,
			"startDate": filters.startDate || null,
			"endDate": filters.endDate || null,
			"fileType": 'pdf'
		}
		const route: string = `${environment.url}/${relativeRoute}`;
		if (this.getPdfContentSubscription) this.getPdfContentSubscription.unsubscribe();
		this.getPdfContentSubscription = this.api.postPdfContent(route, body).subscribe((res: HttpResponse<Blob>) => {
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

	public getQr(personID: number): void {
		this.admin.postQRByPersonID(personID).subscribe({
			next: (res) => {
				//console.log('qr', res.qrCode)
				if (res?.qrCode) this.openDialog(res.qrCode, personID);
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		})
	}

	public openDialog(qrCode: string, personID: number): void {
		const config: MatDialogConfig = new MatDialogConfig();
		config.id = 'GenerateQRComponent';
		config.autoFocus = false;
		config.minWidth = '30vw';
		config.maxWidth = '30vw';
		config.panelClass = 'transparent-panel';
		config.data = { qrCode, personID };
		config.disableClose = false;
		const dialog = this.dialog.open(GenerateQRComponent, config);
		dialog.afterClosed()
		.pipe(untilComponentDestroyed(this))
		.subscribe((res) => {	});
	}

}
