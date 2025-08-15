import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnacemRoutingModule } from './unacem-routing.module';
import { FormsModule } from '@angular/forms';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ManagementScoreOfCourseDetailComponent } from './management-score-of-course-detail/management-score-of-course-detail.component';
import { ContractorManagementNewComponent } from './contractor-management-new/contractor-management-new.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { FilterPipe } from 'app/pipes/filter.pipe';
import { PipesModule } from 'app/pipes/pipes.module';
import { ShoppingCartComponent } from '../sale/shopping-cart/shopping-cart.component';



@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    UnacemRoutingModule,
    FormsModule,
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
    PipesModule
  ],
})
export class UnacemModule { }
