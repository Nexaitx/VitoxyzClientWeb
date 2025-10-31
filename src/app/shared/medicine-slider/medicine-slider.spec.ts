import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicineSlider } from './medicine-slider';

describe('MedicineSlider', () => {
  let component: MedicineSlider;
  let fixture: ComponentFixture<MedicineSlider>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicineSlider]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicineSlider);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
