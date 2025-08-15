import { DatePipe } from '@angular/common';
import { inject, Pipe, PipeTransform } from '@angular/core';
import { AttendanceTeacher } from '@utils/interfaces/campus.interfaces';
import { DatesHoliday } from '@utils/interfaces/person.interfaces';
import { map } from 'rxjs';

@Pipe({
  name: 'filterEventsByDay',
	standalone: true,
})

export class FilterEventsByDayPipe implements PipeTransform {

	private datePipe: DatePipe = inject(DatePipe);

  transform(events: AttendanceTeacher[], day: number, calendarDate: Date, holidays: DatesHoliday): AttendanceTeacher[] {
		//console.log(day, calendarDate);
		const calendarEvents= events.filter((event: AttendanceTeacher) => {
			let date= {calendarDate: this.datePipe.transform(calendarDate, 'yyyy-MM-dd')};
			return Object.assign(event, date);
		});
		//console.log(calendarEvents);
		const array= calendarEvents.filter((event: AttendanceTeacher) => {
			const currentDay: number= day;
			return currentDay === +event.flg_dia;
		});

		return array.filter(item => !holidays.dateHolidays.includes(item.calendarDate));
  }

}
