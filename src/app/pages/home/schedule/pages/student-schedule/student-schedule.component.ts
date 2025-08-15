import { CommonModule, CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, Pipe, PipeTransform } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { CareerDetail, SPGetCareer, SPGetModality } from '@utils/interfaces/campus.interfaces';
import { ClassSchedule, PaymentOption, PayMentOptions } from '@utils/interfaces/enrollment.interface';
import { SeccionModulo, SignatureRepeat, StatusStudents } from '@utils/interfaces/others.interfaces';
import { OnDestroyMixin } from '@w11k/ngx-componentdestroyed';

interface EnrollmentInfo {
  period: string;
  career: string;
  modality: string;
  workingDay: string;
  academicLevel: string;
}

@Pipe({
  name: 'numberToWords',
  standalone: true
})
export class NumberToWordsPipe implements PipeTransform {
  transform(number: number): string {
    const numberToWordsMap: { [key: number]: string } = {
      1: 'Primero',
      2: 'Segundo',
      3: 'Tercero',
      4: 'Cuarto',
      5: 'Quinto',
    };
    let result = numberToWordsMap[number];
    return result;
  }
}

const ENROLLMENT_INFO: EnrollmentInfo = { workingDay: '', modality: '', career: '', academicLevel: '', period: '' };

@Component({
  selector: 'app-student-schedule',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
    ReactiveFormsModule,
    NgForOf,
    NgIf,
    MatTooltipModule,
    NgClass,
    DatePipe,
    CurrencyPipe,
    MatInputModule,
    MatTableModule,
    NumberToWordsPipe
  ],
  templateUrl: './student-schedule.component.html',
  styleUrls: ['./student-schedule.component.scss']
})

export class StudentScheduleComponent extends OnDestroyMixin implements OnInit, OnDestroy {
  public careers: SPGetCareer[] = [];
  public modalities: SPGetModality[] = [];
  public workingDays: SeccionModulo[] = [];
  public paymentInfo: PayMentOptions[] = [];
  public paymentInfoId!: PayMentOptions;
  public selectedOption: PaymentOption;
  public schedule: ClassSchedule[] = [];
  public enrollmentInfo: EnrollmentInfo = ENROLLMENT_INFO;
  public statusStudent: StatusStudents;
  public signatureList: CareerDetail[] = [];
  public nameUser: string = sessionStorage.getItem('name') || '';
  public nameMiddleName: string = '';
  public name: string = '';
  public careerOk: string = '';
  public modalidadOk: string = '';
  indexSelected: number = 0;
  courseSelected: number = 0;
  public seccionOk: string = '';
  public signatureRepeatList: SignatureRepeat[] = [];
  public signatureRepeatListAux: any[] = [];
  public scheduleSignatureRepeat: any[] = [];
  public scheduleSignatureRepeatSave: any[] = [];
  public showMessageLost: boolean = false;
  public carrera: string = '';
  public modalidad: string = '';
  public jornada: string = '';
  personId:number;
  periodId:number;



  private adminApi: AdministrativeService = inject(AdministrativeService);
  conceptsPayments: any[] = [];


  columnsSchedule = [
    'startTime',
    'mon',
    'tue',
    'wed',
    'thu',
    'fri',
    'sat',
  ]

  rowsSchedule: any[] =[]

  schedulesModule:any[]=[];

  compare(a: any, b: any) {
    if (a.endTime < b.endTime || (a.endTime == b.endTime && a.startTime > b.startTime))
      return -1;
    if (a.endTime > b.endTime || (a.endTime == b.endTime && a.startTime < b.startTime))
      return 1;
    return 0;
  }


  dataProcess() {
    this.rowsSchedule.sort(this.compare);
  }

  constructor(private fb: FormBuilder,
    private common: CommonService,
    ) {
    super();
  }

  async ngOnInit() {
		const studentId = +sessionStorage.getItem('studentID');
    this.personId = Number(sessionStorage.getItem('id')) || 0;
    this.adminApi.getCurrentPeriod()
      .subscribe({
      next: (period) => {
        period.data.forEach(element => {
          if(element.state === 'ACTIVO'){
            this.periodId = element.periodID;
            this.common.getScheduleITCA(studentId, Number(element.periodID)).subscribe({
              next: (schedule)=>{
                this.rowsSchedule = schedule;
                this.dataProcess();
                const orderSchedule = this.separeSchedule();
                this.schedulesModule = Object.values(orderSchedule);
              }
            })
          //TODO: get asignaturas de arrastre
          }
        });

      }
    })
  }

  separeSchedule() {
    var result = this.rowsSchedule.reduce((acc, obj) => {
      acc[obj.classModuleDesc] = acc[obj.classModuleDesc] || [];
      acc[obj.classModuleDesc].push(obj);
      return acc;
    }, {});
    return result

  }
}
