import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoliciesShippingComponent } from './policies-shipping.component';

describe('PoliciesShippingComponent', () => {
  let component: PoliciesShippingComponent;
  let fixture: ComponentFixture<PoliciesShippingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PoliciesShippingComponent]
    });
    fixture = TestBed.createComponent(PoliciesShippingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
