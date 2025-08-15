import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbsorptionReportComponent } from './absorption-report/absorption-report.component';
import { AbsorptionRoutingModule } from './absorption-routing.module';
import { MaterialComponentModule } from 'app/material-component/material-component.module';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';



@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    MaterialComponentModule,
    AbsorptionRoutingModule,
    BsDropdownModule.forRoot()
  ]
})
export class AbsorptionModule { }
