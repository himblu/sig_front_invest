import { Pipe, PipeTransform } from '@angular/core';
import { DestinySchedule } from '@utils/interfaces/others.interfaces';

@Pipe({
  name: 'filterDestinyByModule',
  standalone: true
})
export class FilterDestinyByModulePipe implements PipeTransform {

  transform(events: DestinySchedule[], classModuleID: number): DestinySchedule[] {
		if(events){
			//console.log('events', events);
			return events.filter((event: DestinySchedule) => {
				return event.classModuleID === classModuleID;
			});
		}
		return [];
  }

}
