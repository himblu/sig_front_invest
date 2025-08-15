import { Pipe, PipeTransform } from '@angular/core';
import { DestinySchedule } from '@utils/interfaces/others.interfaces';

@Pipe({
  name: 'filterByDay',
  standalone: true
})
export class FilterByDayPipe implements PipeTransform {

  transform(events: DestinySchedule[], day: string): unknown {
    return events.filter((event:DestinySchedule) => {
			return event.weekdayDesc === day;
		});
  }

}
