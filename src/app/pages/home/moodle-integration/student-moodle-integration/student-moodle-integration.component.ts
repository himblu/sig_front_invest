import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MoodleIntegrationService } from '@services/moodle-integration.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-student-moodle-integration',
  templateUrl: './student-moodle-integration.component.html',
  styleUrls: ['./student-moodle-integration.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class StudentMoodleIntegrationComponent implements OnInit{
  constructor(
    private ActivatedRoute: ActivatedRoute,
    private MoodleIntegration: MoodleIntegrationService
  ) {

  }

  postulant: any = {};
  admisionPeriodID: any;
  postulantID: any;
  ngOnInit() {
    Swal.fire({
      html: '<i class="fa fa-cog fa-spin fa-3x"></i> <br> <h2 class="text-center">Buscando Información de la Persona.</h2>',
      showConfirmButton: false,
      showCancelButton: false,
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false
    });
    let params: any = this.ActivatedRoute.snapshot.params;
    this.admisionPeriodID = 1;
    this.postulantID = parseInt(params.postulantID);
    this.getMemberInfo();
  }

  async getMemberInfo() {
    let resultPostulant: any = await this.MoodleIntegration.getMemberInfoByAdmissionPeriodIDAndPostulantID(this.admisionPeriodID, this.postulantID).toPromise();
    console.log(resultPostulant);
    if (!resultPostulant.length) {
      Swal.fire({
        text: 'No existe el Postulante buscado',
        icon: 'error'
      });
      return;
    }
    this.postulant = resultPostulant[0]
    let result: any = await this.MoodleIntegration.getCourseOfMemberByAdmissionPeriodIDAndPostulantID(this.admisionPeriodID, this.postulantID).toPromise();
    console.log(result);
    if (result.length) {
      result.map((r: any) => {
        r.score = r.score ? parseFloat(r.score) : 0;
      });
      this.postulant.courses = result;
      this.postulant.avg = parseFloat((result.reduce((m: number, i: any) => m + i.score,0) / result.length).toFixed(2));
      Swal.close();
    } else {
      this.postulant.dontHasAnswer = true;
      Swal.fire({
        text: 'No se tiene registros de cursos matriculados',
        icon: 'info'
      });
    }
  }
}
