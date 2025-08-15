import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { alphaNumeric, onlyLetters, onlyNumbers } from 'app/constants';
import { PipesModule } from 'app/pipes/pipes.module';
import { TabsModule } from 'ngx-bootstrap/tabs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contractor-management',
  templateUrl: './contractor-management.component.html',
  styleUrls: ['./contractor-management.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TabsModule,
    PipesModule
  ]
})
export class ContractorManagementComponent implements OnInit {

  constructor(
    private Administrative: AdministrativeService,
    private Router: Router,
    private Common: CommonService
  ) {}

  contractors: any[] = [];
  byText: any;
  filter: any = {};

  async ngOnInit() {
    let userID = +sessionStorage.getItem('userId');
    let rolID = +sessionStorage.getItem('rolID');
    let resultValidation: any = await this.Administrative.getContractorResponsibleMainByUserID(userID).toPromise();
    //console.log(resultValidation);
    if (resultValidation.length && rolID === 24) {
      this.Router.navigate([`/unacem/administracion-de-contratistas/${resultValidation[0].contractorID}`])
      return;
    }
		else if(rolID !== 22){
			this.Router.navigate([`/`])
      return;
		}
    this.getContractors();
  }

  async getContractors() {
    let result: any = await this.Administrative.getContractor({}).toPromise();
    this.contractors = result;
  }

  toggleContractor(item?: any) {
    let contractorID: any = 'nuevo';
    if (item) {
      contractorID = item.contractorID;
    }
    this.Router.navigate([`/unacem/administracion-de-contratistas/${contractorID}`])
  }

  deleteContractor(item: any) {
    Swal.fire({
      text: `¿Estas seguro de ${item.statusID === 0 ? 'ACTIVAR' : 'DESACTIVAR'} al contratista?`,
      icon: 'question',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      showConfirmButton: true,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#014898'
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        item.statusID = item.statusID === 0 ? 1 : 0;
        let body: any = {
          updates: [item]
        };

        let result: any = await this.Administrative.updateContractor(body).toPromise();
        if (!result) {
          Swal.fire({
            text: 'Hubo un error al actualizar la información del contratista',
            icon: 'error'
          });
          item.statusID = 1;
          return;
        }
        this.getContractors();
        Swal.fire({
          text: 'Se actualizó correctamente la información del contratista',
          icon: 'success'
        });
      }
    })
  }

  async report() {
    let body: any = {
      businessNameFilter: this.byText,
      startDate: this.filter.startDate,
      endDate: this.filter.endDate
    }
    let report: any = await this.Administrative.getContractorReport(body).toPromise();
    //console.log(report);
    let file: any = await this.Common.getFileOfServer({filePath: report.filePath}).toPromise();
    const blob = new Blob([file]);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `reporte-de-contratistas.xlsx`;
    document.body.appendChild(a);
    a.click();
    Swal.close();
  }

}
