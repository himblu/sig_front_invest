import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagementCourseComponent } from './management-course.component';

describe('ManagementCourseComponent', () => {
  let component: ManagementCourseComponent;
  let fixture: ComponentFixture<ManagementCourseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManagementCourseComponent]
    });
    fixture = TestBed.createComponent(ManagementCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
