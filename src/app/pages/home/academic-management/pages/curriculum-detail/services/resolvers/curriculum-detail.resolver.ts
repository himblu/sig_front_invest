import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AdministrativeService } from '@services/administrative.service';

export const CurriculumDetailResolver: ResolveFn<any> = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
    api: AdministrativeService = inject(AdministrativeService)
): Observable<any> => {
  console.log(route.params);
  const studyPlan: number = route.params['study-plan'];
  const careerId: number = route.params['career-id'];
  return api.getCurriculum(studyPlan, careerId);
}
