import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetSearchPersonComponent } from './widget-search-person/widget-search-person.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    WidgetSearchPersonComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
})
export class WidgetsModule { }
