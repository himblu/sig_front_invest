import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { forkJoin, map, Observable } from 'rxjs';
import { AdministrativeService } from '@services/administrative.service';
import { HealthType } from '@utils/interfaces/others.interfaces';
import { UserService } from '@services/user.service';
import { CommonService } from '@services/common.service';

export const SocioeconomicResolver: ResolveFn<any> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  api: AdministrativeService = inject(AdministrativeService),
  userService: UserService = inject(UserService),
  common: CommonService = inject(CommonService)
): Observable<any> => {
  const observables = [
    api.getIncomesAndExpenses(),
    api.getAcademicLevels(),
    api.getProfessions(),
    api.getCivilStatuses(),
    api.getHousingTypes(),
    api.getAcademicDegrees(),
    api.getRelationships(),
    api.getBasicServices(),
    api.getHealthTypes(),
    api.getZones(),
    api.getSocioeconomicInformation(+sessionStorage.getItem('studentID')),
    common.getPerson(Number(sessionStorage.getItem('id'))),
  ];
  return forkJoin(observables)
    .pipe(
      map((
        [
          incomesAndExpenses,
          academicLevels,
          professions,
          civilStatuses,
          housingTypes,
          academicDegrees,
          relationships,
          basicServices,
          healthTypes,
          zones,
          socioeconomicInformation,
          person
        ]
      ) => {
        return {
          incomesAndExpenses,
          academicLevels,
          professions,
          civilStatuses,
          housingTypes,
          academicDegrees,
          relationships,
          basicServices,
          healthTypes,
          zones,
          socioeconomicInformation,
          person
        }
      })
    );
}
