import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthCarousel } from './health-carousel';

describe('HealthCarousel', () => {
  let component: HealthCarousel;
  let fixture: ComponentFixture<HealthCarousel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthCarousel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HealthCarousel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
