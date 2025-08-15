import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoliciesPaymentComponent } from './policies-payment.component';

describe('PoliciesPaymentComponent', () => {
  let component: PoliciesPaymentComponent;
  let fixture: ComponentFixture<PoliciesPaymentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PoliciesPaymentComponent]
    });
    fixture = TestBed.createComponent(PoliciesPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
