import { Component, OnInit, inject, SecurityContext } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdministrativeService } from '@services/administrative.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule, NgForOf, NgIf, TitleCasePipe } from '@angular/common';
import { ProgressComponent } from '@components/progress/progress.component';
import {MatSliderModule} from '@angular/material/slider';
import { ActivatedRoute } from '@angular/router';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { map } from 'rxjs';
import { CurrentPeriodItca, Period } from '@utils/interfaces/period.interfaces';
import { TimeAvailabilityTeacher } from '@utils/interfaces/others.interfaces';
import { CourseDetailShort } from '@utils/interfaces/campus.interfaces';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '@environments/environment';
import { ButtonArrowComponent } from '@components/button-arrow/button-arrow.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
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
    MatIconModule,
		ButtonArrowComponent
  ]
})

export class ListComponent extends OnDestroyMixin implements OnInit{

	countTeachers:      number = 0;
  actualTeachers:     number = 1;
  totalPageTeachers:  number = 1;
	pageLimit:					number = 10;
  teachers:TimeAvailabilityTeacher[] = [];
  periods:Period[] = [];
  courses:CourseDetailShort[] = [];
  formFilters!: FormGroup;
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private sanitizer: DomSanitizer = inject(DomSanitizer);
  private adminApi: AdministrativeService = inject(AdministrativeService);


  constructor( private admin: AdministrativeService,
                private fb:FormBuilder
                ){
                  super();
                }

  ngOnInit(): void {
    this.initForm();
    this.loadInformation();
    this.getDataFromResolver();

  }

  loadInformation(){
    this.admin.getCurrentPeriodItca().subscribe({
      next: (resp:CurrentPeriodItca) => {
        this.formFilters.get('periodID')?.setValue(resp.periodID);
        this.admin.getTimeAvailableTeacher(resp.periodID, 0).subscribe({
          next: (teacherTime:any) => {
            this.teachers = teacherTime.data;
						this.countTeachers = teacherTime.count;
						console.log(teacherTime)
						if(this.countTeachers<=this.pageLimit){
							this.totalPageTeachers=1
						}else{
							this.totalPageTeachers = Math.ceil(this.countTeachers / this.pageLimit);
						}
          }
        });
      }
    });
  }

	changePageTeachers( page: number){
    this.searchTeachersProgram(page);
  }

  private getDataFromResolver(): void {
		this.activatedRoute.data
			.pipe(
				untilComponentDestroyed(this),
				map((value: any) => value['resolver']))
			.subscribe({
				next: (value: { periods: Period[], courses: CourseDetailShort[] }) => {
					this.periods = value.periods;
					this.courses = value.courses;
				},
			});
	}

  formatLabel(value: number): string {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'horas';
    }
    return `${value}`;
  }

  initForm(){
    this.formFilters = this.fb.group({
      periodID: ['', Validators.required],
      courseID: [0, Validators.required],
    });
  }

  searchTeachersProgram(page:number){
		this.actualTeachers = page;
    this.admin.getTimeAvailableTeacher(this.formFilters.get('periodID')?.value, this.formFilters.get('courseID')?.value, this.pageLimit, this.actualTeachers).subscribe({
      next: (resp:any) => {
        this.teachers = resp.data;
				this.countTeachers = resp.count;
				if(this.countTeachers<=this.pageLimit){
					this.totalPageTeachers=1
				}else{
					this.totalPageTeachers = Math.ceil(this.countTeachers / this.pageLimit);
				}
      }
    });
  }

  generateReport(){
      const filtersValue: any = this.formFilters.value;
      const route: string = `${environment.url}/api/class-section/report-teacher/${this.formFilters.get('periodID')?.value}/${this.formFilters.get('courseID').value}`;

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
