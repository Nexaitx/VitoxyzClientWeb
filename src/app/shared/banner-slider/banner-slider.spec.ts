import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerSlider } from './banner-slider';

describe('BannerSlider', () => {
  let component: BannerSlider;
  let fixture: ComponentFixture<BannerSlider>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BannerSlider]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BannerSlider);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
