import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagementTeacherComponent } from './management-teacher.component';

describe('ManagementTeacherComponent', () => {
  let component: ManagementTeacherComponent;
  let fixture: ComponentFixture<ManagementTeacherComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManagementTeacherComponent]
    });
    fixture = TestBed.createComponent(ManagementTeacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
