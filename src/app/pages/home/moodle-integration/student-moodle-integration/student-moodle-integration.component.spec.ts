import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentMoodleIntegrationComponent } from './student-moodle-integration.component';

describe('StudentMoodleIntegrationComponent', () => {
  let component: StudentMoodleIntegrationComponent;
  let fixture: ComponentFixture<StudentMoodleIntegrationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StudentMoodleIntegrationComponent]
    });
    fixture = TestBed.createComponent(StudentMoodleIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
