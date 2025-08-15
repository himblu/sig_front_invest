import { NgForOf, NgIf, TitleCasePipe, CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, inject, Inject, OnInit, SecurityContext } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { DomSanitizer } from '@angular/platform-browser';
import { ProgressComponent } from '@components/progress/progress.component';
import { environment } from '@environments/environment';
import { AdministrativeService } from '@services/administrative.service';
import { OnDestroyMixin } from '@w11k/ngx-componentdestroyed';

const SCHEDULE_HEADER: string[] = ['HORA INICIO', 'HORA FIN', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];

@Component({
    selector: 'app-view-schedule',
    templateUrl: './view-schedule.component.html',
    styleUrls: [ './view-schedule.component.scss'],
    standalone: true,
    imports: [
        MatButtonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        NgForOf,
        NgIf,
        ProgressComponent,
        TitleCasePipe,
        MatSliderModule,
        CommonModule,
        MatDividerModule
    ]
})
export class ViewScheduleComponent extends OnDestroyMixin implements OnInit {

	schedule: any;
	schedules: any;
	params: any;
	public scheduleHeader: string[] = SCHEDULE_HEADER;
	listHours:any =[];

	private sanitizer: DomSanitizer = inject(DomSanitizer);
	constructor(
			@Inject(MAT_DIALOG_DATA) public data: any,
			private adminApi: AdministrativeService,
	) {
			super();
	}


	ngOnInit(): void {
			let hours:any = [];
			this.params = {
					periodId: this.data.obj.periodID,
					schoolId: this.data.obj.schoolID,
					planStudyId: this.data.obj.studyPlanID,
					careerId: this.data.obj.careerID,
					modalityId: this.data.obj.modalityID,
					moduleId: this.data.obj.sectionModuleID,
					sectionId: this.data.obj.sectionModuleID,
					cycleId: this.data.obj.cycleID,
					parallelCode: this.data.obj.parallelCode
			}
			const LIST_HEAD_KEYS: any = { 'LUNES': 'lun', 'MARTES': 'mar', 'MIÉRCOLES': 'mie', 'JUEVES': 'jue', 'VIERNES': 'vie', 'SÁBADO': 'sab', 'DOMINGO': 'dom' }
			this.adminApi.getScheduleDistibutive(this.params).subscribe({
					next: (schedule: any) => {
							//console.log(schedule);
							this.schedule=schedule[0];
							const groupedByDay = schedule.reduce((acc: any, item: any) => {
									const { weekdayDesc, ...rest } = item;
									acc[LIST_HEAD_KEYS[weekdayDesc]] = acc[LIST_HEAD_KEYS[weekdayDesc]] || [];
									acc[LIST_HEAD_KEYS[weekdayDesc]].push(rest);
									return acc;
							}, {});

							const days = Object.keys(groupedByDay);
							const transformedObject:any = {}
							days.forEach(day => {
									transformedObject[day] = groupedByDay[day].reduce((acc:any, item:any) => {
										const { startTime, endTime } = item;
										if (!acc[`${startTime}-${endTime}`]) {
											acc[`${startTime}-${endTime}`] = [];
										}

									hours.push({startTime,endTime});

										acc[`${startTime}-${endTime}`].push(
											item
										);

										return acc;
									}, {})
							})
								this.schedules = transformedObject;
								this.listHours = Array.from(new Set(hours.map((obj:any) => obj.startTime))).map(startTime => {
									return hours.find((obj:any) => obj.startTime === startTime);
								});
					}
			})
	}

	public generateReport(){
		const route: string = `${environment.url}/api/class-section/schedule-pdf/${this.params.periodId}/${this.params.schoolId}
		/${this.params.planStudyId}/${this.params.careerId}/${this.params.modalityId}/${this.params.moduleId}/${this.params.sectionId}
		/${this.params.cycleId}/${this.params.parallelCode}`;

		this.adminApi.getPdfContent(route).subscribe((res: HttpResponse<Blob>) => {
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
