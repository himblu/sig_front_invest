import { Component, ViewChild } from '@angular/core';
import { CommonService } from '@services/common.service';
import { SidebarService } from '@services/sidebar.service';
import { MatSidenav } from '@angular/material/sidenav';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { NavListComponent } from './components/nav-list/nav-list.component';
import { NavListItemComponent } from './components/nav-list-item/nav-list-item.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { NgFor, NgIf } from '@angular/common';
import { SlicePipe } from '@angular/common';
import { UserService } from '@services/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SPGetPerson2 } from '@utils/interfaces/person.interfaces';
import { ApiService } from '@services/api.service';
import { NgOptimizedImage } from '@angular/common';
import { User } from '@utils/models/user.models';
import { ROL } from '@utils/interfaces/login.interfaces';
import { AdministrativeService } from '@services/administrative.service';
import { ROLE_CODES } from 'app/constants';

@Component({
  selector: 'shared-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
	standalone:true,
	imports:[
		MatSidenavModule,
		MatToolbarModule,
		MatDividerModule,
		MatIconModule,
		MatMenuModule,
		MatProgressBarModule,
		//NavListComponent,
		//NavListItemComponent,
		RouterLink,
		NgClass,
		SlicePipe,
		NgFor,
		NgIf,
		NgOptimizedImage
	]
})
export class SidebarComponent {

	public currentUser: User;
	protected readonly ROL = ROL;

  image: string = "";
  name: string = "";
  email: string = "";
  menuItems: any[] = [];
  activeIndex: number;
	personImage: any;

  moduleNameRegister: string = 'REGISTRO/INSCRIPCIÓN';
  routesExcludesWithoutPostulation: any[] = ['/inscripcion/informacion-de-archivos', '/inscripcion/comprobantes-de-pago'];

  /* *********************************** COSTRUCTOR Y CICLO DE VIDA *********************************** */
	@ViewChild('sidenav') public sidenav: MatSidenav;

  constructor(
    private common: CommonService,
    private sider:SidebarService,
    private Router: Router,
    private ActivatesRoute: ActivatedRoute,
    private api: ApiService,
    private user: UserService,
    private Administrative: AdministrativeService
  ){
		this.currentUser = this.user.currentUser;
	  this.getPersonInfo();
  }

  async ngOnInit() {
    let userId = sessionStorage.getItem('mail');
    let personID = +sessionStorage.getItem('personID');
    let currentRoleID = +sessionStorage.getItem('rolID');
    let studentID = +sessionStorage.getItem('studentID');
    this.sider.getMenuFrontEnd()
    .subscribe({
      next: async (resp: any[]) => {
        let resultAssignScholarship: any = await this.Administrative.getStudentInfoToScholarshipAssign(studentID).toPromise();
        //console.log(resultAssignScholarship);

        let body: any = {
          filter: {
            statusFileID: 5,
            text: '%',
            rolID: 7,
            admissionPeriodID: 4
          }
        };

        let resultLegalized: any = await this.Administrative.getPostulantIsLegalized(personID).toPromise();
        // console.log(resultLegalizeds);
        // // let resultLegalizeds: any = await this.Administrative.getPostulantByText(body).toPromise();
        // //console.log(resultLegalizeds);
        // let legalizedFound: any = resultLegalizeds.find((r: any) => r.personID === personID);
        // //console.log(legalizedFound);
        if ((resultLegalized.isLegalized === 0 && currentRoleID === ROLE_CODES.POSTULANT)) {
          let excludes = ['Gestor de Instrumentos'.toUpperCase()];
          //console.log(resp);
          resp = resp.filter((r: any) => !excludes.includes(`${r.titulo}`.toUpperCase()));
          //console.log(excludes);
        }
        let resultPostulations: any = await this.Administrative.getPostulantByPersonIDAndLevelID(personID, 1).toPromise();
        if (!resultAssignScholarship.length) {
          //console.log(resp);
          resp = resp.filter((m: any) => m.menuID !== 239);
        } else {
          let currentAssign: any = resultAssignScholarship[0];
          console.log(currentAssign);
          if (!currentAssign.recordQualification.length) {
            resp = resp.filter((m: any) => m.menuID !== 239);
          }
        }
        this.menuItems = resp.map((item) => {
          // CONFIGURACIÓN PARA OTORGAR EL CODIGO DE USUARIO EN LA URL
          if (item.titulo.toUpperCase() === this.moduleNameRegister) {
            item.submenu.map((s: any) => {
              s.url = `${s.url}/${userId}`;
              if (s.url.includes('comprobantes-de-pago')) {
                s.url += '/financiero'
              }
            });
          //  if (!resultPostulations.length) {
          //   item.submenu = item.submenu.filter((m: any) => !this.routesExcludesWithoutPostulation.includes(m.url.split(`/${userId}`)[0]));
          //  }
          }
          if (resultAssignScholarship.length) {
            if (item.menuID === 239) {
              let currentAssign = resultAssignScholarship[0];
              item.submenu.map((s: any) => {
                s.url = `${s.url}`;
                if (s.url.includes('ficha-informativa-para-beca')) {
                  s.url += `/${currentAssign.assignStudentID}/${studentID}`;
                }
              })
            }
          }
					return {
						...item,
						expanded: false
					}
				});


        let url: any = this.ActivatesRoute.snapshot;
        if (this.menuItems.map((m: any) => m.titulo.toUpperCase()).includes(this.moduleNameRegister) && (url._routerState.url.endsWith('/administracion') || url._routerState.url === '/administracion')) {
          this.Router.navigate([`inscripcion/informacion-personal/${userId}`]);
        }
        this.menuItems.map((m: any) => {
          m.expanded = false;
          m.submenu.map((r: any) => {
            r.active = false;
          })
          let routeSelected: any = m.submenu.find((r: any) => r.url === url._routerState.url);
          if (routeSelected) {
            m.expanded = true;
            routeSelected.active = true;
          }
        });
      },
      error: (err: any) => {
      }
    });

    this.image = sessionStorage.getItem('img') || '';
    this.name = sessionStorage.getItem('name') || '';
    this.email = sessionStorage.getItem('mail') || '';
  }

  toggleSubMenu(item: any): void {
    item.expanded = !item.expanded;
  }
  selectedIndex(i:number, item?: any, list?: any){
    this.activeIndex=i;
    if (item) {
      list.submenu.map((x: any) => {
        x.active = false;
      })
      item.active = true;
    }
  }

  logout(){
    this.common.logout();
  }

	private getPersonInfo(): void {
		this.common.getPerson(this.user.currentUser.PersonId).subscribe({
			next: (res) => {
				if(res.avatar) this.getPersonImage(res);
				else this.personImage= null;
			},
			error: (_err: HttpErrorResponse) => {
			}
    });
	}

	private getPersonImage(currentPerson: SPGetPerson2): void {
		if(currentPerson.avatar !== "default.png"){
			if(this.currentUser.rolName === ROL.STUDENT){
				let rute= currentPerson.avatar.replace('upload/files/itca/docs/students/', '')
				this.api.getPersonImage(this.user.currentUser.PersonId, rute).subscribe({
					next: (res) => {
						this.createImageFromBlob(res);
					},
					error: (_err: HttpErrorResponse) => {
					}
				});
			}else{
				let rute= currentPerson.avatar.replace('api/file/view-employee/', '')
				this.api.getEmployeeImage(rute).subscribe({
					next: (res) => {
						this.createImageFromBlob(res);
					},
					error: (_err: HttpErrorResponse) => {
					}
				});
			}
		}
	}

	private createImageFromBlob(image: Blob) {
		let reader = new FileReader();
		reader.addEventListener("load", () => {
			 this.personImage = reader.result;
		}, false);

		if (image) {
			 reader.readAsDataURL(image);
		}
	}

}
