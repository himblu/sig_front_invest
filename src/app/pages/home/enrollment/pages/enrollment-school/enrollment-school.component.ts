import { Component, inject, OnDestroy, OnInit, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CareerDetail, SPGetCareer, SPGetModality, WorkingDay } from '@utils/interfaces/campus.interfaces';
import { AdministrativeService } from '@services/administrative.service';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { debounceTime, distinctUntilChanged, forkJoin, map, Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ClassSchedule, FailedSubject, PaymentInfo, PaymentOption, PayMentOptions } from '@utils/interfaces/enrollment.interface';
import { TotalFeeByLevelPipe } from './pipes/total-fee-by-level.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonService } from '@services/common.service';
import Swal from 'sweetalert2';
import { environment } from '@environments/environment';
import { EnrollmentPost, RetrieveAvailable, RetrieveAvailableSchedules, ScheduleSignatureRepeat, SeccionModulo, SignatureRepeat, SignatureReport, StatusStudents, ValidateStatus } from '@utils/interfaces/others.interfaces';
import { UserService } from '@services/user.service';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';

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
      1: 'PRIMERO',
      2: 'SEGUNDO',
      3: 'TERCERO',
      4: 'CUARTO',
      5: 'QUINTO',
    };
    let result = numberToWordsMap[number];
    return result;
  }
}

const ENROLLMENT_INFO: EnrollmentInfo = { workingDay: '', modality: '', career: '', academicLevel: '', period: '' };

@Component({
  selector: 'app-enrollment-school',
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
    //TotalFeeByLevelPipe,
    MatTooltipModule,
    NgClass,
    //DatePipe,
    CurrencyPipe,
    MatInputModule,
    MatTableModule,
    NumberToWordsPipe,
		MatCheckboxModule
  ],
  templateUrl: './enrollment-school.component.html',
  styleUrls: ['./enrollment-school.component.scss']
})

export class EnrollmentSchoolComponent extends OnDestroyMixin implements OnInit, OnDestroy {
	public isLoading: boolean = false;
	public retrieveForm!: FormGroup;
  // public careerStep: FormGroup;
  // public paymentStep: FormGroup;
  // public confirmationStep: FormGroup;
  public careers: SPGetCareer[] = [];
  public modalities: SPGetModality[] = [];
  public workingDays: SeccionModulo[] = [];
  public paymentInfo: PayMentOptions[] = [];
	public failedSubjects: FailedSubject[] = [];
	public failedSubjectsTotal: number = 0;
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
  public indexSelected: number = 0;
  public courseSelected: number = 0;
  public seccionOk: string = '';
  public signatureRepeatList: SignatureRepeat[] = [];
  public signatureRepeatListAux: any[] = [];
  // public scheduleSignatureRepeat: ScheduleSignatureRepeat[] = [];
  public scheduleSignatureRepeat: any[] = [];
  public scheduleSignatureRepeatSave: any[] = [];
	public clicked = false;
  public showMessageLost: boolean = false;
  public carrera: string = '';
  public modalidad: string = '';
  public jornada: string = '';
	public retrieveAvailable: RetrieveAvailable[] = [];

  private personId: number;
  private periodId: number;
	private studentID: number= +sessionStorage.getItem('studentID');
	@ViewChild('stepper') private stepper: MatStepper;
  private sendFormSubscription: Subscription;
  private formBuilder: FormBuilder = inject(FormBuilder);
  private adminApi: AdministrativeService = inject(AdministrativeService);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private commonService: CommonService = inject(CommonService);
  private router: Router = inject(Router);

  columnsSchedule = [
    'startTime',
    // 'endTime',
    'mon',
    'tue',
    'wed',
    'thu',
    'fri',
    'sat',
    // 'sun',
  ]

  rowsSchedule: any[] = []
	conceptsPayments: any[] = [];
  schedulesModule:any[] = [];

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

  get PersonID() {
    return this.userServices.currentUser;
  }

  constructor(private fb: FormBuilder,
    private common: CommonService,
    private userServices: UserService) {
    super();
		this.initRetrieveForm();
  }

  async ngOnInit() {
		const studentId = +sessionStorage.getItem('studentID');
    const personId = Number(sessionStorage.getItem('id')) || 0;
    this.personId = personId;
    await this.adminApi.getStatusStudents(studentId)
      .subscribe(async resp => {
        this.statusStudent = resp;
        this.careerStep.get('modality').valueChanges
          .subscribe(resp => {
            this.adminApi.getWorkingDaysByModality2(this.statusStudent.modalityID)
              .subscribe(resp => {
                this.workingDays = resp;
              })
          })
        await this.loading();
        await this.carga();
      });

    this.paymentStep.get('paymentOption').valueChanges
      .pipe(
        untilComponentDestroyed(this)
      )
      .subscribe(resp => {
        this.paymentInfo.forEach(element => {
          if (element.paymentOptionID === Number(resp)) {
            this.paymentInfoId = element;
          }
        });
      })



    let nameAux = this.nameUser.split(' ');
    this.nameMiddleName = nameAux[0] + ' ' + nameAux[1];
    if(nameAux[3]) this.name = nameAux[2] + ' ' + nameAux[3]!;
		else this.name = nameAux[2]
    this.adminApi.getCurrentPeriodItca()
      .subscribe({
      next: (period) => {
				this.periodId = period.periodID;
				this.common.getScheduleITCA(studentId, Number(period.periodID)).subscribe({
					next: (schedule)=>{
						this.rowsSchedule = schedule;
						this.dataProcess();
						const orderSchedule = this.separeSchedule();
						this.schedulesModule = Object.values(orderSchedule);
						//console.log('schedulesModule', this.schedulesModule);
					}
				})

				this.common.getSignatureArrastre(studentId, Number(period.periodID)).subscribe({
					next:(arrastre)=> {
						//console.log();

						this.signatureRepeatList = arrastre.slice();
						this.signatureRepeatListAux = arrastre.slice();
						this.signatureRepeatListAux.forEach((item: any) => {
							if(item.courseID === 0){
								this.showMessageLost = true;
							}
						})
					},
				})
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

  signatureRepeatForm: FormGroup = this.fb.group({
    signatureRepeat: ['', [Validators.required]],
    scheduleRepeat: ['', [Validators.required]]
  });

  careerStep = this.fb.group({
    career: [0],
    modality: [0],
    workingDay: [0],
    careerName: [''],
    modalityName: [''],
    workingDayName: ['']
  });

  paymentStep = this.fb.group({
    paymentOption: ['']
  });

  confirmationStep = this.fb.group({});

  enrollmentPost: FormGroup = this.fb.group({
    personID: [0, [Validators.required, Validators.min(1)]],
    p_paymentOptionID: [0, [Validators.required, Validators.min(1)]],
    p_psychologicalTest: ['', [Validators.required]],
		p_studentID: [+sessionStorage.getItem('studentID')],
  });

	public initRetrieveForm(): void {
		this.retrieveForm= this.fb.group({
			courses: this.fb.array([])
		});
/* 		this.retrieveForm.valueChanges.pipe(
			debounceTime(300),
			distinctUntilChanged(),
			untilComponentDestroyed(this)
		).subscribe({
			next: (value ) => {
				this.verifySchedulesConflicts();
			}
		}); */
	}

	public getCoursesArray(): FormArray {
    return this.retrieveForm.controls['courses'] as FormArray;
  }

  public addCoursesRow(item: RetrieveAvailable): void {
    this.getCoursesArray().push(this.coursesRow(item));
  }

  private coursesRow(item: RetrieveAvailable): FormGroup {
    return this.fb.group({
			studyPlanID: [item.studyPlanID],
			studyPlanDesc: [item.studyPlanDesc],
      courseID: [item.courseID],
			cycleID: [item.cycleID],
			level: [item.level],
			parallelCode: [item.parallelCode],
			courseName: [item.courseName],
			classSectionNumber: [item.classSectionNumber],
			vacancies: [item.vacancies],
			busy: [item.busy],
			available: [item.available],
			generic: [item.generic],
			classModuleID: [item.classModuleID],
      flgCheck: [item.flgCheck],
      flgDisabled: [item.flgDisabled],
			failed: [item.failed],
			schedule: [item.schedule],
			sectionModule: [item.sectionModule],
			obligatory: [item.obligatory],
			studentID: [item.studentID],
			periodID: [item.periodID],
    })
  }

  loading() {
    // this.adminApi.getSignatureRepeat()
    //   .subscribe((resp: any) => {
    //     this.signatureRepeatList = resp;
    //   })
		const personID = Number(sessionStorage.getItem('id')) || 0;

    this.adminApi.getCareers()
      .subscribe(resp => {

        this.careers = resp.data
      })

    this.adminApi.getModalities()
      .subscribe(resp => {
        this.modalities = resp.data;
      });

    //  this.adminApi.getWorkingDaysByModality(1)
    //   .subscribe( resp => {
    //     this.workingDays = resp;
    //   })

    /* this.adminApi.getPaymentsByCareer().subscribe(resp => {
			//console.log(resp)
			this.paymentInfo = resp;
		}); */

		this.getPaymentsArrastres();

    this.common.getPerson(personID)
      .subscribe(person => {
        this.common.getPsychologicalTest(person.identity)
          .subscribe((resp: any) => {
            //console.log('resp en tect', resp);

            if (resp.estado_general_test === null || resp.estado_general_test === 0) {
              this.common.message('Aun no a realizado el/los Test Psicológicos', 'Para legalizar su matrícula deberá completar los mismos', 'warning', '#d3996a');
              this.enrollmentPost.get('p_psychologicalTest').setValue('Y');
            }
          })
      })
  }

  // public showInstructions(): void {
  //   Swal.fire({
  //     text: 'Información de Pago',
  //     imageUrl: '../../../../../assets/images/ticket2.png',
  //     imageHeight: 500,
  //     imageAlt: 'Información de Pago',
  //     // confirmButtonText: '<span style="color: white; background: #014898;">Cerrar</span>'
  //   }).then();
  // }

  carga() {
    this.careerStep.get('career').setValue(this.statusStudent.careerID);
    this.careerStep.get('modality').setValue(this.statusStudent.modalityID);
    this.careerStep.get('workingDay').setValue(this.statusStudent.workingDayID);
    this.careerStep.get('careerName').setValue(this.statusStudent.careerName);
    this.careerStep.get('modalityName').setValue(this.statusStudent.modalityName);
    this.careerStep.get('workingDayName').setValue(this.statusStudent.workingDayDesc);
  }

  // public showInstructions2(): void {

  //       Swal.fire({
  //         text: 'Información de Pago',
  //         imageUrl: '../../../../../assets/images/HORARIO.png',
  //         imageHeight: 400,
  //         imageAlt: 'Información de Pago',
  //         // confirmButtonText: '<span style="color: white; background: #014898;">Cerrar</span>'
  //       }).then(() => {
  //           this.router.navigate(['/matriculacion/pago-matricula']).then();
  //       });


  //   }

  public sendForm(): void {
		if(this.sendFormSubscription) this.sendFormSubscription.unsubscribe();
		if(this.paymentInfo?.length) this.enrollmentPost.get('p_paymentOptionID').setValue(Number(this.paymentStep.get('paymentOption')?.value));
    else this.enrollmentPost.get('p_paymentOptionID').setValue(Number(this.failedSubjects[0]?.paymentOptionID));
    this.enrollmentPost.get('personID').setValue(Number(sessionStorage.getItem('id')) || 0);
    if (!this.enrollmentPost) {
      this.careerStep.markAllAsTouched();
      this.paymentStep.markAllAsTouched();
      this.commonService.message('Revise campos en color rojo', '', 'warning', '#d3996a');
      return;
    };

		let array: FormArray= this.getCoursesArray();
		for(let i=0; i<array.getRawValue().length; i++){
			if(array.controls[i].get('flgCheck').getRawValue()) array.controls[i].get('flgCheck').patchValue(1);
			else array.controls[i].get('flgCheck').patchValue(0);
		};
		let objSend = {
			periodID: this.periodId,
			user: sessionStorage.getItem('name') || '',
			studentID: +sessionStorage.getItem('studentID'),
		};
		const aux: EnrollmentPost = this.enrollmentPost.value as EnrollmentPost;
		let body= {
			schedules: array.getRawValue(),
			paymentOptionID: aux.p_paymentOptionID,
			psychologicalTest: aux.p_psychologicalTest,
			studentID: aux.p_studentID,
			personID: aux.personID
		};
		this.isLoading= true;
		const observables: Observable<any>[] = [];
		//observables.push(this.adminApi.postStudentEnrollment(objSend));
		//observables.push(this.adminApi.postEnrollment(aux));
		//observables.push(this.adminApi.saveDragPayment(array.getRawValue()));
		observables.push(this.adminApi.saveStudentEnrollment(body));
		this.sendFormSubscription = forkJoin(observables).subscribe({
			next: (res) => {
				//console.log(res);
				this.isLoading= false;
				Swal.fire({
					icon: 'success',
					title: `<span style="color:#86bc57;">Buen trabajo</span>`,
					text: `La matrícula se ha generado de manera correcta`,
				}).then(() => {
					this.processAfterEnroll();
				});
			},
			error: (err: HttpErrorResponse) => {
				//console.log(error);
				this.common.message(`${err.error.message}`, '', 'error', '#f5637e');
				this.isLoading= false;
			}
		});
  }

  processAfterEnroll() {
    let aux: ValidateStatus = {
			p_personID: +sessionStorage.getItem('id')! || 0,
      p_studentID: +sessionStorage.getItem('studentID')! || 0,
      p_companyID: 1,
      p_processEnrollCode: '04',
      p_state: 1
    };
		this.common.validateStatus(aux)
		.subscribe((resp) => {
			this.common.getPdfDragPayment(+sessionStorage.getItem('studentID'), this.periodId);
			this.router.navigate(['/matriculacion/pago-matricula']).then();
		})
  }

  signature(item: SignatureRepeat, index: number) {
    this.courseSelected = item.courseID;
    this.indexSelected = index;
    this.common.getScheduleArrastre(this.personId,this.periodId, item.courseID).subscribe({
      next: (schedule)=>{
        this.scheduleSignatureRepeat = schedule;
				//console.log('schedule', schedule);
      }
    })
  }

  cargaMateria(item: any) {
		//console.log(item)
    item['courseID'] = this.courseSelected;
    item['periodID'] = this.periodId;
    item['personID'] = this.personId;
    item['user'] = sessionStorage.getItem('name') || '';
    this.signatureRepeatList.splice(this.indexSelected, 1);
    this.scheduleSignatureRepeatSave.push(item);
    this.scheduleSignatureRepeat.splice(0, this.scheduleSignatureRepeat.length)
  }

  deleteSignature(row: any, index: number) {
    const recoverySubject = this.signatureRepeatListAux.filter((item: any) => item.courseID === row.courseID)[0];
    this.signatureRepeatList.push(recoverySubject);
    //console.log('signatureRepeatList', this.signatureRepeatList);
    this.scheduleSignatureRepeatSave.splice(index, 1);
  }

  saveCareer(item: SPGetCareer) {
    this.careerOk = item.careerName;
  }

  saveModality(item: SPGetModality) {
    this.modalidadOk = item.modalityName;
  }

  saveSeccion(item: SeccionModulo) {
    this.seccionOk = item.workingOrModuleDesc;
  }

  firstFormGroup = this.fb.group({
    firstCtrl: ['', Validators.required],
  });

  secondFormGroup = this.fb.group({
    secondCtrl: ['', Validators.required],
  });

  isLinear = false;

  savePaymentsSubjects(){
		let arr_schedules:any[]=[];
		let i;
		//console.log(this.scheduleSignatureRepeatSave);
    if(this.scheduleSignatureRepeatSave.length > 0){
      this.scheduleSignatureRepeatSave.forEach((item:any, index)=> {
				i=index+1;
        item.periodID = this.periodId;
        //item.p_paymentOptionID = this.conceptsPayments[0].conceptsPaymentID;
        //item.p_psychologicalTest = 0;
        item.user = sessionStorage.getItem('name') || '';
        item.personID = this.personId;
        let objSend = {
          	periodID: this.periodId,
            classSectionNumber: item.classSectionNumber,
            //p_paymentOptionID: Number(this.conceptsPayments[0].conceptsPaymentID),
            //p_psychologicalTest: "",//TODO: chech value
            user: sessionStorage.getItem('name') || '',
            personID: this.personId,
        }
				arr_schedules.push(objSend);
      });
			//console.log(arr_schedules)
		Swal
    .fire({
				icon: 'question',
        title: "¿Estás seguro de tomar las asignaturas de arrastre seleccionadas?",
        showCancelButton: true,
        confirmButtonText: "Si",
        cancelButtonText: "No",
				allowOutsideClick: false,
    })
    .then(result => {
			this.adminApi.postSignatureRepeat({"dynamics" : arr_schedules}).subscribe( {
				next: (resp) => {
					//console.log('resp', resp);
					this.getPaymentsArrastres();
					this.stepper.next();
				}
			})
		});
    }
		else{
			this.stepper.next();
    }
  }

	public postFailedSubjects(): void {
		Swal.fire({
				icon: 'question',
        title: "¿Estás seguro de continuar?",
        showCancelButton: true,
        confirmButtonText: "Si",
        cancelButtonText: "No",
				allowOutsideClick: false,
    })
    .then(result => {
			if(result.value){
				let array: FormArray= this.getCoursesArray();
				let flag= 0;
				for(let i=0; i<array.getRawValue().length; i++){
					if(array.controls[i].get('flgCheck').getRawValue()){
						array.controls[i].get('flgCheck').patchValue(1);
						flag++;
					}else array.controls[i].get('flgCheck').patchValue(0);
				};
				if(flag > 0){
					this.adminApi.postFailedSubjects(array.getRawValue()).subscribe( {
						next: (res) => {
							//console.log('subjects', res);
							this.paymentInfo= res.paymentOptions;
							this.failedSubjects= res.failedSubjectsPaymentConcepts;
							this.failedSubjectsTotal= 0;
							if(this.failedSubjects.length) for(let i=0; i<this.failedSubjects.length; i++){
								this.failedSubjectsTotal += +this.failedSubjects[i].totalAmount;
							};
							if(this.paymentInfo.length){
								this.paymentStep.get('paymentOption').setValidators([Validators.required]);
								this.paymentStep.get('paymentOption').updateValueAndValidity();
							};
							this.stepper.next();
						}, error: (error) => {
							//console.log(error.error.message);
							this.common.message(`${error.error.message}`, '', 'error', '#f5637e');
						}
					})
				}else this.common.message(`Debe seleccionar al menos una asignatura`, '', 'warning', '#d3996a');
			}
		});
	}

  public getPaymentsArrastres(){
    this.adminApi.getPaymentsArrastres(this.studentID).subscribe({
      next: (response) => {
        //console.log('payments',response);
        this.conceptsPayments = response;
      }, error: (error) => {
        console.log(error);
      }
    })
  }

	public getRetrieveAvailable(): void {
		this.adminApi.getRetrieveAvailable(this.periodId, this.studentID).subscribe({
			next: (res: RetrieveAvailableSchedules) => {
        //console.log('getRetrieveAvailable', res);
				if(res.alert) this.common.message(`${res.alert.message}`, '', 'warning', '#d3996a');
				this.retrieveAvailable= res.schedules;
				this.fillCoursesArray();
      }, error: (error) => {
        //console.log(error);
      }
		})
	}

	private fillCoursesArray(): void {
		if(this.retrieveAvailable.length) for(let i=0; i<this.retrieveAvailable.length; i++){
			const item= this.retrieveAvailable[i];
			this.addCoursesRow(item);
			if(item.flgDisabled) this.getCoursesArray().controls[i].disable();
		};
	}

	public verifySchedulesConflicts(): void {
		let array: FormArray= this.getCoursesArray();
		for(let i=0; i<array.getRawValue().length; i++){
			if(array.controls[i].get('flgCheck').getRawValue()) array.controls[i].get('flgCheck').patchValue(1);
			else array.controls[i].get('flgCheck').patchValue(0);
		};
		this.adminApi.verifySchedulesConflicts(array.getRawValue()).subscribe({
			next: (res) => {
        //console.log('conflicts', res);
				this.retrieveAvailable= res;
				this.initRetrieveForm();
				this.fillCoursesArray();
      }, error: (error) => {
        //console.log(error);
      }
		})
	}

}
