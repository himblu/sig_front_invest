import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryMoodleIntegrationComponent } from './category-moodle-integration.component';

describe('CategoryMoodleIntegrationComponent', () => {
  let component: CategoryMoodleIntegrationComponent;
  let fixture: ComponentFixture<CategoryMoodleIntegrationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CategoryMoodleIntegrationComponent]
    });
    fixture = TestBed.createComponent(CategoryMoodleIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
