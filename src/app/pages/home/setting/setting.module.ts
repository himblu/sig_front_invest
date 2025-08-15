import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserSettingComponent } from './user-setting/user-setting.component';
import { FormsModule } from '@angular/forms';
import { SettingRoutingModule } from './setting-routing.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    SettingRoutingModule
  ]
})
export class SettingModule { }
