import { Pipe, PipeTransform } from '@angular/core';
import { FileType } from '@utils/interfaces/campus.interfaces';

@Pipe({
  name: 'FilterTypes',
  standalone: true
})

export class FilterTypesPipe implements PipeTransform {
	transform(files: FileType[]): FileType[] {
		return files.filter((item: FileType) => {
			return item.flgLinkage === 1;
		});
	}
}
