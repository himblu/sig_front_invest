import { MatIconModule } from '@angular/material/icon';
import { NgForOf, NgIf, TitleCasePipe, CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, SecurityContext } from '@angular/core';
import { Form, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ProgressComponent } from '@components/progress/progress.component';
import { AdministrativeService } from '@services/administrative.service';
import { SPGetCareer, School, StudyPlan } from '@utils/interfaces/campus.interfaces';
import { CurrentPeriodItca, Period } from '@utils/interfaces/period.interfaces';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { map } from 'rxjs';
import { environment } from '@environments/environment';

const PERIOD_HEADER: string[] = ['PERIODO I','PERIODO II','PERIODO III','PERIODO IV','PERIODO V','PERIODO VI'];

@Component({
  selector: 'app-careers',
  templateUrl: './careers.component.html',
  styleUrls: ['./careers.component.scss'],
  standalone: true,
  imports:[
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
    MatIconModule
  ]
})
export class CareersComponent extends OnDestroyMixin implements OnInit {

  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  periods: Period[];
	private adminApi: AdministrativeService = inject(AdministrativeService);
  schools: School[];
  formFilters: FormGroup;
  studyPlans: StudyPlan[];
  careers: SPGetCareer[];
  listWork!:any;
  distributiveHeader: string[] = PERIOD_HEADER;
  private sanitizer: DomSanitizer = inject(DomSanitizer);

  constructor(
    private fb:FormBuilder
  ) {
    super();
  }

  ngOnInit(): void {
    this.getDataFromResolver();
    this.initForm();
    this.loadInformation();
  }

  initForm() {
    this.formFilters = this.fb.group({
      periodID: [null, Validators.required],
      schoolID: [null, Validators.required],
      studyPlanID: [null, Validators.required],
      careerID: [null, Validators.required],
    })
  }
  loadInformation(){
    this.adminApi.getCurrentPeriodItca().subscribe({
      next: (resp:CurrentPeriodItca) => {
        this.formFilters.get('periodID')?.setValue(resp.periodID);
        this.adminApi.getSchoolsByPeriod(resp.periodID).subscribe({
          next: (schools:School[]) => {
            this.schools = schools;
          }
        });
      }
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

				},
			});
	}

  getSchoolsByPeriod(event: MatSelectChange): void {
    this.resetFormDepending('period');
		this.adminApi.getSchoolsByPeriod(event.value)
			.subscribe({
				next: (value: School[]) => {
					this.schools = value;
				},
			});
	}

  getStudyPlansBySchoolAndPeriod(event: MatSelectChange): void {
    this.resetFormDepending('school');
    const periodId = this.formFilters.get('periodID').value;
		this.adminApi.getStudyPlansBySchoolAndPeriod(event.value, periodId)
			.subscribe({
				next: (value: StudyPlan[]) => {
					//this.studyPlans = value;
				}
			});
      this.adminApi.getCareersBySchool(periodId, event.value).subscribe({
        next: (value: SPGetCareer[]) => {
          this.careers = value;
        }
      });
	}

  getCarrerByPeriodAndSchool(careerID: number){
		const periodId = this.formFilters.get('periodID').value;
		this.adminApi.getStudyPlansByCareerAndPeriod(careerID, periodId).subscribe({
			next: (value: StudyPlan[]) => {
				this.studyPlans = value;
			}
		});
  }


  public getCareersByStudyPlanAndSchoolAndPeriod(event: MatSelectChange): void {
    const schoolID = this.formFilters.get('schoolID').value;
    const periodID = this.formFilters.get('periodID').value;
    this.adminApi.getCareersByStudyPlanAndSchoolAndPeriod(event.value,schoolID,periodID)
			.subscribe({
				next: (value: SPGetCareer[]) => {
					this.careers = value;
				}
			});
	}

  searchDistributiveByCareers(){
    let listEnd:any = {
      'periodOne':[],
      'periodTwo':[],
      'periodThree':[],
      'periodFour':[],
      'periodFive':[],
			'periodSix':[],
    }
    //let keysOfPeriod:any = {"PERÍODO V":'periodFive', "PERÍODO IV":'periodFour', "PERÍODO III":'periodThree', "PERÍODO II":'periodTwo', "PERÍODO I":'periodOne'}
    //const numberLeter =['I','II','III','IV','V']
    if(this.formFilters.invalid){
      this.formFilters.markAllAsTouched();
      return;
    }
    const { periodID, schoolID, studyPlanID, careerID } = this.formFilters.value;
    this.adminApi.getDistributiveByStudyPlan(periodID, studyPlanID, schoolID, careerID).subscribe({
      next: (resp:any) => {

        // inputList.forEach((element:any) => {
        //   if(listEnd.length > 0){
        //     listEnd.forEach((exist:any, index:number)=> {
        //       console.log('exist',exist);
        //       if(element.cycleDesc === 'PERÍODO I'){
        //         if(exist.periodOne){

        //         }else{
        //           listEnd.push({'periodOne':element});
        //         }
        //       }
        //       if(element.cycleDesc === 'PERÍODO II'){
        //         if(exist.periodTwo){

        //         }else{
        //           listEnd.push({'periodTwo':element});
        //         }
        //       }
        //       if(element.cycleDesc === 'PERÍODO III'){
        //         if(exist.periodThree){

        //         }else{
        //           listEnd.push({'periodThree':element});
        //         }
        //       }
        //       if(element.cycleDesc === 'PERÍODO IV'){
        //         if(exist.periodFour){

        //         }else{
        //           listEnd.push({'periodFour':element});
        //         }
        //       }
        //       if(element.cycleDesc === 'PERÍODO V'){
        //         if(exist.periodFive){

        //         }else{
        //           listEnd.push({'periodFive':element});
        //         }
        //       }

        //     });
        //   }else{
        //     if(element.cycleDesc === 'PERÍODO I'){
        //       listEnd.push({'periodOne':element});
        //     }
        //     if(element.cycleDesc === 'PERÍODO II'){
        //       listEnd.push({'periodTwo':element});
        //     }
        //     if(element.cycleDesc === 'PERÍODO III'){
        //       listEnd.push({'periodThree':element});
        //     }
        //     if(element.cycleDesc === 'PERÍODO IV'){
        //       listEnd.push({'periodFour':element});
        //     }
        //     if(element.cycleDesc === 'PERÍODO V'){
        //       listEnd.push({'periodFive':element});
        //     }
        //   }
        // });

        // console.log('listEnd',listEnd);


        resp.forEach((element:any) => {
          if(element.cycleDesc === 'PERÍODO I'){
            listEnd['periodOne'].push(element);
          }
          if(element.cycleDesc === 'PERÍODO II'){
            listEnd['periodTwo'].push(element);
          }
          if(element.cycleDesc === 'PERÍODO III'){
            listEnd['periodThree'].push(element);
          }
          if(element.cycleDesc === 'PERÍODO IV'){
            listEnd['periodFour'].push(element);
          }
          if(element.cycleDesc === 'PERÍODO V'){
            listEnd['periodFive'].push(element);
          }
					if(element.cycleDesc === 'PERÍODO VI'){
            listEnd['periodSix'].push(element);
          }
        });
        //console.log('listEnd',listEnd);
        this.listWork= listEnd;
        const periods = Object.keys(this.listWork);

// Create an array with each element containing one object from each period
      const resultArray = this.listWork[periods[0]].map((_:any, index:number) => {
          const resultObject:any = {};
          periods.forEach(period => {
							if(this.listWork[period][index] == undefined){
								resultObject[period] = []
							}else{
								resultObject[period] = this.listWork[period][index];
							}
          });
          return resultObject;
      });
      console.log(resultArray);
      this.listWork = resultArray;
      }
    })
  }

  resetFormDepending(type:string){
    if(type === 'period'){
      this.formFilters.get('schoolID')?.reset();
      this.formFilters.get('studyPlanID')?.reset();
      this.schools = [];
      this.studyPlans = [];
    }else if(type === 'school'){
      this.formFilters.get('studyPlanID')?.reset();
      this.careers = [];
      this.studyPlans = [];
    }
    this.formFilters.get('careerID')?.reset();
    this.careers = [];
  }

  generateReport(){
    // this.adminApi.getReportExcel(
    //   this.formFilters.get('periodID')?.value,
    //   this.formFilters.get('schoolID')?.value,
    //   this.formFilters.get('studyPlanID')?.value,
    //   this.formFilters.get('careerID')?.value
    // );

    const filtersValue: any = this.formFilters.value;
    const route: string = `${environment.url}/api/class-section/report-course/${this.formFilters.get('periodID')?.value}/${this.formFilters.get('schoolID')?.value}/${this.formFilters.get('studyPlanID')?.value}/${this.formFilters.get('careerID')?.value}`;

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


  public buildReport(relativeRoute: string, studentOrStatus?: number): void {

  }
}
