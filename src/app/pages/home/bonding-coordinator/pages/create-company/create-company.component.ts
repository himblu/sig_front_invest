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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Agreement, AgreementCareers, SPGetCareer } from '@utils/interfaces/campus.interfaces';
import { Period } from '@utils/interfaces/period.interfaces';
import { Business } from '../../../../../utils/interfaces/person.interfaces';
import { DatePipe } from '@angular/common';
import { CompanyComponent } from '../../components/company/company.component';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-create-company',
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
		DatePipe,
		CompanyComponent,
		MatDialogModule
	],
	providers: [DatePipe],
  templateUrl: './create-company.component.html',
  styleUrls: ['./create-company.component.scss']
})
export class CreateCompanyComponent extends OnDestroyMixin implements OnInit, OnDestroy{
	loading: boolean = false;
	public filtersForm!: FormGroup;
	public pageIndex: number = 1;
  public pageSize: number = 10;
  public length: number = 0;
  public pageEvent!: PageEvent;
  public pageSizeOptions: number[] = [5, 10, 25, 50, 100];
	public business: Agreement[] = [];
	public isUpdating: boolean = false;

	@ViewChild('paginator', { static: true }) public paginator!: MatPaginator;

	private sanitizer: DomSanitizer = inject(DomSanitizer);

	constructor(private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService,
		private user: UserService,
		private router: Router,
		private datePipe: DatePipe,
		private dialog: MatDialog){
		super();
	}

	public ngOnInit(): void {
		this.initFiltersForm();
		this.getAllBusiness();
  }

  public override ngOnDestroy() {
    super.ngOnDestroy();
  }

	public initFiltersForm(): void {
		this.filtersForm= this.fb.group({
			search: '',
		})
	}

	public getAllBusiness(): void {
		this.admin.getAllBusiness(this.pageIndex, this.pageSize, this.filtersForm.get('search').value).subscribe({
      next: (res) => {
				console.log('business', res.data);
				this.business= res.data;
				this.length = res.count;
      },
			error: (err: HttpErrorResponse) => {
			}
		});
	}

	public getBusinessPaginator(event: PageEvent): PageEvent {
		//console.log(event);
    this.pageIndex = event.pageIndex+1;
    this.pageSize = event.pageSize;
    this.getAllBusiness();
    return event;
  }

	public postOrPutAgreement(state: boolean, item?: Agreement): void {
		let updating= state;
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
				this.getAllBusiness();
				this.common.message(`Registro exitoso`, '', 'success', '#86bc57');
			}
		});
	}

	public getProfileBusinessPdfContent(item: Agreement): void{
		this.admin.getProfileBusinessPdfContent(item.ruc).subscribe({
			next: (res) => {
				//console.log(res);
				const blob: Blob = new Blob([res.body], { type: 'application/pdf' });
        const url = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob)));
        if (url) {
          window.open(url, '_blank');
        }
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
			}
		});
	}

}
