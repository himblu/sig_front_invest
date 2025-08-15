import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonalInfoComponent } from './personal-info/personal-info.component';
import { InscriptionRoutingModule } from './inscription-routing.module';
import { MaterialComponentModule } from 'app/material-component/material-component.module';
import { ContactInfoComponent } from './contact-info/contact-info.component';
import { DisabilityInfoComponent } from './disability-info/disability-info.component';
import { AcademicInfoComponent } from './academic-info/academic-info.component';
import { FileInfoComponent } from './file-info/file-info.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { FormsModule } from '@angular/forms';
// import { GoogleMapsModule } from '@angular/google-maps'
import { PipesModule } from 'app/pipes/pipes.module';
import { TabsModule } from 'ngx-bootstrap/tabs';



@NgModule({
  declarations: [
    PersonalInfoComponent,
    ContactInfoComponent,
    DisabilityInfoComponent,
    AcademicInfoComponent,
    FileInfoComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialComponentModule,
    InscriptionRoutingModule,
    ModalModule,
    TabsModule.forRoot(),
    PdfViewerModule,
    // GoogleMapsModule,
    PipesModule
  ]
})
export class InscriptionModule { }
