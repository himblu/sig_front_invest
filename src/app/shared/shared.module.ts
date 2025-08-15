import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { BreadcrumbsComponent } from './beadcrumbs/breadcrumbs.component';
import { NoPageFoundComponent } from './no-page-found/no-page-found.component';
import { PipesModule } from '../pipes/pipes.module';
import { RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgOptimizedImage } from '@angular/common';
import { ModalModule } from 'ngx-bootstrap/modal';

@NgModule({
  declarations: [
    BreadcrumbsComponent,
    //SidebarComponent,
    HeaderComponent,
    NoPageFoundComponent
  ],
  imports: [
    CommonModule,
    PipesModule,
    RouterModule,
		MatTooltipModule,
		NgOptimizedImage,
    ModalModule.forRoot()
  ],
  exports:[
    BreadcrumbsComponent,
    //SidebarComponent,
    HeaderComponent,
    NoPageFoundComponent
  ]
})
export class SharedModule { }
