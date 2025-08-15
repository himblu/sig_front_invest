import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoodleIntegrationRoutingModule } from './moodle-integration-routing.module';
import { MaterialComponentModule } from 'app/material-component/material-component.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule } from '@angular/forms';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PipesModule } from 'app/pipes/pipes.module';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MoodleIntegrationRoutingModule,
    MaterialComponentModule,
    ModalModule.forRoot(),
    FormsModule,
    TabsModule.forRoot(),
    // PipesModule
  ]
})
export class MoodleIntegrationModule { }
