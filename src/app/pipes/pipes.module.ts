import { NgModule } from '@angular/core';
import { ImagesPipe } from './images.pipe';
import { RangePipe } from './range.pipe';
import { FilterPipe } from './filter.pipe';




@NgModule({
  declarations: [
    ImagesPipe,
    RangePipe,
    FilterPipe
  ],
  exports: [
    ImagesPipe,
    RangePipe,
    FilterPipe
  ]
})
export class PipesModule { }
