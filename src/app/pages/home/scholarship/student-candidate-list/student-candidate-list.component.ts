import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit,SecurityContext, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministrativeService } from '@services/administrative.service';
import { ApiService } from '@services/api.service';
import { Period } from '@utils/interfaces/period.interfaces';
import { buildPagination } from 'app/constants';
import { PipesModule } from 'app/pipes/pipes.module';
import * as moment from 'moment';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import { forkJoin, map, Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { environment } from '@environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';


@Component({
  selector: 'app-student-candidate-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTooltipModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatRippleModule,
    MatMenuModule,
    MatDatepickerModule,
    MatNativeDateModule,
    PipesModule,
    ModalModule,
    BsDropdownModule,
    DatePipe
  ],
  providers: [
      DatePipe
  ],
  templateUrl: './student-candidate-list.component.html',
  styleUrls: ['./student-candidate-list.component.css'],
})
export class StudentCandidateListComponent implements OnInit{

  public periods: Array<Period> = [];
  private formBuilder: FormBuilder = inject(FormBuilder);
  public filtersForm!: FormGroup;
  public currentPeriod: any;
  public pageIndex: number = 0;
  public pageSize: number = 10;
  public length: number = 0;
  public pageSizeOptions: number[] = [5, 10, 25, 50, 100];
  public pageEvent!: PageEvent;
  private getPdfContentSubscription!: Subscription;
  private api: ApiService = inject(ApiService);
  private sanitizer: DomSanitizer = inject(DomSanitizer);
  constructor(
    private Router: Router,
    private Administrative: AdministrativeService,
    private Api: ApiService,
  ) {

  }

  @ViewChild('recordQualificationModal', {static: false}) recordQualificationModal: ModalDirective;
  @ViewChild('configScholarshipModal', {static: false}) configScholarshipModal: ModalDirective;
  @ViewChild('assignScholarshipModal', {static: false}) assignScholarshipModal: ModalDirective;
  @ViewChild('scholarshipHistoryModal', {static: false}) scholarshipHistoryModal: ModalDirective;
  @ViewChild('scholarshipActionModal', {static: false}) scholarshipActionModal: ModalDirective;
  @ViewChild('paginator', { static: true }) public paginator!: MatPaginator;

  students: any[] = [];

  studentSelected: any;
  newAction: any = {};

  newRecordQualification: any;
  recordQualification: any;
  assignStudentSelected: any;
  userID: number;
  scholarships: any[] = [];

  newAssignScholarship: any = {};
  filter: any = {};
  today: any;
  results: any[] = [];
  quotaQuantity: any;
  quotasRealizeds: any[] = [];
  quotas: any[] = [];
  assigneds: any[] = [];
  personID: number = 0;
  paymentConcepts: any[] = [];

  public ngOnChanges():void{
    this.getCurrentPeriod();
  }

  public ngOnInit() : void {
    this.userID = +sessionStorage.getItem('userId');
    this.today = moment();
    this.getCurrentPeriod();
    this.initForm();
    this.getDataFromResolver();
    // this.getStudentAssigneds();
    this.getQuotaQuantity();
    this.getPaymentConcepts();
    // this.getScholarships();
  }
  private initForm(): void {
    this.filtersForm = this.formBuilder.group({
      period: [0],
      search: [''],
    });
  }

  async getDataFromResolver() {
    this.Administrative.getPeriods().subscribe({
      next: (res) => {
        this.periods = res;
      },
      error: (err: HttpErrorResponse) => {
        console.log('Error', err);
      },
    });

  }

  public trackByPeriodId(index: number, item: Period): number {
    return item.periodID;
  }
  async getPaymentConcepts() {
    let result: any = await this.Administrative.getPaymentConcepts().toPromise();
    this.paymentConcepts = result;
  }

  async getCurrentPeriod() {
    let result: any = await this.Api.getCurrentPeriod().toPromise();
    this.currentPeriod = result.periodID;
    this.getScholarships();
    this.getStudentAssigneds();
  }

  async getQuotaQuantity() {
    let result: any = await this.Administrative.getSystemVariableByIdentifier('QUOTA_QUANTITY').toPromise();
    this.quotaQuantity = result;
    let quotaNumbers: any = buildPagination(parseFloat(this.quotaQuantity.evsaToken),1);
    quotaNumbers.map((q: any) => {
      let quotaIten: any = {
        quotaNumber: q,
      };
      this.quotas.push(quotaIten);
    })
  }

  async getScholarships() {
    let result: any = await this.Administrative.getScholarship(this.currentPeriod,0,0).toPromise();
    this.scholarships = result.data || Object.values(result);
  }

  async getStudentAssigneds() {
    try {
      let periodID = this.filtersForm.get('period')?.value;
      let search = this.filtersForm.get('search')?.value?.trim()?.toUpperCase();

      if (periodID === null || periodID === undefined) {
          periodID = this.currentPeriod;
      }

      if (periodID === "") {
          periodID = 0;
      }
      let result: any = await this.Administrative.getScholarshipAssignStudentsByPeriodIDPagination(periodID,search, this.pageIndex + 1, this.pageSize).toPromise();
      //console.log(result);
      this.students = result.data;
      this.length = result.count;
      this.students.map((s: any) => {
        s.available = false;
        if (!s.recordQualification.length) {
          s.available = false;
        } else {
          // console.log(s.recordQualification);
          // console.log(s.recordQualification.find((r: any) => moment().isBetween(moment(r.startDate), moment(r.endDate), 'days', '[]')));
          if (s.recordQualification.find((r: any) => moment().isBetween(moment(r.startDate), moment(r.endDate), 'days', '[]'))) {
            s.available = true;
          } else {
            s.available = false;
          }
        }
        s.hasConfig = s.scholarshipConfig.length > 0;
        // console.log(s);
      });
      // this.students.sort((a: any, b: any) => b.assignStudentID- a.assignStudentID);
    } catch (error) {
      console.log(error)
    }
  }

  seeDetail(student: any) {
    this.Router.navigate([`/beca/asignacion-de-beneficio-a-estudiante/${student.scholarshipID}/${student.studentID}`]);
  }

  toggleRecordQualification(student?: any) {
    if (this.recordQualificationModal.isShown) {
      this.recordQualificationModal.hide();
    } else {
      this.recordQualificationModal.config.keyboard = false;
      this.recordQualificationModal.config.ignoreBackdropClick = true;
      this.recordQualificationModal.show();
      this.assignStudentSelected = student;
      this.getRecordQualificationByAssignStudent(false);
    }
  }

  async getRecordQualificationByAssignStudent(createObject: boolean = false) {
    let result: any = await this.Administrative.getRecordQualificationByAssignStudentID(this.assignStudentSelected.assignStudentID).toPromise();
    if (!result) {
      this.toggleRecordQualification();
      Swal.fire({
        text: 'No se asigno la beca a este estudiante. 1ro asigné la beca para poder HABILITAR LA FICHA. \n¿Desea asignar la Beca al Estudiante?',
        icon: 'question',
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
        showConfirmButton: true,
        showCancelButton: true
      }).then(async (choice) => {
        if (choice.isConfirmed) {
          let body: any = {
            news: [
              {
                requestID: this.assignStudentSelected.messageManagementID,
                scholarshipID: this.assignStudentSelected.scholarshipID,
                statusID: 1,
                userCreated: this.userID
              }
            ]
          };
          let result: any = await this.Administrative.saveScholarshipAssignStudents(body).toPromise();
          if (!result) {
            Swal.fire({
              text: 'Hubo un error al asignar la Beca',
              icon: 'error'
            });
            return;
          }
          Swal.fire({
            text: 'Se asignó la Beca.',
            icon: 'success',
            allowEscapeKey: false,
            allowEnterKey: false,
            allowOutsideClick: false,
            showConfirmButton: true,
            showCancelButton: true
          }).then(async (choice) => {
            if (choice.isConfirmed) {
              this.toggleRecordQualification();
            }
          })
        }
      })
    } else {
      result.map((r: any, i: number) => {
        r.intentNumber = i + 1;
      });
      this.assignStudentSelected.details = result;
      if (createObject) {
        this.newRecordQualification = {
          assignStudentID: this.assignStudentSelected.assignStudentID,
          intentNumber: this.assignStudentSelected.details.length + 1
        };
      }

    }
  }

  toggleAddRecordQualification(recordQualification?: any) {
    if (this.newRecordQualification) {
      this.newRecordQualification = undefined;
    } else {
      this.newRecordQualification = {
        assignStudentID: this.assignStudentSelected.assignStudentID,
        intentNumber: this.assignStudentSelected.details.length + 1
      };
      if (recordQualification) {
        this.newRecordQualification = recordQualification;
        this.newRecordQualification.editing = true;
      }
    }
  }

  saveRecordQualification() {
    Swal.fire({
      text: '¿Estás seguro de guardar los cambios?',
      icon: 'question',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      showCancelButton: true,
      showConfirmButton: true
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        this.newRecordQualification.statusID = 1;
        this.newRecordQualification.userCreated = this.userID;
        let body: any = {};
        let result: any;
        if (!this.newRecordQualification.editing) {
          body.news = [this.newRecordQualification];
          result = await this.Administrative.saveSocioeconomicRecordQualification(body).toPromise();
        } else {
          body.updates = [this.newRecordQualification];
          result = await this.Administrative.updateSocioeconomicRecordQualification(body).toPromise();
        }
        if (!result) {
          Swal.fire({
            text: 'Hubo un problema al habilitar la ficha',
            icon: 'error'
          });
          return;
        }
        Swal.fire({
          text: 'Se guardaron los cambios correctamente',
          icon: 'success'
        });
        this.toggleAddRecordQualification();
        this.getRecordQualificationByAssignStudent(false);

      }
    })
  }

  toggleAssignScholarship() {
    if (this.assignScholarshipModal.isShown) {
      this.assignScholarshipModal.hide();
    } else {
      this.assignScholarshipModal.config.keyboard = false;
      this.assignScholarshipModal.config.ignoreBackdropClick = true;
      this.assignScholarshipModal.show();
      // this.getStudentCandidates();
      this.newAssignScholarship = {};
			this.filter= {};
			this.results= [];
    }
  }

  // async getStudentCandidates() {
    //   let result: any = await this.Administrative.getScholarshipStudentCandidateByFilter(this.filter).toPromise();
    //   console.log(result);
    //   this.results = result;
    // }

    toggleSelectStudent(student: any) {
      student.selected = !student.selected;
      this.verifySelectionOfStudent();
    }

    verifySelectionOfStudent() {
      this.newAssignScholarship.existsStudentSelected = this.results
    }


    async searchStudent() {
      this.filter.searching = true;
      let result: any = await this.Administrative.getScholarshipStudentCandidateByFilter(this.filter).toPromise();
      this.filter.searched = true;
      this.filter.searching = false;
      this.results = result.filter((r: any) => !this.scholarships.map((s: any) => s.studentID).includes(r.studentID));
    }

    assignScholarship() {
      Swal.fire({
        text: '¿Estas seguro de Asignar la Beca?',
        icon: 'question',
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
        showConfirmButton: true,
        showCancelButton: true
      }).then(async (choice) => {
        if (choice.isConfirmed) {
          let body: any = {
            news: this.results.filter((r: any) => r.selected).map((r: any) => {
              return {
                requestID: r.studentID,
                studentID: r.studentID,
                scholarshipID: this.newAssignScholarship.scholarshipID
              }
            })
          };
          let result: any = await this.Administrative.saveScholarshipAssignStudents(body).toPromise();
          if (!result) {
            Swal.fire({
              text: 'No se pudo asignar la Beca',
              icon: 'error'
            });
            return;
          }
          Swal.fire({
            text: 'Se guardaron los cambios.',
            icon: 'success'
          });
          this.toggleAssignScholarship();
          this.getStudentAssigneds();
        }
      })
    }

    toggleGoToSheet(student: any) {
      this.Router.navigate([`/beca/ficha-informativa-para-beca/${student.assignStudentID}/${student.studentID}`])
    }

    toggleConfigScholarship(student?: any) {
      if (this.configScholarshipModal.isShown) {
        this.configScholarshipModal.hide();
      } else {
        this.configScholarshipModal.config.keyboard = false;
        this.configScholarshipModal.config.ignoreBackdropClick = true;
        this.configScholarshipModal.show();
        this.assignStudentSelected = student;
        this.assignStudentSelected.discountPercentage = parseFloat(this.assignStudentSelected.discountPercentage || '0');
        this.assignStudentSelected.discountPercentageWork = this.assignStudentSelected.discountPercentage;
        this.assignStudentSelected.assignDiscount = 0;
        // console.log(this.assignStudentSelected);
        this.getPaymentInfoOfStudent();
      }
    }

    async getPaymentInfoOfStudent() {
      this.quotas = [];
      // console.log(this.currentPeriod);
      let resultPaymentRealizeds: any = await this.Administrative.getFileByStudentIDAndStatusFileID(this.assignStudentSelected.studentID, 1, 3, this.currentPeriod).toPromise();
      //console.log(resultPaymentRealizeds);
      if (resultPaymentRealizeds.length === 1) {
        let result: any = await this.Administrative.getScholarshipPaymentInfoByStudentIDAndPeriodID(this.assignStudentSelected.studentID, this.currentPeriod).toPromise();
        // console.log(result);
        if (!result) {
          Swal.fire({
            text: 'No tienes configurado ningun concepto de pago para el Periodo Academico actual',
            icon: 'error'
          });
          return;
        }
        this.assignStudentSelected.paymentInfo = result;

        let resultPaymentOption: any = await this.Administrative.getScholarshipPaymentOptionByID(this.assignStudentSelected.paymentInfo.paymentOptionID).toPromise();
        // console.log(resultPaymentOption);
        this.assignStudentSelected.paymentOption = resultPaymentOption;

        this.quotas = resultPaymentRealizeds;
        this.quotas.map((q: any) => {
          q.amount = parseFloat(q.amount || '0');
          q.assignAmount = q.amount;
          q.initial = true;
          q.conceptsPaymentDesc = 'MAT + C001'
        });
        let resultQuotas: any = await this.Administrative.getScholarshipQuotasByPaymentOption(this.assignStudentSelected.paymentInfo.paymentOptionID).toPromise();
        // console.log(resultQuotas);
        let quotas: any = resultQuotas;
        quotas.map((q: any) => {
          q.amount = parseFloat(q.amount || '0');
          q.assignAmount = q.amount;
          q.assignPercent = 0;
          q.quotaAmount = parseFloat((q.assignAmount - (q.assignAmount * ((q.assignPercent || 0) / 100))).toFixed(2));
        });
        this.assignStudentSelected.charge = quotas.reduce((m: number, i: any) => { return m + (i.amount || 0)}, 0);
        this.assignStudentSelected.rest = this.assignStudentSelected.charge - this.quotas.reduce((m, i) => { return m + i.amount}, 0);
        this.assignStudentSelected.discount = (this.assignStudentSelected.charge * this.assignStudentSelected.discountPercentage / 100);
        this.assignStudentSelected.totalPayment = this.assignStudentSelected.rest - this.assignStudentSelected.discount;
      } else {
        Swal.fire({
          text: 'Tu ya realizaste el pago de todas las cuotas',
          icon: 'warning'
        });
        this.toggleConfigScholarship();
      }

    }

    toggleQuota(quota: any, action: boolean = false) {
      quota.disableMinus = false;
      quota.disablePlus = false;
      if (action) {
        // aumentar
        if (this.assignStudentSelected.assignDiscount >= this.assignStudentSelected.discountPercentage) {
          quota.disablePlus = true;
          return;
        } else {
          quota.assignPercent = (quota.assignPercent || 0) + 1;
        }
      } else {
        // disminuir
        if (quota.assignPercent === 0) {
          quota.disableMinus = true;
          return;
        } else {
          quota.assignPercent --;
        }
      }
      quota.quotaAmount = parseFloat((quota.assignAmount - (quota.assignAmount * (quota.assignPercent / 100))).toFixed(2));
      this.validatePercent();

    }

    validatePercent() {
      this.assignStudentSelected.assignDiscount = this.quotas.reduce((m: number, i: any) => { return m + (i.assignPercent || 0); }, 0);
    }

    saveConfigQuota() {
      Swal.fire({
        text: '¿Estas seguro de guardar la configuración de Cuotas del estudiante?',
        icon: 'question',
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
        showCancelButton: true,
        showConfirmButton: true
      }).then(async (choice) => {
        if (choice.isConfirmed) {
          console.log(this.quotas);
          let body: any = {
            news: this.quotas.filter((q: any) => !q.initial).map((q: any) => {
              return {
                assignStudentID: this.assignStudentSelected.assignStudentID,
                quotaNumber: q.conceptsID,
                quotaAmount: q.quotaAmount,
                conceptsID: q.conceptsID,
                conceptsPaymentDesc: q.conceptsPaymentDesc,
                periodID: q.periodID,
                personID: q.personID,
                studentID: q.studentID
              };
            })
          }
          let result: any = await this.Administrative.saveAssignScholarshipStudentDetail(body).toPromise();
          if (!result) {
            Swal.fire({
              text: 'Hubo un error al momento de guardar la configuración',
              icon: 'error'
            });
            return;
          }
          Swal.fire({
            text: 'Se guardaron los cambios correctamente la configuración',
            icon: 'success'
          });
          this.toggleConfigScholarship();
          this.getStudentAssigneds();
        }
      })
    }

    async toggleScholarshipHistory(student?: any) {
      this.assigneds = [];
      if (this.scholarshipHistoryModal.isShown) {
        this.scholarshipHistoryModal.hide();
      } else {
        this.scholarshipHistoryModal.config.keyboard = false;
        this.scholarshipHistoryModal.config.ignoreBackdropClick = true;
        this.scholarshipHistoryModal.show();
        this.assignStudentSelected = student;
        this.assignStudentSelected.discountPercentage = parseFloat(this.assignStudentSelected.discountPercentage || '0');
        this.assignStudentSelected.discountPercentageWork = this.assignStudentSelected.discountPercentage;
        this.assignStudentSelected.assignDiscount = 0;
        let resultAssignScholarship: any = await this.Administrative.getStudentInfoToScholarshipAssign(student.studentID).toPromise();
        // console.log(resultAssignScholarship);
        this.assigneds = resultAssignScholarship
      }
    }

    async toggleScholarshipAction(student?: any, action: boolean = false) {
      this.assigneds = [];
      if (this.scholarshipActionModal.isShown) {
        this.scholarshipActionModal.hide();
      } else {
        this.scholarshipActionModal.config.keyboard = false;
        this.scholarshipActionModal.config.ignoreBackdropClick = true;
        this.scholarshipActionModal.show();
        this.assignStudentSelected = student;
        this.assignStudentSelected.action = action;
        this.newAction = {};
        let resultAssignScholarship: any = await this.Administrative.getStudentInfoToScholarshipAssign(student.studentID).toPromise();
        // console.log(resultAssignScholarship);
        this.assignStudentSelected.currentAssign = resultAssignScholarship.find((r: any) => r.assignStudentID === this.assignStudentSelected.assignStudentID);
      }
    }

    scholarshipAction() {
      Swal.fire({
        text: `¿Estás seguro de ${this.assignStudentSelected.action ? 'Renovar' : 'Rechazar'} la asignación de la Beca?`,
        icon: 'question',
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
        showCancelButton: true,
        showConfirmButton: true
      }).then( async (choice) => {
        if (choice.isConfirmed) {
          this.assignStudentSelected.additionalFields.obs = this.assignStudentSelected.additionalFields.obs || [];
          let object: any = {
            assignStudentID: this.assignStudentSelected.assignStudentID,
            requestID: `${this.assignStudentSelected.studentID}`,
            scholarshipID: this.assignStudentSelected.scholarshipID,
            additionalFields: this.assignStudentSelected.additionalFields,
            statusID: this.assignStudentSelected.statusID,
            userUpdated: this.userID
          };
          this.assignStudentSelected.additionalFields.obs.push({obs: this.newAction.obs});
          object.statusID = this.assignStudentSelected.action ? 1 : 0;
          let body: any = {
            updates: [object]
          };
          let result: any = await this.Administrative.updateAssignScholarshipStudent(body).toPromise();
          if (!result) {
            Swal.fire({
              text: 'Hubo un problema al realizar la acción',
              icon: 'error'
            });
            return;
          }
          Swal.fire({
            text: `Se ${this.assignStudentSelected.action ? 'Renovó' : 'Rechazó'} la asignación de la Beca`,
            icon: 'success'
          });
          this.getStudentAssigneds();
          this.toggleScholarshipAction();
        }
      })

    }


    async downloadSheetPDF(student: any) {
      let file: any = await this.Administrative.getScholarshipSheetPDF(this.currentPeriod, student.personID, student.studentID).toPromise();
      // console.log(file);
      const blob = new Blob([file]);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `ficha-de-asignacion-de-beca-${student.personDocumentNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
    }

    addQuota(quota?: any) {
      if (quota) {
        this.quotas.splice(this.quotas.indexOf(quota), 1);
      } else {
        let quotaNumber = this.quotasRealizeds.length + this.quotas.length + 1;
        let quotaNumberLetter = quotaNumber.toString().padStart(3,'0');
        let conceptsPaymentDesc = `C${quotaNumberLetter}`;
        let conceptSelected = this.paymentConcepts.find((p: any) => p.conceptsID === conceptsPaymentDesc);
        let conceptsID = 12;
        if (conceptSelected) {
          conceptsID = conceptSelected.conceptsPaymentID;
        }
        this.quotas.push({
          quotaNumber: quotaNumber,
          conceptsPaymentDesc: conceptsPaymentDesc,
          conceptsID: conceptsID,
          personID: this.assignStudentSelected.personID,
          periodID: this.currentPeriod,
          studentID: this.assignStudentSelected.studentID
        });
      }
      this.calculateQuotas();
    }

    calculateQuotas() {
      this.quotas.filter((q: any) => !q.initial).map((q: any) => {
        q.assignAmount = parseFloat(((this.assignStudentSelected.totalPayment / (this.quotas.filter((q: any) => !q.initial).length)) + 0.005).toFixed(2));
        q.quotaAmount = q.assignAmount;
      });
    }
    public getStudentsDetailFromPaginator(event: PageEvent): PageEvent {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.getStudentAssigneds();
        return event;
    }
    public buildReport(relativeRoute: string): void {
      let periodID = this.filtersForm.get('period')?.value;

      if (periodID === null || periodID === undefined) {
          periodID = this.currentPeriod;
      }

      if (periodID === "") {
          periodID = 0;
      }
      const route: string = `${environment.url}/api/${relativeRoute}/${periodID}`;
      if (this.getPdfContentSubscription) this.getPdfContentSubscription.unsubscribe();
      this.getPdfContentSubscription = this.api.getPdfContent(route).subscribe((res: HttpResponse<Blob>) => {
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
