import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, SecurityContext, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '@environments/environment';
import { AdministrativeService } from '@services/administrative.service';
import { ApiService } from '@services/api.service';
import { CommonService } from '@services/common.service';
import { PipesModule } from 'app/pipes/pipes.module';
import * as moment from 'moment';
import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import Swal from 'sweetalert2';
import { SpinnerLoaderComponent } from '@components/spinner-loader/spinner-loader.component';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { debounceTime, firstValueFrom, Subscription } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-validate-payment',
  templateUrl: './validate-payment.component.html',
  styleUrls: ['./validate-payment.component.css'],
  standalone: true,
  imports : [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TabsModule,
    ModalModule,
    PipesModule,
		SpinnerLoaderComponent,
    MatPaginatorModule,
		MatTooltipModule,
    MatIconModule,
    MatMenuModule,
    MatSnackBarModule
  ]
})
export class ValidatePaymentComponent implements OnInit{

	public isLoading: boolean= false;
  public pageIndex: number = 1;
  public pageSize: number = 10;
  public length: number = 0;
  public pageEvent!: PageEvent;
  public pageSizeOptions: number[] = [10, 25, 50, 100];
  public selectsForm!: FormGroup;
	formInvalid: boolean = true;

  @ViewChild('viewModal', {static: false}) viewModal: ModalDirective;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

	private getPdfContentSubscription!: Subscription;
  private snackBar: MatSnackBar = inject(MatSnackBar);

  constructor(
    private fb: FormBuilder,
    private ElementRef: ElementRef,
    private Administrative: AdministrativeService,
    private API: ApiService,
    private sanitizer: DomSanitizer = inject(DomSanitizer),
    private Common: CommonService
  ) {}

  filters: any = {};

  paymentSelected: any = {};
  image: any;
  allPayments: any[] = [];
  payments: any[] = [];
  filter: any = {};
  STATIC_URI: string;
  currentDate: any;
  userID: any;
  statusFiles: any[] = [];
  sectionPeriods: any[] = [];
  statusFileSelected: any = {};

  ngOnInit(): void {
    this.userID = sessionStorage.getItem('userId');
    this.currentDate = moment().format('YYYY-MM-DD');
    this.STATIC_URI = environment.url;
    this.getSectionPeriod();
    this.initFiltersForm();
    this.selectsForm.get('startDate')?.valueChanges.subscribe((value) => {
      if (value) {
        this.selectsForm.get('endDate')?.enable();
        this.selectsForm.get('endDate')?.setValue(''); // Opcional: Reiniciar endDate al cambiar startDate
      } else {
        this.selectsForm.get('endDate')?.disable();
      }
    });
    this.selectsForm.get('text')?.valueChanges.pipe(debounceTime(800)).subscribe(value => {
      this.getCourseList();
      this.getInicializarPaginator();
    });
  }

  private initFiltersForm(): void{
    this.selectsForm = this.fb.group({
      periodSection: [0],
      statusFileID: [0],
      text: [''],
      startDate: [''],
      endDate: [{ value: '', disabled: true }],
    });
  }

  async getInicializarPaginator(){
    this.pageIndex =1
    this.paginator.firstPage();
  }

  async getSectionPeriod() {
    const currentYear = new Date().getFullYear();
    let result: any = await firstValueFrom(this.Administrative.getUnacemPeriodExtension());
    this.sectionPeriods = result;
    const foundPeriod = this.sectionPeriods.find(s => s.periodID === currentYear);
    this.selectsForm.patchValue({ periodSection: foundPeriod ? currentYear : 0 });
    this.getStatusFiles();
    this.getCourseList();
    this.getInicializarPaginator();
  }

  async getStatusFiles() {
    let result: any = await firstValueFrom(this.Administrative.getFileStatuses());
    this.statusFiles = result.filter((r: any) => r.statusFileID !== 5 && r.statusFileID !== 1 );
  }


  public getPaymentPaginator(event: PageEvent): PageEvent {
    //console.log(event);
    this.pageIndex = event.pageIndex+1;
    this.pageSize = event.pageSize;
    this.getCourseList();
    return event;
  }

  async getCourseList() {
    let body: any = {};
    // const periodSection = this.filter?.periodID ? this.filter.periodID :0;
    // const statusFileID = this.filter?.statusFileID ? this.filter.statusFileID :0;
    // const text = this.filter?.text ? this.filter.text :'';
    body ={
      periodSection: this.selectsForm.get('periodSection').value,
      statusFileID: this.selectsForm.get('statusFileID').value,
      filter: this.selectsForm.get('text').value,
      page: this.pageIndex,
      limit: this.pageSize
    }
    let result: any = await firstValueFrom(this.Administrative.getUnacemClassSectionToValidate(body));
		// console.log('getCourseList',result);
    this.allPayments = result.data;
    this.length = result.count;
    this.allPayments.map((p: any) => {
      p.statusFileID = p.statusFileID || 1;
      p.detailGrouped = [];
      let fx = (d: any) => `${d.periodID}-${d.classSectionNumber}`;
      p.itemPerClass.map((i: any) => {
        if (!p.detailGrouped.map((d: any) => fx(d)).includes(fx(i))) {
          p.detailGrouped.push({
            classSectionNumber: i.classSectionNumber,
            periodID: i.periodID,
            courseName: i.courseName,
            courseDesc: i.courseDesc,
            extensionCoursesID: i.extensionCoursesID,
            detail: JSON.parse(JSON.stringify(p.itemPerClass.filter((x: any) => x.periodID === i.periodID && x.classSectionNumber === i.classSectionNumber))),
            unitPrice: i.amount,
            totalAmount: p.itemPerClass.filter((x: any) => x.periodID === i.periodID && x.classSectionNumber === i.classSectionNumber).reduce((m: any, i: any) => {return m + (i.amount || 0);}, 0)
          });
        }
      });
    })
    // this.filteredResult();
    this.payments = this.allPayments;
  }

  async getCourseListByPeriod(){
    this.getCourseList();
    this.getInicializarPaginator();
  }
  async getCourseListByStatus(){
    this.getCourseList();
    this.getInicializarPaginator();
  }
  // async getCourseListByText(){
  //   this.getCourseList();
  //   this.getInicializarPaginator();
  // }

  // filteredResult() {
  //   if (this.filter.statusFileID) {
  //     this.payments = this.allPayments.filter((p: any) => p.itemPerClass[0].statusFileID === this.filter.statusFileID);
  //     this.statusFileSelected= this.statusFiles.find((s: any) => s.statusFileID === this.filter.statusFileID);
  //   } else {
  //     this.payments = this.allPayments;
  //   }
  // }

  async toggleViewDetail(payment?: any) {
    if (this.viewModal.isShown) {
      this.viewModal.hide();
    } else {
      this.viewModal.config.keyboard = false;
      this.viewModal.config.ignoreBackdropClick = true;
      this.viewModal.show();
      // console.log(payment)
      this.paymentSelected = payment;
			this.paymentSelected.sendEmail = true;
			this.paymentSelected.pending=payment.itemPerClass[0].statusFileID === 2
			// this.paymentSelected.unitPrice=payment.itemPerClass[0].unitPrice
      // console.log('unitPrice',payment.itemPerClass[0].unitPrice)
      // let parts = this.paymentSelected?.urlFile.split('/') || '';
      // console.log(parts)
      let parts: any[] = [];

      if (this.paymentSelected?.urlFile !== null) {
        parts = this.paymentSelected.urlFile.split('/');
      }

      let personID = parts[3];
      this.paymentSelected.personID = personID;
      // let fileBlob: any = this.paymentSelected?.urlFile !== null ? await firstValueFrom(this.API.getPersonImage(personID, this.paymentSelected.fileName)) : '';
      let fileBlob: any = '';
      if (
        this.paymentSelected?.urlFile &&
        this.paymentSelected?.fileName &&
        personID
      ) {
        try {
          fileBlob = await firstValueFrom(
            this.API.getPersonImage(personID, this.paymentSelected.fileName)
          );
        } catch (error) {
          // console.log('Error al obtener imagen del voucher:', error);
        }
      }


      if (fileBlob.size > 4) {
        const blob: Blob = new Blob([fileBlob], {type: fileBlob.type});

        this.paymentSelected.urlImage = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob)));
      }
    }
  }

  async decide(action: boolean) {
   if (!action && !this.paymentSelected.observation) {
      Swal.fire({
        text: 'Es necesario la observación para RECHAZAR el pago.',
        icon: 'error'
      });
      return;
    }

    Swal.fire({
      text: `¿Estás seguro de ${action ? 'APROBAR' : 'RECHAZAR'} el Comprobante de Pago?`,
      icon: 'question',
      allowEnterKey: false,
      confirmButtonColor: '#014898',
      allowEscapeKey: false,
      allowOutsideClick: false,
      showConfirmButton: true,
      showCancelButton: true,
      cancelButtonText: 'Cancelar'
    }).then(async (choice) => {
      if (choice.isConfirmed) {
				this.isLoading= true;
        let result: any;
        if (this.paymentSelected.itemPerClass && this.paymentSelected.itemPerClass.length) {
          for (let x = 0; x < this.paymentSelected.itemPerClass.length; x++) {
            let student: any = this.paymentSelected.itemPerClass[x];

            let flag_current: string = 'A';
            student.flag_current = flag_current;
            student.statusFileID = action ? 3 : 4;
            let body: any = {};
            student.userCreated = this.userID;
            if (!action) {
              // body.updates = [
              body.updates =
                [{
                  periodID: student.periodID,
                  classSectionNumber: student.classSectionNumber,
                  numberSequence: student.numberSequence,
                  personID: student.personID,
                  urlFile: null,
                  pathFile: null,
                  fileName: null,
                  payDay: null,
                  financialEntity: null,
                  transactionType: null,
                  numberOperation: null,
                  observation: this.paymentSelected.observation,
                  statusFileID: student.statusFileID,
                  flag_current: student.flag_current,
                  userCreated: this.userID,
                  saleID: this.paymentSelected.saleID
                }];
              // ];
            } else {
              body.updates = [student];
            }

            this.paymentSelected.statusID = action ? 3 : 2;
            this.paymentSelected.updatedBy = this.userID;

            let bodySale = {
              updates: {
                sale: [{
                  saleID: this.paymentSelected.saleID,
                  personID: this.paymentSelected.personID,
                  statusID: this.paymentSelected.statusID,
                  updatedBy: this.userID
                }],
                details: this.paymentSelected.itemPerClass.map((i: any) => {
                  return {
                    detailID: i.detailID,
                    saleID: i.saleID,
                    itemID: i.itemID,
                    statusID: this.paymentSelected.statusID,
                    updatedBy: this.userID
                  }
                })
              }
            };
            let resultUpdateSale = await firstValueFrom(this.Administrative.updateSale(bodySale));

            let bodyShoppingCartItem: any = {
              updates: this.paymentSelected.itemPerClass.map((i: any) => {
                return {
                  itemID: i.itemID,
                  cartID: i.cartID,
                  periodID: i.periodID,
                  classSectionNumber: i.classSectionNumber,
                  statusID: action ? 2 : 1,
                  buyer: i.buyer,
                  responsibleID: i.responsibleID,
                  coupon: i.coupon,
                  observation: this.paymentSelected.observation,
                  quantity: i.quantity,
                  unitPrice: i.unitPrice,
                  updateBy: this.userID
                }
              })
            }

            let resultUpdateShoppingCartItem: any = await firstValueFrom(this.Administrative.updateShoppingCartItem(bodyShoppingCartItem));

            result = await firstValueFrom(this.Administrative.updateInterestedCourse(body));
          }
        } else {
          let flag_current: string = 'A';
          this.paymentSelected.flag_current = flag_current;
          this.paymentSelected.statusFileID = action ? 3 : 4;
          let parts = this.paymentSelected.urlFile.split('/');
          let personID = parseInt(parts[3]);
          let body: any = {};
          this.paymentSelected.userCreated = this.userID;
          if (!action) {
            // body.updates = [
            body.updates =
              [{
                periodID: this.paymentSelected.periodID,
                classSectionNumber: this.paymentSelected.classSectionNumber,
                numberSequence: this.paymentSelected.numberSequence,
                personID: personID,
                urlFile: null,
                pathFile: null,
                fileName: null,
                payDay: null,
                financialEntity: null,
                transactionType: null,
                numberOperation: null,
                observation: this.paymentSelected.observation,
                statusFileID: this.paymentSelected.statusFileID,
                flag_current: this.paymentSelected.flag_current,
                userCreated: this.userID
              }];
            // ];
          } else {
            this.paymentSelected.personID = personID;
            this.paymentSelected.pathFile = this.paymentSelected.voucherPath;
            body.updates = [this.paymentSelected];
          }
          result = await firstValueFrom(this.Administrative.updateInterestedCourse(body));
        }

        if (!result) {
          Swal.fire({
            text: 'Hubo un error al validar el pago',
            icon: 'error'
          });
          return;
        }

				if (this.paymentSelected.sendEmail) {
          try {
            let bodySendEmail: any = {
              personFullName: this.paymentSelected.payerName,
              email: this.paymentSelected.email?.toLowerCase(),
              context: {
                status: action ? 'APROBADO' : 'RECHAZADO',
                observation: this.paymentSelected.observation || ''
							},
							detailGrouped: this.paymentSelected.detailGrouped || [],
							sendEmail: this.paymentSelected.sendEmail ? 1 : 0,
            }
            await this.Administrative.sendEmailInterested(bodySendEmail).toPromise();

          } catch (error) {
            console.error('Error al enviar el correo:', error);
            // Opcionalmente, puedes mostrar un mensaje al usuario
            Swal.fire({
              text: 'Los cambios se guardaron pero hubo un problema al enviar el correo',
              icon: 'warning'
            });
            this.isLoading = false;
            this.toggleViewDetail();
            this.getCourseList();
            return;
          }
        }

        // Mensaje de éxito original
        Swal.fire({
          text: 'Se guardaron los cambios',
          icon: 'success'
        });
				this.isLoading= false;
        this.toggleViewDetail();
        this.getCourseList();
      }
    })
  }

  toggleSelectPayment(course: any) {
    course.isSelected = !course.isSelected;
  }

  async report() {
    let body: any = {
      periodSection: moment(this.selectsForm.get('startDate').value).year(),
      startDate: this.selectsForm.get('startDate').value,
      endDate: this.selectsForm.get('endDate').value,
    };
    Swal.fire({
      html: '<i class="fa fa-cog fa-spin fa-3x"></i> <br> <h2 class="text-center">Generando reporte.</h2>',
      showConfirmButton: false,
      showCancelButton: false,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    });
    let result: any = await firstValueFrom(this.Administrative.getApprovedPaymentUnacemReport(body));

    const blob = new Blob([result]);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `reporte-de-validacion-de-pagos.pdf`;
    document.body.appendChild(a);
    Swal.close();
    a.click();
  }

  async mainReport() {
    let body: any = {
      periodSection: moment(this.selectsForm.get('startDate').value).year(),
      startDate: this.selectsForm.get('startDate').value,
      endDate: this.selectsForm.get('endDate').value,
    };
    Swal.fire({
      html: '<i class="fa fa-cog fa-spin fa-3x"></i> <br> <h2 class="text-center">Generando reporte.</h2>',
      showConfirmButton: false,
      showCancelButton: false,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    });
    let result: any = await firstValueFrom(this.Administrative.getMainPaymentUnacemReport(body));
    let file: any = await firstValueFrom(this.Common.getFileOfServer(result));
    const blob = new Blob([file]);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `reporte-de-general-de-pagos.xlsx`;
    document.body.appendChild(a);
    Swal.close();
    a.click();
  }

  async paymentReport() {
    try {
      let body: any = {
        periodSection: this.selectsForm.get('periodSection').value,
        statusFileID: this.selectsForm.get('statusFileID').value
      };
      Swal.fire({
        html: '<i class="fa fa-cog fa-spin fa-3x"></i> <br> <h2 class="text-center">Generando reporte.</h2>',
        showConfirmButton: false,
        showCancelButton: false,
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false
      });
      let result: any = await firstValueFrom(this.Administrative.getReportValidate(body));
      let file: any = await firstValueFrom(this.Common.getFileOfServer(result));
      const blob = new Blob([file]);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `reporte-unacem-estados.xlsx`;
      document.body.appendChild(a);
      Swal.close();
      a.click();
    } catch (error) {
      Swal.close();
    }
  }

	getStatusById(id: number) {
		return this.statusFiles.find(item => item.statusFileID === id);
	}

	public openFile(item: any): void {
		const route: string = `${environment.url}/${item.urlFile}`;
		if (this.getPdfContentSubscription) this.getPdfContentSubscription.unsubscribe();
		this.getPdfContentSubscription = this.API.getPdfContent(route).subscribe((res: HttpResponse<Blob>) => {
			if (res.body) {
				let contentType: string | null | undefined = res.headers.get('content-type');
				// Porque el tipo de variable que recibe el type es string o undefined. No recibe null.
				if (!contentType) contentType = undefined;
				const blob: Blob = new Blob([res.body], { type: contentType });
				const a = document.createElement('a');
				a.href = URL.createObjectURL(blob);
				a.download = `${item.fileName}`;
				document.body.appendChild(a);
				a.click();
			}
		});
	}

  public getGeneralReport(rute: string,fileName:string): void{
    let body: any = {
      periodSection: moment(this.selectsForm.get('startDate').value).year(),
      startDate: this.selectsForm.get('startDate').value,
      endDate: this.selectsForm.get('endDate').value,
    };
    this.Administrative.getReportInstruments(rute, body).subscribe({
      next: (res) => {
      if (res.body) {
        const contentType = res.headers.get('content-type') || undefined;

        const blob = new Blob([res.body], { type: contentType });
        const url = this.sanitizer.sanitize(
          SecurityContext.RESOURCE_URL,
          this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob))
        );
        if (url) {
          if(contentType === 'application/pdf'){
            window.open(url, '_blank');
          }else{
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();

            // Limpiar memoria
            URL.revokeObjectURL(link.href);
            document.body.removeChild(link);
          }
        }
      }
    },
    error: (err: HttpErrorResponse) => {
      // console.error('Error al obtener el reporte:', err);
      this.snackBar.open(
        `No hay datos disponibles para generar el reporte.`,
        null,
        {
          horizontalPosition: 'center',
          verticalPosition: 'top',
          duration: 4000,
          panelClass: ['red-snackbar']
        }
      );
      }
    });
  }
}
