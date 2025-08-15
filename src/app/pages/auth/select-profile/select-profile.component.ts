import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdministrativeService } from '@services/administrative.service';
import { localToSessionStorage } from '@utils/functions';
import { PipesModule } from 'app/pipes/pipes.module';
import { OnDestroyMixin, untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

@Component({
  selector: 'app-select-profile',
  templateUrl: './select-profile.component.html',
  styleUrls: ['./select-profile.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PipesModule
  ]
})
export class SelectProfileComponent extends OnDestroyMixin implements OnInit, OnDestroy {

  constructor(
    private Administrative: AdministrativeService,
    private Router: Router
  ) { super(); }

  filter: any = {};

  personID: any;
  profiles: any[] = [];
  profileSelected: any = {};

  ngOnInit(): void {
    this.personID = +sessionStorage.getItem('id') || +localStorage.getItem('id');
    this.getProfiles();
  }

	override ngOnDestroy(): void {
		super.ngOnDestroy();
	}

  async getProfiles() {
    let result: any = await this.Administrative.getUserProfiles(this.personID).toPromise();
    this.profiles = result;
  }

  toggleSelectProfile(profile: any) {
    this.profileSelected = profile;
  }

  async continueToDashboard() {
    if (this.profileSelected.rolID === 5) {
      let careers: any = await this.Administrative.getCareerByPerson(this.personID).toPromise();
      //console.log(careers);
      careers = careers.filter((c: any) => c.currentCareer === 'Y');
      if (!careers.length) {
        this.Router.navigateByUrl('/administracion').then();
      } else {
        localStorage.setItem('rol', this.profileSelected.rolName);
        localStorage.setItem('rolID', String(this.profileSelected.rolID));
        if (careers.length === 1) {
          localStorage.setItem('careerID', careers[0].careerID);
          localStorage.setItem('career', careers[0].careerName);
          localStorage.setItem('studentID', careers[0].studentID);
					localStorage.setItem('cycle', careers[0].cycle);
					localToSessionStorage();
          this.Router.navigateByUrl('/administracion').then();
        } else {
          localStorage.setItem('careers', JSON.stringify(careers));
					localToSessionStorage();
          this.Router.navigateByUrl('/autenticacion/seleccionar-carrera').then();
        }
      }
    } else {
      localStorage.setItem('rol', this.profileSelected.rolName);
      localStorage.setItem('rolID', String(this.profileSelected.rolID));
			localToSessionStorage();
      this.Router.navigateByUrl('/administracion').then();
    }
  }


}
