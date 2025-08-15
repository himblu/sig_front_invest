import { Pipe, PipeTransform } from '@angular/core';
import { School } from '@utils/interfaces/campus.interfaces';

@Pipe({
  name: 'filterByStatus',
  standalone: true
})
export class FilterByStatusPipe implements PipeTransform {

  transform(schools: School[], statusID: number): School[] {
    return schools.filter((item: School) => {
			return item.statusID === statusID;
		});
  }

}
