import {  NgIf, CommonModule } from '@angular/common';
import { Component, inject, Inject, OnInit, SecurityContext } from '@angular/core';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { DomSanitizer } from '@angular/platform-browser';
import { AdministrativeService } from '@services/administrative.service';
import { OnDestroyMixin } from '@w11k/ngx-componentdestroyed';
import { FormControl, Validators } from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {CommonService} from '@services/common.service';


@Component({
  selector: 'app-view-expand-limit',
  templateUrl: './view-expand-limit.component.html',
  styleUrls: ['./view-expand-limit.component.scss'],
	standalone: true,
	imports: [
		MatButtonModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatSelectModule,
		NgIf,
		MatSliderModule,
		CommonModule,
		MatDividerModule,
		MatInputModule
	]
})
export class ViewExpandLimitComponent extends OnDestroyMixin implements OnInit {
	schedule: any;
	schedules: any;
	params: any;
	private adminApi: AdministrativeService = inject(AdministrativeService);
	distibutive!:any;
	private sanitizer: DomSanitizer = inject(DomSanitizer);
	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		private common:CommonService,
		private dialogRef: MatDialogRef<ViewExpandLimitComponent>
	) {
		super();
	}


	ngOnInit(): void {
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
		this.adminApi.getScheduleDistibutive(this.params).subscribe({
			next: (schedule: any) => {
				this.schedule=schedule[0];
				const groupedByDay = schedule.reduce((acc: any, item: any) => {
					return acc;
				}, {});

			}
		})
	}

	public vacanciesControl = new FormControl('', [Validators.required, Validators.min(1)]);
	saveVacancies(): void {
		if (this.vacanciesControl.invalid) {
			this.vacanciesControl.markAsTouched();
			return;
		}
		const body = {
			periodID: this.data.obj.periodID,
			careerID: this.data.obj.careerID,
			studyPlanID: this.data.obj.studyPlanID,
			cycleID: this.data.obj.cycleID,
			parallelCode: this.data.obj.parallelCode,
			newVacancies: this.vacanciesControl.value
		};
		// console.log(body);
		this.adminApi.saveVacanciesDistributive(body).subscribe({
			next: (resp: any) => {
				this.distibutive = resp;
				this.dialogRef.close(true);
				this.common.message(`Aumento de vacantes exitoso.`, '', 'success', '#86bc57');

			}
		});
	}
	}
