import { Pipe, PipeTransform } from '@angular/core';
import { PracticeUnit } from '@utils/interfaces/campus.interfaces';

@Pipe({
  name: 'totalPracticeHours',
  standalone: true
})

export class TotalPracticeHoursPipe implements PipeTransform {
  transform(value: PracticeUnit[], period?: number): number {
    if (!period) {
      return value.reduce((totalHours, unit) => {
        return totalHours + unit.rows.reduce((unitTotal, row) => {
          return unitTotal + row.reduce((subjectTotal, subject) => {
            return subjectTotal + (+subject.hours);
          }, 0);
        }, 0);
      }, 0);
    }
    return value.reduce((totalHours, unit) => {
      return totalHours + unit.rows.reduce((unitTotal, row) => {
        return unitTotal + row.reduce((subjectTotal, subject) => {
          return subjectTotal + (subject.cycle === period ? +subject.hours : 0);
        }, 0);
      }, 0);
    }, 0);
  }
}
