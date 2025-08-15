import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessFileConfigurationComponent } from './process-file-configuration.component';

describe('ProcessFileConfigurationComponent', () => {
  let component: ProcessFileConfigurationComponent;
  let fixture: ComponentFixture<ProcessFileConfigurationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProcessFileConfigurationComponent]
    });
    fixture = TestBed.createComponent(ProcessFileConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
