import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, SecurityContext, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministrativeService } from '@services/administrative.service';
import { ShoppingCartService } from '@services/shoppingCart.service';
import { HeaderComponent } from '@shared/header/header.component';
import { alphaNumeric } from 'app/constants';
import { PipesModule } from 'app/pipes/pipes.module';
import * as moment from 'moment';
import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { DatafastFormComponent } from '../datafast-form/datafast-form.component';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { RrhhService } from '@services/rrhh.service';
import { firstValueFrom, lastValueFrom } from 'rxjs';

export interface CheckoutBody {
  personID: number;
  amount: number;
  documentNumber: string;
  firstName: string;
  secondName: string;
  surname: string;
  email: string;
  celular: string;
  courseName: string;
  courseDesc: string;
  unitPrice: number;
  quantity: number;
  shippingStreet: string;
  billingStreet: string;
  shippingCountry: string;
  billingCountry: string;
}

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PipesModule,
    ModalModule,
    MatDialogModule
  ]
})
export class ShoppingCartComponent extends OnDestroyMixin implements OnInit, OnDestroy{

  constructor(
    private ActivatedRoute: ActivatedRoute,
    private Administrative: AdministrativeService,
    private RrhhService:RrhhService,
    private Router: Router,
    private ElementRef: ElementRef,
		private cartService: ShoppingCartService,
    private sanitizer: DomSanitizer,
    private cdRef: ChangeDetectorRef,
    private dialog: MatDialog
  ) {
    super();
  }

  @ViewChild('verifyPaymentModal', {static: false}) verifyPaymentModal: ModalDirective;
  @ViewChild('participantModal', {static: false}) participantModal: ModalDirective;
  @ViewChild('paymentDatafast', {static: false}) paymentDatafast: ModalDirective;

  newSale: any = {};
  user: any = {};
  filter: any = {};
  cartID: number = 0;
  personID: number = 0;
  userID: number = 0;
  shoppingCart: any = {};
  newPayment: any = {};
  currentDate: any;
  financialEntities: any[] = [];
  transactionTypes: any[] = [];
  itemSelected: any = {};
  datafastCheckoutId:string;
  disableSelection:boolean = true;


  ngOnInit(): void {
    this.currentDate = moment().format('YYYY-MM-DD');
    let params: any = this.ActivatedRoute.snapshot.params;
    this.cartID = +params.cartID;
    this.userID = +sessionStorage.getItem('userId');
    if (isNaN(this.cartID)) {
      Swal.fire({
        text: 'No puedes estar en este sitio',
        icon: 'error'
      });
      this.Router.navigate(['/administracion']);
      return;
    }
    this.personID = +sessionStorage.getItem('personID');
    this.getPersonInfo();
    this.getFinancialEntities();
    this.getTransactionTypes();
  }

  /*setupWpwlOptions() {
    console.log("🔹 Configurando opciones del widget...");
    delete (window as any).wpwl;
    (window as any).wpwlOptions = {
        style: "card",
        widgetMode: "inline",
        onReady: () => {
            console.log("Widget de pago listo.");
        },
        onComplete: (data: Record<string, any>) => {
            console.log("Pago completado:", data);

            // Capturar resultado antes de redirigir
            Swal.fire({
                icon: "success",
                title: "Pago exitoso",
                text: "Tu pago ha sido procesado correctamente",
                confirmButtonText: "Aceptar"
            }).then(() => {
                console.log("Redirigiendo a shopperResultUrl...");
                // window.location.href = data.shopperResultUrl;
            });
        },
        onError: (error: Record<string, any>) => {
            console.error("Error en el pago", error);
            Swal.fire({
                icon: "error",
                title: "Error en el pago",
                text: "Hubo un problema con tu pago. Inténtalo nuevamente.",
                confirmButtonText: "Aceptar"
            });
        }
    };
  }*/


  // setupPaymentWidget() {
  //   console.log("Despues del Pago");
  //   setTimeout(() => {
  //     if ((window as any).wpwl) {
  //         console.log("Inicializando widget de pago...");
  //         (window as any).wpwl.init();
  //     } else {
  //         console.error("Error: `wpwl` no está disponible.");
  //     }
  // }, 3000); // Espera a que el DOM cargue el widget

  // }

  // ngAfterViewInit() {
  //   this.setupPaymentWidget();
  // }

  async getFinancialEntities() {
    let result: any = await this.Administrative.getFinancialEntities().toPromise();
    this.financialEntities = result;
  }

  async getTransactionTypes() {
    let result: any = await this.Administrative.getTransactionTypes().toPromise();
    this.transactionTypes = result;
  }

  async getPersonInfo() {
    let resultValidation: any = await this.Administrative.getContractorResponsibleMainByUserID(this.userID).toPromise();
    // this.entities = resultValidation;
    if (resultValidation.length) {
      this.user.responsibleID = resultValidation[0].responsibleID;
      this.user.isASolePropietor = resultValidation[0].isASolePropietor;
      this.user.contractorID = resultValidation[0].contractorID;
      this.user.personID = resultValidation[0].personID;
      this.getCollaboratorsOfContrator();
    } else {
      this.getShoppingCartInfo();
    }
  }

  async getCollaboratorsOfContrator() {
    let result: any = await this.Administrative.getContractorCollaboratorByContractorID(this.user.contractorID).toPromise();
    this.user.collaborators = result;
    if (this.user.isASolePropietor) {
      this.user.collaborators.push({
        personID: this.user.personID
      });
    }
    //console.log(this.user);
    this.getShoppingCartInfo()
  }

  async getShoppingCartInfo() {
    let result: any = await this.Administrative.getShoppingCartByID(this.cartID).toPromise();
    // console.log('getShoppingCartByID', result);
    if (!result) {
      Swal.fire({
        text: 'No se tienen detalles del Carrito. No puedes estar aqui',
        icon: 'error'
      });
      return;
    }

    this.shoppingCart = result;
    let salesInfo: any = await this.Administrative.getSaleInfoByCartID(this.shoppingCart.cartID, 2).toPromise();
    //console.log(salesInfo);
    let resultItems: any = await this.Administrative.getShoppingCartItemByCartID(this.shoppingCart.cartID).toPromise();
		// console.log('resultItems', resultItems);
    // Map para agrupar por itemID
    const groupedMap = new Map<number, any>();

    resultItems.forEach((item: any) => {
      const key = item.itemID;

      if (groupedMap.has(key)) {
        const existing = groupedMap.get(key);

        if (item.numberSequence !== null) {
          existing.numberSequence.push(item.numberSequence);
        }
        // existing.totalPrice += item.totalPrice || 0;
      } else {
        groupedMap.set(key, {
          ...item,
          numberSequence: item.numberSequence !== null ? [item.numberSequence] : null,
          // totalPrice: item.totalPrice || 0
        });
      }
    });

    // Convertimos el map a array
    const groupedItems = Array.from(groupedMap.values());

    this.shoppingCart.detail = groupedItems.filter((i: any) => i.statusID === 1);
    // this.shoppingCart.detail = resultItems.filter((i: any) => i.statusID === 1);
    if (!this.shoppingCart.detail.length) {
      Swal.fire({
        text: 'No tienes items en tu carrito de compras. Realiza el Proceso de Inscripción',
        icon: 'warning'
      })
      this.Router.navigate(['/unacem/oferta-academica']);
      return;
    } else {
      this.shoppingCart.detail.map((d: any) => {
        let saleSyncFounds: any = salesInfo.filter((s: any) => s.itemID === d.itemID);
        // VERIFICANDO SI EXISTEN VENTAS ANTERIORES
        if (saleSyncFounds.length) {
          d.saleID = saleSyncFounds[0].saleID;
          // d.participants = JSON.parse(JSON.stringify(this.user.collaborators.filter((c: any) => saleSyncFounds.map((s: any) => s.personID).includes(c.personID))));

          if (Array.isArray(this.user?.collaborators)) {
            d.participants = JSON.parse(JSON.stringify(
              this.user.collaborators.filter((c: any) =>
                saleSyncFounds.map((s: any) => s.personID).includes(c.personID)
              )
            ));
          } else {
            d.participants = [{
              personID: this.personID,
              periodID: d.periodID,
              classSectionNumber: d.classSectionNumber
            }];
          }

          if (this.user.isASolePropietor) {
            d.participants.map((p: any) => {
              p.periodID = d.periodID;
              p.classSectionNumber = d.classSectionNumber;
            })
          }
          d.participants.map((p: any) => {
            p.selected = true;
          });
        } else {
          if (!this.user.responsibleID || this.user.isASolePropietor) {
            d.participants = [{
              periodID: d.periodID,
              classSectionNumber: d.classSectionNumber,
              personID: this.personID
            }];
          } else {
            d.participants = [];
          }
        }
      });
      this.shoppingCart.disabled = this.shoppingCart.personID !== this.personID;
      this.calculateTotalPrice();
    }
  }

  deleteToShoppingCart(item: any, index: number) {
    Swal.fire({
      text: '¿Estás seguro de eliminar el item del carrito de compras?',
      icon: 'question',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#014898'
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        item.statusID = 0;
        let body: any = {
          updates: [item]
        };
        let result: any = await this.Administrative.updateShoppingCartItem(body).toPromise();
        if (!result) {
          Swal.fire({
            text: 'Hubo un problema al eliminar el Item',
            icon: 'error'
          });
          return;
        }
        this.shoppingCart.detail.splice(index, 1);
				this.cartService.cartState.next(true);
      }
    })
  }

  calculateTotals() {
    this.newSale.subTotal = this.shoppingCart.detail.filter((r: any) => r.include).reduce((m: any, i:any) => { return m + (i.totalPrice || 0); }, 0)

    this.newSale.discount = 0;
    this.newSale.totalPrice = this.newSale.subTotal - this.newSale.discount;
    //console.log(this.newSale);
    this.newSale.detail = this.shoppingCart.detail.filter((r: any) => r.include);
    // console.log('this.newSale.detail',this.newSale.detail)
  }

  toggleAddQuantity(item: any, action: boolean) {
    //console.log(item);
    //console.log(action);
    if (item.quantity > 0) {
      item.quantity += action ? 1 : -1;
      item.participants.push({});
    } else {
      item.quantity = 0;
    }
    this.calculateTotalPrice();
  }

  calculateTotalPrice() {
    this.shoppingCart.detail.map((r: any) => {
      r.totalPrice = (r.participants?.length || 0) * (r.price || 0);
    });
    //console.log(this.shoppingCart.detail);
    this.calculateTotals();
  }

  toggleIncludeInSale(item: any, origin: boolean = false) {
		// console.log(item);
    if (item.saleID) {
      this.shoppingCart.detail.filter((d: any)=> d.saleID === item.saleID).map((d: any) => {
        d.include = !d.include;
      });
    } else {
      item.include = !item.include;
    }
    this.calculateTotalPrice();
    if (origin) {
      if (this.newSale.detail.length === 0) {
        this.toggleVerifyPaymentModal();
      }else{
        this.checkNewPayment();
      }
    }
  }

  toggleParticipantModal(item?: any) {
    if (this.participantModal.isShown) {
      this.user.collaborators.map((c: any) => {
        c.selected = false;
      });
      this.participantModal.hide();
    } else {
      if(!item.observation){
        this.disableSelection=false;
      }else{
        this.disableSelection=true;
      }
      this.itemSelected = item;
      item.participants.map((p: any) => {
        let collaboratorSelected = this.user.collaborators.find((x: any) => x.personID === p.personID);
        if (collaboratorSelected) {
          collaboratorSelected.selected = true;
        }
      });
      this.participantModal.config.keyboard = false;
      this.participantModal.config.ignoreBackdropClick = true;
      this.participantModal.show();
    }
  }

  toggleSelectParticipant(participant: any) {
    participant.selected = !participant.selected;
    if (participant.selected) {
      participant.classSectionNumber = this.itemSelected.classSectionNumber;
      this.itemSelected.participants.push(JSON.parse(JSON.stringify(participant)));
    } else {
      this.itemSelected.participants.splice(this.itemSelected.participants.indexOf(participant),1);
    }
    //console.log(this.newSale);
    this.calculateTotalPrice();
  }

  verityPayment() {
    this.newPayment = {
      amount: this.newSale.totalPrice,
      saleID: this.newSale.detail[0].saleID
    };
    this.toggleVerifyPaymentModal();

  }

  toggleVerifyPaymentModal() {
    if (this.verifyPaymentModal.isShown) {
      this.verifyPaymentModal.hide();
    } else {
      this.verifyPaymentModal.config.keyboard = false;
      this.verifyPaymentModal.config.ignoreBackdropClick = true;
      this.verifyPaymentModal.show();
    }
  }

  changeImageFile(e: any) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const reader = new FileReader();
      reader.onload = e => this.newPayment.imageUrl = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  resetFile() {
    this.newPayment.imageUrl = undefined;
    this.newPayment.newFile = undefined;
  }

  buy() {
		this.newSale.detail.map((detail: any) => {
			detail.participants.map((participan: any) => {
				participan.numberSequence= detail.numberSequence;
			});
		});
		//console.log(this.newSale);
    Swal.fire({
      text: '¿Estás seguro de terminar la compra de los cursos?',
      icon: 'question',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      showConfirmButton: true,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#014898',
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        // Matricula
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
        let saleID = 0;
        if (!this.newPayment.saleID) {
          // Registrando venta para vincular con el curso del interesado
          let bodySale: any = {
            news: {
              sale: [{
                personID: this.personID,
                statusID: 1,
                createdBy: this.userID
              }],
            }
          };

          let resultSale: any = await this.Administrative.saveSale(bodySale).toPromise();
          saleID = resultSale[0].saleID;
        } else {
          saleID = this.newPayment.saleID;
        }


        let bodyDetail: any = {
          news: this.newSale.detail.map((d: any) => {
            return {
              saleID: saleID,
              itemID: d.itemID,
              statusID: 1,
              createdBy: this.userID
            };
          })
        };

        let resultDetail: any = await this.Administrative.saveSaleDetail(bodyDetail).toPromise();


        let results: any = [];
        let newInsertInBulk: any = [];
        for (let i = 0; i < this.newSale.detail.length; i++) {
          let item: any = this.newSale.detail[i];
          for (let x = 0; x < item.participants.length; x++) {
            let participant: any = item.participants[x];
            if (Array.isArray(item.numberSequence)) {
              participant.numberSequence = item.numberSequence[x] || null;
            } else {
              participant.numberSequence = item.numberSequence || null;
            }
            let body: any = {
              newEnroll: {
                periodID: participant.period || item.periodID,
                classSectionNumber: participant.classSectionNumber,
                personID: participant.personID,
                responsibleID: this.user.responsibleID ? this.user.responsibleID : undefined,
                userCreated: this.userID
              }
            };
            let response: any;
            if (!this.user.responsibleID) {
              response = await this.Administrative.newEnrollOfInterestedCourse(body).toPromise();
              if (response.length) {
                participant.numberSequence = response[0].numberSequence;
                participant.extensionCoursesID = response[0].extensionCoursesID;
              }
              results = results.concat(response);
            } else {
              newInsertInBulk.push(body.newEnroll);
            }
						//console.log('sequenseNumberResponse', response, this.newSale);
          }
        }

        if (this.user.responsibleID) {
          let bodyInsertInBulk: any = {
            news: newInsertInBulk
          };
          let resultInBulk: any = await this.Administrative.newEnrollInBulkOfInterestedCourse(bodyInsertInBulk).toPromise();
          //console.log('resultInBulk', resultInBulk);
          if(resultInBulk) this.newSale.detail.map((d: any) => {
            d.participants.map((p: any) => {
              let participantSelected = resultInBulk.find((r: any) => r.personID === p.personID && p.classSectionNumber === r.classSectionNumber);
              if (participantSelected) {
								//console.log('participantSelected', participantSelected);
                p.numberSequence = participantSelected.numberSequence;
                p.extensionCoursesID = participantSelected.extensionCoursesID;
              }
            });
          });
        }

        let image: any = {};
        const file: HTMLInputElement = this.ElementRef.nativeElement.querySelector(`#new-file`)
        let fileCount: number = file.files.length;
        let formData = new FormData();
        if (fileCount > 0) {
          formData.append('file', file.files.item(0));
          let data: any = await this.Administrative.uploadFileByEntityAndFileType(1, 'images', formData, this.personID).toPromise();
          //console.log(data);
          image.urlFile = data.urlFile;
          image.pathFile = data.pathFile;
          image.filename = data.filename;
          image.fileName = data.filename;
        }

        let courses: any[] = [];
				//console.log(this.newSale);
        this.newSale.detail.map((c: any) => {
          c.participants.map((p: any) => {
            let course: any = {
              numberOperation: this.newPayment.voucherNumber,
              payDateLoad: this.newPayment.payDay,
              payDay: this.newPayment.payDay,
              financialEntity: this.newPayment.financialEntityID,
              transactionType: this.newPayment.transactionTypeID,
              statusFileID: 2,
              personID: p.personID,
              userCreated: this.userID,
              flag_current: 'P',
              numberSequence: p.numberSequence,
              saleID: saleID,
              periodID: c.periodID,
              classSectionNumber: p.classSectionNumber || c.classSectionNumber,
              extensionCoursesID: p.extensionCoursesID || c.extensionCoursesID
            };
            course = Object.assign(course, image);
            courses.push(course);
          })
        });

        let body = {
          updates: courses
        };

        let result: any = await this.Administrative.updateInterestedCourse(body).toPromise();

        this.newSale.detail.map((i: any) => {
          i.statusID = 2;
        });
        let bodyUpdate: any = {
          updates: this.newSale.detail
        };

        let resultUpdate: any = await this.Administrative.updateShoppingCartItem(bodyUpdate).toPromise();

        if (!resultUpdate) {
          Swal.fire({
            text: 'Hubo un problema al actualizar los items del carrito de compra',
            icon: 'error'
          });
          return;
        }

        Swal.fire({
          text: 'Se realizó la compra correctamente.',
          icon: 'success'
        });
				setTimeout(() => {
					this.cartService.cartState.next(true);
				}, 500);
        this.toggleVerifyPaymentModal();
        this.ngOnInit();
        // Actualización con archivo
      }
    })
  }


  alphaNumeric(e: any) {
    alphaNumeric(e);
  }

  checkNewPayment(){
    this.newPayment = {
      amount: this.newSale.totalPrice,
      saleID: this.newSale.detail[0].saleID
    };
  }
  verityDatafast() {
    this.checkNewPayment();
    this.toggleDatafast();
  }

  async toggleDatafast() {
    // console.log('paymentDatafast',this.paymentDatafast.isShown)
    if (this.paymentDatafast.isShown) {
      this.paymentDatafast.hide();
    } else {
      try {
        // const checkoutId = await this.getCheckoutIDDatafast();
        // console.log('Checkout ID recibido:', checkoutId);
        // if (!checkoutId) {
        //   console.error('No se pudo obtener un Checkout ID válido');
        //   return;
        // }
        // this.datafastCheckoutId=checkoutId;
        this.paymentDatafast.config.keyboard = false;
        this.paymentDatafast.config.ignoreBackdropClick = true;
        this.paymentDatafast.show();
      } catch (error) {
        // console.error('Error al preparar Datafast:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error en el pago',
          text: 'No se pudo preparar el formulario de pago. Intenta nuevamente.',
        });
      }
    }
  }

  async verifyPaymentStatus(checkoutId: string) {
    this.Administrative.verifyDatafastTransaction(checkoutId).subscribe({
      next: (response: any) => {
        // console.log('Respuesta de verificación:', response);
        if (response.resultCode === '000.100.110') {
          alert('Pago confirmado exitosamente.');
          // this.paymentDatafast.hide(); // Cerrar modal
          // this.finalizarCompra(); // Registrar pago en la BD
        } else {
          alert('Pago no confirmado. Verifique con el banco.');
        }
      },
      error: (error) => {
        console.error('Error en la verificación:', error);
        alert('Hubo un error al verificar el pago.');
      }
    });
  }

  async toggleIncludeInSaleDatafast(item: any, origin: boolean = false) {
		// console.log(item);
    if (item.saleID) {
      this.shoppingCart.detail.filter((d: any)=> d.saleID === item.saleID).map((d: any) => {
        d.include = !d.include;
      });
    } else {
      item.include = !item.include;
    }
    this.calculateTotalPrice();
    if (origin) {
      if (this.newSale.detail.length === 0) {
        this.toggleDatafast(); // Esto podría estar cerrando el modal incorrectamente
      } else {
        this.checkNewPayment();
        // const checkoutId = await this.getCheckoutIDDatafast();
        // console.log('Nuevo Checkout ID generado:', checkoutId);
        // this.datafastCheckoutId = checkoutId;

        // if (checkoutId) {
        //   // this.reloadDatafastWidget(checkoutId); // Carga el nuevo formulario
        // } else {
        //   console.error('No se pudo obtener un Checkout ID válido');
        //   return;
        // }
      }
    }
  }

  handlePaymentSuccess(data: any) {
    // console.log('Éxito en el pago:', data);
    // Aquí puedes redirigir, guardar en base de datos, cerrar modal, etc.
    Swal.fire({
      icon: 'success',
      title: 'Pago exitoso',
      text: 'Tu transacción ha sido procesada correctamente.',
    });
  }

  handlePaymentError(error: any) {
    // console.error('Error en el pago:', error);
    Swal.fire({
      icon: 'error',
      title: 'Pago fallido',
      text: 'Ocurrió un error durante el proceso de pago.',
    });
  }

  async getDataPerson(){
    const personStorage = parseFloat(localStorage.getItem('personID'));
    const dataPerson: any = await lastValueFrom(this.RrhhService.getPerson(personStorage));
    const result =
      {
        documentNumber:dataPerson.identity,
        firstName:dataPerson.first_name,
        secondName:dataPerson.second_name,
        surname:dataPerson.middleName,
        emailDesc:dataPerson.email,
        celularPhone:dataPerson.celularPhone,
        shippingStreet: dataPerson.birthPlace ?? 'Ibarra',
        billingStreet: dataPerson.birthPlace ?? 'Ibarra',
        shippingCountry: 'EC',
        billingCountry: 'EC',
      };
    return result;
  }


  async prepareDatafastPayload(){
    //Agregar datos de la persona
    let dataPerson: any =await this.getDataPerson();
    // Asignar numberSequence desde detail a cada participante
    this.newSale.detail.forEach((detail: any) => {
      detail.participants.forEach((participant: any) => {
        participant.numberSequence = detail.numberSequence;
      });
    });

    // Crear detalle de venta
    const saleID = this.newPayment.saleID || 0;

    const bodyDetail = {
      news: this.newSale.detail.map((d: any) => ({
        saleID: saleID,
        itemID: d.itemID,
        statusID: 1,
        createdBy: this.userID
      }))
    };

    // Crear cuerpo para inscripción en bulk
    const newInsertInBulk: any[] = [];

    this.newSale.detail.forEach((item: any) => {
      item.participants.forEach((participant: any) => {
        const enroll = {
          periodID: participant.period || item.periodID,
          classSectionNumber: participant.classSectionNumber,
          personID: participant.personID,
          responsibleID: this.user.responsibleID || undefined,
          userCreated: this.userID
        };
        if (this.user.responsibleID) {
          newInsertInBulk.push(enroll);
        }
      });
    });

    const bodyInsertInBulk = {
      news: newInsertInBulk
    };

    // Cursos para el update final
    const courses: any[] = this.newSale.detail.flatMap((c: any) =>
      c.participants.map((p: any) => ({
        numberOperation: this.newPayment.voucherNumber,
        payDateLoad: this.newPayment.payDay,
        payDay: this.newPayment.payDay,
        financialEntity: this.newPayment.financialEntityID,
        transactionType: this.newPayment.transactionTypeID,
        statusFileID: 2,
        personID: p.personID,
        userCreated: this.userID,
        flag_current: 'P',
        numberSequence: p.numberSequence,
        saleID: saleID,
        periodID: c.periodID,
        classSectionNumber: p.classSectionNumber || c.classSectionNumber,
        extensionCoursesID: p.extensionCoursesID || c.extensionCoursesID
      }))
    );

    const bodyCourses = {
      updates: courses
    };

    const bodyUpdate = {
      updates: this.newSale.detail.map((i: any) => ({
        ...i,
        statusID: 2
      }))
    };

    return {
      detail: this.newSale.detail,
      amount: this.newPayment.amount,
      documentNumber: dataPerson.documentNumber,
      firstName: dataPerson.firstName,
      secondName: dataPerson.secondName,
      surname: dataPerson.surname,
      emailDesc: dataPerson.emailDesc,
      celularPhone: dataPerson.celularPhone,
      shippingStreet: dataPerson.shippingStreet?.substring(0, 100) || '',
      billingStreet: dataPerson.billingStreet?.substring(0, 100) || '',
      shippingCountry: dataPerson.shippingCountry,
      billingCountry: dataPerson.billingCountry,
      // amount: 1,
      userID: this.userID,
      personID: this.personID,
      user: this.user,
      newPayment: this.newPayment,
      newSale: this.newSale,
      bodyDetail,
      bodyInsertInBulk,
      courses,
      bodyCourses,
      bodyUpdate
    };
  }


  async openDatafastDialog(){
    this.checkNewPayment();
    const dataToPersist =await this.prepareDatafastPayload();
    localStorage.setItem('datafastAssignment', JSON.stringify(dataToPersist));

    const config: MatDialogConfig = {
      id: 'DatafastPaymentComponent',
      autoFocus: false,
      width: '500px',
      maxWidth: '90vw',
      panelClass: 'custom-dialog',
      disableClose: true,
      data: {
        detail: dataToPersist.detail,
        amount: dataToPersist.amount,
        personID: this.personID,
        documentNumber: dataToPersist.documentNumber,
        firstName: dataToPersist.firstName,
        secondName: dataToPersist.secondName,
        surname: dataToPersist.surname,
        email: dataToPersist.emailDesc,
        celular: dataToPersist.celularPhone,
        courseName: this.newSale.detail[0].courseName?.substring(0, 100) || '',
        courseDesc: this.newSale.detail[0].courseDesc?.substring(0, 100) || '',
        unitPrice:  dataToPersist.amount,
        quantity: 1,
        shippingStreet: dataToPersist.shippingStreet,
        billingStreet: dataToPersist.billingStreet,
        shippingCountry: dataToPersist.shippingCountry,
        billingCountry: dataToPersist.billingCountry,
      },
      position: { top: '30px' } // <- esto es lo importante
    };


    (document.activeElement as HTMLElement)?.blur();
    const dialogRef = this.dialog.open(DatafastFormComponent, config);

    dialogRef.afterClosed()
    .pipe(untilComponentDestroyed(this))
    .subscribe((result) => {
    if (result?.success && result.data?.checkoutId) {
      this.Administrative.verifyDatafastTransaction(result.data.checkoutId).subscribe({
        next: (verifyResult: any) => {
          if (verifyResult.result?.code?.startsWith('000.')) {
            this.handlePaymentSuccess(verifyResult);
          } else {
            this.handlePaymentError(verifyResult);
          }
        },
        error: (err) => {
          console.error('Error al verificar transacción', err);
          this.handlePaymentError(err);
        }
      });
    } else if (result?.error) {
      this.handlePaymentError(result.error);
    }
  });
  }
}
