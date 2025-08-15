import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot  } from '@angular/router';
import { CommonService } from '../common.service';
import { forkJoin, map, Observable, switchMap } from 'rxjs';
import { DOCUMENT_CODES } from '../../utils/interfaces/others.interfaces';
import { inject } from '@angular/core';
import { AdministrativeService } from '@services/administrative.service';

export const PersonalDocumentsGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const common: CommonService = inject(CommonService);
  const personId = Number(sessionStorage.getItem('id'));
	const studentID = Number(sessionStorage.getItem('studentID'));
  const observables: Observable<any>[] = [
    common.validRouteEnrollment(DOCUMENT_CODES.ITCA_UPDATE_INFORMATION),
    common.validRouteEnrollment(DOCUMENT_CODES.ITCA_SOCIOECONOMIC_SHEET),
    common.validRouteEnrollment(DOCUMENT_CODES.ITCA_ENROLLMENT),
    common.validRouteEnrollment(DOCUMENT_CODES.ITCA_DOCUMENT),
    common.validRouteEnrollment(DOCUMENT_CODES.ITCA_PROOF_PAYMENT),
    common.getLastState(studentID)
  ];

  return forkJoin(observables)
    .pipe(map(([updateInformation, socioEconomicSheet, enrollment, documents, payments, statusStudent]) => {
      if(statusStudent[0].state === 'EGRESADO'){
        common.message(
          'Ha culminado sus niveles exitosamente.',
          '',
          'info',
        '#86bc57'
        );
        return false;
      }
      if(documents){
        common.message(
          'Los Documentos ya han sido cargados.',
          '',
          'warning',
          '#2eb4d8'
        );
        return false;
      }
      if (updateInformation && socioEconomicSheet) {
        return true;
      }

      if(payments && enrollment && documents && updateInformation && socioEconomicSheet){
        common.message(
          'El proceso se ha sido realizado exitosamente.',
          '',
          'success',
          '#2eb4d8'
        );
        return false;
      }
      common.message(
      'Debes ingresar la Información de Ficha Socioeconómica.',
      '',
      'info',
      '#2eb4d8');
      return false;
    }));
};

export const SocioEconomicSheetGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const common: CommonService = inject(CommonService);
  const personId = Number(sessionStorage.getItem('id'));
	const studentID = Number(sessionStorage.getItem('studentID'));
  const observables: Observable<any>[] = [
    common.validRouteEnrollment(DOCUMENT_CODES.ITCA_UPDATE_INFORMATION),
    common.validRouteEnrollment(DOCUMENT_CODES.ITCA_SOCIOECONOMIC_SHEET),
    common.validRouteEnrollment(DOCUMENT_CODES.ITCA_ENROLLMENT),
    common.validRouteEnrollment(DOCUMENT_CODES.ITCA_DOCUMENT),
    common.validRouteEnrollment(DOCUMENT_CODES.ITCA_PROOF_PAYMENT),
    common.getLastState(studentID)
  ];

  return forkJoin(observables)
    .pipe(map(([updateInformation, socioEconomicSheet, enrollment, documents, payments, statusStudent]) => {
      if(statusStudent[0].state === 'EGRESADO'){
        common.message(
          'Ha culminado sus niveles exitosamente.',
          '',
          'info',
        '#86bc57'
        );
        return false;
      }
      if(socioEconomicSheet){
        common.message(
          'La Ficha Socioeconómica ya ha sido ingresada.',
          '',
          'warning',
          '#2eb4d8'
        );
        return false;
      }
      if (updateInformation) {
        return true;
      }
      if(payments && enrollment && documents && updateInformation && socioEconomicSheet){
        common.message(
          'El proceso se ha sido realizado exitosamente.',
          '',
          'success',
          '#2eb4d8'
        );
        return false;
      }
      common.message(
      'Debes realizar la Actualización de Información .',
      '',
      'info',
      '#2eb4d8');
      return false;
    }));
};

export const EnrollmentGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const common: CommonService = inject(CommonService);
  const personId = Number(sessionStorage.getItem('id'));
	const studentID = Number(sessionStorage.getItem('studentID'));
  const observables: Observable<any>[] = [
    common.validRouteEnrollment(DOCUMENT_CODES.ITCA_UPDATE_INFORMATION),
    common.validRouteEnrollment(DOCUMENT_CODES.ITCA_SOCIOECONOMIC_SHEET),
    common.validRouteEnrollment(DOCUMENT_CODES.ITCA_ENROLLMENT),
    common.validRouteEnrollment(DOCUMENT_CODES.ITCA_DOCUMENT),
    common.validRouteEnrollment(DOCUMENT_CODES.ITCA_PROOF_PAYMENT),
    common.getLastState(studentID)
  ];

  return forkJoin(observables)
    .pipe(map(([updateInformation, socioEconomicSheet, enrollment, documents, payments, statusStudent]) => {
      if(statusStudent[0].state === 'EGRESADO'){
        common.message(
          'Ha culminado sus niveles exitosamente.',
          '',
          'info',
        '#86bc57'
        );
        return false;
      }
      if(enrollment){
        common.message(
          'La Matrícula ya ha sido generada.',
          '',
          'warning',
          '#2eb4d8'
        );
        return false;
      }

      if (updateInformation && socioEconomicSheet && documents) {
        return true;
      }

      if(payments && enrollment && documents && updateInformation && socioEconomicSheet){
        common.message(
          'EL proceso se ha sido realizado exitosamente.',
          '',
          'success',
          '#2eb4d8'
        );
        return false;
      }

      common.message(
      'Debes realizar el Registro de Documentos.',
      '',
      'info',
      '#2eb4d8');
      return false;
    }));
};

export const ProofPaymentGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const common: CommonService = inject(CommonService);
	const studentID = Number(sessionStorage.getItem('studentID'));
  const observables: Observable<any>[] = [
    common.validRouteEnrollment(DOCUMENT_CODES.ITCA_UPDATE_INFORMATION),
    common.validRouteEnrollment(DOCUMENT_CODES.ITCA_SOCIOECONOMIC_SHEET),
    common.validRouteEnrollment(DOCUMENT_CODES.ITCA_ENROLLMENT),
    common.validRouteEnrollment(DOCUMENT_CODES.ITCA_DOCUMENT),
    common.validRouteEnrollment(DOCUMENT_CODES.ITCA_PROOF_PAYMENT),
    common.getLastState(studentID)
  ];

  return forkJoin(observables)
    .pipe(map(([updateInformation, socioEconomicSheet, enrollment, documents, payments, statusStudent]) => {
      if(statusStudent[0].state === 'EGRESADO'){
        common.message(
          'Ha culminado sus niveles exitosamente.',
          '',
          'info',
        '#86bc57'
        );
        return false;
      }
      if(payments){
        common.message(
          'El Registro de Comprobante ya ha sido ingresado.',
          '',
          'warning',
          '#2eb4d8'
        );
        return false;
      }
      if (updateInformation && socioEconomicSheet && enrollment && documents) {
        return true;
      }

      if(payments && enrollment && documents && updateInformation && socioEconomicSheet){
        common.message(
          'EL proceso se ha sido realizado exitosamente.',
          '',
          'success',
          '#2eb4d8'
        );
        return false;
      }

      common.message(
      'Debes realizar el proceso de Matrícula de Carrera.',
      '',
      'info',
      '#2eb4d8');
      return false;
    }));
};

export const CheckProcessUserGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const personId = Number(sessionStorage.getItem('id'));
		const studentID = Number(sessionStorage.getItem('studentID'));
    const common: CommonService = inject(CommonService);
		const admin: AdministrativeService = inject(AdministrativeService);
    return common.getPerson(personId).pipe(
      switchMap((personInfo) => {
        const observables: Observable<any>[] = [
          common.checkEnrollStudent(personId),
          common.getPsychologicalTest(personInfo.identity),
          common.validRouteEnrollment(DOCUMENT_CODES.ITCA_UPDATE_INFORMATION),
          common.getLastState(studentID),
          common.validRouteEnrollment(DOCUMENT_CODES.ITCA_SOCIOECONOMIC_SHEET),
          common.validRouteEnrollment(DOCUMENT_CODES.ITCA_ENROLLMENT),
          common.validRouteEnrollment(DOCUMENT_CODES.ITCA_DOCUMENT),
          common.validRouteEnrollment(DOCUMENT_CODES.ITCA_PROOF_PAYMENT)
        ];

        return forkJoin(observables).pipe(
          map(([enroll, testPsyco, updateInformation, statusStudent , socioEconomicSheet, enrollment, documents, payments]) => {
						console.log('testState', sessionStorage.getItem('cycle'),':', testPsyco);
            if(statusStudent[0].state === 'EGRESADO'){
              common.message(
                'Ha culminado sus niveles exitosamente.',
                '',
                'info',
              '#86bc57'
              );
              return false;
            }

            //updateInformation, socioEconomicSheet, enrollment, documents, payments,
            if (updateInformation && socioEconomicSheet && enrollment && documents && payments) {
              common.message(
                'El proceso de matriculación ya se ha sido realizado.',
                '',
                'success',
                '#2eb4d8'
              );
              return false;
            }

            if (enroll.enrollGolden && testPsyco.estado_general_test) {
              if(updateInformation){
                common.message(
                  'La Actualización de Información ya ha sido realizada.',
                  '',
                  'warning',
                  '#2eb4d8'
                );
                return false;
              }else{
                return true;
              }
            } else {
              if (!enroll.enrollGolden && !testPsyco.estado_general_test) {
                common.message(
                  'Para continuar con el proceso de Matrícula debe realizar la Matrícula de Segunda Lengua y los Test Psicológicos y Encuesta.',
                  '',
                  'warning',
                  '#2eb4d8'
                );
                return false;
              } else if (!enroll.enrollGolden) {
                common.message(
                  'Para continuar con el proceso de Matrícula debe realizar la Matrícula de Segunda Lengua.',
                  '',
                  'warning',
                  '#2eb4d8'
                );
                return false;
              } else if (!testPsyco.estado_general_test) {
								common.message(
									'Para continuar con el proceso de Matrícula debe realizar los Test Psicológicos y Encuesta.',
									'',
									'warning',
									'#2eb4d8'
								);
								return false;
              }
              return false;
            }
          })
        );
      })
    );
}
