import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdministrativeService } from '@services/administrative.service';
import { localToSessionStorage } from '@utils/functions';
import { PipesModule } from 'app/pipes/pipes.module';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-select-career',
  templateUrl: './select-career.component.html',
  styleUrls: ['./select-career.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    PipesModule
  ],
  standalone: true
})
export class SelectCareerComponent implements OnInit {

  constructor(
    private Administrative: AdministrativeService,
    private Router: Router
  ) {}

  careers: any[] = [];
  careerSelected: any = {};
  filter: any = {};
  ngOnInit() {
    this.careers = JSON.parse(sessionStorage.getItem('careers') || localStorage.getItem('careers') || '[]');
    if (!this.careers.length) {
      Swal.fire({
        text: 'No deberías estar aquí',
        icon: 'error'
      });
      this.Router.navigateByUrl('/autenticacion/iniciar-sesion').then();
      return;
    }
  }

  toggleSelectCareer(career: any) {
    this.careerSelected = career;
		//console.log('this.careerSelected', this.careerSelected);
  }

  continueToDashboard() {
    localStorage.setItem('career', this.careerSelected.careerName);
    localStorage.setItem('careerID', String(this.careerSelected.careerID));
    localStorage.setItem('studentID', String(this.careerSelected.studentID));
		localStorage.setItem('cycle', String(this.careerSelected.cycle));
    this.Router.navigateByUrl('/administracion').then();
  }

}
