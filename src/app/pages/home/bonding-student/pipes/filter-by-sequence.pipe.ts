import { Pipe, PipeTransform } from '@angular/core';
import { CoursesLinkageFile } from '@utils/interfaces/campus.interfaces';
import { FILE_STATE } from '@utils/interfaces/others.interfaces';

@Pipe({
  name: 'filterBySequence',
  standalone: true
})
export class FilterBySequencePipe implements PipeTransform {

  transform(events: CoursesLinkageFile[]): CoursesLinkageFile[] {
		let filesFlag: number= 0;
		const files: CoursesLinkageFile[] = events.sort((a, b) => a.orderNumber - b.orderNumber);
		//console.log(files);
		const arr: CoursesLinkageFile[] = [];
		for(let i=0; i<files.length; i++){
			if(files[i].statusFileID === FILE_STATE.APPROVED) arr.push(files[i]);
			else {
				if(filesFlag === 0){
					filesFlag++;
					arr.push(files[i]);
				}
			}
		} return arr;
  }

}
