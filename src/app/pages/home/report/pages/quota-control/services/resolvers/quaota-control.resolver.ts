import { inject } from "@angular/core";
import {
	ActivatedRouteSnapshot,
	ResolveFn,
	RouterStateSnapshot,
} from "@angular/router";
import { AdministrativeService } from "@services/administrative.service";
import { ApiService } from "@services/api.service";
import { forkJoin, map, Observable } from "rxjs";

export const QuotaControlResolver: ResolveFn<any> = (
	route: ActivatedRouteSnapshot,
	state: RouterStateSnapshot,
	admin: AdministrativeService = inject(AdministrativeService),
	api: ApiService = inject(ApiService)
): Observable<any> => {
	const observables = [
		api.getCurrentPeriod(),
		api.getAvailableQuotas(),
		admin.getPeriods(),
		admin.getCycles(),
		admin.getParallels(),
		admin.getCareerByActivePeriod(),
		admin.getModalityAll()
	];
	return forkJoin(observables).pipe(
		map(
			([
				currentPeriod,
				availableQuotas,
				periods,
				cycles,
				parallels,
				careers,
				modalities
			]) => {
				return {
					currentPeriod,
					availableQuotas,
					periods,
					cycles,
					parallels,
					careers,
					modalities
				};
			}
		)
	);
};
