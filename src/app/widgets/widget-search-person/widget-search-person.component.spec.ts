import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetSearchPersonComponent } from './widget-search-person.component';

describe('WidgetSearchPersonComponent', () => {
  let component: WidgetSearchPersonComponent;
  let fixture: ComponentFixture<WidgetSearchPersonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WidgetSearchPersonComponent]
    });
    fixture = TestBed.createComponent(WidgetSearchPersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
