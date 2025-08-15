import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyTypeDetailComponent } from './survey-type-detail.component';

describe('SurveyTypeDetailComponent', () => {
  let component: SurveyTypeDetailComponent;
  let fixture: ComponentFixture<SurveyTypeDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SurveyTypeDetailComponent]
    });
    fixture = TestBed.createComponent(SurveyTypeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
