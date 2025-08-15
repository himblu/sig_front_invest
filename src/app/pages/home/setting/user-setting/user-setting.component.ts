import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdministrativeService } from '@services/administrative.service';
import { ApiService } from '@services/api.service';
import { CommonService } from '@services/common.service';
import { ROL } from '@utils/interfaces/login.interfaces';
import { SPGetPerson2 } from '@utils/interfaces/person.interfaces';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-setting',
  templateUrl: './user-setting.component.html',
  styleUrls: ['./user-setting.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class UserSettingComponent implements OnInit{

  constructor(
    private Administrative: AdministrativeService,
    private Common: CommonService,
    private Api: ApiService
  ) {
    
  }

  menu: any[] = [
    {
      id: 1, 
      title: 'Perfil',
      icon: 'fa fa-edit'
    },
    {
      id: 99, 
      title: 'Seguridad',
      icon: 'fa fa-shield'
    },
  ];

  menuSelected: any = {};

  profile: any = {};

  credentials: any = {};
  security: any = {};
  personID: number = 0;
  rolName: string = '';
  ngOnInit(): void {
    this.rolName = sessionStorage.getItem('rol');
    this.personID = +sessionStorage.getItem('personID');
    this.profile.fullName = sessionStorage.getItem('name');
    this.profile.username = sessionStorage.getItem('mail');
    this.toggleSelect(this.menu[0]);
  }

  toggleSelect(item: any) {
    this.menuSelected = item;
    this.getPersonInfo();
  }

  async getPersonInfo() {
    let res: any = await this.Common.getPerson(this.personID).toPromise();
    if (res.avatar) {
      this.getPersonImage(res);
    }
  }

  private getPersonImage(currentPerson: SPGetPerson2): void {
		if(currentPerson.avatar !== "default.png"){
			if(this.rolName === ROL.STUDENT){
				let rute= currentPerson.avatar.replace('upload/files/itca/docs/students/', '')
				this.Api.getPersonImage(this.personID, rute).subscribe({
					next: (res) => {
						this.createImageFromBlob(res);
					},
					error: (_err: HttpErrorResponse) => {
					}
				});
			}else{
				let rute= currentPerson.avatar.replace('api/file/view-employee/', '')
				this.Api.getEmployeeImage(rute).subscribe({
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
			 this.profile.avatar = reader.result;
		}, false);

		if (image) {
			 reader.readAsDataURL(image);
		}
	}

  // SEGURIDAD

  haveNumbers(text: string) {
    var numbers = "0123456789";
    for (let i = 0; i < text.length; i++) {
      if (numbers.indexOf(text.charAt(i), 0) != -1) {
        return 1;
      }
    }
    return 0;
  }

  haveLetters(text: string) {
    var letras = "abcdefghyjklmnñopqrstuvwxyz";
    text = text.toLowerCase();
    for (let i = 0; i < text.length; i++) {
      if (letras.indexOf(text.charAt(i), 0) != -1) {
        return 1;
      }
    }
    return 0;
  }

  haveLowerCases(text: string) {
    var letras = "abcdefghyjklmnñopqrstuvwxyz";
    for (let i = 0; i < text.length; i++) {
      if (letras.indexOf(text.charAt(i), 0) != -1) {
        return 1;
      }
    }
    return 0;
  }

  haveUpperCases(text: string) {
    var letras_mayusculas = "ABCDEFGHYJKLMNÑOPQRSTUVWXYZ";
    for (let i = 0; i < text.length; i++) {
      if (letras_mayusculas.indexOf(text.charAt(i), 0) != -1) {
        return 1;
      }
    }
    return 0;
  }

  getPasswordSecurity(password: string) {
    let secValue;
    let lengthSecurityValues = [0, 0, 0, 0, 10, 10, 30, 30, 30];
    if(password.length >= lengthSecurityValues.length) {
      secValue = 40;
    } else {
      secValue = lengthSecurityValues[password.length];
    }
    if (this.haveNumbers(password) && this.haveLetters(password)) {
      secValue += 30;
    }
    if (this.haveLowerCases(password) && this.haveUpperCases(password)) {
      secValue += 30;
    }
    return secValue;
  }

  verifyPassword(text: string, field: string) {
    this.security[field] = parseInt(this.getPasswordSecurity(text).toString());
    this.validCredentials()
  }

  validCredentials() {
    if (this.credentials.newPassword && this.credentials.repeatPassword) {
      this.credentials.valid = ((this.security.newPassword || 0) >= 60 && (this.security.repeatPassword || 0) >= 60) && this.credentials.newPassword == this.credentials.repeatPassword;
    } else {
      this.credentials.valid = false;
    }
  }

  toggleShowPasswords() {
    this.credentials.showPassword = !this.credentials.showPassword;
  }

  changePassword() {
    Swal.fire({
      text: '¿Estas seguro de cambiar tu contraseña?',
      icon: 'question',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      showConfirmButton: true,
      showCancelButton: true,
      cancelButtonText: 'Cancelar'
    }).then(async (choice) => {
      if (choice.isConfirmed) {
        Swal.fire({
          html: '<i class="fa fa-cog fa-spin fa-3x"></i> <br> <h2 class="text-center">Actualizando información de Usuario.</h2>',
          showConfirmButton: false,
          showCancelButton: false,
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false
        });
        let body: any = {
          userID: +sessionStorage.getItem('userId'),
          newPassword: this.credentials.newPassword
        };
        let result: any = await this.Administrative.updateUserPassword(body).toPromise();
        if (!result.success) {
          Swal.fire({
            text: result.message,
            icon: 'error'
          });
          return;
        }
        Swal.close();
        Swal.fire({
          text: result.message,
          icon: 'success'
        });
        this.credentials = {};
        this.security = {};
      }
    })
  }

  // FIN DE SEGURIDAD

}