import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOrUpdateAdministrativeEventComponent } from './create-or-update-administrative-event.component';

describe('CreateOrUpdateAdministrativeEventComponent', () => {
  let component: CreateOrUpdateAdministrativeEventComponent;
  let fixture: ComponentFixture<CreateOrUpdateAdministrativeEventComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CreateOrUpdateAdministrativeEventComponent]
    });
    fixture = TestBed.createComponent(CreateOrUpdateAdministrativeEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
