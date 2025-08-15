import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbsorptionReportComponent } from './absorption-report.component';

describe('AbsorptionReportComponent', () => {
  let component: AbsorptionReportComponent;
  let fixture: ComponentFixture<AbsorptionReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AbsorptionReportComponent]
    });
    fixture = TestBed.createComponent(AbsorptionReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
