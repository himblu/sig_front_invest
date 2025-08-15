import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MaterialComponentModule } from 'app/material-component/material-component.module';

@Component({
  selector: 'app-survey-config',
  templateUrl: './survey-config.component.html',
  styleUrls: ['./survey-config.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MaterialComponentModule,
  ]
})
export class SurveyConfigComponent implements OnInit{

  constructor() { }

  configs: any[] = [];
  searched: boolean = false;

  ngOnInit() {
    
  }

}
