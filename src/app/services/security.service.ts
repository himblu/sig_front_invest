import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';

let url = environment.url;

@Injectable({
  providedIn: 'root'
})
export class SecurityService {

  constructor( private https: HttpClient ) { }

  encryptText(data: string) {
    return this.https.post(`${url}/api/encryption/encrypt`, {textToEncrypt: data});
  }

  decryptText(data: string) {
    return this.https.post(`${url}/api/encryption/decrypt`, {encryptedText: data});
  }
}