import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdministrativeService } from '@services/administrative.service';
import { RECORD_NUMBERS, WEEK } from 'app/constants';
import { FilterPipe } from 'app/pipes/filter.pipe';
import { PipesModule } from 'app/pipes/pipes.module';
import * as moment from 'moment';
import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HeaderComponent } from '@shared/header/header.component';
import { Router } from '@angular/router';
import { ShoppingCartService } from '@services/shoppingCart.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-academic-offer',
  templateUrl: './academic-offer.component.html',
  styleUrls: ['./academic-offer.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    PipesModule,
		MatTooltipModule
  ],
  providers: []
})
export class AcademicOfferComponent implements OnInit {

  constructor(
    private Administrative: AdministrativeService,
    private ElementRef: ElementRef,
    private Router: Router,
		private cartService: ShoppingCartService
  ) {

  }

  @ViewChild('paymentModal', {static: false}) paymentModal: ModalDirective;
  @ViewChild('enrollInBulkModal', {static: false}) enrollInBulkModal: ModalDirective;
  @ViewChild('selectEntityModal', {static: false}) selectEntityModal: ModalDirective;

  body: any = {
    filter: {},
    pagination: {}
  };

  recordNumbers: number[] = RECORD_NUMBERS;
  result: any = [];
  weeks: any[] = WEEK;
  tabs: any[] = [];
  history: any[] = [];
  tabSelected: any;
  personID: any;
  userID: any;
  searching: boolean = false;
  newPayment: any = {};
  financialEntities: any[] = [];
  transactionTypes: any[] = [];
  collaborators: any[] = [];
  entities: any[] = [];
  entitySelected: any;
  isResponsible: boolean = false;
  enrolling: boolean = false;
  currentDate: any;
  enrollCollaborators: any = {};
  selectedAllCollaborators: boolean = false;
  shoppingCart: any = {};
	private cartState: boolean;
	private isResponsable: number= null;

  async ngOnInit() {
    this.currentDate = moment().format('YYYY-MM-DD');
    this.personID = sessionStorage.getItem('personID');
		this.getUnacemResponsable();
    let result: any = await this.Administrative.getShoppingCartByPerson(this.personID).toPromise();
    this.shoppingCart = result[0];
    let resultItems: any = await this.Administrative.getShoppingCartItemByCartID(this.shoppingCart.cartID).toPromise();
    this.shoppingCart.detail = resultItems.filter((i: any) => i.statusID !== 0);
    this.userID = sessionStorage.getItem('userId');
    this.body.pagination.recordNumber = 10000;
    this.tabs = [
      { id: 1, icon: 'fa fa-list-alt', name: 'Todos', title: 'Oferta Académica' },
      { id: 2, icon: 'fa fa-bookmark', name: 'Inscritos', title: 'Revisa tus Cursos inscritos', hideSearch: true },
      // { id: 3, icon: 'fa fa-bookmark', name: 'Historial', title: 'Revisa tu Historial de Cursos', hideSearch: true },
    ];

    let resultValidation: any = await this.Administrative.getContractorResponsibleMainByUserID(this.userID).toPromise();
    this.entities = resultValidation;
    // if (this.entities.length > 1) {
    //console.log(this.entities);
    if (this.entities.length) {
      this.isResponsible = true;
      if (this.entities.length === 1) {
        this.toggleSelectEntity(this.entities[0]);
        if (this.entities[0].isASolePropietor) {
          this.getCourseListOfPerson();
        } else {
          this.getCourseOfResponsible();
        }
      } else {
        this.toggleEntityModal();
        this.getCourseOfResponsible();
      }
    } else {
      this.getCourseListOfPerson();
    }

    this.selectTab(this.tabs[0]);
    // this.getHistory();
    this.getFinancialEntities();
    this.getTransactionTypes();
  }

  async checkshoppingCart(){
    this.personID = sessionStorage.getItem('personID');
    let result: any = await this.Administrative.getShoppingCartByPerson(this.personID).toPromise();
    this.shoppingCart = result[0];
    let resultItems: any = await this.Administrative.getShoppingCartItemByCartID(this.shoppingCart.cartID).toPromise();
    this.shoppingCart.detail = resultItems.filter((i: any) => i.statusID !== 0);
  }

  toggleEntityModal() {
    if (this.selectEntityModal.isShown) {
      this.selectEntityModal.hide();
      if (this.entitySelected) {
        this.getCollaboratorsOfEntity();
      }
    } else {
      this.selectEntityModal.config.keyboard = false;
      this.selectEntityModal.config.ignoreBackdropClick = true;
      this.selectEntityModal.show();
    }
  }

  async getCollaboratorsOfEntity() {
    let result: any = await this.Administrative.getContractorCollaboratorByContractorID(this.entitySelected.contractorID).toPromise();
    this.collaborators = result;
  }

  toggleSelectEntity(e: any) {
    //console.log('aqui llego');
    this.entities.map((r: any) => {
      r.isSelected = false;
    });
    e.isSelected = !e.isSelected;
    this.validateEntitySelected();
  }

  validateEntitySelected() {
    this.entitySelected = this.entities.find((e: any) => e.isSelected);
    //console.log(this.entitySelected);
    this.getCollaboratorsOfEntity();
  }

  async getFinancialEntities() {
    let result: any = await this.Administrative.getFinancialEntities().toPromise();
    this.financialEntities = result;
  }

  async getTransactionTypes() {
    let result: any = await this.Administrative.getTransactionTypes().toPromise();
    this.transactionTypes = result;
  }

  async getCourseOfResponsible() {
    this.history = [];
    let result: any = await this.Administrative.getUnacemClassSectionByResponsible(this.entitySelected.responsibleID).toPromise();
    this.history = result;
    if(this.shoppingCart.detail){
      this.history.map((r: any) => {
        let saleSelected = this.shoppingCart.detail.filter((d: any) => d.statusID === 1).find((d: any) => d.periodID === r.periodID && d.classSectionNumber === r.classSectionNumber);
        if (saleSelected) {
          r.inShoppingCart = true;
          r.itemDetail = saleSelected;
        } else {
          r.inShoppingCart = false;
        }

        let salePayed: any = this.shoppingCart.detail.filter((d: any) => d.statusID === 2).find((d: any) => d.periodID === r.periodID && d.classSectionNumber === r.classSectionNumber);
        // console.log(salePayed);
        if (salePayed) {
          // console.log(this.shoppingCart.detail);
          r.isPayed = true;
          r.isValidated = salePayed.statusID === 2;
        }
      });
      this.getCourseListQuantity();
    }
  }

  async getPrueba(){
    // this.checkshoppingCart();
    // console.log(this.result)
  }

  async getCourseListOfPerson() {
    try {
      this.history = [];
      let result: any = await lastValueFrom(this.Administrative.getUnacemClassSectionByPerson(this.personID));

      if (!result || !Array.isArray(result)) {
        // console.log('Error: Respuesta inesperada de la API', result);
        return;
      }

      this.history = result.map((r: any) => {
        let saleSelected = (this.shoppingCart?.detail ?? []).some(
          (d: any) => d.statusID === 1 && d.periodID === r.periodID && d.classSectionNumber === r.classSectionNumber
        );
        r.inShoppingCart = saleSelected;
        r.itemDetail = saleSelected ? this.shoppingCart.detail : [];
        let salePayed = (this.shoppingCart?.detail ?? []).find(
          (d: any) => d.statusID === 2 && d.periodID === r.periodID && d.classSectionNumber === r.classSectionNumber
        );

        if (salePayed) {
          r.isPayed = true;
          r.isValidated = salePayed.statusID === 2;
        }

        return r;
      });
      this.getCourseListQuantity();
    } catch (error) {
      console.log('Error en getCourseListOfPerson:', error);
    }
  }


  // async getHistory() {
  //   let result: any = await this.Administrative.getCourseListByPerson(this.personID).toPromise();
  //   // let result: any = await this.Administrative.getHistoryByPerson(this.personID).toPromise();
  //   console.log(result);
  //   this.history = result;
  //   this.body.searching = false;
  //   this.getCourseListQuantity();
  // }

  selectTab(item: any) {
    this.tabSelected = item;
    switch (this.tabSelected.id) {
      case 1:
        this.checkshoppingCart();
        this.getCourseListQuantity();
        break;
      case 2:
        this.body.searching = false;
        this.result = this.history;
        break;
      // case 3:
      //   this.body.searching = false;
      //   this.result = this.history;
      //   break;
      default:
    }
  }

  async getCourseListQuantity() {
    this.body.searching = true;
    let result: any = await this.Administrative.getCourseListQuantityByFilter(this.body).toPromise();
    this.body.pagination.totalRecords = result.quantity;
    if (this.body.pagination.totalRecords) {
      this.body.pagination.currentPage = 1;
      this.getCourseList();
    } else {
      this.result = [];
      this.body.searching = false;
    }
  }

  async getCourseList() {
    let result: any = await this.Administrative.getCourseListByFilterAndPagination(this.body).toPromise();
    //console.log('getCourseList', result);
    // this.result = result;
    // Eliminar curso que ya esta inscrito
    let filterFx = (h: any) => `${h.periodID}/${h.classSectionNumber}/${h.extensionCoursesID}/${h.startDate}/${h.endDate}`;

    let ids: any = [...new Set(this.history.map((h: any) => filterFx(h)))];
    //console.log(ids);
    //console.log(result.filter((r: any) => !ids.includes(filterFx(r))));
    if(!this.isResponsable) result = result.filter((r: any) => !ids.includes(filterFx(r)));
    //console.log(result);
    // return;
    let courses: any[] = [];
    result.map((r: any) => {
      if (!courses.map((c: any) => filterFx(c)).includes(filterFx(r))) {
        courses.push(r);
      }
    });
    //console.log('courses', courses, this.shoppingCart.detail);
    if(this.shoppingCart.detail) courses.map((r: any) => {
      let saleSelected = this.shoppingCart.detail.filter((d: any) => d.statusID === 1).find((d: any) => d.periodID === r.periodID && d.classSectionNumber === r.classSectionNumber);
      if (saleSelected) {
        r.inShoppingCart = true;
        r.itemDetail = saleSelected;
      } else {
        r.inShoppingCart = false;
      }

      let salePayed: any = this.shoppingCart.detail.filter((d: any) => d.statusID === 2).find((d: any) => d.periodID === r.periodID && d.classSectionNumber === r.classSectionNumber);
      if (salePayed) {
        r.isPayed = true;
      }
    })
		//console.log(this.result);
    this.result = courses;
  }

  toggleToShoppingCart(course: any) {
    if (Array.isArray(course.itemDetail) && course.itemDetail.length > 0 && Array.isArray(course.itemDetail[0])) {
      course.itemDetail = course.itemDetail[0];
    } else if (Array.isArray(course.itemDetail) && course.itemDetail.length === 1) {
        course.itemDetail = course.itemDetail[0];
    }
    Swal.fire({
      text: `¿Estás seguro de ${!course.inShoppingCart ? 'AGREGAR al' : 'QUITAR DEL'} carrito el curso?`,
      icon: 'question',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      showConfirmButton: true,
      confirmButtonColor: '#014898',
      showCancelButton: true,
      cancelButtonText: 'Cancelar'
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        let body: any = {};
        let result: any;
        if (!course.inShoppingCart) {
          body = {
            news: [
              {
                cartID: this.shoppingCart.cartID,
                periodID: course.periodID,
                classSectionNumber: course.classSectionNumber,
                statusID: 1,
                buyer: this.personID,
                responsibleID: this.entitySelected && this.entitySelected.isResponsible ? this.entitySelected.responsibleID : null,
                coupon: null,
                observation: null,
                quantity: 1,
                unitPrice: course.cost,
                createBy: this.personID
              }
            ]
          };
          result = await this.Administrative.saveShoppingCartItem(body).toPromise();
					if(result) setTimeout(() => {
						this.cartService.cartState.next(true);
					}, 500);
          course.itemDetail = result;
        } else {
          course.itemDetail.statusID = 0;
          body.updates = [course.itemDetail];
          let result: any = await this.Administrative.updateShoppingCartItem(body).toPromise();
					this.getCourseListQuantity();
					if(result) setTimeout(() => {
						this.cartService.cartState.next(true);
					}, 500);
          course.itemDetail = undefined;
        }
        course.inShoppingCart = !course.inShoppingCart;
      }
    });
  }

  enroll(course: any) {
    if (this.isResponsible && !this.entitySelected.isASolePropietor) {
      this.enrollCollaborators.course = course;
      this.enrollCollaborators.quantitySelecteds = 0;
      this.toggleEnrollInBulkModal();
    } else {
      Swal.fire({
        text: '¿Estás seguro de inscribirte al Curso?',
        icon: 'question',
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
        showConfirmButton: true,
        confirmButtonColor: '#014898',
        showCancelButton: true,
        cancelButtonText: 'Cancelar'
      }).then(async (choice) => {
        if (choice.isConfirmed) {
          let body: any = {
            newEnroll: {
              periodID: course.periodID,
              classSectionNumber: course.classSectionNumber,
              personID: this.personID,
              userCreated: this.userID
            }
          };

          let result: any = await this.Administrative.newEnrollOfInterestedCourse(body).toPromise();
          if (!result) {
            Swal.fire({
              text: 'Hubo un problema en la matricula del curso',
              icon: 'success'
            });
            return;
          }
          Swal.fire({
            text: 'Te inscribiste correctamente al curso',
            icon: 'success'
          });
          this.getCourseListOfPerson();
        }
      });
    }
  }

  toggleEnrollInBulkModal() {
    if (this.enrollInBulkModal.isShown) {
      this.enrollInBulkModal.hide();
    } else {
      this.enrollInBulkModal.config.keyboard = false;
      this.enrollInBulkModal.config.ignoreBackdropClick = true;
      this.enrollInBulkModal.show();
    }
  }

  enrollInBulk() {
    Swal.fire({
      text: `¿Estás seguro de inscribir al Curso a los ${this.enrollCollaborators.quantitySelecteds} colaboradores?`,
      icon: 'question',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      showConfirmButton: true,
      confirmButtonColor: '#014898',
      showCancelButton: true,
      cancelButtonText: 'Cancelar'
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        this.enrolling = true;
        let inserteds: any = this.collaborators.filter((c: any) => c.isSelected);
        let body: any = {
          news: inserteds.map((i: any) => {
            return {
              periodID: this.enrollCollaborators.course.periodID,
              classSectionNumber: this.enrollCollaborators.course.classSectionNumber,
              personID: i.personID,
              responsibleID: this.entitySelected.responsibleID,
              userCreated: this.entitySelected.responsibleID,
            }
          })
        };
        // for (let x = 0; x < inserteds.length; x++) {
        //   let person = inserteds[x];
        //   let body: any = {
        //     newEnroll: {
        //       periodID: this.enrollCollaborators.course.periodID,
        //       classSectionNumber: this.enrollCollaborators.course.classSectionNumber,
        //       personID: person.personID,
        //       userCreated: person.userID,
        //       responsibleID: this.entitySelected.responsibleID
        //     }
        //   };

        // }
        let result: any = await this.Administrative.newEnrollInBulkOfInterestedCourse(body).toPromise();
        if (!result) {
          Swal.fire({
            text: 'Hubo un problema en la matricula del curso',
            icon: 'success'
          });
          return;
        }
        Swal.fire({
          text: 'Se inscribieron correctamente al curso',
          icon: 'success'
        });
        this.enrolling = false;
        this.toggleEnrollInBulkModal();
        this.getCourseOfResponsible();
      }
    })
  }

  togglePayment(payment?: any) {
    if (this.paymentModal.isShown) {
      this.paymentModal.hide();
    } else {
      this.Router.navigate(['/ventas/carrito-de-compras/', this.shoppingCart.cartID])
      // this.paymentModal.config.keyboard = false;
      // this.paymentModal.config.ignoreBackdropClick = true;
      // if (payment) {
      //   this.newPayment = payment;
      // }
      // console.log(this.newPayment);
      // this.paymentModal.show();
    }
  }

  toggleSelected(collaborator: any) {
    collaborator.isSelected = !collaborator.isSelected;
    this.enrollCollaborators.quantitySelecteds = this.collaborators.filter((c: any) => c.isSelected).length;
    this.selectedAllCollaborators = this.collaborators.every((c: any) => c.isSelected);
  }

  toggleSelectedAllCollaborators() {
    this.selectedAllCollaborators = !this.selectedAllCollaborators;
    this.collaborators.map((c: any) => {
      c.isSelected = this.selectedAllCollaborators;
    });
  }


  async saveChanges() {
    let bodyVoucher = {
      financialEntity: this.newPayment.financialEntityID,
      numberOperation: this.newPayment.voucherNumber
    };

    let resultVoucher: any = await this.Administrative.getValidateVoucher(bodyVoucher).toPromise();
    if (!resultVoucher.validate) {
      Swal.fire({
        text: 'Ya existe un Voucher con esos datos. Verifique',
        icon: 'error'
      });
      return;
    }
    Swal.fire({
      text: '¿Estás seguro de enviar el archivo de pago para su validación?',
      icon: 'question',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: '#014898',
      showConfirmButton: true,
      cancelButtonText: 'Cancelar'
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        let body: any = {
          updates: []
        };
        if (this.entitySelected && !this.entitySelected.isASolePropietor) {
          let imageData: any = {};
          const file: HTMLInputElement = this.ElementRef.nativeElement.querySelector(`#new-file`)
          let fileCount: number = file.files.length;
          let formData = new FormData();
          if (fileCount > 0) {
            formData.append('file', file.files.item(0));
            let data: any = await this.Administrative.uploadFileByEntityAndFileType(1, 'images', formData, this.personID).toPromise();
            //console.log(data);
            imageData.urlFile = data.urlFile;
            imageData.pathFile = data.pathFile;
            imageData.filename = data.filename;
            imageData.fileName = data.filename;
          }
          for (let x = 0; x < this.newPayment.students.length; x++) {
            let student = this.newPayment.students[x];
            let newPay: any = {};
            //console.log(this.newPayment);
            newPay.numberOperation = this.newPayment.voucherNumber;
            newPay.payDay = this.newPayment.payDay;
            newPay.classSectionNumber = this.newPayment.classSectionNumber;
            newPay.financialEntity = this.newPayment.financialEntityID;
            newPay.transactionType = this.newPayment.transactionTypeID;
            newPay.statusFileID = 2;
            newPay.numberSequence = student.numberSequence;
            newPay.urlFile = imageData.urlFile;
            newPay.pathFile = imageData.pathFile;
            newPay.filename = imageData.filename;
            newPay.fileName = imageData.filename;
            newPay.periodID = this.newPayment.periodID;
            newPay.personID = student.personID;
            newPay.userCreated = this.userID;
            newPay.flag_current = 'P';
            console.log(newPay);
            body.updates.push(newPay);
          }

        } else {
          //console.log(this.newPayment);
          const file: HTMLInputElement = this.ElementRef.nativeElement.querySelector(`#new-file`)
          let fileCount: number = file.files.length;
          let formData = new FormData();
          if (fileCount > 0) {
            formData.append('file', file.files.item(0));
            let data: any = await this.Administrative.uploadFileByEntityAndFileType(1, 'images', formData, this.personID).toPromise();
            //console.log(data);
            this.newPayment.urlFile = data.urlFile;
            this.newPayment.pathFile = data.pathFile;
            this.newPayment.filename = data.filename;
            this.newPayment.fileName = data.filename;
          }
          this.newPayment.numberOperation = this.newPayment.voucherNumber;
          this.newPayment.payDateLoad = this.newPayment.payDay;
          this.newPayment.financialEntity = this.newPayment.financialEntityID;
          this.newPayment.transactionType = this.newPayment.transactionTypeID;
          this.newPayment.statusFileID = 2;
          this.newPayment.personID = this.personID;
          this.newPayment.userCreated = this.userID;
          this.newPayment.flag_current = 'P';
          //console.log(this.newPayment);
          body = {
            updates: [this.newPayment]
          };
        }

        let result: any = await this.Administrative.updateInterestedCourse(body).toPromise();
        if (!result) {
          Swal.fire({
            text: 'Hubo un problema al guardar el archivo',
            icon: 'error'
          });
          return;
        }
        Swal.fire({
          text: 'Se guardaron los cambios correctamente.',
          icon: 'success'
        });
        this.togglePayment();
        this.newPayment.isPayed = true;
        // this.selectTab(this.tabSelected);
        // this.getCourseListOfPerson();
      }
    })
  }

	public showPayment(): void {
		Swal.fire({
			imageUrl: "../../../../../assets/images/informacion-pago.png",
			imageHeight: 350,
			imageAlt: "Pago"
		});
	}

  getTeacherNames(item: any): string {
		if(Array.isArray(item.teacherNames)) return item.teacherNames.map((t: any) => t.teacherName).join(' - ').toUpperCase();
    else return item.teacherName;
  }

	private getUnacemResponsable(): void {
		this.Administrative.getUnacemResponsable(this.personID).subscribe({
			next: (res) => {
				//console.log(res.flgPersonResponsible);
				this.isResponsable= res.flgPersonResponsible;
			}
		})
	}
}
