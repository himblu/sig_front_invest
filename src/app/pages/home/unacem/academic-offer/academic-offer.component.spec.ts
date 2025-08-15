import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcademicOfferComponent } from './academic-offer.component';

describe('AcademicOfferComponent', () => {
  let component: AcademicOfferComponent;
  let fixture: ComponentFixture<AcademicOfferComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AcademicOfferComponent]
    });
    fixture = TestBed.createComponent(AcademicOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
