import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomMedicineSlider } from './custom-medicine-slider';

describe('CustomMedicineSlider', () => {
  let component: CustomMedicineSlider;
  let fixture: ComponentFixture<CustomMedicineSlider>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomMedicineSlider]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomMedicineSlider);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
