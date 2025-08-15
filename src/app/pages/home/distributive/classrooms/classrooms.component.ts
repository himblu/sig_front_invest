import { ClassRoom, CourseDetailShort } from './../../../../utils/interfaces/campus.interfaces';
import { NgForOf, NgIf, TitleCasePipe, CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { ActivatedRoute } from '@angular/router';
import { ProgressComponent } from '@components/progress/progress.component';
import { AdministrativeService } from '@services/administrative.service';
import { CurrentPeriodItca, Period } from '@utils/interfaces/period.interfaces';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { map } from 'rxjs';
const SCHEDULE_HEADER: string[] = ['HORA INICIO', 'HORA FIN', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];

@Component({
  selector: 'app-classrooms',
  templateUrl: './classrooms.component.html',
  styleUrls: ['./classrooms.component.scss'],
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
    CommonModule
  ]
})
export class ClassroomsComponent extends OnDestroyMixin implements OnInit{


  periods: Period[] = [];
  classRooms: ClassRoom[] = [];
  builds: any[] = [];
  formFilters: FormGroup;
  distributiveSchedule: any[] = [];
	public scheduleHeader: string[] = SCHEDULE_HEADER;
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);

  constructor(
    private admin: AdministrativeService,
    private fb: FormBuilder
  ) {    
    super();
  }

  ngOnInit() {
    this.initForm();
    this.getDataFromResolver();
    this.loadInformation();
  }

  initForm(){
    this.formFilters = this.fb.group({
      periodID: ['', Validators.required],
      buildID: ['', Validators.required],
      classroomID: ['', Validators.required],
    });
  }

  private getDataFromResolver(): void {
		this.activatedRoute.data
			.pipe(
				untilComponentDestroyed(this),
				map((value: any) => value['resolver']))
			.subscribe({
				next: (value: { periods: Period[], builds: any[] }) => {
					this.periods = value.periods;
          this.builds = value.builds;
				},
			});
	}

  changeBuild(eve:any){
    if(eve.value){
      this.admin.getClassroomsByBuilding(eve.value).subscribe({
        next: (resp) => {
          this.classRooms = resp;
        }
      })
    }
  }

  loadInformation(){
    this.admin.getCurrentPeriodItca().subscribe({
      next: (resp:CurrentPeriodItca) => {
        this.formFilters.get('periodID')?.setValue(resp.periodID);
      }
    });
  }

  searchScheduleDetail(){
    const { periodID, buildID, classroomID } = this.formFilters.value;
    this.admin.getAllDistributiveSchedule( periodID, buildID, classroomID).subscribe({
      next: (resp: any) => {
        console.log('classttom',resp);
        this.distributiveSchedule = resp;
      }
    });
  }
}
