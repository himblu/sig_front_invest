import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FillingOutExternalSurveyComponent } from './filling-out-external-survey/filling-out-external-survey.component';
import { SurveyCompletionRoutingModule } from './survey-completion-routing.module';
import { ExternalSurveyComponent } from './external-survey/external-survey.component';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SurveyCompletionRoutingModule
  ]
})
export class SurveyCompletionModule { }
