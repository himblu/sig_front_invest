import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagementScoreOfCourseComponent } from './management-score-of-course.component';

describe('ManagementScoreOfCourseComponent', () => {
  let component: ManagementScoreOfCourseComponent;
  let fixture: ComponentFixture<ManagementScoreOfCourseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManagementScoreOfCourseComponent]
    });
    fixture = TestBed.createComponent(ManagementScoreOfCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
