import { Pipe, PipeTransform } from '@angular/core';
import { StudentActivities } from '@utils/interfaces/campus.interfaces';

@Pipe({
  name: 'filterEventsByDay',
	standalone: true,
})
export class FilterEventsByDayPipe implements PipeTransform {

	private date: Date = new Date();

  transform(events:StudentActivities[], date:Date): unknown {
    return events.filter((event:StudentActivities) => {
			const currentDate:number=date.setHours(0,0,0);
			const endDate:number=event.end.setHours(0,0,0);
			const startDate:number=event.start.setHours(0,0,0);
			const today:number=this.date.setHours(0,0,0);
			return currentDate===endDate && startDate<=today;
		});
  }

}
