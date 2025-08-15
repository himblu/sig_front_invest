import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'editionTabName',
  standalone: true
})

export class EditionTabNamePipe implements PipeTransform {

  transform(value: string, indexEdition: number): string {
    if (!value) {
      return 'Edición ' + '(' + (indexEdition + 1) + ')';
    }
    return value;
  }
}
