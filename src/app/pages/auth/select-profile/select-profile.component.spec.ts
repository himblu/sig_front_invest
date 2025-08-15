import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectProfileComponent } from './select-profile.component';

describe('SelectProfileComponent', () => {
  let component: SelectProfileComponent;
  let fixture: ComponentFixture<SelectProfileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SelectProfileComponent]
    });
    fixture = TestBed.createComponent(SelectProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
