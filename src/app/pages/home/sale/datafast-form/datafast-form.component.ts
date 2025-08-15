import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { DatafastService } from '@services/datafast.service';
import Swal from 'sweetalert2';
import { AdministrativeService } from '@services/administrative.service';
import { MatListModule } from '@angular/material/list';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-datafast-form',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatListModule,
    NgIf,
    NgFor
    // Agrega aquí otros módulos que estés usando como MatButtonModule, MatListModule, CommonModule, etc.
  ],
  templateUrl: './datafast-form.component.html',
  styleUrls: ['./datafast-form.component.css']
})
export class DatafastFormComponent extends OnDestroyMixin implements OnInit, OnDestroy {
  public checkoutId!: string;
  public detail: any[] = [];
  public amount: number = 0;
  public personID: number = 0;
  public documentNumber: string;
  public firstName: string;
  public secondName: string;
  public surname: string;
  public email: string;
  public celular: string;
  public courseName: string;
  public courseDesc: string;
  public unitPrice: number;
  public quantity: number;
  public shippingStreet: string;
  public billingStreet: string;
  public shippingCountry: string;
  public billingCountry: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DatafastFormComponent>,
    private datafastService: DatafastService,
    private Administrative: AdministrativeService
  ) {
    super();
  }

  async ngOnInit(): Promise<void> {
    this.detail = this.data.detail;
    this.amount = this.data.amount;
    this.personID = this.data.personID;
    this.documentNumber = this.data.documentNumber;
    this.firstName = this.data.firstName;
    this.secondName = this.data.secondName;
    this.surname = this.data.surname;
    this.email = this.data.email;
    this.celular = this.data.celular;
    this.courseName = this.data.courseName;
    this.courseDesc = this.data.courseDesc;
    this.unitPrice = this.data.unitPrice;
    this.quantity = this.data.quantity;
    this.shippingStreet = this.data.shippingStreet;
    this.billingStreet = this.data.billingStreet;
    this.shippingCountry = this.data.shippingCountry;
    this.billingCountry = this.data.billingCountry;
    let body={
      amount: this.amount,
      personID: this.personID,
      documentNumber: this.documentNumber,
      firstName: this.firstName,
      secondName: this.secondName,
      surname: this.surname,
      email: this.email,
      celular: this.celular,
      courseName:this.courseName,
      courseDesc:this.courseDesc,
      unitPrice:this.unitPrice,
      quantity:this.quantity,
      shippingStreet:this.shippingStreet,
      billingStreet:this.billingStreet,
      shippingCountry:this.shippingCountry,
      billingCountry:this.billingCountry
    }
    try {
      const checkoutId = await this.datafastService.getCheckoutIDDatafast(body);
      this.checkoutId = checkoutId;
      // console.log('checkoutId',checkoutId)
      await this.datafastService.loadScript(checkoutId);
    } catch (error) {
      console.error('Error al generar el Checkout ID:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al inicializar el pago',
        text: 'Ocurrió un problema al preparar el formulario de pago. Intenta nuevamente.'
      });
      this.dialogRef.close({ error });
    }
    (window as any).wpwlOptions = {
      style: "card",
      locale: "es",
      labels: {
        cvv: "CVV",
        cardHolder: "Nombre (Igual que en la tarjeta)"
      }
    };
  }

  onPaymentSuccess(data: any): void {
    this.dialogRef.close({ success: true, data });
  }

  onPaymentError(error: any): void {
    this.dialogRef.close({ error });
  }

  onCancel(): void {
    localStorage.removeItem('datafastAssignment');
    this.dialogRef.close({ cancelled: true });
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  // onConfirmPayment(): void {
  //   this.Administrative.verifyDatafastTransaction(this.checkoutId).subscribe({
  //     next: (res: any) => {
  //       if (res.result?.code?.startsWith('000.')) {
  //         this.dialogRef.close({ success: true, data: res });
  //       } else {
  //         this.dialogRef.close({ error: res });
  //       }
  //     },
  //     error: (err) => {
  //       this.dialogRef.close({ error: err });
  //     }
  //   });

  // }


}
