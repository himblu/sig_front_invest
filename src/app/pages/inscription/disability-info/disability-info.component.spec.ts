import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisabilityInfoComponent } from './disability-info.component';

describe('DisabilityInfoComponent', () => {
  let component: DisabilityInfoComponent;
  let fixture: ComponentFixture<DisabilityInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DisabilityInfoComponent]
    });
    fixture = TestBed.createComponent(DisabilityInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
