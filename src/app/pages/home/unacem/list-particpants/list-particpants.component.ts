import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { onlyNumbers } from 'app/constants';
import { PipesModule } from 'app/pipes/pipes.module';
import * as moment from 'moment';
import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-academic-offer',
  templateUrl: './list-particpants.component.html',
  styleUrls: ['./list-particpants.component.css'],
  standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		PipesModule,
		ModalModule
	],
  providers: []
})
export class ListParticpantsComponent implements OnInit  {

	constructor(
		private Administrative: AdministrativeService,
		private Common: CommonService
	) {

	}

	@ViewChild('entityModal', {static: false}) entityModal: ModalDirective;

	filter: any = {
		fileType: 'xlsx',
		statusGradeID: 0,
		reportTypeID: 1
	};

	reportTypes: any = [
		{
			id: 1,
			name: 'CONSULTA GENERAL'
		},
		{
			id: 2,
			name: 'REPORTE POR CEDULA'
		},
		{
			id: 3,
			name: 'REPORTE POR CONTRATISTA'
		},
		{
			id: 4,
			name: 'REPORTE GENERAL'
		},
	];
	contractors: any[] = [];
	collaborators: any[] = [];
	linkDownload: string;
	results: any[] = [];
	searched: boolean = false;
	periods: any[] = [];
	currentYear: number = 0;
	fields: any[] = [];
	totals: any[] = [];

	statusGrades: any = [
		{statusGradeID: 0, statusGrade: 'Todos', dontShow: true},
		{statusGradeID: 1, statusGrade: 'Aprobados', bg: 'bg-primary-color'},
		{statusGradeID: 2, statusGrade: 'Reprobados', bg: 'bg-danger'},
		{statusGradeID: 3, statusGrade: 'Caducados', bg: 'bg-warning'},
		{statusGradeID: 4, statusGrade: 'En Curso', bg: 'bg-info'},
	];

	totalSelected: any = {};

	personID: number = 0;
	userID: number = 0;
	rolID: number = 0;
	entities: any[] = [];
	entitySelected: any = {};
	allowed: boolean = true;

	onlyNumbers(e: any) {
		onlyNumbers(e);
	}

	ngOnInit(): void {
		this.personID = +sessionStorage.getItem('personID');
		this.userID = +sessionStorage.getItem('userId');
		this.rolID = +sessionStorage.getItem('rolID');
		this.currentYear = moment().year();
		this.getContractors();
	}

	async getContractors() {
		let result: any = await this.Administrative.getContractor({}).toPromise();
		this.contractors = result;
		this.getPersonInfo();
	}

	async getPersonInfo() {
		let result: any = await this.Administrative.getContractorResponsibleMainByUserID(this.userID).toPromise();
		this.entities = result;
		if (this.rolID === 22) {
			this.allowed = true;
		} else {
			if (!this.entities.length && this.rolID === 24) {
				this.allowed = false;
			} else {
				if (this.entities.length === 1) {
					this.entitySelected = this.entities[0];
					this.filter.isMain = true;
					this.filter.contractorID = this.entitySelected.contractorID;
					this.selectContractor();
				} else {
					this.toggleEntityModal();
				}
			}
		}
	}

	toggleEntityModal() {
		if (this.entityModal.isShown) {
			this.entityModal.hide();
		} else {
			this.entityModal.config.keyboard = true;
			this.entityModal.config.ignoreBackdropClick = true;
			this.entityModal.show();
		}
	}

	toggleSelectEntity(e: any) {
		this.entities.map((r: any) => {
			r.isSelected = false;
		});
		e.isSelected = !e.isSelected;
		this.validateEntitySelected();
	}

	validateEntitySelected() {
		this.entitySelected = this.entities.find((e: any) => e.isSelected);
		this.filter.isMain = true;
		this.filter.contractorID = this.entitySelected.contractorID;
		this.selectContractor();
	}

	resetResult() {
		this.results = [];
		this.searched = false;
		this.linkDownload = undefined;
	}

	async selectContractor() {
		if (this.filter.contractorID) {
			let result: any = await this.Administrative.getContractorCollaboratorByContractorID(this.filter.contractorID).toPromise();
			this.collaborators = result;
		}
	}

	async search() {
		// let result: any =
		if (this.filter.reportTypeID === 1) {
			this.filter.lastName = '';
			this.filter.collaboratorDocumentNumber = this.filter.collaboratorDocumentNumber || '';
			this.filter.startDate = this.filter.startDate || '';
			this.filter.endDate = this.filter.endDate || '';
			let resultFilePath: any = await this.Administrative.getContractorGradesReport(this.filter).toPromise();
			if (!resultFilePath.filePath || !resultFilePath.data.length) {
				Swal.fire({
					text: 'No se tiene datos que mostrar',
					icon: 'error'
				});
				return;
			}
			let fieldsToShow: any = await this.Administrative.getFieldsByReportTypeID(this.filter.reportTypeID).toPromise();
			this.fields = fieldsToShow;
			this.linkDownload = resultFilePath.filePath;
			this.results = resultFilePath.data;
			this.results.map((r: any) => {
				let statusGradeSelected = this.statusGrades.find((s: any) => s.statusGrade.toLowerCase().includes(r.statusGrade.toLowerCase()));
				if (statusGradeSelected) {
					r.statusGradeID = statusGradeSelected.statusGradeID;
					r.bg = statusGradeSelected.bg;
				}
			})
			this.getTotals();
			this.searched = true;
		} else {
			let resultFilePath: any = await this.Administrative.getUnacemReport({filter: this.filter}).toPromise();
			if (!resultFilePath.data) {
				Swal.fire({
					text: 'No existe data que mostrar',
					icon: 'warning'
				});
				return;
			}
			this.results = resultFilePath.data;
			this.searched = true;
			this.linkDownload = resultFilePath.filePath;
		}
	}

	getTotals() {
		// TOTAL APROBADOS
		this.totals = [];
		this.statusGrades.filter((s: any) => !s.dontShow).map((s: any) => {
			this.totals.push({
				statusGradeID: s.statusGradeID,
				title: `T. ${s.statusGrade}`.toUpperCase(),
				value: this.results.filter((r: any) => r.statusGradeID === s.statusGradeID).length,
				bg: s.bg,
			});
		});
	}

	toggleTotalSelected(total: any) {
		if (this.totalSelected && this.totalSelected.statusGradeID === total.statusGradeID) {
			this.totalSelected = {};
		} else {
			this.totalSelected = total;
		}
	}

	async downloadReport() {
		let file: any = await this.Common.getFileOfServer({filePath: this.linkDownload}).toPromise();
		const blob = new Blob([file]);
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = `archivo.${this.filter.fileType}`;
		document.body.appendChild(a);
		a.click();
	}

	async credentialReport() {
		let body: any = {
			periodID: this.filter.periodSection
		};
		let result: any = await this.Administrative.reportScheduleUnacemCredentials(body).toPromise();
		console.log(result);
		if (!result.filePath || !result.data.length) {
			Swal.fire({
				text: 'No se tiene datos que mostrar',
				icon: 'warning'
			});
			return;
		}
		let file: any = await this.Common.getFileOfServer({filePath: result.filePath}).toPromise();
		const blob = new Blob([file]);
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = `report-de-credenciales.xlsx`;
		document.body.appendChild(a);
		a.click();
	}

}
