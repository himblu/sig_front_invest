import { Pipe, PipeTransform } from '@angular/core';
import { Subject, SubjectDependency } from '@utils/interfaces/campus.interfaces';

@Pipe({
  name: 'filterSubjectByPeriod',
  standalone: true
})
export class FilterSubjectByPeriodPipe implements PipeTransform {

  transform(subjects: Subject[], period: number, dependencies: SubjectDependency[]): Subject[] {
    // console.warn({subjects, dependencies});
    if (!subjects || period === 1) {
      // console.warn({subjects, period, returna: 'Cero'});
     return [];
    }
    const filteredSubjects = subjects.filter((s) => {
      const isInDependencies = dependencies.some((d) => d.id === s.courseID);
      return (s.cycle < period) && !isInDependencies;
    });
    // console.warn({filteredSubjects});
    return filteredSubjects;
  }

}
