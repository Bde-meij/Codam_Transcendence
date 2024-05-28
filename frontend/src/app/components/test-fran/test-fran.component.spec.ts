import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestFranComponent } from './test-fran.component';

describe('TestFranComponent', () => {
  let component: TestFranComponent;
  let fixture: ComponentFixture<TestFranComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestFranComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TestFranComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
