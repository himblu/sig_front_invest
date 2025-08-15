import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdministrativeService } from '@services/administrative.service';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-widget-search-person',
  templateUrl: './widget-search-person.component.html',
  styleUrls: ['./widget-search-person.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class WidgetSearchPersonComponent implements OnInit {

  constructor(
    private Administrative: AdministrativeService,
    private Modal: BsModalRef
  ) {}

  @ViewChild('param', {static: false}) param: ElementRef;
  public onClose: Subject<any>;

  results: any[] = [];
  searched: boolean = false;
  text: any;

  ngOnInit(): void {
    this.onClose = new Subject();
    setTimeout(() => {
      this.param.nativeElement.focus();
    }, 100); 
  }

  async searchPerson() {
    let result: any = await this.Administrative.getAllPersons(0,1,0,this.text).toPromise()
    let data: any[] = [];
    result.data.map((d: any) => {
      if (!data.map((x: any) => x.personID).includes(d.personID)) {
        data.push(d);
      }
    });
    console.log(data);
    this.results = data;
  }

  selectPerson(person: any) {
    console.log(person);
    this.onClose.next(person);
    this.Modal.hide();
  }

  cancel() {
    this.onClose.next(false);
    this.Modal.hide();
  }
}
