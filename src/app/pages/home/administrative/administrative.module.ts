import { NgModule } from '@angular/core';
import { AdministrativeRoutingModule } from './administrative-routing.module';
import { MaterialComponentModule } from 'app/material-component/material-component.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SurveyComponent } from './survey/survey.component';
import { SurveyConfigComponent } from './survey-config/survey-config.component';
import { ProcessManagementComponent } from './process-management/process-management.component';
import { ProcessFileConfigurationComponent } from './process-file-configuration/process-file-configuration.component';
import { SurveyTypeComponent } from './survey-type/survey-type.component';
import { SurveyTypeDetailComponent } from './survey-type-detail/survey-type-detail.component';
import { SortableModule } from 'ngx-bootstrap/sortable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
@NgModule({
  imports: [
    CommonModule,
    MaterialComponentModule,
    AdministrativeRoutingModule,
    ModalModule.forRoot(),
    SortableModule.forRoot(),
    TooltipModule.forRoot()
  ],
  declarations: [
  ]
})

export class AdministrativeModule { }
