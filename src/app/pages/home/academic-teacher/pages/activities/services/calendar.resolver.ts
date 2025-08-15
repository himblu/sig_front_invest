import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { CommonService } from '@services/common.service';
import { CalendarType } from '@utils/interfaces/calendar.interface';

export const CalendarResolver: ResolveFn<any> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  api: CommonService = inject(CommonService)
): Observable<any> => {
  const observables = [
		api.getCalendarTypes()
			.pipe(
				switchMap((calendarTypes) => {
					const selectedCalendar: string = localStorage.getItem('selectedCalendar');
					return forkJoin({
						calendarTypes: of(calendarTypes),
						events: api.getCalendarEvents(+selectedCalendar || calendarTypes.find(c => true).calendarTypeID)
					})
				})
			),
	];
  return forkJoin(observables)
		.pipe(map(([res]) => {
			return {
				calendarTypes: res.calendarTypes,
				events: res.events
			}
		}));
}
