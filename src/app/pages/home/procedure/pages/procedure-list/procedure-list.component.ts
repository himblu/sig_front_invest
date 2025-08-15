import { Component, ViewChild, ElementRef, OnInit, OnDestroy, inject, SecurityContext } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { NgClass, NgFor, NgForOf, NgIf, NgStyle } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { ProcedureDetailComponent } from '../../components/procedure-detail/procedure-detail.component';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { DocumentManagement, TypeManagement } from '@utils/interfaces/others.interfaces';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { environment } from '@environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-procedure-list',
  standalone: true,
  templateUrl: './procedure-list.component.html',
  styleUrls: ['./procedure-list.component.css'],
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
		//ProcedureDetailComponent,
		MatDialogModule,
		MatPaginatorModule,
		NgClass,
		NgStyle,
		MatSnackBarModule
	]
})

export class ProcedureListComponent extends OnDestroyMixin implements OnInit, OnDestroy {

 	public isLoading: boolean = false;
	public filtersForm!: FormGroup;
	public typesManagement: TypeManagement[] = [];
	public pageIndex: number = 1;
  public pageSize: number = 10;
	public length: number = 0;
	public pageEvent!: PageEvent;
  public pageSizeOptions: number[] = [5, 10, 25, 50, 100];
	public documentsManagement: DocumentManagement[] = [];

	private dialog: MatDialog = inject(MatDialog);
	private sanitizer: DomSanitizer = inject(DomSanitizer);
	private snackBar: MatSnackBar = inject(MatSnackBar);

	constructor(private fb: FormBuilder,
		private common:CommonService,
		private admin: AdministrativeService,
		private api: ApiService ){
		super();
		this.initForm();
	}

	ngOnInit(): void {
		this.getTypeManagement();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	public initForm(): void {
		this.filtersForm = this.fb.group({
			search: '',
			typeManagementID: [0, Validators.required]
		});
	}

	public openDialog(item?: DocumentManagement): void {
		const config: MatDialogConfig = new MatDialogConfig();
		config.id = 'procedureDetailDialog';
		config.autoFocus = false;
		config.minWidth = '55vw';
		config.maxWidth = '65vw';
		config.panelClass = 'transparent-panel';
		config.data = { item };
		config.disableClose = false;
		const dialog = this.dialog.open(ProcedureDetailComponent, config);
		dialog.afterClosed()
		.pipe(untilComponentDestroyed(this))
		.subscribe((res) => {
			if (res) {
				if(this.filtersForm.get('typeManagementID').value !== '') this.getDocumentManagement();
				this.common.message(`Registro exitoso`,'','success','#86bc57');
			}
		});
	}

	public getTypeManagement():void {
		this.isLoading= true;
		this.admin.getTypeManagement().subscribe({
      next: (res: TypeManagement[]) => {
				//console.log('TypeManagement', res);
				this.typesManagement= res;
				this.isLoading= false;
      },
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.isLoading= false;
			}
    });
	}

	public getDocumentManagement():void {
		//this.isLoading= true;
		let filters= this.filtersForm.value;
		let body= {
			"typeManagementID": filters.typeManagementID,
			"filter": filters.search,
			"page": this.pageIndex,
			"size": this.pageSize
		}
		this.admin.getDocumentManagementByFilterAndPagination(body).subscribe({
      next: (res) => {
				this.documentsManagement= res.data;
				this.length = res.count;
				this.isLoading= false;
      },
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.isLoading= false;
			}
    });
	}

	public changePage(event: PageEvent): PageEvent {
		this.pageIndex = event.pageIndex+1;
    this.pageSize = event.pageSize;
		this.getDocumentManagement();
    return event;
	}

	public openFile(relativeRoute: string, typeManagementID?: number): void {
    let route: string = `${environment.url}/${relativeRoute}`;
		if(typeManagementID && typeManagementID !== 0) route= route.concat('?typeManagementID='+typeManagementID);
    this.api.getPdfContent(route).subscribe((res: HttpResponse<Blob>) => {
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

	public updateStatus(item: DocumentManagement): void {
		this.isLoading= true;
		if(!item.statusID) item.statusID= 1;
		else item.statusID= 0;
		let body= {
			settingDocumentManagementID: item.settingDocumentManagementID,
			statusID: item.statusID,
		};
		this.admin.putSettingDocumentManagement(body).subscribe({
			next: (res: any) => {
				this.snackBar.open(
					`${res.message}`,
					null,
					{
						horizontalPosition: 'center',
						verticalPosition: 'top',
						duration: 4000,
						panelClass: ['green-snackbar']
					}
				);
				this.isLoading= false;
				this.getDocumentManagement();
			},
			error: (err: HttpErrorResponse) => {
				//console.log('err',err);
				this.isLoading= false;
			}
		});
	}

}
