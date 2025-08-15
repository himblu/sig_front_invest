import {CommonModule} from '@angular/common';
import {Component, inject, OnInit, SecurityContext, ViewChild} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatTooltipModule} from '@angular/material/tooltip';
import {AdministrativeService} from '@services/administrative.service';
import {PipesModule} from 'app/pipes/pipes.module';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {ModalDirective, ModalModule} from 'ngx-bootstrap/modal';
import {MatTableModule} from '@angular/material/table';
import {environment} from '@environments/environment';
import {HttpResponse} from '@angular/common/http';
import {Subscription} from 'rxjs';
import {DomSanitizer} from '@angular/platform-browser';
import {ApiService} from '@services/api.service';
import {CourseSchedule} from '@utils/interfaces/schedule.interface';

@Component({
	selector: 'app-academic-info-course',
	templateUrl: './academic-info-course.component.html',
	styleUrls: ['./academic-info-course.component.css'],
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		MatTooltipModule,
		PipesModule,
		MatButtonModule,
		MatFormFieldModule,
		MatInputModule,
		ModalModule,
		ReactiveFormsModule,
		MatTableModule
	]
})

export class AcademicInfoCourseComponent implements OnInit {
	@ViewChild('usersModal', {static: false}) usersModal: ModalDirective;
	// Definir las columnas que se mostrarán en la tabla
	displayedColumns: string[] = ['horario', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
	week = 0;
	// Datos del horario
	dataSource: any = [];
	schedule:CourseSchedule;

	private getPdfContentSubscription!: Subscription;
	private sanitizer: DomSanitizer = inject(DomSanitizer);

	constructor(
		private Administrative: AdministrativeService,
		private api: ApiService
	) {
		/* console.log('data',this.dataSource)
		console.log('data',this.dataSource[0])
		console.log('data',this.dataSource[0].days) */

	}

	allHistory: any = [];
	history: any = [];
	contractors: any[] = [];
	person: any = {};
	personID: number;
	userID: number;
	filter: any = {};
	searched: boolean = false;

	ngOnInit(): void {
		this.personID = +sessionStorage.getItem('personID');
		this.userID = +sessionStorage.getItem('userId');
		this.getPersonInfo();
		this.getContractorInfo();
		this.getHistoryCourseOfPersonID();
	}

	async getContractorInfo() {
		let result: any = await this.Administrative.getContractorInfoByUserID(this.userID).toPromise();
		this.contractors = result;
		//console.log(this.contractors);
	}

	async getPersonInfo() {
		let result: any = await this.Administrative.getPerson(this.personID).toPromise();
		this.person = result;
	}

	async getHistoryCourseOfPersonID() {
		let result: any = await this.Administrative.getHistoryByPerson(this.personID).toPromise();
		this.allHistory = result;
		this.history = this.allHistory;
		this.history.map((h: any) => {
			h.progress = 0;
			switch (true) {
				case h.gradeTheory && h.gradePractice:
					h.progress = 100;
					break;
				case !h.gradeTheory && h.gradePractice || h.gradeTheory && !h.gradePractice:
					h.progress = 50;
					break;
				case !h.gradeTheory && !h.gradePractice:
					h.progress = 0;
					break;
				default:
					h.progress = 0;
					break;
			}
			if (h.gradeTheory && h.gradePractice) {
				h.progress = 100;
			}
		})
		this.searched = true;
		//console.log(this.history);
	}

	public async toggleUsersModal(h?: any) {
		if (this.usersModal.isShown) {
			this.usersModal.hide();
		} else {
			//console.log("Inicializando el formulario..."); // <-- Depuración
			console.log('-->', h.periodID)
			console.log('-->', h.classSectionNumber)
			let result: any = await this.Administrative.getSchedule(h.periodID, h.classSectionNumber).toPromise();
			console.log('result', result);
			this.schedule = result[0]
			console.log('schedule', this.schedule);
			this.usersModal.config.keyboard = false;
			this.usersModal.config.ignoreBackdropClick = true;
			this.usersModal.show();
		}
	}

	decreaseWeek() {
		if (this.week > 0) {
			this.week--;
		}
	}

	increaseWeek() {
		if (this.week < this.dataSource.length - 1) {
			this.week++;
		}
	}

	public openFile(relativeRoute: string, classSectionNumber: number, periodID: number): void {
		let body = {
			"periodID": periodID,
			"classSectionNumber": classSectionNumber,
			"personID": +sessionStorage.getItem('personID'),
		};
		const route: string = `${environment.url}/${relativeRoute}`;
		if (this.getPdfContentSubscription) this.getPdfContentSubscription.unsubscribe();
		this.getPdfContentSubscription = this.api.postPdfContent(route, body).subscribe((res: HttpResponse<Blob>) => {
			if (res.body) {
				let contentType: string | null | undefined = res.headers.get('content-type');
				// Porque el tipo de variable que recibe el type es string o undefined. No recibe null.
				if (!contentType) {
					contentType = undefined;
				}
				const blob: Blob = new Blob([res.body], {type: contentType});
				const url = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob)));
				if (url) {
					window.open(url, '_blank');
				}
			}
		});
	}

}
