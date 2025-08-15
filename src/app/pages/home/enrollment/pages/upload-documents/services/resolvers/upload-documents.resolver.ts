import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { forkJoin, map, Observable, switchMap } from 'rxjs';
import { AdministrativeService } from '@services/administrative.service';
import { UserService } from '@services/user.service';
import { COMPANY_CODES, CurrentPeriod, DOCUMENT_CODES } from '@utils/interfaces/others.interfaces';
import { ApiService } from '@services/api.service';

export const UploadDocumentsResolver: ResolveFn<any> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  apiAdmin: AdministrativeService = inject(AdministrativeService),
  api: ApiService = inject(ApiService),
  userService: UserService = inject(UserService)
): Observable<any> => {
  const observables = [
    // api.getStudentDocuments(userService.currentUser.PersonId),
    api.getCurrentPeriod()
      .pipe(
        switchMap((period) => {
          //console.log(period);
          return api.getValidationDocuments(
            +sessionStorage.getItem('id')!,
            period.periodID,
            COMPANY_CODES.ITCA,
            DOCUMENT_CODES.ITCA_DOCUMENT,
						+sessionStorage.getItem('studentID')
          );
        })
      ),
    apiAdmin.getDocumentsStates(),
    api.getStudentDocumentsITCA()
  ];
  return forkJoin(observables)
    .pipe(
      map((
        [
          documents,
          documentsStates,
          documentsUpload
        ]
      ) => {
        return {
          documents,
          documentsStates,
          documentsUpload
        }
      })
    );
}
