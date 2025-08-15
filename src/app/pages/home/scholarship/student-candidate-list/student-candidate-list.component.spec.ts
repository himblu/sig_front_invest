import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentCandidateListComponent } from './student-candidate-list.component';

describe('StudentCandidateListComponent', () => {
  let component: StudentCandidateListComponent;
  let fixture: ComponentFixture<StudentCandidateListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StudentCandidateListComponent]
    });
    fixture = TestBed.createComponent(StudentCandidateListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
