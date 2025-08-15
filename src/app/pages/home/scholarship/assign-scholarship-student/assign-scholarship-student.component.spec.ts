import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignScholarshipStudentComponent } from './assign-scholarship-student.component';

describe('AssignScholarshipStudentComponent', () => {
  let component: AssignScholarshipStudentComponent;
  let fixture: ComponentFixture<AssignScholarshipStudentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AssignScholarshipStudentComponent]
    });
    fixture = TestBed.createComponent(AssignScholarshipStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
