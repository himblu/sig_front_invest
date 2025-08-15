import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateInformationComponent } from './update-information.component';

describe('UpdateInformationComponent', () => {
  let component: UpdateInformationComponent;
  let fixture: ComponentFixture<UpdateInformationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateInformationComponent]
    });
    fixture = TestBed.createComponent(UpdateInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
