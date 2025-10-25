import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HealthCarouselComponent } from './health-carousel';

describe('HealthCarouselComponent', () => {
  let component: HealthCarouselComponent;
  let fixture: ComponentFixture<HealthCarouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthCarouselComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HealthCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
