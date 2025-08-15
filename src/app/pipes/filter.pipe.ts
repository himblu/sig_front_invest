import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'filter',
  pure: false
})
export class FilterPipe implements PipeTransform {
  onlyUnique(value: any[], index: number, self: any) {
    return self.indexOf(value) === index;
  }

  transform(value: any[], args?: any): any {
    if (!value || !args) return value;
    if (typeof args == "string"){
        let result: any[] = [];
        if (value.length) {
          Object.keys(value[0]).map(k => {
            result = result.concat(value.filter(i => {
              let campo = i[k];
              if (campo !== null) {
                if (i[k] === undefined){
                  return false;
                } else {
  
                  return i[k].toString().toLowerCase().indexOf(args.toLowerCase()) !== -1;
                }
              } else {
                return false;
              }
            }));
          })
        }
        return result.filter(this.onlyUnique);
    } else {
      let original = value;
      let values: any[] = [];
      Object.keys(args).map(k => {
        let comp = args[k];
        if (comp) {
          values = values.concat(original.filter(item => item[k]).filter(item => item[k].toLowerCase() === comp.toLowerCase()));
        } else {
          values = original;
        }
      });
      return values.filter(this.onlyUnique);
    }
  }
}