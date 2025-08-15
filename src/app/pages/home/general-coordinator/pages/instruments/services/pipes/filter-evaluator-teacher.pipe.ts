import { Pipe, PipeTransform } from '@angular/core';
import { InstrumentTeacher, InstrumentTeacherByPeriod } from '@utils/interfaces/campus.interfaces';

@Pipe({
  name: 'filterEvaluatorTeacher',
  standalone: true
})

export class FilterEvaluatorTeacherPipe implements PipeTransform {
  transform(teachersByPeriod: InstrumentTeacherByPeriod[], teachersBySubject: InstrumentTeacher[]): InstrumentTeacherByPeriod[] {
    const teachersByPeriodIds: number[] = teachersBySubject.map((teacher: InstrumentTeacher) => teacher.teacherID);
    return teachersByPeriod.filter((evaluatorTeacher: InstrumentTeacherByPeriod) => !teachersByPeriodIds.includes(evaluatorTeacher.teacherID));
  }
}
