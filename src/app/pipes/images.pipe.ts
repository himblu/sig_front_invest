import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '@environments/environment';

let url = environment.url;

@Pipe({
  name: 'images'
})
export class ImagesPipe implements PipeTransform {

  transform(img: string, idPerson: number): string {
    if( !img ){
      return `${url}/upload/default.png`;
    }else {
      return `${url}/upload/${img}`
    }
  }

}
