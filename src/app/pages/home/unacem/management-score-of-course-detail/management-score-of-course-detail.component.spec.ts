import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagementScoreOfCourseDetailComponent } from './management-score-of-course-detail.component';

describe('ManagementScoreOfCourseDetailComponent', () => {
  let component: ManagementScoreOfCourseDetailComponent;
  let fixture: ComponentFixture<ManagementScoreOfCourseDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManagementScoreOfCourseDetailComponent]
    });
    fixture = TestBed.createComponent(ManagementScoreOfCourseDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
