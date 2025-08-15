// max.directive.ts
import { Directive, Input, HostListener } from '@angular/core';

@Directive({
  selector: '[appMaxValue]',
})
export class MaxValueDirective {
  @Input() appMaxValue: number = 100;

  @HostListener('input', ['$event']) onInput(event: Event) {
    console.log('in event max value');
    
    const input = event.target as HTMLInputElement;
    const value = +input.value;
    if (value > this.appMaxValue) {
      input.value = this.appMaxValue.toString();
    }
  }
}
