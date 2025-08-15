import { Pipe, PipeTransform } from '@angular/core';
import { Fee } from '@utils/interfaces/enrollment.interface';

@Pipe({
  name: 'totalFeeByLevel',
  standalone: true
})

export class TotalFeeByLevelPipe implements PipeTransform {

  transform(fees: Fee[], ...args: unknown[]): number {
    if (!fees || !fees.length) {
      return 0;
    }
    return fees.reduce((sum, fee) => sum + fee.fee, 0);
  }

}
