import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagementScholarshipComponent } from './management-scholarship/management-scholarship.component';
import { FormsModule } from '@angular/forms';
import { ScholarshipRoutingModule } from './scholarship-routing.module';
import { AssignScholarshipStudentComponent } from './assign-scholarship-student/assign-scholarship-student.component';
import { StudentCandidateListComponent } from './student-candidate-list/student-candidate-list.component';
import { ScholarshipSheetComponent } from './scholarship-sheet/scholarship-sheet.component';



@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    FormsModule,
    ScholarshipRoutingModule
  ]
})
export class ScholarshipModule { }
