import { Component, ViewChild, ElementRef, OnInit, OnDestroy, inject, SecurityContext } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, } from '@angular/forms';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { ApiService } from '@services/api.service';
import { NgFor, NgForOf, NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpErrorResponse } from '@angular/common/http';
import { filter, map, Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { Period } from '@utils/interfaces/period.interfaces';
import { CurrentPeriod } from '@utils/interfaces/others.interfaces'
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { SubjectReportsComponent } from '../components/subject-reports/subject-reports.component';
import { TeacherReportsComponent } from '../components/teacher-reports/teacher-reports.component';
import { FollowReportsComponent } from '../components/follow-reports/follow-reports.component';

@Component({
  selector: 'app-instruments',
  standalone: true,
  imports: [
		ReactiveFormsModule,
		//NgForOf,
		//NgFor,
		NgIf,
		MatInputModule,
		MatButtonModule,
		MatFormFieldModule,
		MatSelectModule,
		MatTooltipModule,
		MatIconModule,
		MatPaginatorModule,
		MatTabsModule,
		MatMenuModule,
		SubjectReportsComponent,
		TeacherReportsComponent,
		FollowReportsComponent
	 ],
  templateUrl: './instruments.component.html',
  styleUrls: ['./instruments.component.css']
})

export class InstrumentsComponent extends OnDestroyMixin implements OnInit, OnDestroy {

	public charging: boolean = false;
	public filtersForm!: FormGroup;
	public periods: Period[] = [];
	public currentPeriod: CurrentPeriod;

	constructor(private fb: FormBuilder,
		private activatedRoute: ActivatedRoute ){
		super();
	}

	ngOnInit(): void {
		this.getDataFromResolver();
	}

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	private getDataFromResolver(): void {
    this.activatedRoute.data.pipe(untilComponentDestroyed(this),
    map((value) => value['resolver'])).subscribe({
			next: (value: { periods: Period[], currentPeriod: CurrentPeriod }) => {
				this.periods= value.periods,
				this.currentPeriod= value.currentPeriod
			},
    });
  }

}
