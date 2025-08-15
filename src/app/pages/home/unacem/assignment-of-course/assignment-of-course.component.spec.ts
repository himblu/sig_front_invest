import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentOfCourseComponent } from './assignment-of-course.component';

describe('AssignmentOfCourseComponent', () => {
  let component: AssignmentOfCourseComponent;
  let fixture: ComponentFixture<AssignmentOfCourseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AssignmentOfCourseComponent]
    });
    fixture = TestBed.createComponent(AssignmentOfCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
