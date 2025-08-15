import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministrativeService } from '@services/administrative.service';
import { ModalModule } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-assign-scholarship-student',
  templateUrl: './assign-scholarship-student.component.html',
  styleUrls: ['./assign-scholarship-student.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule
  ],
  standalone: true
})
export class AssignScholarshipStudentComponent implements OnInit{

  constructor(
    private ActivatedRoute: ActivatedRoute,
    private Router: Router,
    private Administrative: AdministrativeService
  ) {}

  scholarshipID: number;
  studentID: number;
  quotaQuantity: any;
  studentInfo: any = {};
  scholarship: any = {};

  ngOnInit() {
    let params: any = this.ActivatedRoute.snapshot.params;
    this.scholarshipID = +params.scholarshipID;
    this.studentID = +params.studentID;
    if (!this.scholarshipID || !this.studentID) {
      Swal.fire({
        text: 'No puedes estar aqui.',
        icon: 'warning'
      });
      this.back();
      return;
    }
    this.getQuotaQuantity();
    this.getScholarshipInfo();
    this.getStudentInfoToScholarship();
  }

  async getScholarshipInfo() {
    let result: any = await this.Administrative.getScholarshipByID(this.scholarshipID).toPromise();

  }

  async getQuotaQuantity() {
    let result: any = await this.Administrative.getSystemVariableByIdentifier('QUOTA_QUANTITY').toPromise();
    this.quotaQuantity = result;
  }

  async getStudentInfoToScholarship() {
    let result: any = await this.Administrative.getStudentInfoToScholarshipAssign(this.studentID).toPromise();
    this.studentInfo = result;
  }

  back() {
    this.Router.navigate(['/administracion']);
  }

}
