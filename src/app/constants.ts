export const RECORD_NUMBERS = [10,20,50,100];

export const INTERVAL_TIMES = [15,30,45,60];
export const APP_EXTERN_UNACEM = 'UN4C3M';

export const WEEK = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

export const CREATION_DATE = '1990-08-05';

export const ROLE_CODES = {
  POSTULANT: 6, 
  STUDENT: 5
}

export function onlyNumbers(e: any) {
  if (!(e.charCode >= 48 && e.charCode <= 57)) e.preventDefault();
}

export function onlyLetters(e: any) {
  if ((e.charCode >= 48 && e.charCode <= 57)) e.preventDefault();
}

export function alphaNumeric(e: any) {
  let regex = new RegExp(/^[0-9a-zA-Z\s+.,]+$/);
  if (!regex.test(e.key)) e.preventDefault();
}

export function alphaNumericToEmail(e: any) {
  let regex = new RegExp(/^[0-9a-zA-Z\s+.,@]+$/);
  if (!regex.test(e.key)) e.preventDefault();
}

export function buildPagination(totalRows: number, numberRow: number) {
  let pages = [];
  for (let p = 1; p <= Math.ceil(totalRows / numberRow); p++) {
    pages.push(p);
  }
  return pages;
}
