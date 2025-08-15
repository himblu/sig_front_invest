import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FillingOutExternalSurveyComponent } from './filling-out-external-survey.component';

describe('FillingOutExternalSurveyComponent', () => {
  let component: FillingOutExternalSurveyComponent;
  let fixture: ComponentFixture<FillingOutExternalSurveyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FillingOutExternalSurveyComponent]
    });
    fixture = TestBed.createComponent(FillingOutExternalSurveyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
