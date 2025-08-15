import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '@services/api.service';
import { UserService } from '@services/user.service';
import { Period } from '@utils/interfaces/period.interfaces';
import { CurrentPeriod, Schedules } from '@utils/interfaces/others.interfaces';

@Component({
  selector: 'app-schedules',
  templateUrl: './schedules.component.html',
  styleUrls: ['./schedules.component.scss'],
	standalone: true,
	imports: [
    CommonModule,
    FormsModule,
    NgIf,
    NgFor,
    ReactiveFormsModule,
		SpinnerLoaderComponent,
		MatFormFieldModule,
		MatSelectModule
  ]
})
export class SchedulesComponent implements OnInit {
	periods:Period[];
	currentPeriod:CurrentPeriod;
	schedules: Schedules[];
	public filtersForm!: FormGroup;
	public loadingSchedules: boolean;

	private formBuilder: FormBuilder = inject(FormBuilder);
	private api: ApiService = inject(ApiService);
	private user: UserService = inject(UserService);

	constructor(){
  }

	ngOnInit(): void {
		this.getPeriods();
		this.filterForm();
		this.getCurrentPeriod();
	}

	private getPeriods(): void {
    this.api.getItcaPeriods().subscribe({
      next: (res: any) => {
        this.periods = res.data;
      }
    });
  }

	private getCurrentPeriod(): void {
    this.api.getCurrentPeriod().subscribe({
      next: (res: CurrentPeriod) => {
        this.currentPeriod = res;
				this.filtersForm.get('periodID').patchValue(this.currentPeriod.periodID);
				this.getSchedule();
      }
    });
  }

	public getSchedule(periodID=this.currentPeriod.periodID):void{
		this.api.getSchedule(periodID, +sessionStorage.getItem('studentID')).subscribe({
      next: (res) => {
        this.schedules=res;
				//console.log(this.schedules)
      }
    });
	}

	public filterForm():void{
    this.filtersForm = this.formBuilder.group({
      periodID: ['']
    });
  }

}


