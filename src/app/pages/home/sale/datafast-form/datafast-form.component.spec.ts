import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatafastFormComponent } from './datafast-form.component';

describe('DatafastFormComponent', () => {
  let component: DatafastFormComponent;
  let fixture: ComponentFixture<DatafastFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DatafastFormComponent]
    });
    fixture = TestBed.createComponent(DatafastFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
