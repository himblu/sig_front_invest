import { PublicViewRoutingModule } from './public-view-routing.module';
import {ViewComponent} from './view/view.component';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

@NgModule({
	declarations: [ViewComponent],
	imports: [CommonModule,		PublicViewRoutingModule
	],
})
export class PublicViewModule {}
