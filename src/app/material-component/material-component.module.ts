import { NgModule } from '@angular/core';
import { CommonModule, NgForOf, NgIf, UpperCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { InputSearchComponent } from '@components/input-shearch/input-search.component';
import { ButtonArrowComponent } from '@components/button-arrow/button-arrow.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';

import {MatTabsModule} from '@angular/material/tabs';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    UpperCasePipe,
    NgIf,
    NgForOf,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    InputSearchComponent,
    ButtonArrowComponent,
    MatTooltipModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    MatSliderModule,
    MatMenuModule,
    MatDialogModule,
    MatRippleModule,
    MatTabsModule,
    MatAutocompleteModule
  ],
  exports: [
    UpperCasePipe,
    NgIf,
    NgForOf,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    InputSearchComponent,
    ButtonArrowComponent,
    MatTooltipModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    MatSliderModule,
    MatMenuModule,
    MatDialogModule,
    MatRippleModule,
    MatTabsModule,
    MatAutocompleteModule
  ]
})
export class MaterialComponentModule { }
