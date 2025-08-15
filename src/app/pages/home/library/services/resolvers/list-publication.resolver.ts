import { ActivatedRouteSnapshot, ResolveFn, Router, RouterStateSnapshot } from '@angular/router';
import { forkJoin, map, Observable } from 'rxjs';
import { inject } from '@angular/core';
import { ApiService } from '@services/api.service';
import { AdministrativeService } from '@services/administrative.service';

export const ListPublicationResolver: ResolveFn<any> = (
	route: ActivatedRouteSnapshot,
	state: RouterStateSnapshot,
	api: ApiService = inject(ApiService),
	adminApi: AdministrativeService = inject(AdministrativeService),
	router: Router = inject(Router)
) => {
	// Publication or null
	// Dewey Categories
	// Dewey Subcategories or null
	// Knowledge Areas
	// Knowledge Subareas or null
	// Knowledge Specific Subareas or null
	// Major Schools
	// Publication Conditions
	// Publication Income Types
	// Campuses
	// Publication Types
	// Availability Publications
	let observables: Observable<any>[] = [];
	observables = [
		api.getDeweyCategories(),
		api.getKnowledgeAreas(),
		api.getMajorSchools(),
		api.getPublicationConditions(),
		api.getPublicationIncomeTypes(),
		adminApi.getAllCampuses(),
		api.getPublicationTypes(),
		api.getAvailabilityPublications(),
		adminApi.getPeriods(),
		api.getPublicationStatuses(),
	]
	return forkJoin(observables)
		.pipe(
			map(([
				deweyCategories,
				knowledgeAreas,
				schools,
				publicationsCondition,
				incomeTypes,
				campuses,
				publicationTypes,
				availabilityPublications,
				periods,
				publicationStatuses,
		  ]) => {
				return {
					deweyCategories,
					knowledgeAreas,
					schools,
					publicationsCondition,
					incomeTypes,
					campuses,
					publicationTypes,
					availabilityPublications,
					periods,
					publicationStatuses,
				};
			})
		);
};
