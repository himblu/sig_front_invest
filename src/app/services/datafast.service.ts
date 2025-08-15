import { Injectable } from '@angular/core';
import { AdministrativeService } from './administrative.service';
import { CheckoutBody } from 'app/pages/home/sale/shopping-cart/shopping-cart.component';

@Injectable({
  providedIn: 'root'
})
export class DatafastService {
  private scriptId = 'datafast-widget';
  private formSelector = '.paymentWidgets';

  constructor(
    private Administrative: AdministrativeService
  ) {}

  /** Limpia cualquier dato guardado por el widget en localStorage o sessionStorage */
  clearStorage(): void {
    Object.keys(localStorage).forEach((key) => {
      if (key.includes('eu-test.oppwa.com')) localStorage.removeItem(key);
    });
    Object.keys(sessionStorage).forEach((key) => {
      if (key.includes('eu-test.oppwa.com')) sessionStorage.removeItem(key);
    });
  }

  /** Elimina el script del widget y limpia wpwl del window */
  removeOldScriptAndForm(): void {
    document.querySelectorAll(this.formSelector).forEach((el) => el.remove());
    document.getElementById(this.scriptId)?.remove();
    delete (window as any).wpwl;
    delete (window as any).wpwlOptions;
  }

  /** Inserta el formulario en el contenedor indicado */
  insertForm(containerSelector: string): void {
    const container = document.querySelector(containerSelector);
    if (!container) {
      console.error('Contenedor no encontrado para insertar el formulario.');
      return;
    }

    if (container.querySelector(this.formSelector)) {
      console.warn('Ya existe un formulario en el contenedor.');
      return;
    }

    const newForm = document.createElement('form');
    newForm.className = 'paymentWidgets';
    newForm.setAttribute('data-brands', 'VISA MASTER DINERS DISCOVER AMEX');
    container.appendChild(newForm);
  }
  

  async getCheckoutIDDatafast(body: CheckoutBody): Promise<string>{
    if (!body.amount) {
      console.log('Error: El monto de pago es inválido.');
      return '';
    }

    // console.log('amount',amount)
    return new Promise((resolve, reject) => {
      // envio default 0.01
      this.Administrative.getCheckoutIDDatafast(body).subscribe({
      // this.Administrative.getCheckoutIDDatafast(7).subscribe({
        next: (response: any) => {
          if (response.checkoutId) {
            resolve(response.checkoutId);
          } else {
            console.log('No se recibió checkoutID');
            resolve('');
          }
        },
        error: (error) => {
          console.log('Error al crear checkout:', error);
          reject(error);
        }
      });
    });
  }

  /** Carga el script de Datafast usando el checkoutId */
  async loadScript(checkoutId: string): Promise<void> {
    // console.log('Llega loadScript con checkoutId:', checkoutId);
    return new Promise((resolve, reject) => {
      document.getElementById(this.scriptId)?.remove();

      const script = document.createElement('script');
      script.src = `https://eu-test.oppwa.com/v1/paymentWidgets.js?checkoutId=${checkoutId}`;
      script.id = this.scriptId;
      script.async = true;

      script.onload = () => {
        // console.log('Script cargado. typeof wpwl:', typeof (window as any)['wpwl']);
        resolve();
      };
      script.onerror = () => reject('Error al cargar el script de Datafast');
      document.body.appendChild(script);
    });
  }

  /** Reinicia todo y vuelve a cargar el widget de pago */
  async reloadWidget(checkoutId: string, containerSelector: string): Promise<void> {
    // console.log('reloadWidget con checkoutId:', checkoutId);
    const container = document.querySelector(containerSelector);
    if (!container) {
      console.error('Contenedor no encontrado para insertar el formulario.');
      return;
    }

    this.removeOldScriptAndForm();
    this.insertForm(containerSelector);

    try {
      await this.loadScript(checkoutId);
      // console.log('Script de Datafast cargado correctamente.');
      this.waitForWpwlInit();
    } catch (error) {
      console.error('Error al cargar el script de Datafast:', error);
    }
  }

  /** Reintenta hasta que wpwl esté disponible para inicializar */
  private waitForWpwlInit(retries = 10, delay = 300): void {
    const form = document.querySelector(this.formSelector);

    if ((window as any).wpwl?.init && form) {
      // console.log('wpwl disponible y formulario presente. Inicializando...');
      (window as any).wpwl.init();
    } else if (retries > 0) {
      // console.warn(`wpwl o formulario no disponible. Reintentando en ${delay}ms...`);
      setTimeout(() => this.waitForWpwlInit(retries - 1, delay), delay);
    } else {
      console.error('wpwl no se pudo inicializar después de varios intentos.');
    }
  }

  /** Configura los eventos globales del widget */
  configureWidget(onComplete: (data: any) => void, onError: (err: any) => void): void {
    (window as any).wpwlOptions = {
      style: 'card',
      widgetMode: 'inline',
      onReady: () => console.log('Widget listo'),
      onComplete,
      onError
    };
  }

  /** Limpia el script, el formulario y el storage */
  reset(): void {
    this.removeOldScriptAndForm();
    this.clearStorage();
  }
}