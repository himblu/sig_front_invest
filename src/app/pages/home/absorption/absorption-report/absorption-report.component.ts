import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdministrativeService } from '@services/administrative.service';
import { CommonService } from '@services/common.service';
import { RECORD_NUMBERS } from 'app/constants';
import { MaterialComponentModule } from 'app/material-component/material-component.module';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import Swal from 'sweetalert2';
import { MatSnackBar,MatSnackBarModule} from '@angular/material/snack-bar';


@Component({
  selector: 'app-absorption-report',
  templateUrl: './absorption-report.component.html',
  styleUrls: ['./absorption-report.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialComponentModule,
    BsDropdownModule,
    MatSnackBarModule,
  ]
})
export class AbsorptionReportComponent implements OnInit {

  constructor(
    private Administrative: AdministrativeService,
    private Common: CommonService,
    private snackBar: MatSnackBar,
  ) {

  }

  userLoged: any;
  filter: any = {};
  recordNumbers: number[] = RECORD_NUMBERS;
  pagination: any = {
    recordNumber: RECORD_NUMBERS[0]
  };
  students: any[] = [];
  report: any = {}
  searching: boolean = false;
  searched: boolean = false;
  periods: any[] = [];
  colleges: any[] = [];
  isDisabled: boolean = false;
  rolID: number;

  reportTypes: any = [
    {
      id: 'report-result-chaside',
      name: 'Resultados Individuales Chaside',
      filter: false,
      recordType:['I', 'C'],
    },
    {
      id: 'report-result-gardner',
      name: 'Resultados Individuales Gardner',
      filter: false,
      recordType:['I'],
    },
    {
      id: 'report-result-mauricio-gex',
      name: 'Resultados Individuales Mauricio gex',
      filter: false,
      recordType:['I'],
    },
    {
      id: 'report-result-general',
      name: 'Resultados Generales Chaside',
      filter: false,
      recordType:['I','C'],
    },
    {
      id: 'report-result-general-mauricio',
      name: 'Resultados Generales Mauricio Gex',
      filter: false,
      recordType:['I'],
    },
    {
      id: 'report-result-general-gardner',
      name: 'Resultados Generales Gardner',
      filter: false,
      recordType:['I'],
    },
    {// solo para secretaria
      id: 'report-result-encuesta',
      name: 'Resultados Generales Encuesta',
      filter: false,
      recordType:['I', 'C'],
    },
    {
      id: 'report-result-interest',
      name: 'Reporte de interesados',
      filter: false,
      recordType:['C'],
    },
    // {
    //   id: 'student-by-statusFile',
    //   name: 'Estudiantes por Estado',
    //   filter: true,
    // },
  ];
  filteredReportTypes: any [];

  query: any = {};

  collegeTypes: any[] = [];


  recordTypes: any[] = [
    {
      id: 'C',
      name: 'Externo'
    },
    {
      id: 'I',
      name: 'Interno'
    },
  ]

  ngOnInit(): void {
    // this.getCollegeTypes();
    this.selectRecordTypeByRol();
    // this.getColleges();
  }

  filterReportTypes() {
    if (this.filter.recordType) {
      this.filteredReportTypes = this.reportTypes.filter((r: any) =>
        r.recordType.includes(this.filter.recordType)
      );
    }
  }

  async getColleges() {
    const storedPersonID = parseInt(sessionStorage.getItem('personID'));
    if(this.rolID===30){
      this.filter.recordType='C';
      this.filterReportTypes();
      this.isDisabled = true;
      let result: any= await this.Administrative.getCollegeByPerson(storedPersonID).toPromise();
      this.colleges = result;
      this.colleges.map((c: any) => {
        c.collegeID = c.institutionID;
      });
      this.filter.collegeID =  this.colleges[0].collegeID;
    }else{
      let result: any = await this.Administrative.getInstitutionToSurvey().toPromise();
      this.colleges = result;
      this.colleges.map((c: any) => {
        c.collegeID = c.institutionID;
      });
      this.colleges.unshift({
        institutionID: 0,
        collegeID: 0,
        collegeName: 'Todos'
      });
    }
  }

  async getCollegeTypes() {
    let result: any = await this.Administrative.getCollegeType(1, 10).toPromise();
    // console.log(result);
    this.collegeTypes = result.data;
  }

  async getCollegesByCollegeType() {
    if (this.filter.collegeTypeID) {
      let result: any = await this.Administrative.getCollegeTypeByCountryIDAndCollegeType(59, this.filter.collegeTypeID).toPromise();
      // console.log(result);
      this.colleges = result;
    }
  }

  resetSearch() {
    if(this.rolID===30){
      this.filter.recordType='C';
      this.filterReportTypes();
      this.isDisabled = true;
    }else{
      this.filter = {};
      this.isDisabled = false;
      this.filter.collegeID = undefined;
    }
    this.students = [];
    this.searched = false;
    this.searching = false;
  }

  selectReportType(type: any) {
    this.report.typeName = type.name;
    this.report.type = type.id;
    this.report.filter = type.filter;
  }

  async generateReport() {
    let file: any;
    Swal.fire({
      html: '<i class="fa fa-cog fa-spin fa-3x"></i> <br> <h2 class="text-center">Buscando Información de la Persona.</h2>',
      showConfirmButton: false,
      showCancelButton: false,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    });
    
    switch (this.report.type) {
      case 'report-result-chaside':
        file = await this.Administrative.getReportResultChaside(this.filter.collegeID || 0, this.filter.startDate || '2024-01-01', this.filter.finishDate || '2099-12-31', this.filter.recordType).toPromise();
      break;
      case 'report-result-gardner':
        file = await this.Administrative.getReportResultGardner(this.filter.collegeID || 0, this.filter.startDate || '2024-01-01', this.filter.finishDate || '2099-12-31', this.filter.recordType).toPromise();
      break;
      case 'report-result-mauricio-gex':
        file = await this.Administrative.getReportResultMauricioGex(this.filter.collegeID || 0, this.filter.startDate || '2024-01-01', this.filter.finishDate || '2099-12-31', this.filter.recordType).toPromise();
      break;
      case 'report-result-general':
        file = await this.Administrative.getReportResultGeneral(this.filter.collegeID || 0, this.filter.startDate || '2024-01-01', this.filter.finishDate || '2099-12-31', this.filter.recordType).toPromise();
      break;
      case 'report-result-encuesta':
        file = await this.Administrative.getReportResultGeneralEncuesta(this.filter.collegeID || 0, this.filter.startDate || '2024-01-01', this.filter.finishDate || '2099-12-31', this.filter.recordType).toPromise();
        break;
      case 'report-result-interest':
        file = await this.Administrative.getReportResultGeneralIntersert(this.filter.collegeID || 0, this.filter.startDate || '2024-01-01', this.filter.finishDate || '2099-12-31', this.filter.recordType).toPromise();
        break;
      case 'report-result-general-mauricio':
        file = await this.Administrative.getReportResultGeneralMauricio(this.filter.collegeID || 0, this.filter.startDate || '2024-01-01', this.filter.finishDate || '2099-12-31', this.filter.recordType).toPromise();
        break;
      case 'report-result-general-gardner':
        file = await this.Administrative.getReportResultGeneralGardner(this.filter.collegeID || 0, this.filter.startDate || '2024-01-01', this.filter.finishDate || '2099-12-31', this.filter.recordType).toPromise();
        break;
    default:
      break;
    }
    // console.log(file);
    const blob = new Blob([file]);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `archivo.xlsx`;
    document.body.appendChild(a);
    a.click();
    Swal.close();
  }

  async searchQuantity() {
    this.searching = true;
    this.searched = false;
    this.query = {
      filter: {
        text: this.filter.text ? `%${this.filter.text.replace(/\s+/g, "%")}%` : '%',
        recordType: this.filter.recordType,
        collegeID: this.filter.collegeID || 0,
        startDate: this.filter.startDate || null,
        finishDate: this.filter.finishDate || null
      }
    };
    let result: any = await this.Administrative.getSchoolboyByTextQuantity(this.query).toPromise();
    // console.log(result);
    this.pagination.totalRecords = result.quantity;
    if (this.pagination.totalRecords > 0) {
      this.pagination.currentPage = 1;
      this.getStudents();
    } else {
      this.searching = false;
      this.searched = true;
      this.students = [];
    }
  }

  async getStudents() {
    this.query.pagination = this.pagination;
    let result: any = await this.Administrative.getSchoolboyByTextAndPagination(this.query).toPromise();
    // console.log(result);
    this.students = result;
    this.students.map((s: any) => {
      s.personID = s.personId;
    });
    this.searching = false;
    this.searched = true; 
  }

  goToPage(page: any) {
    if (page != this.pagination.currentPage) {
      this.pagination.currentPage = page;
      this.getStudents();
    }
  }

  async showIndividuaReport(item: any) {
    // console.log(item);
    Swal.fire({
      html: '<i class="fa fa-cog fa-spin fa-3x"></i> <br> <h2 class="text-center">Buscando Datos del Reporte.</h2>',
      showConfirmButton: false,
      showCancelButton: false,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    });
    let resultFilepath: any;
    let file: any;
    try {
      switch (item.surveyTypeID) {
        case 1:
          file = await this.Administrative.getReportResultIndividual(item.personID, item.surveyConfigID).toPromise();
          break;
        // case 2:
        //   break;
        default:
          file = await this.Administrative.getReportResultEncuestaIndividual(item.personID, item.surveyConfigID).toPromise();
          break;
      }
      // file = await this.Common.getFileOfServer({filePath: resultFilepath.filepath}).toPromise();
      //console.log(file);
      const blob = new Blob([file]);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `archivo.pdf`;
      document.body.appendChild(a);
      a.click();
    } catch (error: any) {
      // console.log(error);
      this.snackBar.open(
        `No hay datos disponibles para generar el reporte.`,
        '',
        {
          horizontalPosition: 'center',
          verticalPosition: 'top',
          duration: 3000,
          panelClass: ['red-snackbar']
        }
      );
    } finally {
      Swal.close();
    }
  }

  selectRecordType() {
    this.filterReportTypes();
    this.filter.collegeID = undefined;
    this.isDisabled = true;
  }

  async selectRecordTypeByRol() {
    const storedrolID = sessionStorage.getItem('rolID');
    this.rolID= parseInt(storedrolID);
    if(this.rolID===30){
      this.filter.recordType='C';
      this.filterReportTypes();
      this.filter.collegeID = undefined;
      this.isDisabled = true;
    }
    this.getColleges();
  }
}
