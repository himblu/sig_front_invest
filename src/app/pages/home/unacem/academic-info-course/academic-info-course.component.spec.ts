import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcademicInfoCourseComponent } from './academic-info-course.component';

describe('AcademicInfoCourseComponent', () => {
  let component: AcademicInfoCourseComponent;
  let fixture: ComponentFixture<AcademicInfoCourseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AcademicInfoCourseComponent]
    });
    fixture = TestBed.createComponent(AcademicInfoCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
