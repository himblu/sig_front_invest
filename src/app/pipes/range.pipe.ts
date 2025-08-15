import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'range'
})
export class RangePipe implements PipeTransform {

  transform(startYear: number, endYear: number, step: number = 1): number[] {
    let range: any = [];
    if (startYear > endYear) {
      return range;
    } else {
      for (let year = endYear; year >= startYear; year -= step) {
        range.push(year);
      }
      return range;
    }
  }

}
