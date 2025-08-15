import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseMoodleIntegrationComponent } from './course-moodle-integration.component';

describe('CourseMoodleIntegrationComponent', () => {
  let component: CourseMoodleIntegrationComponent;
  let fixture: ComponentFixture<CourseMoodleIntegrationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CourseMoodleIntegrationComponent]
    });
    fixture = TestBed.createComponent(CourseMoodleIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
