import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { RrhhService } from '@services/rrhh.service';
import { RECORD_NUMBERS } from 'app/constants';
import { PipesModule } from 'app/pipes/pipes.module';
import * as moment from 'moment';
import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-assignment-of-course',
  templateUrl: './assignment-of-course.component.html',
  styleUrls: ['./assignment-of-course.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    PipesModule,
		MatPaginatorModule
  ],
	providers: [
		DatePipe
	],
})
export class AssignmentOfCourseComponent implements OnInit{

  constructor(
    private Administrative: AdministrativeService,
    private RRHH: RrhhService,
    private Router: Router,
    private Common: CommonService,
		private datePipe: DatePipe,
  ) {}

  @ViewChild('assignmentModal', {static: false}) assignmentModal: ModalDirective;

	public pageIndex: number = 1;
	public pageSize: number = 10;
	public length: number = 0;
	public pageEvent!: PageEvent;
	public pageSizeOptions: number[] = [5, 10, 25, 50, 100];
	public now: string= this.formattedDate(new Date);
  filter: any = {
    state: 1,
		startDate: '2024-01-01',
		endDate: this.now
  };
  recordNumbers: any[] = RECORD_NUMBERS;
  byText: string= '';
  user: any;

  body: any = {
    filter: {},
    pagination: {},
    show: true
  };

  assignments: any[] = [];

  ngOnInit(): void {
    this.user = sessionStorage.getItem('userId');
    this.getQuantityOfAssignment();
  }

  toggleFilters() {
    this.body.show = !this.body.show;
  }

  async getQuantityOfAssignment() {
		this.getAssignmentsWithFilterAndPagination();
    /* let result: any = await this.Administrative.getUnacemClassSectionQuantityByFilter(this.body).toPromise();

    this.body.pagination.totalRecords = result.quantity;
    if (this.body.pagination.totalRecords) {
      this.body.pagination.currentPage = 1;
      this.getAssignmentsWithFilterAndPagination();
    } else {
      this.body.show = true;
      this.assignments = [];
    } */
  }

  async getAssignmentsWithFilterAndPagination() {
    // this.courses = [];
		this.body.filter = this.filter;
    let result: any = await this.Administrative.getUnacemClassSectionByFilterAndPagination(this.pageIndex, this.pageSize, this.byText, this.filter.startDate, this.filter.endDate, +this.filter.state).toPromise();
    //console.log(result);
    this.assignments = result.data;
		this.length = result.count;
    this.assignments.map((c: any) => {
      c.dateCreated = c.dateCreated || moment();
    })
    this.assignments.sort((a: any, b: any) => b.classSectionNumber - a.classSectionNumber);
    //console.log(this.assignments);
    this.body.show = false;
  }

	public changePage(event: PageEvent): PageEvent {
		this.pageIndex = event.pageIndex+1;
		this.pageSize = event.pageSize;
		this.getQuantityOfAssignment();
		return event;
	}

  toggleAssignment(assignment?: any) {
		console.log('-->',assignment)
    Swal.fire({
      text: `¿Estás seguro de ${assignment === undefined ? 'crear una nueva asignación de cursos' : 'ver el detalle de la asignación'}?`,
      icon: 'question',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      showConfirmButton: true,
      confirmButtonColor: '#014898',
      showCancelButton: true,
      cancelButtonText: 'Cancelar'
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        let assignmentID = assignment === undefined ? 'nuevo' : `${assignment.periodID}-${assignment.classSectionNumber}`;
        this.Administrative.setAssignmentData({
          startDate: this.filter.startDate,
          endDate: this.filter.endDate
         });
        this.Router.navigate([`/unacem/asignacion-de-cursos/${assignmentID}`]);
      }
    });
  }

  deleteAssignment(assignment: any) {
    Swal.fire({
      text: `¿Estás seguro de ${assignment.statusID === 1 ? 'DESHABILITAR' : 'HABILITAR'} la asignación?`,
      icon: 'question',
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonColor: '#014898',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      cancelButtonText: 'Cancelar'
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        assignment.statusID = assignment.statusID === 1 ? 0 : 1;
        let body: any = {
          updates: [assignment]
        };
        let result: any = await this.Administrative.updateUnacemClassSection(body).toPromise();
        if (!result) {
          Swal.fire({
            text: 'Hubo un error al actualizar la asignación',
            icon: 'error'
          });
          return;
        }
        // this.assignments.splice(this.assignments.indexOf(assignment), 1);
        this.ngOnInit();
      }
    })
  }

  async getReport() {
    let body: any = {
      periodID: moment(this.filter.startDate).year(),
      courseName: this.byText,
      state: this.filter.state,
      startDate: this.filter.startDate,
      endDate: this.filter.endDate,
    };
    let result: any = await this.Administrative.getUnacemClassSectionReport(body).toPromise();
    //console.log(result);
    if (!result.filePath) {
      Swal.fire({
        text: 'No se encontraron datos para el reporte',
        icon: 'error'
      });
      return;
    }

    let file: any = await this.Common.getFileOfServer(result).toPromise();
    const blob = new Blob([file]);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `reporte-de-curso.xlsx`;
    document.body.appendChild(a);
    a.click();
  }

	private formattedDate(date: Date): string {
		return <string>this.datePipe.transform(date, 'yyyy-MM-dd');
	}

}
