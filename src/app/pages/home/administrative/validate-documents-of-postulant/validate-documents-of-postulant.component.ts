import { Component, OnInit, SecurityContext, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AdministrativeService } from '@services/administrative.service';
import { ApiService } from '@services/api.service';
import { CREATION_DATE, RECORD_NUMBERS } from 'app/constants';
import { MaterialComponentModule } from 'app/material-component/material-component.module';
import { DocumentDetailComponent } from './document-detail/document-detail.component';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import Swal from 'sweetalert2';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CommonService } from '@services/common.service';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
import { environment } from '@environments/environment';
import { HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-validate-documents-of-postulant',
  templateUrl: './validate-documents-of-postulant.component.html',
  styleUrls: ['./validate-documents-of-postulant.component.css'],
  imports: [
    CommonModule,
    MaterialComponentModule,
    FormsModule,
    ModalModule,
    DatePipe,
    NgClass,
    BsDropdownModule,
    TooltipModule,

  ],
  standalone: true
})
export class ValidateDocumentsOfPostulantComponent implements OnInit {

  constructor(
    private Api: ApiService,
    private Administrative: AdministrativeService,
    private FormBuilder: FormBuilder,
    private Common: CommonService
  ) {}

	private getPdfContentSubscription!: Subscription;
	private sanitizer: DomSanitizer = inject(DomSanitizer);
  private dialog: MatDialog = inject(MatDialog);


  /*
    ROLID => 7 =>  SECRETARIA GENERAL
  */

  @ViewChild('filterModal', {static: false}) filterModal: ModalDirective;

  reportTypes: any = [];

  allFileTypes: any = [];
  fileTypes: any = [];

  fileStatuses: any[] = [];
  periods: any[] = [];
  searched: boolean = false;
  searching: boolean = false;
  postulants: any[] = [];
  recordNumbers: any[] = RECORD_NUMBERS;

  filterForm: FormGroup = this.FormBuilder.group({
    admissionPeriodID: [],
    text: [],
    statusFileID: ['%'],
    careerID: []
  });

  paginatorForm: FormGroup = this.FormBuilder.group({
    currentPage: [1],
    recordNumber: [10],
    totalRecords: [0]
  });
  userLoged: any;
  report: any = {}
  body: any = {};
  personID: any;
  careers: any[] = [];
  creationDateITCA: any;
  currentDate: any;
  reportsExcluids: any[] = [];
  ngOnInit() {
    this.getReportTypes();
    this.getFileTypesByReportType();
    this.getReportsExcluidsOfFilters();
    this.userLoged = parseInt(sessionStorage.getItem('rolID'));
    this.personID = parseInt(sessionStorage.getItem('id'));
    this.creationDateITCA = CREATION_DATE;
    this.currentDate = moment().format('YYYY-MM-DD');
    if (this.userLoged === 9) {
      this.reportTypes.push({
        id: 'student-by-voucher-files',
        name: 'Comprobantes de Pago',
        filter: false,
      });
    }
    this.getStatusFiles();
    this.getAdmissionPeriods();
    this.getCareers();
  }

  async getReportsExcluidsOfFilters() {
    let result: any = await this.Administrative.getReportsExcluidsOfFilters().toPromise();
    this.reportsExcluids = result;
  }

  async getFileTypesByReportType() {
    let result: any = await this.Administrative.getFileTypeByReportTypeOfPostulant().toPromise();
    this.allFileTypes = result;
  }

  async getReportTypes() {
    let result: any = await this.Administrative.getReportTypesOfPostulant().toPromise();
    this.reportTypes = result;
  }

  async getCareers() {
    let result: any = await this.Administrative.getCareerAll().toPromise();
    this.careers = [...result.map((r: any) => r.careers).flat()];
  }

  async getStatusFiles() {
    let result: any = await this.Api.getFileStatuses().toPromise();
    //console.log(result);
    this.fileStatuses = result;
    this.fileStatuses.unshift({
      statusFileID: '%',
      statusFileDesc: '--TODOS--'
    });
  }

  async getAdmissionPeriods() {
    let body = {
      text: '%'
    };
    let result: any = await this.Administrative.getAdmissionPeriodByIDTextLevelID(body).toPromise();
    //console.log(result);
    this.periods = result;
  }

  async downloadResult() {
    //console.log("Descarga resultado");
  }

  async searchPostulants() {
    this.searching = true;
    this.searched = false;
    this.postulants = [];


    this.body = {
      filter: {
        admissionPeriodID: this.filterForm.controls['admissionPeriodID'].value || '%',
        text: this.filterForm.controls['text'].value || '%',
        statusFileID:  this.filterForm.controls['statusFileID'].value || '%',
        personID: this.personID,
        rolID: this.userLoged
      }
    };

    let resultQuantity: any = await this.Administrative.getPostulantByTextQuantity(this.body).toPromise();

    //console.log(resultQuantity);

    if (resultQuantity.quantity > 0) {
      this.paginatorForm.controls['totalRecords'].patchValue(resultQuantity.quantity);
      this.paginatorForm.controls['currentPage'].patchValue(1);
      this.getPostulants();

    } else {
      this.paginatorForm.controls['totalRecords'].patchValue(0);
      this.searching = false;
      this.searched = true;
      this.postulants = [];
    }
  }

  async getPostulants() {
    let pagination = this.paginatorForm.value;
    this.body.pagination = pagination;

    let result: any = await this.Administrative.getPostulantByText(this.body).toPromise();
    if (!result) {
      Swal.fire({
        text: 'Hubo un error en el filrado de postulantes',
        icon: 'error'
      });
      return;
    }
    this.searching = false;
    this.searched = true;
    this.postulants = result;


    console.log(this.postulants);

  }

  async goToPage(pageDestiny: number) {
    //console.log(pageDestiny);
    let pagination: any = this.paginatorForm.value;
    // this.
    this.paginatorForm.controls['currentPage'].patchValue(pageDestiny);
    this.paginatorForm.updateValueAndValidity();
    //console.log(pagination);
    this.getPostulants();
  }

  async resetSearch() {
    this.searched = false;
    this.postulants = [];
    if (this.filterForm.controls['admissionPeriodID'].value) {
      let periodSelected = this.periods.find((p: any) => p.admissionPeriodID === this.filterForm.controls['admissionPeriodID'].value);
      if (periodSelected) {
        this.report.periodName = periodSelected.admissionPeriodName;
      }
    }
  }

  async showDocumentsOfPostulant(postulant: any) {
    const config: MatDialogConfig = new MatDialogConfig();
    config.id = 'documentDetailID';
    config.autoFocus = false;
    config.minWidth = '70vw';
    config.maxWidth = '80vw';
    config.panelClass = 'transparent-panel';
    config.data = {
      postulant
    }
    const dialog = this.dialog.open(DocumentDetailComponent, config);
    dialog.afterClosed()
    .subscribe((res: boolean) => {
      if (res) {
        //console.log('cerrado');
        //console.log('cerrado');
      } else {
        this.searchPostulants();
        //console.log('aqui');
      }
    });
  }

  selectReportType(type: any) {
    this.report.typeName = type.name;
    this.report.type = type.id;
    this.report.filter = type.filter;
    this.filterFileTypes();
  }

  filterFileTypes() {
    this.report.fileTypeName = undefined;
    this.report.fileType = undefined;
    this.fileTypes = this.allFileTypes.filter((f: any) => f.reports.includes(this.report.type));
  }

  selectStatusFile(type: any) {
    this.report.statusFileDesc = type.statusFileDesc;
    this.report.statusFileID = type.statusFileID;
  }

  selectFileType(fileType: any) {
    this.report.fileTypeName = fileType.name;
    this.report.fileType = fileType.id;
  }

  toDataURL(url: any) {
    return fetch(url).then((response) => {
            return response.blob();
        }).then(blob => {
            return URL.createObjectURL(blob);
        });
}

  closeFilterModal() {
    this.filterModal.hide();
    this.report.generating = false;
    this.report.haveCareer = false;
    this.report.selectFilters = false;
  }

  generateReportWithCareer() {
    if (this.report.type === 'student-by-career') {
      this.report.haveCareer = true;
      this.report.haveDateRange = false;
    } else {
      this.report.haveDateRange = true;
    }
    this.report.selectFilters = true;
    this.generateReport();
  }

  generateMainReportFinancial() {
    this.report.type = 'main-financial';
    this.report.fileType = 'xlsx';
    // this.report.typeName = 'Reporte General de Postulantes';
    this.report.haveCareer = true;
    this.report.selectFilters = true;
    this.generateReport();
  }

  async generateReport() {
    //console.log(this.report);
    this.report.generating = true;
    if (!this.report.filter && !this.reportsExcluids.includes(this.report.type) && !this.report.selectFilters) {
      //console.log('AQUI');
      this.report.startDate = CREATION_DATE;
      this.report.endDate = moment().format('YYYY-MM-DD');
      this.filterModal.config.keyboard = false;
      this.filterModal.config.ignoreBackdropClick = true;
      this.filterModal.show();
    } else {
      let body: any = {
        reportType: this.report.type,
        fileType: this.report.fileType,
        careerID: this.report.careerID,
        haveCareer: this.report.haveCareer,
        statusFileID: this.report.statusFileID === 5 ? 3 : this.report.statusFileID,
        periodName: this.report.periodName,
        likeLegalizateds: this.report.statusFileID === 5,
        startDate: this.report.startDate,
        endDate: this.report.endDate,
        filter: {
          admissionPeriodID: this.filterForm.controls['admissionPeriodID'].value || '%',
          text: this.filterForm.controls['text'].value || '%',
          statusFileID: this.report.statusFileID || '%',
          personID: this.personID,
          rolID: this.userLoged
        }
      };
      //console.log(body);
      let fileInfo: any = await this.Administrative.getPostulantReport(body).toPromise();
      if (!fileInfo.existsData && !fileInfo.filePath) {
        Swal.fire({
          text: 'No existe datos para mostrar en el reporte',
          icon: 'warning'
        });
        this.report.generating = false;
        return;
      }
      //console.log(fileInfo);
      setTimeout(async () => {
        let file: any = await this.Common.getFileOfServer(fileInfo).toPromise();
        const blob = new Blob([file]);
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `archivo.${this.report.fileType}`;
        document.body.appendChild(a);
        a.click();
        this.report.generating = false;
        if (this.report.haveCareer) {
          this.closeFilterModal();
        }
      }, 1000);
    }
  }

	public generatePostulantReport(relativeRoute: string): void {
		let body;
		body= {
			admissionPeriodID: this.filterForm.get('admissionPeriodID').value | 0,
		};
		const route: string = `${environment.url}/${relativeRoute}`;
		if (this.getPdfContentSubscription) this.getPdfContentSubscription.unsubscribe();
		this.getPdfContentSubscription = this.Api.postPdfContent(route, body).subscribe((res: HttpResponse<Blob>) => {
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
