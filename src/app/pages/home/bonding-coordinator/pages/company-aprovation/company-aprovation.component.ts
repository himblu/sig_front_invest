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
import { MatNativeDateModule, MatOptionSelectionChange } from '@angular/material/core';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { UserService } from '@services/user.service';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { Agreement, ApprovalRequest, SPGetCareer } from '@utils/interfaces/campus.interfaces';
import { Period } from '@utils/interfaces/period.interfaces';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FilterEventsByStatePipe } from './Pipes/filter-events-by-state.pipe';
import { environment } from '@environments/environment';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { CompanyComponent } from '../../components/company/company.component';

@Component({
  selector: 'app-company-aprovation',
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
		MatDatepickerModule,
		FilterEventsByStatePipe,
		MatSnackBarModule,
		MatDialogModule,
		CompanyComponent
	],
  templateUrl: './company-aprovation.component.html',
  styleUrls: ['./company-aprovation.component.scss']
})
export class CompanyAprovationComponent extends OnDestroyMixin implements OnInit, OnDestroy{

	loading: boolean = false;
	public tableForm!: FormGroup;
	public pageIndex: number = 1;
  public pageSize: number = 10;
  public length: number = 0;
  public pageEvent!: PageEvent;
  public pageSizeOptions: number[] = [5, 10, 25, 50, 100];
	public filtersForm!: FormGroup;
	public approvalRequest: ApprovalRequest[] = [];
	public url= environment.url;

	@ViewChild('paginator', { static: true }) public paginator!: MatPaginator;
	@ViewChild('modalClose', { read: ElementRef }) public modalClose: ElementRef;

	private sanitizer: DomSanitizer = inject(DomSanitizer);

	constructor(private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private user: UserService,
		private router: Router,
		private snackBar: MatSnackBar,
		private dialog: MatDialog){
		super();
	}

	public ngOnInit(): void {
		this.initFiltersForm();
		this.initTableForm();
		this.getApprovalRequest();
  }

  public override ngOnDestroy() {
    super.ngOnDestroy();
  }

	private initFiltersForm(): void{
    this.filtersForm = this.fb.group({
      state: ['REVISION'],
      search: ['']
    });
  }

	public initTableForm(): void {
		this.tableForm = this.fb.group({
			news: this.fb.array([
			])
	});
	}

	public tableFormRow(): FormGroup {
		return this.fb.group({
			p_justification: ['', [Validators.required]],
			p_yesNot: ['', [Validators.required]],
			p_approvalRequestBusID: ['', [Validators.required]],
			p_ruc: ['', [Validators.required]],
			p_stateApproval: ['', [Validators.required]],
			index: '',
			p_user: this.user.currentUser.userName,
		});
	}

	public getTableFormRow(): FormArray {
    return (this.tableForm.controls['news'] as FormArray);
	}

	private addTableFormRow(): void {
		const array = this.getTableFormRow();
		array.push(this.tableFormRow());
}

public patchStateApproval(event: MatOptionSelectionChange, index: number, value: string): void {
	if(event.isUserInput) this.getTableFormRow().controls[index].get('p_stateApproval').patchValue(value);
}

	public getApprovalRequest(): void {
		this.common.getApprovalRequest(this.pageIndex, this.pageSize, this.filtersForm.get('search').value, this.filtersForm.get('state').value, this.user.currentUser.PersonId).subscribe({
			next: async (res) => {
				//console.log(res);
				this.length = res.count;
				for(let i=0; i<res.data.length; i++){
					this.addTableFormRow();
					this.getTableFormRow().controls[i].get('p_approvalRequestBusID').patchValue(res.data[i].approvalRequestBusID);
					this.getTableFormRow().controls[i].get('p_ruc').patchValue(res.data[i].ruc);
					this.getTableFormRow().controls[i].get('p_stateApproval').patchValue(res.data[i].stateApproval);
					this.getTableFormRow().controls[i].get('index').patchValue(i);
					res.data[i].index = i;
				}
				setTimeout(() => {
					this.approvalRequest = res.data;
				}, 50);
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	public getApprovalRequestPaginator(event: PageEvent): PageEvent {
		//console.log(event);
    this.pageIndex = event.pageIndex+1;
    this.pageSize = event.pageSize;
    this.getApprovalRequest();
    return event;
  }

	public updateApproval(item: ApprovalRequest, index: number): void {
		if(this.getTableFormRow().controls[index].valid){
			let body = JSON.parse(JSON.stringify(this.getTableFormRow().controls[index].value, [
				"p_approvalRequestBusID",
				"p_ruc",
				"p_yesNot",
				"p_justification",
				"p_stateApproval",
				"p_user",
			]))
			//console.log(body);
			this.admin.updateApproval(body).subscribe({
				next: (res: any) => {
					//console.log(res);
					this.common.message(`${res.message}`,'','success','#86bc57');
					this.initTableForm();
					this.getApprovalRequest();
				},
				error: (err: HttpErrorResponse) => {
				}
			});
		}else{
			this.getTableFormRow().controls[index].markAllAsTouched();
		}
	}

	public getApprovalRequestFileView(item: ApprovalRequest, url: string): void {
		let fileUrl= url.replace('upload/files/itca/docs/investigacion/', '');
		this.common.getApprovalRequestFileView(item.approvalRequestBusID, item.personId, fileUrl).subscribe({
			next: (res) => {
				const blob: Blob = new Blob([res.body], { type: 'application/pdf' });
        const url = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob)));
        if (url) {
          window.open(url, '_blank');
        }
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	public getBusinessByRuc(item: ApprovalRequest): void {
		this.admin.getBusinessByRuc(item.ruc).subscribe({
			next: (res: Agreement[]) => {
				//console.log('Business', res);
				if(res[0].economicSector){
					this.snackBar.open(
						`Empresa ya registrada`,
						null,
						{
							horizontalPosition: 'center',
							verticalPosition: 'top',
							duration: 4000,
							panelClass: ['red-snackbar']
						}
					);
				}else{
					this.postOrPutAgreement(item);
				}
			},
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	public postOrPutAgreement(item: ApprovalRequest): void {
		let updating= true;
		const config: MatDialogConfig = new MatDialogConfig();
		this.dialog.closeAll();
		config.id = 'companyComponent';
		config.autoFocus = false;
		config.width = '70vw';
		config.minWidth = '400px';
		config.maxWidth = '800px';
		config.panelClass = 'transparent-panel';
		config.data = { updating, item };
		const dialog = this.dialog.open(CompanyComponent, config);
		dialog.afterClosed().pipe(untilComponentDestroyed(this)).subscribe((res) => {
			if (res) {
				this.common.message(`Registro exitoso`, '', 'success', '#86bc57');
				this.getApprovalRequest();
			}
		});
	}

}
