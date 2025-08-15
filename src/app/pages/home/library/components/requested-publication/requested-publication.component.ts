import { Component, inject, ViewChild } from '@angular/core';
import { REQUESTED_PUBLICATION_STATUS, RequestedPublicationByApplicant } from '@utils/interfaces/library.interface';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FormGroup } from '@angular/forms';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { ApiService } from '@services/api.service';
import { PaginatedResource } from '@utils/interfaces/person.interfaces';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { MatRippleModule } from '@angular/material/core';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { DatePipe, NgClass, NgIf } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationComponent } from '../../../academic-management/components/confirmation/confirmation.component';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import {MatTooltipModule} from '@angular/material/tooltip';

const DISPLAYED_COLUMNS: string[] = ['deweyCodeInternal', 'title', 'edition', 'codeISBN', 'dateRequest', 'dateDelivery', 'statusDesc', 'actions'];

@Component({
  selector: 'app-requested-publication',
  standalone: true,
	imports: [
		MatTableModule,
		MatRippleModule,
		MatPaginatorModule,
		MatSortModule,
		SpinnerLoaderComponent,
		NgIf,
		MatMenuModule,
		MatIconModule,
		NgClass,
		MatButtonModule,
		MatDialogModule,
		DatePipe,
		CdkOverlayOrigin,
		CdkConnectedOverlay,
		MatTooltipModule
	],
  templateUrl: './requested-publication.component.html',
  styleUrls: ['./requested-publication.component.css']
})

export class RequestedPublicationComponent {
	public form!: FormGroup;
	public requestedPublications: Array<RequestedPublicationByApplicant> = [];
	public isLoadingRequestedPublications: boolean = true;
	public dataSource!: MatTableDataSource<RequestedPublicationByApplicant>;
	public pageIndex: number = 0;
	public pageSize: number = 10;
	public filters: string = '';
	public length: number = 0;
	public pageEvent!: PageEvent;
	public displayedColumns: string[] = DISPLAYED_COLUMNS;
	public pageSizeOptions: number[] = [ 10, 25, 50, 100];
	public rolIDSession:string;
	public studentIDSession:string;
	public personIDSession:string;

	@ViewChild(MatSort, { static: true }) public sort!: MatSort;
	@ViewChild('paginator', { static: true }) public paginator!: MatPaginator;

	private getRequestedPublicationsSubscription: Subscription;
	private updatePublicationSubscription: Subscription;
	private api: ApiService = inject(ApiService);
	private dialog: MatDialog = inject(MatDialog);

	constructor() {
		this.rolIDSession = sessionStorage.getItem('rolID');
		this.studentIDSession = sessionStorage.getItem('studentID');
		this.personIDSession = sessionStorage.getItem('personID');
		this.getRequestedPublications();
	}

	async getRequestedPublications(event?: Sort){
		this.isLoadingRequestedPublications = true;
		this.buildEncodedFilters();
		let flg:number=0;
		let studentpersonID:number;
		if(this.rolIDSession === '5'){
			flg=1;
			studentpersonID=parseInt(this.studentIDSession)
		}else{
			studentpersonID=parseInt(this.personIDSession)
		}
		
		this.api.getRequestPublicationByStudentPersonID(flg, studentpersonID, this.pageIndex + 1, this.pageSize).subscribe({
			next: (res) => {
			  this.requestedPublications = res.data;
			  this.length = res.count;
			  this.dataSource = new MatTableDataSource<RequestedPublicationByApplicant>(this.requestedPublications);
			  this.isLoadingRequestedPublications = false;
			},
			error: (err: HttpErrorResponse) => {
			  console.log('Error', err);
			  this.isLoadingRequestedPublications = false; // Asegura que el estado de carga se actualice incluso en caso de error
			},
		  });
	}

	private buildEncodedFilters(): void {
		// this.filters = '{';
		// const filtersValue: FiltersForm = this.filtersFormValue;
		// const filtersValue: FiltersForm = this.filtersFormValue;
		// if (filtersValue.period) this.filters = this.filters.concat(`periodID:and:eq:${filtersValue.period};`);
		// if (filtersValue.status) {
		// 	this.filters = this.filters.concat(`statusFileID:and:eq:${filtersValue.status};`);
		// } else {
		// 	// Sólo mostrar los estados PENDIENTE, RECHAZADO, APROBADO
		// 	this.filters = this.filters.concat(`statusFileID:and:in:2,3,4;`);
		// }
		// if (filtersValue.search) {
		// 	this.filters = this.filters.concat(`student:or:like:${filtersValue.search};`);
		// 	this.filters = this.filters.concat(`documentNumber:or:like:${filtersValue.search};`);
		// }
		// this.filters = this.filters === '{' ? '' : this.filters.slice(0, -1).concat('}');
		// this.filters = encodeURIComponent(this.filters);
	}

	public getPublicationsPaginator(event: PageEvent): PageEvent {
		this.pageIndex = event.pageIndex;
		this.pageSize = event.pageSize;
		this.getRequestedPublications();
		return event;
	}

	public cancelPublication(requestedPublication: RequestedPublicationByApplicant): void {
		const config: MatDialogConfig = new MatDialogConfig();
		config.autoFocus = false;
		config.minWidth = '200px';
		config.maxWidth = '600px';
		config.panelClass = 'transparent-panel';
		config.data = {
			message: '¿Estás seguro de cancelar este documento?'
		};
		const dialog = this.dialog.open(ConfirmationComponent, config);
		dialog.afterClosed()
			.subscribe((res) => {
				if (res) {
					if (this.updatePublicationSubscription) this.updatePublicationSubscription.unsubscribe();
					this.updatePublicationSubscription = this.api.updateRequestedPublicationDetail(
						requestedPublication.loanPublicationID,
						REQUESTED_PUBLICATION_STATUS.CANCELED_BY_APPLICANT,
						''
					).subscribe({
						next: () => {
							this.getRequestedPublications();
						}
					});
				}
			});
	}

	protected readonly REQUESTED_PUBLICATION_STATUS = REQUESTED_PUBLICATION_STATUS;
}
