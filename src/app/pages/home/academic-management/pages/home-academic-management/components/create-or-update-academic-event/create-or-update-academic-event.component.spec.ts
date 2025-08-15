import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOrUpdateAcademicEventComponent } from './create-or-update-academic-event.component';

describe('CreateOrUpdateAcademicEventComponent', () => {
  let component: CreateOrUpdateAcademicEventComponent;
  let fixture: ComponentFixture<CreateOrUpdateAcademicEventComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CreateOrUpdateAcademicEventComponent]
    });
    fixture = TestBed.createComponent(CreateOrUpdateAcademicEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
