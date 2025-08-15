import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdministrativeService } from '@services/administrative.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  standalone: true,
  styleUrls: ['./change-password.component.css'],
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class ChangePasswordComponent implements OnInit{

  constructor(
    private Administrative: AdministrativeService,
    private Router: Router
  ) {

  }

  credentials: any = {};
  security: any = {};
  personID: number = 0;
  ngOnInit(): void {
    this.personID = +sessionStorage.getItem('personID');
  }

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
        let profiles: any = await this.Administrative.getUserProfiles(this.personID).toPromise();
        //console.log(profiles);
        if (!profiles.length) {
          Swal.fire({
            text: 'No cuentas con perfiles para ingresar al Sistema de ITCA',
            icon: 'error'
          });
          return;
        } else {
          if (profiles.length === 1) {
            sessionStorage.setItem('rol', profiles[0].rolName);
            sessionStorage.setItem('rolID', String(profiles[0].rolID));
            this.Router.navigateByUrl('/administracion').then();
          } else {
            this.Router.navigateByUrl('/autenticacion/seleccionar-perfil').then();
          }
        }
      }
    })
  }

}
