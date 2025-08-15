import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { RECORD_NUMBERS } from 'app/constants';
import { FilterPipe } from 'app/pipes/filter.pipe';
import { PipesModule } from 'app/pipes/pipes.module';
import * as moment from 'moment';
import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-management-course',
  templateUrl: './management-course.component.html',
  styleUrls: ['./management-course.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    PipesModule
  ]
})
export class ManagementCourseComponent implements OnInit{

  constructor(
    private Administrative: AdministrativeService,
    private Common: CommonService
  ) {}

  @ViewChild('courseModal', {static: false}) courseModal: ModalDirective;

  body: any = {
    filter: {},
    pagination: {},
    show: true
  }
  recordNumbers: any[] = RECORD_NUMBERS;
  newCourse: any = {};
  courses: any[] = [];

  statuses: any[] = [
    {
      statusID: 1,
      statusName: 'Activo'
    },
    {
      statusID: 0,
      statusName: 'Inactivo'
    }
  ];
  user: any;
  ngOnInit(): void {
    this.user = sessionStorage.getItem('userId');
    // this.body.pagination.recordNumber = this.recordNumbers[0];
    this.body.pagination.recordNumber = 1000;
    this.body.show = true;
    this.getQuantityOfCourses();
  }

  toggleFilters() {
    this.body.show = !this.body.show;
  }

  toggleCourseModal(course?: any) {
    if (this.courseModal.isShown) {
      this.courseModal.hide();
    } else {
      this.courseModal.config.keyboard = false;
      this.courseModal.config.ignoreBackdropClick = true;
      this.courseModal.show();
      this.newCourse = {};
      if (course) {
        this.newCourse = JSON.parse(JSON.stringify(course));
        this.newCourse.editing = true;
      }
    }
  }

  async getQuantityOfCourses() {
    // OBTENER DE BD
    let result: any = await this.Administrative.getExtensionCourseQuantityByFilter(this.body).toPromise();
    
    this.body.pagination.totalRecords = result.quantity;
    if (this.body.pagination.totalRecords) {
      this.body.pagination.currentPage = 1;
      this.getCoursesWithFilterAndPagination();
    } else {
      this.body.show = true;
      this.courses = [];
    }
  }

  async getCoursesWithFilterAndPagination() {
    // this.courses = [];
    let result: any = await this.Administrative.getExtensionCourseByFilterAndPagination(this.body).toPromise();
    console.log(result);
    this.courses = result;
    this.courses.map((c: any) => {
      c.dateCreated = c.dateCreated || moment();
    })
    console.log(this.courses);
    this.courses.sort((a: any, b: any) => b.extensionCoursesID - a.extensionCoursesID);
    this.body.show = false;
  }

  saveChanges() {
    let existsInDB: boolean = this.courses.filter((c: any) => c.courseName.toLowerCase() === this.newCourse.courseName.toLowerCase() && c.extensionCourseID !== this.newCourse.extensionCourseID).length >= 1;
    if (existsInDB) {
      Swal.fire({
        text: 'Ya existe un curso con ese nombre.',
        icon: 'error'
      });
      return;
    }
    Swal.fire({
      text: '¿Estás seguro de guardar los cambios?',
      icon: 'question',
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonColor: '#014898',
      allowEnterKey: false,
      allowOutsideClick: false,
      cancelButtonText: 'Cancelar'
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        this.newCourse.userCreated = this.user || 'MIGRA';
        if (!this.newCourse.editing) {
          let body: any = {
            news: [this.newCourse]
          };
          let resultInsert: any = await this.Administrative.postExtensionCourse(body).toPromise();
        } else {
          console.log(this.newCourse);
          let body: any = {
            updates: [this.newCourse]
          };
          let resultUpdate: any = await this.Administrative.updateExtensionCourse(body).toPromise();
        }
        Swal.fire({
          text: 'Se grabaron los cambios',
          icon: 'success'
        });
        this.toggleCourseModal();
        this.getQuantityOfCourses();
      }
    })
  }

  deleteCourse(course: any) {
    Swal.fire({
      text: `¿Estás seguro de ${course.statusID === 0 ? 'HABILITAR' : 'DESHABILITAR'} el curso?`,
      icon: 'question',
      showConfirmButton: true,
      confirmButtonColor: '#014898',
      showCancelButton: true,
      allowEnterKey: false,
      allowEscapeKey: false, 
      allowOutsideClick: false,
      cancelButtonText: 'Cancelar'
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        course.statusID = course.statusID === 0 ? 1 : 0;
        let body: any = {
          updates: [course]
        };
        let resultUpdate: any = await this.Administrative.updateExtensionCourse(body).toPromise();
        if (!resultUpdate) {
          Swal.fire({
            text: 'Hubo un error al procesar su solicitud del curso',
            icon: 'error'
          });
          return;
        }
        Swal.fire({
          text: `Se ${course.statusID === 1 ? 'HABILITÓ' : 'DESHABILITÓ'} el curso correctamente`,
          icon: 'success'
        });
        this.getQuantityOfCourses();
      }
    })
    // this.courses.splice(this.courses.indexOf(course), 1);
  }

  toggleSelectCourse(course: any) {
    course.selected = !course.selected;
    this.verifySelecteds();
  }

  verifySelecteds() {
    this.body.selectAll = this.courses.every((c: any) => c.selected === true);
  }

  selectAll() {
    this.body.selectAll = !this.body.selectAll;
    this.courses.map((c: any) => {
      c.selected = this.body.selectAll;
    });
  }

  async getReport() {
    let body: any = {
      filter: this.body.filter.text || '%'
    };
    let result: any = await this.Administrative.getExtensionCourseReport(body).toPromise();
    console.log(result);
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

}
