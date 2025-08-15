import { inject } from "@angular/core";
import {
    ActivatedRouteSnapshot,
    ResolveFn,
    RouterStateSnapshot,
} from "@angular/router";
import { AdministrativeService } from "@services/administrative.service";
import { ApiService } from "@services/api.service";
import { forkJoin, map, Observable } from "rxjs";

export const ProjectPracticasResolver: ResolveFn<any> = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
    admin: AdministrativeService = inject(AdministrativeService),
    api: ApiService = inject(ApiService)
): Observable<any> => {
    const modalityPracticeID = route.data['modalityPracticeID'];
    const observables = [
        admin.getPeriods(),
        api.getCurrentPeriod(),
    ];
    return forkJoin(observables).pipe(
        map(
            ([
                periods,
                currentPeriod,
            ]) => {
                return {
                    periods,
                    currentPeriod,
                    modalityPracticeID
                };
            }
        )
    );
};
