import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { forkJoin, map, Observable } from 'rxjs';
import { AdministrativeService } from '@services/administrative.service';
import { SPGetCareer } from '@utils/interfaces/campus.interfaces';

export const EnrollmentSchoolResolver: ResolveFn<any> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  api: AdministrativeService = inject(AdministrativeService)
): Observable<any> => {
  const observables = [
    // api.getAllCareers(),
    api.getCareers(1, '', 0)
    // api.getPayments()
  ];
  return forkJoin(observables)
    .pipe(
      map((
        [
          careers,
          // payments
        ]
      ) => {
        return {
          careers: (careers.data) as SPGetCareer[],
          // payments: payments
        }
      })
    );
}
