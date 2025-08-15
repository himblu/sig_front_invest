import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { MatStepperModule } from '@angular/material/stepper';
import { NgIf, UpperCasePipe, NgForOf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ComboComponent } from '../../enrollment/pages/components/combo/combo.component';
import { MatNativeDateModule } from '@angular/material/core';
import { QualitiesComponent } from '@components/qualities/qualities.component';

@Component({
  selector: 'app-qualities-teacher',
  templateUrl: './qualities-teacher.component.html',
  styles: [
  ],
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    NgForOf,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatTooltipModule,
    MatButtonModule,
    MatStepperModule,
    NgxMaskDirective,
    MatDatepickerModule,
    ComboComponent,
    MatNativeDateModule,
    QualitiesComponent
],
  providers: [
    provideNgxMask()
  ]
})
export class QualitiesTeacherComponent {

 
}
