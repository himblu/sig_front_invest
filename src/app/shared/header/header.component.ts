import { HttpErrorResponse } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AdministrativeService } from '@services/administrative.service';
import { ApiService } from '@services/api.service';
import { CommonService } from '@services/common.service';
import { ShoppingCartService } from '@services/shoppingCart.service';
import { UserService } from '@services/user.service';
import { ROL } from '@utils/interfaces/login.interfaces';
import { SPGetPerson2 } from '@utils/interfaces/person.interfaces';
import { User } from '@utils/models/user.models';
import { ModalDirective } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'shared-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

	public currentUser: User;
	protected readonly ROL = ROL;

  image: string = "";
  name: string = "";
  email: string = "";
	rol: string= "";
	careerName: string = '';
	personImage: any;
	personID: number;
	userID: number;
	profiles: any[] = [];
  QRUser: any;
	shoppingCart: any = {
		pendingSales: false
	};
	continueQueryingShoppingCart: boolean = false;

  constructor( private common:CommonService,
	private user: UserService,
	private api: ApiService,
	private Administrative: AdministrativeService,
	private Router: Router,
	private cartService: ShoppingCartService
	 ){
		this.currentUser = this.user.currentUser;
		this.getPersonInfo();
	 }

  @ViewChild('QRModal', {static: false}) QRModal: ModalDirective;

  ngOnInit(): void {
    this.image = sessionStorage.getItem('img') || '';
    this.name = sessionStorage.getItem('name') || '';
    this.email = sessionStorage.getItem('mail') || '';
		this.rol = sessionStorage.getItem('rol') || '';
		this.careerName = sessionStorage.getItem('career') || '';
		this.personID = +sessionStorage.getItem('id');
		this.userID = +sessionStorage.getItem('userId');
		this.getShoppingCarts();
		this.getProfiles();
		this.cartService.cartState.subscribe(state => {
			if(state){
				this.getShoppingCarts();
				this.cartService.cartState.next(false);
			}
		});
  }

	public async getShoppingCarts() {
		let result: any = await this.Administrative.getShoppingCartByPerson(this.personID).toPromise();
		if (!result.length) {
			let body: any = {
				news: [{
					personID: this.personID,
					createdBy: this.userID,
					statusID: 1
				}]
			};
			let resultInsert: any = await this.Administrative.saveShoppingCart(body).toPromise();
			this.shoppingCart = resultInsert;
			this.shoppingCart.pendingSales = false;
		} else {
			this.shoppingCart = result.find((i: any) => i.statusID === 1);
			this.shoppingCart.pendingSales = this.shoppingCart.statuses.filter((s: any) => s.statusID === 1).length;
			this.shoppingCart.havePendingSales = this.shoppingCart.pendingSales > 0;
			this.continueQueryingShoppingCart = true;
		}
		//console.log(this.shoppingCart)
	}

  async getProfiles() {
	let result: any = await this.Administrative.getUserProfiles(this.personID).toPromise();
	this.profiles = result;
  }

  logout(){
    this.common.logout();
  }

  toSelectProfile() {
	this.Router.navigateByUrl('/autenticacion/seleccionar-perfil').then();
  }

	private getPersonInfo(): void {
		this.common.getPerson(this.user.currentUser.PersonId).subscribe({
			next: (res) => {
				//console.log('currentPerson', res);
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

	async generateUserQRCode() {
		//console.log(this.user);
		let body: any = {
			data: {
				userID: sessionStorage.getItem('userId'),
				username: sessionStorage.getItem('mail'),
				personID: sessionStorage.getItem('id'),
			}
		};
		let QRGenerate: any = await this.Administrative.generateUserQRCode(body).toPromise();
    if (!QRGenerate) {
      Swal.fire({
        text: 'Hubo un error al generar el QR del Usuario',
        icon: 'error'
      });
      return;
    }
    this.QRUser = QRGenerate.result;
    this.QRModal.config.keyboard = false;
    this.QRModal.config.ignoreBackdropClick = true;
    this.QRModal.show();
	}

  closeQRModal() {
    this.QRModal.hide();
  }

}
