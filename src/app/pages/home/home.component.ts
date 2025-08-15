import { SidebarService } from './../../services/sidebar.service';
import { Component, OnInit } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { Router, RouterOutlet } from '@angular/router';
import { CommonService } from '@services/common.service';
import { SidebarComponent } from '@shared/sidebar/sidebar.component';
import { AdministrativeService } from '@services/administrative.service';

declare function functionInit(): void;
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  imports: [
    SharedModule,
    RouterOutlet,
		SidebarComponent
  ],
  standalone: true,
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {
  fecha = new Date().getFullYear();
  constructor( 
    private siderBar:SidebarService, 
    private common: CommonService, 
    private Administrative: AdministrativeService,
    private router: Router
  ) {
  }
  async ngOnInit() {
    functionInit();
    // // const url = environment.url;
    // let userID: any = +sessionStorage.getItem('userId');
    // let rolID: any = +sessionStorage.getItem('rolID');
    // let companyID: any = 1;
    // let result: any = await this.Administrative.getMenuOfUserIDAndRolIDAndCompanyID(userID, rolID, companyID).toPromise();
    
    // console.log(result);


    this.siderBar.getMenuFrontEnd();
    
  }

  checkIfUserCompleteGolden(){
    //TODO: service check not pass
  }

  goToTermsAndConditions() {
    this.router.navigate(['/politicas/terminos']);  // Redirige a /terminos-condiciones
  }
  goToPoliciesPayment() {
    this.router.navigate(['/politicas/pagos']);  // Redirige a /terminos-condiciones
  }
  goToPoliciesShipping() {
    this.router.navigate(['/politicas/envio']);  // Redirige a /terminos-condiciones
  }
}
