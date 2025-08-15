import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'components-button-arrow',
  templateUrl: './button-arrow.component.html',
  styleUrls: ['./button-arrow.component.css'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
		MatTooltipModule
  ]
})

export class ButtonArrowComponent {

  @Input('totalPage') totalPage:number = 0;
  @Input('actual') actual:number = 1;
  @Input('count') count:number = 0;
  @Output() result: EventEmitter<number> = new EventEmitter();


  operation( value: number){
    this.actual += value;
    if( this.actual < 1 ){
      this.actual += 1;
    }else if(this.actual > this.totalPage){
      this.actual -= value;
    }else{
      this.result.emit(this.actual);
    }

  }
}
