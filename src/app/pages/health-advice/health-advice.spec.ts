import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthAdvice } from './health-advice';

describe('HealthAdvice', () => {
  let component: HealthAdvice;
  let fixture: ComponentFixture<HealthAdvice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthAdvice]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HealthAdvice);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
