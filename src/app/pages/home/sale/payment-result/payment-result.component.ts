import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministrativeService } from '@services/administrative.service';
import Swal from 'sweetalert2';

interface DatafastResponse {
  result?: {
    code: string;
    description?: string;
  };
  [key: string]: any;
}
@Component({
  selector: 'app-payment-result',
  templateUrl: './payment-result.component.html',
  styleUrls: ['./payment-result.component.css'],
  standalone: true,
  imports: [
      CommonModule
  ]
})
export class PaymentResultComponent implements OnInit{

  transactionId: string | null = null;
  resourcePath: string | null = null;
  isLoading = true;
  paymentStatus: any = null;
  @Input() paymentStatusData!: any;

  constructor(
    private ActivatedRoute: ActivatedRoute,
    private Router: Router,
    private Administrative: AdministrativeService
  ) {}

  ngOnInit(): void {
    this.ActivatedRoute.queryParams.subscribe(params => {
      this.transactionId = params['id'];
      this.resourcePath = params['resourcePath'];

      if (this.transactionId && this.resourcePath) {
        this.verifyPayment();
      } else {
        this.showError("Los parámetros de pago son inválidos.");
      }
    });
  }

  async verifyPayment() {
    try {
      const resourcePathDecoded = decodeURIComponent(this.resourcePath!);
      const response = await this.Administrative.verifyByResource(resourcePathDecoded).toPromise() as DatafastResponse;
      this.paymentStatus = response;

      if (response.result?.code?.startsWith('000.')) {
        const assignmentDataFromStorage = localStorage.getItem('datafastAssignment');
        const assignmentData = assignmentDataFromStorage ? JSON.parse(assignmentDataFromStorage) : null;
        // console.log('assignmentData recibido en PaymentResult desde localStorage:', assignmentData);
        // console.log('response',response)


        if (assignmentData) {
          await this.completeSaleFlow(assignmentData,response);
        }

        this.showSuccess("Pago exitoso.");
      } else {
        this.showError(`Transacción rechazada`);
        console.log('response',response)
        localStorage.removeItem('datafastAssignment');
      }
    } catch (error) {
      this.showError("Error al verificar el estado del pago.");
    } finally {
      this.isLoading = false;
    }
  }

  async completeSaleFlow(data: any, response: any) {
    try {
      const {
        detail,
        amount,
        userID,
        personID,
        user,
        newPayment,
        newSale,
        courses,
        bodyDetail,
        bodyInsertInBulk,
        bodyCourses,
        bodyUpdate
      } = data;

      // ... todo el código existente del método ...

      // 1. Guardar venta
      let saleID = 0;
      const resultSale: any = await this.Administrative.saveSale({
        news: { sale: [{ personID, statusID: 1, createdBy: userID }] }
      }).toPromise();

      saleID = resultSale[0].saleID;

      // 2. Guardar detalle de la venta
      await this.Administrative.saveSaleDetail({
        news: detail.map((d: any) => ({
          saleID,
          itemID: d.itemID,
          statusID: 1,
          createdBy: userID
        }))
      }).toPromise();

      // 3. Enrolar participantes
      let newInsertInBulk: any[] = [];

      for (let i = 0; i < newSale.detail.length; i++) {
        const item = newSale.detail[i];
        for (let x = 0; x < item.participants.length; x++) {
          const participant = item.participants[x];
          const enrollBody = {
            newEnroll: {
              periodID: participant.period || item.periodID,
              classSectionNumber: participant.classSectionNumber,
              personID: participant.personID,
              responsibleID: user.responsibleID || undefined,
              userCreated: userID
            }
          };

          let response: any;
          if (!user.responsibleID) {
            response = await this.Administrative.newEnrollOfInterestedCourse(enrollBody).toPromise();
            if (response.length) {
              participant.numberSequence = response[0].numberSequence;
              participant.extensionCoursesID = response[0].extensionCoursesID;
            }
          } else {
            newInsertInBulk.push(enrollBody.newEnroll);
          }
        }
      }

      // 4. Enrolar en bulk si es responsable
      if (user.responsibleID) {
        const resultInBulk: any = await this.Administrative.newEnrollInBulkOfInterestedCourse({ news: newInsertInBulk }).toPromise();

        if (resultInBulk) {
          newSale.detail.forEach((d: any) => {
            d.participants.forEach((p: any) => {
              const match = resultInBulk.find((r: any) =>
                r.personID === p.personID &&
                p.classSectionNumber === r.classSectionNumber
              );
              if (match) {
                p.numberSequence = match.numberSequence;
                p.extensionCoursesID = match.extensionCoursesID;
              }
            });
          });
        }
      }

      // 5. Guardar cursos pagados
      const today = new Date().toISOString().split('T')[0];
      const updatedCourses = newSale.detail.flatMap((c: any) =>
        c.participants.map((p: any) => ({
          numberOperation: response.id,
          payDay: today,
          personID: p.personID,
          numberSequence: p.numberSequence,
          saleID: saleID,
          periodID: c.periodID,
          userCreated: userID,
          flag_current: 'P',
          classSectionNumber: p.classSectionNumber || c.classSectionNumber,
          extensionCoursesID: p.extensionCoursesID || c.extensionCoursesID,
          paymentType: 2
        }))
      );

      await this.Administrative.updateInterestedCourseDatafast({
        updates: updatedCourses
      }).toPromise();

      // 6. Actualizar estado del carrito
      newSale.detail.forEach((item: any) => {
        item.statusID = 3;
      });

      await this.Administrative.updateShoppingCartItem({
        updates: newSale.detail
      }).toPromise();

      const body = {
				personFullName: `${response.customer.givenName || ''} ${response.customer.middleName || ''} ${response.customer.surname}`,
				email: response.customer.email,
        // transactionDetails: response,
        purchaseDetails: {
          courses: newSale.detail.map((item: any) => ({
            courseName: item.courseName || item.itemName,
            price: item.price,
            quantity: item.quantity || 1,
          })),
        },
					sendEmail: 1,
      };
      // Enviar el correo
      await this.Administrative.sendPurchaseEmail(body)
        .toPromise()
        .then(() => {
          console.log('Correo de confirmación enviado exitosamente');
        })
        .catch((error: any) => {
          console.error('Error al enviar el correo de confirmación:', error);
          // No lanzamos el error para no interrumpir el flujo principal
        });

      localStorage.removeItem('datafastAssignment');
    } catch (error) {
      console.error('Error en completeSaleFlow:', error);
      throw error;
    }
  }



  showSuccess(message: string) {
    Swal.fire({
      icon: 'success',
      title: '¡Pago exitoso!',
      text: message,
      confirmButtonText: 'Continuar'
    }).then(() => {
      this.Router.navigate(['/unacem/oferta-academica']);
    });
  }

  showError(message: string) {
    Swal.fire({
      icon: 'error',
      title: 'Error en el pago',
      text: message,
      confirmButtonText: 'Volver'
    }).then(() => {
      this.Router.navigate(['/unacem/oferta-academica']);
    });
  }
}
