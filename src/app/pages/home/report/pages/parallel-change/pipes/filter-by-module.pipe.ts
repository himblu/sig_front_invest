import { Pipe, PipeTransform } from '@angular/core';
import { Schedules } from '@utils/interfaces/others.interfaces';

@Pipe({
  name: 'filterByModule',
  standalone: true
})
export class FilterByModulePipe implements PipeTransform {

  transform(events: Schedules[], classModuleID: number): Schedules[] {
    return events.filter((event: Schedules) => {
			return event.classModuleID === classModuleID;
		});
  }

}
