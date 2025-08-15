import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectCareerComponent } from './select-career.component';

describe('SelectCareerComponent', () => {
  let component: SelectCareerComponent;
  let fixture: ComponentFixture<SelectCareerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SelectCareerComponent]
    });
    fixture = TestBed.createComponent(SelectCareerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
