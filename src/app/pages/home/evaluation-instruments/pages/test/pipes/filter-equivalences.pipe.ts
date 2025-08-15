import { Pipe, PipeTransform } from '@angular/core';
import { InstrumentScaleEquivalence } from '@utils/interfaces/others.interfaces';

@Pipe({
  name: 'filterEquivalences',
	standalone: true,
})
export class FilterEquivalences implements PipeTransform {

  transform(events: InstrumentScaleEquivalence[]): InstrumentScaleEquivalence[] {
    let orderArray = events.sort((a,b) => a.equivalence - b.equivalence).map((events) => events);
		return orderArray;
  }

}
