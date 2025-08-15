import { Pipe, PipeTransform } from '@angular/core';
import { Unit } from '@utils/interfaces/campus.interfaces';

@Pipe({
  name: 'totalHours',
  standalone: true
})

export class TotalHoursPipe implements PipeTransform {
  transform(value: Unit[], hourType: 'FF' | 'UH' | 'EH', period?: number): number {
    if (!period) {
      return value.reduce((totalHours, unit) => {
        return totalHours + unit.rows.reduce((unitTotal, row) => {
          return unitTotal + row.reduce((subjectTotal, subject) => {
            if (hourType === 'FF') return subjectTotal + (+subject.faceToFaceHours);
            if (hourType === 'UH') return subjectTotal + (+subject.unsupervisedHours);
            return subjectTotal + (+subject.experimentalHours);
          }, 0);
        }, 0);
      }, 0);
    }
    return value.reduce((totalHours, unit) => {
      return totalHours + unit.rows.reduce((unitTotal, row) => {
        return unitTotal + row.reduce((subjectTotal, subject) => {
          if (hourType === 'FF') return subjectTotal + (subject.cycle === period ? +subject.faceToFaceHours : 0);
          if (hourType === 'UH') return subjectTotal + (subject.cycle === period ? +subject.unsupervisedHours : 0);
          return subjectTotal + (subject.cycle === period ? +subject.experimentalHours : 0);
        }, 0);
      }, 0);
    }, 0);
  }
}
